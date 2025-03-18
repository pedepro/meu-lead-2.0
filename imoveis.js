// Função principal que reseta e inicializa a seção de imóveis
function inicializarImoveis() {
    // Resetar variáveis globais
    window.imoveisOriginais = [];
    window.cidades = [];
    window.imoveisPorPagina = 6;
    window.paginaImoveisAtual = 1;
    window.totalImoveis = 0;

    // Função para carregar as cidades da API
    async function carregarCidades() {
        try {
            const response = await fetch("https://backand.meuleaditapema.com.br/cidades");
            const data = await response.json();
            window.cidades = Array.isArray(data) ? data : [];
            preencherDropdownCidades();
        } catch (error) {
            console.error("Erro ao carregar cidades:", error);
            window.cidades = [];
        }
    }

    // Função para preencher o dropdown de cidades
    function preencherDropdownCidades() {
        const dropdownCidades = document.getElementById("dropdown-cidades");
        if (!dropdownCidades) return;
        dropdownCidades.innerHTML = '<option value="">Todas as cidades</option>'; // Reset para evitar duplicatas
        window.cidades.forEach(cidade => {
            const option = document.createElement("option");
            option.value = cidade.id;
            option.textContent = cidade.name;
            dropdownCidades.appendChild(option);
        });
    }

    // Função para obter o nome da cidade pelo ID
    function getNomeCidade(cidadeId) {
        const cidade = window.cidades.find(c => c.id === parseInt(cidadeId));
        return cidade ? cidade.name : "Cidade não encontrada";
    }

    // Função para criar o card de cada imóvel
    function criarCardImovel(imovel) {
        const imagemObj = imovel.imagem;
        const imagem = imagemObj && imagemObj.url 
            ? imagemObj.url 
            : "assets/icon.ico";

        const detalhesUrl = `https://imovel.meuleaditapema.com.br/${imovel.id}`;
        const padrao = imovel.categoria === 1 ? "Médio Padrão" : 
                      imovel.categoria === 2 ? "Alto Padrão" : 
                      "Padrão não especificado";
        const nomeCidade = getNomeCidade(imovel.cidade);

        const formatarTexto = (quantidade, singular, plural) => 
            `${quantidade} ${quantidade === 1 ? singular : plural}`;

        return `
            <div class="card">
                <div class="image-container">
                    <img src="${imagem}" alt="Imóvel">
                    <div class="padrao-label">${padrao}</div>
                    <div class="overlay">
                        <div class="overlay-item">
                            <i class="material-icons">king_bed</i>
                            <span>${formatarTexto(imovel.quartos || 0, "quarto", "quartos")}</span>
                        </div>
                        <div class="overlay-item">
                            <i class="material-icons">directions_car</i>
                            <span>${formatarTexto(imovel.vagas_garagem || 0, "vaga", "vagas")}</span>
                        </div>
                        <div class="overlay-item">
                            <i class="material-icons">square_foot</i>
                            <span>${imovel.metros_quadrados || 0}m²</span>
                        </div>
                    </div>
                </div>
                <h2>${imovel.texto_principal || "Imóvel sem título"}</h2>
                <p><strong>${nomeCidade} - ${imovel.estado || ""}</strong></p>
                <p>${imovel.descricao || "Sem descrição"}</p>
                <h2>${parseFloat(imovel.valor || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })}</h2>
                <button class="btn-detalhes" onclick="window.location.href='${detalhesUrl}'">
                    Ver Detalhes
                </button>
            </div>
        `;
    }

    // Função para renderizar os imóveis
    function renderizarImoveis(imoveis) {
        const imoveisContainer = document.getElementById("imoveis-container");
        if (!imoveisContainer) return;

        imoveisContainer.innerHTML = '';

        if (imoveis.length === 0 && window.totalImoveis === 0) {
            imoveisContainer.innerHTML = '<p class="nenhum-resultado">Nenhum resultado encontrado para os filtros aplicados.</p>';
        } else {
            imoveis.forEach(imovel => {
                imoveisContainer.innerHTML += criarCardImovel(imovel);
            });
        }

        // Log para verificar o estilo do grid
        const computedStyle = window.getComputedStyle(imoveisContainer);
        console.log("Estilo do .imoveis-container:", {
            display: computedStyle.display,
            gridTemplateColumns: computedStyle.gridTemplateColumns
        });

        criarPaginacaoImoveis(window.totalImoveis);
    }

    // Função para criar a paginação
    function criarPaginacaoImoveis(totalImoveis) {
        const totalPaginas = Math.ceil(totalImoveis / window.imoveisPorPagina);
        const paginacaoContainer = document.getElementById("paginacao-imoveis");
        if (!paginacaoContainer) return;

        paginacaoContainer.innerHTML = '';

        const paginationWrapper = document.createElement("div");
        paginationWrapper.className = "paginacao-imoveis-wrapper";

        const setaEsquerda = document.createElement("i");
        setaEsquerda.className = "material-icons paginacao-imoveis-seta paginacao-imoveis-seta-esquerda";
        setaEsquerda.textContent = "chevron_left";
        setaEsquerda.onclick = () => {
            if (window.paginaImoveisAtual > 1) {
                window.paginaImoveisAtual--;
                filtrarImoveis();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaEsquerda);

        const paginaTexto = document.createElement("span");
        paginaTexto.className = "paginacao-imoveis-texto";
        paginaTexto.textContent = `Página ${window.paginaImoveisAtual} de ${totalPaginas || 1}`;
        paginationWrapper.appendChild(paginaTexto);

        const setaDireita = document.createElement("i");
        setaDireita.className = "material-icons paginacao-imoveis-seta paginacao-imoveis-seta-direita";
        setaDireita.textContent = "chevron_right";
        setaDireita.onclick = () => {
            if (window.paginaImoveisAtual < totalPaginas) {
                window.paginaImoveisAtual++;
                filtrarImoveis();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaDireita);

        paginacaoContainer.appendChild(paginationWrapper);

        setaEsquerda.style.opacity = window.paginaImoveisAtual === 1 ? '0.5' : '1';
        setaEsquerda.style.cursor = window.paginaImoveisAtual === 1 ? 'not-allowed' : 'pointer';
        setaDireita.style.opacity = window.paginaImoveisAtual === totalPaginas ? '0.5' : '1';
        setaDireita.style.cursor = window.paginaImoveisAtual === totalPaginas ? 'not-allowed' : 'pointer';
    }

    // Função para filtrar imóveis
    async function filtrarImoveis() {
        const cidadeSelecionada = document.getElementById("dropdown-cidades")?.value || "";
        const precoSelecionado = document.getElementById("dropdown-precos")?.value || "";
        const padraoSelecionado = document.getElementById("dropdown-padrao-imoveis")?.value || "";
        const imovelProntoSelecionado = document.getElementById("dropdown-imovel-pronto")?.value || "";
        const mobiliadoSelecionado = document.getElementById("dropdown-mobiliado")?.value || "";

        let url = "https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/disponiveis";
        const params = new URLSearchParams();

        if (cidadeSelecionada) params.append("cidade", cidadeSelecionada);
        if (precoSelecionado) {
            const [min, max] = precoSelecionado.split('-').map(Number);
            params.append("precoMin", min);
            if (max) params.append("precoMax", max);
        }
        if (padraoSelecionado) params.append("categoria", padraoSelecionado);
        if (imovelProntoSelecionado) params.append("imovel_pronto", imovelProntoSelecionado);
        if (mobiliadoSelecionado) params.append("mobiliado", mobiliadoSelecionado);

        params.append("limite", window.imoveisPorPagina);
        params.append("offset", (window.paginaImoveisAtual - 1) * window.imoveisPorPagina);

        if (params.toString()) url += `?${params.toString()}`;

        console.log("Requisição para:", url);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
            const data = await response.json();

            if (data.success) {
                window.imoveisOriginais = data.imoveis || [];
                window.totalImoveis = data.total || 0;
                renderizarImoveis(window.imoveisOriginais);
            } else {
                console.warn("Nenhum imóvel encontrado:", data.message);
                window.imoveisOriginais = [];
                window.totalImoveis = 0;
                renderizarImoveis([]);
            }
        } catch (error) {
            console.error("Erro ao filtrar imóveis:", error);
            window.imoveisOriginais = [];
            window.totalImoveis = 0;
            renderizarImoveis([]);
        }
    }

    // Inicialização da seção
    carregarCidades().then(() => {
        filtrarImoveis().then(() => {
            // Remove listeners antigos para evitar duplicação
            document.querySelectorAll("#filtros-imoveis select").forEach(select => {
                select.removeEventListener("change", atualizarFiltros); // Remove listener anterior, se existir
                select.addEventListener("change", atualizarFiltros);
            });
        });
    });

    function atualizarFiltros() {
        window.paginaImoveisAtual = 1;
        filtrarImoveis();
    }
}

// Chama a função de inicialização sempre que a seção for acessada
inicializarImoveis();