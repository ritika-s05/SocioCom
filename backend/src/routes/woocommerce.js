const express = require('express');
const router = express.Router();
const { fetchProducts, syncProducts } = require('../controllers/woocommerceController');

router.get('/products', fetchProducts);
router.post('/sync', syncProducts);

module.exports = router;