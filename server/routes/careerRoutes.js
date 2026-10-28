const express = require('express');
const router = express.Router();
const { getCareerRecommendations, careerChat, getCareerRoadmap } = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, getCareerRecommendations);
router.post('/chat', protect, careerChat);
router.post('/roadmap', protect, getCareerRoadmap);

module.exports = router;
