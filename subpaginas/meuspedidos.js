function inicializarMeusPedidos() {
    // Resetar variáveis globais
    window.meusPedidosOriginais = [];
    window.paginaMeusPedidosAtual = 1;
    window.itensPorPaginaMeusPedidos = 6;
    window.totalMeusPedidos = 0;

    // Função para criar o card de pedido
    function criarCardPedido(pedido) {
        const formatarData = (data) => new Date(data).toLocaleDateString('pt-BR');
        const formatarMoeda = (valor) => parseFloat(valor || 0).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL', 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });

        const pago = pedido.pago;
        const entregue = pedido.entregue;
        const statusPagamentoTexto = pago ? 'Pago' : 'Não Pago';
        const statusPagamentoClass = pago ? 'pago' : 'nao-pago';
        const statusEntregaTexto = entregue ? 'Entregue' : 'Não Entregue';
        const statusEntregaClass = entregue ? 'entregue' : 'nao-entregue';
        const botaoTexto = pago ? 'Ver Fatura' : 'Pagar Agora';
        const botaoClass = pago ? '' : 'pagar-agora';

        return `
            <div class="card-pedido" onclick="mostrarDetalhesPedido(${pedido.id})">
                <h2>Pedido #${pedido.id}</h2>
                <p><strong>Total:</strong> ${formatarMoeda(pedido.total_value)}</p>
                <p><strong>Data:</strong> ${formatarData(pedido.created_at)}</p>
                <p><span class="status ${statusPagamentoClass}">${statusPagamentoTexto}</span></p>
                <p><span class="status ${statusEntregaClass}">${statusEntregaTexto}</span></p>
                <button class="btn-fatura ${botaoClass}" onclick="event.stopPropagation(); window.open('${pedido.invoiceurl || '#'}', '_blank')">${botaoTexto}</button>
            </div>
        `;
    }

    // Função para criar o conteúdo do modal
    function criarConteudoModal(pedido) {
        const formatarMoeda = (valor) => parseFloat(valor || 0).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL', 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });

        const pago = pedido.pago;
        const entregue = pedido.entregue;

        let conteudoImoveis = '';
        let conteudoClientes = '';

        if (!pago || !entregue) {
            // Informações limitadas para pedidos pendentes
            conteudoImoveis = pedido.imoveis.map(imovel => `
                <div class="item">
                    <p><strong>${imovel.texto_principal}</strong> (${imovel.tipo})</p>
                    <p>Categoria: ${imovel.categoria === 1 ? 'Médio Padrão' : 'Alto Padrão'}</p>
                    <p>Valor: ${formatarMoeda(imovel.valor)}</p>
                    <p>Preço Contato: ${formatarMoeda(imovel.price_contato)}</p>
                </div>
            `).join('');

            conteudoClientes = pedido.clientes.map(cliente => `
                <div class="item">
                    <p><strong>${cliente.titulo}</strong> (ID: ${cliente.id})</p>
                    <p>Interesse: ${cliente.interesse}</p>
                    <p>Valor: ${formatarMoeda(cliente.valor)}</p>
                    <p>Valor Lead: ${cliente.valor_lead ? formatarMoeda(cliente.valor_lead) : 'N/A'}</p>
                </div>
            `).join('');
        } else {
            // Informações completas para pedidos pagos/entregues
            conteudoImoveis = pedido.imoveis.map(imovel => `
                <div class="item">
                    <p><strong>${imovel.texto_principal}</strong> (${imovel.tipo})</p>
                    <p>Valor: ${formatarMoeda(imovel.valor)}</p>
                    <p>Endereço: ${imovel.endereco}</p>
                    <p>Descrição: ${imovel.descricao}</p>
                </div>
            `).join('');

            conteudoClientes = pedido.clientes.map(cliente => `
                <div class="item">
                    <p><strong>${cliente.nome}</strong> (ID: ${cliente.id})</p>
                    <p>Interesse: ${cliente.interesse}</p>
                    <p>WhatsApp: ${cliente.whatsapp}</p>
                    <p>Endereço: ${cliente.endereco}</p>
                </div>
            `).join('');
        }

        return `
            <div class="modal-content">
                <span class="modal-close" onclick="fecharModal()">×</span>
                <h3>Detalhes do Pedido #${pedido.id}</h3>
                <p><strong>Status Pagamento:</strong> <span class="status ${pago ? 'pago' : 'nao-pago'}">${pago ? 'Pago' : 'Não Pago'}</span></p>
                <p><strong>Status Entrega:</strong> <span class="status ${entregue ? 'entregue' : 'nao-entregue'}">${entregue ? 'Entregue' : 'Não Entregue'}</span></p>
                <div class="section">
                    <h4>Imóveis Adquiridos</h4>
                    ${conteudoImoveis || '<p>Nenhum imóvel neste pedido</p>'}
                </div>
                <div class="section">
                    <h4>Leads Adquiridos</h4>
                    ${conteudoClientes || '<p>Nenhum cliente neste pedido</p>'}
                </div>
            </div>
        `;
    }

    // Função para mostrar o modal com detalhes
    window.mostrarDetalhesPedido = function(pedidoId) {
        const pedido = window.meusPedidosOriginais.find(p => p.id === pedidoId);
        if (!pedido) return;

        const modal = document.getElementById('pedido-modal');
        modal.innerHTML = criarConteudoModal(pedido);
        modal.classList.add('active');

        // Fechar ao clicar fora do conteúdo
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fecharModal();
        });
    };

    // Função para fechar o modal
    window.fecharModal = function() {
        const modal = document.getElementById('pedido-modal');
        modal.classList.remove('active');
    };

    // Função para renderizar os pedidos
    function renderizarMeusPedidos(pedidosFiltrados) {
        const meusPedidosContainer = document.getElementById("meus-pedidos-container");
        if (!meusPedidosContainer) return;

        meusPedidosContainer.innerHTML = '';

        if (pedidosFiltrados.length === 0 && window.totalMeusPedidos === 0) {
            meusPedidosContainer.innerHTML = '<p class="nenhum-resultado">Nenhum pedido encontrado.</p>';
        } else {
            pedidosFiltrados.forEach(pedido => {
                meusPedidosContainer.innerHTML += criarCardPedido(pedido);
            });
        }

        criarPaginacaoMeusPedidos(window.totalMeusPedidos);
    }

    // Função para criar a paginação
    function criarPaginacaoMeusPedidos(totalPedidos) {
        const totalPaginas = Math.ceil(totalPedidos / window.itensPorPaginaMeusPedidos);
        const paginacaoContainer = document.getElementById("paginacao-meus-pedidos");
        if (!paginacaoContainer) return;

        paginacaoContainer.innerHTML = '';

        const paginationWrapper = document.createElement("div");
        paginationWrapper.className = "paginacao-meus-pedidos-wrapper";

        const setaEsquerda = document.createElement("i");
        setaEsquerda.className = "material-icons paginacao-meus-pedidos-seta";
        setaEsquerda.textContent = "chevron_left";
        setaEsquerda.onclick = () => {
            if (window.paginaMeusPedidosAtual > 1) {
                window.paginaMeusPedidosAtual--;
                carregarMeusPedidos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaEsquerda);

        const paginaTexto = document.createElement("span");
        paginaTexto.className = "paginacao-meus-pedidos-texto";
        paginaTexto.textContent = `Página ${window.paginaMeusPedidosAtual} de ${totalPaginas || 1}`;
        paginationWrapper.appendChild(paginaTexto);

        const setaDireita = document.createElement("i");
        setaDireita.className = "material-icons paginacao-meus-pedidos-seta";
        setaDireita.textContent = "chevron_right";
        setaDireita.onclick = () => {
            if (window.paginaMeusPedidosAtual < totalPaginas) {
                window.paginaMeusPedidosAtual++;
                carregarMeusPedidos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaDireita);

        paginacaoContainer.appendChild(paginationWrapper);

        setaEsquerda.style.opacity = window.paginaMeusPedidosAtual === 1 ? '0.5' : '1';
        setaEsquerda.style.cursor = window.paginaMeusPedidosAtual === 1 ? 'not-allowed' : 'pointer';
        setaDireita.style.opacity = window.paginaMeusPedidosAtual === totalPaginas ? '0.5' : '1';
        setaDireita.style.cursor = window.paginaMeusPedidosAtual === totalPaginas ? 'not-allowed' : 'pointer';
    }

    // Função para carregar os pedidos do corretor logado
    async function carregarMeusPedidos() {
        const meusPedidosContainer = document.getElementById("meus-pedidos-container");
        if (!meusPedidosContainer) {
            console.error("Erro: Elemento #meus-pedidos-container não encontrado.");
            return;
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.error("Erro: userId não encontrado no localStorage.");
            meusPedidosContainer.innerHTML = "<p>Erro: Usuário não identificado. Faça login novamente.</p>";
            window.location.href = window.location.pathname; // Recarrega limpando parâmetros
            return;
        }

        const offset = (window.paginaMeusPedidosAtual - 1) * window.itensPorPaginaMeusPedidos;
        const url = `https://pedepro-meulead.6a7cul.easypanel.host/list-pedidos/${userId}?limit=${window.itensPorPaginaMeusPedidos}&offset=${offset}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error("Erro de acesso: Usuário não autorizado.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    window.location.href = window.location.pathname; // Recarrega limpando parâmetros
                    return;
                }
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success) {
                window.meusPedidosOriginais = data.pedidos || [];
                window.totalMeusPedidos = data.total || 0;
                renderizarMeusPedidos(window.meusPedidosOriginais);
                window.dispatchEvent(new Event("carregamentoCompleto"));
            } else {
                console.warn("Nenhum pedido encontrado:", data.message);
                window.meusPedidosOriginais = [];
                window.totalMeusPedidos = 0;
                renderizarMeusPedidos([]);
                window.dispatchEvent(new Event("carregamentoCompleto"));
            }
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            meusPedidosContainer.innerHTML = "<p>Erro ao carregar os pedidos. Tente novamente mais tarde.</p>";
            window.meusPedidosOriginais = [];
            window.totalMeusPedidos = 0;
            renderizarMeusPedidos([]);
            window.dispatchEvent(new Event("carregamentoCompleto"));
        }
    }

    // Inicialização da seção
    carregarMeusPedidos();
}

// Chama a função de inicialização
inicializarMeusPedidos();