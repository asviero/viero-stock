const { db } = require('../config/db');

// Utilitário para validar se o usuário tem permissão
const checkBarAccess = (userRole, targetBarId) => {
    if (userRole === 'ADMIN') return true;
    
    // Busca o nome do bar para comparar com o cargo do usuário
    const bar = db.prepare('SELECT name FROM bars WHERE id = ?').get(targetBarId);
    if (!bar) return false;

    // Regra de Negócio: cada cargo acessa seu respectivo bar
    const normalizedRoleName = userRole.replace('_', ' ');
    return bar.name.toUpperCase() === normalizedRoleName;
};

// 1. Lista o estoque de um bar específico
exports.getInventoryByBar = (req, res) => {
    const barId = parseInt(req.params.barId);
    const userRole = req.user.role;

    if (!checkBarAccess(userRole, barId)) {
        return res.status(403).json({ error: 'Acesso negado ao estoque deste bar.' });
    }

    try {
        // JOIN com nome e categoria do produto junto com a quantidade
        const stmt = db.prepare(`
            SELECT p.id as product_id, p.name, p.category, p.subcategory, 
            COALESCE(i.quantity, 0) as quantity
            FROM products p
            LEFT JOIN inventory i ON p.id = i.product_id AND i.bar_id = ?
            ORDER BY p.category, p.name
        `);
        const inventory = stmt.all(barId);
        res.status(200).json(inventory);
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ error: 'Erro interno ao buscar inventário.' });
    }
};

// 2. Registra movimentação
exports.moveStock = (req, res) => {
    const barId = parseInt(req.params.barId);
    const userId = req.user.id;
    const { productId, type, qty } = req.body;

    if (!checkBarAccess(req.user.role, barId)) {
        return res.status(403).json({ error: 'Acesso negado para movimentar neste bar.' });
    }

    if (!['IN', 'OUT', 'LOSS'].includes(type) || qty <= 0) {
        return res.status(400).json({ error: 'Tipo de movimentação inválida ou quantidade zero.' });
    }

    try {
        // Bloco de Transação ACID
        const processTransaction = db.transaction(() => {
            const qtyChange = (type === 'IN') ? qty : -qty;

            const upsertStmt = db.prepare(`
                INSERT INTO inventory (bar_id, product_id, quantity)
                VALUES (?, ?, ?)
                ON CONFLICT(bar_id, product_id) DO UPDATE SET quantity = quantity + ?
            `);
            upsertStmt.run(barId, productId, qtyChange, qtyChange);

            // Grava na tabela de histórico de transações
            const logStmt = db.prepare(`
                INSERT INTO transactions (bar_id, product_id, user_id, type, qty)
                VALUES (?, ?, ?, ?, ?)
            `);
            logStmt.run(barId, productId, userId, type, qty);
        });

        // Executa a transação
        processTransaction();

        res.status(200).json({ message: 'Movimentação registrada com sucesso!' });
    } catch (error) {
        console.error('Erro na movimentação:', error);
        res.status(500).json({ error: 'Erro interno ao registrar a movimentação.' });
    }
};