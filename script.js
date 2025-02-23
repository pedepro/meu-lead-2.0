// Variáveis globais
let imoveisOriginais = [];
let cidades = [];

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/cidades");
        const data = await response.json();
        cidades = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

// Função para obter o nome da cidade pelo ID
function getNomeCidade(cidadeId) {
    const cidade = cidades.find(c => c.id === cidadeId);
    return cidade ? cidade.name : "Cidade não encontrada";
}

// Função para carregar os imóveis
async function carregarImoveis() {
    try {
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis");
        const data = await response.json();
        imoveisOriginais = Array.isArray(data) ? data : data.imoveis || [];
        renderizarImoveis(imoveisOriginais, []); // Inicialmente, todos são exibidos como filtrados
    } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
    }
}

// Função para criar o HTML de um card de imóvel
function criarCardImovel(imovel) {
    const imagem = imovel.imagens.length > 0 
        ? imovel.imagens[0] 
        : "https://source.unsplash.com/400x300/?house";

    const detalhesUrl = `http://meuleaditapema.com.br/imovel/index.html?id=${imovel.id}`;
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

// Função para renderizar os imóveis
function renderizarImoveis(imoveisFiltrados, imoveisNaoFiltrados) {
    const imoveisContainer = document.getElementById("imoveis-container");
    if (!imoveisContainer) {
        console.error("Erro: Elemento #imoveis-container não encontrado.");
        return;
    }

    imoveisContainer.innerHTML = ''; // Limpa o container

    // Renderiza os imóveis filtrados
    imoveisFiltrados.forEach(imovel => {
        imoveisContainer.innerHTML += criarCardImovel(imovel);
    });

    // Se houver imóveis não filtrados, adiciona a divisão e os renderiza
    if (imoveisNaoFiltrados.length > 0) {
        const divisor = document.createElement("div");
        divisor.classList.add("resultados-divisor");
        divisor.innerHTML = '<h3>Outros Resultados</h3><hr>';
        imoveisContainer.appendChild(divisor);

        imoveisNaoFiltrados.forEach(imovel => {
            imoveisContainer.innerHTML += criarCardImovel(imovel);
        });
    }
}

// Função para filtrar os imóveis
function filtrarImoveis() {
    const cidadeSelecionada = document.getElementById("dropdown-cidades")?.value || "";
    const precoSelecionado = document.getElementById("dropdown-precos")?.value || "";

    // Filtra os imóveis que atendem aos critérios
    let imoveisFiltrados = [...imoveisOriginais];
    let imoveisNaoFiltrados = [];

    if (cidadeSelecionada || precoSelecionado) {
        imoveisFiltrados = imoveisOriginais.filter(imovel => {
            let matchCidade = true;
            let matchPreco = true;

            if (cidadeSelecionada) {
                matchCidade = imovel.cidade === parseInt(cidadeSelecionada);
            }

            if (precoSelecionado) {
                const [min, max] = precoSelecionado.split('-').map(Number);
                const valor = parseFloat(imovel.valor);
                matchPreco = max ? (valor >= min && valor <= max) : (valor >= min);
            }

            return matchCidade && matchPreco;
        });

        // Os não filtrados são os que não estão em imoveisFiltrados
        imoveisNaoFiltrados = imoveisOriginais.filter(imovel => 
            !imoveisFiltrados.some(filtrado => filtrado.id === imovel.id)
        );
    } else {
        // Sem filtros, todos são "filtrados" e não há "outros"
        imoveisFiltrados = [...imoveisOriginais];
        imoveisNaoFiltrados = [];
    }

    renderizarImoveis(imoveisFiltrados, imoveisNaoFiltrados);
}

// Função para garantir que o container de filtros exista
function garantirFiltrosContainer() {
    let filtrosContainer = document.getElementById("filtros-imoveis");
    if (!filtrosContainer) {
        filtrosContainer = document.createElement("div");
        filtrosContainer.id = "filtros-imoveis";
        filtrosContainer.classList.add("container");
        const imoveisContainer = document.getElementById("imoveis-container");
        if (imoveisContainer && imoveisContainer.parentNode) {
            imoveisContainer.parentNode.insertBefore(filtrosContainer, imoveisContainer);
        } else {
            document.querySelector(".main-content")?.appendChild(filtrosContainer) || document.body.appendChild(filtrosContainer);
        }
    }
    return filtrosContainer;
}

// Função para exibir o dropdown de cidades
async function exibirDropdownCidades() {
    const filtrosContainer = garantirFiltrosContainer();

    const existente = document.getElementById("dropdown-cidades");
    if (existente) {
        existente.remove();
    }

    try {
        if (cidades.length === 0) {
            await carregarCidades();
        }

        const select = document.createElement("select");
        select.id = "dropdown-cidades";
        select.onchange = filtrarImoveis;

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione uma cidade...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        cidades.forEach(cidade => {
            const option = document.createElement("option");
            option.value = cidade.id;
            option.textContent = cidade.name;
            select.appendChild(option);
        });

        filtrosContainer.appendChild(select);
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

// Função para exibir o dropdown de preços
function exibirDropdownPrecos() {
    const filtrosContainer = garantirFiltrosContainer();

    const existente = document.getElementById("dropdown-precos");
    if (existente) {
        existente.remove();
    }

    const select = document.createElement("select");
    select.id = "dropdown-precos";
    select.onchange = filtrarImoveis;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "FILTRO IMÓVEIS";
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

    filtrosContainer.appendChild(select);
}

















// Variáveis globais
let leadsOriginais = [];
let paginaAtual = 1;
const itensPorPagina = 20;
let totalLeads = 0;

// Função para criar o HTML de um card de lead
function criarCardLead(cliente) {
    const padrao = cliente.categoria === 1 ? "Médio Padrão" : 
                   cliente.categoria === 2 ? "Alto Padrão" : 
                   "Padrão não especificado";

    // Formatar valor_lead como moeda brasileira (ex.: 39,90)
    const valorLeadFormatado = parseFloat(cliente.valor_lead || 0).toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });

    return `
        <div class="card-cliente">
            <h2>${cliente.nome}</h2>
            <p><strong>Interesse:</strong> ${cliente.interesse}</p>
            <p><strong>Tipo:</strong> ${cliente.tipo_imovel}</p>
            <p><strong>Padrão:</strong> ${padrao}</p>
            <p><strong>Valor desejado:</strong> R$ ${cliente.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p><strong>WhatsApp:</strong> ${cliente.whatsapp}</p>
            <button class="btn-detalhes" onclick="window.location.href='cliente.html?id=${cliente.id}'">
                Comprar por ${valorLeadFormatado}
            </button>
        </div>
    `;
}
// Função para renderizar os leads com paginação
function renderizarLeads(leadsFiltrados) {
    const clientesContainer = document.getElementById("clientes-container");
    if (!clientesContainer) {
        console.error("Erro: Elemento #clientes-container não encontrado.");
        return;
    }

    // Preservar ou criar o elemento de filtros
    let filtrosDiv = document.querySelector(".filtros-leads");
    if (!filtrosDiv) {
        filtrosDiv = document.createElement("div");
        filtrosDiv.classList.add("filtros-leads");
        filtrosDiv.innerHTML = `<h2>Filtros</h2>`;
        clientesContainer.appendChild(filtrosDiv);
        exibirDropdownPadraoLeads();
        exibirDropdownValoresLeads();
        exibirDropdownOrdenacaoLeads();
    }

    // Remover elementos existentes (exceto filtros)
    const existingElements = clientesContainer.querySelectorAll(".contagem-leads, .card-cliente, .outros-resultados, .paginacao");
    existingElements.forEach(element => element.remove());

    // Adicionar contagem de leads filtrados
    const contagemDiv = document.createElement("div");
    contagemDiv.classList.add("contagem-leads");
    contagemDiv.innerHTML = `<p><strong>Leads encontrados:</strong> ${leadsFiltrados.length} de ${totalLeads} (Página ${paginaAtual})</p>`;
    clientesContainer.insertAdjacentElement('beforeend', contagemDiv);

    // Adicionar os cards dos leads filtrados
    leadsFiltrados.forEach(cliente => {
        clientesContainer.insertAdjacentHTML('beforeend', criarCardLead(cliente));
    });

    // Adicionar controles de paginação
    const paginacaoDiv = document.createElement("div");
    paginacaoDiv.classList.add("paginacao");
    const totalPaginas = Math.ceil(totalLeads / itensPorPagina);

    paginacaoDiv.innerHTML = `
        <button id="prev-page" ${paginaAtual === 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${paginaAtual} de ${totalPaginas}</span>
        <button id="next-page" ${paginaAtual === totalPaginas ? "disabled" : ""}>Próximo</button>
    `;
    clientesContainer.insertAdjacentElement('beforeend', paginacaoDiv);

    // Adicionar eventos aos botões de paginação
    document.getElementById("prev-page")?.addEventListener("click", () => {
        if (paginaAtual > 1) {
            paginaAtual--;
            carregarClientesPaginados();
        }
    });
    document.getElementById("next-page")?.addEventListener("click", () => {
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            carregarClientesPaginados();
        }
    });
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

        // Calcular offset baseado na página atual
        const offset = (paginaAtual - 1) * itensPorPagina;

        // Montar URL com parâmetros de paginação e filtros
        const url = new URL("https://pedepro-meulead.6a7cul.easypanel.host/list-clientes");
        url.searchParams.set("limit", itensPorPagina);
        url.searchParams.set("offset", offset);

        // Adicionar filtros à URL
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

        // Requisição à API
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao carregar clientes");

        leadsOriginais = data.clientes || [];
        totalLeads = data.total || 0;

        // Os dados já vêm filtrados e ordenados do servidor
        renderizarLeads(leadsOriginais);
    } catch (error) {
        console.error("Erro ao carregar clientes paginados:", error);
    }
}

