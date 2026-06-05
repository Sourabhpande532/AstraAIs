const express = require('express');
const router = express.Router();
const { 
  generateRoadmap, 
  simulateInterview, 
  knowledgeAssistant, 
  agenticPlanner 
} = require('../controller/careerController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes for the 4 new AI Career features
router.post('/roadmap', protect, generateRoadmap);
router.post('/interview', protect, simulateInterview);
router.post('/knowledge', protect, knowledgeAssistant);
router.post('/planner', protect, agenticPlanner);

module.exports = router;
