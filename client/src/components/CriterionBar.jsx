import React from 'react';

const CriterionBar = ({ name, score = 0, max = 10, icon: Icon, description }) => {
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));

  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
  if (score < 6) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-400 bg-rose-950/40 border-rose-500/30';
  } else if (score < 8) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-500/30';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-blue-400" />}
          <span className="font-medium text-slate-200">{name}</span>
          {description && <span className="text-xs text-slate-400 hidden sm:inline">({description})</span>}
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
          {score.toFixed(1)} / {max}
        </span>
      </div>

      <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CriterionBar;
