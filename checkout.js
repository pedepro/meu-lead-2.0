window.renderizarCheckout = async function(leadId, padrao, valorFormatado) {
    console.log("Lead ID recebido em renderizarCheckout:", leadId);
    let lead = {};

    try {
        const url = `https://pedepro-meulead.6a7cul.easypanel.host/clientes/${leadId}`;
        console.log("Requisição para:", url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
        const data = await response.json();
        console.log("Resposta da API:", data);
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
            const filteredLeads = data.clientes.filter(lead => lead.id !== leadId);
            filteredLeads.forEach(lead => {
                const valorLead = parseFloat(lead.valor_lead || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                });
                const valorInteresse = parseFloat(lead.valor || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                }); // Formatando o campo 'valor' no padrão brasileiro
                const miniCard = document.createElement("div");
                miniCard.className = `mini-lead-card ${padrao}`;
                miniCard.innerHTML = `
                    <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
                    <div class="lead-sku">SKU ${lead.id}</div>
                    <div class="lead-interesse">${lead.titulo || "N/A"}</div>
                    <div class="lead-interesse"> Até ${valorInteresse}</div>
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

// Função para confirmar a compra
function confirmarCompra(leadId) {
    const selectedLeads = window.selectedLeads || [leadId];
    console.log("Leads a comprar:", selectedLeads);
    alert(`Compra confirmada para os leads: ${selectedLeads.join(", ")}. Redirecionando para o checkout...`);
    document.querySelector(".checkout-overlay").remove();
    inicializarLeads();
}