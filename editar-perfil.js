// Função principal para inicializar a seção "Editar Perfil"
function inicializarEditarPerfil() {
    const editarPerfilContainer = document.getElementById("editar-perfil-container");
    const editarPerfilForm = document.getElementById("editar-perfil-form");
    const mensagemPerfil = document.getElementById("mensagem-perfil");

    if (!editarPerfilContainer || !editarPerfilForm) {
        console.error("Erro: Elementos necessários não encontrados.");
        return;
    }

    // Função para carregar os dados do corretor
    async function carregarDadosCorretor() {
        const id = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!id || !token) {
            mensagemPerfil.textContent = "Você precisa estar logado para editar seu perfil.";
            mensagemPerfil.classList.add("error");
            return;
        }

        try {
            const response = await fetch(`https://pedepro-meulead.6a7cul.easypanel.host/corretor?id=${id}&token=${token}`);
            if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
            const data = await response.json();

            if (!data.email) {
                throw new Error("Erro ao carregar dados do corretor.");
            }

            document.getElementById("name").value = data.name || '';
            document.getElementById("phone").value = data.phone || '';
            document.getElementById("creci").value = data.creci || '';
            document.getElementById("email").value = data.email || '';
        } catch (error) {
            console.error("Erro ao carregar dados do corretor:", error);
            mensagemPerfil.textContent = "Erro ao carregar seus dados. Tente novamente.";
            mensagemPerfil.classList.add("error");
        }
    }

    // Alternar visibilidade dos campos de senha
    const togglePasswordBtn = document.getElementById("toggle-password-btn");
    const passwordFields = document.getElementById("password-fields");
    togglePasswordBtn.addEventListener("click", () => {
        if (passwordFields.style.display === "none") {
            passwordFields.style.display = "block";
            togglePasswordBtn.textContent = "Cancelar Alteração de Senha";
        } else {
            passwordFields.style.display = "none";
            togglePasswordBtn.textContent = "Alterar Senha";
            document.getElementById("current-password").value = "";
            document.getElementById("new-password").value = "";
        }
    });

    // Função para salvar as alterações
    editarPerfilForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!id || !token) {
            mensagemPerfil.textContent = "Você precisa estar logado para editar seu perfil.";
            mensagemPerfil.classList.add("error");
            return;
        }

        const formData = new FormData(e.target);
        const updatedData = {
            name: formData.get("name"),
            phone: formData.get("phone"),
            creci: formData.get("creci"),
            email: formData.get("email"),
            current_password: formData.get("current_password") || null,
            new_password: formData.get("new_password") || null,
            id,
            token
        };

        try {
            const response = await fetch("https://pedepro-meulead.6a7cul.easypanel.host/corretor/dados", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            if (response.ok) {
                mensagemPerfil.textContent = "Perfil atualizado com sucesso!";
                mensagemPerfil.classList.remove("error");
                mensagemPerfil.classList.add("success");
                // Aqui você pode chamar atualizarInterfaceLogin() se ela existir no seu código
            } else {
                mensagemPerfil.textContent = `Erro: ${result.error}`;
                mensagemPerfil.classList.remove("success");
                mensagemPerfil.classList.add("error");
            }
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            mensagemPerfil.textContent = "Erro ao atualizar perfil. Tente novamente.";
            mensagemPerfil.classList.remove("success");
            mensagemPerfil.classList.add("error");
        }
    });

    // Carregar os dados ao inicializar
    carregarDadosCorretor();
}

// Chama a função de inicialização sempre que a seção for acessada
inicializarEditarPerfil();