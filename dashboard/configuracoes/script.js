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

// Função para carregar os dados do banco via /get-content
async function carregarTextos() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/get-content");
        const data = await response.json();
        console.log("Dados carregados:", data);

        // Preencher ajustes
        document.getElementById("titulo-principal").value = data.ajustes.titulo || "";
        document.getElementById("subtitulo").value = data.ajustes.subtitulo || "";
        const tipoApresentacao = document.getElementById("tipo-apresentacao");
        tipoApresentacao.value = data.ajustes.tipo_apn === 1 ? "imagem" : "video";

        const imagensInput = document.getElementById("imagens-apresentacao");
        imagensInput.value = Array.isArray(data.ajustes.imagens) ? data.ajustes.imagens.join(", ") : "";

        const videoInput = document.getElementById("video-apresentacao");
        videoInput.value = data.ajustes.video || "";

        toggleApresentacao(tipoApresentacao.value);
        previewMedia(data.ajustes.imagens, "imagem", "preview-imagens");
        previewMedia(data.ajustes.video, "video", "preview-video");

        // Preencher valores
        const valoresList = document.getElementById("valores-list");
        valoresList.innerHTML = "";
        (data.valores || []).forEach(valor => adicionarValor(valor));

        // Preencher feedbacks
        const feedbacksList = document.getElementById("feedbacks-list");
        feedbacksList.innerHTML = "";
        (data.feedbacks || []).forEach(feedback => adicionarFeedback(feedback));
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
function adicionarValor(valor = { id: null, img: "", titulo: "", subtitulo: "" }) {
    const valoresList = document.getElementById("valores-list");
    const previewId = `valor-preview-${previewCounter++}`;
    const div = document.createElement("div");
    div.className = "valor-item";
    div.dataset.id = valor.id || ""; // Armazena o ID para edição/exclusão
    div.innerHTML = `
        <input type="text" name="valor-titulo" placeholder="Título" value="${valor.titulo}">
        <input type="text" name="valor-subtitulo" placeholder="Subtítulo" value="${valor.subtitulo}">
        <input type="text" name="valor-imagem" placeholder="URL da Imagem" value="${valor.img}">
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

    previewMedia(valor.img, "imagem", previewId);
    div.querySelector(".remove-btn").addEventListener("click", () => valoresList.removeChild(div));
}

// Função para adicionar um novo feedback ao DOM
function adicionarFeedback(feedback = { id: null, img: "", nome: "", comentario: "" }) {
    const feedbacksList = document.getElementById("feedbacks-list");
    const previewId = `feedback-preview-${previewCounter++}`;
    const div = document.createElement("div");
    div.className = "feedback-item";
    div.dataset.id = feedback.id || ""; // Armazena o ID para edição/exclusão
    div.innerHTML = `
        <input type="text" name="feedback-imagem" placeholder="URL da Imagem" value="${feedback.img}">
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

    previewMedia(feedback.img, "imagem", previewId);
    div.querySelector(".remove-btn").addEventListener("click", () => feedbacksList.removeChild(div));
}

// Função para salvar as alterações
async function salvarTextos(event) {
    event.preventDefault();

    const form = document.getElementById("textos-form");
    const tipoApresentacao = form.querySelector("#tipo-apresentacao").value;
    const imagensInput = form.querySelector("#imagens-apresentacao").value;
    const videoInput = form.querySelector("#video-apresentacao").value;

    try {
        // Atualizar mli_ajustes (só linha id = 1)
        await fetch("https://backand.meuleaditapema.com.br/edit-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                table: "mli_ajustes",
                action: "update",
                data: {
                    titulo: form.querySelector("#titulo-principal").value,
                    subtitulo: form.querySelector("#subtitulo").value,
                    tipo_apn: tipoApresentacao === "imagem" ? 1 : 2,
                    video: videoInput || null,
                    imagens: imagensInput ? imagensInput.split(",").map(u => u.trim()).filter(u => u) : []
                }
            })
        });

        // Atualizar/Criar/Excluir mli_valores
        const valoresItems = document.querySelectorAll(".valor-item");
        for (const item of valoresItems) {
            const id = item.dataset.id;
            const valorData = {
                img: item.querySelector("[name='valor-imagem']").value,
                titulo: item.querySelector("[name='valor-titulo']").value,
                subtitulo: item.querySelector("[name='valor-subtitulo']").value
            };
            if (id) {
                // Atualizar
                await fetch("https://backand.meuleaditapema.com.br/edit-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        table: "mli_valores",
                        action: "update",
                        data: { id, ...valorData }
                    })
                });
            } else {
                // Criar
                await fetch("https://backand.meuleaditapema.com.br/edit-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        table: "mli_valores",
                        action: "create",
                        data: valorData
                    })
                });
            }
        }

        // Atualizar/Criar/Excluir mli_feedbacks
        const feedbacksItems = document.querySelectorAll(".feedback-item");
        for (const item of feedbacksItems) {
            const id = item.dataset.id;
            const feedbackData = {
                img: item.querySelector("[name='feedback-imagem']").value,
                nome: item.querySelector("[name='feedback-nome']").value,
                comentario: item.querySelector("[name='feedback-comentario']").value
            };
            if (id) {
                // Atualizar
                await fetch("https://backand.meuleaditapema.com.br/edit-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        table: "mli_feedbacks",
                        action: "update",
                        data: { id, ...feedbackData }
                    })
                });
            } else {
                // Criar
                await fetch("https://backand.meuleaditapema.com.br/edit-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        table: "mli_feedbacks",
                        action: "create",
                        data: feedbackData
                    })
                });
            }
        }

        alert("Dados salvos com sucesso!");
        carregarTextos(); // Recarregar para refletir mudanças
    } catch (error) {
        console.error("Erro ao salvar textos:", error);
        alert("Erro ao salvar os dados. Tente novamente.");
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