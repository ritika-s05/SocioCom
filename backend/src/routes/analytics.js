const express = require('express');
const router = express.Router();
const { fetchAnalytics, syncAnalytics } = require('../controllers/analyticsController');

router.get('/data', fetchAnalytics);
router.post('/sync', syncAnalytics);

module.exports = router;
