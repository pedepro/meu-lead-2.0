let appVersion = "1.0.0";
let facebookPixelId = null;

async function loadVersion() {
    try {
        const response = await fetch('versao.json', {
            cache: 'no-store'
        });
        if (!response.ok) throw new Error('Erro ao carregar versao.json');
        const data = await response.json();
        appVersion = data.version;
        console.log(`Versão da aplicação carregada: ${appVersion}`);
    } catch (error) {
        console.error('Erro ao carregar a versão, usando padrão:', error);
    }
}

// Função para carregar o Facebook Pixel do backend
async function loadFacebookPixel() {
    try {
        const response = await fetch('https://backand.meuleaditapema.com.br/ajustes/facebook-pixel');
        if (!response.ok) throw new Error('Erro ao buscar o Facebook Pixel');
        const data = await response.json();
        facebookPixelId = data.facebook_pixel;
        if (facebookPixelId) {
            initializeFacebookPixel();
        }
    } catch (error) {
        console.error('Erro ao carregar o Facebook Pixel:', error);
    }
}

// Função para inicializar o script do Facebook Pixel
function initializeFacebookPixel() {
    if (!facebookPixelId || document.getElementById('facebook-pixel-script')) {
        return; // Evita recarregar se já foi inicializado ou se não há Pixel
    }

    // Adiciona o script do Facebook Pixel ao <head>
    const script = document.createElement('script');
    script.id = 'facebook-pixel-script';
    script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebookPixelId}');
        fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Adiciona o <noscript> para fallback (opcional)
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
        <img height="1" width="1" style="display:none"
             src="https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1"/>
    `;
    document.head.appendChild(noscript);

    console.log(`Facebook Pixel inicializado com ID: ${facebookPixelId}`);
}

// Função para enviar o evento PageView (usada após a inicialização)
function trackFacebookPageView() {
    if (window.fbq && facebookPixelId) {
        window.fbq('track', 'PageView');
        console.log('Evento PageView enviado ao Facebook Pixel');
    }
}

function syncLocalStorageToCookies() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token) {
        document.cookie = `token=${token}; path=/; domain=.meuleaditapema.com.br; SameSite=Lax`;
    } else {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
    }

    if (userId) {
        document.cookie = `userId=${userId}; path=/; domain=.meuleaditapema.com.br; SameSite=Lax`;
    } else {
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
    }
}

function syncCookiesToLocalStorage() {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
    }, {});

    if (cookies.token && !localStorage.getItem("token")) {
        localStorage.setItem("token", cookies.token);
    }
    if (cookies.userId && !localStorage.getItem("userId")) {
        localStorage.setItem("userId", cookies.userId);
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.meuleaditapema.com.br;";
    window.location.href = "/login";
}

async function verificarLogin() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        return false;
    }

    try {
        const url = `https://pedepro-meulead.6a7cul.easypanel.host/corretor?id=${userId}&token=${token}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (response.ok && !data.error) {
            document.body.classList.add("logged-in");
            return true;
        } else {
            console.log("Credenciais inválidas ou erro na resposta:", data.error);
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            syncLocalStorageToCookies();
            return false;
        }
    } catch (error) {
        console.error("Erro ao verificar login no servidor:", error);
        return false;
    }
}

async function updateDropdown() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const isLoggedIn = await verificarLogin();

    dropdownMenu.innerHTML = '';

    const termsItem = '<li><a href="https://terms-of-use.meuleaditapema.com.br" target="_blank">Ver Termos de Uso</a></li>';
    const privacyItem = '<li><a href="https://privacy.meuleaditapema.com.br" target="_blank">Ver Políticas de Privacidade</a></li>';

    if (isLoggedIn) {
        dropdownMenu.innerHTML = `
            <li><a href="?session=editar-perfil" id="edit-profile-link">Editar Perfil</a></li>
            ${termsItem}
            ${privacyItem}
            <li><a href="#" onclick="logout()">Sair</a></li>
        `;
    } else {
        dropdownMenu.innerHTML = `
            ${termsItem}
            ${privacyItem}
            <li><a href="/login">Fazer Login</a></li>
        `;
    }

    if (isLoggedIn) {
        document.getElementById('edit-profile-link').addEventListener('click', async (e) => {
            e.preventDefault();
            await loadContent('editar-perfil');
            window.history.pushState({}, '', '?session=editar-perfil');
            document.getElementById('user-dropdown').classList.remove('active');
        });
    }
}

function getSessionParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session') || 'home';
}

function updateActiveSection(session) {
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
        const linkSession = new URLSearchParams(link.search).get('session');
        if (linkSession === session) {
            link.classList.add('active');
        }
    });
}

