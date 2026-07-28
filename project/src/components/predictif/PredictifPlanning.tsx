import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Layers, Sun, Cloud,
  Users, Brain, Zap, AlertTriangle,
} from 'lucide-react';
import {
  Prediction, MOCK_PREDICTIONS,
  CRITICITE_PRED_CFG, CATEGORIE_PRED_CFG, CriticitePred,
} from './predictifTypes';
import { addDays, startOfWeek, format, isSameDay, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Mode selector ────────────────────────────────────────────────────────────

type ViewMode = 'semaine' | 'mois' | '3mois';

const VIEW_LABELS: Record<ViewMode, string> = {
  semaine: 'Semaine',
  mois: 'Mois',
  '3mois': '3 mois',
};

// ─── Mock weather overlay ─────────────────────────────────────────────────────

const WEATHER: Record<string, { icon: string; label: string; bg: string }> = {};
// Generate deterministic weather for ~90 days
function getWeather(date: Date): { icon: string; label: string; bg: string } {
  const d = differenceInCalendarDays(date, new Date('2026-05-28'));
  const v = ((d * 13 + 7) % 4 + 4) % 4;
  return [
    { icon: '☀️', label: 'Ensoleillé', bg: 'bg-yellow-50' },
    { icon: '⛅', label: 'Nuageux',    bg: 'bg-slate-50'  },
    { icon: '🌧️', label: 'Pluvieux',   bg: 'bg-blue-50'   },
    { icon: '🌤️', label: 'Variable',   bg: 'bg-sky-50'    },
  ][v];
}

// ─── Mock school holiday periods ─────────────────────────────────────────────

function isVacances(date: Date): boolean {
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();
  // Summer July-August
  if (m === 6 || m === 7) return true;
  return false;
}

// ─── Event bar ────────────────────────────────────────────────────────────────

function EventBar({ pred, onClick }: { pred: Prediction; onClick: () => void }) {
  const critCfg = CRITICITE_PRED_CFG[pred.criticite];
  const catCfg = CATEGORIE_PRED_CFG[pred.categorie];
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={pred.titre}
      className={`w-full text-left px-1.5 py-0.5 rounded text-xs font-medium line-clamp-2 whitespace-normal leading-tight ${critCfg.badgeBg} ${critCfg.text} hover:opacity-80 transition-opacity border ${critCfg.border}`}
    >
      {critCfg.icon} {pred.titre}
    </button>
  );
}

// ─── Week view ────────────────────────────────────────────────────────────────

const PRED_WEEK_HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const PRED_HOUR_H     = 44;
const PRED_LUNCH_S    = 12.5;
const PRED_LUNCH_E    = 13.5;
const PRED_AM_SLOTS   = [8, 9, 10, 11, 12];
const PRED_PM_SLOTS   = [14, 15, 16, 17];
const PRED_ALL_SLOTS  = [...PRED_AM_SLOTS, ...PRED_PM_SLOTS];
function predHashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function predAssignHour(evId: string): number {
  return PRED_ALL_SLOTS[predHashStr(evId) % PRED_ALL_SLOTS.length];
}

