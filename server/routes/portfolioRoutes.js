const express = require('express');
const router = express.Router();
const { createOrUpdatePortfolio, getPublicPortfolio, getUserPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me/current', protect, getUserPortfolio);
router.post('/', protect, createOrUpdatePortfolio);
router.put('/:id', protect, createOrUpdatePortfolio);
router.get('/:username', getPublicPortfolio); // PUBLIC

module.exports = router;
