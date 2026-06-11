require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais
app.use(cors()); // Permite que nosso frontend acesse a API mesmo em portas diferentes
app.use(express.json()); // Habilita o parseamento de payloads em formato JSON

// Inicialização segura do Banco de Dados
try {
    initDB();
    console.log('✔ Conexão e checagem de tabelas do SQLite concluídas.');
} catch (error) {
    console.error('❌ Falha crítica ao inicializar o banco de dados:', error);
    process.exit(1); // Encerra a aplicação imediatamente se o banco falhar
}

// Rota de Health Check (Essencial para monitoramento e validação de ambiente)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// Inicialização do Servidor HTTP
app.listen(PORT, () => {
    console.log(`🚀 Viero Stock API rodando em http://localhost:${PORT}`);
});