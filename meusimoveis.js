// Função principal que reseta e inicializa a seção de "Meus Imóveis"
function inicializarMeusImoveis() {
    // Resetar variáveis globais
    window.meusImoveisOriginais = [];
    window.paginaMeusImoveisAtual = 1;
    window.itensPorPaginaMeusImoveis = 6; // Consistente com outras seções
    window.totalMeusImoveis = 0;

    // Função para criar o card de imóvel
    function criarCardImovel(imovel) {
        const imagemObj = imovel.imagem;
        const imagem = imagemObj && imagemObj.url 
            ? imagemObj.url 
            : "https://cloud.meuleaditapema.com.br/uploads/7607cc83-a6c4-4e8f-8a19-c19b14625b4e.png";

        const phone = imovel.whatsapp ? imovel.whatsapp.replace(/\D/g, '') : '';
        const mensagem = `Olá ${imovel.nome_proprietario || 'Proprietário'}`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;

        const formatarTexto = (quantidade, singular, plural) => 
            `${quantidade} ${quantidade === 1 ? singular : plural}`;

        const nomeCidade = imovel.cidade || 'Cidade não informada'; // Simplificado, sem função getNomeCidade

        const origemTexto = imovel.origem === 'comprado' ? 'Comprado' : 
                           imovel.origem === 'afiliado' ? 'Apenas Afiliado' : 
                           'Comprado e Afiliado';

        const botaoAcao = imovel.origem === 'afiliado' 
            ? `<button class="btn-remove-affiliation" onclick="mostrarPopupRemover(${imovel.id})">Remover Afiliação</button>`
            : `<button class="btn-detalhes" onclick="window.location.href='${whatsappUrl}'">Conversar com o Proprietário</button>`;

        return `
            <div class="card">
                <div class="image-container">
                    <img src="${imagem}" alt="Imóvel">
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
                <h2>${imovel.texto_principal || 'Imóvel sem título'}</h2>
                <p><strong>${nomeCidade} - ${imovel.estado || ''}</strong></p>
                <p>${imovel.descricao || 'Sem descrição'}</p>
                <h2>${parseFloat(imovel.valor || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })}</h2>
                <p><em>${origemTexto}</em></p>
                ${botaoAcao}
            </div>
        `;
    }

    // Função para renderizar os imóveis
    function renderizarMeusImoveis(imoveisFiltrados) {
        const meusImoveisContainer = document.getElementById("meus-imoveis-container");
        if (!meusImoveisContainer) return;

        meusImoveisContainer.innerHTML = '';

        if (imoveisFiltrados.length === 0 && window.totalMeusImoveis === 0) {
            meusImoveisContainer.innerHTML = '<p class="nenhum-resultado">Nenhum imóvel encontrado.</p>';
        } else {
            imoveisFiltrados.forEach(imovel => {
                meusImoveisContainer.innerHTML += criarCardImovel(imovel);
            });
        }

        criarPaginacaoMeusImoveis(window.totalMeusImoveis);
    }

    // Função para criar a paginação
    function criarPaginacaoMeusImoveis(totalImoveis) {
        const totalPaginas = Math.ceil(totalImoveis / window.itensPorPaginaMeusImoveis);
        const paginacaoContainer = document.getElementById("paginacao-meus-imoveis");
        if (!paginacaoContainer) return;

        paginacaoContainer.innerHTML = '';

        const paginationWrapper = document.createElement("div");
        paginationWrapper.className = "paginacao-meus-imoveis-wrapper";

        const setaEsquerda = document.createElement("i");
        setaEsquerda.className = "material-icons paginacao-meus-imoveis-seta paginacao-meus-imoveis-seta-esquerda";
        setaEsquerda.textContent = "chevron_left";
        setaEsquerda.onclick = () => {
            if (window.paginaMeusImoveisAtual > 1) {
                window.paginaMeusImoveisAtual--;
                carregarMeusImoveis();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaEsquerda);

        const paginaTexto = document.createElement("span");
        paginaTexto.className = "paginacao-meus-imoveis-texto";
        paginaTexto.textContent = `Página ${window.paginaMeusImoveisAtual} de ${totalPaginas || 1}`;
        paginationWrapper.appendChild(paginaTexto);

        const setaDireita = document.createElement("i");
        setaDireita.className = "material-icons paginacao-meus-imoveis-seta paginacao-meus-imoveis-seta-direita";
        setaDireita.textContent = "chevron_right";
        setaDireita.onclick = () => {
            if (window.paginaMeusImoveisAtual < totalPaginas) {
                window.paginaMeusImoveisAtual++;
                carregarMeusImoveis();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationWrapper.appendChild(setaDireita);

        paginacaoContainer.appendChild(paginationWrapper);

        setaEsquerda.style.opacity = window.paginaMeusImoveisAtual === 1 ? '0.5' : '1';
        setaEsquerda.style.cursor = window.paginaMeusImoveisAtual === 1 ? 'not-allowed' : 'pointer';
        setaDireita.style.opacity = window.paginaMeusImoveisAtual === totalPaginas ? '0.5' : '1';
        setaDireita.style.cursor = window.paginaMeusImoveisAtual === totalPaginas ? 'not-allowed' : 'pointer';
    }

    // Função para carregar os imóveis do corretor logado
    async function carregarMeusImoveis() {
        const meusImoveisContainer = document.getElementById("meus-imoveis-container");
        if (!meusImoveisContainer) {
            console.error("Erro: Elemento #meus-imoveis-container não encontrado.");
            return;
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.error("Erro: userId não encontrado no localStorage.");
            meusImoveisContainer.innerHTML = "<p>Erro: Usuário não identificado. Faça login novamente.</p>";
            return;
        }

        const offset = (window.paginaMeusImoveisAtual - 1) * window.itensPorPaginaMeusImoveis;
        const url = `https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/${userId}?limit=${window.itensPorPaginaMeusImoveis}&offset=${offset}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
            const data = await response.json();

            if (data.success) {
                window.meusImoveisOriginais = data.imoveis || [];
                window.totalMeusImoveis = data.total || 0;
                renderizarMeusImoveis(window.meusImoveisOriginais);
            } else {
                console.warn("Nenhum imóvel encontrado:", data.message);
                window.meusImoveisOriginais = [];
                window.totalMeusImoveis = 0;
                renderizarMeusImoveis([]);
            }
        } catch (error) {
            console.error("Erro ao carregar imóveis:", error);
            meusImoveisContainer.innerHTML = "<p>Erro ao carregar os imóveis. Tente novamente mais tarde.</p>";
            window.meusImoveisOriginais = [];
            window.totalMeusImoveis = 0;
            renderizarMeusImoveis([]);
        }
    }

    // Função para mostrar o popup de confirmação
    window.mostrarPopupRemover = function(imovelId) {
        const popup = document.createElement("div");
        popup.classList.add("affiliation-popup");
        popup.innerHTML = `
            <div class="affiliation-popup-content">
                <h3>Confirmar Remoção</h3>
                <p>Deseja realmente remover a afiliação deste imóvel?</p>
                <button class="affiliation-confirm-btn" onclick="removerAfiliacao(${imovelId})">Confirmar</button>
                <button class="affiliation-cancel-btn" onclick="this.parentElement.parentElement.remove()">Cancelar</button>
            </div>
        `;
        document.body.appendChild(popup);
    };

    // Função para remover a afiliação
    window.removerAfiliacao = async function(imovelId) {
        try {
            const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/remover-afiliacao/1/${imovelId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                alert("Afiliação removida com sucesso!");
                document.querySelector(".affiliation-popup").remove();
                carregarMeusImoveis();
            } else {
                alert("Erro ao remover afiliação: " + data.message);
            }
        } catch (error) {
            console.error("Erro ao remover afiliação:", error);
            alert("Erro ao remover afiliação.");
        }
    };

    // Inicialização da seção
    carregarMeusImoveis();
}

// Chama a função de inicialização sempre que a seção for acessada
inicializarMeusImoveis();