// Função para verificar se o usuário está autenticado
function verificarAutenticacao() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'admin_login.html';
        return false;
    }
    return true;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'admin_login.html';
}

// Função para obter o token de autenticação
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Função para obter os dados do usuário
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Função para verificar se o usuário é admin
function isAdmin() {
    const user = getUser();
    return user && user.role === 'admin';
}

// Função para adicionar o token de autenticação aos headers
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Função para verificar a validade do token
async function verificarToken() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/verify', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        return true;
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        logout();
        return false;
    }
}

// Verificar autenticação ao carregar páginas administrativas
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se estamos em uma página administrativa
    if (window.location.pathname.includes('admin') && !window.location.pathname.includes('login')) {
        if (!verificarAutenticacao()) return;
        
        // Verificar se o token ainda é válido
        const tokenValido = await verificarToken();
        if (!tokenValido) return;

        // Adicionar botão de logout se não existir
        if (!document.getElementById('logout-btn')) {
            const nav = document.querySelector('nav');
            if (nav) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logout-btn';
                logoutBtn.className = 'text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded';
                logoutBtn.textContent = 'Sair';
                logoutBtn.onclick = logout;
                nav.querySelector('div').appendChild(logoutBtn);
            }
        }
    }
}); 