import React from 'react';

const ScoreIndicator = ({ score = 0, maxScore = 10, size = 120, strokeWidth = 10, label = 'Overall Score' }) => {
  const normalizedScore = Math.min(maxScore, Math.max(0, Number(score) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (normalizedScore / maxScore) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Semantic color based on SRS IR1:
  // Green for success (>= 8.0)
  // Orange/Yellow for warnings (6.0 - 7.9)
  // Red only for errors / low scores (< 6.0)
  let strokeColor = '#10b981'; // Emerald/Green
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300';
  let statusText = 'Excellent';

  if (normalizedScore < 6.0) {
    strokeColor = '#ef4444'; // Red
    textColor = 'text-rose-400';
    badgeBg = 'bg-rose-950/50 border-rose-500/30 text-rose-300';
    statusText = 'Needs Work';
  } else if (normalizedScore < 8.0) {
    strokeColor = '#f59e0b'; // Amber / Orange
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-950/50 border-amber-500/30 text-amber-300';
    statusText = 'Satisfactory';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
            {normalizedScore.toFixed(1)}
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            out of {maxScore}
          </span>
        </div>
      </div>

      {label && <p className="mt-2 text-xs font-medium text-slate-300">{label}</p>}
      <span className={`mt-1 inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${badgeBg}`}>
        {statusText}
      </span>
    </div>
  );
};

export default ScoreIndicator;
