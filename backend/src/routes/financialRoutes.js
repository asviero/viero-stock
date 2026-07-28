const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/cmv', verifyToken, requireAdmin, financialController.getCMVReport);

module.exports = router;