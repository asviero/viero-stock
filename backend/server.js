require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares 
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

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
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/shift', shiftRoutes);

// Rota de Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// Inicialização
app.listen(PORT, () => {
    console.log(`🚀 Viero Stock API rodando em http://localhost:${PORT}`);
});