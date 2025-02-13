const apiUrl = "http://localhost:2031/graphql";  // Endereço do servidor intermediário
const email = 'joao@email.com'; // Email de teste
const token = '1fcd1149-c12f-40f8-be66-28bd08761a40'; // Token de teste

// Query GraphQL com email e token como variáveis
const query = `
  query MyQuery($email: String!, $token: uuid!) {
    user(where: {email: {_eq: $email}, token: {_eq: $token}}) {
      email
      name
      phone
      creation_date
      restaurantes(limit: 1) {
        cnpj
        credit_Card
        debit_Card
        id
        logo
        name
        phone
        slug
        type
        ordersHistoryByOrdersHistory {
          id
        }
      }
    }
  }
`;

async function fetchRestaurantData() {
  try {
    // Log de variáveis antes de enviar a requisição
    console.log('Enviando dados para o servidor intermediário:');
    console.log('Email:', email);
    console.log('Token:', token);

    // Certifique-se de que `email` e `token` não sejam undefined
    if (!email || !token) {
      throw new Error("Email ou token ausentes");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          email,  // Passa o email como variável
          token,  // Passa o token como variável
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Resposta completa do servidor intermediário:", responseData);

    // Verifica se a resposta contém dados do usuário
    const userData = responseData.data?.user;
    console.log("Dados do usuário:", userData);

    // Garantir que estamos recebendo os dados corretamente
    if (userData && userData.length > 0) {
      window.dadosHasura = userData[0]; // Armazenar os dados no `window.dadosHasura`
      console.log("Dados do restaurante salvos no window.dadosHasura:", window.dadosHasura);

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
    } else {
      console.error("Nenhum dado de restaurante encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar dados do restaurante:", error);
  }
}








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

// Executa a função para buscar os dados do restaurante
fetchRestaurantData().then(atualizarTituloPagina);


function atualizarTituloPagina() {
  if (window.dadosHasura && window.dadosHasura.restaurantes && window.dadosHasura.restaurantes.length > 0) {
    const nomeRestaurante = window.dadosHasura.restaurantes[0].name;
    document.title = `${nomeRestaurante} - PedePro`;
  } else {
    console.error("Dados do restaurante não encontrados no window.dadosHasura.");
  }
}