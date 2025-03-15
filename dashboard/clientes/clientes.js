// Variáveis globais
const limite = 6;
let paginaAtual = 1;
let currentLeadId = null;

// Função para exibir notificações
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error("❌ Elemento #notification-container não encontrado no DOM!");
        return;
    }

    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Função para formatar valor em reais
function formatarReais(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (!valor) {
        input.value = '';
        return 0;
    }
    valor = valor.padStart(3, '0'); // Garante pelo menos 3 dígitos (para centavos)
    const centavos = valor.slice(-2);
    const reais = valor.slice(0, -2) || '0';
    const numeroFormatado = Number(reais + '.' + centavos).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    input.value = numeroFormatado;
    return parseFloat(reais + '.' + centavos);
}

// Função customizada para converter número por extenso
function numeroPorExtenso(valor) {
    const unidades = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const onzeADezenove = ['onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    function converterMenorQueMil(num) {
        if (num === 0) return '';
        if (num < 10) return unidades[num];
        if (num < 20) return onzeADezenove[num - 11];
        if (num < 100) {
            const dezena = Math.floor(num / 10);
            const unidade = num % 10;
            return unidade === 0 ? dezenas[dezena - 1] : `${dezenas[dezena - 1]} e ${unidades[unidade]}`;
        }
        const centena = Math.floor(num / 100);
        const resto = num % 100;
        if (num === 100) return 'cem';
        return resto === 0 ? centenas[centena - 1] : `${centenas[centena - 1]} e ${converterMenorQueMil(resto)}`;
    }

    function converterNumero(num) {
        if (num === 0) return 'zero';
        let resultado = '';
        const milhoes = Math.floor(num / 1000000);
        const restoMilhoes = num % 1000000;
        const milhares = Math.floor(restoMilhoes / 1000);
        const resto = restoMilhoes % 1000;

        if (milhoes > 0) {
            resultado += milhoes === 1 ? 'um milhão' : `${converterMenorQueMil(milhoes)} milhões`;
            if (restoMilhoes > 0) resultado += ' ';
        }
        if (milhares > 0) {
            resultado += milhares === 1 ? 'mil' : `${converterMenorQueMil(milhares)} mil`;
            if (resto > 0) resultado += ' ';
        }
        if (resto > 0) {
            resultado += converterMenorQueMil(resto);
        }
        return resultado.trim();
    }

    const reais = Math.floor(valor);
    const centavos = Math.round((valor - reais) * 100);
    let texto = '';

    if (reais > 0) {
        texto += converterNumero(reais) + (reais === 1 ? ' real' : ' reais');
    }
    if (centavos > 0) {
        texto += (reais > 0 ? ' e ' : '') + converterNumero(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
    }
    return texto || 'zero reais';
}

// Função para atualizar valor por extenso
function atualizarValorExtenso(inputId, extensoId) {
    const input = document.getElementById(inputId);
    const extenso = document.getElementById(extensoId);
    let valor = input.value.replace(/\D/g, '');
    if (!valor) {
        extenso.textContent = '';
        return;
    }
    valor = valor.padStart(3, '0');
    const centavos = valor.slice(-2);
    const reais = valor.slice(0, -2) || '0';
    const valorNumerico = parseFloat(reais + '.' + centavos);
    if (isNaN(valorNumerico)) {
        extenso.textContent = '';
        return;
    }
    extenso.textContent = numeroPorExtenso(valorNumerico);
}

// Carrega os leads e verifica leads pendentes ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    carregarLeads(paginaAtual);
    verificarLeadsPendentes();
    document.getElementById("btnAplicarFiltros").addEventListener("click", () => {
        paginaAtual = 1;
        carregarLeads(paginaAtual);
    });
});

