 const axios = require('axios');

const BASE_URL = 'https://graph.instagram.com/v21.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

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

const getPostInsights = async (postId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${postId}/insights`, {
      params: {
        metric: 'reach,likes,comments,saved',
        access_token: ACCESS_TOKEN,
      },
    });
    return response.data;
  } catch (err) {
    console.error('Insights error for post', postId, err.response?.data?.error?.message);
    return { data: [] };
  }
};

const getPostsWithInsights = async () => {
  const postsData = await getRecentPosts();
  const posts = postsData.data;

  const postsWithInsights = await Promise.all(
    posts.map(async (post) => {
      try {
        const insights = await getPostInsights(post.id);
        const metricsMap = {};
        insights.data.forEach((metric) => {
          metricsMap[metric.name] = metric.values?.[0]?.value ?? metric.value ?? 0;
        });
        const reach = metricsMap.reach || 0;
        const likes = metricsMap.likes || 0;
        const comments = metricsMap.comments || 0;
        return {
          instagram_post_id: post.id,
          caption: post.caption || '',
          media_type: post.media_type,
          permalink: post.permalink,
          posted_at: post.timestamp,
          reach: reach,
          impressions: 0,
          likes: likes,
          comments: comments,
          engagement_rate: reach > 0 ? ((likes + comments) / reach) * 100 : 0,
        };
      } catch (err) {
        console.error('Failed to process post', post.id, err.message);
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