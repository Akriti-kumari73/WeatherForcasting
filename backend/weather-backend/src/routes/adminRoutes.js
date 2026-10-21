const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// System statistics & telemetry
router.get('/stats', adminController.getStats);

// API Keys management (for selling backend access)
router.get('/keys', adminController.getKeys);
router.post('/keys', adminController.createKey);
router.patch('/keys/:id/toggle', adminController.toggleKey);
router.delete('/keys/:id', adminController.deleteKey);

// Cache operations
router.post('/cache/clear', adminController.clearCache);

module.exports = router;
