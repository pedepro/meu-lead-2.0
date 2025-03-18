// Variáveis globais
let cidades = [];
let slideIndex = 0;

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/cidades");
        const data = await response.json();
        console.log("Dados das cidades recebidos:", data);
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

    const cardHTML = `
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
    console.log("Card de imóvel criado:", cardHTML);
    return cardHTML;
}

// Função para carregar dinamicamente CSS e JS do checkout
async function carregarRecursosCheckout() {
    if (!document.getElementById("checkout-css")) {
        const link = document.createElement("link");
        link.id = "checkout-css";
        link.rel = "stylesheet";
        link.href = "checkout.css";
        document.head.appendChild(link);
        await new Promise(resolve => link.onload = resolve);
        console.log("CSS do checkout carregado");
    }

    if (!document.getElementById("checkout-js")) {
        const script = document.createElement("script");
        script.id = "checkout-js";
        script.src = "checkout.js";
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
        console.log("JS do checkout carregado");
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
    console.log("Popup de login exibido para leadId:", leadId);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            document.body.style.overflow = 'auto';
            console.log("Popup de login fechado");
        }
    });
}

// Função para verificar login antes de abrir o checkout
async function verificarLoginAntesCheckout(leadId, padrao, valorFormatado) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    console.log("Verificando login - token:", token, "userId:", userId);

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
        console.log("Resposta da verificação de login:", data);

        if (response.ok && !data.error) {
            await carregarRecursosCheckout();
            if (typeof window.renderizarCheckout === "function") {
                document.body.style.overflow = 'hidden';
                window.renderizarCheckout(leadId, padrao, valorFormatado);
                console.log("Checkout renderizado para leadId:", leadId);
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (!document.querySelector('.checkout-overlay')) {
                            document.body.style.overflow = 'auto';
                            observer.disconnect();
                            console.log("Overlay de checkout removido, overflow restaurado");
                        }
                    });
                });
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                console.error("Erro: Função renderizarCheckout não encontrada após carregar checkout.js");
            }
        } else {
            console.log("Credenciais inválidas ou erro na resposta:", data.error);
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

    const cardHTML = `
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
    console.log("Card de lead criado:", cardHTML);
    return cardHTML;
}

