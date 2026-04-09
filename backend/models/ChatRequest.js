const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  seeker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listener_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, could be a general broadcast
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // If requested from a specific post
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
