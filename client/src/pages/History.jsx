import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import ScoreIndicator from '../components/ScoreIndicator';
import Modal from '../components/Modal';
import { 
  History as HistoryIcon, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  PlayCircle, 
  Eye, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const HistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [progress, setProgress] = useState({
    previousScore: null,
    latestScore: null,
    improvementPercentage: 0,
    improvementDisplay: '0%'
  });
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews');
      if (res.data?.success && res.data.data) {
        setInterviews(res.data.data.interviews || []);
        if (res.data.data.progress) {
          setProgress(res.data.data.progress);
        }
      }
    } catch (err) {
      console.warn('Error fetching interview history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader message="Loading interview history..." />
      </div>
    );
  }

  const isPositive = progress.improvementPercentage > 0;
  const isNegative = progress.improvementPercentage < 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>FR12 • Interview History & Progress</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Interview History & Performance Growth
          </h1>
          <p className="text-sm text-slate-400">
            Compare past interview scores, monitor skill improvement, and review detailed evaluations.
          </p>
        </div>

        <Link
          to="/interview/setup"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-glow"
        >
          <PlayCircle className="w-4 h-4" />
          <span>New Mock Session</span>
        </Link>
      </div>

      {/* Progress Metric Card (FR12) */}
      {interviews.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-2xl glass-panel border border-blue-500/20 bg-gradient-to-r from-slate-900 to-blue-950/40">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Previous Score</span>
            <div className="text-2xl font-extrabold text-slate-300">
              {progress.previousScore?.toFixed(1) || '0.0'} <span className="text-xs text-slate-500">/ 10</span>
            </div>
            <p className="text-xs text-slate-500">Penultimate attempt</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest Score</span>
            <div className="text-2xl font-extrabold text-white">
              {progress.latestScore?.toFixed(1) || '0.0'} <span className="text-xs text-slate-500">/ 10</span>
            </div>
            <p className="text-xs text-slate-500">Most recent attempt</p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Score Improvement</span>
            <div className={`text-2xl font-extrabold flex items-center gap-1.5 ${
              isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {isPositive ? <TrendingUp className="w-6 h-6" /> : isNegative ? <TrendingDown className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
              <span>{progress.improvementDisplay}</span>
            </div>
            <p className="text-xs text-slate-400">
              {isPositive ? 'Demonstrated positive learning curve!' : 'Keep practicing to reinforce concepts.'}
            </p>
          </div>
        </div>
      )}

      {/* History List Table (FR12) */}
      <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
        {interviews.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 mx-auto flex items-center justify-center">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Mock Interviews Recorded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your completed interview reports, scores, and questions will appear here automatically.
            </p>
            <div className="pt-2">
              <Link
                to="/interview/setup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start Your First Interview</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Role & Level</th>
                  <th className="py-3 px-4">Track</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Overall Score</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {interviews.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{item.jobRole}</div>
                      <div className="text-xs text-slate-400">{item.experienceLevel}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.interviewType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {item.technicalTopic || 'General'}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {item.answeredCount || item.questions?.filter(q => !q.skipped).length || 0} / {item.questionCount || item.questions?.length}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        item.overallScore >= 8 
                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                          : item.overallScore >= 6
                          ? 'text-amber-400 bg-amber-950/40 border-amber-500/30'
                          : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                      }`}>
                        {item.overallScore?.toFixed(1)} / 10
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedInterview(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 border border-blue-500/20 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Detailed Report Modal (FR12) */}
      {selectedInterview && (
        <Modal
          isOpen={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          title={`Interview Report: ${selectedInterview.jobRole} (${selectedInterview.experienceLevel})`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Summary card */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs uppercase font-bold text-blue-400">
                  {selectedInterview.interviewType} Interview
                </span>
                <div className="text-base font-bold text-white">
                  Topic: {selectedInterview.technicalTopic || 'Broad Curriculum'}
                </div>
                <div className="text-xs text-slate-400">
                  Completed on {new Date(selectedInterview.createdAt).toLocaleString()} • Duration: ~{Math.round((selectedInterview.duration || 60) / 60)} mins
                </div>
              </div>

              <ScoreIndicator score={selectedInterview.overallScore} size={95} strokeWidth={8} label="Overall Score" />
            </div>

            {/* 4-Criteria summary */}
            {selectedInterview.criterionScores && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Correctness</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    {selectedInterview.criterionScores.correctness?.toFixed(1) || '0.0'}/10
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Relevance</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    {selectedInterview.criterionScores.relevance?.toFixed(1) || '0.0'}/10
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Completeness</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    {selectedInterview.criterionScores.completeness?.toFixed(1) || '0.0'}/10
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Clarity</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    {selectedInterview.criterionScores.clarity?.toFixed(1) || '0.0'}/10
                  </span>
                </div>
              </div>
            )}

            {/* Recommendations if present */}
            {selectedInterview.report?.recommendations?.length > 0 && (
              <div className="space-y-2 p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                  AI Actionable Recommendations
                </span>
                <div className="space-y-2 text-xs">
                  {selectedInterview.report.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <strong className="text-slate-200">{rec.topic}:</strong> <span className="text-slate-300">{rec.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Question Details ({selectedInterview.questions?.length})
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedInterview.questions?.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-400">Q{idx + 1}: {q.category} ({q.difficulty})</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        q.skipped ? 'bg-slate-700 text-slate-400' : 'bg-blue-900/60 text-blue-300'
                      }`}>
                        {q.skipped ? 'Skipped' : `${q.score?.toFixed(1)} / 10`}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200">{q.question}</p>
                    <div className="p-2.5 rounded bg-slate-950/60 text-slate-300 italic">
                      <strong>Answer:</strong> {q.userAnswer}
                    </div>
                    {q.feedback && (
                      <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                        <strong>Feedback:</strong> {q.feedback}
                      </div>
                    )}
                    {q.improvedAnswer && (
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-400 whitespace-pre-wrap">
                        <strong>Sample Model Answer:</strong>\n{q.improvedAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HistoryPage;
