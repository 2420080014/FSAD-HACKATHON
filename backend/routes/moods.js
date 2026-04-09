const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_dev_only';

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

// Add Mood Journal entry
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { mood } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.mood_history.push({ mood });
    await user.save();
    res.json({ message: 'Mood logged successfully', mood_history: user.mood_history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

// Update Stress Score
router.post('/stress-score', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body; // e.g. 0-100
    await User.findByIdAndUpdate(req.user.userId, { stress_score: score });
    res.json({ message: 'Stress score updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stress score' });
  }
});

// Get user profile including mood history
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password_hash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
