import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { 
  Sparkles, 
  PlayCircle, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  HelpCircle, 
  ListOrdered, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';

const InterviewSetup = () => {
  const { config, updateConfig, startInterview, isGenerating, error } = useInterview();
  const navigate = useNavigate();

  const [roleOption, setRoleOption] = useState(
    ['Python Developer', 'Java Developer', 'Full Stack Developer', 'Data Analyst', 'Software Engineer'].includes(config.jobRole)
      ? config.jobRole
      : 'Other'
  );
  const [customRole, setCustomRole] = useState(
    !['Python Developer', 'Java Developer', 'Full Stack Developer', 'Data Analyst', 'Software Engineer'].includes(config.jobRole)
      ? config.jobRole
      : ''
  );

  const [experienceLevel, setExperienceLevel] = useState(config.experienceLevel || 'Beginner');
  const [interviewType, setInterviewType] = useState(config.interviewType || 'Technical');
  const [questionCount, setQuestionCount] = useState(config.questionCount || 5);
  const [technicalTopic, setTechnicalTopic] = useState(config.technicalTopic || '');
  const [validationError, setValidationError] = useState('');

  const handleRoleSelect = (r) => {
    setRoleOption(r);
    if (r !== 'Other') {
      updateConfig({ jobRole: r });
    } else {
      updateConfig({ jobRole: customRole.trim() || 'Software Engineer' });
    }
  };

  const handleCustomRoleChange = (e) => {
    const val = e.target.value;
    setCustomRole(val);
    updateConfig({ jobRole: val.trim() || 'Software Engineer' });
  };

  const handleLevelSelect = (lvl) => {
    setExperienceLevel(lvl);
    updateConfig({ experienceLevel: lvl });
  };

  const handleTypeSelect = (t) => {
    setInterviewType(t);
    updateConfig({ interviewType: t });
  };

  const handleCountSelect = (cnt) => {
    setQuestionCount(cnt);
    updateConfig({ questionCount: cnt });
  };

  const handleStart = async (e) => {
    e.preventDefault();
    const finalRole = roleOption === 'Other' ? customRole.trim() : roleOption;
    if (!finalRole) {
      setValidationError('Please specify your custom job role.');
      return;
    }

    setValidationError('');

    const setupPayload = {
      jobRole: finalRole,
      experienceLevel,
      interviewType,
      technicalTopic: technicalTopic.trim(),
      questionCount
    };

    updateConfig(setupPayload);

    const res = await startInterview(setupPayload);
    if (res.success) {
      navigate('/interview/session');
    }
  };

  const resolvedRole = roleOption === 'Other' ? (customRole || 'Custom Role') : roleOption;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>FR5 • Interview Configuration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Tailor the session to your target role, difficulty level, and focus area. Questions are dynamically generated with progressive difficulty.
        </p>
      </div>

      {(validationError || error) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-8">
        {/* Step 1: Select Job Role (FR5) */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>1. Select Job Role</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Python Developer', 'Java Developer', 'Full Stack Developer', 'Data Analyst', 'Software Engineer', 'Other'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center ${
                  roleOption === r
                    ? 'bg-blue-600 text-white border-blue-400 shadow-glow'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {roleOption === 'Other' && (
            <div className="pt-2 animate-slide-up">
              <label className="text-xs font-semibold uppercase text-slate-400 block mb-1.5">
                Specify Custom Job Role
              </label>
              <input
                type="text"
                value={customRole}
                onChange={handleCustomRoleChange}
                placeholder="e.g., DevOps Engineer, React Native Specialist, Cloud Architect"
                required
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          )}
        </div>

        {/* Step 2: Experience Level (FR5) */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span>2. Select Experience Level</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'Beginner', title: 'Beginner', desc: 'Students, freshers, fundamental concepts' },
              { id: 'Intermediate', title: 'Intermediate', desc: '1–3 years exp, architectures & trade-offs' },
              { id: 'Advanced', title: 'Advanced', desc: '4+ years exp, deep internals & system design' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleLevelSelect(lvl.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  experienceLevel === lvl.id
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-glow'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm">{lvl.title}</div>
                <div className="text-xs text-slate-400 mt-1">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Interview Type & Question Count (FR5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Interview Type */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>3. Interview Type</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['Technical', 'Behavioral', 'Mixed'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeSelect(t)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                    interviewType === t
                      ? 'bg-blue-600 text-white border-blue-400 shadow-glow'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {interviewType === 'Technical' && 'Coding concepts, architectures, database mechanics.'}
              {interviewType === 'Behavioral' && 'STAR-format scenarios, leadership, incident management.'}
              {interviewType === 'Mixed' && 'A balanced combination of technical depth and behavioral scenarios.'}
            </p>
          </div>

          {/* Question Count */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ListOrdered className="w-5 h-5 text-amber-400" />
              <span>4. Number of Questions</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleCountSelect(cnt)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                    questionCount === cnt
                      ? 'bg-blue-600 text-white border-blue-400 shadow-glow'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Estimated duration: ~{questionCount * 2} to {questionCount * 3} minutes.
            </p>
          </div>
        </div>

        {/* Optional Technical Topic (FR5) */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Tag className="w-5 h-5 text-purple-400" />
              <span>5. Optional Technical Topic</span>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Optional</span>
          </div>

          <input
            type="text"
            value={technicalTopic}
            onChange={(e) => {
              setTechnicalTopic(e.target.value);
              updateConfig({ technicalTopic: e.target.value });
            }}
            placeholder="e.g., Python OOP, SQL Joins, React Hooks, Spring Boot, Data Structures"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
          />
          <p className="text-xs text-slate-400">
            If provided, AI will weight questions towards this specific subject area.
          </p>
        </div>

        {/* Summary Confirmation Card (Mandatory FR5 requirement) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950/70 border border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Interview Configuration Summary</h3>
            </div>
            <span className="text-xs text-blue-400 font-medium">Ready to initialize</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Job Role</span>
              <span className="font-bold text-white text-sm">{resolvedRole}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Experience Level</span>
              <span className="font-bold text-white text-sm">{experienceLevel}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Interview Type</span>
              <span className="font-bold text-white text-sm">{interviewType}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Total Questions</span>
              <span className="font-bold text-white text-sm">{questionCount} Questions</span>
            </div>
          </div>

          {technicalTopic && (
            <div className="text-xs pt-1 text-slate-300">
              <strong className="text-slate-400">Target Topic:</strong> {technicalTopic}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Progressive Questions with AI...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  <span>Confirm & Start Mock Interview</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetup;
