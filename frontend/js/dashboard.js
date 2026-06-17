document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Autenticação Básica
    const token = localStorage.getItem('viero_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const userStr = localStorage.getItem('viero_user');
    let currentUser = null;
    if (userStr) {
        currentUser = JSON.parse(userStr);
        document.getElementById('loggedUser').textContent = `${currentUser.username} [${currentUser.role}]`;
    }

    // 2. Elementos da Interface
    const tableBody = document.getElementById('inventoryTableBody');
    const pageTitle = document.getElementById('pageTitle');
    const modal = document.getElementById('moveModal');
    const moveForm = document.getElementById('moveForm');
    const toast = document.getElementById('toast');
    let currentActiveBarId = null;

    // 3. Função para Exibir Mensagens
    const showToast = (msg, type = 'success') => {
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    };

    // 4. Função Principal: Buscar e Renderizar o Estoque
    const loadInventory = async (barId, barName) => {
        currentActiveBarId = barId;
        pageTitle.textContent = `Estoque: ${barName}`;
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Carregando...</td></tr>';

        try {
            const response = await fetchWithAuth(`/inventory/bar/${barId}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao carregar estoque');

            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum produto encontrado.</td></tr>';
                return;
            }

            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.category}</td>
                    <td>${item.subcategory || '-'}</td>
                    <td>${item.name}</td>
                    <td><strong style="color: ${item.quantity <= 0 ? 'var(--danger)' : 'inherit'}">${item.quantity}</strong></td>
                    <td>
                        <button class="action-btn" onclick="openModal(${item.product_id}, '${item.name.replace(/'/g, "\\'")}')">
                            Movimentar
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger);">${error.message}</td></tr>`;
        }
    };

    // 5. Navegação do Menu Lateral
    document.getElementById('nav-bar-1').addEventListener('click', (e) => {
        e.preventDefault();
        loadInventory(1, 'Bar Grande');
    });

    document.getElementById('nav-bar-2').addEventListener('click', (e) => {
        e.preventDefault();
        loadInventory(2, 'Bar Pequeno');
    });

    // 6. Lógica do Modal de Movimentação
    window.openModal = (productId, productName) => {
        document.getElementById('modalProductId').value = productId;
        document.getElementById('modalProductName').textContent = productName;
        document.getElementById('moveQty').value = 1; // Reseta a quantidade para 1
        modal.classList.add('active');
    };

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    moveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('modalProductId').value;
        const type = document.getElementById('moveType').value;
        const qty = parseInt(document.getElementById('moveQty').value);
        const submitBtn = moveForm.querySelector('button');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processando...';

            const response = await fetchWithAuth(`/inventory/bar/${currentActiveBarId}/move`, {
                method: 'POST',
                body: JSON.stringify({ productId, type, qty })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Movimentação registrada com sucesso!');
                modal.classList.remove('active');
                loadInventory(currentActiveBarId, pageTitle.textContent.replace('Estoque: ', ''));
            } else {
                throw new Error(data.error || 'Erro ao movimentar.');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Movimentação';
        }
    });

    // 7. Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('viero_token');
        localStorage.removeItem('viero_user');
        window.location.href = 'index.html';
    });
});