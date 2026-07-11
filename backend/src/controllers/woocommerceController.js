const { getProducts } = require('../services/woocommerceService');
const supabase = require('../config/supabase');

const fetchProducts = async (req, res, next) => {
  try {
    const products = await getProducts();
    await supabase
      .from('products')
      .upsert(products, { onConflict: 'woo_product_id' });
    res.status(200).json({
      status: 'ok',
      source: 'live',
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.warn('[WooCommerce] Falling back to cache:', err.message);
    const { data: cachedProducts, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (error) return next(error);
    res.status(200).json({
      status: 'ok',
      source: 'cache',
      count: cachedProducts.length,
      data: cachedProducts,
    });
  }
};

const syncProducts = async (req, res, next) => {
  try {
    console.log('[WooCommerce] Starting sync...');
    const products = await getProducts();
    console.log('[WooCommerce] Got products:', products.length);
    const { error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'woo_product_id' });
    if (error) throw new Error(JSON.stringify(error));
    res.status(200).json({
      status: 'ok',
      message: `Synced ${products.length} products to database`,
      data: products,
    });
  } catch (err) {
    console.error('[WooCommerce] Sync error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

module.exports = { fetchProducts, syncProducts };