function WeekView({ refDate, predictions, onSelect }: {
  refDate: Date;
  predictions: Prediction[];
  onSelect: (p: Prediction) => void;
}) {
  const monday = startOfWeek(refDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = new Date();
  const totalH = PRED_WEEK_HOURS.length * PRED_HOUR_H;

  return (
    <div className="flex flex-col flex-1">
      {/* Day headers */}
      <div className="flex border-b border-slate-200 shrink-0">
        <div className="w-12 flex-shrink-0 border-r border-slate-100" />
        {days.map(day => {
          const w = getWeather(day);
          const isToday = isSameDay(day, today);
          const vac = isVacances(day);
          return (
            <div key={day.toISOString()} className={`flex-1 text-center py-2 border-r border-slate-100 last:border-r-0 ${vac ? 'bg-amber-50' : ''}`}>
              <div className="text-xs text-slate-500 uppercase tracking-wide">{format(day, 'EEE', { locale: fr })}</div>
              <div className={`text-base font-bold mt-0.5 mx-auto w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </div>
              <div className="text-xs mt-0.5">{w.icon}</div>
              {vac && <div className="text-[10px] text-amber-600 font-medium">Vacances</div>}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Hour labels */}
        <div className="w-12 flex-shrink-0 relative border-r border-slate-100" style={{ height: totalH }}>
          {PRED_WEEK_HOURS.map(h => (
            <div key={h} className="absolute w-full flex items-start justify-end pr-1.5" style={{ top: (h - 7) * PRED_HOUR_H, height: PRED_HOUR_H }}>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{h}h</span>
            </div>
          ))}
          <div className="absolute left-0 right-0 flex items-center justify-center"
            style={{ top: (PRED_LUNCH_S - 7) * PRED_HOUR_H, height: (PRED_LUNCH_E - PRED_LUNCH_S) * PRED_HOUR_H }}>
            <span className="text-[9px] text-slate-400 rotate-[-90deg] whitespace-nowrap">Repas</span>
          </div>
        </div>

        {/* Day columns */}
        {days.map(day => {
          const vac = isVacances(day);
          const dayPreds = predictions.filter(p => isSameDay(new Date(p.date_estimee), day));
          const byHour = new Map<number, Prediction[]>();
          dayPreds.forEach(p => {
            const h = predAssignHour(p.id);
            if (!byHour.has(h)) byHour.set(h, []);
            byHour.get(h)!.push(p);
          });
          return (
            <div key={day.toISOString()} className={`flex-1 relative border-r border-slate-100 last:border-r-0 ${vac ? 'bg-amber-50/30' : ''}`}
              style={{ height: totalH }}>
              {PRED_WEEK_HOURS.map(h => (
                <div key={h} className="absolute left-0 right-0 border-t border-slate-100"
                  style={{ top: (h - 7) * PRED_HOUR_H, height: PRED_HOUR_H }} />
              ))}
              <div className="absolute left-0 right-0 bg-slate-200/40 border-t border-b border-slate-200/60 pointer-events-none"
                style={{ top: (PRED_LUNCH_S - 7) * PRED_HOUR_H, height: (PRED_LUNCH_E - PRED_LUNCH_S) * PRED_HOUR_H }} />
              {Array.from(byHour.entries()).map(([h, preds]) => (
                <div key={h} className="absolute left-0.5 right-0.5 space-y-0.5 overflow-hidden"
                  style={{ top: (h - 7) * PRED_HOUR_H + 2, maxHeight: PRED_HOUR_H - 4 }}>
                  {preds.map(p => <EventBar key={p.id} pred={p} onClick={() => onSelect(p)} />)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Month view ───────────────────────────────────────────────────────────────

function MonthView({ refDate, predictions, onSelect }: {
  refDate: Date;
  predictions: Prediction[];
  onSelect: (p: Prediction) => void;
}) {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = startOfWeek(firstDay, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(startDay, i));
  const today = new Date();

  return (
    <div className="flex flex-col flex-1">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-100 last:border-r-0">{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {days.map(day => {
          const inMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const vac = isVacances(day);
          const dayPreds = predictions.filter(p => isSameDay(new Date(p.date_estimee), day));
          return (
            <div
              key={day.toISOString()}
              className={`border-r border-b border-slate-100 last:border-r-0 p-1 min-h-[100px] ${!inMonth ? 'bg-slate-50' : vac ? 'bg-amber-50/40' : ''}`}
            >
              <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayPreds.slice(0, 2).map(p => (
                  <EventBar key={p.id} pred={p} onClick={() => onSelect(p)} />
                ))}
                {dayPreds.length > 2 && (
                  <button className="text-xs text-blue-600 hover:underline pl-1">+{dayPreds.length - 2}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3-month view ─────────────────────────────────────────────────────────────

function ThreeMonthView({ refDate, predictions, onSelect }: {
  refDate: Date;
  predictions: Prediction[];
  onSelect: (p: Prediction) => void;
}) {
  const months = [0, 1, 2].map(i => {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() + i, 1);
    return d;
  });

  return (
    <div className="flex gap-3 flex-1 overflow-auto p-4">
      {months.map(monthStart => {
        const year = monthStart.getFullYear();
        const month = monthStart.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDay = startOfWeek(firstDay, { weekStartsOn: 1 });
        const days: Date[] = [];
        for (let i = 0; i < 42; i++) days.push(addDays(startDay, i));
        const today = new Date();

        return (
          <div key={monthStart.toISOString()} className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden min-w-[300px]">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 capitalize">
                {format(monthStart, 'MMMM yyyy', { locale: fr })}
              </h3>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} className="py-1 text-center text-xs text-slate-400 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map(day => {
                const inMonth = day.getMonth() === month;
                const isToday = isSameDay(day, today);
                const dayPreds = predictions.filter(p => isSameDay(new Date(p.date_estimee), day));
                const hasCrit = dayPreds.some(p => p.criticite === 'critique');
                const hasMaj = dayPreds.some(p => p.criticite === 'majeure');
                return (
                  <div
                    key={day.toISOString()}
                    className={`relative flex flex-col items-center py-1 border-b border-r border-slate-50 last:border-r-0 ${!inMonth ? 'opacity-30' : ''}`}
                  >
                    <div className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}>
                      {format(day, 'd')}
                    </div>
                    {dayPreds.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayPreds.slice(0, 3).map(p => (
                          <button
                            key={p.id}
                            onClick={() => onSelect(p)}
                            title={p.titre}
                            className={`w-1.5 h-1.5 rounded-full ${CRITICITE_PRED_CFG[p.criticite].dot}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mini detail panel ────────────────────────────────────────────────────────

function DetailPanel({ pred, onClose }: { pred: Prediction; onClose: () => void }) {
  const critCfg = CRITICITE_PRED_CFG[pred.criticite];
  const catCfg = CATEGORIE_PRED_CFG[pred.categorie];
  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
      <div className={`p-4 ${critCfg.bg} border-b ${critCfg.border}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${critCfg.badgeBg} ${critCfg.text}`}>{critCfg.icon} {critCfg.label}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-tight">{pred.titre}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2 shrink-0">✕</button>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
        <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-blue-700 font-semibold mb-1 flex items-center gap-1"><Brain className="w-3 h-3" /> Action IA</p>
          <p className="text-blue-800">{pred.action_recommandee}</p>
        </div>
        {[
          ['Équipement', pred.equipement],
          ['Résidence', pred.residence],
          ['Responsable', pred.responsable],
          ['Source', pred.source],
          ['Probabilité', `${pred.probabilite}%`],
          ['Score IA', `${pred.score_ia} / 100`],
          ['Coût estimé', pred.cout_estime !== null ? `${pred.cout_estime.toLocaleString('fr-FR')} €` : '—'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-slate-500">{k}</span>
            <span className="font-medium text-slate-700 text-right max-w-[160px]">{v}</span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200">
        <button className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          Créer une intervention
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PredictifPlanning() {
  const [view, setView] = useState<ViewMode>('semaine');
  const [refDate, setRefDate] = useState(new Date());
  const [filterCriticite, setFilterCriticite] = useState<CriticitePred | ''>('');
  const [selectedPred, setSelectedPred] = useState<Prediction | null>(null);

  const navigate = (dir: 1 | -1) => {
    const steps = view === 'semaine' ? 7 : view === 'mois' ? 30 : 90;
    setRefDate(d => addDays(d, dir * steps));
  };

  const filtered = useMemo(() =>
    MOCK_PREDICTIONS.filter(p => !filterCriticite || p.criticite === filterCriticite),
    [filterCriticite]
  );

  const periodLabel = () => {
    if (view === 'semaine') {
      const monday = startOfWeek(refDate, { weekStartsOn: 1 });
      const sunday = addDays(monday, 6);
      return `${format(monday, 'd MMM', { locale: fr })} – ${format(sunday, 'd MMM yyyy', { locale: fr })}`;
    }
    if (view === 'mois') return format(refDate, 'MMMM yyyy', { locale: fr });
    return `${format(refDate, 'MMMM', { locale: fr })} – ${format(addDays(refDate, 89), 'MMMM yyyy', { locale: fr })}`;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0 flex-wrap">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRefDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            Aujourd'hui
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-sm font-bold text-slate-800 capitalize min-w-[200px]">{periodLabel()}</h2>

        {/* View toggle */}
        <div className="flex bg-slate-200 rounded-lg p-0.5 gap-0.5">
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map(m => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              {VIEW_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Criticité filter */}
        <div className="flex items-center gap-1 ml-2">
          {([''] as (CriticitePred | '')[]).concat(Object.keys(CRITICITE_PRED_CFG) as CriticitePred[]).map(k => {
            const cfg = k ? CRITICITE_PRED_CFG[k] : null;
            const active = filterCriticite === k;
            return (
              <button
                key={k || 'all'}
                onClick={() => setFilterCriticite(k)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  active ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cfg ? `${cfg.icon} ${cfg.label}` : 'Toutes'}
              </button>
            );
          })}
        </div>

        {/* Overlays legend */}
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">☀️ Météo</span>
          <span className="flex items-center gap-1 text-amber-600">📅 Vacances</span>
          <span className="flex items-center gap-1 text-blue-600"><Brain className="w-3 h-3" /> Prédiction IA</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          {view === 'semaine' && <WeekView refDate={refDate} predictions={filtered} onSelect={setSelectedPred} />}
          {view === 'mois' && <MonthView refDate={refDate} predictions={filtered} onSelect={setSelectedPred} />}
          {view === '3mois' && <ThreeMonthView refDate={refDate} predictions={filtered} onSelect={setSelectedPred} />}
        </div>

        {selectedPred && (
          <DetailPanel pred={selectedPred} onClose={() => setSelectedPred(null)} />
        )}
      </div>
    </div>
  );
}
