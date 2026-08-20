const { db } = require('../config/db');

// 1. Retorna a soma total do estoque
exports.getGeneralStock = (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT p.id as product_id, p.name, p.category, p.subcategory, 
            SUM(i.quantity) as total_quantity
            FROM products p
            JOIN inventory i ON p.id = i.product_id
            GROUP BY p.id
            ORDER BY p.category, p.name
        `);
        const stock = stmt.all();
        res.status(200).json(stock);
    } catch (error) {
        console.error('Erro ao buscar estoque geral:', error);
        res.status(500).json({ error: 'Erro interno ao processar estoque geral.' });
    }
};

// 2. Retorna os itens em estado crítico
exports.getCriticalStock = (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT p.name, b.name as bar_name, i.quantity, i.min_qty
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            JOIN bars b ON i.bar_id = b.id
            WHERE i.quantity <= i.min_qty
            ORDER BY i.quantity ASC
        `);
        const critical = stmt.all();
        res.status(200).json(critical);
    } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        res.status(500).json({ error: 'Erro ao processar alertas de estoque.' });
    }
};

// 3. Retorna os itens mais vendidos
exports.getTopSellers = (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT p.name, p.category, SUM(t.qty) as total_sold
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE t.type = 'OUT'
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        const topSellers = stmt.all();
        res.status(200).json(topSellers);
    } catch (error) {
        console.error('Erro ao calcular top sellers:', error);
        res.status(500).json({ error: 'Erro interno ao calcular os mais vendidos.' });
    }
};

// 4. Retorna dados financeiros (Receita, Custo, CMV)
exports.getFinancials = (req, res) => {
    try {
        // Considera apenas as vendas padrão (type = 'OUT')
        const stmt = db.prepare(`
            SELECT 
                SUM(t.qty * p.price) as total_revenue,
                SUM(t.qty * p.cost_price) as total_cost
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE t.type = 'OUT'
        `);
        const financials = stmt.get();
        
        const revenue = financials.total_revenue || 0;
        const cost = financials.total_cost || 0;
        // Calcula a porcentagem do CMV (evita divisão por zero se não houver vendas)
        const cmv = revenue > 0 ? ((cost / revenue) * 100).toFixed(2) : 0;

        res.status(200).json({ 
            revenue: Number(revenue), 
            cost: Number(cost), 
            cmv: Number(cmv) 
        });
    } catch (error) {
        console.error('Erro ao calcular finanças:', error);
        res.status(500).json({ error: 'Erro interno ao calcular dados financeiros.' });
    }
};