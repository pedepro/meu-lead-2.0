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

function criarCardImovel(imovel) {
    const imagens = Array.isArray(imovel.imagens) ? imovel.imagens : []; // Garante que seja um array
    const imagem = imagens.length > 0 
        ? imagens[0] 
        : "assets/icon.ico"; // Usando o icon.ico como imagem padrão

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

// Função para criar paginação específica para imóveis (com scroll ao topo)
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
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave ao topo
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
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave ao topo
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
            paginaImoveisAtual = 1; // Reseta para a primeira página ao mudar o filtro
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
        paginaImoveisAtual = 1; // Reseta para a primeira página ao mudar o filtro
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

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    exibirDropdownCidades();
    exibirDropdownPrecos();
    carregarImoveis();
});












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

// Função para renderizar os leads com paginação (com scroll ao topo)
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
        clientesContainer.appendChild(filtrosDiv);
        exibirDropdownPadraoLeads();
        exibirDropdownValoresLeads();
        exibirDropdownOrdenacaoLeads();
    }

    // Remover elementos existentes (exceto filtros)
    const existingElements = clientesContainer.querySelectorAll(".contagem-leads, .card-cliente, .outros-resultados, .paginacao-leads");
    existingElements.forEach(element => element.remove());

    // Adicionar os cards dos leads filtrados
    leadsFiltrados.forEach(cliente => {
        clientesContainer.insertAdjacentHTML('beforeend', criarCardLead(cliente));
    });

    // Adicionar controles de paginação (igual ao layout dos imóveis)
    const paginacaoDiv = document.createElement("div");
    paginacaoDiv.id = "paginacao-leads"; // ID único para leads
    paginacaoDiv.className = "paginacao-leads";
    const totalPaginas = Math.ceil(totalLeads / itensPorPagina);

    const paginationWrapper = document.createElement("div");
    paginationWrapper.className = "paginacao-leads-wrapper";

    // Botão de seta esquerda (anterior)
    const setaEsquerda = document.createElement("i");
    setaEsquerda.className = "material-icons paginacao-leads-seta paginacao-leads-seta-esquerda";
    setaEsquerda.textContent = "chevron_left";
    setaEsquerda.onclick = () => {
        if (paginaAtual > 1) {
            paginaAtual--;
            carregarClientesPaginados();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave ao topo
        }
    };
    paginationWrapper.appendChild(setaEsquerda);

    // Texto "Página X de Y"
    const paginaTexto = document.createElement("span");
    paginaTexto.className = "paginacao-leads-texto";
    paginaTexto.textContent = `Página ${paginaAtual} de ${totalPaginas || 1}`;
    paginationWrapper.appendChild(paginaTexto);

    // Botão de seta direita (próxima)
    const setaDireita = document.createElement("i");
    setaDireita.className = "material-icons paginacao-leads-seta paginacao-leads-seta-direita";
    setaDireita.textContent = "chevron_right";
    setaDireita.onclick = () => {
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            carregarClientesPaginados();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave ao topo
        }
    };
    paginationWrapper.appendChild(setaDireita);

    paginacaoDiv.appendChild(paginationWrapper);
    clientesContainer.insertAdjacentElement('beforeend', paginacaoDiv);

    // Desativa setas se não houver navegação possível
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

// Inicialização (adicione isso se quiser carregar ao iniciar a página)
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
});








// Função para carregar imóveis afiliados
// Função para carregar imóveis afiliados e comprados
async function carregaraImoveis() {
    try {
        const container = document.getElementById("meus-imoveis-container");
        if (!container) {
            console.error("Erro: Elemento #meus-imoveis-container não encontrado.");
            return;
        }

        // Não mexemos na visibilidade aqui, pois já foi definida no evento de clique
        container.innerHTML = ""; // Limpa o conteúdo antes de adicionar os cards

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

            const imagem = imovel.imagens && imovel.imagens.length > 0 
                ? imovel.imagens[0] 
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
    popup.classList.add("affiliation-popup"); // Classe renomeada
    popup.innerHTML = `
        <div class="affiliation-popup-content"> <!-- Classe renomeada -->
            <h3>Confirmar Remoção</h3>
            <p>Deseja realmente remover a afiliação deste imóvel?</p>
            <button class="affiliation-confirm-btn" onclick="removerAfiliacao(${imovelId})">Confirmar</button> <!-- Classe adicionada -->
            <button class="affiliation-cancel-btn" onclick="this.parentElement.parentElement.remove()">Cancelar</button> <!-- Classe adicionada -->
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
            document.querySelector(".affiliation-popup").remove(); // Classe renomeada
            carregaraImoveis(); // Recarrega a lista
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

    // Garantir que o meus-imoveis-container exista
    let meusImoveisContainer = document.getElementById("meus-imoveis-container");
    if (!meusImoveisContainer) {
        console.warn("Elemento #meus-imoveis-container não encontrado. Criando um novo.");
        meusImoveisContainer = document.createElement("div");
        meusImoveisContainer.id = "meus-imoveis-container";
        meusImoveisContainer.style.display = "none"; // Inicialmente oculto
        document.querySelector(".main-content")?.appendChild(meusImoveisContainer) || document.body.appendChild(meusImoveisContainer);
    }

    const meusLeadsContainer = document.getElementById("meus-leads");

    // Função auxiliar para mostrar/esconder filtros
    function gerenciarFiltros(visivel) {
        const filtrosContainer = document.getElementById("filtros-imoveis");
        if (filtrosContainer) {
            filtrosContainer.style.display = visivel ? "block" : "none";
        }
    }

    // Função auxiliar para gerenciar a visibilidade da paginação de imóveis
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

    // Função para garantir que a paginação de imóveis seja centralizada
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
            imoveisContainer.style.display = "none";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "grid"; // Exibe como grid
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
            imoveisContainer.style.display = "none";
            clientesContainer.style.display = "none";
            meusImoveisContainer.style.display = "none";
            meusLeadsContainer.style.display = "block";
            
            gerenciarFiltros(false);
            gerenciarPaginacaoImoveis(false);
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

    // Inicialização padrão
    await carregarCidades();
    await carregarImoveis();
    await exibirDropdownCidades();
    exibirDropdownPrecos();
    gerenciarFiltros(true);
    gerenciarPaginacaoImoveis(true);
    centralizarPaginacaoImoveis();
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