async function loadContent(session) {
    const mainContent = document.getElementById('main-content');
    let htmlFileToLoad = '';
    let jsFileToLoad = '';
    let cssFileToLoad = '';
    let sectionTitle = '';

    switch (session) {
        case 'home':
            htmlFileToLoad = `subpaginas/home.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/home.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/home.css?v=${appVersion}`;
            sectionTitle = 'Home';
            break;
        case 'imoveis':
            htmlFileToLoad = `subpaginas/imoveis.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/imoveis.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/imoveis.css?v=${appVersion}`;
            sectionTitle = 'Imóveis';
            break;
        case 'leads':
            htmlFileToLoad = `subpaginas/leads.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/leads.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/leads.css?v=${appVersion}`;
            sectionTitle = 'Leads (Clientes)';
            break;
        case 'meusleads':
            htmlFileToLoad = `subpaginas/meusleads.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/meusleads.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/meusleads.css?v=${appVersion}`;
            sectionTitle = 'Meus Leads';
            break;
        case 'meusimoveis':
            htmlFileToLoad = `subpaginas/meusimoveis.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/meusimoveis.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/meusimoveis.css?v=${appVersion}`;
            sectionTitle = 'Meus Imóveis';
            break;
        case 'meuspedidos':
            htmlFileToLoad = `subpaginas/meuspedidos.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/meuspedidos.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/meuspedidos.css?v=${appVersion}`;
            sectionTitle = 'Meus Pedidos';
            break;
        case 'editar-perfil':
            htmlFileToLoad = `subpaginas/editar-perfil.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/editar-perfil.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/editar-perfil.css?v=${appVersion}`;
            sectionTitle = 'Editar Perfil';
            break;
        default:
            htmlFileToLoad = `subpaginas/home.html?v=${appVersion}`;
            jsFileToLoad = `subpaginas/home.js?v=${appVersion}`;
            cssFileToLoad = `subpaginas/home.css?v=${appVersion}`;
            sectionTitle = 'Home';
    }

    fetch(htmlFileToLoad, { cache: 'no-store' })
        .then(response => {
            if (!response.ok) throw new Error('Arquivo HTML não encontrado');
            console.log(`HTML versão ${appVersion} carregado: ${htmlFileToLoad}`);
            return response.text();
        })
        .then(data => {
            if (session === 'home') {
                mainContent.innerHTML = data;
            } else {
                mainContent.innerHTML = `
                    <div class="section-header">
                        <a href="/" class="home-link" title="Voltar para Home">
                            <i class="fa-solid fa-house"></i> Voltar ao Início
                        </a>
                    </div>
                    ${data}
                `;
            }

            const existingScripts = document.querySelectorAll('script[data-dynamic]');
            existingScripts.forEach(script => script.remove());
            const existingStyles = document.querySelectorAll('link[data-dynamic]');
            existingStyles.forEach(style => style.remove());

            if (cssFileToLoad) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFileToLoad;
                link.setAttribute('data-dynamic', 'true');
                link.onload = () => console.log(`CSS versão ${appVersion} carregado: ${cssFileToLoad}`);
                link.onerror = () => console.error(`Erro ao carregar ${cssFileToLoad}`);
                document.head.appendChild(link);
            }

            if (jsFileToLoad) {
                const script = document.createElement('script');
                script.src = jsFileToLoad;
                script.setAttribute('data-dynamic', 'true');
                script.onload = () => console.log(`JS versão ${appVersion} carregado: ${jsFileToLoad}`);
                script.onerror = () => console.error(`Erro ao carregar ${jsFileToLoad}`);
                document.body.appendChild(script);
            }

            updateActiveSection(session);
            trackFacebookPageView(); // Dispara o evento PageView após carregar o conteúdo
        })
        .catch(error => {
            if (session === 'home') {
                mainContent.innerHTML = `
                    <p>Erro ao carregar o conteúdo. Tente novamente.</p>
                `;
            } else {
                mainContent.innerHTML = `
                    <div class="section-header">
                        <h2>Erro</h2>
                        <a href="/" class="home-link" title="Voltar para Home">
                            <i class="fa-solid fa-house"></i> Voltar ao Início
                        </a>
                    </div>
                    <p>Erro ao carregar o conteúdo. Tente novamente.</p>
                `;
            }
            console.error(error);
        });
}

document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
    if (window.innerWidth > 600) {
        document.querySelector('.main-content').style.marginLeft = 
            document.querySelector('.sidebar').classList.contains('open') ? '250px' : '0';
    }
});

document.getElementById('user-icon').addEventListener('click', () => {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown');
    const userIcon = document.getElementById('user-icon');
    if (!dropdown.contains(e.target) && !userIcon.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

window.onload = async () => {
    await loadVersion();
    await loadFacebookPixel(); // Carrega o Pixel antes de tudo
    syncCookiesToLocalStorage();
    await updateDropdown();
    const session = getSessionParam();
    await loadContent(session);
    syncLocalStorageToCookies();
    trackFacebookPageView(); // Dispara o evento PageView no carregamento inicial
};

document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const session = new URLSearchParams(link.search).get('session');
        await loadContent(session);
        window.history.pushState({}, '', `?session=${session}`);
        if (window.innerWidth <= 600) {
            document.querySelector('.sidebar').classList.remove('open');
        }
    });
});