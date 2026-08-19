const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Rota pública: POST /api/auth/login
router.post('/login', authController.login);

// Rotas protegidas (Apenas ADMIN)
router.get('/users', verifyToken, requireAdmin, authController.getUsers);
router.post('/register', verifyToken, requireAdmin, authController.createUser);

module.exports = router;