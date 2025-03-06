// Variáveis globais
let imoveisOriginais = [];
let cidades = [];
let imoveisPorPagina = 6; // Número de imóveis por página
let paginaImoveisAtual = 1;
let totalImoveis = 0; // Variável para armazenar o total retornado pelo servidor

// Variáveis globais para leads
let leadsOriginais = [];
let paginaAtual = 1;
const itensPorPagina = 20;
let totalLeads = 0;

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/cidades");
        const data = await response.json();
        cidades = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

// Função para obter o nome da cidade pelo ID
function getNomeCidade(cidadeId) {
    const cidade = cidades.find(c => c.id === parseInt(cidadeId));
    return cidade ? cidade.name : "Cidade não encontrada";
}

async function mostrarCheckout(leadId, padrao, valorFormatado) {
    console.log("mostrarCheckout chamado com:", leadId, padrao, valorFormatado);
    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/list-clientes?limit=1&offset=0&id=${leadId}`);
        const data = await response.json();
        console.log("Resposta da API:", data);
        const lead = data.clientes && data.clientes[0] ? data.clientes[0] : {};

        const overlay = document.createElement("div");
        overlay.className = "checkout-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0, 0, 0, 0.6)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "2000";

        const modal = document.createElement("div");
        modal.className = "checkout-modal";
        modal.style.background = "#fff";
        modal.style.width = "100%";
        modal.style.maxWidth = "800px";
        modal.style.height = "80vh";
        modal.style.borderRadius = "12px";
        modal.style.padding = "20px";
        modal.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.2)";
        modal.style.display = "flex";
        modal.style.flexDirection = "column";
        modal.style.overflowY = "auto";

        modal.innerHTML = `
            <div class="checkout-header">
                <h2>Confirmar Compra de Lead</h2>
                <i class="material-icons close-icon" onclick="this.closest('.checkout-overlay').remove()">close</i>
            </div>
            <div class="lead-info">
                <div class="lead-interesse">SKU: ${lead.id || "N/A"}</div>
                <div class="lead-interesse">Interesse: ${lead.interesse || "Não especificado"}</div>
                <div class="lead-interesse">Valor do Lead: ${valorFormatado}</div>
            </div>
            <div class="similar-leads">
                <h3>Leads Semelhantes</h3>
                <div class="similar-leads-container" id="similar-leads-container"></div>
            </div>
            <div class="checkout-footer">
                <div class="total-price">Total: ${valorFormatado}</div>
                <div class="checkout-buttons">
                    <button class="confirm-btn" onclick="confirmarCompra(${leadId})">Confirmar</button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        await carregarLeadsSemelhantes(leadId, padrao, valorFormatado);
    } catch (error) {
        console.error("Erro em mostrarCheckout:", error);
    }
}

// Função para carregar leads semelhantes
async function carregarLeadsSemelhantes(leadId, padrao, valorFormatado) {
    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/list-clientes?limit=10&categoria=${padrao === "alto-padrao" ? 2 : 1}`);
        const data = await response.json();
        const similarLeadsContainer = document.getElementById("similar-leads-container");
        const selectedLeads = [leadId];
        let totalPrice = parseFloat(valorFormatado.replace("R$", "").replace(".", "").replace(",", "."));

        if (data.clientes && Array.isArray(data.clientes)) {
            const filteredLeads = data.clientes.filter(lead => lead.id !== leadId);
            filteredLeads.forEach(lead => {
                const valorLead = parseFloat(lead.valor_lead || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                });
                const miniCard = document.createElement("div");
                miniCard.className = `mini-lead-card ${padrao}`;
                miniCard.innerHTML = `
                    <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
                    <div class="lead-sku">SKU ${lead.id}</div>
                    <div class="lead-interesse">${lead.interesse || "N/A"}</div>
                    <div class="lead-interesse">${valorLead}</div>
                `;
                miniCard.onclick = () => {
                    miniCard.classList.toggle("selected");
                    const leadValue = parseFloat(lead.valor_lead || 0);
                    if (miniCard.classList.contains("selected")) {
                        selectedLeads.push(lead.id);
                        totalPrice += leadValue;
                    } else {
                        selectedLeads.splice(selectedLeads.indexOf(lead.id), 1);
                        totalPrice -= leadValue;
                    }
                    document.querySelector(".total-price").textContent = `Total: ${totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
                    window.selectedLeads = selectedLeads;
                };
                similarLeadsContainer.appendChild(miniCard);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar leads semelhantes:", error);
    }
}

