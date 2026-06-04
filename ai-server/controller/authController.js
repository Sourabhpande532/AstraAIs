const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, isGuest: user.isGuest, leaveBalance: user.leaveBalance, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, isGuest: user.isGuest, leaveBalance: user.leaveBalance, token: generateToken(user._id) });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const guestLogin = async (req, res) => {
  try {
    const randomNum = Math.floor(Math.random() * 1000000);
    const user = await User.create({
      name: `Guest Employee ${randomNum}`,
      email: `guest${randomNum}@astrahr.com`,
      password: `guest_pass_${randomNum}`,
      isGuest: true
    });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, isGuest: user.isGuest, leaveBalance: user.leaveBalance, token: generateToken(user._id) });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, registerUser, guestLogin };
