const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Get dashboard summary
router.get('/summary', authenticate, dashboardController.getSummary);

// Get category breakdown
router.get('/category-breakdown', authenticate, dashboardController.getCategoryBreakdown);

// Get spending trends
router.get('/trends', authenticate, dashboardController.getTrends);

// Get top merchants
router.get('/top-merchants', authenticate, dashboardController.getTopMerchants);

module.exports = router;
