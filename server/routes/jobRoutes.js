const express = require('express');
const router = express.Router();
const { analyzeJob, matchJobWithResume } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeJob);
router.post('/match', protect, matchJobWithResume);

module.exports = router;
