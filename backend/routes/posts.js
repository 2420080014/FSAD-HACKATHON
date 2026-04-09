const express = require('express');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_dev_only';

// Basic Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Get all posts for the Feed
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Populate author but only nickname
    const posts = await Post.find().populate('author', 'nickname').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a new post (Seeker usually)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, tags } = req.body;
    const post = new Post({
      author: req.user.userId,
      content,
      tags
    });
    await post.save();
    
    // Return populated post
    const populatedPost = await Post.findById(post._id).populate('author', 'nickname');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

module.exports = router;
