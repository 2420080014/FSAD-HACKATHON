const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  seeker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listener_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
