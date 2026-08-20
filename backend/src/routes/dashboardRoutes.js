const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Protegidas pelo JWT
router.get('/general-stock', verifyToken, requireAdmin, dashboardController.getGeneralStock);
router.get('/critical', verifyToken, requireAdmin, dashboardController.getCriticalStock);
router.get('/top-sellers', verifyToken, requireAdmin, dashboardController.getTopSellers);
// Adicione esta linha junto com as outras rotas:
router.get('/financials', verifyToken, requireAdmin, dashboardController.getFinancials);

module.exports = router;