const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Lista todos os produtos
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