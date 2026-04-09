const express = require('express');
const Report = require('../models/Report');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create a report (any user can report)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reported_user_id, reason } = req.body;

    if (!reported_user_id || !reason) {
      return res.status(400).json({ error: 'Reported user and reason are required' });
    }

    const report = new Report({
      reporter_id: req.user.userId,
      reported_user_id,
      reason
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

module.exports = router;
