(async function initializeFacebookPixelConfig() {
    const pixelInput = document.getElementById('pixel-id');
    const saveButton = document.getElementById('save-button');
    const baseUrl = 'https://backand.meuleaditapema.com.br';
  
    // Função para buscar o valor do Facebook Pixel
    async function fetchFacebookPixel() {
      try {
        const response = await fetch(`${baseUrl}/ajustes/facebook-pixel`);
        if (!response.ok) throw new Error('Erro ao buscar o Pixel');
        const data = await response.json();
        pixelInput.value = data.facebook_pixel || '';
      } catch (error) {
        console.error('Erro ao carregar o Facebook Pixel:', error);
        pixelInput.value = '';
      }
    }
  
    // Função para salvar o valor do Facebook Pixel
    async function saveFacebookPixel() {
      const pixelValue = pixelInput.value.trim();
      if (!pixelValue) {
        alert('Por favor, insira um identificador de Pixel válido.');
        return;
      }
  
      try {
        const response = await fetch(`${baseUrl}/ajustes/facebook-pixel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ facebook_pixel: pixelValue }),
        });
  
        if (!response.ok) throw new Error('Erro ao salvar o Pixel');
        const data = await response.json();
        alert(data.message || 'Pixel salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar o Facebook Pixel:', error);
        alert('Erro ao salvar o Pixel. Tente novamente.');
      }
    }
  
    // Carrega o valor inicial automaticamente
    await fetchFacebookPixel();
  
    // Adiciona evento ao botão de salvar
    saveButton.addEventListener('click', saveFacebookPixel);
  })();