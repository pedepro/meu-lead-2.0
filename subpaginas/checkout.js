window.renderizarCheckout = async function(leadId, padrao, valorFormatado) {
    console.log("Lead ID recebido em renderizarCheckout:", leadId);
    let lead = {};

    try {
        const url = `https://pedepro-meulead.6a7cul.easypanel.host/clientes/${leadId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
        const data = await response.json();
        lead = data || {};
    } catch (error) {
        console.error("Erro ao buscar lead na API:", error);
        if (window.leadsOriginais && Array.isArray(window.leadsOriginais)) {
            console.log("Tentando fallback com window.leadsOriginais:", window.leadsOriginais);
            lead = window.leadsOriginais.find(l => l.id === leadId) || {};
        }
    }

    if (!lead.id) {
        console.warn("Lead não encontrado na API ou em leadsOriginais, usando valores padrão.");
        lead = { id: leadId };
    }

    const overlay = document.createElement("div");
    overlay.className = "checkout-overlay";
    overlay.innerHTML = `
        <div class="checkout-modal">
            <div class="checkout-header">
                <h2>Confirmar Compra de Lead</h2>
                <i class="material-icons close-icon" onclick="this.closest('.checkout-overlay').remove()">close</i>
            </div>
            <div class="checkout-content">
                <div class="lead-info">
                    <div class="lead-interesse">SKU: ${lead.id || "N/A"}</div>
                    <div class="lead-interesse">Título: ${lead.titulo || "Não especificado"}</div>
                    <div class="lead-interesse">Interesse: ${lead.interesse || "Não especificado"}</div>
                    <div class="lead-interesse">Valor do Lead: ${valorFormatado}</div>
                </div>
                <div class="similar-leads">
                    <h3>Leads Semelhantes</h3>
                    <div class="similar-leads-container" id="similar-leads-container"></div>
                </div>
            </div>
            <div class="checkout-footer">
                <div class="total-price">Total: ${valorFormatado}</div>
                <div class="checkout-buttons">
                    <button class="confirm-btn" id="confirm-btn-${leadId}">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    await carregarLeadsSemelhantes(leadId, padrao, valorFormatado, overlay);
};

// Função para carregar leads semelhantes
async function carregarLeadsSemelhantes(leadId, padrao, valorFormatado, overlay) {
    try {
        const categoria = padrao === "alto-padrao" ? 2 : 1;
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-clientes?limit=10&categoria=${categoria}`);
        if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
        const data = await response.json();
        const similarLeadsContainer = overlay.querySelector("#similar-leads-container");
        const totalPriceElement = overlay.querySelector(".total-price");
        let selectedLeads = [leadId];
        let totalPrice = parseFloat(valorFormatado.replace("R$", "").replace(".", "").replace(",", "."));

        if (data.clientes && Array.isArray(data.clientes)) {
            const filteredLeads = data.clientes.filter(lead => String(lead.id) !== String(leadId));
            filteredLeads.forEach(lead => {
                const valorLead = parseFloat(lead.valor_lead || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                });
                const valorInteresse = parseFloat(lead.valor || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                });
                const miniCard = document.createElement("div");
                miniCard.className = `mini-lead-card ${padrao}`;
                miniCard.innerHTML = `
                    <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
                    <div class="lead-sku">SKU ${lead.id}</div>
                    <div class="lead-interesse">${lead.titulo || "N/A"}</div>
                    <div class="lead-interesse">Até ${valorInteresse}</div>
                    <div class="lead-interesse">${valorLead}</div>
                `;
                miniCard.onclick = () => {
                    miniCard.classList.toggle("selected");
                    const leadValue = parseFloat(lead.valor_lead || 0);
                    if (miniCard.classList.contains("selected")) {
                        selectedLeads.push(lead.id);
                        totalPrice += leadValue;
                    } else {
                        selectedLeads = selectedLeads.filter(id => id !== lead.id);
                        totalPrice -= leadValue;
                    }
                    totalPriceElement.textContent = `Total: ${totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
                    window.selectedLeads = selectedLeads;
                };
                similarLeadsContainer.appendChild(miniCard);
            });
        }

        const confirmBtn = overlay.querySelector(`#confirm-btn-${leadId}`);
        confirmBtn.addEventListener("click", () => {
            confirmarCompra(leadId);
        });
    } catch (error) {
        console.error("Erro ao carregar leads semelhantes:", error);
        const similarLeadsContainer = overlay.querySelector("#similar-leads-container");
        similarLeadsContainer.innerHTML = "<p>Erro ao carregar leads semelhantes.</p>";
    }
}

// Função para confirmar a compra com requisição ao servidor
async function confirmarCompra(leadId) {
    const selectedLeads = window.selectedLeads || [leadId];
    console.log("Leads a comprar:", selectedLeads);

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        alert("Faça login para adquirir este lead.");
        window.location.href = `https://meuleaditapema.com.br/login`;
        return;
    }

    try {
        const pedidoData = {
            userId: userId,
            token: token,
            entregue: false,
            pago: false,
            imoveis_id: [],
            leads_id: selectedLeads
        };

        console.log("Enviando pedido para o backend:", pedidoData);

        const response = await fetch('https://backand.meuleaditapema.com.br/criar-pedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar o pedido');
        }

        const result = await response.json();
        console.log("Resposta do backend:", result);

        // Calcula o valor total dos leads selecionados
        const totalPriceElement = document.querySelector(".total-price");
        const totalPriceText = totalPriceElement ? totalPriceElement.textContent.replace("Total: ", "") : "0";
        const totalValue = parseFloat(totalPriceText.replace("R$", "").replace(".", "").replace(",", "."));

        // Envia o evento Purchase ao Facebook Pixel
        if (window.fbq && window.facebookPixelId) {
            window.fbq('track', 'Purchase', {
                value: totalValue,
                currency: 'BRL',
                content_ids: selectedLeads.map(id => `lead_${id}`),
                content_type: 'product'
            });
            console.log('Evento Purchase enviado ao Facebook Pixel:', {
                value: totalValue,
                currency: 'BRL',
                content_ids: selectedLeads.map(id => `lead_${id}`),
                content_type: 'product'
            });
        }

        document.querySelector(".checkout-overlay").remove();

        if (result.success && result.invoiceUrl) {
            window.location.href = result.invoiceUrl;
        } else {
            alert('Pedido criado com sucesso, mas não foi possível redirecionar para o pagamento.');
            inicializarLeads();
        }
    } catch (error) {
        console.error("Erro ao confirmar compra:", error);
        alert(`Erro ao processar a compra: ${error.message}`);
        document.querySelector(".checkout-overlay").remove();
        inicializarLeads();
    }
}