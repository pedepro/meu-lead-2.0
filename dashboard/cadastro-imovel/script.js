// Pré-visualização de imagens com toggles
const imagensInput = document.getElementById('imagensInput');
const imagensPreview = document.getElementById('imagensPreview');
const formImovel = document.getElementById('form-imovel');
const loadingOverlay = document.getElementById('loading-overlay');

console.log('Script carregado. Elemento imagensInput encontrado:', imagensInput);
console.log('Elemento imagensPreview encontrado:', imagensPreview);
console.log('Elemento form-imovel encontrado:', formImovel);
console.log('Elemento loading-overlay encontrado:', loadingOverlay);

// Array para manter controle das imagens (com IDs)
let imagensAtuais = [];
// Array para armazenar IDs das imagens a serem excluídas
let imagensParaExcluir = [];
// Array para armazenar IDs das imagens existentes que foram editadas
let imagensEditadas = [];

// Função para adicionar imagem à pré-visualização
function adicionarImagemPreview(fileOuUrl, index, toggleData = {}, imagemId = null) {
    const div = document.createElement('div');
    div.className = 'image-container';
    div.dataset.index = index;
    if (imagemId) div.dataset.imagemId = imagemId;

    const img = document.createElement('img');
    if (typeof fileOuUrl === 'string') {
        console.log(`Tentando carregar imagem existente no preview: ${fileOuUrl}`);
        const adjustedUrl = fileOuUrl.startsWith('http://cloud.meuleaditapema.com.br') 
            ? fileOuUrl.replace('http://', 'https://')
            : fileOuUrl;
        console.log(`URL ajustada para: ${adjustedUrl}`);
        img.src = adjustedUrl;
        img.onerror = () => console.error(`Erro ao carregar imagem: ${adjustedUrl}`);
        img.onload = () => console.log(`Imagem carregada com sucesso: ${adjustedUrl}`);
    } else {
        console.log(`Carregando nova imagem local: ${fileOuUrl.name}`);
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            console.log(`Pré-visualização local gerada para: ${fileOuUrl.name}`);
        };
        reader.readAsDataURL(fileOuUrl);
    }
    img.alt = `Imagem ${index + 1}`;
    div.appendChild(img);

    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'toggle-container';
    toggleDiv.innerHTML = `
        <label><input type="checkbox" name="imagens[${index}][livre]" ${toggleData.livre ? 'checked' : ''}> Livre</label>
        <label><input type="checkbox" name="imagens[${index}][afiliados]" ${toggleData.afiliados ? 'checked' : ''}> Afiliados</label>
        <label><input type="checkbox" name="imagens[${index}][privado]" ${toggleData.compradores ? 'checked' : ''}> Privado Compradores</label>
    `;

    // Adicionar evento de mudança aos checkboxes
    if (imagemId) {
        const checkboxes = toggleDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (!imagensEditadas.includes(imagemId)) {
                    imagensEditadas.push(imagemId);
                    console.log(`Imagem ID ${imagemId} marcada como editada. Lista atual:`, imagensEditadas);
                }
            });
        });
    }

    div.appendChild(toggleDiv);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => {
        console.log(`Removendo imagem localmente: ID ${imagemId}, URL: ${fileOuUrl}`);
        if (imagemId) {
            imagensParaExcluir.push(imagemId);
            console.log(`Imagem ID ${imagemId} marcada para exclusão. Lista atual:`, imagensParaExcluir);
        }
        div.remove();
        imagensAtuais[index] = null;
        atualizarIndices();
    };
    div.appendChild(removeBtn);

    imagensPreview.appendChild(div);
}

// Função para atualizar os índices após remoção
function atualizarIndices() {
    const containers = imagensPreview.querySelectorAll('.image-container');
    containers.forEach((container, newIndex) => {
        container.dataset.index = newIndex;
        const toggles = container.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            const nameParts = toggle.name.match(/imagens\[\d+\]\[(livre|afiliados|privado)\]/);
            if (nameParts) {
                toggle.name = `imagens[${newIndex}][${nameParts[1]}]`;
            }
        });
    });
    console.log('Índices atualizados. Imagens atuais:', imagensAtuais);
}

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/cidades");
        const data = await response.json();
        console.log('Cidades recebidas:', data);

        const selectCidade = document.getElementById('cidade');
        selectCidade.innerHTML = '<option value="">Selecione</option>';

        const cidades = Array.isArray(data) ? data : [];
        if (cidades.length === 0) {
            console.warn('Nenhuma cidade encontrada na resposta da API.');
            return;
        }

        cidades.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade.id;
            option.textContent = cidade.name;
            selectCidade.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
        alert('Erro ao carregar lista de cidades.');
    }
}

