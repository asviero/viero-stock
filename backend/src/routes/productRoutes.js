const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Rotas protegidas
// GET /api/products
router.get('/', verifyToken, productController.getAllProducts);

// GET /api/products/seed
router.post('/seed', verifyToken, requireAdmin, productController.seedInitialProducts);

module.exports = router;