const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Apenas admin pode finalizar
router.post('/close', verifyToken, requireAdmin, shiftController.closeShiftAndGeneratePDF);

module.exports = router;