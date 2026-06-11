document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('loginError');

    if (errorMsg) {
        errorMsg.style.color = '#f75a68';
        errorMsg.style.marginTop = '1rem';
        errorMsg.style.textAlign = 'center';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button');

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Autenticando...';
                errorMsg.textContent = '';

                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('viero_token', data.token);
                    localStorage.setItem('viero_user', JSON.stringify(data.user));
                    
                    window.location.href = 'dashboard.html';
                } else {
                    errorMsg.textContent = data.error || 'Falha na autenticação.';
                }
            } catch (error) {
                console.error('Erro de requisição:', error);
                errorMsg.textContent = 'Erro de conexão com o servidor. Verifique se a API está rodando.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Entrar no Sistema';
            }
        });
    }
});