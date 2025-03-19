// Função principal que reseta e inicializa a seção de leads
function inicializarLeads() {
    // Resetar variáveis globais
    window.leadsOriginais = [];
    window.paginaAtual = 1;
    window.totalLeads = 0;
    window.itensPorPagina = 6;

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
                    <button class="lead-btn-adquirir" onclick="verificarLoginAntesCheckout(${cliente.id}, '${padrao}', '${valorFormatado}')">
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
                // Disparar evento de carregamento concluído após sucesso
                window.dispatchEvent(new Event("carregamentoCompleto"));
                console.log("Evento 'carregamentoCompleto' disparado após carregar leads.");
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
        if (!document.getElementById("checkout-css")) {
            const link = document.createElement("link");
            link.id = "checkout-css";
            link.rel = "stylesheet";
            link.href = "checkout.css";
            document.head.appendChild(link);
            await new Promise(resolve => link.onload = resolve);
        }

        if (!document.getElementById("checkout-js")) {
            const script = document.createElement("script");
            script.id = "checkout-js";
            script.src = "checkout.js";
            document.body.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }
    }

    // Função para criar e exibir o popup de login
    function mostrarPopupLogin(leadId, padrao, valorFormatado) {
        const overlay = document.createElement("div");
        overlay.className = "popup-overlay";
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const popup = document.createElement("div");
        popup.className = "popup-content";
        popup.style.cssText = `
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            width: 400px;
            max-width: 90%;
            padding: 20px;
            text-align: center;
            font-family: Arial, sans-serif;
        `;

        popup.innerHTML = `
            <h2 style="font-size: 20px; color: #333; margin-bottom: 15px;">Faça login para continuar</h2>
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                Você precisa estar logado para adquirir este lead.
            </p>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
                <button onclick="window.location.href='/login'" 
                        style="flex: 1; padding: 10px; background: #1877f2; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    Fazer Login
                </button>
                <button onclick="document.body.removeChild(document.querySelector('.popup-overlay')); document.body.style.overflow = 'auto';" 
                        style="flex: 1; padding: 10px; background: #e4e6eb; color: #333; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    Cancelar
                </button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Função para verificar login antes de abrir o checkout
    window.verificarLoginAntesCheckout = async function(leadId, padrao, valorFormatado) {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
            mostrarPopupLogin(leadId, padrao, valorFormatado);
            return;
        }

        try {
            const url = `https://pedepro-meulead.6a7cul.easypanel.host/corretor?id=${userId}&token=${token}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                await carregarRecursosCheckout();
                if (typeof window.renderizarCheckout === "function") {
                    document.body.style.overflow = 'hidden';
                    window.renderizarCheckout(leadId, padrao, valorFormatado);

                    // Usar MutationObserver para detectar remoção do overlay
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (!document.querySelector('.checkout-overlay')) {
                                document.body.style.overflow = 'auto';
                                observer.disconnect(); // Para de observar após restaurar
                            }
                        });
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                } else {
                    console.error("Erro: Função renderizarCheckout não encontrada após carregar checkout.js");
                }
            } else {
                console.log("Credenciais inválidas ou erro na resposta:", data.error);
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                syncLocalStorageToCookies();
                mostrarPopupLogin(leadId, padrao, valorFormatado);
            }
        } catch (error) {
            console.error("Erro ao verificar login no servidor:", error);
            mostrarPopupLogin(leadId, padrao, valorFormatado);
        }
    };

    // Função para sincronizar localStorage com cookies
    function syncLocalStorageToCookies() {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (token) {
            document.cookie = `token=${token}; path=/; domain=.meuleaditapema.com.br; SameSite=Lax`;
        } else {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
        }

        if (userId) {
            document.cookie = `userId=${userId}; path=/; domain=.meuleaditapema.com.br; SameSite=Lax`;
        } else {
            document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
        }
    }

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

inicializarLeads();