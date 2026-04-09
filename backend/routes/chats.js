const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all chat sessions for the logged-in user
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessions = await ChatRoom.find({
      $or: [{ seeker_id: userId }, { listener_id: userId }]
    })
      .populate('seeker_id', 'nickname')
      .populate('listener_id', 'nickname')
      .sort({ updatedAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get messages for a specific room
router.get('/messages/:roomId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ room_id: req.params.roomId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Close a chat session
router.put('/sessions/:roomId/close', authMiddleware, async (req, res) => {
  try {
    const room = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      { status: 'Closed' },
      { new: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Session closed', room });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close session' });
  }
});

module.exports = router;
