// Variáveis globais
const limite = 6; // Número de itens por página
let paginaAtual = 1; // Página inicial
let currentLeadId = null; // Armazena o ID do lead em edição

// Carrega os leads ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    carregarLeads(paginaAtual);
    document.getElementById("btnAplicarFiltros").addEventListener("click", () => {
        paginaAtual = 1;
        carregarLeads(paginaAtual);
    });
});

async function carregarLeads(pagina = 1) {
    try {
        const tipoImovel = document.getElementById("tipoImovel").value;
        const precoInteresse = document.getElementById("precoInteresse").value;
        const buscaGeral = document.getElementById("buscaGeral").value.trim();

        let url = new URL("https://pedepro-meulead.6a7cul.easypanel.host/list-clientes");

        // Filtro por tipo de imóvel
        if (tipoImovel) url.searchParams.append("tipo_imovel", tipoImovel);

        // Filtro por intervalo de preço de interesse
        if (precoInteresse) {
            if (precoInteresse.includes("-")) {
                const [min, max] = precoInteresse.split("-").map(Number);
                url.searchParams.append("valor_min", min);
                url.searchParams.append("valor_max", max);
            } else {
                // Caso seja "+ R$ 10.000.000", só define o mínimo
                url.searchParams.append("valor_min", precoInteresse);
            }
        }

        // Filtro de busca geral (nome, id ou valor_lead)
        if (buscaGeral) {
            url.searchParams.append("busca", buscaGeral);
        }

        const offset = (pagina - 1) * limite;
        url.searchParams.append("limit", limite);
        url.searchParams.append("offset", offset);

        const response = await fetch(url);
        const data = await response.json();

        if (!data.clientes) {
            console.error("❌ Erro: Nenhum cliente retornado da API!");
            return;
        }

        const leads = Array.isArray(data.clientes) ? data.clientes : [];
        const totalRegistros = data.total || 0;
        const totalPaginas = Math.ceil(totalRegistros / limite);

        if (pagina > totalPaginas && totalPaginas > 0) {
            paginaAtual = 1;
        }

        const leadsContainer = document.querySelector(".leads-grid");
        leadsContainer.innerHTML = "";

        if (leads.length === 0) {
            leadsContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #666;">Nenhum resultado encontrado.</p>`;
            return;
        }

        leads.forEach(lead => {
            const card = document.createElement("div");
            card.classList.add("card-lead");
            if (lead.categoria === 1 || lead.categoria === "1") {
                card.classList.add("medio-padrao");
            } else if (lead.categoria === 2 || lead.categoria === "2") {
                card.classList.add("alto-padrao");
            }

            const precoInteresseFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor);
            const precoLeadFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_lead);

            card.innerHTML = `
                <div class="lead-info">
                    <h3>${lead.nome} - ${precoInteresseFormatado}</h3>
                    <p><strong>Interesse:</strong> ${lead.interesse}</p>
                    <p><strong>Tipo:</strong> ${lead.tipo_imovel}</p>
                    <p><strong>Preço de Interesse:</strong> ${precoInteresseFormatado}</p>
                    <p><strong>Preço do Lead:</strong> ${precoLeadFormatado}</p>
                    <p><strong>SKU:</strong> ${lead.id}</p>
                    <p><strong>Cotas Compradas:</strong> ${lead.cotas_compradas || 0}</p>
                </div>
                <span class="btn-excluir material-icons" onclick="excluirLead(${lead.id})">delete</span>
                <div class="card-actions">
                    <label class="toggle-disponivel">
                        <input type="checkbox" ${lead.disponivel ? "checked" : ""} 
                            ${lead.cotas_compradas >= 5 ? "disabled" : ""} 
                            onchange="toggleDisponivel(${lead.id}, this.checked)">
                        <span class="slider"></span>
                    </label>
                    <button class="btn-editar" onclick="openUniqueEditPopup(${lead.id})">Editar</button>
                </div>
            `;
            leadsContainer.appendChild(card);
        });

        atualizarPaginacao(pagina, totalPaginas);
    } catch (error) {
        console.error("Erro ao carregar os leads:", error);
    }
}

// Função para atualizar a paginação
function atualizarPaginacao(pagina, totalPaginas) {
    const paginacaoContainer = document.getElementById("pagination");
    paginacaoContainer.innerHTML = "";

    const btnAnterior = document.createElement("span");
    btnAnterior.innerHTML = "<i class='material-icons'>arrow_back_ios</i>";
    btnAnterior.style.cursor = pagina === 1 ? "default" : "pointer";
    btnAnterior.style.opacity = pagina === 1 ? "0.5" : "1";
    if (pagina > 1) btnAnterior.onclick = () => carregarLeads(pagina - 1);
    paginacaoContainer.appendChild(btnAnterior);

    const contadorPaginas = document.createElement("span");
    contadorPaginas.innerText = ` Página ${pagina} de ${totalPaginas} `;
    paginacaoContainer.appendChild(contadorPaginas);

    const btnProximo = document.createElement("span");
    btnProximo.innerHTML = "<i class='material-icons'>arrow_forward_ios</i>";
    btnProximo.style.cursor = pagina === totalPaginas ? "default" : "pointer";
    btnProximo.style.opacity = pagina === totalPaginas ? "0.5" : "1";
    if (pagina < totalPaginas) btnProximo.onclick = () => carregarLeads(pagina + 1);
    paginacaoContainer.appendChild(btnProximo);
}

