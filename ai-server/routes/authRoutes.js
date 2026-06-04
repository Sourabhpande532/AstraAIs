const express = require('express');
const router = express.Router();
const { loginUser, registerUser, guestLogin } = require('../controller/authController');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/guest', guestLogin);

module.exports = router;