// Função para verificar leads pendentes de aprovação criados por IA
async function verificarLeadsPendentes() {
    try {
        console.log("🚀 Iniciando verificação de leads pendentes...");
        const url = new URL("https://backand.meuleaditapema.com.br/list-clientes");
        url.searchParams.append("ai_created", "true");
        url.searchParams.append("aprovado", "false");
        url.searchParams.append("limit", "1");

        console.log("📡 URL da requisição:", url.toString());

        const response = await fetch(url);
        console.log("✅ Resposta recebida. Status:", response.status);

        const data = await response.json();
        console.log("📊 Dados retornados:", data);

        const banner = document.getElementById("pending-ai-banner");
        if (!banner) {
            console.error("❌ Elemento #pending-ai-banner não encontrado no DOM!");
            return;
        }

        console.log("🔢 Total de leads pendentes:", data.total);
        if (data.total > 0) {
            console.log("🔔 Existem leads pendentes! Exibindo banner...");
            banner.style.display = "flex";
        } else {
            console.log("🔕 Nenhum lead pendente encontrado. Ocultando banner...");
            banner.style.display = "none";
        }
    } catch (error) {
        console.error("❌ Erro ao verificar leads pendentes:", error);
    }
}

async function carregarLeads(pagina = 1) {
    try {
        const tipoImovel = document.getElementById("tipoImovel").value;
        const precoInteresse = document.getElementById("precoInteresse").value;
        const buscaGeral = document.getElementById("buscaGeral").value.trim();
        const disponivel = document.getElementById("filtroDisponivel").value;
        const aiCreated = document.getElementById("filtroAICreated").value;
        const aprovado = document.getElementById("filtroAprovado").value;
        const ordenarPor = document.getElementById("ordenarPor").value;

        let url = new URL("https://backand.meuleaditapema.com.br/list-clientes");

        if (tipoImovel) url.searchParams.append("tipo_imovel", tipoImovel);
        if (precoInteresse) {
            if (precoInteresse.includes("-")) {
                const [min, max] = precoInteresse.split("-").map(Number);
                url.searchParams.append("valor_min", min);
                url.searchParams.append("valor_max", max);
            } else {
                url.searchParams.append("valor_min", precoInteresse);
            }
        }
        if (buscaGeral) url.searchParams.append("busca", buscaGeral);
        if (disponivel) url.searchParams.append("disponivel", disponivel);
        if (aiCreated) url.searchParams.append("ai_created", aiCreated);
        if (aprovado) url.searchParams.append("aprovado", aprovado);
        if (ordenarPor) {
            const [campo, direcao] = ordenarPor.split("-");
            url.searchParams.append("order_by", campo);
            url.searchParams.append("order_dir", direcao);
        } else {
            url.searchParams.append("order_by", "created_at");
            url.searchParams.append("order_dir", "desc");
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
        if (!leadsContainer) {
            console.error("❌ Elemento .leads-grid não encontrado no DOM!");
            return;
        }

        leadsContainer.innerHTML = "";

        if (leads.length === 0) {
            leadsContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #666;">Nenhum resultado encontrado.</p>`;
            return;
        }

        const limitText = (text) => {
            if (!text) return '';
            return text.length > 100 ? text.substring(0, 97) + '...' : text;
        };

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

            let aiTag = lead.ai_created ? '<span class="ai-tag">Criado por IA</span>' : '';
            let cotasTag = (lead.cotas_compradas >= 5) ? '<span class="cotas-tag">Cotas Esgotadas</span>' : '';
            let toggleAprovado = lead.ai_created ? `
                <div class="toggle-container">
                    <span class="toggle-label">Aprovado</span>
                    <label class="toggle-aprovado">
                        <input type="checkbox" ${lead.aprovado ? "checked" : ""} 
                            onchange="toggleAprovado(${lead.id}, this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            ` : '';

            card.innerHTML = `
                ${aiTag}
                ${cotasTag}
                <div class="lead-info">
                    <h3>${limitText(lead.titulo || 'Sem título')}</h3>
                    <p><strong>Nome:</strong> ${limitText(lead.nome)}</p>
                    <p><strong>Interesse:</strong> ${limitText(lead.interesse)}</p>
                    <p><strong>Tipo:</strong> ${limitText(lead.tipo_imovel)}</p>
                    <p><strong>Preço de Interesse:</strong> até ${precoInteresseFormatado}</p>
                    <p><strong>Preço do Lead:</strong> ${precoLeadFormatado}</p>
                    <p><strong>SKU:</strong> ${lead.id}</p>
                    <p><strong>Cotas Compradas:</strong> ${lead.cotas_compradas || 0}</p>
                </div>
                <span class="btn-excluir material-icons" onclick="excluirLead(${lead.id})">delete</span>
                <div class="card-actions">
                    <div class="toggle-container">
                        <span class="toggle-label">Disponível</span>
                        <label class="toggle-disponivel">
                            <input type="checkbox" ${lead.disponivel ? "checked" : ""} 
                                ${lead.cotas_compradas >= 5 ? "disabled" : ""} 
                                onchange="toggleDisponivel(${lead.id}, this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    ${toggleAprovado}
                    <div class="toggle-container">
                        <span class="toggle-label">Destaque</span>
                        <label class="toggle-destaque">
                            <input type="checkbox" ${lead.destaque ? "checked" : ""} 
                                onchange="toggleDestaque(${lead.id}, this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
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

function atualizarPaginacao(pagina, totalPaginas) {
    const paginacaoContainer = document.getElementById("pagination");
    if (!paginacaoContainer) {
        console.error("❌ Elemento #pagination não encontrado no DOM!");
        return;
    }

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

async function excluirLead(id) {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;

    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/clientes/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            showNotification("Lead excluído com sucesso!", "success");
            carregarLeads(paginaAtual);
            verificarLeadsPendentes();
        } else {
            const errorData = await response.json();
            console.error("Erro retornado pelo servidor:", errorData);
            showNotification(`Erro ao excluir o lead: ${errorData.error || "Motivo desconhecido"}`, "error");
        }
    } catch (error) {
        console.error("Erro ao excluir lead:", error);
        showNotification("Erro ao excluir o lead: Falha na comunicação com o servidor.", "error");
    }
}

async function toggleDisponivel(id, disponivel) {
    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/clientes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponivel }),
        });

        if (response.ok) {
            showNotification("Status atualizado com sucesso!", "success");
            carregarLeads(paginaAtual);
            verificarLeadsPendentes();
        } else {
            const errorData = await response.json();
            console.error("Erro ao atualizar disponibilidade:", errorData);
            showNotification(`Erro ao atualizar disponibilidade: ${errorData.error || "Motivo desconhecido"}`, "error");
            const toggle = document.querySelector(`input[onchange="toggleDisponivel(${id}, this.checked)"]`);
            if (toggle) toggle.checked = !disponivel;
        }
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        showNotification("Erro ao atualizar o status: Falha na comunicação com o servidor.", "error");
        const toggle = document.querySelector(`input[onchange="toggleDisponivel(${id}, this.checked)"]`);
        if (toggle) toggle.checked = !disponivel;
    }
}

async function toggleAprovado(id, aprovado) {
    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/clientes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aprovado }),
        });

        if (response.ok) {
            showNotification("Status de aprovação atualizado com sucesso!", "success");
            carregarLeads(paginaAtual);
            verificarLeadsPendentes();
        } else {
            const errorData = await response.json();
            console.error("Erro ao atualizar aprovação:", errorData);
            showNotification(`Erro ao atualizar aprovação: ${errorData.error || "Motivo desconhecido"}`, "error");
            const toggle = document.querySelector(`input[onchange="toggleAprovado(${id}, this.checked)"]`);
            if (toggle) toggle.checked = !aprovado;
        }
    } catch (error) {
        console.error("Erro ao atualizar status de aprovação:", error);
        showNotification("Erro ao atualizar o status de aprovação: Falha na comunicação com o servidor.", "error");
        const toggle = document.querySelector(`input[onchange="toggleAprovado(${id}, this.checked)"]`);
        if (toggle) toggle.checked = !aprovado;
    }
}

async function toggleDestaque(id, destaque) {
    try {
        const response = await fetch(`https://backand.meuleaditapema.com.br/clientes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destaque }),
        });

        if (response.ok) {
            showNotification("Status de destaque atualizado com sucesso!", "success");
            carregarLeads(paginaAtual);
        } else {
            const errorData = await response.json();
            console.error("Erro ao atualizar destaque:", errorData);
            showNotification(`Erro ao atualizar destaque: ${errorData.error || "Motivo desconhecido"}`, "error");
            const toggle = document.querySelector(`input[onchange="toggleDestaque(${id}, this.checked)"]`);
            if (toggle) toggle.checked = !destaque;
        }
    } catch (error) {
        console.error("Erro ao atualizar status de destaque:", error);
        showNotification("Erro ao atualizar o status de destaque: Falha na comunicação com o servidor.", "error");
        const toggle = document.querySelector(`input[onchange="toggleDestaque(${id}, this.checked)"]`);
        if (toggle) toggle.checked = !destaque;
    }
}

