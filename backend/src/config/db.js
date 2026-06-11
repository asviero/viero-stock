const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs'); // Módulo nativo adicionado para manipulação de pastas
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Resolução de caminho absoluto subindo níveis: config -> src -> backend -> raiz do projeto
const dbPath = process.env.DB_PATH 
    ? path.resolve(__dirname, '../../', process.env.DB_PATH)
    : path.resolve(__dirname, '../../../database/viero_stock.db');

// DEFESA DE ARQUITETURA: Verifica se o diretório pai existe; se não, cria de forma recursiva
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`-> Diretório criado automaticamente em: ${dbDir}`);
}

// Abre a conexão com o banco de dados (agora com a pasta garantida)
const db = new Database(dbPath, { verbose: console.log });

// Pragma obrigatório para impor restrições de integridade referencial (Foreign Keys)
db.pragma('foreign_keys = ON');

function initDB() {
    // 1. Criação das tabelas estruturais
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
            price REAL NOT NULL,
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
    `);

    // 2. Seed: Popula os Bares Operacionais se a tabela estiver vazia
    const barCount = db.prepare('SELECT COUNT(*) as count FROM bars').get();
    if (barCount.count === 0) {
        const insertBar = db.prepare('INSERT INTO bars (name) VALUES (?)');
        insertBar.run('Bar Grande');
        insertBar.run('Bar Pequeno');
        console.log('-> Seed: Bares operacionais inicializados com sucesso.');
    }

    // 3. Seed: Cria o Administrador Padrão se não houver usuários
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