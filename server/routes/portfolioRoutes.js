const express = require('express');
const router = express.Router();
const { createOrUpdatePortfolio, getPublicPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrUpdatePortfolio);
router.put('/:id', protect, createOrUpdatePortfolio);
router.get('/:username', getPublicPortfolio); // PUBLIC

module.exports = router;
