console.log('✅ Script carregado, iniciando execução direta...');

let currentPage = 1;
let selectedCorretores = new Set();
let debounceTimeout = null;

const fetchCorretores = async (noPagination = false) => {
    console.log(`🚀 Buscando corretores - Página: ${noPagination ? 'Todas' : currentPage}`);
    try {
        const inputCorretores = document.getElementById('inputCorretores');
        const sortBy = document.getElementById('sortBy');
        const sortOrder = document.getElementById('sortOrder');
        const minPedidos = document.getElementById('minPedidos');
        const maxPedidos = document.getElementById('maxPedidos');

        if (!inputCorretores) throw new Error('Elemento #inputCorretores não encontrado!');
        console.log('🔍 Valor atual do inputCorretores em fetchCorretores:', inputCorretores.value);

        const search = inputCorretores.value.trim();
        const sortByValue = sortBy.value;
        const sortOrderValue = sortOrder.value;
        const minPedidosValue = minPedidos.value;
        const maxPedidosValue = maxPedidos.value;

        const url = new URL('https://backand.meuleaditapema.com.br/corretores');
        if (!noPagination) {
            url.searchParams.append('page', currentPage);
            url.searchParams.append('limit', 10);
        }
        if (search) url.searchParams.append('search', search);
        if (sortByValue) url.searchParams.append('sortBy', sortByValue);
        if (sortOrderValue) url.searchParams.append('sortOrder', sortOrderValue);
        if (minPedidosValue) url.searchParams.append('minPedidos', minPedidosValue);
        if (maxPedidosValue) url.searchParams.append('maxPedidos', maxPedidosValue);

        console.log(`🔗 URL da requisição: ${url.toString()}`);

        const response = await fetch(url);
        console.log(`📡 Resposta do servidor: Status ${response.status}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Dados recebidos:', data);

        if (noPagination) {
            return data.data.map(corretor => corretor.id); // Retorna apenas os IDs
        } else {
            renderCorretores(data.data);
            updatePagination(data.pagination);
            updateTotalRegistros(data.pagination.totalItems);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar corretores:', error);
        if (!noPagination) {
            document.getElementById('corretoresList').innerHTML = `
                <p style="padding: 20px; text-align: center; color: #e74c3c;">
                    Erro ao carregar corretores: ${error.message}. Verifique o servidor.
                </p>
            `;
            document.getElementById('totalRegistros').textContent = 'Erro ao carregar total de registros.';
        }
        throw error;
    }
};

const renderCorretores = (corretores) => {
    console.log('🎨 Renderizando corretores:', corretores);
    const list = document.getElementById('corretoresList');
    list.innerHTML = list.querySelector('.table-header').outerHTML;

    if (!corretores || corretores.length === 0) {
        console.log('⚠️ Nenhum corretor recebido');
        list.innerHTML += '<p style="padding: 20px; text-align: center;">Nenhum corretor encontrado.</p>';
        return;
    }

    corretores.forEach(corretor => {
        const row = document.createElement('div');
        row.className = 'corretor-row';
        row.innerHTML = `
            <span><input type="checkbox" class="select-corretor" data-id="${corretor.id}" ${selectedCorretores.has(corretor.id) ? 'checked' : ''}></span>
            <span>${corretor.name || 'Sem nome'}</span>
            <span>${corretor.email || 'N/A'}</span>
            <span>${corretor.phone || 'N/A'}</span>
            <span>${corretor.pedidos ? corretor.pedidos.length : 0}</span>
        `;
        list.appendChild(row);
    });

    console.log('✅ Corretores renderizados');
    setupCheckboxListeners();
    updateSelectionHeader();
};

const updatePagination = (pagination) => {
    console.log('📄 Atualizando paginação:', pagination);
    const pageInfo = document.getElementById('pageInfo');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');

    pageInfo.textContent = `Página ${pagination.currentPage} de ${pagination.totalPages}`;
    prevPage.className = pagination.hasPrevious ? '' : 'disabled';
    nextPage.className = pagination.hasNext ? '' : 'disabled';
};

const updateTotalRegistros = (totalItems) => {
    console.log('📊 Atualizando total de registros:', totalItems);
    document.getElementById('totalRegistros').textContent = `Total de corretores encontrados: ${totalItems}`;
};

const updateSelectionHeader = () => {
    const selectedCount = document.getElementById('selectedCount');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const count = selectedCorretores.size;
    selectedCount.textContent = `${count} corretor${count === 1 ? '' : 'es'} selecionado${count === 1 ? '' : 's'}`;
    selectedCount.classList.toggle('hidden', count === 0);
    selectAllBtn.classList.toggle('hidden', count === 0);
    sendMessageBtn.classList.toggle('hidden', count === 0);
};

const selectAllCorretores = async () => {
    try {
        const allCorretorIds = await fetchCorretores(true); // Requisição sem paginação
        allCorretorIds.forEach(id => selectedCorretores.add(id));
        console.log(`✅ Selecionados todos os corretores: ${allCorretorIds.length}`);
        fetchCorretores(); // Re-renderiza a página atual com os checkboxes atualizados
    } catch (error) {
        console.error('❌ Erro ao selecionar todos os corretores:', error);
        alert('Erro ao selecionar todos os corretores. Verifique o console para mais detalhes.');
    }
};

const openMessageModal = () => {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const count = selectedCorretores.size;
    modalTitle.textContent = `Enviar Mensagem (${count} corretor${count === 1 ? '' : 'es'} selecionado${count === 1 ? '' : 's'})`;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.getElementById('messageText').value = '';

    // Configura a data atual como valor inicial
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:MM
    document.getElementById('scheduleDate').value = formattedDate;

    document.getElementById('sendInterval').value = '';
    document.getElementById('sendEmail').checked = false;
    document.getElementById('sendWhatsapp').checked = false;

    setupTagButtons();
};

const closeMessageModal = () => {
    console.log('🔒 Fechando modal');
    const modal = document.getElementById('messageModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
};

const setupTagButtons = () => {
    const messageText = document.getElementById('messageText');
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.dataset.tag;
            console.log(`🏷️ Tag clicada: ${tag}`);
            messageText.value += tag;
            messageText.focus();
        });
    });
};

const setupCheckboxListeners = () => {
    document.querySelectorAll('.select-corretor').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const corretorId = parseInt(checkbox.dataset.id);
            if (checkbox.checked) {
                selectedCorretores.add(corretorId);
                console.log(`✅ Corretor ${corretorId} selecionado`);
            } else {
                selectedCorretores.delete(corretorId);
                console.log(`❌ Corretor ${corretorId} desselecionado`);
            }
            updateSelectionHeader();
        });
    });
};

const sendMassMessage = async (message, scheduleDate, sendInterval, sendEmail, sendWhatsapp) => {
    const url = 'https://backand.meuleaditapema.com.br/envio-em-massa';

    // Cria um objeto Date a partir do scheduleDate (formato YYYY-MM-DDTHH:MM)
    const localDate = scheduleDate ? new Date(scheduleDate) : null;

    // Converte para ISO ajustando o fuso horário local (exemplo: UTC-3 para Brasília)
    let isoScheduleDate = null;
    if (localDate) {
        // Obtém o deslocamento do fuso horário local em minutos (ex.: -180 para UTC-3)
        const timezoneOffset = localDate.getTimezoneOffset();
        // Ajusta a data subtraindo o deslocamento para manter o horário local em UTC
        const adjustedDate = new Date(localDate.getTime() - timezoneOffset * 60 * 1000);
        isoScheduleDate = adjustedDate.toISOString();
    }

    const payload = {
        corretores: Array.from(selectedCorretores), // Mapeado de corretorIds para corretores
        mensagem: message,                         // Mapeado de message para mensagem
        email: sendEmail,                          // Mapeado diretamente
        whatsapp: sendWhatsapp,                    // Mapeado diretamente
        intervalo: sendInterval ? parseInt(sendInterval) : null, // Mapeado de sendInterval para intervalo
        agendado: isoScheduleDate                  // Mapeado de scheduleDate para agendado
    };

    console.log('📩 Enviando requisição para envio em massa:', payload);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`📡 Resposta do servidor: Status ${response.status}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Requisição concluída com sucesso:', result);
        alert('Mensagem enviada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem em massa:', error);
        alert('Erro ao enviar mensagem. Verifique o console para mais detalhes.');
    }
};

const setupEventListeners = () => {
    console.log('🔧 Configurando eventos...');

    const inputCorretores = document.getElementById('inputCorretores');
    if (!inputCorretores) {
        console.error('❌ Elemento #inputCorretores não encontrado no DOM!');
        return;
    }
    console.log('🔍 inputCorretores encontrado:', inputCorretores);

    const sortBy = document.getElementById('sortBy');
    const sortOrder = document.getElementById('sortOrder');
    const minPedidos = document.getElementById('minPedidos');
    const maxPedidos = document.getElementById('maxPedidos');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const closeModalBtn = document.getElementById('closeModal');
    const sendMessageBtn = document.getElementById('sendMessage');
    const sendMessageGlobalBtn = document.getElementById('sendMessageBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');

    const debounceFetch = (force = false) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchValue = inputCorretores.value.trim();
            console.log('🔍 Verificando busca com valor:', searchValue, 'Forçado:', force);
            if (searchValue.length >= 5 || (force && searchValue.length > 0) || searchValue === '') {
                currentPage = 1;
                console.log('✅ Disparando busca com filtros...');
                fetchCorretores();
            } else {
                console.log('⏳ Aguardando mais caracteres ou outro filtro...');
            }
        }, 300);
    };

    inputCorretores.addEventListener('input', () => {
        console.log('🔍 Evento input disparado! Valor:', inputCorretores.value);
        debounceFetch();
    });

    if (sortBy) {
        sortBy.addEventListener('change', () => {
            console.log('📑 SortBy alterado:', sortBy.value);
            debounceFetch(true);
        });
    }

    if (sortOrder) {
        sortOrder.addEventListener('change', () => {
            console.log('📑 SortOrder alterado:', sortOrder.value);
            debounceFetch(true);
        });
    }

    if (minPedidos) {
        minPedidos.addEventListener('input', () => {
            console.log('📑 MinPedidos alterado:', minPedidos.value);
            debounceFetch(true);
        });
    }

    if (maxPedidos) {
        maxPedidos.addEventListener('input', () => {
            console.log('📑 MaxPedidos alterado:', maxPedidos.value);
            debounceFetch(true);
        });
    }

    if (prevPage) {
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                console.log(`⬅️ Navegando para página anterior: ${currentPage}`);
                fetchCorretores();
            }
        });
    }

    if (nextPage) {
        nextPage.addEventListener('click', () => {
            currentPage++;
            console.log(`➡️ Navegando para próxima página: ${currentPage}`);
            fetchCorretores();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeMessageModal);
    }

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', async () => {
            const message = document.getElementById('messageText').value;
            const scheduleDate = document.getElementById('scheduleDate').value;
            const sendInterval = document.getElementById('sendInterval').value;
            const sendEmail = document.getElementById('sendEmail').checked;
            const sendWhatsapp = document.getElementById('sendWhatsapp').checked;

            if (!message || (!sendEmail && !sendWhatsapp)) {
                console.log('⚠️ Mensagem inválida ou nenhum método de envio selecionado');
                alert('Digite uma mensagem e selecione pelo menos um método de envio.');
                return;
            }

            await sendMassMessage(message, scheduleDate, sendInterval, sendEmail, sendWhatsapp);
            closeMessageModal();
        });
    }

    if (sendMessageGlobalBtn) {
        sendMessageGlobalBtn.addEventListener('click', () => {
            console.log('✨ Abrindo modal para enviar mensagem aos corretores selecionados');
            openMessageModal();
        });
    }

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            console.log('🔧 Selecionando todos os corretores...');
            selectAllCorretores();
        });
    }

    console.log('✅ Eventos configurados com sucesso!');
};

// Inicia o código diretamente
console.log('🏁 Iniciando execução...');
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📋 DOM já está pronto, configurando eventos e buscando corretores...');
    setupEventListeners();
    fetchCorretores();
} else {
    console.log('⏳ Aguardando DOM ficar pronto...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📋 DOM ficou pronto depois, configurando eventos e buscando corretores...');
        setupEventListeners();
        fetchCorretores();
    });
}