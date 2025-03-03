// Variáveis globais
let imoveisOriginais = [];
let cidades = [];
let imoveisPorPagina = 6; // Número de imóveis por página
let paginaImoveisAtual = 1;
let totalImoveis = 0; // Variável para armazenar o total retornado pelo servidor

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/cidades");
        const data = await response.json();
        console.log('Cidades recebidas:', data);

        cidades = Array.isArray(data) ? data : [];
        exibirDropdownCidades();
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

// Função para obter o nome da cidade pelo ID
function getNomeCidade(cidadeId) {
    const cidade = cidades.find(c => c.id === cidadeId);
    return cidade ? cidade.name : "Cidade não encontrada";
}

// Função para carregar os imóveis iniciais
async function carregarImoveis() {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis?limite=${imoveisPorPagina}&offset=0`);
        const data = await response.json();
        if (data.success) {
            imoveisOriginais = data.imoveis;
            totalImoveis = data.total;
            renderizarImoveis(data.imoveis);
        } else {
            console.error("Erro ao carregar imóveis:", data.error);
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
    const imagens = Array.isArray(imovel.imagens) ? imovel.imagens : [];
    const imagem = imagens.length > 0 ? imagens[0] : "assets/icon.ico"; // Imagem padrão
    const precoFormatado = parseFloat(imovel.valor).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });

    return `
        <div class="property-card">
            <img src="${imagem}" alt="${imovel.texto_principal}" class="property-image">
            <div class="property-content">
                <div class="property-title">${imovel.texto_principal}</div>
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
}

// Função para adicionar eventos aos toggles
function adicionarEventosToggles() {
    document.querySelectorAll('.toggle-btn').forEach(toggle => {
        toggle.addEventListener('click', async () => {
            const imovelId = toggle.dataset.id;
            const field = toggle.dataset.field; // 'disponivel' ou 'destaque'
            const isActive = toggle.classList.toggle('active');
            const novoValor = isActive;

            console.log(`Atualizando ${field} do imóvel ${imovelId} para ${novoValor}`);

            try {
                const response = await fetch(`http://localhost:3000/imoveis/toggles/${imovelId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [field]: novoValor })
                });
                const data = await response.json();
                console.log(`Resposta da atualização de ${field} do imóvel ${imovelId}:`, data);
                if (!data.success) {
                    console.error(`Erro ao atualizar ${field} do imóvel ${imovelId}:`, data.message);
                    toggle.classList.toggle('active'); // Reverte se falhar
                    alert(`Erro ao atualizar ${field}: ${data.message}`);
                } else {
                    // Atualiza o imóvel localmente para refletir a mudança
                    const imovel = imoveisOriginais.find(i => i.id === imovelId);
                    if (imovel) {
                        imovel[field] = novoValor;
                    }
                }
            } catch (error) {
                console.error(`Erro ao comunicar com o servidor para ${field}:`, error);
                toggle.classList.toggle('active'); // Reverte se falhar
                alert(`Erro ao conectar com o servidor para atualizar ${field}.`);
            }
        });
    });
}

// Função para adicionar eventos aos botões de ação
function adicionarEventosAcoes() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const imovelId = btn.dataset.id;
            if (btn.classList.contains('edit')) {
                window.location.href = `?session=cadastroimovel&editid=${imovelId}`;
            } else if (btn.classList.contains('delete')) {
                if (confirm(`Deseja excluir o imóvel ${imovelId}?`)) {
                    fetch(`http://localhost:3000/imoveis/${imovelId}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Imóvel excluído com sucesso!');
                            filtrarImoveis(); // Recarregar a lista
                        } else {
                            alert('Erro ao excluir imóvel: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao excluir imóvel:', error);
                        alert('Erro ao conectar com o servidor.');
                    });
                }
            }
        });
    });
}

// Função para criar paginação específica para imóveis (com scroll ao topo)
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

    let url = "https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis";
    const params = new URLSearchParams();

    if (cidadeSelecionada) {
        params.append("cidade", cidadeSelecionada);
    }

    if (precoSelecionado) {
        const [min, max] = precoSelecionado.split('-').map(Number);
        params.append("precoMin", min);
        if (max) params.append("precoMax", max);
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

// Função para exibir o dropdown de cidades
function exibirDropdownCidades() {
    const filterPanel = document.getElementById("filter-panel") || createFilterPanel();
    const filterWrapper = filterPanel.querySelector(".filter-row") || filterPanel;

    const existing = document.getElementById("city-filter");
    if (existing) existing.remove();

    const select = document.createElement("select");
    select.id = "city-filter";
    select.className = "filter-dropdown";
    select.addEventListener("change", () => {
        paginaImoveisAtual = 1;
        filtrarImoveis();
    });

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Todas as Cidades";
    select.appendChild(defaultOption);

    cidades.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade.id;
        option.textContent = cidade.name;
        select.appendChild(option);
    });

    filterWrapper.appendChild(select);
}

// Função para exibir o dropdown de preços
function exibirDropdownPrecos() {
    const filterPanel = document.getElementById("filter-panel") || createFilterPanel();
    const filterWrapper = filterPanel.querySelector(".filter-row") || filterPanel;

    const existing = document.getElementById("price-filter");
    if (existing) existing.remove();

    const select = document.createElement("select");
    select.id = "price-filter";
    select.className = "filter-dropdown";
    select.addEventListener("change", () => {
        paginaImoveisAtual = 1;
        filtrarImoveis();
    });

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Todos os Preços";
    select.appendChild(defaultOption);

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
        select.appendChild(option);
    });

    filterWrapper.appendChild(select);
}

// Função para criar o panel de filtros, se não existir
function createFilterPanel() {
    const filterPanel = document.createElement("div");
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
    return filterPanel;
}

// Chama as funções para carregar os dados ao iniciar o script
carregarCidades();
carregarImoveis();