const Interview = require('../models/Interview');
const fallbackStore = require('../config/fallbackStore');
const { getDBStatus } = require('../config/db');

// Save Completed Interview (FR10)
exports.saveInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      role: reqRole,
      jobRole,
      experienceLevel,
      interviewType,
      technicalTopic,
      questionCount,
      answeredCount,
      skippedCount,
      overallScore,
      totalScore: reqTotalScore,
      percentage: reqPercentage,
      feedback: reqFeedback,
      criterionScores,
      duration,
      report,
      questions,
      interviewId: reqInterviewId
    } = req.body;

    const roleName = reqRole || jobRole;
    if (!roleName || !experienceLevel || !interviewType || !questions || !questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview data. Missing jobRole, experienceLevel, or questions.'
      });
    }

    const interviewId = reqInterviewId || ('int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));

    // Format and sanitize each question result
    const formattedQuestions = questions.map((q, idx) => {
      const qScore = Number(q.score) !== undefined && !isNaN(Number(q.score)) ? Math.round(Number(q.score) * 10) / 10 : 0;
      return {
        questionId: q.questionId || ('q_' + Date.now() + '_' + (idx + 1)),
        question: q.question,
        category: q.category || 'General',
        difficulty: q.difficulty || 'Beginner',
        userAnswer: q.userAnswer || q.candidateAnswer || (q.skipped ? '(Skipped by user)' : ''),
        candidateAnswer: q.candidateAnswer || q.userAnswer || (q.skipped ? '(Skipped by user)' : ''),
        expectedAnswer: q.expectedAnswer || q.improvedAnswer || '',
        keyPoints: Array.isArray(q.keyPoints) && q.keyPoints.length ? q.keyPoints : (Array.isArray(q.missingPoints) ? q.missingPoints : []),
        skipped: Boolean(q.skipped),
        score: qScore,
        correctness: Number(q.correctness) || 0,
        relevance: Number(q.relevance) || 0,
        completeness: Number(q.completeness) || 0,
        clarity: Number(q.clarity) || 0,
        feedback: q.feedback || '',
        strengths: Array.isArray(q.strengths) ? q.strengths : [],
        missingPoints: Array.isArray(q.missingPoints) ? q.missingPoints : [],
        improvedAnswer: q.improvedAnswer || q.expectedAnswer || ''
      };
    });

    const calculatedTotalScore = Math.round(formattedQuestions.reduce((sum, q) => sum + (Number(q.score) || 0), 0) * 10) / 10;
    const finalTotalScore = reqTotalScore !== undefined && !isNaN(Number(reqTotalScore))
      ? Number(reqTotalScore)
      : calculatedTotalScore;
    const maxScore = (formattedQuestions.length || 5) * 10;
    const finalPercentage = reqPercentage !== undefined && !isNaN(Number(reqPercentage))
      ? Number(reqPercentage)
      : (maxScore > 0 ? Math.round((finalTotalScore / maxScore) * 100) : 0);
    const finalOverallScore = overallScore !== undefined && !isNaN(Number(overallScore))
      ? Math.round(Number(overallScore) * 10) / 10
      : (formattedQuestions.length > 0 ? Math.round((finalTotalScore / formattedQuestions.length) * 10) / 10 : 0);

    const overallFeedback = reqFeedback || (
      finalOverallScore >= 8
        ? 'Excellent performance demonstrating strong domain knowledge and clear technical communication.'
        : finalOverallScore >= 5
        ? 'Satisfactory performance with foundational understanding. Focus on deepening technical edge cases and accuracy.'
        : 'Needs improvement. Practice core concepts, review incorrect answers, and revisit technical fundamentals.'
    );

    const now = new Date();
    const interviewData = {
      userId,
      interviewId,
      role: roleName,
      jobRole: jobRole || roleName,
      experienceLevel,
      interviewType,
      technicalTopic: technicalTopic || '',
      questionCount: parseInt(questionCount, 10) || formattedQuestions.length,
      answeredCount: answeredCount !== undefined ? answeredCount : formattedQuestions.filter(q => !q.skipped).length,
      skippedCount: skippedCount !== undefined ? skippedCount : formattedQuestions.filter(q => q.skipped).length,
      overallScore: finalOverallScore,
      totalScore: finalTotalScore,
      percentage: finalPercentage,
      feedback: overallFeedback,
      criterionScores: criterionScores || { correctness: 0, relevance: 0, completeness: 0, clarity: 0 },
      duration: Number(duration) || 0,
      report: report || { strengths: [], areasToImprove: [], recommendations: [] },
      questions: formattedQuestions,
      dateTime: now,
      date: now.toISOString(),
      createdAt: now
    };

    const dbStatus = getDBStatus();
    let saved;

    if (!dbStatus.useFallbackStore) {
      try {
        saved = await Interview.create(interviewData);
      } catch (err) {
        console.error('[Interview Controller] Mongo create error, using fallback:', err.message);
        saved = await fallbackStore.createInterview(interviewData);
      }
    } else {
      saved = await fallbackStore.createInterview(interviewData);
    }

    res.status(201).json({
      success: true,
      message: 'Interview completed and saved to history successfully',
      data: {
        interview: saved
      }
    });
  } catch (error) {
    next(error);
  }
};


