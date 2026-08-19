const { db } = require('../config/db');

exports.getLogs = (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT t.id, t.type, t.qty, t.timestamp,
            u.username, b.name as bar_name, p.name as product_name
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            JOIN bars b ON t.bar_id = b.id
            JOIN products p ON t.product_id = p.id
            ORDER BY t.timestamp DESC
            LIMIT 100
        `);
        const logs = stmt.all();
        res.status(200).json(logs);
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).json({ error: 'Erro interno ao carregar logs de auditoria.' });
    }
};