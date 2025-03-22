console.log('✅ Script de envios em massa carregado, iniciando execução direta...');

let enviosData = [];

const fetchEnvios = async () => {
    console.log('🚀 Buscando envios em massa...');
    try {
        const url = new URL('https://backand.meuleaditapema.com.br/envio-em-massa');
        url.searchParams.append('page', '1');
        url.searchParams.append('limit', '10');

        console.log(`🔗 URL da requisição: ${url.toString()}`);
        const response = await fetch(url);
        console.log(`📡 Resposta do servidor: Status ${response.status}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        enviosData = data.data;
        renderEnvios(data.data);
    } catch (error) {
        console.error('❌ Erro ao buscar envios em massa:', error);
        document.getElementById('enviosList').innerHTML = `
            <p style="padding: 20px; text-align: center; color: #e74c3c;">
                Erro ao carregar envios: ${error.message}. Verifique o servidor.
            </p>
        `;
    }
};

const renderEnvios = (envios) => {
    console.log('🎨 Renderizando envios em massa:', envios);
    const list = document.getElementById('enviosList');
    list.innerHTML = '';

    if (!envios || envios.length === 0) {
        console.log('⚠️ Nenhum envio recebido');
        list.innerHTML = '<p style="padding: 20px; text-align: center;">Nenhum envio em massa encontrado.</p>';
        return;
    }

    envios.forEach(envio => {
        const card = document.createElement('div');
        card.className = 'envio-card';
        card.dataset.id = envio.id;
        card.innerHTML = `
            <div class="info">
                <h3>Mensagem: ${envio.mensagem || 'Sem mensagem'}</h3>
                <p>Corretores: ${envio.corretores.length}</p>
                <p>Agendado: ${new Date(envio.agendado).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                <p class="status ${envio.finalizado ? 'finalizado' : 'pendente'}">
                    ${envio.finalizado ? 'Finalizado' : 'Pendente'}
                </p>
            </div>
            <div class="actions">
                <button class="edit-btn" data-id="${envio.id}">Editar</button>
                <button class="delete-btn" data-id="${envio.id}">Excluir</button>
            </div>
        `;
        list.appendChild(card);

        card.querySelector('.info').addEventListener('click', () => showCorretoresPopup(envio));
    });

    setupActionListeners();
};


const setupActionListeners = () => {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const envio = enviosData.find(e => e.id === parseInt(id));
            if (!envio) {
                console.error('❌ Envio não encontrado para ID:', id);
                return;
            }
            const finalizado = envio.finalizado;
            const agendado = envio.agendado;

            showEditModal(id, finalizado, agendado);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (!confirm('Tem certeza que deseja excluir este envio?')) return;

            try {
                const response = await fetch(`https://backand.meuleaditapema.com.br/envio-em-massa/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                console.log('✅ Envio excluído com sucesso');
                fetchEnvios();
            } catch (error) {
                console.error('❌ Erro ao excluir envio:', error);
                alert('Erro ao excluir envio. Verifique o console.');
            }
        });
    });
};

const showCorretoresPopup = (envio) => {
    console.log('🔍 Abrindo popup com corretores:', envio.corretores_detalhes);
    const popup = document.getElementById('corretoresPopup');
    const list = document.getElementById('corretoresList');
    list.innerHTML = '';

    if (!envio.corretores_detalhes || envio.corretores_detalhes.length === 0) {
        list.innerHTML = '<p style="text-align: center;">Nenhum corretor encontrado.</p>';
    } else {
        envio.corretores_detalhes.forEach((corretor, index) => {
            const item = document.createElement('div');
            item.className = 'corretor-item';
            item.innerHTML = `
                <p>${corretor.name || 'N/A'} (${corretor.email || 'N/A'})</p>
                <button class="remove-btn" data-id="${envio.corretores[index]}" data-envio-id="${envio.id}">Remover</button>
            `;
            list.appendChild(item);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const corretorId = parseInt(btn.dataset.id);
                const envioId = btn.dataset.envioId;
                await removeCorretorFromEnvio(envioId, corretorId);
            });
        });
    }

    popup.classList.add('active');
    const closeBtn = document.getElementById('closeCorretoresPopup');
    console.log('🔍 Verificando botão de fechar:', closeBtn);
    if (closeBtn) {
        console.log('🔍 Conteúdo do botão de fechar:', closeBtn.innerHTML);
        if (!closeBtn.innerHTML.includes('×')) {
            console.warn('⚠️ Botão de fechar sem "×", corrigindo...');
            closeBtn.innerHTML = '×';
        }
        closeBtn.style.display = 'flex';
        closeBtn.style.visibility = 'visible';
    } else {
        console.error('❌ Botão #closeCorretoresPopup não encontrado no DOM após abrir o popup');
    }
};

const removeCorretorFromEnvio = async (envioId, corretorId) => {
    try {
        const envioResponse = await fetch(`https://backand.meuleaditapema.com.br/envio-em-massa/${envioId}`);
        const envio = (await envioResponse.json()).data;
        const updatedCorretores = envio.corretores.filter(id => id !== corretorId);

        const response = await fetch(`https://backand.meuleaditapema.com.br/envio-em-massa/${envioId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ corretores: updatedCorretores })
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        console.log('✅ Corretor removido com sucesso');
        fetchEnvios();
        showCorretoresPopup((await response.json()).data);
    } catch (error) {
        console.error('❌ Erro ao remover corretor:', error);
        alert('Erro ao remover corretor. Verifique o console.');
    }
};

const showEditModal = (id, finalizado, agendado) => {
    console.log('🔧 Abrindo modal de edição para envio:', { id, finalizado, agendado });
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');
    const finalizadoInput = document.getElementById('editFinalizado');
    const agendadoInput = document.getElementById('editAgendado');

    finalizadoInput.checked = finalizado;
    if (agendado) {
        const date = new Date(agendado);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        agendadoInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log('🔍 Data formatada para o input:', agendadoInput.value);
    } else {
        agendadoInput.value = '';
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
            finalizado: finalizadoInput.checked,
            agendado: agendadoInput.value ? new Date(agendadoInput.value).toISOString() : null
        };

        try {
            const response = await fetch(`https://backand.meuleaditapema.com.br/envio-em-massa/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            console.log('✅ Envio atualizado com sucesso');
            closeEditModal();
            fetchEnvios();
        } catch (error) {
            console.error('❌ Erro ao atualizar envio:', error);
            alert('Erro ao atualizar envio. Verifique o console.');
        }
    };

    modal.classList.add('active');
};

const closePopup = () => {
    console.log('🔒 Fechando popup');
    document.getElementById('corretoresPopup').classList.remove('active');
};

const closeEditModal = () => {
    console.log('🔒 Fechando modal de edição');
    document.getElementById('editModal').classList.remove('active');
};

// Configurações iniciais
const closePopupBtn = document.getElementById('closeCorretoresPopup');
if (closePopupBtn) {
    closePopupBtn.addEventListener('click', closePopup);
} else {
    console.error('❌ Elemento #closeCorretoresPopup não encontrado no DOM ao iniciar');
}

document.getElementById('closeEditModal').addEventListener('click', closeEditModal);

// Inicia a busca diretamente
fetchEnvios();