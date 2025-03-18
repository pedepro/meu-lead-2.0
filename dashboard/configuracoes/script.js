// Contador global para IDs únicos
let previewCounter = 0;

// Função para fazer upload de arquivos
async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("https://cloud.meuleaditapema.com.br/upload", {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        if (result.url) {
            return result.url;
        } else {
            throw new Error("Erro ao fazer upload do arquivo");
        }
    } catch (error) {
        console.error("Erro no upload:", error);
        alert("Erro ao fazer upload do arquivo. Tente novamente.");
        return null;
    }
}

// Função para carregar os dados atuais do textos.json
async function carregarTextos() {
    try {
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/textos");
        const data = await response.json();
        console.log("Dados carregados:", data);

        if (data.success && data.textos) {
            document.getElementById("titulo-principal").value = data.textos.titulo_principal || "";
            document.getElementById("subtitulo").value = data.textos.subtitulo || "";
            const tipoApresentacao = document.getElementById("tipo-apresentacao");
            tipoApresentacao.value = data.textos.tipo_apresentacao || "imagem";

            // Carregar URLs de imagens
            const imagensInput = document.getElementById("imagens-apresentacao");
            const imagensApresentacao = data.textos.url_imagens_apresentacao || [];
            imagensInput.value = Array.isArray(imagensApresentacao) ? imagensApresentacao.join(", ") : "";

            // Carregar URL de vídeo
            const videoInput = document.getElementById("video-apresentacao");
            videoInput.value = data.textos.url_video_apresentacao || "";

            toggleApresentacao(tipoApresentacao.value);
            previewMedia(imagensApresentacao, "imagem", "preview-imagens");
            previewMedia(videoInput.value, "video", "preview-video");
            
            const valoresList = document.getElementById("valores-list");
            valoresList.innerHTML = "";
            (data.textos.valores || []).forEach(valor => adicionarValor(valor));

            const feedbacksList = document.getElementById("feedbacks-list");
            feedbacksList.innerHTML = "";
            (data.textos.feedbacks || []).forEach(feedback => adicionarFeedback(feedback));
        }
    } catch (error) {
        console.error("Erro ao carregar textos:", error);
        alert("Erro ao carregar os dados. Tente novamente.");
    }
}

// Função para mostrar/esconder os campos de apresentação
function toggleApresentacao(tipo) {
    const imagensContainer = document.getElementById("imagens-apresentacao-container");
    const videoContainer = document.getElementById("video-apresentacao-container");
    if (tipo === "imagem") {
        imagensContainer.style.display = "block";
        videoContainer.style.display = "none";
    } else if (tipo === "video") {
        imagensContainer.style.display = "none";
        videoContainer.style.display = "block";
    }
}

