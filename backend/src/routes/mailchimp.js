const express = require('express');
const router = express.Router();
const { ping, createCampaign } = require('../controllers/mailchimpController');

router.get('/ping', ping);
router.post('/campaign', createCampaign);

module.exports = router;