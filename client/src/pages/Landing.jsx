import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Target, 
  BrainCircuit, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight, 
  Code2, 
  ShieldCheck, 
  Layers, 
  Zap,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-24 py-10">
      {/* Hero Section (FR2) */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-10 sm:pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-medium mb-8 animate-fade-in shadow-glow">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Intelligent Mock Interview Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
          Practice Interviews. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Get AI Feedback.
          </span> <br className="hidden sm:inline" />
          Improve Faster.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Structured, role-specific technical and behavioral mock interviews with instant 4-criteria evaluation, constructive critique, and personalized learning recommendations.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/interview/setup" : "/login"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Interview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white glass-panel glass-panel-hover flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How It Works</span>
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-400 font-medium">
          “Practice. Perform. Improve.” • Built for students, freshers, and career switchers
        </p>
      </section>

      {/* Feature Cards (FR2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed for Real Interview Readiness
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Everything you need to identify knowledge gaps, practice under pressure, and refine your answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Mock Interviews</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dynamically generated questions tailored to your target role, experience level (Beginner to Advanced), and specific topics.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Answer Evaluation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time scoring (0–10) across four core criteria: Correctness, Relevance, Completeness, and Clarity. No inflated ratings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Personalized Feedback</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Detailed breakdown of your strengths, omitted edge cases, and an exemplary improved sample answer for every question.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Performance Tracking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track your interview history, average scores, improvement percentage (+Δ%), and concrete topic-by-topic study recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Section (FR2) */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-blue-500/20 bg-gradient-to-b from-slate-900/90 to-blue-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400">Step-by-Step Flow</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">How It Works in 3 Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-glow">
                1
              </div>
              <h4 className="text-base font-bold text-white">Choose Your Role</h4>
              <p className="text-xs sm:text-sm text-slate-400">
                Select your target career track (Python, Java, Full Stack, Data Analyst, SWE), experience level, and interview type.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-glow">
                2
              </div>
              <h4 className="text-base font-bold text-white">Complete Your Interview</h4>
              <p className="text-xs sm:text-sm text-slate-400">
                Answer dynamically generated progressive questions in a distraction-free mock interview session.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white font-extrabold text-xl flex items-center justify-center shadow-glow">
                3
              </div>
              <h4 className="text-base font-bold text-white">Improve Using AI Feedback</h4>
              <p className="text-xs sm:text-sm text-slate-400">
                Receive instant constructive critiques, sample answers, and personalized study actions to boost real performance.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to={user ? "/interview/setup" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Honest Disclaimer (FR2 / Scope) */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Notice & Purpose:</strong> Interview AI Assistant is an educational practice platform designed to assist students and candidates in identifying weak areas and practicing articulate technical communication. The system does not guarantee hiring outcomes and does not claim infallible human interviewer judgement.
        </div>
      </section>
    </div>
  );
};

export default Landing;
