document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica o token do usuário
    const token = localStorage.getItem('viero_token');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const userStr = localStorage.getItem('viero_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        document.getElementById('loggedUser').textContent = `${user.username} [${user.role}]`;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('viero_token');
            localStorage.removeItem('viero_user');
            window.location.href = 'index.html';
        });
    }
});