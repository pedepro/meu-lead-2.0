// Variáveis globais
let cidades = [];
let slideIndex = 0;
let autoSlideInterval;

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/cidades");
        const data = await response.json();
        cidades = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

// Função para obter o nome da cidade pelo ID
function getNomeCidade(cidadeId) {
    const cidade = cidades.find(c => c.id === parseInt(cidadeId));
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
            <h2>${imovel.texto_principal}</h2>
            <p><strong>${nomeCidade} - ${imovel.estado}</strong></p>
            <p>${imovel.descricao}</p>
            <h2>${parseFloat(imovel.valor).toLocaleString('pt-BR', { 
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

// Função para carregar dinamicamente CSS e JS do checkout
async function carregarRecursosCheckout() {
    if (!document.getElementById("checkout-css")) {
        const link = document.createElement("link");
        link.id = "checkout-css";
        link.rel = "stylesheet";
        link.href = "subpaginas/checkout.css";
        document.head.appendChild(link);
        await new Promise(resolve => link.onload = resolve);
    }

    if (!document.getElementById("checkout-js")) {
        const script = document.createElement("script");
        script.id = "checkout-js";
        script.src = "subpaginas/checkout.js";
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
    }
}

// Função para criar e exibir o popup de login
function mostrarPopupLogin(leadId, padrao, valorFormatado) {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const popup = document.createElement("div");
    popup.className = "popup-content";
    popup.style.cssText = `
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 400px;
        max-width: 90%;
        padding: 20px;
        text-align: center;
        font-family: Arial, sans-serif;
    `;

    popup.innerHTML = `
        <h2 style="font-size: 20px; color: #333; margin-bottom: 15px;">Faça login para continuar</h2>
        <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
            Você precisa estar logado para adquirir este lead.
        </p>
        <div style="display: flex; justify-content: space-between; gap: 10px;">
            <button onclick="window.location.href='/login'" 
                    style="flex: 1; padding: 10px; background: #1877f2; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                Fazer Login
            </button>
            <button onclick="document.body.removeChild(document.querySelector('.popup-overlay')); document.body.style.overflow = 'auto';" 
                    style="flex: 1; padding: 10px; background: #e4e6eb; color: #333; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                Cancelar
            </button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            document.body.style.overflow = 'auto';
        }
    });
}

// Função para verificar login antes de abrir o checkout
async function verificarLoginAntesCheckout(leadId, padrao, valorFormatado) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        mostrarPopupLogin(leadId, padrao, valorFormatado);
        return;
    }

    try {
        const url = `https://pedepro-meulead.6a7cul.easypanel.host/corretor?id=${userId}&token=${token}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (response.ok && !data.error) {
            await carregarRecursosCheckout();
            if (typeof window.renderizarCheckout === "function") {
                document.body.style.overflow = 'hidden';
                window.renderizarCheckout(leadId, padrao, valorFormatado);
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (!document.querySelector('.checkout-overlay')) {
                            document.body.style.overflow = 'auto';
                            observer.disconnect();
                        }
                    });
                });
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                console.error("Erro: Função renderizarCheckout não encontrada após carregar checkout.js");
            }
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
            document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
            mostrarPopupLogin(leadId, padrao, valorFormatado);
        }
    } catch (error) {
        console.error("Erro ao verificar login no servidor:", error);
        mostrarPopupLogin(leadId, padrao, valorFormatado);
    }
}

// Função para criar o card de lead
function criarCardLead(cliente) {
    const padrao = cliente.categoria === 1 ? "medio-padrao" : 
                  cliente.categoria === 2 ? "alto-padrao" : 
                  "medio-padrao";
    const icon = cliente.categoria === 2 ? "star" : "home";
    const valorLead = cliente.valor_lead || 0;
    const valorFormatado = parseFloat(valorLead).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
    const titulo = cliente.titulo || "Lead sem título";

    return `
        <div class="lead-card ${padrao}">
            <div class="lead-card-header">
                <div class="lead-badge">${padrao === "alto-padrao" ? "Alto Padrão" : "Médio Padrão"}</div>
                <div class="lead-titulo">${titulo}</div>
                <div class="lead-interesse">${cliente.interesse || "Interesse não especificado"}</div>
                <i class="material-icons lead-icon">${icon}</i>
                <div class="lead-sku">SKU ${cliente.id}</div>
            </div>
            <div class="lead-card-footer">
                <button class="lead-btn-adquirir" onclick="verificarLoginAntesCheckout(${cliente.id}, '${padrao}', '${valorFormatado}')">
                    Obter por ${valorFormatado}
                </button>
            </div>
        </div>
    `;
}

