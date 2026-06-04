const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Meeting = require('../models/Meeting');

const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const leaves = await LeaveRequest.find({ user: req.user._id }).sort('-createdAt');
    const meetings = await Meeting.find({ user: req.user._id, date: { $gte: new Date() } }).sort('date');
    
    res.json({ user, leaves, meetings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardData };
