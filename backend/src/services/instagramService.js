const axios = require('axios');

const BASE_URL = 'https://graph.instagram.com/v21.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

// Fetch recent posts with their basic metrics
const getRecentPosts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${USER_ID}/media`, {
      params: {
        fields: 'id,caption,media_type,permalink,timestamp',
        access_token: ACCESS_TOKEN,
      },
    });
    return response.data;
  } catch (err) {
    const errorDetail = err.response?.data || err.message;
    throw new Error(JSON.stringify(errorDetail));
  }
};

// Fetch insights for a specific post
const getPostInsights = async (postId) => {
  const response = await axios.get(`${BASE_URL}/${postId}/insights`, {
    params: {
      metric: 'reach,impressions,likes_count,comments_count',
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data;
};

// Fetch all posts with their insights combined
const getPostsWithInsights = async () => {
  const postsData = await getRecentPosts();
  const posts = postsData.data;

  const postsWithInsights = await Promise.all(
    posts.map(async (post) => {
      try {
        const insights = await getPostInsights(post.id);
        const metricsMap = {};
        insights.data.forEach((metric) => {
          metricsMap[metric.name] = metric.values?.[0]?.value || metric.value || 0;
        });

        return {
          instagram_post_id: post.id,
          caption: post.caption || '',
          media_type: post.media_type,
          permalink: post.permalink,
          posted_at: post.timestamp,
          reach: metricsMap.reach || 0,
          impressions: metricsMap.impressions || 0,
          likes: metricsMap.likes_count || 0,
          comments: metricsMap.comments_count || 0,
          engagement_rate:
            metricsMap.reach > 0
              ? (((metricsMap.likes_count || 0) + (metricsMap.comments_count || 0)) /
                  metricsMap.reach) *
                100
              : 0,j
        };
      } catch (err) {
        // If insights fail for a post, return post with zero metrics
        console.error(`Failed to fetch insights for post ${post.id}:`, err.message);
        return {
          instagram_post_id: post.id,
          caption: post.caption || '',
          media_type: post.media_type,
          permalink: post.permalink,
          posted_at: post.timestamp,
          reach: 0,
          impressions: 0,
          likes: 0,
          comments: 0,
          engagement_rate: 0,
        };
      }
    })
  );

  return postsWithInsights;
};

module.exports = { getRecentPosts, getPostInsights, getPostsWithInsights };