const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /api/inventory/bar/:barId
router.get('/bar/:barId', verifyToken, inventoryController.getInventoryByBar);

// POST /api/inventory/bar/:barId/move
router.post('/bar/:barId/move', verifyToken, inventoryController.moveStock);

module.exports = router;