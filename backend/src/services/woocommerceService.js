const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;
const mockProducts = require('./mockWoocommerceData');

const getProducts = async () => {
  // In production, WooCommerce is not accessible — use mock data
  if (process.env.NODE_ENV === 'production' || !process.env.WOO_URL) {
    console.log('[WooCommerce] Using mock product data');
    return mockProducts;
  }

  // In development, hit real LocalWP store
  const wooCommerce = new WooCommerceRestApi({
    url: process.env.WOO_URL,
    consumerKey: process.env.WOO_CONSUMER_KEY,
    consumerSecret: process.env.WOO_CONSUMER_SECRET,
    version: 'wc/v3',
  });

  const response = await wooCommerce.get('products', {
    per_page: 50,
    status: 'publish',
  });

  return response.data.map((product) => ({
    woo_product_id: String(product.id),
    name: product.name,
    price: parseFloat(product.price) || 0,
    stock_quantity: product.stock_quantity || 0,
    total_sales: product.total_sales || 0,
  }));
};

module.exports = { getProducts };