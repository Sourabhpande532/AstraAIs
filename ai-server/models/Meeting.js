const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  attendees: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
