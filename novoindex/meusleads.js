// Função principal que reseta e inicializa a seção de "Meus Leads"
function inicializarMeusLeads() {
    // Resetar variáveis globais
    window.meusLeadsOriginais = [];
    window.paginaMeusLeadsAtual = 1;
    window.itensPorPaginaMeusLeads = 6; // Consistente com outras seções
    window.totalMeusLeads = 0;

    // Função para criar o card de lead
    function criarCardLead(lead) {
        const padrao = lead.categoria === 1 ? "medio-padrao" : 
                      lead.categoria === 2 ? "alto-padrao" : 
                      "medio-padrao";
        const icon = lead.categoria === 2 ? "star" : "home";

        return `
            <div class="lead-card ${padrao}">
                <div class="lead-card-header">
                    <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
                    <div class="lead-titulo">${lead.titulo}</div>
                    <div class="lead-interesse">Nome: ${lead.nome || "Não informado"}</div>
                    <div class="lead-interesse">Interesse: ${lead.interesse || "Não especificado"}</div>
                    <div class="lead-interesse">Tipo: ${lead.tipo_imovel || "Não informado"}</div>
                    <div class="lead-interesse">Valor: ${parseFloat(lead.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <div class="lead-interesse">WhatsApp: ${lead.whatsapp || "Não informado"}</div>
                    <i class="material-icons lead-icon">${icon}</i>
                    <div class="lead-sku">SKU ${lead.id}</div>
                </div>
                <div class="lead-card-footer">
                    <button class="lead-btn-adquirir" onclick="window.location.href='cliente.html?id=${lead.id}'">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
    }

    // Função para renderizar os leads
    function renderizarMeusLeads(leadsFiltrados) {
        const meusLeadsContainer = document.getElementById("meus-leads-container");
        if (!meusLeadsContainer) return;

        meusLeadsContainer.innerHTML = '';

        if (leadsFiltrados.length === 0 && window.totalMeusLeads === 0) {
            meusLeadsContainer.innerHTML = '<p class="nenhum-resultado">Nenhum lead adquirido encontrado.</p>';
        } else {
            leadsFiltrados.forEach(lead => {
                meusLeadsContainer.innerHTML += criarCardLead(lead);
            });
        }

        criarPaginacaoMeusLeads(window.totalMeusLeads);
    }

    // Função para criar a paginação
    function criarPaginacaoMeusLeads(totalLeads) {
        const totalPaginas = Math.ceil(totalLeads / window.itensPorPaginaMeusLeads);
        const paginacaoContainer = document.getElementById("paginacao-meus-leads");
        if (!paginacaoContainer) return;

        paginacaoContainer.innerHTML = '';

        const paginationWrapper = document.createElement("div");
        paginationWrapper.className = "paginacao-meus-leads-wrapper";

        const setaEsquerda = document.createElement("i");
        setaEsquerda.className = "material-icons paginacao-meus-leads-seta paginacao-meus-leads-seta-esquerda";
        setaEsquerda.textContent = "chevron_left";
        setaEsquerda.onclick = () => {
            if (window.paginaMeusLeadsAtual > 1) {
                window.paginaMeusLeadsAtual--;
                carregarLeadsAdquiridos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaEsquerda);

        const paginaTexto = document.createElement("span");
        paginaTexto.className = "paginacao-meus-leads-texto";
        paginaTexto.textContent = `Página ${window.paginaMeusLeadsAtual} de ${totalPaginas || 1}`;
        paginationWrapper.appendChild(paginaTexto);

        const setaDireita = document.createElement("i");
        setaDireita.className = "material-icons paginacao-meus-leads-seta paginacao-meus-leads-seta-direita";
        setaDireita.textContent = "chevron_right";
        setaDireita.onclick = () => {
            if (window.paginaMeusLeadsAtual < totalPaginas) {
                window.paginaMeusLeadsAtual++;
                carregarLeadsAdquiridos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaDireita);

        paginacaoContainer.appendChild(paginationWrapper);

        setaEsquerda.style.opacity = window.paginaMeusLeadsAtual === 1 ? '0.5' : '1';
        setaEsquerda.style.cursor = window.paginaMeusLeadsAtual === 1 ? 'not-allowed' : 'pointer';
        setaDireita.style.opacity = window.paginaMeusLeadsAtual === totalPaginas ? '0.5' : '1';
        setaDireita.style.cursor = window.paginaMeusLeadsAtual === totalPaginas ? 'not-allowed' : 'pointer';
    }

    // Função para carregar os leads adquiridos do corretor logado
    async function carregarLeadsAdquiridos() {
        const meusLeadsContainer = document.getElementById("meus-leads-container");
        if (!meusLeadsContainer) {
            console.error("Erro: Elemento #meus-leads-container não encontrado.");
            return;
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.error("Erro: userId não encontrado no localStorage.");
            meusLeadsContainer.innerHTML = "<p>Erro: Usuário não identificado. Faça login novamente.</p>";
            return;
        }

        const offset = (window.paginaMeusLeadsAtual - 1) * window.itensPorPaginaMeusLeads;
        const url = `https://pedepro-meulead.6a7cul.easypanel.host/list-clientes/${userId}?limit=${window.itensPorPaginaMeusLeads}&offset=${offset}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
            const data = await response.json();

            if (Array.isArray(data.clientes)) {
                window.meusLeadsOriginais = data.clientes;
                window.totalMeusLeads = data.total || 0;
                renderizarMeusLeads(window.meusLeadsOriginais);
            } else {
                console.warn("Nenhum lead adquirido encontrado:", data);
                window.meusLeadsOriginais = [];
                window.totalMeusLeads = 0;
                renderizarMeusLeads([]);
            }
        } catch (error) {
            console.error("Erro ao carregar leads adquiridos:", error);
            meusLeadsContainer.innerHTML = "<p>Erro ao carregar os leads. Tente novamente mais tarde.</p>";
            window.meusLeadsOriginais = [];
            window.totalMeusLeads = 0;
            renderizarMeusLeads([]);
        }
    }

    // Inicialização da seção
    carregarLeadsAdquiridos();
}

// Chama a função de inicialização sempre que a seção for acessada
inicializarMeusLeads();