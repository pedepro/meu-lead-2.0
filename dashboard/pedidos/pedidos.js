let currentPage = 1;
let debounceTimeout = null;
let hasPendingDeliveries = false;

const fetchPedidos = async () => {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const minValue = document.getElementById('minValue').value;
        const maxValue = document.getElementById('maxValue').value;
        const entregue = document.getElementById('entregue').value;
        const pago = document.getElementById('pago').value;
        const comImoveis = document.getElementById('comImoveis').value;
        const comLeads = document.getElementById('comLeads').value;
        const cancelado = document.getElementById('cancelado').value;

        const url = new URL('https://backand.meuleaditapema.com.br/pedidos');
        url.searchParams.append('page', currentPage);
        url.searchParams.append('limit', 10);
        if (startDate) url.searchParams.append('startDate', startDate);
        if (endDate) url.searchParams.append('endDate', endDate);
        if (minValue) url.searchParams.append('minValue', minValue);
        if (maxValue) url.searchParams.append('maxValue', maxValue);
        if (entregue) url.searchParams.append('entregue', entregue);
        if (pago) url.searchParams.append('pago', pago);
        if (comImoveis) url.searchParams.append('comImoveis', comImoveis);
        if (comLeads) url.searchParams.append('comLeads', comLeads);
        if (cancelado) url.searchParams.append('cancelado', cancelado);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();

        renderPedidos(data.data);
        updatePagination(data.pagination);
        updateTotalRegistros(data.pagination.totalItems);
        updatePendingBanner();
    } catch (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        document.getElementById('pedidosList').innerHTML = `
            <p style="padding: 20px; text-align: center; color: #e74c3c;">
                Erro ao carregar pedidos: ${error.message}.
            </p>
        `;
    }
};

const verificarPedidosPendentes = async () => {
    try {
        console.log("🚀 Iniciando verificação de pedidos pendentes...");
        const url = new URL('https://backand.meuleaditapema.com.br/pedidos');
        url.searchParams.append('pago', 'true');
        url.searchParams.append('entregue', 'false');
        url.searchParams.append('limit', '1');

        const response = await fetch(url);
        const data = await response.json();

        hasPendingDeliveries = data.pagination.totalItems > 0;
        updatePendingBanner();
    } catch (error) {
        console.error('❌ Erro ao verificar pedidos pendentes:', error);
    }
};

const updatePendingBanner = () => {
    const banner = document.getElementById('pending-delivery-banner');
    if (!banner) {
        console.error('❌ Elemento #pending-delivery-banner não encontrado no DOM!');
        return;
    }

    if (hasPendingDeliveries) {
        console.log("🔔 Existem pedidos pendentes! Exibindo banner...");
        banner.style.display = 'flex';
    } else {
        console.log("🔕 Nenhum pedido pendente encontrado. Ocultando banner...");
        banner.style.display = 'none';
    }
};

const renderPedidos = (pedidos) => {
    const list = document.getElementById('pedidosList');
    list.innerHTML = list.querySelector('.table-header').outerHTML;

    if (!pedidos || pedidos.length === 0) {
        list.innerHTML += '<p style="padding: 20px; text-align: center;">Nenhum pedido encontrado.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        console.log(`Renderizando pedido ID: ${pedido.id}, Cancelado: ${pedido.cancelado}`);
        const row = document.createElement('div');
        row.className = `pedido-row ${pedido.cancelado ? 'cancelado' : ''}`;
        row.dataset.imoveis = JSON.stringify(pedido.imoveis || []);
        row.dataset.clientes = JSON.stringify(pedido.clientes || []);
        row.dataset.pago = pedido.pago;
        row.dataset.cancelado = pedido.cancelado;
        row.innerHTML = `
            <span>${pedido.id}</span>
            <span>${new Date(pedido.created_at).toLocaleDateString()}</span>
            <span>${pedido.total_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            <span>${pedido.entregue ? 'Sim' : 'Não'}</span>
            <span>${pedido.pago ? 'Sim' : 'Não'}</span>
            <span>
                <span class="action-icon details-icon" data-id="${pedido.id}"><i data-feather="eye"></i></span>
                <span class="action-icon cancel-icon" data-id="${pedido.id}" ${pedido.cancelado ? 'disabled' : ''}><i data-feather="x-circle"></i></span>
            </span>
        `;
        list.appendChild(row);
    });

    feather.replace(); // Inicializa os ícones Feather
    setupDetailsListeners();
    setupCancelListeners();
};

const updatePagination = (pagination) => {
    const pageInfo = document.getElementById('pageInfo');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');

    pageInfo.textContent = `Página ${pagination.currentPage} de ${pagination.totalPages}`;
    prevPage.className = pagination.hasPrevious ? '' : 'disabled';
    nextPage.className = pagination.hasNext ? '' : 'disabled';
};

