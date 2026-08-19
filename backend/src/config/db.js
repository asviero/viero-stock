const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


const dbPath = process.env.DB_PATH 
    ? path.resolve(__dirname, '../../', process.env.DB_PATH)
    : path.resolve(__dirname, '../../../database/viero_stock.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`-> Diretório criado automaticamente em: ${dbDir}`);
}

const db = new Database(dbPath, { verbose: console.log });

db.pragma('foreign_keys = ON');

function initDB() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('ADMIN', 'BAR_GRANDE', 'BAR_PEQUENO')) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            subcategory TEXT,
            price REAL NOT NULL,
            cost_price REAL NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bar_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 0,
            min_qty INTEGER DEFAULT 10,
            FOREIGN KEY (bar_id) REFERENCES bars(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            UNIQUE(bar_id, product_id)
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bar_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            type TEXT CHECK(type IN ('IN', 'OUT', 'LOSS')) NOT NULL,
            qty INTEGER NOT NULL,
            timestamp DATETIME DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (bar_id) REFERENCES bars(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS shift_closures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            closed_by INTEGER NOT NULL,
            closed_at DATETIME DEFAULT (datetime('now', 'localtime')),
            snapshot_json TEXT NOT NULL,
            FOREIGN KEY (closed_by) REFERENCES users(id)
        );
    `);

    const barCount = db.prepare('SELECT COUNT(*) as count FROM bars').get();
    if (barCount.count === 0) {
        const insertBar = db.prepare('INSERT INTO bars (name) VALUES (?)');
        insertBar.run('Bar Grande');
        insertBar.run('Bar Pequeno');
        console.log('-> Seed: Bares operacionais inicializados com sucesso.');
    }

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count === 0) {
        const saltRounds = 10;
        const defaultPasswordHash = bcrypt.hashSync('admin123', saltRounds);
        
        const insertAdmin = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
        insertAdmin.run('admin', defaultPasswordHash, 'ADMIN');
        console.log('-> Seed: Usuário Administrador padrão gerado (user: admin / pass: admin123).');
    }
}

module.exports = { db, initDB };