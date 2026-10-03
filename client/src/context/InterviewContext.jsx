import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { aiService } from '../services/aiService';
import api from '../services/api';

const InterviewContext = createContext(null);

export const InterviewProvider = ({ children }) => {
  const [config, setConfig] = useState({
    jobRole: 'Software Engineer',
    experienceLevel: 'Beginner',
    interviewType: 'Technical',
    technicalTopic: '',
    questionCount: 5
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]); // array of questions with evaluations
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState(0); // in seconds
  const [finalReport, setFinalReport] = useState(null);
  const [savedInterviewId, setSavedInterviewId] = useState(null);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);

  // Timer effect during active interview
  useEffect(() => {
    if (questions.length > 0 && !finalReport) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions.length, finalReport]);

  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const startInterview = async (customConfig = null) => {
    const activeConfig = customConfig || config;
    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSessionResults([]);
    setCurrentEvaluation(null);
    setFinalReport(null);
    setSavedInterviewId(null);
    setDuration(0);

    try {
      const generated = await aiService.generateQuestions(activeConfig);
      if (!generated || generated.length === 0) {
        throw new Error('Failed to generate questions. Please try again.');
      }
      setQuestions(generated);
      return { success: true, count: generated.length };
    } catch (err) {
      setError(err.message || 'Error generating questions');
      return { success: false, message: err.message };
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Answer (FR7, FR8, FR9)
  const submitAnswer = async (userAnswer) => {
    if (!userAnswer || !userAnswer.trim()) {
      return { success: false, message: 'Please write an answer before submitting or choose Skip.' };
    }

    const currentQ = questions[currentIndex];
    setIsEvaluating(true);
    setError(null);

    try {
      const evaluation = await aiService.evaluateAnswer({
        question: currentQ.question,
        category: currentQ.category,
        difficulty: currentQ.difficulty,
        userAnswer: userAnswer.trim(),
        jobRole: config.jobRole,
        experienceLevel: config.experienceLevel,
        expectedAnswer: currentQ.expectedAnswer || '',
        keyPoints: currentQ.keyPoints || []
      });

      const evaluatedItem = {
        questionId: currentQ.questionId,
        question: currentQ.question,
        category: currentQ.category,
        difficulty: currentQ.difficulty,
        userAnswer: userAnswer.trim(),
        candidateAnswer: userAnswer.trim(),
        expectedAnswer: evaluation.expectedAnswer || currentQ.expectedAnswer || evaluation.improvedAnswer || '',
        keyPoints: evaluation.keyPoints || currentQ.keyPoints || evaluation.missingPoints || [],
        skipped: false,
        score: evaluation.overallScore,
        correctness: evaluation.correctness,
        relevance: evaluation.relevance,
        completeness: evaluation.completeness,
        clarity: evaluation.clarity,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        missingPoints: evaluation.missingPoints,
        improvedAnswer: evaluation.improvedAnswer
      };

      setCurrentEvaluation(evaluation);
      setSessionResults(prev => [...prev, evaluatedItem]);
      return { success: true, evaluation };
    } catch (err) {
      const errMsg = err.message || 'Unable to evaluate this answer right now. Please try again.';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsEvaluating(false);
    }
  };

  // Skip Question (FR7, FR8)
  const skipQuestion = () => {
    const currentQ = questions[currentIndex];
    const skippedItem = {
      questionId: currentQ.questionId,
      question: currentQ.question,
      category: currentQ.category,
      difficulty: currentQ.difficulty,
      userAnswer: '(Skipped by user)',
      candidateAnswer: '(Skipped by user)',
      expectedAnswer: currentQ.expectedAnswer || '',
      keyPoints: currentQ.keyPoints || [],
      skipped: true,
      score: 0,
      correctness: 0,
      relevance: 0,
      completeness: 0,
      clarity: 0,
      feedback: 'This question was skipped. Be sure to review the recommended sample answer and topic concepts.',
      strengths: [],
      missingPoints: ['Question was skipped during the mock interview.'],
      improvedAnswer: `To approach "${currentQ.question}", clarify the core principles of ${currentQ.category}, discuss standard architectural design practices, and review typical edge cases.`
    };

    setSessionResults(prev => [...prev, skippedItem]);
    setCurrentEvaluation({
      overallScore: 0,
      correctness: 0,
      relevance: 0,
      completeness: 0,
      clarity: 0,
      feedback: skippedItem.feedback,
      strengths: [],
      missingPoints: skippedItem.missingPoints,
      improvedAnswer: skippedItem.improvedAnswer,
      isSkipped: true
    });
  };

  // Move to next question or complete interview
  const nextQuestion = async () => {
    setCurrentEvaluation(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      return { completed: false, nextIndex: currentIndex + 1 };
    } else {
      // Completed interview! Generate report and save to DB
      return await completeInterview();
    }
  };

  // Finalize & Save Interview (FR10)
  const completeInterview = async () => {
    setIsEvaluating(true);
    try {
      // Generate final AI report & recommendations
      const reportData = await aiService.generateReport({
        questions: sessionResults,
        jobRole: config.jobRole,
        experienceLevel: config.experienceLevel
      });

      const totalScore = Math.round(sessionResults.reduce((sum, q) => sum + (Number(q.score) || 0), 0) * 10) / 10;
      const maxScore = (questions.length || 5) * 10;
      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      const fullResult = {
        role: config.jobRole,
        jobRole: config.jobRole,
        experienceLevel: config.experienceLevel,
        interviewType: config.interviewType,
        technicalTopic: config.technicalTopic || '',
        questionCount: questions.length,
        answeredCount: reportData.answeredCount,
        skippedCount: reportData.skippedCount,
        overallScore: reportData.overallScore,
        totalScore,
        percentage,
        feedback: reportData.feedback || (
          reportData.overallScore >= 8 ? 'Outstanding interview performance.' :
          reportData.overallScore >= 5 ? 'Good foundation with areas for technical refinement.' :
          'Significant knowledge gaps detected. Practice fundamental topics before interviewing.'
        ),
        criterionScores: reportData.criterionScores,
        duration,
        report: reportData.report,
        questions: sessionResults,
        dateTime: new Date().toISOString(),
        date: new Date().toISOString()
      };

      setFinalReport(fullResult);

      // Auto-save to database via API
      try {
        const saveRes = await api.post('/interviews', fullResult);
        if (saveRes.data?.success && saveRes.data.data?.interview) {
          setSavedInterviewId(saveRes.data.data.interview._id || saveRes.data.data.interview.id || saveRes.data.data.interview.interviewId);
        }
      } catch (saveErr) {
        console.warn('Auto-save to backend API failed:', saveErr.message);
      }

      return { completed: true, report: fullResult };
    } catch (err) {
      console.error('Error completing interview:', err);
      return { completed: true, error: err.message };
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetInterview = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSessionResults([]);
    setCurrentEvaluation(null);
    setFinalReport(null);
    setSavedInterviewId(null);
    setDuration(0);
    setError(null);
  };

  return (
    <InterviewContext.Provider
      value={{
        config,
        updateConfig,
        questions,
        currentIndex,
        currentQuestion: questions[currentIndex] || null,
        sessionResults,
        currentEvaluation,
        isEvaluating,
        isGenerating,
        duration,
        finalReport,
        savedInterviewId,
        error,
        startInterview,
        submitAnswer,
        skipQuestion,
        nextQuestion,
        resetInterview
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
