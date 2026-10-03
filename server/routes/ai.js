const express = require('express');
const router = express.Router();
const {
  generateQuestions,
  evaluateAnswer,
  generateReport
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All AI endpoints are protected behind JWT/auth

router.post('/generate-questions', generateQuestions);
router.post('/evaluate-answer', evaluateAnswer);
router.post('/generate-report', generateReport);

module.exports = router;