// Função para excluir lead
async function excluirLead(id) {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;

    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/clientes/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Lead excluído com sucesso!");
            carregarLeads(paginaAtual);
        } else {
            // Lê o corpo da resposta de erro
            const errorData = await response.json();
            console.error("Erro retornado pelo servidor:", errorData);
            alert(`Erro ao excluir o lead: ${errorData.error || "Motivo desconhecido"}`);
        }
    } catch (error) {
        console.error("Erro ao excluir lead:", error);
        alert("Erro ao excluir o lead: Falha na comunicação com o servidor.");
    }
}

// Função para alterar o status "disponível"
async function toggleDisponivel(id, disponivel) {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/clientes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponivel }),
        });

        if (response.ok) {
            alert("Status atualizado com sucesso!");
            carregarLeads(paginaAtual);
        } else {
            alert("Erro ao atualizar o status.");
        }
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar o status.");
    }
}

// Função para abrir o popup (criação ou edição)
function openUniqueEditPopup(id = null) {
    const popup = document.getElementById("uniqueEditPopup");
    const form = document.getElementById("uniqueEditForm");
    const title = document.getElementById("popupTitle");

    currentLeadId = id;

    if (id) {
        title.textContent = "Editar Lead";
        fetch(`https://pedepro-meulead.6a7cul.easypanel.host/clientes/${id}`)
            .then(response => {
                if (!response.ok) throw new Error("Lead não encontrado");
                return response.json();
            })
            .then(data => {
                document.getElementById("leadNome").value = data.nome || "";
                document.getElementById("leadCategoria").value = data.categoria || "";
                document.getElementById("leadEndereco").value = data.endereco || "";
                document.getElementById("leadTipoImovel").value = data.tipo_imovel || "";
                document.getElementById("leadInteresse").value = data.interesse || "";
                document.getElementById("leadValor").value = data.valor || ""; // Preço de Interesse
                document.getElementById("leadValorLead").value = data.valor_lead || ""; // Preço do Lead
                document.getElementById("leadWhatsapp").value = data.whatsapp || "";
            })
            .catch(error => {
                console.error("Erro ao carregar lead:", error);
                alert("Erro ao carregar os dados do lead.");
            });
    } else {
        title.textContent = "Criar Novo Lead";
        form.reset();
    }

    popup.style.display = "flex";
    setTimeout(() => popup.classList.add("active"), 10);
}

// Função para fechar o popup
function closeUniquePopup() {
    const popup = document.getElementById("uniqueEditPopup");
    popup.classList.remove("active");
    setTimeout(() => {
        popup.style.display = "none";
        currentLeadId = null;
    }, 300);
}

// Formatação do WhatsApp
document.getElementById("leadWhatsapp").addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (!value.startsWith("55")) value = "55" + value;
    value = value.slice(0, 13);
    e.target.value = `+${value.slice(0, 2)}${value.slice(2, 4)}${value.slice(4, 9)}-${value.slice(9)}`;
});

// Enviar formulário (criação ou edição)
document.getElementById("uniqueEditForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const leadData = {
        nome: document.getElementById("leadNome").value,
        categoria: document.getElementById("leadCategoria").value,
        endereco: document.getElementById("leadEndereco").value,
        tipo_imovel: document.getElementById("leadTipoImovel").value,
        interesse: document.getElementById("leadInteresse").value,
        valor: parseFloat(document.getElementById("leadValor").value), // Preço de Interesse
        valor_lead: parseFloat(document.getElementById("leadValorLead").value), // Preço do Lead
        whatsapp: document.getElementById("leadWhatsapp").value,
    };

    const isEditing = currentLeadId !== null;
    const url = isEditing
        ? `https://pedepro-meulead.6a7cul.easypanel.host/clientes/${currentLeadId}`
        : "https://pedepro-meulead.6a7cul.easypanel.host/clientes";
    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leadData),
        });

        if (response.ok) {
            closeUniquePopup();
            carregarLeads(paginaAtual);
            alert(`Lead ${isEditing ? "atualizado" : "criado"} com sucesso!`);
        } else {
            const errorData = await response.json();
            console.error("Erro na requisição:", errorData);
            alert(`Erro ao ${isEditing ? "atualizar" : "criar"} o lead: ${errorData.error || "Erro desconhecido"}`);
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert(`Erro ao ${isEditing ? "atualizar" : "criar"} o lead: ${error.message}`);
    }
});


carregarLeads(paginaAtual);