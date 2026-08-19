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