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

            imoveis.forEach(imovel => {
                const card = document.createElement("div");
                card.classList.add("card");

                const imagem = imovel.imagens.length > 0 
                    ? imovel.imagens[0] 
                    : "https://source.unsplash.com/400x300/?house";

                const detalhesUrl = "http://meuleaditapema.com.br/imovel/index.html?id=" + imovel.id;

                card.innerHTML = `
                    <img src="${imagem}" alt="Imóvel">
                    <h2>${imovel.texto_principal}</h2>
                    <p>${imovel.quartos} quartos, ${imovel.banheiros} banheiros, ${imovel.metros_quadrados}m²</p>
                    <p>R$ ${imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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
        document.getElementById("clientes-container").setAttribute("style", "display: none;"); // Usando setAttribute para garantir o estilo
        document.getElementById("meus-leads").setAttribute("style", "display: none;"); // Usando setAttribute para garantir o estilo

        // Torna a div visível antes de carregar os imóveis
        container.style.display = "block";
        container.innerHTML = ""; // Limpa antes de adicionar os imóveis

        // Adiciona o título antes dos cards
        const titulo = document.createElement("h2");
        titulo.textContent = "Imóveis que me afiliei";
        titulo.style.marginBottom = "15px"; // Dá um espaço abaixo do título
        titulo.style.marginLeft = "15px"; // Dá um espaço abaixo do título
        titulo.style.color = "#555555"; // Dá um espaço abaixo do título

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
            card.classList.add("card"); // Mesmo estilo da outra função

            // Obtém a imagem (se não houver, usa uma padrão)
            const imagem = (imovel.imagens && imovel.imagens.length > 0) 
                ? imovel.imagens[0] 
                : "https://source.unsplash.com/400x300/?house";

            // Define a URL para detalhes do imóvel
            const detalhesUrl = `http://meuleaditapema.com.br/imovel/index.html?id=${imovel.id}`;

            card.innerHTML = `
                <img src="${imagem}" alt="Imóvel">
                <h2>${imovel.texto_principal || "Sem título"}</h2>
                <p>${imovel.quartos || 0} quartos, ${imovel.banheiros || 0} banheiros, ${imovel.metros_quadrados || 0}m²</p>
                <p>${imovel.valor 
                    ? imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                    : "Preço não informado"}</p>
                
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
