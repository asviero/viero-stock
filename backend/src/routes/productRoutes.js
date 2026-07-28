const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Rotas de leitura
router.get('/', verifyToken, productController.getAllProducts);

// Seed
router.post('/seed', verifyToken, requireAdmin, productController.seedInitialProducts);

// Rotas de Escrita
router.post('/', verifyToken, requireAdmin, productController.createProduct);
router.put('/:id', verifyToken, requireAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;