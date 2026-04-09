const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reported_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Resolved'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
