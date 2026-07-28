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
    }

    const tableBody = document.getElementById('cmvTableBody');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const loadCMVReport = async () => {
        try {
            const response = await fetchWithAuth('/financial/cmv');
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao cargev_cmv');

            let generalRevenue = 0;
            let generalCMV = 0;
            let generalProfit = 0;

            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Nenhuma venda registrada para cálculo de CMV.</td></tr>';
                return;
            }

            data.forEach(item => {
                generalRevenue += item.total_revenue;
                generalCMV += item.total_cmv;
                generalProfit += item.profit;

                // Margem de lucro percentual do produto (Markup/Margem)
                const marginPercent = item.total_revenue > 0 
                    ? ((item.profit / item.total_revenue) * 100).toFixed(1) 
                    : 0;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${item.name}</strong> <small style="color: var(--text-muted)">(${item.category})</small></td>
                    <td>${item.qty_sold} un.</td>
                    <td>${formatCurrency(item.cost_price)}</td>
                    <td>${formatCurrency(item.sale_price)}</td>
                    <td style="color: var(--primary-hover)">${formatCurrency(item.total_revenue)}</td>
                    <td style="color: var(--danger)">${formatCurrency(item.total_cmv)}</td>
                    <td style="color: var(--success)">+${marginPercent}%</td>
                `;
                tableBody.appendChild(tr);
            });

            // Atualiza os Cards Superiores
            document.getElementById('finRevenue').textContent = formatCurrency(generalRevenue);
            document.getElementById('finCMV').textContent = formatCurrency(generalCMV);
            document.getElementById('finProfit').textContent = formatCurrency(generalProfit);

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">${error.message}</td></tr>`;
        }
    };

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('viero_token');
        localStorage.removeItem('viero_user');
        window.location.href = 'index.html';
    });

    loadCMVReport();
});