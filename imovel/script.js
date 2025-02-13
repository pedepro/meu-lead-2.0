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

      document.getElementById("titulo-imovel").textContent = imovel.texto_principal;
      document.getElementById("slider-imagens").innerHTML = imovel.imagens
          .map(img => `<img src="${img}" alt="Imagem do Imóvel">`)
          .join('');
      document.getElementById("preco-imovel").textContent = `R$ ${imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
      document.getElementById("descricao-imovel").innerHTML = `
          <p><strong>Tipo:</strong> ${imovel.tipo}</p>
          <p><strong>Endereço:</strong> ${imovel.endereco}</p>
          <p><strong>Descrição:</strong> ${imovel.descricao}</p>
          <p><strong>Quartos:</strong> ${imovel.quartos}</p>
          <p><strong>Banheiros:</strong> ${imovel.banheiros}</p>
          <p><strong>Área:</strong> ${imovel.metros_quadrados} m²</p>
          <p><strong>Andar:</strong> ${imovel.andar}</p>
          <p><strong>Mobiliado:</strong> ${imovel.mobiliado ? "Sim" : "Não"}</p>
      `;

      // Pegando os elementos e verificando se existem
      const btnConectar = document.getElementById("btn-conectar");
      const textoConectar = document.getElementById("texto-conectar");

      if (btnConectar && textoConectar) {
          const precoContato = Number(imovel.price_contato) || 39.90; // Converte para número e usa 39.90 como fallback
          btnConectar.textContent = `Conectar-se com o proprietário por R$ ${precoContato.toFixed(2).replace('.', ',')}`;
          textoConectar.textContent = `Ao pagar R$ ${precoContato.toFixed(2).replace('.', ',')}, você pode entrar em contato diretamente com o proprietário para tirar dúvidas e negociar.`;
      }

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

      // Criando a estrutura do popup
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

      // Adicionando a notificação ao body
      document.body.appendChild(overlay);

      // Eventos dos botões
      document.getElementById("notificacao-btn-login").addEventListener("click", () => {
          window.location.href = "/login"; // Redireciona para a página de login
      });

      document.getElementById("notificacao-btn-cancelar").addEventListener("click", () => {
          document.body.removeChild(overlay);
      });
  }

  // Adicionando evento aos botões principais
  document.getElementById("btn-afiliar").addEventListener("click", () => {
      if (verificarLogin("afiliar-se")) {
          console.log("Usuário afiliado com sucesso!"); // Aqui você pode colocar a lógica real
      }
  });

  document.getElementById("btn-conectar").addEventListener("click", () => {
      if (verificarLogin("conectar")) {
          console.log("Usuário se conectou com sucesso!"); // Aqui você pode colocar a lógica real
      }
  });
});

