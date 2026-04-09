const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text_content: { type: String },
  file_url: { type: String }, // Base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
