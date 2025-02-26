document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const imovelId = params.get("id");

    if (!imovelId) {
        document.getElementById("detalhes-imovel").innerHTML = "<p>Imóvel não encontrado.</p>";
        return;
    }

    try {
        const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/get-imovel/${imovelId}`);
        const imovel = await response.json();

        if (!imovel.id) {
            document.getElementById("detalhes-imovel").innerHTML = "<p>Imóvel não encontrado.</p>";
            return;
        }

        // Preencher o título
        document.getElementById("titulo-imovel").textContent = imovel.texto_principal || "Imóvel sem título";

        // Preencher o slider de imagens
        const sliderImagens = document.getElementById("slider-imagens");
        const imagens = Array.isArray(imovel.imagens) ? imovel.imagens : []; // Garante que imagens seja um array
        sliderImagens.innerHTML = imagens.length > 0
            ? imagens.map(img => `<img src="${img}" alt="Imagem do Imóvel" loading="lazy">`).join('')
            : `<img src="https://source.unsplash.com/400x300/?house" alt="Imagem padrão" loading="lazy">`; // Imagem padrão se não houver imagens

        // Preencher o preço
        document.getElementById("preco-imovel").textContent = `R$ ${parseFloat(imovel.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

        // Preencher a descrição
        document.getElementById("descricao-imovel").textContent = imovel.descricao || 'Sem descrição';

        // Preencher os detalhes com ícones e valores
        document.getElementById("area").textContent = `${imovel.metros_quadrados || 0} m²`;
        document.getElementById("quartos").textContent = imovel.quartos || 0;
        document.getElementById("banheiros").textContent = imovel.banheiros || 0;
        document.getElementById("vagas").textContent = imovel.vagas_garagem || 0;
        document.getElementById("andar").textContent = imovel.andar || 'Não informado';
        document.getElementById("mobiliado").textContent = imovel.mobiliado ? "Sim" : "Não";

        // Configurar o botão e texto de conexão
        const btnConectar = document.getElementById("btn-conectar");
        const textoConectar = document.getElementById("texto-conectar");

        if (btnConectar && textoConectar) {
            const precoContato = Number(imovel.price_contato) || 39.90; // Converte para número e usa 39.90 como fallback
            btnConectar.textContent = `Conectar-se com o proprietário por R$ ${precoContato.toFixed(2).replace('.', ',')}`;
            textoConectar.textContent = `Ao pagar R$ ${precoContato.toFixed(2).replace('.', ',')}, você pode entrar em contato diretamente com o proprietário para tirar dúvidas e negociar.`;
        }

        // Ajuste no slider para melhor navegação
        const slider = document.getElementById("slider-imagens");
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener("mousedown", (e) => {
            isDown = true;
            slider.classList.add("active");
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener("mouseleave", () => {
            isDown = false;
            slider.classList.remove("active");
        });

        slider.addEventListener("mouseup", () => {
            isDown = false;
            slider.classList.remove("active");
        });

        slider.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Velocidade do scroll
            slider.scrollLeft = scrollLeft - walk;
        });

    } catch (error) {
        console.error("Erro ao carregar detalhes do imóvel:", error);
        document.getElementById("detalhes-imovel").innerHTML = "<p>Erro ao carregar detalhes.</p>";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    function verificarLogin(acao) {
        const token = localStorage.getItem("token");
        
        if (!token) {
            exibirNotificacao(acao);
            return false;
        }
        return true;
    }

    function exibirNotificacao(acao) {
        const mensagem = acao === "afiliar-se"
            ? "Efetue Login ou crie uma conta para afiliar-se."
            : "Efetue Login ou crie uma conta para conectar-se com o proprietário.";

        const overlay = document.createElement("div");
        overlay.id = "notificacao-overlay";
        overlay.innerHTML = `
            <div class="notificacao">
                <p>${mensagem}</p>
                <div class="botoes">
                    <button id="notificacao-btn-login" class="notificacao-btn-azul">Fazer Login</button>
                    <button id="notificacao-btn-cancelar" class="notificacao-btn-cinza">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("notificacao-btn-login").addEventListener("click", () => {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get("id");

            let loginUrl = "/login";
            if (id) {
                loginUrl += `?id=${id}`;
            }

            window.location.href = loginUrl;
        });

        document.getElementById("notificacao-btn-cancelar").addEventListener("click", () => {
            document.body.removeChild(overlay);
        });
    }

    document.getElementById("btn-afiliar").addEventListener("click", () => {
        if (verificarLogin("afiliar-se")) {
            console.log("Usuário afiliado com sucesso!"); // Lógica real aqui
        }
    });

    document.getElementById("btn-conectar").addEventListener("click", () => {
        if (verificarLogin("conectar")) {
            console.log("Usuário se conectou com sucesso!"); // Lógica real aqui
        }
    });
});