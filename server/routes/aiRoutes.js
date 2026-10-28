const express = require('express');
const router = express.Router();
const { generateAI, ragAI, chatAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateAI);
router.post('/rag', protect, ragAI);
router.post('/chat', protect, chatAI);

module.exports = router;
