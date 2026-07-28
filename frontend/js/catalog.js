document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('viero_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const userStr = localStorage.getItem('viero_user');
    if (userStr) {
        const currentUser = JSON.parse(userStr);
        document.getElementById('loggedUser').textContent = `${currentUser.username} [${currentUser.role}]`;
        
        if (currentUser.role !== 'ADMIN') {
            window.location.href = 'dashboard.html';
        }
    }

    // Elementos
    const tableBody = document.getElementById('catalogTableBody');
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const toast = document.getElementById('toast');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const showToast = (msg, type = 'success') => {
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    };

    // 1. LER
    const loadProducts = async () => {
        try {
            const response = await fetchWithAuth('/products');
            const data = await response.json();

            tableBody.innerHTML = '';
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum produto cadastrado.</td></tr>';
                return;
            }

            data.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.category}</td>
                    <td>${p.subcategory || '-'}</td>
                    <td><strong>${p.name}</strong></td>
                    <td style="color: var(--danger)">${formatCurrency(p.cost_price)}</td>
                    <td style="color: var(--success)">${formatCurrency(p.price)}</td>
                    <td>
                        <button class="action-btn" onclick="openEditModal(${p.id}, '${p.name.replace(/'/g, "\\'")}', '${p.category}', '${p.subcategory || ''}', ${p.price}, ${p.cost_price})">Editar</button>
                        <button class="action-btn danger" onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Erro ao carregar catálogo.</td></tr>`;
        }
    };

    // 2. ABRIR MODAL (Criar)
    document.getElementById('btnNewProduct').addEventListener('click', () => {
        form.reset();
        document.getElementById('productId').value = '';
        modalTitle.textContent = 'Novo Produto';
        modal.classList.add('active');
    });

    // 3. ABRIR MODAL (Editar) - Função Global
    window.openEditModal = (id, name, category, subcategory, price, cost) => {
        document.getElementById('productId').value = id;
        document.getElementById('prodName').value = name;
        document.getElementById('prodCategory').value = category;
        document.getElementById('prodSubcategory').value = subcategory;
        document.getElementById('prodPrice').value = price;
        document.getElementById('prodCost').value = cost;
        
        modalTitle.textContent = 'Editar Produto';
        modal.classList.add('active');
    };

    document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.remove('active'));

    // 4. SALVAR (Criar ou Atualizar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('productId').value;
        const payload = {
            name: document.getElementById('prodName').value,
            category: document.getElementById('prodCategory').value,
            subcategory: document.getElementById('prodSubcategory').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            cost_price: parseFloat(document.getElementById('prodCost').value)
        };

        const isUpdate = id !== '';
        const url = isUpdate ? `/products/${id}` : '/products';
        const method = isUpdate ? 'PUT' : 'POST';

        const btn = document.getElementById('btnSaveProduct');
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        try {
            const response = await fetchWithAuth(url, {
                method: method,
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao salvar produto.');

            showToast(data.message);
            modal.classList.remove('active');
            loadProducts();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Salvar Produto';
        }
    });

    // 5. DELETAR PRODUTO - Função Global
    window.deleteProduct = async (id, name) => {
        if (!confirm(`Tem certeza que deseja apagar permanentemente o produto "${name}"?`)) return;

        try {
            const response = await fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao excluir produto.');

            showToast(data.message);
            loadProducts();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('viero_token');
        localStorage.removeItem('viero_user');
        window.location.href = 'index.html';
    });

    // Inicia a tela
    loadProducts();
});