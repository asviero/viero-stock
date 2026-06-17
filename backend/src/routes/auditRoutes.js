const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// GET /api/audit
router.get('/', verifyToken, requireAdmin, auditController.getLogs);

module.exports = router;