// Função para carregar os dados do imóvel em modo de edição
async function carregarDadosImovel(editId) {
    try {
        console.log(`Buscando dados do imóvel ${editId}`);
        const response = await fetch(`https://backand.meuleaditapema.com.br/get-imovel/${editId}`);
        const imovel = await response.json();
        console.log('Dados do imóvel recebidos:', imovel);

        if (imovel.error) {
            throw new Error(imovel.error);
        }

        // Preencher os campos do formulário
        document.getElementById('nome_proprietario').value = imovel.nome_proprietario || '';
        document.getElementById('valor').value = imovel.valor || '';
        document.getElementById('categoria').value = imovel.categoria || '';
        document.getElementById('quartos').value = imovel.quartos || '';
        document.getElementById('banheiros').value = imovel.banheiros || '';
        document.getElementById('metros_quadrados').value = imovel.metros_quadrados || '';
        document.getElementById('vagas_garagem').value = imovel.vagas_garagem || '';
        document.getElementById('andar').value = imovel.andar || '';
        document.getElementById('mobiliado').value = imovel.mobiliado ? 'sim' : 'nao';
        document.getElementById('cidade').value = imovel.cidade || '';
        document.getElementById('endereco').value = imovel.endereco || '';
        document.getElementById('whatsapp').value = imovel.whatsapp || '';
        document.getElementById('price_contato').value = imovel.price_contato || '';
        document.getElementById('tipoSelect').value = imovel.tipo || '';
        document.getElementById('texto_principal').value = imovel.texto_principal || '';
        document.getElementById('descricao').value = imovel.descricao || '';
        document.getElementById('descricao_negociacao').value = imovel.descricao_negociacao || '';

        // Preencher imagens existentes
        imagensPreview.innerHTML = '';
        imagensAtuais = imovel.imagens.map(img => ({ url: img.url, id: img.id }));
        console.log('Imagens atuais mapeadas:', imagensAtuais);
        imovel.imagens.forEach((imagem, i) => {
            console.log(`Adicionando imagem ${i} ao preview: ${imagem.url}, ID: ${imagem.id}`);
            adicionarImagemPreview(imagem.url, i, {
                livre: imagem.livre,
                afiliados: imagem.afiliados,
                compradores: imagem.compradores
            }, imagem.id);
        });

        // Alterar título e botão para modo de edição
        document.getElementById('titulo-form').textContent = 'Editar Imóvel';
        document.getElementById('btn-submit').textContent = 'Salvar Alterações';
    } catch (error) {
        console.error('Erro ao carregar dados do imóvel:', error);
        alert('Erro ao carregar dados do imóvel: ' + error.message);
    }
}

// Função para verificar o modo (cadastro ou edição) e inicializar a tela
function inicializarTelaCadastroImovel() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editid');

    if (editId) {
        carregarDadosImovel(editId);
    }

    carregarCidades();
}

// Pré-visualização de novas imagens
if (imagensInput) {
    imagensInput.addEventListener('change', function(e) {
        console.log('Evento change disparado no input de imagens');
        const files = Array.from(e.target.files);

        console.log('Arquivos selecionados:', files);

        if (!files || files.length === 0) {
            console.log('Nenhum arquivo selecionado.');
            return;
        }

        const proximoIndice = imagensAtuais.length;
        files.forEach((file, i) => {
            if (file.type.startsWith('image/')) {
                imagensAtuais.push({ file });
                adicionarImagemPreview(file, proximoIndice + i);
            }
        });
        imagensInput.value = ''; // Limpa o input para permitir mais uploads
    });
}

