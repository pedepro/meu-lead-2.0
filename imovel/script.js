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
    } catch (error) {
      console.error("Erro ao carregar detalhes do imóvel:", error);
      document.getElementById("detalhes-imovel").innerHTML = "<p>Erro ao carregar detalhes.</p>";
    }
  });
  