// Função para pré-visualizar mídia
function previewMedia(url, tipo, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contêiner com ID ${containerId} não encontrado`);
        return;
    }
    container.innerHTML = "";
    if (url) {
        if (tipo === "imagem") {
            const urls = Array.isArray(url) ? url : url.split(",").map(u => u.trim());
            urls.forEach(u => {
                if (u) {
                    const img = document.createElement("img");
                    img.src = u;
                    container.appendChild(img);
                }
            });
        } else if (tipo === "video") {
            const video = document.createElement("video");
            video.src = url;
            video.controls = true;
            container.appendChild(video);
        }
    }
}

// Função para adicionar um novo valor ao DOM
function adicionarValor(valor = { titulo: "", subtitulo: "", imagem_url: "" }) {
    const valoresList = document.getElementById("valores-list");
    const previewId = `valor-preview-${previewCounter++}`;
    const div = document.createElement("div");
    div.className = "valor-item";
    div.innerHTML = `
        <input type="text" name="valor-titulo" placeholder="Título" value="${valor.titulo}">
        <input type="text" name="valor-subtitulo" placeholder="Subtítulo" value="${valor.subtitulo}">
        <input type="text" name="valor-imagem" placeholder="URL da Imagem" value="${valor.imagem_url}">
        <input type="file" name="valor-upload" accept="image/*">
        <div class="preview-container" id="${previewId}"></div>
        <button type="button" class="remove-btn">Remover</button>
    `;
    valoresList.appendChild(div);

    const uploadInput = div.querySelector("[name='valor-upload']");
    uploadInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await uploadFile(file);
            if (url) {
                div.querySelector("[name='valor-imagem']").value = url;
                previewMedia(url, "imagem", previewId);
            }
        }
    });

    previewMedia(valor.imagem_url, "imagem", previewId);
    div.querySelector(".remove-btn").addEventListener("click", () => valoresList.removeChild(div));
}

// Função para adicionar um novo feedback ao DOM
function adicionarFeedback(feedback = { imagem: "", nome: "", comentario: "" }) {
    const feedbacksList = document.getElementById("feedbacks-list");
    const previewId = `feedback-preview-${previewCounter++}`;
    const div = document.createElement("div");
    div.className = "feedback-item";
    div.innerHTML = `
        <input type="text" name="feedback-imagem" placeholder="URL da Imagem" value="${feedback.imagem}">
        <input type="file" name="feedback-upload" accept="image/*">
        <div class="preview-container" id="${previewId}"></div>
        <input type="text" name="feedback-nome" placeholder="Nome" value="${feedback.nome}">
        <input type="text" name="feedback-comentario" placeholder="Comentário" value="${feedback.comentario}">
        <button type="button" class="remove-btn">Remover</button>
    `;
    feedbacksList.appendChild(div);

    const uploadInput = div.querySelector("[name='feedback-upload']");
    uploadInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await uploadFile(file);
            if (url) {
                div.querySelector("[name='feedback-imagem']").value = url;
                previewMedia(url, "imagem", previewId);
            }
        }
    });

    previewMedia(feedback.imagem, "imagem", previewId);
    div.querySelector(".remove-btn").addEventListener("click", () => feedbacksList.removeChild(div));
}

// Função para salvar as alterações
async function salvarTextos(event) {
    event.preventDefault();

    const form = document.getElementById("textos-form");
    const tipoApresentacao = form.querySelector("#tipo-apresentacao").value;
    const imagensInput = form.querySelector("#imagens-apresentacao").value;
    const videoInput = form.querySelector("#video-apresentacao").value;

    const dados = {
        titulo_principal: form.querySelector("#titulo-principal").value,
        subtitulo: form.querySelector("#subtitulo").value,
        tipo_apresentacao: tipoApresentacao,
        url_imagens_apresentacao: imagensInput ? imagensInput.split(",").map(u => u.trim()).filter(u => u) : [],
        url_video_apresentacao: videoInput || "",
        valores: [],
        feedbacks: []
    };

    const valoresItems = document.querySelectorAll(".valor-item");
    valoresItems.forEach(item => {
        dados.valores.push({
            titulo: item.querySelector("[name='valor-titulo']").value,
            subtitulo: item.querySelector("[name='valor-subtitulo']").value,
            imagem_url: item.querySelector("[name='valor-imagem']").value
        });
    });

    const feedbacksItems = document.querySelectorAll(".feedback-item");
    feedbacksItems.forEach(item => {
        dados.feedbacks.push({
            imagem: item.querySelector("[name='feedback-imagem']").value,
            nome: item.querySelector("[name='feedback-nome']").value,
            comentario: item.querySelector("[name='feedback-comentario']").value
        });
    });

    try {
        const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/editar-textos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const result = await response.json();
        console.log("Resposta da API:", result);

        if (result.success) {
            alert("Textos salvos com sucesso!");
            carregarTextos(); // Recarregar para refletir mudanças
        } else {
            throw new Error(result.message || "Erro ao salvar");
        }
    } catch (error) {
        console.error("Erro ao salvar textos:", error);
        alert("Erro ao salvar os textos. Tente novamente.");
    }
}

// Eventos
document.getElementById("add-valor").addEventListener("click", () => adicionarValor());
document.getElementById("add-feedback").addEventListener("click", () => adicionarFeedback());
document.getElementById("textos-form").addEventListener("submit", salvarTextos);
document.getElementById("tipo-apresentacao").addEventListener("change", (e) => {
    toggleApresentacao(e.target.value);
});

document.getElementById("upload-imagens").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
        const urls = await Promise.all(files.map(file => uploadFile(file)));
        const validUrls = urls.filter(url => url);
        if (validUrls.length) {
            const imagensInput = document.getElementById("imagens-apresentacao");
            const existingUrls = imagensInput.value ? imagensInput.value.split(",").map(u => u.trim()) : [];
            imagensInput.value = [...existingUrls, ...validUrls].join(", ");
            previewMedia(imagensInput.value, "imagem", "preview-imagens");
        }
    }
});

document.getElementById("upload-video").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = await uploadFile(file);
        if (url) {
            const videoInput = document.getElementById("video-apresentacao");
            videoInput.value = url;
            previewMedia(url, "video", "preview-video");
        }
    }
});

// Carregar os dados ao iniciar
carregarTextos();