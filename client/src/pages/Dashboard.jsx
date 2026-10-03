import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import ScoreIndicator from '../components/ScoreIndicator';
import Modal from '../components/Modal';
import { 
  PlayCircle, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Briefcase,
  AlertCircle,
  Eye,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      interviewsCompleted: 0,
      averageScore: 0,
      bestScore: 0,
      latestInterview: null
    },
    criterionAverages: {
      correctness: 0,
      relevance: 0,
      completeness: 0,
      clarity: 0
    },
    trend: [],
    recentInterviews: []
  });

  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews/stats/summary');
      if (res.data?.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching dashboard summary:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const radarData = [
    { subject: 'Correctness', score: data.criterionAverages?.correctness || 0, fullMark: 10 },
    { subject: 'Relevance', score: data.criterionAverages?.relevance || 0, fullMark: 10 },
    { subject: 'Completeness', score: data.criterionAverages?.completeness || 0, fullMark: 10 },
    { subject: 'Clarity', score: data.criterionAverages?.clarity || 0, fullMark: 10 },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader message="Loading your interview metrics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner (FR4) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-panel border border-blue-500/20 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Role: {user?.preferredRole || 'Software Engineer'} ({user?.experienceLevel || 'Beginner'})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Candidate'}!
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Track your mock interview progress, analyze your 4-criteria ratings, and target weak areas before real interviews.
          </p>
        </div>

        <div className="relative z-10">
          <Link
            to="/interview/setup"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-glow transition-all hover:scale-105"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Start New Interview</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Metric Cards (FR4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Completed */}
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews Completed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {data.stats.interviewsCompleted}
          </div>
          <p className="text-xs text-slate-400">Total sessions finished</p>
        </div>

        {/* Card 2: Average Score */}
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
            <span>{data.stats.averageScore.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-500">/ 10</span>
          </div>
          <p className="text-xs text-slate-400">Across all completed answers</p>
        </div>

        {/* Card 3: Best Score */}
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Best Score</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight flex items-baseline gap-1">
            <span>{data.stats.bestScore.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-500">/ 10</span>
          </div>
          <p className="text-xs text-slate-400">Highest mock score achieved</p>
        </div>

        {/* Card 4: Latest Interview */}
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Latest Interview</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white tracking-tight truncate">
            {data.stats.latestInterview ? data.stats.latestInterview.jobRole : 'No interviews yet'}
          </div>
          <p className="text-xs text-slate-400">
            {data.stats.latestInterview
              ? `Score: ${data.stats.latestInterview.overallScore.toFixed(1)}/10 • ${new Date(data.stats.latestInterview.createdAt).toLocaleDateString()}`
              : 'Begin your first session'}
          </p>
        </div>
      </div>

      {/* Analytics Section with Recharts */}
      {data.stats.interviewsCompleted > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Score Progression History</h3>
                <p className="text-xs text-slate-400">Track how your performance is evolving over time</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                0-10 Scale
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="interview" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Overall Score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#60a5fa', r: 5 }}
                    activeDot={{ r: 7, fill: '#93c5fd' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4-Criteria Radar Breakdown */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white">4-Criteria Mastery</h3>
              <p className="text-xs text-slate-400">Average across Correctness, Relevance, Completeness & Clarity</p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={75} data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 10]} stroke="#475569" fontSize={9} />
                  <Radar
                    name="Skills"
                    dataKey="score"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800">
              <div className="p-1.5 rounded-lg bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase block">Correctness</span>
                <span className="text-sm font-bold text-slate-200">{data.criterionAverages.correctness.toFixed(1)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase block">Relevance</span>
                <span className="text-sm font-bold text-slate-200">{data.criterionAverages.relevance.toFixed(1)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase block">Completeness</span>
                <span className="text-sm font-bold text-slate-200">{data.criterionAverages.completeness.toFixed(1)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase block">Clarity</span>
                <span className="text-sm font-bold text-slate-200">{data.criterionAverages.clarity.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Interviews Table (FR4) */}
      <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Mock Interviews</h3>
            <p className="text-xs text-slate-400">Review your past answer evaluations and personalized feedback</p>
          </div>
          {data.recentInterviews.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {data.recentInterviews.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 mx-auto flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-200">No Mock Interviews Completed Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ready to test your knowledge? Configure your first interview session now.
            </p>
            <div className="pt-2">
              <Link
                to="/interview/setup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md"
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
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recentInterviews.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.jobRole}</div>
                      <div className="text-xs text-slate-400">{item.experienceLevel}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.interviewType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {item.answeredCount || item.questions?.filter(q => !q.skipped).length || 0} / {item.questionCount || item.questions?.length}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReport(item)}
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

      {/* Modal for Quick Report View */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Mock Report: ${selectedReport.jobRole} (${selectedReport.experienceLevel})`}
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-slate-400">Interview Type</span>
                <div className="text-sm font-bold text-white">{selectedReport.interviewType} Interview</div>
                <div className="text-xs text-slate-400">Date: {new Date(selectedReport.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-4">
                <ScoreIndicator score={selectedReport.overallScore} size={90} strokeWidth={8} label="Overall Score" />
              </div>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Question Results</h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedReport.questions?.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-400">Q{idx + 1}: {q.category}</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        q.skipped ? 'bg-slate-700 text-slate-400' : 'bg-blue-900/50 text-blue-300'
                      }`}>
                        {q.skipped ? 'Skipped' : `${q.score?.toFixed(1)} / 10`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{q.question}</p>
                    <p className="text-xs text-slate-400 italic">
                      <strong>Your Answer:</strong> {q.userAnswer}
                    </p>
                    {q.feedback && (
                      <p className="text-xs text-emerald-400/90 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                        <strong>Feedback:</strong> {q.feedback}
                      </p>
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

export default Dashboard;
