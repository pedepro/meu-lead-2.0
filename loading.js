// Função para criar e exibir a tela de carregamento
function mostrarTelaCarregamento() {
    // Criar o contêiner da tela de carregamento
    const loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loading-overlay";
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    // Adicionar a logo
    const logo = document.createElement("img");
    logo.src = "assets/logohorizontal.png"; // Substitua pelo caminho real da sua logo
    logo.alt = "Carregando...";
    logo.style.cssText = `
        max-width: 200px; /* Ajuste o tamanho conforme necessário */
        max-height: 200px;
    `;

    loadingOverlay.appendChild(logo);
    document.body.appendChild(loadingOverlay);
    document.body.style.overflow = "hidden"; // Impede rolagem enquanto carrega
}

// Função para esconder a tela de carregamento
function esconderTelaCarregamento() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
        loadingOverlay.style.transition = "opacity 0.5s ease"; // Animação suave
        loadingOverlay.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(loadingOverlay);
            document.body.style.overflow = "auto"; // Restaura rolagem
        }, 500); // Tempo da animação em milissegundos
    }
}

// Mostrar a tela de carregamento ao iniciar
mostrarTelaCarregamento();

// Escutar um evento personalizado para esconder a tela quando o carregamento terminar
window.addEventListener("carregamentoCompleto", esconderTelaCarregamento);