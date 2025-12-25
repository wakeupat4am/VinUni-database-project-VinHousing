const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require Admin access
router.use(authenticate, authorize('admin'));

router.get('/users', analyticsController.getUserGrowthStats);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/issues', analyticsController.getIssueStats);

module.exports = router;