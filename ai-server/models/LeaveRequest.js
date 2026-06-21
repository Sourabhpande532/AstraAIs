const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['sick', 'casual', 'earned'], required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true, default: 'Not specified' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' } // Auto-approved by AI for demo
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
