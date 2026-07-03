const express = require('express');
const router = express.Router();
const { fetchPosts, syncPosts } = require('../controllers/instagramController');
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;
// GET /api/instagram/posts - fetch posts from Instagram API
router.get('/posts', fetchPosts);

// POST /api/instagram/sync - fetch and save posts to database
router.post('/sync', syncPosts);

module.exports = router;