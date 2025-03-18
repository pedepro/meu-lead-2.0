// Função principal que reseta e inicializa a seção de leads
function inicializarLeads() {
    // Resetar variáveis globais
    window.leadsOriginais = [];
    window.paginaAtual = 1;
    window.totalLeads = 0;
    window.itensPorPagina = 6; // Constante, mas redefinida para garantir

    // Função para criar o card de lead
    function criarCardLead(cliente) {
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

        return `
            <div class="lead-card ${padrao}">
                <div class="lead-card-header">
                    <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
                    <div class="lead-titulo">${cliente.titulo}</div>
                    <div class="lead-interesse">${cliente.interesse || "Interesse não especificado"}</div>
                    <i class="material-icons lead-icon">${icon}</i>
                    <div class="lead-sku">SKU ${cliente.id}</div>
                </div>
                <div class="lead-card-footer">
                    <button class="lead-btn-adquirir" onclick="mostrarCheckout(${cliente.id}, '${padrao}', '${valorFormatado}')">
                        Obter por ${valorFormatado}
                    </button>
                </div>
            </div>
        `;
    }

    // Função para renderizar os leads
    function renderizarLeads(leadsFiltrados) {
        const clientesContainer = document.getElementById("clientes-container");
        if (!clientesContainer) return;

        clientesContainer.innerHTML = '';

        if (leadsFiltrados.length === 0 && window.totalLeads === 0) {
            clientesContainer.innerHTML = '<p class="nenhum-resultado">Nenhum lead encontrado para os filtros aplicados.</p>';
        } else {
            leadsFiltrados.forEach(cliente => {
                clientesContainer.innerHTML += criarCardLead(cliente);
            });
        }

        criarPaginacaoLeads(window.totalLeads);
    }

    // Função para criar a paginação
    function criarPaginacaoLeads(totalLeads) {
        const totalPaginas = Math.ceil(totalLeads / window.itensPorPagina);
        const paginacaoContainer = document.getElementById("paginacao-leads");
        if (!paginacaoContainer) return;

        paginacaoContainer.innerHTML = '';

        const paginationWrapper = document.createElement("div");
        paginationWrapper.className = "paginacao-leads-wrapper";

        const setaEsquerda = document.createElement("i");
        setaEsquerda.className = "material-icons paginacao-leads-seta paginacao-leads-seta-esquerda";
        setaEsquerda.textContent = "chevron_left";
        setaEsquerda.onclick = () => {
            if (window.paginaAtual > 1) {
                window.paginaAtual--;
                carregarClientesPaginados();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaEsquerda);

        const paginaTexto = document.createElement("span");
        paginaTexto.className = "paginacao-leads-texto";
        paginaTexto.textContent = `Página ${window.paginaAtual} de ${totalPaginas || 1}`;
        paginationWrapper.appendChild(paginaTexto);

        const setaDireita = document.createElement("i");
        setaDireita.className = "material-icons paginacao-leads-seta paginacao-leads-seta-direita";
        setaDireita.textContent = "chevron_right";
        setaDireita.onclick = () => {
            if (window.paginaAtual < totalPaginas) {
                window.paginaAtual++;
                carregarClientesPaginados();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaDireita);

        paginacaoContainer.appendChild(paginationWrapper);

        setaEsquerda.style.opacity = window.paginaAtual === 1 ? '0.5' : '1';
        setaEsquerda.style.cursor = window.paginaAtual === 1 ? 'not-allowed' : 'pointer';
        setaDireita.style.opacity = window.paginaAtual === totalPaginas ? '0.5' : '1';
        setaDireita.style.cursor = window.paginaAtual === totalPaginas ? 'not-allowed' : 'pointer';
    }

    // Função para carregar clientes paginados com filtros e ordenação
    async function carregarClientesPaginados() {
        const padraoSelecionado = document.getElementById("dropdown-padrao-leads")?.value || "";
        const valorInteresseSelecionado = document.getElementById("dropdown-valores-leads")?.value || "";
        const ordenacaoSelecionada = document.getElementById("dropdown-ordenacao-leads")?.value || "";

        const offset = (window.paginaAtual - 1) * window.itensPorPagina;
        const url = new URL("https://pedepro-meulead.6a7cul.easypanel.host/list-clientes");
        url.searchParams.set("limit", window.itensPorPagina);
        url.searchParams.set("offset", offset);

        if (padraoSelecionado) url.searchParams.set("categoria", padraoSelecionado);
        if (valorInteresseSelecionado) {
            const [min, max] = valorInteresseSelecionado.split('-').map(Number);
            url.searchParams.set("valor_min", min);
            if (max) url.searchParams.set("valor_max", max);
        }
        if (ordenacaoSelecionada) url.searchParams.set("ordenacao", ordenacaoSelecionada);

        console.log("Requisição para:", url.toString());

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
            const data = await response.json();

            if (data.clientes && Array.isArray(data.clientes)) {
                window.leadsOriginais = data.clientes;
                window.totalLeads = data.total || 0;
                renderizarLeads(window.leadsOriginais);
            } else {
                console.warn("Nenhum lead encontrado:", data);
                window.leadsOriginais = [];
                window.totalLeads = 0;
                renderizarLeads([]);
            }
        } catch (error) {
            console.error("Erro ao carregar clientes paginados:", error);
            window.leadsOriginais = [];
            window.totalLeads = 0;
            renderizarLeads([]);
        }
    }

    // Função para carregar dinamicamente CSS e JS do checkout
    async function carregarRecursosCheckout() {
        // Carregar CSS se ainda não foi carregado
        if (!document.getElementById("checkout-css")) {
            const link = document.createElement("link");
            link.id = "checkout-css";
            link.rel = "stylesheet";
            link.href = "checkout.css"; // Ajuste o caminho conforme sua estrutura
            document.head.appendChild(link);
            await new Promise(resolve => link.onload = resolve);
        }

        // Carregar JS se ainda não foi carregado
        if (!document.getElementById("checkout-js")) {
            const script = document.createElement("script");
            script.id = "checkout-js";
            script.src = "checkout.js"; // Ajuste o caminho conforme sua estrutura
            document.body.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }
    }

    // Função para mostrar o checkout
    window.mostrarCheckout = async function(leadId, padrao, valorFormatado) {
        // Carregar recursos dinamicamente antes de mostrar o checkout
        await carregarRecursosCheckout();

        // Verificar se as funções estão disponíveis após o carregamento
        if (typeof window.renderizarCheckout === "function") {
            window.renderizarCheckout(leadId, padrao, valorFormatado);
        } else {
            console.error("Erro: Função renderizarCheckout não encontrada após carregar checkout.js");
        }
    };

    // Inicialização da seção
    carregarClientesPaginados().then(() => {
        document.querySelectorAll(".filtros-leads select").forEach(select => {
            select.removeEventListener("change", atualizarFiltros);
            select.addEventListener("change", atualizarFiltros);
        });
    });

    function atualizarFiltros() {
        window.paginaAtual = 1;
        carregarClientesPaginados();
    }
}

// Chama a função de inicialização sempre que a seção for acessada
inicializarLeads();