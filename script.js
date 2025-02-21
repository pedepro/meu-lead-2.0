document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const imoveisLink = document.getElementById("imoveis-link");
    const clientesLink = document.getElementById("clientes-link");
    const imoveisContainer = document.getElementById("imoveis-container");

    let clientesContainer = document.getElementById("clientes-container");

    if (!clientesContainer) {
        clientesContainer = document.createElement("div"); // Criando container para clientes
        clientesContainer.id = "clientes-container";
        clientesContainer.classList.add("container");
        clientesContainer.style.display = "none"; // Inicialmente escondido
        document.querySelector(".main-content").appendChild(clientesContainer);
    }

    // Alternar visibilidade do sidebar
    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });

    // Fechar sidebar ao clicar em "Imóveis"
    imoveisLink.addEventListener("click", function () {
        sidebar.classList.remove("open");
        imoveisContainer.style.display = "flex"; // Exibir imóveis
        clientesContainer.style.display = "none"; // Esconder clientes

        // Esconde o container dos leads adquiridos
        const meusLeadsContainer = document.getElementById("meus-leads");
        if (meusLeadsContainer) {
            meusLeadsContainer.style.display = "none";
            meusLeadsContainer.innerHTML = ""; // Limpa o conteúdo
        }
    });

    // Alternar para exibição de clientes ao clicar em "Leads (Clientes)"
    clientesLink.addEventListener("click", function () {
        sidebar.classList.remove("open");
        clientesContainer.style.display = "flex"; // Exibir clientes
        imoveisContainer.style.display = "none";    // Esconder imóveis (container principal)

        // Esconde o container dos imóveis afiliados (meus-imoveis-container)
        const meusImoveisContainer = document.getElementById("meus-imoveis-container");
        if (meusImoveisContainer) {
            meusImoveisContainer.style.display = "none";
        }

        // Esconde o container dos leads adquiridos
        const meusLeadsContainer = document.getElementById("meus-leads");
        if (meusLeadsContainer) {
            meusLeadsContainer.style.display = "none";
            meusLeadsContainer.innerHTML = ""; // Limpa o conteúdo
        }

        carregarClientes(); // Carrega clientes
    });

