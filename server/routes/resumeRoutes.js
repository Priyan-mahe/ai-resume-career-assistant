const express = require('express');
const router = express.Router();
const {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  analyzeResumeATS,
  uploadAndAnalyzeResume,
  generateAISummary,
  improveExperienceBullets
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, createResume);
router.get('/', protect, getResumes);
router.post('/upload-analyze', protect, upload.single('file'), uploadAndAnalyzeResume);
router.post('/improve-experience', protect, improveExperienceBullets);
router.post('/summary', protect, generateAISummary);
router.get('/:id', protect, getResumeById);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);
router.post('/:id/ats', protect, analyzeResumeATS);
router.post('/:id/summary', protect, generateAISummary);

module.exports = router;
