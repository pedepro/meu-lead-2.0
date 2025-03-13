// Variáveis globais
let imoveisOriginais = [];
let cidades = [];
let imoveisPorPagina = 6;
let paginaImoveisAtual = 1;
let totalImoveis = 0;
let mostrarIndisponiveis = false;
let cidadeSelecionada = "";
let precoSelecionado = "";

console.log("Script JS carregado com sucesso");

// Registro do evento do botão no início
const btnIndisponiveis = document.querySelector(".action-button.unavailable");
if (btnIndisponiveis) {
    console.log("Botão 'Imóveis Indisponíveis' encontrado, registrando evento");
    btnIndisponiveis.addEventListener('click', () => {
        console.log("Botão clicado!");
        mostrarIndisponiveis = !mostrarIndisponiveis;
        paginaImoveisAtual = 1;
        if (mostrarIndisponiveis) {
            btnIndisponiveis.textContent = "Ver Todos os Imóveis";
            btnIndisponiveis.classList.remove('unavailable');
            btnIndisponiveis.classList.add('all');
        } else {
            btnIndisponiveis.textContent = "Imóveis Indisponíveis";
            btnIndisponiveis.classList.remove('all');
            btnIndisponiveis.classList.add('unavailable');
        }
        console.log("mostrarIndisponiveis atualizado para:", mostrarIndisponiveis);
        filtrarImoveis();
    });
} else {
    console.error("Botão 'Imóveis Indisponíveis' não encontrado no DOM!");
}

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/cidades");
        const data = await response.json();
        console.log('Cidades recebidas:', data);

        cidades = Array.isArray(data) ? data : [];
        atualizarFiltros();
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

// Função para obter o nome da cidade pelo ID
function getNomeCidade(cidadeId) {
    const cidade = cidades.find(c => c.id === parseInt(cidadeId));
    return cidade ? cidade.name : "Cidade não encontrada";
}

// Função para carregar os imóveis iniciais
async function carregarImoveis() {
    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/list-imoveis?limite=${imoveisPorPagina}&offset=0`);
        const data = await response.json();
        if (data.success) {
            console.log('Imóveis carregados com imagens:', data.imoveis);
            imoveisOriginais = data.imoveis;
            totalImoveis = data.total;
            renderizarImoveis(data.imoveis);
        } else {
            console.error("Erro ao carregar imóveis:", data.message || data.error);
            imoveisOriginais = [];
            totalImoveis = 0;
            renderizarImoveis([]);
        }
    } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
        imoveisOriginais = [];
        totalImoveis = 0;
        renderizarImoveis([]);
    }
}

// Função para criar o card de cada imóvel
function criarCardImovel(imovel) {
    const padrao = imovel.categoria === 1 ? "Médio Padrão" : imovel.categoria === 2 ? "Alto Padrão" : "Padrão não especificado";
    const imagemObj = imovel.imagem;
    console.log(`Imagem para imóvel ${imovel.id}:`, imagemObj);
    const imagem = imagemObj && imagemObj.url 
        ? imagemObj.url 
        : "assets/icon.ico";
    console.log(`Imagem selecionada para imóvel ${imovel.id}: ${imagem}`);
    const precoFormatado = parseFloat(imovel.valor).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
    const nomeCidade = getNomeCidade(imovel.cidade);

    return `
        <div class="property-card">
            <img src="${imagem}" alt="${imovel.texto_principal}" class="property-image">
            <div class="property-content">
                <div class="property-title">${imovel.texto_principal} - SKU ${imovel.id}</div>
                <div class="property-city">${nomeCidade}</div>
                <div class="property-type">${padrao}</div>
                <div class="property-price">${precoFormatado}</div>
                <div class="property-toggles">
                    <div class="toggle-container">
                        <span class="toggle-label">Destaque</span>
                        <div class="toggle-btn ${imovel.destaque ? 'active' : ''}" data-id="${imovel.id}" data-field="destaque">
                            <span class="toggle-circle"></span>
                        </div>
                    </div>
                    <div class="toggle-container">
                        <span class="toggle-label">Disponível</span>
                        <div class="toggle-btn ${imovel.disponivel ? 'active' : ''}" data-id="${imovel.id}" data-field="disponivel">
                            <span class="toggle-circle"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="property-actions">
                <button class="action-btn edit" data-id="${imovel.id}">Editar</button>
                <button class="action-btn delete" data-id="${imovel.id}">Excluir</button>
            </div>
        </div>
    `;
}

// Função para renderizar os imóveis como cards
function renderizarImoveis(imoveis) {
    const propertyList = document.getElementById("property-list");
    if (!propertyList) {
        console.error("Erro: Elemento #property-list não encontrado.");
        return;
    }

    console.log("Renderizando página:", paginaImoveisAtual, "Itens:", imoveis.length, "Total imóveis:", totalImoveis);

    propertyList.innerHTML = '';
    if (imoveis.length === 0 && totalImoveis === 0) {
        propertyList.innerHTML = '<div class="no-results">Nenhum resultado encontrado para os filtros aplicados.</div>';
    } else {
        imoveis.forEach(imovel => {
            propertyList.innerHTML += criarCardImovel(imovel);
        });
    }

    adicionarEventosToggles();
    adicionarEventosAcoes();
    criarPaginacaoImoveis(totalImoveis);
    atualizarFiltros();
}

// Função para adicionar eventos aos toggles
function adicionarEventosToggles() {
    document.querySelectorAll('.toggle-btn').forEach(toggle => {
        toggle.addEventListener('click', async () => {
            const imovelId = toggle.dataset.id;
            const field = toggle.dataset.field;
            const isActive = toggle.classList.toggle('active');
            const novoValor = isActive;

            console.log(`Atualizando ${field} do imóvel ${imovelId} para ${novoValor}`);

            try {
                const response = await fetch(`https://backand.meuleaditapema.com.br/imoveis/toggles/${imovelId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [field]: novoValor })
                });
                const data = await response.json();
                console.log(`Resposta da atualização de ${field} do imóvel ${imovelId}:`, data);
                if (!data.success) {
                    console.error(`Erro ao atualizar ${field} do imóvel ${imovelId}:`, data.message);
                    toggle.classList.toggle('active');
                    alert(`Erro ao atualizar ${field}: ${data.message}`);
                } else {
                    const imovel = imoveisOriginais.find(i => i.id === imovelId);
                    if (imovel) {
                        imovel[field] = novoValor;
                    }
                }
            } catch (error) {
                console.error(`Erro ao comunicar com o servidor para ${field}:`, error);
                toggle.classList.toggle('active');
                alert(`Erro ao conectar com o servidor para atualizar ${field}.`);
            }
        });
    });
}

