const express = require('express');
const router = express.Router();
const {
  saveInterview,
  getInterviews,
  getInterviewById,
  getDashboardSummary
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All interview routes are protected

router.post('/', saveInterview);
router.get('/', getInterviews);
router.get('/stats/summary', getDashboardSummary);
router.get('/:id', getInterviewById);

module.exports = router;