// Função para carregar preview de imóveis
async function carregarImoveisPreview() {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/disponiveis?limite=10&offset=0&destaque=true`);
        const data = await response.json();
        const imoveisPreview = document.getElementById("imoveis-preview");
        if (!imoveisPreview) return;
        imoveisPreview.innerHTML = "";
        if (data.success && data.imoveis && Array.isArray(data.imoveis)) {
            data.imoveis.forEach(imovel => {
                imoveisPreview.innerHTML += criarCardImovel(imovel);
            });
        } else {
            imoveisPreview.innerHTML = "<p>Nenhum imóvel em destaque disponível no momento.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar preview de imóveis:", error);
        const imoveisPreview = document.getElementById("imoveis-preview");
        if (imoveisPreview) imoveisPreview.innerHTML = "<p>Erro ao carregar imóveis.</p>";
    }
}

// Função para carregar preview de leads
async function carregarLeadsPreview() {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list/clientes?limit=4&offset=0&destaque=true`);
        const data = await response.json();
        const leadsPreview = document.getElementById("leads-preview");
        if (!leadsPreview) return;
        leadsPreview.innerHTML = "";
        if (data.clientes && Array.isArray(data.clientes)) {
            data.clientes.forEach(cliente => {
                leadsPreview.innerHTML += criarCardLead(cliente);
            });
        } else {
            leadsPreview.innerHTML = "<p>Nenhum lead disponível no momento.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar preview de leads:", error);
        const leadsPreview = document.getElementById("leads-preview");
        if (leadsPreview) leadsPreview.innerHTML = "<p>Erro ao carregar leads.</p>";
    }
}

