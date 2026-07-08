const { getProducts } = require('../services/woocommerceService');
const supabase = require('../config/supabase');

const fetchProducts = async (req, res, next) => {
  try {
    const products = await getProducts();
    res.status(200).json({
      status: 'ok',
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

const syncProducts = async (req, res, next) => {
  try {
    const products = await getProducts();

    const { error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'woo_product_id' });

    if (error) throw error;

    res.status(200).json({
      status: 'ok',
      message: `Synced ${products.length} products to database`,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { fetchProducts, syncProducts };