// Função para carregar os clientes (leads) inicialmente
async function carregarClientes() {
    paginaAtual = 1; // Resetar para a primeira página
    await carregarClientesPaginados();
}








// Função para carregar imóveis afiliados
async function carregaraImoveis() {
    try {
        const container = document.getElementById("meus-imoveis-container");
        if (!container) {
            console.error("Erro: Elemento #meus-imoveis-container não encontrado.");
            return;
        }

        // Ocultar outros containers
        document.getElementById("imoveis-container").style.display = "none";
        document.getElementById("clientes-container").style.display = "none";
        document.getElementById("meus-leads").style.display = "none";

        // Exibir o container de imóveis afiliados
        container.style.display = "block";
        container.innerHTML = "";

        // Remover os filtros existentes
        const filtrosContainer = document.getElementById("filtros-imoveis");
        if (filtrosContainer) {
            filtrosContainer.style.display = "none"; // Oculta os filtros
            // Ou, se preferir remover completamente: filtrosContainer.innerHTML = "";
        }

        const titulo = document.createElement("h2");
        titulo.textContent = "Imóveis que me afiliei";
        titulo.style.marginBottom = "15px";
        titulo.style.marginLeft = "15px";
        titulo.style.color = "#555555";
        container.appendChild(titulo);

        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/1");
        const data = await response.json();
        const imoveis = Array.isArray(data) ? data : data.imoveis || [];

        if (imoveis.length === 0) {
            container.innerHTML += "<p>Nenhum imóvel encontrado.</p>";
            return;
        }

        imoveis.forEach(imovel => {
            const card = document.createElement("div");
            card.classList.add("card");

            const imagem = imovel.imagens.length > 0 
                ? imovel.imagens[0] 
                : "https://source.unsplash.com/400x300/?house";

            const detalhesUrl = `http://meuleaditapema.com.br/imovel/index.html?id=${imovel.id}`;
            const phone = imovel.whatsapp.replace(/\D/g, '');
            const mensagem = `Olá ${imovel.nome_proprietario}`;
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;

            const formatarTexto = (quantidade, singular, plural) => 
                `${quantidade} ${quantidade === 1 ? singular : plural}`;

            const nomeCidade = getNomeCidade(imovel.cidade);

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
                <h2>${imovel.texto_principal}</h2>
                <p><strong>${nomeCidade} - ${imovel.estado}</strong></p>
                <p>${imovel.descricao}</p>
                <h2>${parseFloat(imovel.valor).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })}</h2>
                <button class="btn-detalhes" onclick="window.location.href='${whatsappUrl}'">
                    Conversar com o Proprietário
                </button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
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

        const titulo = document.createElement("h2");
        titulo.textContent = "Leads adquiridos";
        titulo.style.marginBottom = "15px";
        titulo.style.marginLeft = "15px";
        titulo.style.color = "#555555";
        meusLeadsContainer.appendChild(titulo);

        leads.forEach(lead => {
            const card = document.createElement("div");
            card.classList.add("card-cliente");

            card.innerHTML = `
                <h2>${lead.nome}</h2>
                <p><strong>Interesse:</strong> ${lead.interesse}</p>
                <p><strong>Tipo:</strong> ${lead.tipo_imovel}</p>
                <p><strong>Valor desejado:</strong> R$ ${lead.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p><strong>WhatsApp:</strong> ${lead.whatsapp}</p>
                <button class="btn-detalhes" onclick="window.location.href='cliente.html?id=${lead.id}'">
                    Ver Detalhes
                </button>
            `;
            meusLeadsContainer.appendChild(card);
        });
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


// Único evento DOMContentLoaded para inicialização
document.addEventListener("DOMContentLoaded", async function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const imoveisLink = document.getElementById("imoveis-link");
    const clientesLink = document.getElementById("clientes-link");
    const meusImoveisLink = document.getElementById("meusimoveis-link");
    const meusLeadsLink = document.getElementById("meusleads-link");
    const userInfoContainer = document.getElementById("user-info-container");
    const imoveisContainer = document.getElementById("imoveis-container");

    let clientesContainer = document.getElementById("clientes-container");
    if (!clientesContainer) {
        clientesContainer = document.createElement("div");
        clientesContainer.id = "clientes-container";
        clientesContainer.classList.add("container");
        clientesContainer.style.display = "none";
        document.querySelector(".main-content")?.appendChild(clientesContainer) || document.body.appendChild(clientesContainer);
    }

    const meusImoveisContainer = document.getElementById("meus-imoveis-container");
    const meusLeadsContainer = document.getElementById("meus-leads");

    // Função auxiliar para mostrar/esconder filtros
    function gerenciarFiltros(visivel) {
        const filtrosContainer = document.getElementById("filtros-imoveis");
        if (filtrosContainer) {
            filtrosContainer.style.display = visivel ? "block" : "none";
        }
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });
    }

    if (imoveisLink) {
        imoveisLink.addEventListener("click", async function () {
            sidebar.classList.remove("open");
            imoveisContainer.style.display = "flex";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "none";
            meusLeadsContainer.style.display = "none";
            
            // Mostrar filtros
            gerenciarFiltros(true);
            await carregarImoveis();
            await exibirDropdownCidades();
            exibirDropdownPrecos();
        });
    }

    if (clientesLink) {
        clientesLink.addEventListener("click", function () {
            sidebar.classList.remove("open");
            clientesContainer.style.display = "flex";
            imoveisContainer.style.display = "none";
            meusImoveisContainer.style.display = "none";
            meusLeadsContainer.style.display = "none";
            
            // Esconder filtros
            gerenciarFiltros(false);
            carregarClientes();
        });
    }

    if (meusImoveisLink) {
        meusImoveisLink.addEventListener("click", function () {
            sidebar.classList.remove("open");
            imoveisContainer.style.display = "none";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "block";
            meusLeadsContainer.style.display = "none";
            
            // Esconder filtros
            gerenciarFiltros(false);
            carregaraImoveis();
        });
    }

    if (meusLeadsLink) {
        meusLeadsLink.addEventListener("click", function () {
            sidebar.classList.remove("open");
            imoveisContainer.style.display = "none";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "none";
            meusLeadsContainer.style.display = "block";
            
            // Esconder filtros
            gerenciarFiltros(false);
            carregarLeadsAdquiridos(1);
        });
    }

    if (userInfoContainer) {
        userInfoContainer.addEventListener("click", function () {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            window.location.href = "/login";
        });
    }

    // Inicialização padrão (com filtros visíveis)
    await carregarCidades();
    await carregarImoveis();
    await exibirDropdownCidades();
    exibirDropdownPrecos();
    gerenciarFiltros(true); // Garante que os filtros estejam visíveis ao carregar a página
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