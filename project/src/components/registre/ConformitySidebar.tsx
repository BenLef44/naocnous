import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export interface SectionScore {
  id: string;
  label: string;
  score: number;
  max: number;
}

interface Props {
  sections: SectionScore[];
  activeSection: string;
  onJump: (id: string) => void;
  overallScore: number;
}

export default function ConformitySidebar({ sections, activeSection, onJump, overallScore }: Props) {
  const level = overallScore < 40 ? 'critical' : overallScore < 65 ? 'warning' : overallScore < 85 ? 'good' : 'excellent';
  const barColor = level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-orange-400' : 'bg-emerald-500';
  const textColor = level === 'critical' ? 'text-red-600' : level === 'warning' ? 'text-orange-600' : 'text-emerald-600';

  return (
    <div className="flex flex-col h-full">
      {/* Overall score */}
      <div className="px-3 py-3 border-b border-slate-100 flex-shrink-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Conformité globale</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${overallScore}%` }} />
          </div>
          <span className={`text-xs font-black tabular-nums ${textColor}`}>{overallScore}%</span>
        </div>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {sections.map(s => {
          const pct = s.max > 0 ? Math.round((s.score / s.max) * 100) : 0;
          const isComplete = s.score >= s.max;
          const isPartial = s.score > 0 && s.score < s.max;
          const isEmpty = s.score === 0;
          const isActive = s.id === activeSection;

          const dot = isComplete ? 'bg-emerald-500' : isPartial ? 'bg-amber-400' : 'bg-slate-300';
          const Icon = isComplete ? CheckCircle2 : isEmpty ? AlertCircle : Circle;
          const iconColor = isComplete ? 'text-emerald-500' : isEmpty ? 'text-slate-300' : 'text-amber-400';

          return (
            <button
              key={s.id}
              onClick={() => onJump(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${iconColor} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold truncate ${isActive ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {s.label}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${dot} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 tabular-nums">{s.score}/{s.max}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