// Função para carregar preview de imóveis
async function carregarImoveisPreview() {
    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-imoveis/disponiveis?limite=10&offset=0&destaque=true`);
        const data = await response.json();
        console.log("Dados dos imóveis recebidos:", data);
        const imoveisPreview = document.getElementById("imoveis-preview");
        if (!imoveisPreview) {
            console.warn("Elemento #imoveis-preview não encontrado no DOM");
            return;
        }
        imoveisPreview.innerHTML = "";
        if (data.success && data.imoveis && Array.isArray(data.imoveis)) {
            data.imoveis.forEach(imovel => {
                imoveisPreview.innerHTML += criarCardImovel(imovel);
            });
            console.log("Imóveis renderizados no #imoveis-preview");
        } else {
            console.warn("Nenhum imóvel em destaque encontrado:", data);
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
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/list-clientes?limit=4&offset=0`);
        const data = await response.json();
        console.log("Dados dos leads recebidos:", data);
        const leadsPreview = document.getElementById("leads-preview");
        if (!leadsPreview) {
            console.warn("Elemento #leads-preview não encontrado no DOM");
            return;
        }
        leadsPreview.innerHTML = "";
        if (data.clientes && Array.isArray(data.clientes)) {
            data.clientes.forEach(cliente => {
                leadsPreview.innerHTML += criarCardLead(cliente);
            });
            console.log("Leads renderizados no #leads-preview");
        } else {
            console.warn("Nenhum lead encontrado no preview:", data);
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
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/textos");
        const data = await response.json();
        console.log("Dados dos textos recebidos da API:", data);

        if (data.success && data.textos) {
            // Título e subtítulo
            const tituloPrincipal = document.getElementById("titulo-principal");
            const subtitulo = document.getElementById("subtitulo");
            console.log("Elemento #titulo-principal encontrado:", !!tituloPrincipal);
            console.log("Elemento #subtitulo encontrado:", !!subtitulo);
            if (tituloPrincipal) {
                tituloPrincipal.textContent = data.textos.titulo_principal || "Bem-vindo ao Meu Lead Itapema";
                console.log("Título principal definido como:", tituloPrincipal.textContent);
            }
            if (subtitulo) {
                subtitulo.textContent = data.textos.subtitulo || "Encontre os melhores imóveis e leads para o seu negócio!";
                console.log("Subtítulo definido como:", subtitulo.textContent);
            }

            // Tipo de apresentação (dinâmico)
            const apresentacaoContainer = document.getElementById("apresentacao");
            console.log("Elemento #apresentacao encontrado:", !!apresentacaoContainer);
            if (apresentacaoContainer) {
                const tipoApresentacao = data.textos.tipo_apresentacao || "imagem";
                const imagensApresentacao = data.textos.url_imagens_apresentacao || [];
                const videoApresentacao = data.textos.url_video_apresentacao || "";
                const fallbackImagem = "assets/apresentacao.jpg";

                if (tipoApresentacao === "video" && videoApresentacao) {
                    apresentacaoContainer.innerHTML = `
                        <video src="${videoApresentacao}" controls autoplay muted loop class="apresentacao-video"></video>
                    `;
                    console.log("Vídeo de apresentação renderizado com URL:", videoApresentacao);
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

                    function updateSlider() {
                        slider.style.transform = `translateX(-${slideIndex * 100}vw)`;
                        document.querySelectorAll(".dot").forEach((dot, index) => dot.classList.toggle("active", index === slideIndex));
                        prevArrow.style.display = slideIndex === 0 ? "none" : "block";
                        nextArrow.style.display = slideIndex === totalSlides - 1 ? "none" : "block";
                    }

                    function goToSlide(index) {
                        slideIndex = Math.max(0, Math.min(index, totalSlides - 1));
                        updateSlider();
                    }

                    prevArrow.addEventListener("click", () => { if (slideIndex > 0) { slideIndex--; updateSlider(); } });
                    nextArrow.addEventListener("click", () => { if (slideIndex < totalSlides - 1) { slideIndex++; updateSlider(); } });
                    dotsContainer.addEventListener("click", (e) => {
                        const dot = e.target.closest(".dot");
                        if (dot) goToSlide(Array.from(dotsContainer.children).indexOf(dot));
                    });

                    updateSlider();
                    console.log("Slideshow de imagens renderizado com URLs:", imagensApresentacao);
                } else {
                    apresentacaoContainer.innerHTML = `
                        <img src="${fallbackImagem}" alt="Apresentação" class="apresentacao-imagem">
                    `;
                    console.log("Imagem estática de fallback renderizada");
                }
            }

            // Valores
            const valoresContainer = document.getElementById("valores");
            console.log("Elemento #valores encontrado:", !!valoresContainer);
            if (valoresContainer && data.textos.valores) {
                const valoresHTML = data.textos.valores.map(valor => `
                    <div class="valor-card">
                        <img src="${valor.imagem_url}" alt="${valor.titulo}" class="valor-imagem">
                        <h3>${valor.titulo}</h3>
                        <p>${valor.subtitulo}</p>
                    </div>
                `).join("");
                valoresContainer.innerHTML = valoresHTML;
                console.log("Valores renderizados:", valoresHTML);
            }

            // Feedbacks
            const feedbacksSection = document.querySelector(".feedbacks-section");
            const feedbacksContainer = document.getElementById("feedbacks");
            console.log("Elemento #feedbacks encontrado:", !!feedbacksContainer);
            if (feedbacksContainer && data.textos.feedbacks && data.textos.feedbacks.length > 0) {
                const feedbacksHTML = data.textos.feedbacks.map(feedback => `
                    <div class="feedback-card">
                        <img src="${feedback.imagem}" alt="${feedback.nome}" class="feedback-imagem">
                        <div class="feedback-content">
                            <h4>${feedback.nome}</h4>
                            <p>"${feedback.comentario}"</p>
                        </div>
                    </div>
                `).join("");
                feedbacksContainer.innerHTML = feedbacksHTML;
                feedbacksSection.style.display = "block"; // Exibe a seção se houver feedbacks
                console.log("Feedbacks renderizados:", feedbacksHTML);
            } else {
                feedbacksSection.style.display = "none"; // Oculta a seção se não houver feedbacks
                console.log("Nenhum feedback disponível, seção ocultada");
            }
        } else {
            console.warn("Dados dos textos inválidos ou não encontrados:", data);
        }
    } catch (error) {
        console.error("Erro ao carregar textos:", error);
        const tituloPrincipal = document.getElementById("titulo-principal");
        const subtitulo = document.getElementById("subtitulo");
        const apresentacaoContainer = document.getElementById("apresentacao");
        const feedbacksSection = document.querySelector(".feedbacks-section");
        if (tituloPrincipal) {
            tituloPrincipal.textContent = "Bem-vindo ao Meu Lead Itapema";
            console.log("Título principal revertido para padrão:", tituloPrincipal.textContent);
        }
        if (subtitulo) {
            subtitulo.textContent = "Encontre os melhores imóveis e leads para o seu negócio!";
            console.log("Subtítulo revertido para padrão:", subtitulo.textContent);
        }
        if (apresentacaoContainer) {
            apresentacaoContainer.innerHTML = `
                <img src="assets/apresentacao.jpg" alt="Apresentação" class="apresentacao-imagem">
            `;
            console.log("Imagem estática de fallback renderizada devido a erro");
        }
        if (feedbacksSection) {
            feedbacksSection.style.display = "none"; // Oculta a seção em caso de erro
            console.log("Seção de feedbacks ocultada devido a erro");
        }
    }
}

// Função principal que inicializa a página
async function inicializarPagina() {
    console.log("Iniciando carregamento da página...");

    // Primeiro carrega as cidades, que são uma dependência
    await carregarCidades();

    // Depois carrega os outros elementos, que dependem das cidades
    await Promise.all([
        carregarTextos(),
        carregarImoveisPreview(),
        carregarLeadsPreview()
    ]);

    console.log("Página inicializada com sucesso!");
}

// Chama a função de inicialização explicitamente
inicializarPagina();
