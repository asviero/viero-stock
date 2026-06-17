document.addEventListener('DOMContentLoaded', () => {
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

    // Elementos da Interface
    const tableBody = document.getElementById('inventoryTableBody');
    const tableHeaderRow = document.getElementById('tableHeaderRow');
    const pageTitle = document.getElementById('pageTitle');
    const dashboardMetrics = document.getElementById('dashboardMetrics');
    const modal = document.getElementById('moveModal');
    const moveForm = document.getElementById('moveForm');
    const toast = document.getElementById('toast');
    let currentActiveBarId = null;

    const showToast = (msg, type = 'success') => {
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    };

    // Função auxiliar para desenhar a tabela
    const renderTable = (data, isGeneralDashboard = false) => {
        tableBody.innerHTML = '';
        
        // cabeçalhos
        if (isGeneralDashboard) {
            tableHeaderRow.innerHTML = `<th>Categoria</th><th>Subcategoria</th><th>Produto</th><th>Soma Total</th>`;
        } else {
            tableHeaderRow.innerHTML = `<th>Categoria</th><th>Subcategoria</th><th>Produto</th><th>Qtd Atual</th><th>Ação</th>`;
        }

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${isGeneralDashboard ? 4 : 5}" style="text-align: center;">Nenhum dado encontrado.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const qty = isGeneralDashboard ? item.total_quantity : item.quantity;
            const tr = document.createElement('tr');
            
            let rowHTML = `
                <td>${item.category}</td>
                <td>${item.subcategory || '-'}</td>
                <td>${item.name}</td>
                <td><strong style="color: ${qty <= 0 ? 'var(--danger)' : 'inherit'}">${qty || 0}</strong></td>
            `;

            if (!isGeneralDashboard) {
                rowHTML += `
                    <td>
                        <button class="action-btn" onclick="openModal(${item.product_id}, '${item.name.replace(/'/g, "\\'")}')">Movimentar</button>
                    </td>
                `;
            }

            tr.innerHTML = rowHTML;
            tableBody.appendChild(tr);
        });
    };

    // --- DASHBOARD GERAL ---
    const loadDashboard = async () => {
        currentActiveBarId = null;
        pageTitle.textContent = 'Visão Geral do Estoque';
        dashboardMetrics.style.display = 'grid'; // Mostra os cards
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Calculando...</td></tr>';

        try {
            const [stockRes, topRes, criticalRes] = await Promise.all([
                fetchWithAuth('/dashboard/general-stock'),
                fetchWithAuth('/dashboard/top-sellers'),
                fetchWithAuth('/dashboard/critical')
            ]);

            const stockData = await stockRes.json();
            const topData = await topRes.json();
            const criticalData = await criticalRes.json();

            // 1. Total em estoque
            const totalItems = stockData.reduce((acc, item) => acc + (item.total_quantity || 0), 0);
            document.getElementById('metricTotalStock').textContent = totalItems;

            // 2. Mais vendidos
            document.getElementById('metricTopSeller').textContent = 
                topData.length > 0 ? `${topData[0].name} (${topData[0].total_sold})` : 'Nenhuma Venda';

            // 3. Alertas Críticos
            const alertEl = document.getElementById('metricAlerts');
            alertEl.textContent = criticalData.length;
            alertEl.style.color = criticalData.length > 0 ? 'var(--danger)' : 'var(--success)';

            // 4. Renderiza a tabela em modo leitura
            renderTable(stockData, true);

        } catch (error) {
            console.error(error);
            showToast('Erro ao carregar a dashboard', 'error');
        }
    };

    // --- ESTOQUE POR BAR ---
    const loadInventory = async (barId, barName) => {
        currentActiveBarId = barId;
        pageTitle.textContent = `Estoque: ${barName}`;
        dashboardMetrics.style.display = 'none';
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Carregando...</td></tr>';

        try {
            const response = await fetchWithAuth(`/inventory/bar/${barId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao carregar estoque');
            renderTable(data, false);
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    };

    // --- LOGS DE AUDITORIA ---
    const loadAuditLogs = async () => {
        currentActiveBarId = null;
        pageTitle.textContent = 'Logs de Auditoria';
        dashboardMetrics.style.display = 'none';
        
        tableHeaderRow.innerHTML = `<th>Data/Hora</th><th>Usuário</th><th>Bar</th><th>Ação</th><th>Produto</th><th>Qtd</th>`;
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Carregando histórico...</td></tr>';

        try {
            const response = await fetchWithAuth('/audit');
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Erro ao carregar auditoria');

            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma movimentação registrada.</td></tr>';
                return;
            }

            data.forEach(log => {
                const tr = document.createElement('tr');
                
                // Formata a data
                const dateObj = new Date(log.timestamp.replace(' ', 'T'));
                const formattedDate = dateObj.toLocaleString('pt-BR');

                let badge = '';
                if (log.type === 'IN') badge = '<span class="badge in">Entrada</span>';
                else if (log.type === 'OUT') badge = '<span class="badge out">Saída</span>';
                else if (log.type === 'LOSS') badge = '<span class="badge loss">Perda</span>';

                tr.innerHTML = `
                    <td style="color: var(--text-muted); font-size: 0.9rem;">${formattedDate}</td>
                    <td><strong>${log.username}</strong></td>
                    <td>${log.bar_name}</td>
                    <td>${badge}</td>
                    <td>${log.product_name}</td>
                    <td><strong>${log.qty}</strong></td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    };

    // --- NAVEGAÇÃO ---
    document.getElementById('nav-dashboard').addEventListener('click', (e) => {
        e.preventDefault();
        loadDashboard();
    });

    document.getElementById('nav-bar-1').addEventListener('click', (e) => {
        e.preventDefault();
        loadInventory(1, 'Bar Grande');
    });

    document.getElementById('nav-bar-2').addEventListener('click', (e) => {
        e.preventDefault();
        loadInventory(2, 'Bar Pequeno');
    });

    document.getElementById('nav-logs').addEventListener('click', (e) => {
        e.preventDefault();
        loadAuditLogs();
    });

    // --- LÓGICA DO MODAL ---
    window.openModal = (productId, productName) => {
        document.getElementById('modalProductId').value = productId;
        document.getElementById('modalProductName').textContent = productName;
        document.getElementById('moveQty').value = 1;
        modal.classList.add('active');
    };

    document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.remove('active'));

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
            submitBtn.textContent = 'Confirmar';
        }
    });

    // --- LOGOUT ---
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('viero_token');
        localStorage.removeItem('viero_user');
        window.location.href = 'index.html';
    });

    // --- INICIALIZAÇÃO ---
    loadDashboard();
});