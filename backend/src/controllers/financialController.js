const { db } = require('../config/db');

exports.getCMVReport = (req, res) => {
    try {
        // Query que calcula Faturamento, Custo Total (CMV) e Lucro agrupado por produto
        const stmt = db.prepare(`
            SELECT p.id, p.name, p.category, p.subcategory,
                   p.price as sale_price, p.cost_price,
                   SUM(t.qty) as qty_sold,
                   SUM(t.qty * p.price) as total_revenue,
                   SUM(t.qty * p.cost_price) as total_cmv,
                   SUM(t.qty * p.price) - SUM(t.qty * p.cost_price) as profit
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE t.type = 'OUT'
            GROUP BY p.id
            ORDER BY profit DESC
        `);
        
        const report = stmt.all();
        res.status(200).json(report);
    } catch (error) {
        console.error('Erro ao calcular relatório de CMV:', error);
        res.status(500).json({ error: 'Erro interno ao processar relatório financeiro.' });
    }
};