// Função para carregar os textos dinâmicos
async function carregarTextos() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/get-content");
        const data = await response.json();

        const tituloPrincipal = document.getElementById("titulo-principal");
        const subtitulo = document.getElementById("subtitulo");
        if (tituloPrincipal) {
            tituloPrincipal.textContent = data.ajustes.titulo || "Bem-vindo ao Meu Lead Itapema";
        }
        if (subtitulo) {
            subtitulo.textContent = data.ajustes.subtitulo || "Encontre os melhores imóveis e leads para o seu negócio!";
        }

        const apresentacaoContainer = document.getElementById("apresentacao");
        if (apresentacaoContainer) {
            const tipoApresentacao = data.ajustes.tipo_apn === 1 ? "imagem" : "video";
            const imagensApresentacao = data.ajustes.imagens || [];
            const videoApresentacao = data.ajustes.video || "";
            const fallbackImagem = "assets/apresentacao.jpg";

            if (tipoApresentacao === "video" && videoApresentacao) {
                apresentacaoContainer.innerHTML = `
                    <video src="${videoApresentacao}" controls autoplay muted loop class="apresentacao-video"></video>
                `;
            } else if (tipoApresentacao === "imagem" && imagensApresentacao.length > 0) {
                apresentacaoContainer.innerHTML = `
                    <div class="slider-container" id="slider-container">
                        <button class="slider-arrow left" id="prev-arrow">‹</button>
                        <div class="slider" id="slider-imagens">
                            ${imagensApresentacao.map(img => `<img src="${img}" alt="Imagem de Apresentação" loading="lazy">`).join('')}
                        </div>
                        <button class="slider-arrow right" id="next-arrow">›</button>
                        <div class="slider-dots" id="slider-dots">
                            ${imagensApresentacao.map((_, i) => `<div class="dot${i === 0 ? ' active' : ''}"></div>`).join('')}
                        </div>
                    </div>
                `;
                const slider = document.getElementById("slider-imagens");
                const prevArrow = document.getElementById("prev-arrow");
                const nextArrow = document.getElementById("next-arrow");
                const dotsContainer = document.getElementById("slider-dots");
                const totalSlides = imagensApresentacao.length;
                slideIndex = 0;

                function updateSlider(instant = false) {
                    // Se for uma transição instantânea (para o loop infinito), remove a animação
                    slider.style.transition = instant ? 'none' : 'transform 0.3s ease';
                    slider.style.transform = `translateX(-${slideIndex * 100}vw)`;
                    document.querySelectorAll(".dot").forEach((dot, index) => dot.classList.toggle("active", index === slideIndex));
                    // Sempre mostra as setas para o efeito infinito
                    prevArrow.style.display = "block";
                    nextArrow.style.display = "block";
                }

                function goToSlide(index, instant = false) {
                    slideIndex = index;
                    updateSlider(instant);
                }

                // Eventos de clique nos botões
                prevArrow.addEventListener("click", () => {
                    slideIndex--;
                    if (slideIndex < 0) {
                        slideIndex = totalSlides - 1;
                        goToSlide(slideIndex, true); // Transição instantânea para o último
                        setTimeout(() => updateSlider(), 0); // Reaplica a transição suave
                    } else {
                        updateSlider();
                    }
                    resetAutoSlide();
                });

                nextArrow.addEventListener("click", () => {
                    slideIndex++;
                    if (slideIndex >= totalSlides) {
                        slideIndex = 0;
                        goToSlide(slideIndex, true); // Transição instantânea para o primeiro
                        setTimeout(() => updateSlider(), 0); // Reaplica a transição suave
                    } else {
                        updateSlider();
                    }
                    resetAutoSlide();
                });

                dotsContainer.addEventListener("click", (e) => {
                    const dot = e.target.closest(".dot");
                    if (dot) {
                        goToSlide(Array.from(dotsContainer.children).indexOf(dot));
                        resetAutoSlide();
                    }
                });

                // Eventos de toque para rolagem com o dedo
                let touchStartX = 0;
                let touchEndX = 0;

                slider.addEventListener("touchstart", (e) => {
                    touchStartX = e.touches[0].clientX;
                    clearInterval(autoSlideInterval);
                });

                slider.addEventListener("touchmove", (e) => {
                    touchEndX = e.touches[0].clientX;
                });

                slider.addEventListener("touchend", () => {
                    const diffX = touchStartX - touchEndX;
                    if (diffX > 50) { // Swipe para esquerda
                        slideIndex++;
                        if (slideIndex >= totalSlides) {
                            slideIndex = 0;
                            goToSlide(slideIndex, true);
                            setTimeout(() => updateSlider(), 0);
                        } else {
                            updateSlider();
                        }
                    } else if (diffX < -50) { // Swipe para direita
                        slideIndex--;
                        if (slideIndex < 0) {
                            slideIndex = totalSlides - 1;
                            goToSlide(slideIndex, true);
                            setTimeout(() => updateSlider(), 0);
                        } else {
                            updateSlider();
                        }
                    }
                    resetAutoSlide();
                });

                // Função para iniciar rolagem automática
                function startAutoSlide() {
                    autoSlideInterval = setInterval(() => {
                        slideIndex++;
                        if (slideIndex >= totalSlides) {
                            slideIndex = 0;
                            goToSlide(slideIndex, true); // Transição instantânea
                            setTimeout(() => updateSlider(), 0); // Reaplica transição suave
                        } else {
                            updateSlider();
                        }
                    }, 5000);
                }

                // Função para resetar o intervalo de rolagem automática
                function resetAutoSlide() {
                    clearInterval(autoSlideInterval);
                    startAutoSlide();
                }

                updateSlider();
                startAutoSlide();
            } else {
                apresentacaoContainer.innerHTML = `
                    <img src="${fallbackImagem}" alt="Apresentação" class="apresentacao-imagem">
                `;
            }
        }

        const valoresContainer = document.getElementById("valores");
        if (valoresContainer && data.valores) {
            const valoresHTML = data.valores.map(valor => `
                <div class="valor-card">
                    <img src="${valor.img}" alt="${valor.titulo}" class="valor-imagem">
                    <h3>${valor.titulo}</h3>
                    <p>${valor.subtitulo}</p>
                </div>
            `).join("");
            valoresContainer.innerHTML = valoresHTML;
        }

        const feedbacksSection = document.querySelector(".feedbacks-section");
        const feedbacksContainer = document.getElementById("feedbacks");
        if (feedbacksContainer && data.feedbacks && data.feedbacks.length > 0) {
            const feedbacksHTML = data.feedbacks.map(feedback => `
                <div class="feedback-card">
                    <img src="${feedback.img}" alt="${feedback.nome}" class="feedback-imagem">
                    <div class="feedback-content">
                        <h4>${feedback.nome}</h4>
                        <p>"${feedback.comentario}"</p>
                    </div>
                </div>
            `).join("");
            feedbacksContainer.innerHTML = feedbacksHTML;
            feedbacksSection.style.display = "block";
        } else {
            feedbacksSection.style.display = "none";
        }
    } catch (error) {
        console.error("Erro ao carregar textos:", error);
        const tituloPrincipal = document.getElementById("titulo-principal");
        const subtitulo = document.getElementById("subtitulo");
        const apresentacaoContainer = document.getElementById("apresentacao");
        const feedbacksSection = document.querySelector(".feedbacks-section");
        if (tituloPrincipal) {
            tituloPrincipal.textContent = "Bem-vindo ao Meu Lead Itapema";
        }
        if (subtitulo) {
            subtitulo.textContent = "Encontre os melhores imóveis e leads para o seu negócio!";
        }
        if (apresentacaoContainer) {
            apresentacaoContainer.innerHTML = `
                <img src="assets/apresentacao.jpg" alt="Apresentação" class="apresentacao-imagem">
            `;
        }
        if (feedbacksSection) {
            feedbacksSection.style.display = "none";
        }
    }
}

// Função principal que inicializa a página
async function inicializarPagina() {
    await carregarCidades();
    await Promise.all([
        carregarTextos(),
        carregarImoveisPreview(),
        carregarLeadsPreview()
    ]);
    window.dispatchEvent(new Event("carregamentoCompleto"));
}

// Chama a função de inicialização explicitamente
inicializarPagina();