// Função para confirmar a compra
function confirmarCompra(leadId) {
    const selectedLeads = window.selectedLeads || [leadId];
    console.log("Leads a comprar:", selectedLeads);
    alert(`Compra confirmada para os leads: ${selectedLeads.join(", ")}. Redirecionando para o checkout...`);
    document.querySelector(".checkout-overlay").remove();
}

// Função para criar o card de cada imóvel
function criarCardImovel(imovel) {
    const imagemObj = imovel.imagem;
    console.log(`Imagem para imóvel ${imovel.id}:`, imagemObj);
    const imagem = imagemObj && imagemObj.url 
        ? imagemObj.url 
        : "assets/icon.ico";

    // Nova URL direta para o subdomínio
    const detalhesUrl = `https://imovel.meuleaditapema.com.br/${imovel.id}`;
    const padrao = imovel.categoria === 1 ? "Médio Padrão" : 
                  imovel.categoria === 2 ? "Alto Padrão" : 
                  "Padrão não especificado";
    const nomeCidade = getNomeCidade(imovel.cidade);

    const formatarTexto = (quantidade, singular, plural) => 
        `${quantidade} ${quantidade === 1 ? singular : plural}`;

    return `
        <div class="card">
            <div class="image-container">
                <img src="${imagem}" alt="Imóvel">
                <div class="padrao-label">${padrao}</div>
                <div class="overlay">
                    <div class="overlay-item">
                        <i class="material-icons">king_bed</i>
                        <span>${formatarTexto(imovel.quartos || 0, "quarto", "quartos")}</span>
                    </div>
                    <div class="overlay-item">
                        <i class="material-icons">directions_car</i>
                        <span>${formatarTexto(imovel.vagas_garagem || 0, "vaga", "vagas")}</span>
                    </div>
                    <div class="overlay-item">
                        <i class="material-icons">square_foot</i>
                        <span>${imovel.metros_quadrados || 0}m²</span>
                    </div>
                </div>
            </div>
            <h2>${imovel.texto_principal}</h2>
            <p><strong>${nomeCidade} - ${imovel.estado}</strong></p>
            <p>${imovel.descricao}</p>
            <h2>${parseFloat(imovel.valor).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL', 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}</h2>
            <button class="btn-detalhes" onclick="window.location.href='${detalhesUrl}'">
                Ver Detalhes
            </button>
        </div>
    `;
}

// Função para criar o card de lead
function criarCardLead(cliente) {
    console.log("Criando card para cliente:", cliente.id);
    const padrao = cliente.categoria === 1 ? "medio-padrao" : 
                   cliente.categoria === 2 ? "alto-padrao" : 
                   "medio-padrao";
    const icon = cliente.categoria === 2 ? "star" : "home";
    const valorLead = cliente.valor_lead || 0;
    const valorFormatado = parseFloat(valorLead).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });

    const card = document.createElement("div");
    card.className = `lead-card ${padrao}`;
    card.innerHTML = `
        <div class="lead-card-header">
            <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
            <div class="lead-sku">SKU ${cliente.id}</div>
            <div class="lead-interesse">${cliente.interesse || "Interesse não especificado"}</div>
            <i class="material-icons lead-icon">${icon}</i>
        </div>
        <div class="lead-card-footer">
            <button class="lead-btn-adquirir">Obter por ${valorFormatado}</button>
        </div>
    `;

    const button = card.querySelector(".lead-btn-adquirir");
    button.addEventListener("click", () => {
        console.log("Botão clicado para lead ID:", cliente.id);
        mostrarCheckout(cliente.id, padrao, valorFormatado);
    });

    return card;
}

