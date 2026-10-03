import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import ScoreIndicator from '../components/ScoreIndicator';
import CriterionBar from '../components/CriterionBar';
import Loader from '../components/Loader';
import { 
  Send, 
  SkipForward, 
  ArrowRight, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles, 
  Award, 
  BookOpen, 
  AlertCircle,
  FileCheck,
  Zap,
  Target
} from 'lucide-react';

const InterviewSession = () => {
  const {
    config,
    questions,
    currentIndex,
    currentQuestion,
    currentEvaluation,
    isEvaluating,
    duration,
    submitAnswer,
    skipQuestion,
    nextQuestion,
    error
  } = useInterview();

  const navigate = useNavigate();
  const [userAnswer, setUserAnswer] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  // If no questions loaded (e.g. user refreshed or navigated directly), redirect to setup
  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/interview/setup');
    }
  }, [questions, navigate]);

  if (!questions || questions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader message="Preparing your interview session..." />
      </div>
    );
  }

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;
  const progressPercent = Math.round(((currentIndex + (currentEvaluation ? 1 : 0)) / questions.length) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      setValidationError('Please type your answer before submitting, or click "Skip Question".');
      return;
    }

    setValidationError('');
    await submitAnswer(userAnswer.trim());
  };

  const handleSkip = () => {
    setValidationError('');
    skipQuestion();
  };

  const handleNext = async () => {
    setUserAnswer('');
    setValidationError('');
    if (currentIndex + 1 < questions.length) {
      await nextQuestion();
    } else {
      setIsFinishing(true);
      const res = await nextQuestion(); // Finalizes & saves to DB
      setIsFinishing(false);
      navigate('/interview/result');
    }
  };

  const isLastQuestion = currentIndex + 1 === questions.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Session Progress Bar & Header (FR7) */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30">
              {config.jobRole}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-medium">{config.experienceLevel}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-medium">{config.interviewType}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono font-medium">{formatTimer(duration)}</span>
            </div>
            <span className="font-bold text-white">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar (FR7) */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card (FR7) */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Category: {currentQuestion.category}
          </span>
          <span className={`font-semibold px-2.5 py-1 rounded-md border ${
            currentQuestion.difficulty === 'Beginner'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : currentQuestion.difficulty === 'Intermediate'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
          }`}>
            Difficulty: {currentQuestion.difficulty}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Validation or Evaluation Errors */}
      {(validationError || error) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Answer Input Section (if not evaluated yet) */}
      {!currentEvaluation ? (
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="font-semibold uppercase tracking-wider text-slate-300">
              Your Answer
            </label>
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{userAnswer.length} characters</span>
            </div>
          </div>

          <textarea
            rows={7}
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={isEvaluating}
            placeholder="Type your structured answer here. Include core concepts, real-world examples, and trade-offs..."
            className="w-full p-4 rounded-xl glass-input text-sm leading-relaxed placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
          />

          {/* Action Buttons with Guarded Evaluation (FR7) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isEvaluating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/80 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip Question</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse">AI is evaluating your answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Instant Feedback Panel (FR8, FR9) */
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-blue-500/30 bg-gradient-to-b from-slate-900 to-blue-950/30 space-y-6 animate-slide-up shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Evaluation Complete</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Answer Assessment & Feedback
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {currentEvaluation.isSkipped 
                  ? 'This question was skipped. Review the model response below to prepare for next time.' 
                  : 'Constructive review against the 4 core interview evaluation criteria.'}
              </p>
            </div>

            {/* Circular Score Indicator (FR8) */}
            <ScoreIndicator score={currentEvaluation.overallScore} size={110} strokeWidth={9} label="Overall Score" />
          </div>

          {/* 4-Criteria Breakdown (FR8) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <CriterionBar name="Correctness" score={currentEvaluation.correctness} description="Technical accuracy" />
            <CriterionBar name="Relevance" score={currentEvaluation.relevance} description="Direct answer to question" />
            <CriterionBar name="Completeness" score={currentEvaluation.completeness} description="Depth and edge cases" />
            <CriterionBar name="Clarity" score={currentEvaluation.clarity} description="Structure & articulation" />
          </div>

          {/* Strengths & Missing Points (FR8, FR9) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>What You Did Well</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {currentEvaluation.strengths?.length > 0 ? (
                  currentEvaluation.strengths.map((str, idx) => (
                    <li key={idx} className="leading-relaxed">{str}</li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No specific strengths recorded for this response.</li>
                )}
              </ul>
            </div>

            {/* Missing Points */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>What You Missed</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {currentEvaluation.missingPoints?.length > 0 ? (
                  currentEvaluation.missingPoints.map((miss, idx) => (
                    <li key={idx} className="leading-relaxed">{miss}</li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Covered the standard requirements thoroughly.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Constructive Educational Feedback (FR9) */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>Feedback & Improvement Tip</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {currentEvaluation.feedback}
            </p>
          </div>

          {/* Exemplary Improved Sample Answer (FR9) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Exemplary Sample Answer</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/60 p-3.5 rounded-lg border border-white/5">
              {currentEvaluation.improvedAnswer}
            </div>
          </div>

          {/* Next Question / Finish Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={isFinishing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {isFinishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Final Report...</span>
                </>
              ) : isLastQuestion ? (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>View Final Performance Report</span>
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;
