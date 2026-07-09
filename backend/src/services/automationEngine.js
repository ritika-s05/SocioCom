const cron = require('node-cron');
const supabase = require('../config/supabase');
const { triggerCampaign } = require('./mailchimpService');

const ENGAGEMENT_THRESHOLD = 5.0; // posts above this % trigger automation
const SALES_THRESHOLD = 5;        // products below this total_sales trigger automation

const runAutomation = async () => {
  console.log('[Automation] Running at', new Date().toISOString());

  try {
    // Step 1 — Fetch high engagement posts from Supabase
    const { data: highEngagementPosts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .gte('engagement_rate', ENGAGEMENT_THRESHOLD)
      .order('engagement_rate', { ascending: false })
      .limit(5);

    if (postsError) throw postsError;

    console.log(`[Automation] Found ${highEngagementPosts.length} high engagement posts`);

    if (highEngagementPosts.length === 0) {
      console.log('[Automation] No high engagement posts found, skipping');
      return;
    }

    // Step 2 — Fetch low selling products from Supabase
    const { data: lowSellingProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .lt('total_sales', SALES_THRESHOLD)
      .limit(5);

    if (productsError) throw productsError;

    console.log(`[Automation] Found ${lowSellingProducts.length} low selling products`);

    if (lowSellingProducts.length === 0) {
      console.log('[Automation] No low selling products found, skipping');
      return;
    }

    // Step 3 — Match top post with first low selling product and trigger campaign
    const topPost = highEngagementPosts[0];
    const targetProduct = lowSellingProducts[0];

    console.log(`[Automation] Triggering campaign for post ${topPost.instagram_post_id} + product ${targetProduct.name}`);

    // Step 4 — Check if campaign already exists for this combination
    const { data: existingCampaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('post_id', topPost.id)
      .eq('product_id', targetProduct.id)
      .single();

    if (existingCampaign) {
      console.log('[Automation] Campaign already exists for this combination, skipping');
      return;
    }

    // Step 5 — Trigger Mailchimp campaign
    const campaign = await triggerCampaign({
      postCaption: topPost.caption,
      productName: targetProduct.name,
      engagementRate: topPost.engagement_rate,
    });

    // Step 6 — Log campaign to Supabase
    const { error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        post_id: topPost.id,
        product_id: targetProduct.id,
        mailchimp_campaign_id: campaign.campaign_id,
        trigger_reason: `High engagement post (${topPost.engagement_rate.toFixed(1)}%) matched with low sales product (${targetProduct.total_sales} sales)`,
        status: 'triggered',
      });

    if (campaignError) throw campaignError;

    console.log(`[Automation] Campaign created successfully: ${campaign.campaign_id}`);

  } catch (err) {
    console.error('[Automation] Error:', err.message);
  }
};

// Schedule to run every hour
const startAutomation = () => {
  console.log('[Automation] Engine started - running every hour');
  
  // Run immediately on startup
  runAutomation();

  // Then schedule every hour
  cron.schedule('0 * * * *', runAutomation);
};

module.exports = { startAutomation, runAutomation };