// Função para carregar os imóveis iniciais
async function carregarImoveis() {
    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/list-imoveis/disponiveis?limite=${imoveisPorPagina}&offset=0`);
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

// Função para renderizar os imóveis
function renderizarImoveis(imoveis) {
    const imoveisContainer = document.getElementById("imoveis-container");
    if (!imoveisContainer) {
        console.error("Erro: Elemento #imoveis-container não encontrado.");
        return;
    }

    console.log("Renderizando página:", paginaImoveisAtual, "Itens:", imoveis.length, "Total imóveis:", totalImoveis);

    imoveisContainer.innerHTML = '';
    if (imoveis.length === 0 && totalImoveis === 0) {
        imoveisContainer.innerHTML = '<p class="nenhum-resultado">Nenhum resultado encontrado para os filtros aplicados.</p>';
    } else {
        imoveis.forEach(imovel => {
            imoveisContainer.innerHTML += criarCardImovel(imovel);
        });
    }

    criarPaginacaoImoveis(totalImoveis);
}

// Função para criar paginação específica para imóveis
function criarPaginacaoImoveis(totalImoveis) {
    const totalPaginas = Math.ceil(totalImoveis / imoveisPorPagina);
    const paginacaoContainer = document.getElementById("paginacao-imoveis") || createPaginationImoveisContainer();
    paginacaoContainer.innerHTML = '';

    const paginationWrapper = document.createElement("div");
    paginationWrapper.className = "paginacao-imoveis-wrapper";

    const setaEsquerda = document.createElement("i");
    setaEsquerda.className = "material-icons paginacao-imoveis-seta paginacao-imoveis-seta-esquerda";
    setaEsquerda.textContent = "chevron_left";
    setaEsquerda.onclick = () => {
        if (paginaImoveisAtual > 1) {
            paginaImoveisAtual--;
            filtrarImoveis();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationWrapper.appendChild(setaEsquerda);

    const paginaTexto = document.createElement("span");
    paginaTexto.className = "paginacao-imoveis-texto";
    paginaTexto.textContent = `Página ${paginaImoveisAtual} de ${totalPaginas || 1}`;
    paginationWrapper.appendChild(paginaTexto);

    const setaDireita = document.createElement("i");
    setaDireita.className = "material-icons paginacao-imoveis-seta paginacao-imoveis-seta-direita";
    setaDireita.textContent = "chevron_right";
    setaDireita.onclick = () => {
        if (paginaImoveisAtual < totalPaginas) {
            paginaImoveisAtual++;
            filtrarImoveis();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationWrapper.appendChild(setaDireita);

    paginacaoContainer.appendChild(paginationWrapper);

    setaEsquerda.style.opacity = paginaImoveisAtual === 1 ? '0.5' : '1';
    setaEsquerda.style.cursor = paginaImoveisAtual === 1 ? 'not-allowed' : 'pointer';
    setaDireita.style.opacity = paginaImoveisAtual === totalPaginas ? '0.5' : '1';
    setaDireita.style.cursor = paginaImoveisAtual === totalPaginas ? 'not-allowed' : 'pointer';

    console.log("Página atual:", paginaImoveisAtual, "Total de páginas:", totalPaginas, "Total de imóveis:", totalImoveis);
}

// Função para criar o container de paginação, se não existir
function createPaginationImoveisContainer() {
    const paginacao = document.createElement("div");
    paginacao.id = "paginacao-imoveis";
    paginacao.className = "paginacao-imoveis";
    const imoveisContainer = document.getElementById("imoveis-container");
    if (imoveisContainer && imoveisContainer.parentNode) {
        imoveisContainer.parentNode.appendChild(paginacao);
    } else {
        document.body.appendChild(paginacao);
    }
    return paginacao;
}

// Função para filtrar os imóveis
function filtrarImoveis() {
    const cidadeSelecionada = document.getElementById("dropdown-cidades")?.value || "";
    const precoSelecionado = document.getElementById("dropdown-precos")?.value || "";

    let url = "https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/disponiveis";
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

// Função para garantir que o container de filtros exista
function garantirFiltrosContainer() {
    let filtrosContainer = document.getElementById("filtros-imoveis");
    if (!filtrosContainer) {
        filtrosContainer = document.createElement("div");
        filtrosContainer.id = "filtros-imoveis";
        const dropdownsWrapper = document.createElement("div");
        dropdownsWrapper.className = "dropdowns-wrapper";
        filtrosContainer.appendChild(dropdownsWrapper);
        const imoveisContainer = document.getElementById("imoveis-container");
        if (imoveisContainer && imoveisContainer.parentNode) {
            imoveisContainer.parentNode.insertBefore(filtrosContainer, imoveisContainer);
        } else {
            document.body.appendChild(filtrosContainer);
        }
    }
    return filtrosContainer;
}

// Função para exibir o dropdown de cidades
async function exibirDropdownCidades() {
    const filtrosContainer = garantirFiltrosContainer();
    const dropdownsWrapper = filtrosContainer.querySelector(".dropdowns-wrapper") || filtrosContainer;

    const existente = document.getElementById("dropdown-cidades");
    if (existente) existente.remove();

    try {
        if (cidades.length === 0) await carregarCidades();

        const select = document.createElement("select");
        select.id = "dropdown-cidades";
        select.onchange = () => {
            paginaImoveisAtual = 1;
            filtrarImoveis();
        };

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Todas as cidades";
        select.appendChild(defaultOption);

        cidades.forEach(cidade => {
            const option = document.createElement("option");
            option.value = cidade.id;
            option.textContent = cidade.name;
            select.appendChild(option);
        });

        dropdownsWrapper.appendChild(select);
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

// Função para exibir o dropdown de preços
function exibirDropdownPrecos() {
    const filtrosContainer = garantirFiltrosContainer();
    const dropdownsWrapper = filtrosContainer.querySelector(".dropdowns-wrapper") || filtrosContainer;

    const existente = document.getElementById("dropdown-precos");
    if (existente) existente.remove();

    const select = document.createElement("select");
    select.id = "dropdown-precos";
    select.onchange = () => {
        paginaImoveisAtual = 1;
        filtrarImoveis();
    };

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Todos os preços";
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

    dropdownsWrapper.appendChild(select);
}

// Função para renderizar os leads
function renderizarLeads(leadsFiltrados) {
    console.log("Renderizando leads:", leadsFiltrados.length);
    const clientesContainer = document.getElementById("clientes-container");
    if (!clientesContainer) {
        console.error("Erro: Elemento #clientes-container não encontrado.");
        return;
    }

    let filtrosDiv = document.querySelector(".filtros-leads");
    if (!filtrosDiv) {
        filtrosDiv = document.createElement("div");
        filtrosDiv.classList.add("filtros-leads");
        clientesContainer.insertBefore(filtrosDiv, clientesContainer.firstChild);
        exibirDropdownPadraoLeads();
        exibirDropdownValoresLeads();
        exibirDropdownOrdenacaoLeads();
    }

    const existingElements = clientesContainer.querySelectorAll(".contagem-leads, .lead-card, .outros-resultados, .paginacao-leads");
    existingElements.forEach(element => element.remove());

    leadsFiltrados.forEach(cliente => {
        const card = criarCardLead(cliente);
        clientesContainer.appendChild(card);
    });

    const paginacaoDiv = document.createElement("div");
    paginacaoDiv.id = "paginacao-leads";
    paginacaoDiv.className = "paginacao-leads";
    const totalPaginas = Math.ceil(totalLeads / itensPorPagina);

    const paginationWrapper = document.createElement("div");
    paginationWrapper.className = "paginacao-leads-wrapper";

    const setaEsquerda = document.createElement("i");
    setaEsquerda.className = "material-icons paginacao-leads-seta paginacao-leads-seta-esquerda";
    setaEsquerda.textContent = "chevron_left";
    setaEsquerda.onclick = () => {
        if (paginaAtual > 1) {
            paginaAtual--;
            carregarClientesPaginados();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationWrapper.appendChild(setaEsquerda);

    const paginaTexto = document.createElement("span");
    paginaTexto.className = "paginacao-leads-texto";
    paginaTexto.textContent = `Página ${paginaAtual} de ${totalPaginas || 1}`;
    paginationWrapper.appendChild(paginaTexto);

    const setaDireita = document.createElement("i");
    setaDireita.className = "material-icons paginacao-leads-seta paginacao-leads-seta-direita";
    setaDireita.textContent = "chevron_right";
    setaDireita.onclick = () => {
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            carregarClientesPaginados();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationWrapper.appendChild(setaDireita);

    paginacaoDiv.appendChild(paginationWrapper);
    clientesContainer.appendChild(paginacaoDiv);

    setaEsquerda.style.opacity = paginaAtual === 1 ? '0.5' : '1';
    setaEsquerda.style.cursor = paginaAtual === 1 ? 'not-allowed' : 'pointer';
    setaDireita.style.opacity = paginaAtual === totalPaginas ? '0.5' : '1';
    setaDireita.style.cursor = paginaAtual === totalPaginas ? 'not-allowed' : 'pointer';
}

// Função para exibir o dropdown de padrão
function exibirDropdownPadraoLeads() {
    const filtrosDiv = document.querySelector(".filtros-leads");
    if (!filtrosDiv || document.getElementById("dropdown-padrao-leads")) return;

    const select = document.createElement("select");
    select.id = "dropdown-padrao-leads";
    select.addEventListener("change", carregarClientesPaginados);

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Padrão";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    const padroes = [
        { value: "1", text: "Médio Padrão" },
        { value: "2", text: "Alto Padrão" }
    ];

    padroes.forEach(padrao => {
        const option = document.createElement("option");
        option.value = padrao.value;
        option.textContent = padrao.text;
        select.appendChild(option);
    });

    filtrosDiv.appendChild(select);
}

// Função para exibir o dropdown de valores de interesse
function exibirDropdownValoresLeads() {
    const filtrosDiv = document.querySelector(".filtros-leads");
    if (!filtrosDiv || document.getElementById("dropdown-valores-leads")) return;

    const select = document.createElement("select");
    select.id = "dropdown-valores-leads";
    select.addEventListener("change", carregarClientesPaginados);

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Valor de Interesse";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    const faixasPreco = [
        { value: "0-500000", text: "Até R$ 500.000" },
        { value: "500000-1000000", text: "R$ 500.000 - R$ 1.000.000" },
        { value: "1000000-2000000", text: "R$ 1.000.000 - R$ 2.000.000" },
        { value: "2000000-5000000", text: "R$ 2.000.000 - R$ 5.000.000" },
        { value: "5000000-10000000", text: "R$ 5.000.000 - R$ 10.000.000" },
        { value: "10000000-20000000", text: "R$ 10.000.000 - R$ 20.000.000" },
        { value: "20000000", text: "+ R$ 20.000.000" }
    ];

    faixasPreco.forEach(faixa => {
        const option = document.createElement("option");
        option.value = faixa.value;
        option.textContent = faixa.text;
        select.appendChild(option);
    });

    filtrosDiv.appendChild(select);
}

// Função para exibir o dropdown de ordenação por valor do lead
function exibirDropdownOrdenacaoLeads() {
    const filtrosDiv = document.querySelector(".filtros-leads");
    if (!filtrosDiv || document.getElementById("dropdown-ordenacao-leads")) return;

    const select = document.createElement("select");
    select.id = "dropdown-ordenacao-leads";
    select.addEventListener("change", carregarClientesPaginados);

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Ordenar por Valor do Lead";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    const ordens = [
        { value: "maior-menor", text: "Maior para Menor" },
        { value: "menor-maior", text: "Menor para Maior" }
    ];

    ordens.forEach(ordem => {
        const option = document.createElement("option");
        option.value = ordem.value;
        option.textContent = ordem.text;
        select.appendChild(option);
    });

    filtrosDiv.appendChild(select);
}

// Função para carregar clientes paginados com filtros e ordenação no servidor
async function carregarClientesPaginados() {
    try {
        const padraoSelecionado = document.getElementById("dropdown-padrao-leads")?.value || "";
        const valorInteresseSelecionado = document.getElementById("dropdown-valores-leads")?.value || "";
        const ordenacaoSelecionada = document.getElementById("dropdown-ordenacao-leads")?.value || "";

        const offset = (paginaAtual - 1) * itensPorPagina;

        const url = new URL("https://pedepro-meulead.6a7cul.easypanel.host/list-clientes");
        url.searchParams.set("limit", itensPorPagina);
        url.searchParams.set("offset", offset);

        if (padraoSelecionado) {
            url.searchParams.set("categoria", padraoSelecionado);
        }

        if (valorInteresseSelecionado) {
            const [min, max] = valorInteresseSelecionado.split('-').map(Number);
            url.searchParams.set("valor_min", min);
            if (max) url.searchParams.set("valor_max", max);
        }

        if (ordenacaoSelecionada) {
            url.searchParams.set("ordenacao", ordenacaoSelecionada);
        }

        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao carregar clientes");

        leadsOriginais = data.clientes || [];
        totalLeads = data.total || 0;

        renderizarLeads(leadsOriginais);
    } catch (error) {
        console.error("Erro ao carregar clientes paginados:", error);
    }
}

// Função para carregar os clientes (leads) inicialmente
async function carregarClientes() {
    paginaAtual = 1;
    await carregarClientesPaginados();
}

// Função para carregar imóveis afiliados e comprados
async function carregaraImoveis() {
    try {
        const container = document.getElementById("meus-imoveis-container");
        if (!container) {
            console.error("Erro: Elemento #meus-imoveis-container não encontrado.");
            return;
        }

        container.innerHTML = "";

        const titulo = document.createElement("h2");
        titulo.textContent = "Meus Imóveis";
        titulo.style.marginBottom = "15px";
        titulo.style.marginLeft = "15px";
        titulo.style.color = "#555555";
        container.appendChild(titulo);

        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/1");
        const data = await response.json();
        const imoveis = Array.isArray(data.imoveis) ? data.imoveis : [];

        if (imoveis.length === 0) {
            container.innerHTML += "<p>Nenhum imóvel encontrado.</p>";
            return;
        }

        imoveis.forEach(imovel => {
            const card = document.createElement("div");
            card.classList.add("card");

            const imagemObj = imovel.imagem;
            console.log(`Imagem para imóvel ${imovel.id}:`, imagemObj);
            const imagem = imagemObj && imagemObj.url 
                ? imagemObj.url 
                : "https://source.unsplash.com/400x300/?house";

            const phone = imovel.whatsapp ? imovel.whatsapp.replace(/\D/g, '') : '';
            const mensagem = `Olá ${imovel.nome_proprietario || 'Proprietário'}`;
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;

            const formatarTexto = (quantidade, singular, plural) => 
                `${quantidade} ${quantidade === 1 ? singular : plural}`;

            const nomeCidade = getNomeCidade(imovel.cidade || '');

            const origemTexto = imovel.origem === 'comprado' ? 'Comprado' : 
                               imovel.origem === 'afiliado' ? 'Apenas Afiliado' : 
                               'Comprado e Afiliado';

            const botaoAcao = imovel.origem === 'afiliado' 
                ? `<button class="btn-remove-affiliation" onclick="mostrarPopupRemover(${imovel.id})">Remover Afiliação</button>`
                : `<button class="btn-detalhes" onclick="window.location.href='${whatsappUrl}'">Conversar com o Proprietário</button>`;

            card.innerHTML = `
                <div class="image-container">
                    <img src="${imagem}" alt="Imóvel">
                    <div class="overlay">
                        <div class="overlay-item">
                            <i class="material-icons">king_bed</i>
                            <span>${formatarTexto(imovel.quartos || 0, "quarto", "quartos")}</span>
                        </div>
                        <div class="overlay-item">
                            <i class="material-icons">directions_car</i>
                            <span>${formatarTexto(imovel.vagas_garagem || 0, "vaga", "vagas")}</span>
                        </div>
                        <div class="overlay-item">
                            <i class="material-icons">square_foot</i>
                            <span>${imovel.metros_quadrados || 0}m²</span>
                        </div>
                    </div>
                </div>
                <h2>${imovel.texto_principal || 'Imóvel sem título'}</h2>
                <p><strong>${nomeCidade} - ${imovel.estado || ''}</strong></p>
                <p>${imovel.descricao || 'Sem descrição'}</p>
                <h2>${parseFloat(imovel.valor || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })}</h2>
                <p><em>${origemTexto}</em></p>
                ${botaoAcao}
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
    }
}

