const API_BASE_URL = 'http://localhost:3000/api';
const getToken = () => localStorage.getItem('viero_token');

// Configuração base para requisições com autenticação
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    // Desloga o usuário se o token for inválido ou expirado
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('viero_token');
        localStorage.removeItem('viero_user');
        window.location.href = 'index.html';
    }

    return response;
};