function openUniqueEditPopup(id = null) {
    const popup = document.getElementById("uniqueEditPopup");
    const form = document.getElementById("uniqueEditForm");
    const title = document.getElementById("popupTitle");

    currentLeadId = id;

    // Remove listeners antigos para evitar duplicação
    const leadValor = document.getElementById("leadValor");
    const leadValorLead = document.getElementById("leadValorLead");
    const newLeadValor = leadValor.cloneNode(true);
    const newLeadValorLead = leadValorLead.cloneNode(true);
    leadValor.parentNode.replaceChild(newLeadValor, leadValor);
    leadValorLead.parentNode.replaceChild(newLeadValorLead, leadValorLead);

    if (id) {
        title.textContent = "Editar Lead";
        fetch(`https://backand.meuleaditapema.com.br/clientes/${id}`)
            .then(response => {
                if (!response.ok) throw new Error("Lead não encontrado");
                return response.json();
            })
            .then(data => {
                document.getElementById("leadTitulo").value = data.titulo || "";
                document.getElementById("leadNome").value = data.nome || "";
                document.getElementById("leadCategoria").value = data.categoria || "";
                document.getElementById("leadEndereco").value = data.endereco || "";
                document.getElementById("leadTipoImovel").value = data.tipo_imovel || "";
                document.getElementById("leadInteresse").value = data.interesse || "";
                newLeadValor.value = data.valor ? Number(data.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
                newLeadValorLead.value = data.valor_lead ? Number(data.valor_lead).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
                document.getElementById("leadWhatsapp").value = data.whatsapp || "";
                atualizarValorExtenso('leadValor', 'leadValorExtenso');
                atualizarValorExtenso('leadValorLead', 'leadValorLeadExtenso');
            })
            .catch(error => {
                console.error("Erro ao carregar lead:", error);
                showNotification("Erro ao carregar os dados do lead.", "error");
            });
    } else {
        title.textContent = "Criar Novo Lead";
        form.reset();
        document.getElementById("leadValorExtenso").textContent = "";
        document.getElementById("leadValorLeadExtenso").textContent = "";
    }

    // Adiciona listeners para formatação e valor por extenso
    newLeadValor.addEventListener('input', () => {
        formatarReais(newLeadValor);
        atualizarValorExtenso('leadValor', 'leadValorExtenso');
    });

    newLeadValorLead.addEventListener('input', () => {
        formatarReais(newLeadValorLead);
        atualizarValorExtenso('leadValorLead', 'leadValorLeadExtenso');
    });

    popup.style.display = "flex";
    setTimeout(() => popup.classList.add("active"), 10);
}

document.getElementById("uniqueEditForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const leadData = {
        titulo: document.getElementById("leadTitulo").value,
        nome: document.getElementById("leadNome").value,
        categoria: document.getElementById("leadCategoria").value,
        endereco: document.getElementById("leadEndereco").value,
        tipo_imovel: document.getElementById("leadTipoImovel").value,
        interesse: document.getElementById("leadInteresse").value,
        valor: parseFloat(document.getElementById("leadValor").value.replace(/\./g, '').replace(',', '.')),
        valor_lead: parseFloat(document.getElementById("leadValorLead").value.replace(/\./g, '').replace(',', '.')),
        whatsapp: document.getElementById("leadWhatsapp").value,
    };

    const isEditing = currentLeadId !== null;
    const url = isEditing
        ? `https://backand.meuleaditapema.com.br/clientes/${currentLeadId}`
        : "https://backand.meuleaditapema.com.br/clientes";
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
            verificarLeadsPendentes();
            showNotification(`Lead ${isEditing ? "atualizado" : "criado"} com sucesso!`, "success");
        } else {
            const errorData = await response.json();
            console.error("Erro na requisição:", errorData);
            showNotification(`Erro ao ${isEditing ? "atualizar" : "criar"} o lead: ${errorData.error || "Erro desconhecido"}`, "error");
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        showNotification(`Erro ao ${isEditing ? "atualizar" : "criar"} o lead: ${error.message}`, "error");
    }
});

function closeUniquePopup() {
    const popup = document.getElementById("uniqueEditPopup");
    popup.classList.remove("active");
    setTimeout(() => popup.style.display = "none", 300);
}

carregarLeads(paginaAtual);
verificarLeadsPendentes();