// Get All Interviews for User with Improvement metrics (FR12)
exports.getInterviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDBStatus();
    let interviews;

    if (!dbStatus.useFallbackStore) {
      try {
        interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
      } catch (err) {
        interviews = await fallbackStore.findInterviewsByUserId(userId);
      }
    } else {
      interviews = await fallbackStore.findInterviewsByUserId(userId);
    }

    // Calculate progression / improvement
    // Sort oldest to newest to compute delta
    const chronological = [...interviews].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let previousScore = null;
    let latestScore = null;
    let improvementPercentage = 0;

    if (chronological.length >= 2) {
      previousScore = chronological[chronological.length - 2].overallScore;
      latestScore = chronological[chronological.length - 1].overallScore;
      if (previousScore > 0) {
        improvementPercentage = Math.round(((latestScore - previousScore) / previousScore) * 100);
      } else {
        improvementPercentage = latestScore > 0 ? 100 : 0;
      }
    } else if (chronological.length === 1) {
      latestScore = chronological[0].overallScore;
    }

    res.status(200).json({
      success: true,
      data: {
        interviews,
        progress: {
          previousScore,
          latestScore,
          improvementPercentage,
          improvementDisplay: improvementPercentage > 0 ? `+${improvementPercentage}%` : `${improvementPercentage}%`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Interview by ID (FR10, FR12)
exports.getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const dbStatus = getDBStatus();
    let interview;

    if (!dbStatus.useFallbackStore) {
      try {
        interview = await Interview.findOne({ _id: id, userId });
      } catch (err) {
        interview = await fallbackStore.findInterviewById(id);
      }
    } else {
      interview = await fallbackStore.findInterviewById(id);
    }

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Interview report not found or access denied.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        interview
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard Summary Statistics (FR4)
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDBStatus();
    let interviews;

    if (!dbStatus.useFallbackStore) {
      try {
        interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
      } catch (err) {
        interviews = await fallbackStore.findInterviewsByUserId(userId);
      }
    } else {
      interviews = await fallbackStore.findInterviewsByUserId(userId);
    }

    const interviewsCompleted = interviews.length;

    let averageScore = 0;
    let bestScore = 0;
    let latestInterview = null;

    if (interviewsCompleted > 0) {
      const sumScores = interviews.reduce((acc, curr) => acc + (Number(curr.overallScore) || 0), 0);
      averageScore = Math.round((sumScores / interviewsCompleted) * 10) / 10;
      bestScore = Math.max(...interviews.map(i => Number(i.overallScore) || 0));
      latestInterview = {
        id: interviews[0]._id,
        jobRole: interviews[0].jobRole,
        experienceLevel: interviews[0].experienceLevel,
        interviewType: interviews[0].interviewType,
        overallScore: interviews[0].overallScore,
        createdAt: interviews[0].createdAt
      };
    }

    // Average criterion scores across all interviews
    let criterionAverages = {
      correctness: 0,
      relevance: 0,
      completeness: 0,
      clarity: 0
    };

    if (interviewsCompleted > 0) {
      criterionAverages.correctness = Math.round((interviews.reduce((acc, curr) => acc + (curr.criterionScores?.correctness || 0), 0) / interviewsCompleted) * 10) / 10;
      criterionAverages.relevance = Math.round((interviews.reduce((acc, curr) => acc + (curr.criterionScores?.relevance || 0), 0) / interviewsCompleted) * 10) / 10;
      criterionAverages.completeness = Math.round((interviews.reduce((acc, curr) => acc + (curr.criterionScores?.completeness || 0), 0) / interviewsCompleted) * 10) / 10;
      criterionAverages.clarity = Math.round((interviews.reduce((acc, curr) => acc + (curr.criterionScores?.clarity || 0), 0) / interviewsCompleted) * 10) / 10;
    }

    // Recent trend (last 6 chronological interviews for line chart)
    const trend = [...interviews]
      .reverse()
      .slice(-6)
      .map((item, idx) => ({
        interview: `Attempt ${idx + 1}`,
        score: item.overallScore,
        date: new Date(item.createdAt).toLocaleDateString()
      }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          interviewsCompleted,
          averageScore,
          bestScore,
          latestInterview
        },
        criterionAverages,
        trend,
        recentInterviews: interviews.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
};