// Função para mostrar o popup de confirmação
function mostrarPopupRemover(imovelId) {
    const popup = document.createElement("div");
    popup.classList.add("affiliation-popup");
    popup.innerHTML = `
        <div class="affiliation-popup-content">
            <h3>Confirmar Remoção</h3>
            <p>Deseja realmente remover a afiliação deste imóvel?</p>
            <button class="affiliation-confirm-btn" onclick="removerAfiliacao(${imovelId})">Confirmar</button>
            <button class="affiliation-cancel-btn" onclick="this.parentElement.parentElement.remove()">Cancelar</button>
        </div>
    `;
    document.body.appendChild(popup);
}

// Função para remover a afiliação
async function removerAfiliacao(imovelId) {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/remover-afiliacao/1/${imovelId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            alert("Afiliação removida com sucesso!");
            document.querySelector(".affiliation-popup").remove();
            carregaraImoveis();
        } else {
            alert("Erro ao remover afiliação: " + data.message);
        }
    } catch (error) {
        console.error("Erro ao remover afiliação:", error);
        alert("Erro ao remover afiliação.");
    }
}

// Função para carregar leads adquiridos
async function carregarLeadsAdquiridos(corretorId) {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-clientes/${corretorId}`);
        const data = await response.json();
        const leads = Array.isArray(data.clientes) ? data.clientes : [];

        const meusLeadsContainer = document.getElementById("meus-leads");
        meusLeadsContainer.innerHTML = "";

        const titleContainer = document.createElement("div");
        titleContainer.className = "title-container";
        
        const titulo = document.createElement("h2");
        titulo.textContent = "Leads Adquiridos";
        titulo.style.color = "#555555";
        titleContainer.appendChild(titulo);
        
        meusLeadsContainer.appendChild(titleContainer);

        const gridContainer = document.createElement("div");
        gridContainer.className = "leads-grid";

        if (leads.length === 0) {
            gridContainer.innerHTML = "<p>Nenhum lead adquirido encontrado.</p>";
        } else {
            leads.forEach(lead => {
                const padrao = lead.categoria === 1 ? "medio-padrao" : 
                               lead.categoria === 2 ? "alto-padrao" : 
                               "medio-padrao";
                const icon = lead.categoria === 2 ? "star" : "home";

                const card = document.createElement("div");
                card.classList.add("lead-card", padrao);
                card.innerHTML = `
                    <div class="lead-card-header">
                        <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
                        <div class="lead-sku">SKU ${lead.id}</div>
                        <div class="lead-interesse">Nome: ${lead.nome || "Não informado"}</div>
                        <div class="lead-interesse">Interesse: ${lead.interesse || "Não especificado"}</div>
                        <div class="lead-interesse">Tipo: ${lead.tipo_imovel || "Não informado"}</div>
                        <div class="lead-interesse">Valor: R$ ${lead.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div class="lead-interesse">WhatsApp: ${lead.whatsapp || "Não informado"}</div>
                        <i class="material-icons lead-icon">${icon}</i>
                    </div>
                    <div class="lead-card-footer">
                        <button class="lead-btn-adquirir" onclick="window.location.href='cliente.html?id=${lead.id}'">
                            Ver Detalhes
                        </button>
                    </div>
                `;
                gridContainer.appendChild(card);
            });
        }

        meusLeadsContainer.appendChild(gridContainer);
    } catch (error) {
        console.error("Erro ao carregar leads adquiridos:", error);
    }
}

// Função para carregar dados do corretor
async function carregarCorretor() {
    const id = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!id || !token) {
        console.warn("ID ou token não encontrados no localStorage.");
        return;
    }

    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/corretor?id=${id}&token=${token}`);
        const data = await response.json();

        if (response.ok) {
            window.corretor = data;
            document.getElementById("name").textContent = `Olá, ${data.name}`;
        } else {
            console.error("Erro ao carregar corretor:", data.error);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

// Função para carregar preview de imóveis
async function carregarImoveisPreview() {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/disponiveis?limite=10&offset=0&destaque=true`);
        const data = await response.json();
        const imoveisPreview = document.getElementById("imoveis-preview");
        imoveisPreview.innerHTML = "";
        if (data.success && data.imoveis && Array.isArray(data.imoveis)) {
            data.imoveis.forEach(imovel => {
                imoveisPreview.innerHTML += criarCardImovel(imovel);
            });
        } else {
            console.warn("Nenhum imóvel em destaque encontrado:", data);
            imoveisPreview.innerHTML = "<p>Nenhum imóvel em destaque disponível no momento.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar preview de imóveis:", error);
        const imoveisPreview = document.getElementById("imoveis-preview");
        imoveisPreview.innerHTML = "<p>Erro ao carregar imóveis.</p>";
    }
}

// Função para carregar preview de leads
async function carregarLeadsPreview() {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-clientes?limit=4&offset=0`);
        const data = await response.json();
        const leadsPreview = document.getElementById("leads-preview");
        leadsPreview.innerHTML = "";
        if (data.clientes && Array.isArray(data.clientes)) {
            data.clientes.forEach(cliente => {
                const card = criarCardLead(cliente);
                leadsPreview.appendChild(card);
            });
        } else {
            console.warn("Nenhum lead encontrado no preview:", data);
            leadsPreview.innerHTML = "<p>Nenhum lead disponível no momento.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar preview de leads:", error);
        const leadsPreview = document.getElementById("leads-preview");
        leadsPreview.innerHTML = "<p>Erro ao carregar leads.</p>";
    }
}

// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", async function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const imoveisLink = document.getElementById("imoveis-link");
    const clientesLink = document.getElementById("clientes-link");
    const meusImoveisLink = document.getElementById("meusimoveis-link");
    const meusLeadsLink = document.getElementById("meusleads-link");
    const userInfoContainer = document.getElementById("user-info-container");
    const imoveisContainer = document.getElementById("imoveis-container");
    const clientesContainer = document.getElementById("clientes-container");
    const meusImoveisContainer = document.getElementById("meus-imoveis-container");
    const meusLeadsContainer = document.getElementById("meus-leads");
    const homeSection = document.getElementById("home-section");
    const verMaisImoveis = document.getElementById("ver-mais-imoveis");
    const verMaisLeads = document.getElementById("ver-mais-leads");

    function gerenciarFiltros(visivel) {
        const filtrosContainer = document.getElementById("filtros-imoveis");
        if (filtrosContainer) {
            filtrosContainer.style.display = visivel ? "block" : "none";
        }
    }

    function gerenciarPaginacaoImoveis(visivel) {
        const paginacaoImoveis = document.getElementById("paginacao-imoveis");
        if (paginacaoImoveis) {
            paginacaoImoveis.style.display = visivel ? "block" : "none";
        } else if (!visivel) {
            const existingPagination = document.querySelector(".paginacao-imoveis");
            if (existingPagination) {
                existingPagination.remove();
            }
        }
    }

    function centralizarPaginacaoImoveis() {
        const paginacaoImoveis = document.getElementById("paginacao-imoveis");
        if (paginacaoImoveis) {
            paginacaoImoveis.style.width = "100%";
            paginacaoImoveis.style.display = "flex";
            paginacaoImoveis.style.justifyContent = "center";
        }
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });
    }

    if (imoveisLink) {
        imoveisLink.addEventListener("click", async function (e) {
            e.preventDefault();
            sidebar.classList.remove("open");
            homeSection.style.display = "none";
            imoveisContainer.style.display = "flex";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "none";
            meusLeadsContainer.style.display = "none";
            
            gerenciarFiltros(true);
            gerenciarPaginacaoImoveis(true);
            await carregarImoveis();
            await exibirDropdownCidades();
            exibirDropdownPrecos();
            centralizarPaginacaoImoveis();
        });
    }

    if (clientesLink) {
        clientesLink.addEventListener("click", function (e) {
            e.preventDefault();
            sidebar.classList.remove("open");
            homeSection.style.display = "none";
            clientesContainer.style.display = "flex";
            imoveisContainer.style.display = "none";
            meusImoveisContainer.style.display = "none";
            meusLeadsContainer.style.display = "none";
            
            gerenciarFiltros(false);
            gerenciarPaginacaoImoveis(false);
            carregarClientes();
        });
    }

    if (meusImoveisLink) {
        meusImoveisLink.addEventListener("click", function (e) {
            e.preventDefault();
            sidebar.classList.remove("open");
            homeSection.style.display = "none";
            imoveisContainer.style.display = "none";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "grid";
            meusLeadsContainer.style.display = "none";
            
            gerenciarFiltros(false);
            gerenciarPaginacaoImoveis(false);
            carregaraImoveis();
        });
    }

    if (meusLeadsLink) {
        meusLeadsLink.addEventListener("click", function (e) {
            e.preventDefault();
            sidebar.classList.remove("open");
            homeSection.style.display = "none";
            imoveisContainer.style.display = "none";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "none";
            meusLeadsContainer.style.display = "grid";
            
            gerenciarFiltros(false);
            gerenciarPaginacaoImoveis(false);
            carregarLeadsAdquiridos(1);
        });
    }

    if (verMaisImoveis) {
        verMaisImoveis.addEventListener("click", function (e) {
            e.preventDefault();
            imoveisLink.click();
        });
    }

    if (verMaisLeads) {
        verMaisLeads.addEventListener("click", function (e) {
            e.preventDefault();
            clientesLink.click();
        });
    }

    if (userInfoContainer) {
        userInfoContainer.addEventListener("click", function () {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            window.location.href = "/login";
        });
    }

    homeSection.style.display = "block";
    imoveisContainer.style.display = "none";
    clientesContainer.style.display = "none";
    meusImoveisContainer.style.display = "none";
    meusLeadsContainer.style.display = "none";
    gerenciarFiltros(false);
    gerenciarPaginacaoImoveis(false);

    await carregarCidades();
    await carregarImoveisPreview();
    await carregarLeadsPreview();
    carregarCorretor();
});

// Esconder preloader após o carregamento
window.addEventListener("load", function () {
    setTimeout(function () {
        const preloader = document.getElementById("preloader");
        if (preloader) {
            preloader.style.display = "none";
        }
    }, 1000);
});