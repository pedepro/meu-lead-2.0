document.addEventListener('DOMContentLoaded', function() {
  // Obtém o parâmetro de sessão da URL
  const urlParams = new URLSearchParams(window.location.search);
  const session = urlParams.get('session');

  const sessionFunctions = {
      pedidos: pedidos,
      clientes: clientes,
      cadastroimovel: cadastroImovel,
      listaimoveis: listaImovel,
      estatisticas: estatisticas,
      Rastreamento: rastreamento,
      configuracoes: configuracoes,
      corretores: corretores,
      chatbot: chatbot
  };

  // Verifica se session é nulo, vazio ou corresponde a uma função existente
  if (!session || session === '') {
      // Carrega estatisticas por padrão se session não existe ou está vazio
      estatisticas();
  } else if (sessionFunctions[session]) {
      // Carrega a função correspondente ao session, se existir
      sessionFunctions[session]();
  } else {
      console.error("Nenhuma função correspondente para o parâmetro de sessão:", session);
  }
});

// Funções para carregar os arquivos pedidos e clientes
function pedidos() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'pedidos/pedidos.css';
  document.head.appendChild(link);

  fetch('pedidos/pedidos.html')
      .then(response => response.text())
      .then(html => {
          document.getElementById('dashboard-container').innerHTML = html;
          const script = document.createElement('script');
          script.src = 'pedidos/pedidos.js';
          document.body.appendChild(script);
      })
      .catch(error => console.error("Erro ao carregar o HTML pedidos:", error));
}

function clientes() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'clientes/clientes.css';
  document.head.appendChild(link);

  fetch('clientes/clientes.html')
      .then(response => response.text())
      .then(html => {
          document.getElementById('dashboard-container').innerHTML = html;
          const script = document.createElement('script');
          script.src = 'clientes/clientes.js';
          document.body.appendChild(script);
      })
      .catch(error => console.error("Erro ao carregar o HTML clientes:", error));
}

function cadastroImovel() {
  fetch('cadastro-imovel/index.html')
      .then(response => response.text())
      .then(html => {
          document.getElementById('dashboard-container').innerHTML = html;
          const script = document.createElement('script');
          script.src = 'cadastro-imovel/script.js';
          script.onload = function() {
              console.log('Script JS carregado com sucesso');
              carregarTiposImoveis();
          };
          script.onerror = function() {
              console.error('Erro ao carregar o script JS');
          };
          document.body.appendChild(script);
      })
      .catch(error => console.error("Erro ao carregar o HTML de cadastro-imovel:", error));
}

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

function listaImovel() {
  fetch('lista-imoveis/index.html')
      .then(response => response.text())
      .then(html => {
          document.getElementById('dashboard-container').innerHTML = html;
          const script = document.createElement('script');
          script.src = 'lista-imoveis/script.js';
          script.onload = function() {
              console.log('Script JS carregado com sucesso');
          };
          script.onerror = function() {
              console.error('Erro ao carregar o script JS');
          };
          document.body.appendChild(script);
      })
      .catch(error => console.error("Erro ao carregar o HTML de cadastro-imovel:", error));
}

function estatisticas() {
  fetch('estatisticas/estatisticas.html')
      .then(response => response.text())
      .then(html => {
          document.getElementById('dashboard-container').innerHTML = html;
          const script = document.createElement('script');
          script.src = 'estatisticas/estatisticas.js';
          script.onload = function() {
              console.log('Script JS carregado com sucesso');
          };
          script.onerror = function() {
              console.error('Erro ao carregar o script JS');
          };
          document.body.appendChild(script);
      })
      .catch(error => console.error("Erro ao carregar o HTML de estatisticas:", error));
}

function rastreamento() {
  fetch('rastreamento/rastreamento.html')
      .then(response => response.text())
      .then(html => {
          document.getElementById('dashboard-container').innerHTML = html;
          const script = document.createElement('script');
          script.src = 'rastreamento/rastreamento.js';
          script.onload = function() {
              console.log('Script JS carregado com sucesso');
          };
          script.onerror = function() {
              console.error('Erro ao carregar o script JS');
          };
          document.body.appendChild(script);
      })
      .catch(error => console.error("Erro ao carregar o HTML de estatisticas:", error));
}

function configuracoes() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'configuracoes/styles.css';
    document.head.appendChild(link);
  
    fetch('configuracoes/index.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('dashboard-container').innerHTML = html;
            const script = document.createElement('script');
            script.src = 'configuracoes/script.js';
            document.body.appendChild(script);
        })
        .catch(error => console.error("Erro ao carregar o HTML clientes:", error));
  }


  function corretores() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'corretores/corretores.css';
    document.head.appendChild(link);
  
    fetch('corretores/corretores.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('dashboard-container').innerHTML = html;
            const script = document.createElement('script');
            script.src = 'corretores/corretores.js';
            document.body.appendChild(script);
        })
        .catch(error => console.error("Erro ao carregar o HTML clientes:", error));
  }
  

  function chatbot() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'chatbot/chatbot.css';
    document.head.appendChild(link);
  
    fetch('chatbot/chatbot.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('dashboard-container').innerHTML = html;
            const script = document.createElement('script');
            script.src = 'chatbot/chatbot.js';
            document.body.appendChild(script);
        })
        .catch(error => console.error("Erro ao carregar o HTML clientes:", error));
  }
  