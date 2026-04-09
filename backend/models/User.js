const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['Seeker', 'Listener', 'Admin'], required: true },
  isOnline: { type: Boolean, default: false },
  mood_history: [{
    mood: { type: String, enum: ['Happy', 'Sad', 'Stressed', 'Neutral'] },
    date: { type: Date, default: Date.now }
  }],
  stress_score: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true } // for admin deactivation
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
