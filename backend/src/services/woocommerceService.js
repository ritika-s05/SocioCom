const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const wooCommerce = new WooCommerceRestApi({
  url: process.env.WOO_URL,
  consumerKey: process.env.WOO_CONSUMER_KEY,
  consumerSecret: process.env.WOO_CONSUMER_SECRET,
  version: 'wc/v3',
});

const getProducts = async () => {
  const response = await wooCommerce.get('products', {
    per_page: 20,
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