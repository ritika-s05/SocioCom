const { getPostsWithInsights } = require('../services/instagramService');
const supabase = require('../config/supabase');

// Fetch posts from Instagram API and return them
const fetchPosts = async (req, res, next) => {
  try {
    const posts = await getPostsWithInsights();
    res.status(200).json({
      status: 'ok',
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

// Fetch posts from Instagram AND save them to Supabase
const syncPosts = async (req, res, next) => {
  try {
    const posts = await getPostsWithInsights();

    const { data, error } = await supabase
      .from('posts')
      .upsert(posts, { onConflict: 'instagram_post_id' });

    if (error) throw error;

    res.status(200).json({
      status: 'ok',
      message: `Synced ${posts.length} posts to database`,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { fetchPosts, syncPosts };