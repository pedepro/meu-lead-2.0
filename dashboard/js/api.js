document.addEventListener('DOMContentLoaded', function() {
  // Obtém o parâmetro de sessão da URL
  const urlParams = new URLSearchParams(window.location.search);
  const session = urlParams.get('session');

  const sessionFunctions = {
      pedidos: pedidos,
      clientes: clientes,
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




