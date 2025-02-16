// Variáveis globais
const limite = 5; // Número de itens por página
let paginaAtual = 1; // Página inicial

// Código específico para a seção Pedidos
console.log('Código da seção clientes executado.');

// Chama a função carregarLeads para carregar os leads automaticamente
carregarLeads(paginaAtual);

// Escuta o clique do botão de filtros para carregar os leads
document.getElementById("btnAplicarFiltros").addEventListener("click", () => {
    paginaAtual = 1;  // Resetando a página para 1 quando aplicar o filtro
    carregarLeads(paginaAtual);  // Recarregando os leads com a página 1
});

async function carregarLeads(pagina = 1) {
    try {
        const nome = document.getElementById("searchNome").value.trim();
        const tipoImovel = document.getElementById("tipoImovel").value;
        const valorMax = document.getElementById("valorMax").value;

        let url = new URL("https://pedepro-meulead.6a7cul.easypanel.host/list-clientes");

        if (nome) url.searchParams.append("nome", nome);
        if (tipoImovel) url.searchParams.append("tipo_imovel", tipoImovel);
        if (valorMax) url.searchParams.append("valor_max", valorMax);

        // Adicionando paginação
        const offset = (pagina - 1) * limite;
        url.searchParams.append("limit", limite);
        url.searchParams.append("offset", offset);

        console.log("🔍 Buscando leads na URL:", url.toString());

        const response = await fetch(url);
        const data = await response.json();

        console.log("🔍 Resposta da API:", data);

        if (!data.clientes) {
            console.error("❌ Erro: Nenhum cliente retornado da API!");
            return;
        }

        const leads = Array.isArray(data.clientes) ? data.clientes : [];
        const totalRegistros = data.total || 0;

        console.log("📊 Total de registros:", totalRegistros); // Verifica o valor retornado pela API
        const totalPaginas = Math.ceil(totalRegistros / limite);
        console.log("📊 Total de páginas calculado:", totalPaginas);

        // Verifica se a página atual é maior que o total de páginas e reseta se necessário
        if (pagina > totalPaginas && totalPaginas > 0) {
            paginaAtual = 1; // Resetando para a primeira página se não houver suficientes resultados
            console.log("🔄 Página atual ajustada para a primeira página (página 1)");
        }

        const leadsContainer = document.querySelector(".leads-list");
        if (!leadsContainer) return console.error("❌ Elemento .leads-list não encontrado!");

        leadsContainer.innerHTML = ""; // Limpa a lista antes de adicionar os novos itens

        if (leads.length === 0) {
            leadsContainer.innerHTML = `<p>Nenhum resultado encontrado.</p>`;
            return;
        }

        leads.forEach(lead => {
            const card = document.createElement("div");
            card.classList.add("card-lead");

            card.innerHTML = `
                <div class="lead-status"></div>
                <div class="lead-info">
                    <h3>${lead.nome} - </strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_lead)}</h3>
                    <p><strong>Interesse:</strong> ${lead.interesse}</p>
                    <p><strong>Tipo:</strong> ${lead.tipo_imovel}</p>
                    <p><strong>Limite valor:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor)}</p>

                </div>
                <button class="btn-editar" onclick="openUniqueEditPopup(${lead.id})">Editar</button>
            `;
            leadsContainer.appendChild(card);
        });

        // Atualiza a paginação
        atualizarPaginacao(pagina, totalPaginas);
    } catch (error) {
        console.error("Erro ao carregar os leads:", error);
    }
}

// Função para atualizar os ícones de paginação
function atualizarPaginacao(pagina, totalPaginas) {
    const paginacaoContainer = document.getElementById("pagination");
    paginacaoContainer.innerHTML = ""; 

    const btnAnterior = document.createElement("span");
    btnAnterior.innerHTML = "<i class='material-icons'>arrow_back_ios</i>"; // Ícone de seta para a esquerda
    btnAnterior.style.cursor = pagina === 1 ? "default" : "pointer";
    btnAnterior.style.opacity = pagina === 1 ? "0.5" : "1";
    if (pagina > 1) btnAnterior.onclick = () => carregarLeads(pagina - 1);
    paginacaoContainer.appendChild(btnAnterior);

    const contadorPaginas = document.createElement("span");
    contadorPaginas.innerText = ` Página ${pagina} de ${totalPaginas} `;
    paginacaoContainer.appendChild(contadorPaginas);

    const btnProximo = document.createElement("span");
    btnProximo.innerHTML = "<i class='material-icons'>arrow_forward_ios</i>"; // Ícone de seta para a direita
    btnProximo.style.cursor = pagina === totalPaginas ? "default" : "pointer";
    btnProximo.style.opacity = pagina === totalPaginas ? "0.5" : "1";
    if (pagina < totalPaginas) btnProximo.onclick = () => carregarLeads(pagina + 1);
    paginacaoContainer.appendChild(btnProximo);

    console.log("📊 Atualizando paginação: Página atual:", pagina);
    console.log("📊 Total de páginas:", totalPaginas);
}





// Função para abrir o popup de edição
function openUniqueEditPopup() {
    document.getElementById("uniqueEditPopup").style.display = "flex";
}

// Função para fechar o popup de edição
function closeUniquePopup() {
    document.getElementById("uniqueEditPopup").style.display = "none";
}


// Código específico para a seção Pedidos
console.log('Código da seção clientes executado.');