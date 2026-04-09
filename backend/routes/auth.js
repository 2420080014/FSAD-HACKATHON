const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_dev_only';

// Register
router.post('/register', async (req, res) => {
  try {
    const { nickname, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ nickname });
    if (existingUser) {
      return res.status(400).json({ error: 'Nickname already taken' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const user = new User({
      nickname,
      password_hash,
      role
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, nickname: user.nickname, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    
    const user = await User.findOne({ nickname });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, nickname: user.nickname, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
