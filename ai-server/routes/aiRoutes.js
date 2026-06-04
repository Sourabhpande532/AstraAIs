const express = require('express');
const router = express.Router();
const { streamAiChat } = require('../controller/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat/stream', protect, streamAiChat);

module.exports = router;

