import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import ScoreIndicator from '../components/ScoreIndicator';
import CriterionBar from '../components/CriterionBar';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  History, 
  Lightbulb, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  ChevronDown, 
  Sparkles,
  BarChart2,
  FileCheck2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

const InterviewResult = () => {
  const { finalReport, resetInterview } = useInterview();
  const navigate = useNavigate();

  // If user refreshed or navigated directly without an active report, redirect to dashboard
  if (!finalReport) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">No active interview report found</h2>
        <p className="text-sm text-slate-400">Complete an interview session to view your performance report.</p>
        <Link
          to="/interview/setup"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
        >
          Start New Interview
        </Link>
      </div>
    );
  }

  const formatDuration = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const chartData = [
    { name: 'Correctness', score: finalReport.criterionScores?.correctness || 0 },
    { name: 'Relevance', score: finalReport.criterionScores?.relevance || 0 },
    { name: 'Completeness', score: finalReport.criterionScores?.completeness || 0 },
    { name: 'Clarity', score: finalReport.criterionScores?.clarity || 0 },
  ];

  const handlePracticeAgain = () => {
    resetInterview();
    navigate('/interview/setup');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Banner (FR10) */}
      <div className="p-8 rounded-3xl glass-panel border border-blue-500/20 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/50 text-center relative overflow-hidden shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Session Complete • Report Auto-Saved</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Interview Completed
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Role: <strong className="text-white">{finalReport.jobRole}</strong> ({finalReport.experienceLevel}) • {finalReport.interviewType} Track
        </p>

        {/* 4 Summary Stats (FR10) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
          {/* Overall Score */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Overall Score</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {finalReport.overallScore?.toFixed(1)} <span className="text-xs text-slate-400">/ 10</span>
            </div>
          </div>

          {/* Answered */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Answered</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {finalReport.answeredCount || 0}
            </div>
          </div>

          {/* Skipped */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Skipped</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {finalReport.skippedCount || 0}
            </div>
          </div>

          {/* Duration */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Duration</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
              {formatDuration(finalReport.duration || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown (FR10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular indicator & details */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Performance Summary</h3>
          <ScoreIndicator score={finalReport.overallScore} size={130} strokeWidth={10} label="Final Score Average" />
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Evaluated rigorously across all answered questions. Scores are not artificially inflated.
          </p>
        </div>

        {/* 4-Criteria Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">4-Criteria Score Breakdown</h3>
              <p className="text-xs text-slate-400">Correctness, Relevance, Completeness, Clarity (0–10 scale)</p>
            </div>
            <BarChart2 className="w-5 h-5 text-blue-400" />
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block uppercase">Correctness</span>
              <span className="text-sm font-bold text-slate-200">{finalReport.criterionScores?.correctness?.toFixed(1)}/10</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block uppercase">Relevance</span>
              <span className="text-sm font-bold text-slate-200">{finalReport.criterionScores?.relevance?.toFixed(1)}/10</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block uppercase">Completeness</span>
              <span className="text-sm font-bold text-slate-200">{finalReport.criterionScores?.completeness?.toFixed(1)}/10</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block uppercase">Clarity</span>
              <span className="text-sm font-bold text-slate-200">{finalReport.criterionScores?.clarity?.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Areas to Improve (FR10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-950/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-200 list-disc list-inside">
            {finalReport.report?.strengths?.map((str, idx) => (
              <li key={idx} className="leading-relaxed">{str}</li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="p-6 rounded-2xl glass-panel border border-amber-500/20 bg-amber-950/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5" />
            <span>Target Areas to Improve</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-200 list-disc list-inside">
            {finalReport.report?.areasToImprove?.map((area, idx) => (
              <li key={idx} className="leading-relaxed">{area}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Concrete AI Recommendations (FR11) */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-blue-500/30 bg-gradient-to-b from-slate-900 to-blue-950/30 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Personalized AI Learning Recommendations</h3>
            <p className="text-xs text-slate-400">Concrete practice suggestions directly mapped to your weak areas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {finalReport.report?.recommendations?.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-blue-500/30 transition-all">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                {rec.topic}
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {rec.action}
              </p>
              {rec.resources && (
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <strong className="text-slate-300">Recommended Resource:</strong> {rec.resources}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Question-wise Results Review (FR10) */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Question-by-Question Review</h3>
            <p className="text-xs text-slate-400">Review all generated questions, your answers, scores, and feedback</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {finalReport.questions?.length} Questions
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {finalReport.questions?.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 transition-colors hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded">
                    Question {idx + 1}
                  </span>
                  <span className="text-blue-400 font-semibold">{item.category}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{item.difficulty}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-bold px-2 py-0.5 rounded text-xs border ${
                    item.skipped
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : item.score >= 8
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : item.score >= 6
                      ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                      : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                  }`}>
                    {item.skipped ? 'Skipped' : `${item.score?.toFixed(1)} / 10`}
                  </span>
                </div>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-white">
                {item.question}
              </h4>

              <div className="p-3 rounded-lg bg-slate-950/50 text-xs text-slate-300 border border-white/5 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                  Your Answer:
                </span>
                <p className="italic leading-relaxed">{item.userAnswer}</p>
              </div>

              {item.feedback && (
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px] block">
                    AI Feedback:
                  </span>
                  <p className="leading-relaxed">{item.feedback}</p>
                </div>
              )}

              {item.improvedAnswer && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block">
                    Exemplary Model Answer:
                  </span>
                  <p className="font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {item.improvedAnswer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTAs: Practice Again & View History (FR10) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-12">
        <button
          onClick={handlePracticeAgain}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-glow transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practice Again</span>
        </button>

        <Link
          to="/history"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-200 hover:text-white glass-panel glass-panel-hover border border-white/10 transition-all flex items-center justify-center gap-2"
        >
          <History className="w-4 h-4 text-blue-400" />
          <span>View Interview History</span>
        </Link>
      </div>
    </div>
  );
};

export default InterviewResult;