// Função para adicionar eventos aos botões de ação (edit e delete)
function adicionarEventosAcoes() {
    const modal = document.getElementById('delete-modal');
    const modalImovelId = document.getElementById('modal-imovel-id');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    let imovelIdToDelete = null;

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const imovelId = btn.dataset.id;
            if (btn.classList.contains('edit')) {
                window.location.href = `?session=cadastroimovel&editid=${imovelId}`;
            } else if (btn.classList.contains('delete')) {
                // Abre o modal
                imovelIdToDelete = imovelId;
                modalImovelId.textContent = imovelId;
                modal.style.display = 'flex';
            }
        });
    });

    // Evento para cancelar (fechar o modal)
    modalCancel.addEventListener('click', () => {
        modal.style.display = 'none';
        imovelIdToDelete = null;
    });

    // Evento para confirmar a exclusão
    modalConfirm.addEventListener('click', async () => {
        if (imovelIdToDelete) {
            try {
                const response = await fetch(`https://backand.meuleaditapema.com.br/imoveis/${imovelIdToDelete}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    alert('Imóvel excluído com sucesso!');
                    modal.style.display = 'none';
                    imovelIdToDelete = null;
                    filtrarImoveis();
                } else {
                    modal.style.display = 'none';
                    imovelIdToDelete = null;
                    alert('Erro ao excluir imóvel: ' + data.message);
                }
            } catch (error) {
                console.error('Erro ao excluir imóvel:', error);
                modal.style.display = 'none';
                imovelIdToDelete = null;
                alert('Erro ao conectar com o servidor.');
            }
        }
    });

    // Fechar o modal clicando fora dele
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            imovelIdToDelete = null;
        }
    });
}

// Função para criar paginação específica para imóveis
function criarPaginacaoImoveis(totalImoveis) {
    const totalPaginas = Math.ceil(totalImoveis / imoveisPorPagina);
    const paginationControls = document.getElementById("pagination-controls");
    paginationControls.innerHTML = '';

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Anterior";
    prevBtn.disabled = paginaImoveisAtual === 1;
    prevBtn.addEventListener('click', () => {
        if (paginaImoveisAtual > 1) {
            paginaImoveisAtual--;
            filtrarImoveis();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationControls.appendChild(prevBtn);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Próximo";
    nextBtn.disabled = paginaImoveisAtual === totalPaginas;
    nextBtn.addEventListener('click', () => {
        if (paginaImoveisAtual < totalPaginas) {
            paginaImoveisAtual++;
            filtrarImoveis();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationControls.appendChild(nextBtn);

    console.log("Página atual:", paginaImoveisAtual, "Total de páginas:", totalPaginas, "Total de imóveis:", totalImoveis);
}

// Função para filtrar os imóveis
function filtrarImoveis() {
    const cidadeSelecionada = document.getElementById("city-filter")?.value || "";
    const precoSelecionado = document.getElementById("price-filter")?.value || "";

    console.log("Filtro de cidade selecionado:", cidadeSelecionada);
    console.log("Filtro de preço selecionado:", precoSelecionado);

    let url = "https://backand.meuleaditapema.com.br/list-imoveis";
    const params = new URLSearchParams();

    if (mostrarIndisponiveis) {
        params.append("disponivel", "false");
        console.log("Aplicando filtro: disponivel=false");
    }

    if (cidadeSelecionada) {
        params.append("cidade", cidadeSelecionada);
        console.log("Aplicando filtro: cidade=", cidadeSelecionada);
    }

    if (precoSelecionado) {
        const [min, max] = precoSelecionado.split('-').map(Number);
        params.append("precoMin", min);
        console.log("Aplicando filtro: precoMin=", min);
        if (max) {
            params.append("precoMax", max);
            console.log("Aplicando filtro: precoMax=", max);
        }
    }

    params.append("limite", imoveisPorPagina);
    params.append("offset", (paginaImoveisAtual - 1) * imoveisPorPagina);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    console.log("Requisição para:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Resposta do servidor:", data);
            if (data.success) {
                imoveisOriginais = data.imoveis;
                totalImoveis = data.total;
                renderizarImoveis(data.imoveis);
            } else {
                imoveisOriginais = [];
                totalImoveis = 0;
                renderizarImoveis([]);
                console.log(data.message || "Nenhum imóvel encontrado para os filtros aplicados.");
            }
        })
        .catch(error => {
            console.error("Erro ao filtrar imóveis:", error);
            imoveisOriginais = [];
            totalImoveis = 0;
            renderizarImoveis([]);
            alert("Ocorreu um erro ao carregar os imóveis. Tente novamente mais tarde.");
        });
}

// Função para atualizar os dropdowns e seus eventos
function atualizarFiltros() {
    console.log("Atualizando filtros...");
    const filterPanel = document.getElementById("filter-panel") || createFilterPanel();
    const filterWrapper = filterPanel.querySelector(".filter-row") || filterPanel;

    const cidadeAtual = cidadeSelecionada;
    const precoAtual = precoSelecionado;
    console.log("Valores atuais salvos - Cidade:", cidadeAtual, "Preço:", precoAtual);

    let cityFilter = document.getElementById("city-filter");
    if (cityFilter) cityFilter.remove();
    cityFilter = document.createElement("select");
    cityFilter.id = "city-filter";
    cityFilter.className = "filter-dropdown";
    const cityDefaultOption = document.createElement("option");
    cityDefaultOption.value = "";
    cityDefaultOption.textContent = "Todas as Cidades";
    cityFilter.appendChild(cityDefaultOption);
    cidades.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade.id;
        option.textContent = cidade.name;
        cityFilter.appendChild(option);
    });
    filterWrapper.appendChild(cityFilter);
    cityFilter.value = cidadeAtual;
    cityFilter.addEventListener("change", () => {
        console.log("Dropdown de cidades alterado para:", cityFilter.value);
        cidadeSelecionada = cityFilter.value;
        paginaImoveisAtual = 1;
        filtrarImoveis();
    });
    console.log("Dropdown de cidades criado e evento registrado, valor restaurado:", cityFilter.value);

    let priceFilter = document.getElementById("price-filter");
    if (priceFilter) priceFilter.remove();
    priceFilter = document.createElement("select");
    priceFilter.id = "price-filter";
    priceFilter.className = "filter-dropdown";
    const priceDefaultOption = document.createElement("option");
    priceDefaultOption.value = "";
    priceDefaultOption.textContent = "Todos os Preços";
    priceFilter.appendChild(priceDefaultOption);
    const faixasPreco = [
        { value: "0-500000", text: "Até R$ 500 mil" },
        { value: "500000-1000000", text: "R$ 500 mil - R$ 1 milhão" },
        { value: "1000000-2000000", text: "R$ 1 milhão - R$ 2 milhões" },
        { value: "2000000-5000000", text: "R$ 2 milhões - R$ 5 milhões" },
        { value: "5000000-10000000", text: "R$ 5 milhões - R$ 10 milhões" },
        { value: "10000000-20000000", text: "R$ 10 milhões - R$ 20 milhões" },
        { value: "20000000", text: "+ R$ 20 milhões" }
    ];
    faixasPreco.forEach(faixa => {
        const option = document.createElement("option");
        option.value = faixa.value;
        option.textContent = faixa.text;
        priceFilter.appendChild(option);
    });
    filterWrapper.appendChild(priceFilter);
    priceFilter.value = precoAtual;
    priceFilter.addEventListener("change", () => {
        console.log("Dropdown de preços alterado para:", priceFilter.value);
        precoSelecionado = priceFilter.value;
        paginaImoveisAtual = 1;
        filtrarImoveis();
    });
    console.log("Dropdown de preços criado e evento registrado, valor restaurado:", priceFilter.value);
}

// Função para criar o panel de filtros, se não existir
function createFilterPanel() {
    let filterPanel = document.getElementById("filter-panel");
    if (!filterPanel) {
        filterPanel = document.createElement("div");
        filterPanel.id = "filter-panel";
        const filterWrapper = document.createElement("div");
        filterWrapper.className = "filter-row";
        filterPanel.appendChild(filterWrapper);
        const displayHeader = document.querySelector(".display-header");
        if (displayHeader) {
            const headerActions = displayHeader.querySelector(".header-actions");
            if (headerActions) {
                displayHeader.insertBefore(filterPanel, headerActions);
            } else {
                displayHeader.appendChild(filterPanel);
            }
        } else {
            document.body.appendChild(filterPanel);
        }
    }
    return filterPanel;
}

// Chama as funções para carregar os dados ao iniciar o script
carregarCidades();
carregarImoveis();