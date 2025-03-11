document.addEventListener("DOMContentLoaded", () => {
    // Mensagem de aviso
    const mensagem = `
Aqui é da equipe de programação da Meu Lead Itapema. 
Se alguém disse pra você que acessando aqui você pode obter dados ou informações não liberadas para você, 
tome cuidado, pois pode ser um golpe.
    `;

    

    // Desenho ASCII fallback para "Meu Lead Itapema" caso a imagem não carregue
    const asciiLogoFallback = `
   Meu Lead Itapema
   -----------------
   |  M  L  I  |
   |-----------|
   |  Itapema  |
   -------------
    `;

    // Função para carregar e exibir a logo
    const logoUrl = "https://cloud.meuleaditapema.com.br/uploads/3cbeb5c8-1937-40b0-8f03-765d7a5eba77.png";
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Tentativa de evitar CORS, mas depende do servidor
    img.onload = () => {
        console.log("%c ", `
            font-size: 1px;
            padding: ${img.height / 2}px ${img.width / 2}px;
            background: url(${logoUrl}) no-repeat center;
            background-size: contain;
        `);
        console.log(mensagem);
                console.log(asciiLogoFallback);

    };
    img.onerror = () => {
        console.log("❌ Erro ao carregar a logo da Meu Lead Itapema (provavelmente devido a CORS)");
        console.log(asciiLogoFallback);
        console.log(mensagem);
    };
    img.src = logoUrl;
});




// Função para alternar a visibilidade do menu lateral
function toggleSlider() {
    const slider = document.getElementById("floatingColumn");

    // Verifica se o menu está visível ou não e altera a posição
    if (slider.style.left === "0px") {
        // Esconde o menu, movendo para a esquerda
        slider.style.left = "-270px";
    } else {
        // Exibe o menu, movendo para a posição inicial à direita
        slider.style.left = "0px";
    }
}

function carregarBotoesMenu() {
    fetch('components/sidebar/menuButtons.json') // Caminho ajustado para o arquivo JSON
        .then(response => response.json()) // Lê o arquivo JSON
        .then(data => {
            const menu = document.querySelector('.floating-column'); // Seleciona o menu flutuante
            menu.innerHTML = ''; // Limpa o conteúdo do menu antes de adicionar os novos botões

            // Adiciona o campo de pesquisa
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id = 'searchInput';
            searchInput.classList.add('search-input');
            searchInput.placeholder = 'Pesquise...';
            menu.appendChild(searchInput);

            // Filtragem com base na pesquisa
            searchInput.addEventListener('input', () => {
                const searchValue = searchInput.value.toLowerCase();
                const allButtons = menu.querySelectorAll('.menu-button, .section-header');
                allButtons.forEach(button => {
                    const textContent = button.textContent.toLowerCase();
                    button.style.display = textContent.includes(searchValue) ? 'block' : 'none';
                });
            });

            // Adiciona seções e botões com base nos dados
            data.forEach(section => {
                // Cria o cabeçalho da seção
                const sectionHeader = document.createElement('div');
                sectionHeader.classList.add('section-header');
                sectionHeader.textContent = section.label; // Nome da seção
                menu.appendChild(sectionHeader);

                // Adiciona os botões da seção
                section.buttons.forEach(buttonData => {
                    const button = document.createElement('a');
                    button.id = buttonData.id;
                    
                    // Adiciona o parâmetro "session" na URL sem sobrescrever o caminho
                    const currentUrl = new URL(window.location.href);  // Pega a URL atual
                    currentUrl.searchParams.set('session', buttonData.id);  // Adiciona/atualiza o parâmetro "session"
                    button.href = currentUrl.toString();  // Define o link com o parâmetro

                    button.classList.add('menu-button');

                    // Adiciona o ícone (se existir)
                    if (buttonData.icon) {
                        const icon = document.createElement('i');
                        icon.className = buttonData.icon;
                        button.appendChild(icon);
                    }

                    // Adiciona o texto do botão
                    const label = document.createElement('span');
                    label.textContent = buttonData.label;
                    button.appendChild(label);

                    menu.appendChild(button);

                    // Submenus (se existirem)
                    if (buttonData.submenu) {
                        const submenuContainer = document.createElement('div');
                        submenuContainer.classList.add('submenu-container');

                        buttonData.submenu.forEach(submenuItem => {
                            const submenuButton = document.createElement('a');
                            submenuButton.id = submenuItem.id;

                            // Adiciona o parâmetro "session" na URL sem sobrescrever o caminho
                            const submenuUrl = new URL(window.location.href);  // Pega a URL atual
                            submenuUrl.searchParams.set('session', submenuItem.id);  // Adiciona/atualiza o parâmetro "session"
                            submenuButton.href = submenuUrl.toString();  // Define o link com o parâmetro

                            submenuButton.classList.add('submenu-button');

                            if (submenuItem.icon) {
                                const subIcon = document.createElement('i');
                                subIcon.className = submenuItem.icon;
                                submenuButton.appendChild(subIcon);
                            }

                            const subLabel = document.createElement('span');
                            subLabel.textContent = submenuItem.label;
                            submenuButton.appendChild(subLabel);

                            submenuContainer.appendChild(submenuButton);
                        });

                        menu.appendChild(submenuContainer);

                        button.addEventListener('click', event => {
                            event.preventDefault();
                            submenuContainer.classList.toggle('active');
                        });
                    }
                });
            });
        })
        .catch(error => console.error("Erro ao carregar os dados dos botões:", error));
}



// Chama as funções necessárias ao carregar a página
window.onload = function() {
    carregarBotoesMenu();  // Carrega os botões do menu flutuante
};



// Aguarda a página carregar completamente
window.addEventListener("load", function () {
    setTimeout(function () {
        const preloader = document.getElementById("preloader");
        preloader.style.display = "none"; // Esconde o preloader após 1s
    }, 1000); // 1000ms = 1 segundo
});

