require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares 
app.use(cors());
app.use(express.json());

// Inicialização BD
try {
    initDB();
    console.log('✔ Conexão e checagem de tabelas do SQLite concluídas.');
} catch (error) {
    console.error('❌ Falha crítica ao inicializar o banco de dados:', error);
    process.exit(1);
}

// Rotas API
app.use('/api/auth', authRoutes);

// Rota de Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`🚀 Viero Stock API rodando em http://localhost:${PORT}`);
});