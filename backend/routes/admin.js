const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report');
const ChatRoom = require('../models/ChatRoom');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get platform stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeListeners = await User.countDocuments({ role: 'Listener', isOnline: true, isActive: true });
    const totalSeekers = await User.countDocuments({ role: 'Seeker' });
    const totalListeners = await User.countDocuments({ role: 'Listener' });
    const activeChats = await ChatRoom.countDocuments({ status: 'Active' });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });

    res.json({
      totalUsers,
      activeListeners,
      totalSeekers,
      totalListeners,
      activeChats,
      pendingReports
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users (for admin management)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password_hash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Deactivate a user
router.put('/users/:userId/deactivate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: false },
      { new: true }
    ).select('-password_hash');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Reactivate a user
router.put('/users/:userId/activate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: true },
      { new: true }
    ).select('-password_hash');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User reactivated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Get all reports
router.get('/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter_id', 'nickname role')
      .populate('reported_user_id', 'nickname role isActive')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update report status
router.put('/reports/:reportId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status },
      { new: true }
    ).populate('reporter_id', 'nickname').populate('reported_user_id', 'nickname');

    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

module.exports = router;
