const express = require('express');
const router = express.Router();
const { generateInterviewQuestions, evaluateInterviewAnswer } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/questions', protect, generateInterviewQuestions);
router.post('/evaluate', protect, evaluateInterviewAnswer);

module.exports = router;
