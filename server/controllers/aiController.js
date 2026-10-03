const aiEngine = require('../services/aiEngine');

// Generate Interview Questions (FR6)
exports.generateQuestions = async (req, res, next) => {
  try {
    const { jobRole, experienceLevel, interviewType, technicalTopic, questionCount } = req.body;

    if (!jobRole || !experienceLevel || !interviewType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required configuration: jobRole, experienceLevel, and interviewType are required.'
      });
    }

    const count = parseInt(questionCount, 10) || 5;
    if (![5, 10, 15].includes(count)) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be 5, 10, or 15.'
      });
    }

    // Call AI Engine with automatic fallback to deterministic bank if needed
    const questions = await aiEngine.generateQuestions({
      jobRole,
      experienceLevel,
      interviewType,
      technicalTopic,
      questionCount: count
    });

    res.status(200).json({
      success: true,
      message: 'Questions generated successfully',
      data: {
        questions,
        jobRole,
        experienceLevel,
        interviewType,
        technicalTopic: technicalTopic || null,
        count: questions.length
      }
    });
  } catch (error) {
    console.error('[AI Controller] Question generation failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to generate interview questions right now. Please try again.'
    });
  }
};

// Evaluate Answer (FR8, FR9, FR13)
exports.evaluateAnswer = async (req, res, next) => {
  try {
    const { question, category, difficulty, userAnswer, jobRole, experienceLevel, expectedAnswer, keyPoints } = req.body;

    if (!userAnswer || !userAnswer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Answer cannot be empty. Please enter your answer or skip this question.'
      });
    }

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question context is required for evaluation.'
      });
    }

    // Call AI Engine with retry mechanism (SRS FR13)
    let evaluation;
    try {
      evaluation = await aiEngine.evaluateAnswer({
        question,
        category: category || 'General',
        difficulty: difficulty || 'Intermediate',
        userAnswer: userAnswer.trim(),
        jobRole: jobRole || 'Software Engineer',
        experienceLevel: experienceLevel || 'Beginner',
        expectedAnswer: expectedAnswer || '',
        keyPoints: Array.isArray(keyPoints) ? keyPoints : []
      });
    } catch (firstAttemptErr) {
      console.warn('[AI Controller] Evaluation attempt 1 failed, retrying once...', firstAttemptErr.message);
      try {
        evaluation = await aiEngine.evaluateAnswer({
          question,
          category: category || 'General',
          difficulty: difficulty || 'Intermediate',
          userAnswer: userAnswer.trim(),
          jobRole: jobRole || 'Software Engineer',
          experienceLevel: experienceLevel || 'Beginner',
          expectedAnswer: expectedAnswer || '',
          keyPoints: Array.isArray(keyPoints) ? keyPoints : []
        });
      } catch (retryErr) {
        throw new Error('Unable to evaluate this answer right now. Please try again.');
      }
    }

    // Sanitize and validate criteria scores safely (ensure 0 is not replaced by default 5)
    const parseScore = (val) => {
      const num = Number(val);
      return Number.isFinite(num) ? Math.min(10, Math.max(0, Math.round(num * 10) / 10)) : 0;
    };

    const sanitized = {
      overallScore: parseScore(evaluation.overallScore),
      correctness: parseScore(evaluation.correctness),
      relevance: parseScore(evaluation.relevance),
      completeness: parseScore(evaluation.completeness),
      clarity: parseScore(evaluation.clarity),
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      missingPoints: Array.isArray(evaluation.missingPoints) ? evaluation.missingPoints : [],
      feedback: evaluation.feedback || '',
      improvedAnswer: evaluation.improvedAnswer || evaluation.expectedAnswer || '',
      expectedAnswer: evaluation.expectedAnswer || evaluation.improvedAnswer || '',
      keyPoints: Array.isArray(evaluation.keyPoints) ? evaluation.keyPoints : []
    };

    res.status(200).json({
      success: true,
      data: sanitized
    });
  } catch (error) {
    console.error('[AI Controller] Evaluate answer failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to evaluate this answer right now. Please try again.'
    });
  }
};

// Generate Report & Recommendations (FR10, FR11)
exports.generateReport = async (req, res, next) => {
  try {
    const { questions, jobRole, experienceLevel } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required to generate report.'
      });
    }

    const report = aiEngine.generateReportRecommendations({
      questions,
      jobRole: jobRole || 'Software Engineer',
      experienceLevel: experienceLevel || 'Beginner'
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[AI Controller] Report generation failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to compile final recommendations report right now.'
    });
  }
};
