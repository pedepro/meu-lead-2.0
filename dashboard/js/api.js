document.addEventListener('DOMContentLoaded', function() {
  // Obtém o parâmetro de sessão da URL
  const urlParams = new URLSearchParams(window.location.search);
  const session = urlParams.get('session');

  const sessionFunctions = {
      pedidos: pedidos,
      clientes: clientes,
      cadastroimovel: cadastroImovel,
      listaimoveis: listaImovel,
      estatisticas: estatisticas
  };

  // Chama a função associada à sessão, caso exista
  if (sessionFunctions[session]) {
      sessionFunctions[session]();
  } else {
      console.error("Nenhuma função correspondente para o parâmetro de sessão:", session);
  }
});








// Funções para carregar os arquivos pedidos e clientes
function pedidos() {
  // Carrega o CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'pedidos/pedidos.css';
  document.head.appendChild(link);

  // Carrega o HTML
  fetch('pedidos/pedidos.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('dashboard-container').innerHTML = html;

      // Carrega o JS
      const script = document.createElement('script');
      script.src = 'pedidos/pedidos.js';
      document.body.appendChild(script);
    })
    .catch(error => console.error("Erro ao carregar o HTML pedidos:", error));
}

function clientes() {
  // Carrega o CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'clientes/clientes.css';
  document.head.appendChild(link);

  // Carrega o HTML
  fetch('clientes/clientes.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('dashboard-container').innerHTML = html;

      // Carrega o JS
      const script = document.createElement('script');
      script.src = 'clientes/clientes.js';
      document.body.appendChild(script);
    })
    .catch(error => console.error("Erro ao carregar o HTML clientes:", error));
}


// Funções para carregar os arquivos
function cadastroImovel() {
  // Carrega o HTML
  fetch('cadastro-imovel/index.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('dashboard-container').innerHTML = html;

      // Carrega o JS
      const script = document.createElement('script');
      script.src = 'cadastro-imovel/script.js';
      script.onload = function() {
        console.log('Script JS carregado com sucesso');
        // Após o script carregar, carrega os tipos.json
        carregarTiposImoveis();
      };
      script.onerror = function() {
        console.error('Erro ao carregar o script JS');
      };
      document.body.appendChild(script);
    })
    .catch(error => console.error("Erro ao carregar o HTML de cadastro-imovel:", error));
}

// Função para carregar os tipos de imóveis do tipos.json
function carregarTiposImoveis() {
  fetch('cadastro-imovel/tipos.json')
    .then(response => response.json())
    .then(tipos => {
      console.log('Tipos carregados:', tipos);
      const select = document.getElementById('tipoSelect');
      if (select) {
        tipos.forEach(tipo => {
          const option = document.createElement('option');
          option.value = tipo;
          option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
          select.appendChild(option);
        });
        console.log('Opções adicionadas ao select de tipos');
      } else {
        console.error('Elemento tipoSelect não encontrado no DOM');
      }
    })
    .catch(error => console.error('Erro ao carregar tipos.json:', error));
}



// Funções para carregar os arquivos
function listaImovel() {
  // Carrega o HTML
  fetch('lista-imoveis/index.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('dashboard-container').innerHTML = html;

      // Carrega o JS
      const script = document.createElement('script');
      script.src = 'lista-imoveis/script.js';
      script.onload = function() {
        console.log('Script JS carregado com sucesso');
        // Após o script carregar, carrega os tipos.json
      };
      script.onerror = function() {
        console.error('Erro ao carregar o script JS');
      };
      document.body.appendChild(script);
    })
    .catch(error => console.error("Erro ao carregar o HTML de cadastro-imovel:", error));
}

// Funções para carregar os arquivos
function estatisticas() {
  // Carrega o HTML
  fetch('estatisticas/estatisticas.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('dashboard-container').innerHTML = html;

      // Carrega o JS
      const script = document.createElement('script');
      script.src = 'estatisticas/estatisticas.js';
      script.onload = function() {
        console.log('Script JS carregado com sucesso');
        // Após o script carregar, carrega os tipos.json
      };
      script.onerror = function() {
        console.error('Erro ao carregar o script JS');
      };
      document.body.appendChild(script);
    })
    .catch(error => console.error("Erro ao carregar o HTML de estatisticas:", error));
}