// Função para carregar os imóveis
async function carregarImoveis() {
    try {
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis");
        const data = await response.json();
        const imoveis = Array.isArray(data) ? data : data.imoveis || [];

        const imoveisContainer = document.getElementById("imoveis-container");
        if (!imoveisContainer) {
            console.error("Erro: Elemento #imoveis-container não encontrado.");
            return;
        }

        imoveis.forEach(imovel => {
            const card = document.createElement("div");
            card.classList.add("card");

            const imagem = imovel.imagens.length > 0 
                ? imovel.imagens[0] 
                : "https://source.unsplash.com/400x300/?house";

            const detalhesUrl = `http://meuleaditapema.com.br/imovel/index.html?id=${imovel.id}`;

            // Função auxiliar para formatar singular/plural corretamente
            const formatarTexto = (quantidade, singular, plural) => 
                `${quantidade} ${quantidade === 1 ? singular : plural}`;

            card.innerHTML = `
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
                <h2>${imovel.texto_principal}</h2>
                <p><strong>${imovel.cidade} - ${imovel.estado}</strong></p> <!-- Exibe cidade e estado -->
                <p>${imovel.descricao}</p>
                <h2>${parseFloat(imovel.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>

                <button class="btn-detalhes" onclick="window.location.href='${detalhesUrl}'">
                    Ver Detalhes
                </button>
            `;

            imoveisContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
    }
}

async function exibirDropdown() {
    const filtrosContainer = document.getElementById("filtros-imoveis");
    if (!filtrosContainer) {
        console.error("Elemento com id 'filtros-imoveis' não encontrado.");
        return;
    }

    // Remove o dropdown anterior (se já existir)
    const existente = document.getElementById("dropdown-cidades");
    if (existente) {
        existente.remove();
    }

    try {
        // Faz a requisição para a API
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/cidades");
        const cidades = await response.json();

        if (!Array.isArray(cidades)) {
            throw new Error("Resposta da API inválida");
        }

        // Cria o elemento <select>
        const select = document.createElement("select");
        select.id = "dropdown-cidades";

        // Adiciona opção padrão
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione uma cidade...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Adiciona as cidades como opções
        cidades.forEach(cidade => {
            const option = document.createElement("option");
            option.value = cidade.id; // Assume que a API retorna um objeto { id, name }
            option.textContent = cidade.name;
            select.appendChild(option);
        });

        // Adiciona o dropdown à div de filtros
        filtrosContainer.appendChild(select);
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}




    // Função para carregar os clientes
    async function carregarClientes() {
        try {
            const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/list-clientes");
            const data = await response.json();
            const clientes = Array.isArray(data) ? data : data.clientes || [];

            clientesContainer.innerHTML = ""; // Limpa antes de adicionar os clientes

            // Cria a nova div antes dos cards
            const filtrosDiv = document.createElement("div");
            filtrosDiv.classList.add("filtros-leads");
            filtrosDiv.innerHTML = `
                <h2>Filtros</h2>
                <!-- Adicione aqui os filtros ou qualquer conteúdo que você deseja -->
            `;
            
            // Adiciona a div antes dos cards
            clientesContainer.insertBefore(filtrosDiv, clientesContainer.firstChild);

            clientes.forEach(cliente => {
                const card = document.createElement("div");
                card.classList.add("card-cliente");

                card.innerHTML = `
                    <h2>${cliente.nome}</h2>
                    <p><strong>Interesse:</strong> ${cliente.interesse}</p>
                    <p><strong>Tipo:</strong> ${cliente.tipo_imovel}</p>
                    <p><strong>Valor desejado:</strong> R$ ${cliente.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p><strong>WhatsApp:</strong> ${cliente.whatsapp}</p>
                    <button class="btn-detalhes" onclick="window.location.href='cliente.html?id=${cliente.id}'">
                        Ver Detalhes
                    </button>
                `;
                clientesContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        }
    }

    carregarImoveis(); // Carregar imóveis ao iniciar
    exibirDropdown(); // Exibir dropdown de cidades
});




async function carregaraImoveis() {
    try {
        const container = document.getElementById("meus-imoveis-container");
        if (!container) {
            console.error("Erro: Elemento #meus-imoveis-container não encontrado.");
            return;
        }

        // Esconde os outros containers
        document.getElementById("imoveis-container").style.display = "none";
        document.getElementById("clientes-container").setAttribute("style", "display: none;");
        document.getElementById("meus-leads").setAttribute("style", "display: none;");

        // Torna a div visível antes de carregar os imóveis
        container.style.display = "block";
        container.innerHTML = "";

        // Adiciona o título antes dos cards
        const titulo = document.createElement("h2");
        titulo.textContent = "Imóveis que me afiliei";
        titulo.style.marginBottom = "15px";
        titulo.style.marginLeft = "15px";
        titulo.style.color = "#555555";

        container.appendChild(titulo);

        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/1");
        const data = await response.json();
        const imoveis = Array.isArray(data) ? data : data.imoveis || [];

        if (imoveis.length === 0) {
            container.innerHTML += "<p>Nenhum imóvel encontrado.</p>";
            return;
        }

        imoveis.forEach(imovel => {
            const card = document.createElement("div");
            card.classList.add("card");

            const imagem = imovel.imagens.length > 0 
                ? imovel.imagens[0] 
                : "https://source.unsplash.com/400x300/?house";

            // Definindo a URL de detalhes
            const detalhesUrl = `http://meuleaditapema.com.br/imovel/index.html?id=${imovel.id}`;

            // Limpa o número removendo qualquer caractere que não seja dígito
            const phone = imovel.whatsapp.replace(/\D/g, '');
            // Cria a mensagem de WhatsApp
            const mensagem = `Olá ${imovel.nome_proprietario}`;
            // Constrói a URL do WhatsApp corretamente
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;

            // Função auxiliar para formatar singular/plural corretamente
            const formatarTexto = (quantidade, singular, plural) => 
                `${quantidade} ${quantidade === 1 ? singular : plural}`;

            card.innerHTML = `
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
    <h2>${imovel.texto_principal}</h2>
    <p><strong>${imovel.cidade} - ${imovel.estado}</strong></p>
    <p>${imovel.descricao}</p>
    <h2>${parseFloat(imovel.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
    <button class="btn-detalhes" onclick="window.location.href='${whatsappUrl}'">
        Conversar com o Proprietário
    </button>
`;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
    }
}









document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("meusimoveis-link").addEventListener("click", function () {
        carregaraImoveis(); // Chama a função que lista os imóveis

        // Fecha o menu lateral (sidebar)
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.classList.remove("open");
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    // Seleciona o link de "leads adquiridos"
    const meusLeadsLink = document.getElementById("meusleads-link");

    // Seleciona os containers
    const imoveisContainer = document.getElementById("imoveis-container");
    const clientesContainer = document.getElementById("clientes-container");
    const meusImoveisContainer = document.getElementById("meus-imoveis-container");
    const meusLeadsContainer = document.getElementById("meus-leads");

    // Adiciona o evento de clique no link "leads adquiridos"
    meusLeadsLink.addEventListener("click", function () {
        // Fecha o menu lateral (sidebar)
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.classList.remove("open");
        }

        // Esconde os outros containers
        imoveisContainer.style.display = "none";
        clientesContainer.style.display = "none";
        meusImoveisContainer.style.display = "none";

        // Torna visível o container de "meus-leads"
        meusLeadsContainer.style.display = "block";
        

        carregarLeadsAdquiridos(1); // Passando o ID do corretor como 1
    });

    // Função para carregar os leads adquiridos
    async function carregarLeadsAdquiridos(corretorId) {
        try {
            const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-clientes/${corretorId}`);
            const data = await response.json();
            const leads = Array.isArray(data.clientes) ? data.clientes : [];

            meusLeadsContainer.innerHTML = ""; // Limpa antes de adicionar os leads

            // Adiciona o título "Leads adquiridos" antes dos cards
        const titulo = document.createElement("h2");
        titulo.textContent = "Leads adquiridos";
        titulo.style.marginBottom = "15px"; // Dá um espaço abaixo do título
        titulo.style.marginLeft = "15px"; // Dá um espaço do lado do título
        titulo.style.color = "#555555"; // Cor do título
        meusLeadsContainer.appendChild(titulo); // Adiciona o título ao container de leads

            leads.forEach(lead => {
                const card = document.createElement("div");
                card.classList.add("card-cliente");

                card.innerHTML = `
                    <h2>${lead.nome}</h2>
                    <p><strong>Interesse:</strong> ${lead.interesse}</p>
                    <p><strong>Tipo:</strong> ${lead.tipo_imovel}</p>
                    <p><strong>Valor desejado:</strong> R$ ${lead.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p><strong>WhatsApp:</strong> ${lead.whatsapp}</p>
                    <button class="btn-detalhes" onclick="window.location.href='cliente.html?id=${lead.id}'">
                        Ver Detalhes
                    </button>
                `;
                meusLeadsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Erro ao carregar leads adquiridos:", error);
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Seleciona a div com id "user-info-container"
    const userInfoContainer = document.getElementById("user-info-container");

    if (userInfoContainer) {
        // Adiciona o evento de clique
        userInfoContainer.addEventListener("click", function () {
            // Limpa o token do localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("userId");

            // Redireciona para a pasta "login"
            window.location.href = "/login"; // Navega para a pasta "login" diretamente
        });
    }
});






async function carregarCorretor() {
    const id = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!id || !token) {
        console.warn("ID ou token não encontrados no localStorage.");
        return;
    }

    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/corretor?id=${id}&token=${token}`);
        const data = await response.json();

        if (response.ok) {
            // Salva os dados no objeto window
            window.corretor = data;

            // Atualiza o nome na div
            document.getElementById("name").textContent = `Olá, ${data.name}`;
        } else {
            console.error("Erro ao carregar corretor:", data.error);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

// Chama a função quando a página carregar
window.onload = carregarCorretor;


// Aguarda a página carregar completamente
window.addEventListener("load", function () {
    setTimeout(function () {
        const preloader = document.getElementById("preloader");
        preloader.style.display = "none"; // Esconde o preloader após 1s
    }, 1000); // 1000ms = 1 segundo
});