const updateTotalRegistros = (totalItems) => {
    const totalRegistros = document.getElementById('totalRegistros');
    if (totalRegistros) {
        totalRegistros.textContent = `Total de pedidos encontrados: ${totalItems}`;
    }
};

const openCancelModal = (pedidoId) => {
    const pedidoRow = Array.from(document.querySelectorAll('.pedido-row')).find(row => 
        row.querySelector(`.cancel-icon[data-id="${pedidoId}"]`)
    );
    const isPago = pedidoRow.dataset.pago === 'true';

    document.getElementById('cancelPedidoId').textContent = pedidoId;
    document.getElementById('cancelAndRefund').style.display = isPago ? 'inline-block' : 'none';

    const modal = document.getElementById('cancelModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);

    document.getElementById('cancelOnly').onclick = () => cancelPedido(pedidoId, false);
    document.getElementById('cancelAndRefund').onclick = () => cancelPedido(pedidoId, true);
};

const closeCancelModal = () => {
    const modal = document.getElementById('cancelModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
};

const cancelPedido = async (pedidoId, refund) => {
    try {
        const response = await fetch('https://backand.meuleaditapema.com.br/pedidos/cancelar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId, refund })
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        console.log(`✅ Pedido ${pedidoId} cancelado${refund ? ' e valor devolvido' : ''}`);
        closeCancelModal();
        fetchPedidos();
        verificarPedidosPendentes();
    } catch (error) {
        console.error('❌ Erro ao cancelar pedido:', error);
        alert('Erro ao cancelar pedido. Veja o console para detalhes.');
    }
};

const setupCancelListeners = () => {
    document.querySelectorAll('.cancel-icon:not(:disabled)').forEach(icon => {
        icon.addEventListener('click', () => openCancelModal(icon.dataset.id));
    });
};

const setupDetailsListeners = () => {
    document.querySelectorAll('.details-icon').forEach(icon => {
        icon.addEventListener('click', () => openDetailsModal(icon.dataset.id));
    });
};

const openDetailsModal = (pedidoId) => {
    const pedido = Array.from(document.querySelectorAll('.pedido-row')).find(row => 
        row.querySelector(`.details-icon[data-id="${pedidoId}"]`)
    );
    const pedidoData = {
        id: pedido.children[0].textContent,
        imoveis: JSON.parse(pedido.dataset.imoveis || '[]'),
        clientes: JSON.parse(pedido.dataset.clientes || '[]')
    };

    let conteudoImoveis = pedidoData.imoveis.length ? pedidoData.imoveis.map(imovel => `
        <div class="item">
            <p><strong>${imovel.texto_principal || 'Imóvel'}</strong> (${imovel.tipo || 'N/A'})</p>
            <p>Valor: ${imovel.valor ? imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}</p>
            <p>Endereço: ${imovel.endereco || 'N/A'}</p>
            <p>Descrição: ${imovel.descricao || 'N/A'}</p>
        </div>
    `).join('') : '<p>Nenhum imóvel adquirido.</p>';

    let conteudoClientes = pedidoData.clientes.length ? pedidoData.clientes.map(cliente => `
        <div class="item">
            <p><strong>${cliente.nome || 'Desconhecido'}</strong> (ID: ${cliente.id})</p>
            <p>Interesse: ${cliente.interesse || 'N/A'}</p>
            <p>WhatsApp: ${cliente.whatsapp || 'N/A'}</p>
            <p>Endereço: ${cliente.endereco || 'N/A'}</p>
        </div>
    `).join('') : '<p>Nenhum lead adquirido.</p>';

    document.getElementById('modalContent').innerHTML = `
        <div class="section">
            <h4>Imóveis Adquiridos</h4>
            ${conteudoImoveis}
        </div>
        <div class="section">
            <h4>Leads Adquiridos</h4>
            ${conteudoClientes}
        </div>
    `;
    const modal = document.getElementById('detailsModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
};

const closeDetailsModal = () => {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
};

const setupEventListeners = () => {
    const inputs = ['startDate', 'endDate', 'minValue', 'maxValue', 'entregue', 'pago', 'comImoveis', 'comLeads', 'cancelado'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    currentPage = 1;
                    fetchPedidos();
                }, 300);
            });
        }
    });

    const prevPage = document.getElementById('prevPage');
    if (prevPage) {
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchPedidos();
            }
        });
    }

    const nextPage = document.getElementById('nextPage');
    if (nextPage) {
        nextPage.addEventListener('click', () => {
            currentPage++;
            fetchPedidos();
        });
    }

    const closeModal = document.getElementById('closeCancelModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeCancelModal);
    }

    const closeDetails = document.getElementById('closeModal');
    if (closeDetails) {
        closeDetails.addEventListener('click', closeDetailsModal);
    }
};

const initPedidos = () => {
    setupEventListeners();
    fetchPedidos();
    verificarPedidosPendentes();
    feather.replace(); // Inicializa os ícones Feather após carregar
};

if (document.getElementById('pedidosList')) {
    initPedidos();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initPedidos };
}