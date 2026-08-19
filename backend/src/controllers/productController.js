const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

// 1. Lista todos os produtos
exports.getAllProducts = (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM products ORDER BY category, name');
        const products = stmt.all();
        res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar o catálogo.' });
    }
};

// 2. Seed do banco lendo arquivo SQL
exports.seedInitialProducts = (req, res) => {
    try {
        const check = db.prepare('SELECT COUNT(*) as count FROM products').get();
        
        if (check.count > 0) {
            return res.status(200).json({ message: 'O catálogo já possui itens. Seed ignorado.' });
        }

        const sqlPath = path.resolve(__dirname, '../config/seed.sql');
        const sqlString = fs.readFileSync(sqlPath, 'utf8');

        db.exec(sqlString);

        res.status(201).json({ message: 'Cardápio base inserido via script SQL com sucesso!' });
    } catch (error) {
        console.error('Erro ao popular catálogo via SQL:', error);
        res.status(500).json({ error: 'Erro interno ao semear produtos.' });
    }
};

// 3. Criar um novo produto
exports.createProduct = (req, res) => {
    const { name, category, subcategory, price, cost_price } = req.body;
    
    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Nome, categoria e preço de venda são obrigatórios.' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO products (name, category, subcategory, price, cost_price) 
            VALUES (?, ?, ?, ?, ?)
        `);
        const info = stmt.run(name, category, subcategory || null, price, cost_price || 0);
        
        res.status(201).json({ message: 'Produto criado com sucesso!', productId: info.lastInsertRowid });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro interno ao criar o produto.' });
    }
};

// 4. Atualizar um produto existente (Preços e Nomes)
exports.updateProduct = (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, category, subcategory, price, cost_price } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, category = ?, subcategory = ?, price = ?, cost_price = ?
            WHERE id = ?
        `);
        const info = stmt.run(name, category, subcategory || null, price, cost_price || 0, productId);

        if (info.changes === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar o produto.' });
    }
};

// 5. Excluir um produto
exports.deleteProduct = (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const info = stmt.run(productId);

        if (info.changes === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: 'Erro interno ao excluir o produto. Verifique se ele não possui histórico de movimentação.' });
    }
};