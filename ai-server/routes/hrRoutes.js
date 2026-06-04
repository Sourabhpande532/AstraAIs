const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controller/hrController');
const { protect } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, getDashboardData);

module.exports = router;