// Enviar ou atualizar imóvel
if (formImovel) {
    formImovel.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Mostrar o loading
        loadingOverlay.style.display = 'flex';

        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('editid');

        const imovelData = {};
        const elements = document.querySelectorAll('.imovel-cadastro input, .imovel-cadastro select, .imovel-cadastro textarea');
        const imagensToggles = [];

        // Coletar dados do imóvel
        elements.forEach(element => {
            if (element.name === 'imagens') {
                // Ignorar imagens por enquanto
            } else {
                imovelData[element.name] = element.value || '';
            }
        });

        // Coletar toggles das imagens
        const toggles = document.querySelectorAll('.toggle-container input[type="checkbox"]');
        toggles.forEach(toggle => {
            const nameParts = toggle.name.match(/imagens\[(\d+)\]\[(livre|afiliados|privado)\]/);
            if (nameParts) {
                const index = nameParts[1];
                const status = nameParts[2];
                if (!imagensToggles[index]) imagensToggles[index] = {};
                imagensToggles[index][status] = toggle.checked;
            }
        });

        console.log('Dados do imóvel (JSON):', imovelData);
        console.log('Estado atual de imagensAtuais antes de salvar:', imagensAtuais);
        console.log('Imagens marcadas para exclusão:', imagensParaExcluir);
        console.log('Imagens marcadas como editadas:', imagensEditadas);
        console.log('Estados dos toggles coletados:', imagensToggles);

        // Enviar ou atualizar imóvel
        const baseUrl = editId ? `https://backand.meuleaditapema.com.br/imoveis/${editId}` : 'https://backand.meuleaditapema.com.br/imoveis/novo';
        const method = editId ? 'PUT' : 'POST';

        try {
            const imovelResponse = await fetch(baseUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imovelData)
            });
            const imovelResult = await imovelResponse.json();
            console.log('Resposta do servidor:', imovelResult);

            if (!imovelResult.success) {
                throw new Error(imovelResult.message);
            }

            const imovelId = editId || imovelResult.imovelId;

            // Processar imagens removidas (apenas em modo de edição)
            if (editId && imagensParaExcluir.length > 0) {
                for (const imagemId of imagensParaExcluir) {
                    console.log(`Tentando excluir imagem ${imagemId} do imóvel ${imovelId}`);
                    const response = await fetch(`https://backand.meuleaditapema.com.br/imoveis/${imovelId}/imagens/${imagemId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    console.log(`Resposta da exclusão da imagem ${imagemId}:`, result);
                    if (!result.success) {
                        console.error(`Erro ao excluir imagem ${imagemId}:`, result.message);
                        throw new Error(`Falha ao excluir imagem ID ${imagemId}: ${result.message}`);
                    } else {
                        console.log(`Imagem ${imagemId} excluída com sucesso do banco`);
                    }
                }
                imagensParaExcluir = [];
                console.log('Lista de imagens para exclusão limpa:', imagensParaExcluir);
            }

            // Atualizar toggles das imagens editadas (apenas em modo de edição)
            if (editId && imagensEditadas.length > 0) {
                const imagensExistentes = imagensAtuais.filter(img => img && img.id && !imagensParaExcluir.includes(img.id));
                for (const img of imagensExistentes) {
                    if (imagensEditadas.includes(img.id)) {
                        const index = imagensAtuais.findIndex(item => item && item.id === img.id);
                        const toggleData = imagensToggles[index];
                        if (toggleData) {
                            const imageData = {
                                url: img.url,
                                livre: toggleData.livre || false,
                                afiliados: toggleData.afiliados || false,
                                compradores: toggleData.privado || false
                            };
                            console.log(`Atualizando toggles da imagem ID ${img.id}:`, imageData);
                            const response = await fetch(`https://backand.meuleaditapema.com.br/imoveis/${imovelId}/imagens/${img.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(imageData)
                            });
                            const result = await response.json();
                            console.log(`Resposta da atualização da imagem ${img.id}:`, result);
                            if (!result.success) {
                                console.error(`Erro ao atualizar imagem ${img.id}:`, result.message);
                            } else {
                                console.log(`Imagem ${img.id} atualizada com sucesso no banco`);
                            }
                        }
                    }
                }
                imagensEditadas = []; // Limpa a lista após atualização
                console.log('Lista de imagens editadas limpa:', imagensEditadas);
            }

            // Upload e cadastro de novas imagens
            for (let i = 0; i < imagensAtuais.length; i++) {
                if (!imagensAtuais[i]) continue; // Pula imagens removidas

                if (imagensAtuais[i].file) { // Nova imagem
                    const file = imagensAtuais[i].file;
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);

                    console.log(`Enviando imagem ${i + 1}: ${file.name}`);
                    const uploadResponse = await fetch('https://cloud.meuleaditapema.com.br/upload', {
                        method: 'POST',
                        body: uploadFormData
                    });
                    const uploadData = await uploadResponse.json();
                    console.log(`Resposta do upload da imagem ${i + 1}:`, uploadData);

                    if (!uploadData.url) {
                        throw new Error(`Erro ao fazer upload da imagem ${file.name}: URL não retornada`);
                    }

                    const imageData = {
                        url: uploadData.url.replace('http://', 'https://'),
                        livre: imagensToggles[i]?.livre || false,
                        afiliados: imagensToggles[i]?.afiliados || false,
                        compradores: imagensToggles[i]?.privado || false
                    };
                    console.log(`URL ajustada para cadastro: ${imageData.url}`);

                    const imageResponse = await fetch(`https://backand.meuleaditapema.com.br/imoveis/${imovelId}/imagens`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(imageData)
                    });
                    const imageResult = await imageResponse.json();
                    console.log(`Resposta do cadastro da imagem ${i + 1}:`, imageResult);

                    if (!imageResult.success) {
                        console.error(`Erro ao cadastrar imagem ${i + 1}:`, imageResult.message);
                    }
                }
            }

            alert(editId ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!');
            console.log('Processamento concluído. Verifique o banco de dados para confirmar exclusões.');
        } catch (error) {
            console.error('Erro ao processar o imóvel:', error);
            alert(`Erro ao ${editId ? 'atualizar' : 'cadastrar'} imóvel: ${error.message}`);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });
}

// Expor a função para ser chamada externamente após o carregamento dinâmico
window.inicializarTelaCadastroImovel = inicializarTelaCadastroImovel;

inicializarTelaCadastroImovel();