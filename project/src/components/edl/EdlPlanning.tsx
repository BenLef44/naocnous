import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange,
  LayoutGrid, SlidersHorizontal, ChevronDown, Settings2, X, Search,
  Building2, MapPin, Home, User, ClipboardCheck, ExternalLink,
  LogIn, LogOut,
} from 'lucide-react';
import { EdlRecord, PreEdlRecord, EdlType, EdlStatut, EDL_CFG, PRE_EDL_CFG, DEMO_PRE_EDL } from './edlTypes';
import PhotoStudio from '../../assets/Photo-Studio.png';

// ── Types ─────────────────────────────────────────────────────────────────────

type CalendarMode = 'month' | 'week' | 'year' | 'scheduler';
type SchedulerPeriod = 'month' | 'week' | 'day';

interface EdlCalEvent {
  id: string;
  date: Date;
  nom: string;
  prenom: string;
  logement_numero: string;
  residence_nom: string;
  type: EdlType | 'pre_edl';
  statut: EdlStatut | string;
  rawRecord?: EdlRecord;
  rawPreEdl?: PreEdlRecord;
}

interface Props {
  records: EdlRecord[];
  preEdlRecords?: PreEdlRecord[];
  onOpenPreEdl?: (r: PreEdlRecord) => void;
  onOpenEdlFiche?: (r: EdlRecord) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_LABELS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const WEEK_HOURS  = Array.from({ length: 14 }, (_, i) => i + 7);
const HOUR_H      = 44;
const LUNCH_START = 12.5;
const LUNCH_END   = 13.5;
const SLOTS       = [8, 9, 10, 11, 14, 15, 16, 17];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function assignHour(id: string): number { return SLOTS[hashStr(id) % SLOTS.length]; }

const TYPE_CFG: Record<string, { label: string; bg: string; text: string; dot: string; border: string; hex: string }> = {
  entrant:  { label: 'EDL Entrant',  bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200',   hex: '#3b82f6' },
  sortant:  { label: 'EDL Sortant',  bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200', hex: '#f97316' },
  pre_edl:  { label: 'Pré-EDL',      bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200', hex: '#eab308' },
  pre_sortant: { label: 'Pré-sortant', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200', hex: '#8b5cf6' },
};

const CAL_MODES: { key: CalendarMode; label: string; Icon: React.ElementType }[] = [
  { key: 'month',     label: 'Mois',         Icon: Calendar      },
  { key: 'week',      label: 'Semaine',       Icon: CalendarDays  },
  { key: 'year',      label: 'Année',         Icon: CalendarRange },
  { key: 'scheduler', label: 'Planificateur', Icon: LayoutGrid    },
];

const EDL_TYPES: EdlType[] = ['entrant', 'sortant'];

// ── Agent photo helpers ───────────────────────────────────────────────────────

const AGENT_PHOTOS = [
  'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/6551937/pexels-photo-6551937.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3760376/pexels-photo-3760376.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/8090137/pexels-photo-8090137.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
];

function getAgentPhoto(name: string): string {
  return AGENT_PHOTOS[hashStr(name) % AGENT_PHOTOS.length];
}

function AgentMini({ name, size = 20 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!err) {
    return (
      <img src={getAgentPhoto(name)} alt={name}
        className="rounded-full object-cover border border-white shadow-sm flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setErr(true)} />
    );
  }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className="rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold flex-shrink-0 text-[8px]"
      style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}

// ── EventBlock ────────────────────────────────────────────────────────────────

function EdlEventBlock({ ev, onClick }: { ev: EdlCalEvent; onClick?: (ev: EdlCalEvent) => void }) {
  const cfg    = TYPE_CFG[ev.type] ?? TYPE_CFG.entrant;
  const r      = ev.rawRecord;
  const agent  = r?.agent_edl ?? null;
  const typoLgt = r?.type_logement ?? null;

  return (
    <div
      onClick={() => onClick?.(ev)}
      className={`rounded-md border-l-[3px] px-2 py-1 text-xs mb-0.5 overflow-hidden cursor-pointer hover:brightness-95 transition-all ${cfg.bg}`}
      style={{ borderLeftColor: cfg.hex }}
    >
      {/* Top row: type icon + name + agent avatar */}
      <div className="flex items-center gap-1 min-w-0">
        <span className={`flex-shrink-0 ${cfg.text}`}>
          {ev.type === 'entrant' ? <LogIn className="w-3 h-3" /> : ev.type === 'sortant' ? <LogOut className="w-3 h-3" /> : null}
        </span>
        <span className={`font-semibold truncate leading-tight flex-1 min-w-0 ${cfg.text}`}>
          {ev.prenom} {ev.nom}
        </span>
        {agent && (
          <span className="flex-shrink-0 ml-auto">
            <AgentMini name={agent} size={18} />
          </span>
        )}
      </div>
      {/* Bottom row: logement number + type */}
      <div className="flex items-center gap-1 mt-0.5 min-w-0">
        <span className="text-slate-500 truncate leading-tight text-[10px] flex-1 min-w-0">
          {ev.logement_numero}
          {typoLgt && <span className="text-slate-400"> · {typoLgt}</span>}
        </span>
      </div>
    </div>
  );
}

// ── MonthGrid ─────────────────────────────────────────────────────────────────

function MonthGrid({ year, month, events, onNavigate, onEventClick }: {
  year: number; month: number; events: EdlCalEvent[];
  onNavigate: (delta: number) => void;
  onEventClick?: (ev: EdlCalEvent) => void;
}) {
  const today    = new Date();
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInM  = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInM }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, EdlCalEvent[]>();
    events.forEach(ev => {
      const d = ev.date.getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(ev);
    });
    return map;
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 border-b border-slate-100">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-100 flex-shrink-0">
        {DAY_LABELS.map(d => (
          <div key={d} className="px-2 py-1.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-auto"
        style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(100px, 1fr))` }}>
        {cells.map((day, idx) => {
          const isToday   = day !== null && new Date(year, month, day).toDateString() === today.toDateString();
          const dayEvents = day ? (eventsByDay.get(day) ?? []) : [];
          const MAX = 3;
          const overflow = dayEvents.length - MAX;
          return (
            <div key={idx}
              className={`border-r border-b border-slate-100 p-1 min-h-0 overflow-hidden
                ${!day ? 'bg-slate-50/40' : 'bg-white hover:bg-slate-50/40 transition-colors'}`}>
              {day && (
                <>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0
                    ${isToday ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
                    {day}
                  </div>
                  {dayEvents.slice(0, MAX).map(ev => <EdlEventBlock key={ev.id} ev={ev} onClick={onEventClick} />)}
                  {overflow > 0 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-1">+{overflow} de plus</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WeekGrid ──────────────────────────────────────────────────────────────────

function WeekGrid({ year, month, week, events, onNavigate, blockFields, onBlockFieldsChange, onEventClick }: {
  year: number; month: number; week: number; events: EdlCalEvent[];
  onNavigate: (delta: number) => void;
  blockFields: boolean;
  onBlockFieldsChange: (v: boolean) => void;
  onEventClick?: (ev: EdlCalEvent) => void;
}) {
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowPanel(false);
    };
    if (showPanel) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showPanel]);

  const firstDay = new Date(year, month, 1);
  const firstMon = new Date(firstDay);
  const dow = (firstDay.getDay() + 6) % 7;
  firstMon.setDate(1 - dow + week * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(firstMon);
    d.setDate(firstMon.getDate() + i);
    return d;
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EdlCalEvent[]>();
    events.forEach(ev => {
      const k = ev.date.toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(ev);
    });
    return map;
  }, [events]);

  const today     = new Date();
  const weekLabel = `${days[0].getDate()} ${MONTH_NAMES[days[0].getMonth()].slice(0,3)} – ${days[6].getDate()} ${MONTH_NAMES[days[6].getMonth()].slice(0,3)} ${year}`;
  const totalH    = WEEK_HOURS.length * HOUR_H;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0 gap-2">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700 flex-1 text-center">{weekLabel}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowPanel(v => !v)}
            className={`p-1.5 rounded-lg transition-colors ${showPanel ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-500'}`}
            title="Afficher les informations dans les blocs"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          {showPanel && (
            <div className="absolute right-0 top-full mt-1 z-[200] bg-white rounded-xl shadow-xl border border-slate-200 w-52 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-semibold text-slate-700">Détails dans les blocs</span>
                <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50">
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${blockFields ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}>
                  {blockFields && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10"><path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                <input type="checkbox" className="sr-only" checked={blockFields} onChange={() => onBlockFieldsChange(!blockFields)} />
                <span className="text-xs text-slate-700">Afficher la résidence</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-100 flex-shrink-0">
        <div className="w-12 flex-shrink-0 border-r border-slate-100" />
        {days.map(d => {
          const isToday = d.toDateString() === today.toDateString();
          const isCurrentMonth = d.getMonth() === month;
          return (
            <div key={d.toISOString()} className="flex-1 text-center py-2 border-r border-slate-100 last:border-r-0">
              <div className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-400'}`}>
                {DAY_LABELS[(d.getDay() + 6) % 7]}
              </div>
              <div className={`text-base font-bold w-8 h-8 flex items-center justify-center rounded-full mx-auto
                ${isToday ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}`}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-auto">
        <div className="w-12 flex-shrink-0 relative border-r border-slate-100" style={{ height: totalH }}>
          {WEEK_HOURS.map(h => (
            <div key={h} className="absolute w-full flex items-start justify-end pr-1.5" style={{ top: (h - 7) * HOUR_H, height: HOUR_H }}>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{h}h</span>
            </div>
          ))}
          <div className="absolute left-0 right-0 flex items-center justify-center"
            style={{ top: (LUNCH_START - 7) * HOUR_H, height: (LUNCH_END - LUNCH_START) * HOUR_H }}>
            <span className="text-[9px] text-slate-400 rotate-[-90deg] whitespace-nowrap">Repas</span>
          </div>
        </div>

        {days.map(d => {
          const isCurrentMonth = d.getMonth() === month;
          const dayEvs = eventsByDay.get(d.toDateString()) ?? [];
          const byHour = new Map<number, EdlCalEvent[]>();
          dayEvs.forEach(ev => {
            const h = assignHour(ev.id);
            if (!byHour.has(h)) byHour.set(h, []);
            byHour.get(h)!.push(ev);
          });

          return (
            <div key={d.toISOString()}
              className={`flex-1 relative border-r border-slate-100 last:border-r-0 ${!isCurrentMonth ? 'bg-slate-50/30' : ''}`}
              style={{ height: totalH }}>
              {WEEK_HOURS.map(h => {
                const isLunch = h >= LUNCH_START && h < LUNCH_END;
                return (
                  <div key={h}
                    className={`absolute left-0 right-0 border-t border-slate-100 ${isLunch ? 'bg-slate-100/70' : ''}`}
                    style={{ top: (h - 7) * HOUR_H, height: HOUR_H }} />
                );
              })}
              <div className="absolute left-0 right-0 bg-slate-200/40 border-t border-b border-slate-200/60 pointer-events-none"
                style={{ top: (LUNCH_START - 7) * HOUR_H, height: (LUNCH_END - LUNCH_START) * HOUR_H }} />
              {Array.from(byHour.entries()).map(([h, evs]) => (
                <div key={h} className="absolute left-0.5 right-0.5 space-y-0.5 overflow-hidden"
                  style={{ top: (h - 7) * HOUR_H + 2, maxHeight: HOUR_H - 4 }}>
                  {evs.map(ev => <EdlEventBlock key={ev.id} ev={ev} onClick={onEventClick} />)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── YearGrid ──────────────────────────────────────────────────────────────────

function YearGrid({ year, events, onNavigate, onMonthClick }: {
  year: number; events: EdlCalEvent[];
  onNavigate: (delta: number) => void;
  onMonthClick: (month: number) => void;
}) {
  const today = new Date();
  const countsByMonth = useMemo(() => {
    const map: Record<number, { entrant: number; sortant: number; pre_edl: number; total: number }> = {};
    for (let m = 0; m < 12; m++) map[m] = { entrant: 0, sortant: 0, pre_edl: 0, total: 0 };
    events.forEach(ev => {
      if (ev.date.getFullYear() !== year) return;
      const m = ev.date.getMonth();
      map[m].total++;
      if (ev.type === 'entrant')  map[m].entrant++;
      else if (ev.type === 'sortant') map[m].sortant++;
      else map[m].pre_edl++;
    });
    return map;
  }, [events, year]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">{year}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
          {MONTH_NAMES.map((name, mi) => {
            const data = countsByMonth[mi];
            const isCurrentMonth = mi === today.getMonth() && year === today.getFullYear();
            return (
              <button key={mi} onClick={() => onMonthClick(mi)}
                className={`rounded-xl border p-3 text-left hover:border-blue-300 hover:shadow-sm transition-all
                  ${isCurrentMonth ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className={`text-xs font-semibold mb-2 ${isCurrentMonth ? 'text-blue-700' : 'text-slate-600'}`}>{name}</div>
                {data.total === 0 ? (
                  <div className="text-xs text-slate-300">—</div>
                ) : (
                  <div className="space-y-1">
                    {data.entrant > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500" />
                        <span className="text-xs text-slate-500 truncate">{data.entrant} entrant{data.entrant > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {data.sortant > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-orange-500" />
                        <span className="text-xs text-slate-500 truncate">{data.sortant} sortant{data.sortant > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {data.pre_edl > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-yellow-500" />
                        <span className="text-xs text-slate-500 truncate">{data.pre_edl} pré-EDL</span>
                      </div>
                    )}
                    <div className="text-xs font-semibold text-slate-600 mt-1">{data.total} total</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SchedulerView ─────────────────────────────────────────────────────────────

function SchedulerView({ year, month, events, onNavigate }: {
  year: number; month: number; events: EdlCalEvent[];
  onNavigate: (delta: number) => void;
}) {
  const [period, setPeriod]       = useState<SchedulerPeriod>('month');
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayDate, setDayDate]     = useState(() => new Date());
  const today = new Date();

  const days = useMemo(() => {
    if (period === 'month') {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    }
    if (period === 'week') {
      const firstDay = new Date(year, month, 1);
      const dow = (firstDay.getDay() + 6) % 7;
      const firstMon = new Date(year, month, 1 - dow + weekOffset * 7);
      return Array.from({ length: 7 }, (_, i) => { const d = new Date(firstMon); d.setDate(firstMon.getDate() + i); return d; });
    }
    return [dayDate];
  }, [period, year, month, weekOffset, dayDate]);

  const periodLabel = () => {
    if (period === 'month') return `${MONTH_NAMES[month]} ${year}`;
    if (period === 'week') {
      const d0 = days[0], d1 = days[days.length - 1];
      return `${d0.getDate()} ${MONTH_NAMES[d0.getMonth()].slice(0,3)} – ${d1.getDate()} ${MONTH_NAMES[d1.getMonth()].slice(0,3)} ${d1.getFullYear()}`;
    }
    return dayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const navigatePeriod = (delta: number) => {
    if (period === 'month') { onNavigate(delta); setWeekOffset(0); }
    else if (period === 'week') setWeekOffset(w => w + delta);
    else setDayDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + delta); return nd; });
  };

  // Group by residence
  const rows = useMemo(() => {
    const relevantEvs = events.filter(ev => days.some(d => d.toDateString() === ev.date.toDateString()));
    const map = new Map<string, EdlCalEvent[]>();
    relevantEvs.forEach(ev => {
      if (!map.has(ev.residence_nom)) map.set(ev.residence_nom, []);
      map.get(ev.residence_nom)!.push(ev);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [events, days]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0 gap-3">
        <button onClick={() => navigatePeriod(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700 capitalize flex-1 text-center">Planificateur — {periodLabel()}</span>
        <button onClick={() => navigatePeriod(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
          {([['month','Mois'],['week','Semaine'],['day','Jour']] as [SchedulerPeriod,string][]).map(([k, l]) => (
            <button key={k} onClick={() => { setPeriod(k); setWeekOffset(0); }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${period === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${200 + days.length * 36}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-500 w-48">
                Résidence
              </th>
              {days.map(d => {
                const isToday   = d.toDateString() === today.toDateString();
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th key={d.toISOString()}
                    className={`border-b border-r border-slate-100 px-1 py-2 text-center text-xs font-medium min-w-[36px]
                      ${isToday ? 'bg-blue-50 text-blue-700' : isWeekend ? 'bg-slate-50 text-slate-400' : 'text-slate-500'}`}>
                    <div>{d.getDate()}</div>
                    <div className="text-[9px] opacity-60">{DAY_LABELS[(d.getDay() + 6) % 7].slice(0,1)}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(([residence, evs]) => {
              const evByDay = new Map<string, EdlCalEvent[]>();
              evs.forEach(ev => {
                const k = ev.date.toDateString();
                if (!evByDay.has(k)) evByDay.set(k, []);
                evByDay.get(k)!.push(ev);
              });
              return (
                <tr key={residence} className="hover:bg-slate-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[140px]">{residence}</span>
                    </div>
                  </td>
                  {days.map(d => {
                    const dayEvs    = evByDay.get(d.toDateString()) ?? [];
                    const isToday   = d.toDateString() === today.toDateString();
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <td key={d.toISOString()}
                        className={`border-b border-r border-slate-100 px-0.5 py-0.5 text-center align-middle
                          ${isToday ? 'bg-blue-50/40' : isWeekend ? 'bg-slate-50/40' : ''}`}>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {dayEvs.map(ev => {
                            const cfg = TYPE_CFG[ev.type] ?? TYPE_CFG.entrant;
                            return (
                              <div key={ev.id}
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform ${cfg.bg} border`}
                                style={{ borderColor: cfg.hex }}
                                title={`${ev.prenom} ${ev.nom} — ${ev.logement_numero}\n${cfg.label}`}>
                                {ev.type === 'entrant' ? '↓' : ev.type === 'sortant' ? '↑' : '⚑'}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="py-12 text-center text-sm text-slate-400">
                  Aucun EDL sur cette période.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── AgentDropdown ─────────────────────────────────────────────────────────────

function AgentDropdown({ agents, selected, onChange }: {
  agents: string[];
  selected: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none
          ${selected ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
      >
        <User className="w-3.5 h-3.5" />
        <span>{selected ?? 'Assigné à'}</span>
        {selected ? (
          <X className="w-3 h-3 ml-0.5 opacity-60" onClick={e => { e.stopPropagation(); onChange(null); }} />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden w-52">
          {agents.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 text-center">Aucun agent</div>
          ) : (
            <div className="py-1 max-h-56 overflow-y-auto">
              {agents.map(agent => (
                <button key={agent}
                  onClick={() => { onChange(selected === agent ? null : agent); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors
                    ${selected === agent ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <User className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                  {agent}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PlanningDropdown ──────────────────────────────────────────────────────────

function PlanningDropdown({ trigger, children, width = 260 }: {
  trigger: React.ReactNode; children: React.ReactNode; width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          style={{ width }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PlanningFilterBtn({ icon, label, count, active }: {
  icon: React.ReactNode; label: string; count?: number; active?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none
      ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
      {icon}
      <span>{label}</span>
      {count != null && count > 0 && (
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
          ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
      <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
    </div>
  );
}

// ── ResidencePicker ───────────────────────────────────────────────────────────

function ResidencePicker({ allResidences, selected, onChange }: {
  allResidences: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search) return allResidences;
    const q = search.toLowerCase();
    return allResidences.filter(r => r.toLowerCase().includes(q));
  }, [allResidences, search]);

  const toggle = (r: string) =>
    onChange(selected.includes(r) ? selected.filter(x => x !== r) : [...selected, r]);

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une résidence…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filtered.map(r => (
          <div key={r} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => toggle(r)}>
            <input type="checkbox" checked={selected.includes(r)} onChange={() => toggle(r)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
            <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{r}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-xs text-slate-400 text-center py-4">Aucune résidence trouvée</div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{selected.length} sélectionnée{selected.length > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────────

function FilterBar({ activeTypes, onToggleType, activeStatuts, onToggleStatut }: {
  activeTypes: Set<string>;
  onToggleType: (t: string) => void;
  activeStatuts: Set<EdlStatut>;
  onToggleStatut: (s: EdlStatut) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium flex-shrink-0">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtrer :
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {(['entrant','sortant','pre_edl'] as const).map(key => {
          const cfg    = TYPE_CFG[key];
          const active = activeTypes.has(key);
          return (
            <button key={key} type="button" onClick={() => onToggleType(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current opacity-100` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

      <div className="flex items-center gap-1 flex-wrap">
        {(['a_realiser','realise'] as EdlStatut[]).map(key => {
          const cfg    = EDL_CFG[key];
          const active = activeStatuts.has(key);
          return (
            <button key={key} type="button" onClick={() => onToggleStatut(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current opacity-100` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── EventDetailPanel ──────────────────────────────────────────────────────────

// Pexels logement photos by type (stock, no download)
const LOGEMENT_PHOTOS: Record<string, string> = {
  'Studio':   'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
  'T1':       'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
  'T1 bis':   'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
  'T2':       'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
  'T3':       'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
  'default':  'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
};

function getLogementPhoto(type: string | null): string {
  if (!type) return LOGEMENT_PHOTOS.default;
  return LOGEMENT_PHOTOS[type] ?? LOGEMENT_PHOTOS.default;
}

function StudentAvatar({ nom, prenom, photoUrl, size = 40 }: { nom: string; prenom: string; photoUrl: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  if (photoUrl && !err) {
    return (
      <img src={photoUrl} alt={`${prenom} ${nom}`}
        className="rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setErr(true)} />
    );
  }
  const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  const colors = ['bg-blue-500','bg-orange-500','bg-emerald-500','bg-violet-500','bg-rose-500','bg-amber-500'];
  const colorIdx = (nom.charCodeAt(0) + prenom.charCodeAt(0)) % colors.length;
  return (
    <span className={`${colors[colorIdx]} text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-sm`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

function EventDetailPanel({ ev, onClose, onOpenEdlFiche }: {
  ev: EdlCalEvent;
  onClose: () => void;
  onOpenEdlFiche?: (r: EdlRecord) => void;
}) {
  const cfg     = TYPE_CFG[ev.type] ?? TYPE_CFG.entrant;
  const r       = ev.rawRecord;
  const statCfg = r ? EDL_CFG[r.statut] : null;

  const isHeleneJuin19 =
    ev.nom.toLowerCase() === 'chevalier' &&
    ev.prenom.toLowerCase().startsWith('helen') &&
    ev.date.getFullYear() === 2026 &&
    ev.date.getMonth() === 5 &&
    ev.date.getDate() === 19;

  const logementPhotoSrc = isHeleneJuin19
    ? PhotoStudio
    : getLogementPhoto(r?.type_logement ?? null);

  // Breadcrumb: Résidence > Bâtiment > Étage X > Logement N°
  const breadcrumb = [
    ev.residence_nom,
    r?.batiment_nom,
    r?.etage_numero != null ? `Étage ${r.etage_numero}` : null,
    `N° ${ev.logement_numero}`,
  ].filter(Boolean).join(' › ');

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Logement photo */}
        <div className="relative">
          <img
            src={logementPhotoSrc}
            alt="Logement"
            className="w-full h-36 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-white text-xs font-medium truncate opacity-90">{breadcrumb}</p>
          </div>
          {r?.type_logement && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              {r.type_logement}{r.surface_m2 ? ` · ${r.surface_m2} m²` : ''}
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Student identity */}
          <div className="flex items-center gap-3">
            <StudentAvatar nom={ev.nom} prenom={ev.prenom} photoUrl={r?.photo_url ?? null} size={44} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight">{ev.prenom} {ev.nom}</p>
              {r?.etablissement && <p className="text-xs text-slate-500 truncate">{r.etablissement}</p>}
              {r?.type_contrat && <p className="text-[10px] text-slate-400 mt-0.5">{r.type_contrat}</p>}
            </div>
          </div>

          {/* Agent */}
          {r?.agent_edl && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-500">Assigné à</span>
              <span className="ml-auto text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">{r.agent_edl}</span>
            </div>
          )}

          {/* Localisation breadcrumb */}
          <div className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">{breadcrumb}</p>
          </div>

          {/* Logement type */}
          {(r?.type_logement || r?.surface_m2) && (
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-600">
                {[r.type_logement, r.surface_m2 ? `${r.surface_m2} m²` : null].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Date + statut */}
          <div className="space-y-2">
            <DetailRow
              label="Date EDL"
              value={ev.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            />
            {statCfg && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Statut</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statCfg.bg} ${statCfg.text}`}>
                  {statCfg.label}
                </span>
              </div>
            )}
            {r?.date_entree && <DetailRow label="Entrée" value={new Date(r.date_entree).toLocaleDateString('fr-FR')} />}
            {r?.date_sortie_prevue && <DetailRow label="Sortie prévue" value={new Date(r.date_sortie_prevue).toLocaleDateString('fr-FR')} />}
          </div>

          {/* Pre-EDL info */}
          {ev.rawPreEdl && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-yellow-700">Pré-EDL</p>
              <DetailRow label="Statut" value={PRE_EDL_CFG[ev.rawPreEdl.statut].label} />
              {ev.rawPreEdl.date_inspection && (
                <DetailRow label="Inspection" value={new Date(ev.rawPreEdl.date_inspection).toLocaleDateString('fr-FR')} />
              )}
            </div>
          )}

          {/* Action button */}
          {r && onOpenEdlFiche && (
            <button
              onClick={() => onOpenEdlFiche(r)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Ouvrir l'EDL
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function EdlPlanning({ records, preEdlRecords = DEMO_PRE_EDL, onOpenPreEdl, onOpenEdlFiche }: Props) {
  const today = new Date();
  const [calMode, setCalMode]   = useState<CalendarMode>('month');
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [week, setWeek]         = useState(0);
  const [weekBlockFields, setWeekBlockFields] = useState(true);
  const [selectedEvent, setSelectedEvent]     = useState<EdlCalEvent | null>(null);

  const [filterResidences, setFilterResidences] = useState<string[]>([]);
  const [filterAgent, setFilterAgent]           = useState<string | null>(null);
  const [activeTypes, setActiveTypes]           = useState<Set<string>>(new Set(['entrant', 'sortant', 'pre_edl']));
  const [activeStatuts, setActiveStatuts]       = useState<Set<EdlStatut>>(new Set(['a_realiser', 'realise']));

  const toggleType   = (t: string) =>
    setActiveTypes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const toggleStatut = (s: EdlStatut) =>
    setActiveStatuts(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });

  // All residence names for picker
  const allResidences = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => r.residence_nom && r.residence_nom !== '—' && set.add(r.residence_nom));
    preEdlRecords.forEach(r => r.residence_nom && r.residence_nom !== '—' && set.add(r.residence_nom));
    return [...set].sort();
  }, [records, preEdlRecords]);

  // All agent names for filter
  const allAgents = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => r.agent_edl && set.add(r.agent_edl));
    return [...set].sort();
  }, [records]);

  // Build events
  const allEvents = useMemo<EdlCalEvent[]>(() => {
    const evts: EdlCalEvent[] = [];
    for (const r of records) {
      if (!r.date) continue;
      if (!activeTypes.has(r.type)) continue;
      if (!activeStatuts.has(r.statut)) continue;
      if (filterResidences.length > 0 && !filterResidences.includes(r.residence_nom)) continue;
      if (filterAgent && r.agent_edl !== filterAgent) continue;
      evts.push({
        id: r.id,
        date: new Date(r.date),
        nom: r.nom,
        prenom: r.prenom,
        logement_numero: r.logement_numero,
        residence_nom: r.residence_nom,
        type: r.type,
        statut: r.statut,
        rawRecord: r,
      });
    }
    for (const r of preEdlRecords) {
      if (!activeTypes.has('pre_edl')) continue;
      if (filterResidences.length > 0 && !filterResidences.includes(r.residence_nom)) continue;
      const dateStr = r.date_inspection ?? r.date_creation;
      evts.push({
        id: `pre-${r.id}`,
        date: new Date(dateStr),
        nom: r.nom,
        prenom: r.prenom,
        logement_numero: r.logement_numero,
        residence_nom: r.residence_nom,
        type: 'pre_edl',
        statut: r.statut,
        rawPreEdl: r,
      });
    }
    return evts;
  }, [records, preEdlRecords, activeTypes, activeStatuts, filterResidences]);

  // Filter events to current view period
  const visibleEvents = useMemo(() => {
    return allEvents.filter(ev => {
      if (calMode === 'year') return ev.date.getFullYear() === year;
      return ev.date.getFullYear() === year && ev.date.getMonth() === month;
    });
  }, [allEvents, calMode, year, month]);

  const navigateMonth = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setMonth(m); setYear(y); setWeek(0);
  };

  const navigateWeek = (delta: number) => {
    const firstDay = new Date(year, month, 1);
    const dow      = (firstDay.getDay() + 6) % 7;
    const firstMon = new Date(year, month, 1 - dow + week * 7);
    firstMon.setDate(firstMon.getDate() + delta * 7);
    setYear(firstMon.getFullYear());
    setMonth(firstMon.getMonth());
    const newFirst = new Date(firstMon.getFullYear(), firstMon.getMonth(), 1);
    const newDow   = (newFirst.getDay() + 6) % 7;
    setWeek(Math.floor((firstMon.getDate() - 1 + newDow) / 7));
  };

  const navigateYear = (delta: number) => setYear(y => y + delta);

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setWeek(0);
  };

  const handleEventClick = (ev: EdlCalEvent) => {
    if (ev.rawPreEdl && onOpenPreEdl) {
      onOpenPreEdl(ev.rawPreEdl);
    } else {
      setSelectedEvent(ev);
    }
  };

  const resCount = filterResidences.length;
  const typeFilterCount = activeTypes.size < 3 ? (3 - activeTypes.size) : 0;
  const statutFilterCount = activeStatuts.size < 2 ? (2 - activeStatuts.size) : 0;
  const hasFilters = resCount > 0 || typeFilterCount > 0 || statutFilterCount > 0 || !!filterAgent;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-xl border border-slate-200 m-4">

      {/* Toolbar row 1 */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        {/* Today */}
        <button onClick={goToday}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors flex-shrink-0">
          Aujourd'hui
        </button>

        {/* Résidences filter */}
        <PlanningDropdown
          width={280}
          trigger={
            <PlanningFilterBtn
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="Résidences"
              count={resCount}
              active={resCount > 0}
            />
          }
        >
          <ResidencePicker
            allResidences={allResidences}
            selected={filterResidences}
            onChange={setFilterResidences}
          />
        </PlanningDropdown>

        {/* Agent filter */}
        <AgentDropdown agents={allAgents} selected={filterAgent} onChange={setFilterAgent} />

        {/* Mode selector */}
        <div className="ml-auto flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
          {CAL_MODES.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setCalMode(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors
                ${calMode === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar row 2 — filter bar */}
      <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0 flex items-center gap-3 overflow-x-auto">
        <FilterBar
          activeTypes={activeTypes}
          onToggleType={toggleType}
          activeStatuts={activeStatuts}
          onToggleStatut={toggleStatut}
        />
        {hasFilters && (
          <button
            onClick={() => { setFilterResidences([]); setFilterAgent(null); setActiveTypes(new Set(['entrant','sortant','pre_edl'])); setActiveStatuts(new Set(['a_realiser','realise'])); }}
            className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-600 flex-shrink-0">
            <X className="w-3 h-3" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Calendar + optional detail panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {calMode === 'month' && (
            <MonthGrid
              year={year} month={month}
              events={visibleEvents}
              onNavigate={navigateMonth}
              onEventClick={handleEventClick}
            />
          )}
          {calMode === 'week' && (
            <WeekGrid
              year={year} month={month} week={week}
              events={visibleEvents}
              onNavigate={navigateWeek}
              blockFields={weekBlockFields}
              onBlockFieldsChange={setWeekBlockFields}
              onEventClick={handleEventClick}
            />
          )}
          {calMode === 'year' && (
            <YearGrid
              year={year}
              events={allEvents.filter(ev => ev.date.getFullYear() === year)}
              onNavigate={navigateYear}
              onMonthClick={m => { setMonth(m); setCalMode('month'); }}
            />
          )}
          {calMode === 'scheduler' && (
            <SchedulerView
              year={year} month={month}
              events={visibleEvents}
              onNavigate={navigateMonth}
            />
          )}
        </div>

        {selectedEvent && (
          <EventDetailPanel
            ev={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onOpenEdlFiche={onOpenEdlFiche}
          />
        )}
      </div>
    </div>
  );
}
