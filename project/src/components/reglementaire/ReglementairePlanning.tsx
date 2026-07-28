import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import logoApave          from '../../assets/logo-Apave.jpg';
import logoSocotec        from '../../assets/logo-SOCOTEC.png';
import logoDekra          from '../../assets/logo-Dekra.jpg';
import logoBureauVeritas  from '../../assets/logo-Bureau-Veritas.jpg';
import logoQualiconsult   from '../../assets/logo-Qualiconsult.jpg';
import logoSGS            from '../../assets/logo-SGS.jpg';
import logoAlpesControles from '../../assets/logo-Alpes-Controles.jpg';
import {
  ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange,
  LayoutGrid, CheckSquare, Filter, ChevronDown, ChevronUp, SlidersHorizontal,
} from 'lucide-react';
import { ControleWithMeta, STATUT_CONFIG } from './types';
import { SITE_DATA, RESIDENCE_DATA, AGENT_DATA, PRESTATAIRE_DATA } from './dashboardData';
import { TYPE_CONTROLES } from './ReglementaireSidebar';

// ── Types ──────────────────────────────────────────────────────────────────────

type PlanningTab  = 'controles' | 'points' | 'actions';
type CalendarMode = 'month' | 'week' | 'year' | 'scheduler';

const DATE_FIELDS: Record<PlanningTab, { key: string; label: string }[]> = {
  controles: [
    { key: 'date_prochain_controle', label: 'Date du prochain contrôle' },
    { key: 'date_dernier_controle',  label: 'Date du dernier contrôle' },
    { key: 'updated_at',             label: 'Date de modification' },
    { key: 'created_at',             label: 'Date de création' },
  ],
  points: [
    { key: 'updated_at', label: 'Date de modification' },
    { key: 'created_at', label: 'Date de création' },
  ],
  actions: [
    { key: 'date_debut_estimee', label: 'Date de début estimée' },
    { key: 'date_debut_reelle',  label: 'Date de début réelle' },
    { key: 'date_fin_estimee',   label: 'Date de fin estimée' },
    { key: 'date_fin_reelle',    label: 'Date de fin réelle' },
    { key: 'updated_at',         label: 'Date de modification' },
    { key: 'created_at',         label: 'Date de création' },
  ],
};

// ── Statuts ───────────────────────────────────────────────────────────────────

const STATUT_ACTION_CONFIG = {
  en_attente: { label: 'En attente', border: 'border-amber-400',  bg: 'bg-amber-50',   dot: 'bg-amber-400',  text: 'text-amber-700' },
  en_retard:  { label: 'En retard',  border: 'border-red-500',    bg: 'bg-red-50',     dot: 'bg-red-500',    text: 'text-red-700'   },
  planifiees: { label: 'Planifiée',  border: 'border-blue-400',   bg: 'bg-blue-50',    dot: 'bg-blue-400',   text: 'text-blue-700'  },
  terminees:  { label: 'Terminée',   border: 'border-emerald-500',bg: 'bg-emerald-50', dot: 'bg-emerald-500',text: 'text-emerald-700'},
};

// ── Criticité emojis ──────────────────────────────────────────────────────────

const CRITICITE_EMOJI: Record<string, string> = {
  Critique: '🚨',
  Majeure:  '⚠️',
  Mineure:  '🔍',
};

// ── Org logos ─────────────────────────────────────────────────────────────────

const ORG_COLORS: Record<string, { logo?: string; bg: string; text: string; abbr: string }> = {
  'APAVE':                    { logo: logoApave,          bg: '#4a9520', text: '#fff', abbr: 'AP'  },
  'SOCOTEC':                  { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SO'  },
  'DEKRA':                    { logo: logoDekra,          bg: '#1a6b30', text: '#fff', abbr: 'DE'  },
  'Bureau Veritas':            { logo: logoBureauVeritas,  bg: '#8b7355', text: '#fff', abbr: 'BV'  },
  'QUALICONSULT':              { logo: logoQualiconsult,   bg: '#3c3c3c', text: '#fff', abbr: 'QU'  },
  'SGS':                      { logo: logoSGS,            bg: '#888580', text: '#fff', abbr: 'SG'  },
  'Alpes Contrôles':           { logo: logoAlpesControles, bg: '#cc0000', text: '#fff', abbr: 'AC'  },
  'SOCOTEC Diagnostic':        { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SD'  },
  'Bureau Alliance Contrôle':  { logo: undefined,          bg: '#2563eb', text: '#fff', abbr: 'BAC' },
  'Acritec':                   { logo: undefined,          bg: '#6b21a8', text: '#fff', abbr: 'ACR' },
};

// Agent photos — real Pexels portrait URLs (deterministic by index)
const AGENT_PHOTOS: Record<string, string> = {
  'Martin D.':  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Leroy P.':   'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Dupont A.':  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Bernard C.': 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Moreau F.':  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Simon B.':   'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Laurent E.': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Michel G.':  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
};

// ── AssigneeBadge ─────────────────────────────────────────────────────────────

function AssigneeBadge({ name, isOrg, size = 24 }: { name: string; isOrg: boolean; size?: number }) {
  const s = size;
  const [err, setErr] = useState(false);
  if (isOrg) {
    const cfg  = ORG_COLORS[name];
    const logo = cfg?.logo;
    if (logo && !err) {
      return (
        <img src={logo} alt={name}
          className="rounded object-contain flex-shrink-0 bg-white border border-slate-200"
          style={{ width: s, height: s, padding: 1 }}
          onError={() => setErr(true)} />
      );
    }
    const bg  = cfg?.bg  ?? '#64748b';
    const col = cfg?.text ?? '#fff';
    const abbr= cfg?.abbr ?? name.slice(0, 2).toUpperCase();
    return (
      <span
        className="inline-flex items-center justify-center rounded flex-shrink-0 font-bold leading-none"
        style={{ width: s, height: s, background: bg, color: col, fontSize: Math.max(7, s * 0.32) }}
      >
        {abbr}
      </span>
    );
  }
  const photo = AGENT_PHOTOS[name];
  if (photo && !err) {
    return (
      <img src={photo} alt={name}
        className="rounded-full object-cover flex-shrink-0 border border-slate-200"
        style={{ width: s, height: s }}
        onError={() => setErr(true)} />
    );
  }
  const initials = name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold leading-none flex-shrink-0"
      style={{ width: s, height: s, fontSize: Math.max(7, s * 0.38) }}
    >
      {initials}
    </span>
  );
}

// ── Deterministic helpers ─────────────────────────────────────────────────────

function detInt(seed: number, max: number) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}
function pickFrom<T>(arr: T[], seed: number): T { return arr[detInt(seed, arr.length)]; }

// ── Mock event generator ──────────────────────────────────────────────────────

interface PlanningEvent {
  id: string;
  date: Date;
  typeIcon: string;
  typeLabel: string;
  statut: string;
  statutConfig: { border: string; bg: string; dot: string; text: string; label: string };
  criticite: string;
  site: string;
  assignee: string;
  assigneeIsOrg: boolean;
  tab: PlanningTab;
}

const ORGANISMES_PLANNING = ['APAVE', 'SOCOTEC', 'DEKRA', 'Bureau Veritas', 'QUALICONSULT', 'SGS', 'Alpes Contrôles', 'SOCOTEC Diagnostic', 'Bureau Alliance Contrôle', 'Acritec'];
const CRITICITES_PLANNING = ['Critique', 'Majeure', 'Mineure'] as const;
const STATUTS_CONTROLE_KEYS = ['manquant', 'en_retard', 'a_venir', 'realise']  as const;
const STATUTS_ACTION_KEYS   = ['en_attente', 'en_retard', 'planifiees', 'terminees'] as const;

function generateMockEvents(
  tab: PlanningTab,
  selectedDateFields: string[],
  year: number,
  month: number,
  selectedTypes: string[],
  selectedSiteNames: string[],
): PlanningEvent[] {
  if (selectedDateFields.length === 0) return [];

  const events: PlanningEvent[] = [];
  const types = TYPE_CONTROLES;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const count = tab === 'controles' ? 40 : tab === 'points' ? 30 : 35;
  const base  = tab === 'controles' ? 10000 : tab === 'points' ? 20000 : 30000;

  for (let i = 0; i < count; i++) {
    const seed   = year * base + month * (count + 10) + i;
    const tc     = pickFrom(types, seed);
    if (selectedTypes.length > 0 && !selectedTypes.includes(tc.key)) continue;

    const siteRow = tab === 'points'
      ? pickFrom(RESIDENCE_DATA, seed + 1)
      : pickFrom(SITE_DATA, seed + 1);
    if (selectedSiteNames.length > 0 && !selectedSiteNames.includes(siteRow.nom)) continue;

    const day    = 1 + detInt(seed + 2, daysInMonth);
    const isOrg  = detInt(seed + 4, 2) === 0;
    const assigneeRaw = isOrg
      ? pickFrom(ORGANISMES_PLANNING, seed + 5)
      : pickFrom(AGENT_DATA, seed + 5).nom;

    const criticite = CRITICITES_PLANNING[detInt(seed + 7, 3)];

    let statut: string;
    let statutConfig: PlanningEvent['statutConfig'];
    if (tab === 'actions') {
      statut = STATUTS_ACTION_KEYS[detInt(seed + 3, 4)];
      statutConfig = STATUT_ACTION_CONFIG[statut as keyof typeof STATUT_ACTION_CONFIG];
    } else {
      statut = tab === 'points'
        ? (detInt(seed + 4, 2) === 0 ? 'realise' : 'en_retard')
        : STATUTS_CONTROLE_KEYS[detInt(seed + 3, 4)];
      statutConfig = STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG];
    }

    events.push({
      id:            `${tab[0]}-${i}`,
      date:          new Date(year, month, day),
      typeIcon:      tc.icon,
      typeLabel:     tc.key,
      statut,
      statutConfig,
      criticite,
      site:          siteRow.nom,
      assignee:      assigneeRaw,
      assigneeIsOrg: isOrg,
      tab,
    });
  }
  return events;
}

// ── Event block ───────────────────────────────────────────────────────────────

function EventBlock({ ev, selectedTypes, selectedSiteNames }: {
  ev: PlanningEvent;
  selectedTypes: string[];
  selectedSiteNames: string[];
}) {
  const cfg = ev.statutConfig;

  // Which "main label" to show based on active filters
  // - Type filter only  → show site name (bold) + assignee
  // - Site filter only  → show type label (bold) + assignee
  // - Both / Neither    → show assignee (bold) + site
  const typeFiltered = selectedTypes.length > 0;
  const siteFiltered = selectedSiteNames.length > 0;

  let mainLabel: string;
  let subLabel:  string;

  if (typeFiltered && !siteFiltered) {
    mainLabel = ev.site;
    subLabel  = ev.assignee;
  } else if (siteFiltered && !typeFiltered) {
    mainLabel = ev.typeLabel;
    subLabel  = ev.assignee;
  } else {
    // both or neither → show assignee + site
    mainLabel = ev.assignee;
    subLabel  = ev.site;
  }

  return (
    <div
      className={`rounded-md border-l-[3px] px-2 py-1 text-xs mb-0.5 overflow-hidden cursor-pointer
        hover:brightness-95 transition-all ${cfg.bg}`}
      style={{ borderLeftColor: getCssColor(cfg.border) }}
    >
      {/* Top row: type icon + assignee photo/logo + criticité */}
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-sm leading-none flex-shrink-0">{ev.typeIcon}</span>
          <AssigneeBadge name={ev.assignee} isOrg={ev.assigneeIsOrg} size={18} />
        </div>
        <span className="text-sm leading-none flex-shrink-0" title={ev.criticite}>
          {CRITICITE_EMOJI[ev.criticite]}
        </span>
      </div>
      {/* Main label */}
      <div className={`font-semibold truncate leading-tight ${cfg.text}`}>{mainLabel}</div>
      {/* Sub label */}
      <div className="text-slate-500 truncate leading-tight text-[10px]">{subLabel}</div>
    </div>
  );
}

// Tailwind border class → CSS hex (for inline style, since Tailwind purges unused combos)
function getCssColor(borderClass: string): string {
  const map: Record<string, string> = {
    'border-amber-400':  '#fbbf24',
    'border-red-500':    '#ef4444',
    'border-blue-400':   '#60a5fa',
    'border-emerald-500':'#10b981',
    'border-slate-200':  '#e2e8f0',
    'border-blue-500':   '#3b82f6',
  };
  return map[borderClass] ?? '#94a3b8';
}

// ── Month grid ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_LABELS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

function MonthGrid({ year, month, events, selectedTypes, selectedSiteNames, onNavigate }: {
  year: number; month: number; events: PlanningEvent[];
  selectedTypes: string[]; selectedSiteNames: string[];
  onNavigate: (delta: number) => void;
}) {
  const today   = new Date();
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, PlanningEvent[]>();
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
          <div key={d} className="px-2 py-1.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 flex-1 overflow-auto"
        style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(110px, 1fr))` }}
      >
        {cells.map((day, idx) => {
          const isToday    = day !== null && new Date(year, month, day).toDateString() === today.toDateString();
          const dayEvents  = day ? (eventsByDay.get(day) ?? []) : [];
          const MAX_VISIBLE = 3;
          const overflow    = dayEvents.length - MAX_VISIBLE;
          return (
            <div
              key={idx}
              className={`border-r border-b border-slate-100 p-1 min-h-0 overflow-hidden
                ${!day ? 'bg-slate-50/40' : 'bg-white hover:bg-slate-50/40 transition-colors'}`}
            >
              {day && (
                <>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0
                    ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>
                    {day}
                  </div>
                  {dayEvents.slice(0, MAX_VISIBLE).map(ev => (
                    <EventBlock key={ev.id} ev={ev} selectedTypes={selectedTypes} selectedSiteNames={selectedSiteNames} />
                  ))}
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

// ── Week grid ─────────────────────────────────────────────────────────────────

const REGLE_WEEK_HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const REGLE_HOUR_H     = 44;
const REGLE_LUNCH_S    = 12.5;
const REGLE_LUNCH_E    = 13.5;
const REGLE_AM_SLOTS   = [8, 9, 10, 11, 12];
const REGLE_PM_SLOTS   = [14, 15, 16, 17];
const REGLE_ALL_SLOTS  = [...REGLE_AM_SLOTS, ...REGLE_PM_SLOTS];
function regleHashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function regleAssignHour(evId: string): number {
  return REGLE_ALL_SLOTS[regleHashStr(evId) % REGLE_ALL_SLOTS.length];
}

function WeekGrid({ year, month, week, events, selectedTypes, selectedSiteNames, onNavigate }: {
  year: number; month: number; week: number; events: PlanningEvent[];
  selectedTypes: string[]; selectedSiteNames: string[];
  onNavigate: (delta: number) => void;
}) {
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
    const map = new Map<string, PlanningEvent[]>();
    events.forEach(ev => {
      const k = ev.date.toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(ev);
    });
    return map;
  }, [events]);

  const today = new Date();
  const weekLabel = `${days[0].getDate()} ${MONTH_NAMES[days[0].getMonth()].slice(0,3)} – ${days[6].getDate()} ${MONTH_NAMES[days[6].getMonth()].slice(0,3)} ${year}`;
  const totalH = REGLE_WEEK_HOURS.length * REGLE_HOUR_H;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">{weekLabel}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Day headers */}
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
                ${isToday ? 'bg-emerald-500 text-white' : !isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}`}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-auto">
        <div className="w-12 flex-shrink-0 relative border-r border-slate-100" style={{ height: totalH }}>
          {REGLE_WEEK_HOURS.map(h => (
            <div key={h} className="absolute w-full flex items-start justify-end pr-1.5" style={{ top: (h - 7) * REGLE_HOUR_H, height: REGLE_HOUR_H }}>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{h}h</span>
            </div>
          ))}
          <div className="absolute left-0 right-0 flex items-center justify-center"
            style={{ top: (REGLE_LUNCH_S - 7) * REGLE_HOUR_H, height: (REGLE_LUNCH_E - REGLE_LUNCH_S) * REGLE_HOUR_H }}>
            <span className="text-[9px] text-slate-400 rotate-[-90deg] whitespace-nowrap">Repas</span>
          </div>
        </div>
        {days.map(d => {
          const isCurrentMonth = d.getMonth() === month;
          const dayEvs = eventsByDay.get(d.toDateString()) ?? [];
          const byHour = new Map<number, PlanningEvent[]>();
          dayEvs.forEach(ev => {
            const h = regleAssignHour(ev.id);
            if (!byHour.has(h)) byHour.set(h, []);
            byHour.get(h)!.push(ev);
          });
          return (
            <div key={d.toISOString()} className={`flex-1 relative border-r border-slate-100 last:border-r-0 ${!isCurrentMonth ? 'bg-slate-50/30' : ''}`}
              style={{ height: totalH }}>
              {REGLE_WEEK_HOURS.map(h => (
                <div key={h} className="absolute left-0 right-0 border-t border-slate-100"
                  style={{ top: (h - 7) * REGLE_HOUR_H, height: REGLE_HOUR_H }} />
              ))}
              <div className="absolute left-0 right-0 bg-slate-200/40 border-t border-b border-slate-200/60 pointer-events-none"
                style={{ top: (REGLE_LUNCH_S - 7) * REGLE_HOUR_H, height: (REGLE_LUNCH_E - REGLE_LUNCH_S) * REGLE_HOUR_H }} />
              {Array.from(byHour.entries()).map(([h, evs]) => (
                <div key={h} className="absolute left-0.5 right-0.5 space-y-0.5 overflow-hidden"
                  style={{ top: (h - 7) * REGLE_HOUR_H + 2, maxHeight: REGLE_HOUR_H - 4 }}>
                  {evs.map(ev => (
                    <EventBlock key={ev.id} ev={ev} selectedTypes={selectedTypes} selectedSiteNames={selectedSiteNames} />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Year grid ─────────────────────────────────────────────────────────────────

function YearGrid({ year, events, onNavigate, onMonthClick }: {
  year: number; events: PlanningEvent[];
  onNavigate: (delta: number) => void;
  onMonthClick: (month: number) => void;
}) {
  const today = new Date();
  const countsByMonth = useMemo(() => {
    const map: Record<number, { statuts: Record<string, number>; total: number }> = {};
    for (let m = 0; m < 12; m++) map[m] = { statuts: {}, total: 0 };
    events.forEach(ev => {
      if (ev.date.getFullYear() !== year) return;
      const m = ev.date.getMonth();
      map[m].total++;
      map[m].statuts[ev.statut] = (map[m].statuts[ev.statut] ?? 0) + 1;
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
              <button
                key={mi}
                onClick={() => onMonthClick(mi)}
                className={`rounded-xl border p-3 text-left hover:border-emerald-300 hover:shadow-sm transition-all
                  ${isCurrentMonth ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
              >
                <div className={`text-xs font-semibold mb-2 ${isCurrentMonth ? 'text-emerald-700' : 'text-slate-600'}`}>{name}</div>
                {data.total === 0 ? (
                  <div className="text-xs text-slate-300">—</div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(data.statuts).slice(0, 3).map(([s, n]) => {
                      const cfg = (STATUT_CONFIG as any)[s] ?? (STATUT_ACTION_CONFIG as any)[s];
                      if (!cfg) return null;
                      return (
                        <div key={s} className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="text-xs text-slate-500 truncate">{n} {cfg.label}</span>
                        </div>
                      );
                    })}
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

// ── Scheduler ─────────────────────────────────────────────────────────────────

function SchedulerView({ year, month, events, onNavigate }: {
  year: number; month: number; events: PlanningEvent[];
  onNavigate: (delta: number) => void;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const today = new Date();

  const rows = useMemo(() => {
    const map = new Map<string, { isOrg: boolean; events: PlanningEvent[] }>();
    events.forEach(ev => {
      if (!map.has(ev.assignee)) map.set(ev.assignee, { isOrg: ev.assigneeIsOrg, events: [] });
      map.get(ev.assignee)!.events.push(ev);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 15);
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">Planificateur — {MONTH_NAMES[month]} {year}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${180 + daysInMonth * 36}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-500 w-44">
                Assigné
              </th>
              {days.map(d => {
                const isToday   = d.toDateString() === today.toDateString();
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th key={d.getDate()}
                    className={`border-b border-r border-slate-100 px-1 py-2 text-center text-xs font-medium min-w-[36px]
                      ${isToday ? 'bg-emerald-50 text-emerald-700' : isWeekend ? 'bg-slate-50 text-slate-400' : 'text-slate-500'}`}>
                    <div>{d.getDate()}</div>
                    <div className="text-[9px] opacity-60">{DAY_LABELS[(d.getDay() + 6) % 7].slice(0,1)}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(([assignee, { isOrg, events: evs }]) => {
              const evByDay = new Map<number, PlanningEvent[]>();
              evs.forEach(ev => {
                const d = ev.date.getDate();
                if (!evByDay.has(d)) evByDay.set(d, []);
                evByDay.get(d)!.push(ev);
              });
              return (
                <tr key={assignee} className="hover:bg-slate-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <AssigneeBadge name={assignee} isOrg={isOrg} size={22} />
                      <span className="truncate max-w-[110px]">{assignee}</span>
                    </div>
                  </td>
                  {days.map(d => {
                    const dayEvs = evByDay.get(d.getDate()) ?? [];
                    const isToday   = d.toDateString() === today.toDateString();
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <td key={d.getDate()}
                        className={`border-b border-r border-slate-100 px-0.5 py-0.5 text-center align-middle
                          ${isToday ? 'bg-emerald-50/40' : isWeekend ? 'bg-slate-50/40' : ''}`}>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {dayEvs.map(ev => {
                            const cfg = ev.statutConfig;
                            return (
                              <div
                                key={ev.id}
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer
                                  hover:scale-110 transition-transform ${cfg.bg} border`}
                                style={{ borderColor: getCssColor(cfg.border) }}
                                title={`${ev.typeLabel} — ${ev.site}\n${ev.assignee}\n${ev.criticite}`}
                              >
                                {ev.typeIcon}
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
                <td colSpan={daysInMonth + 1} className="py-12 text-center text-sm text-slate-400">
                  Aucun événement. Sélectionnez au moins un champ date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Date fields picker ────────────────────────────────────────────────────────

function DateFieldsPicker({ tab, selected, onChange }: {
  tab: PlanningTab; selected: string[]; onChange: (f: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fields = DATE_FIELDS[tab];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);

  const label = selected.length === 0
    ? 'Choisir les champs dates...'
    : selected.length === 1 ? fields.find(f => f.key === selected[0])?.label
    : `${selected.length} champs sélectionnés`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm hover:border-emerald-300 transition-all min-w-[220px]"
      >
        <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="flex-1 text-left text-slate-600 truncate">{label}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 min-w-[260px]">
          {fields.map(f => (
            <label key={f.key} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${selected.includes(f.key) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                {selected.includes(f.key) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10">
                    <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <input type="checkbox" className="sr-only" checked={selected.includes(f.key)} onChange={() => toggle(f.key)} />
              <span className="text-sm text-slate-700">{f.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Statut + Criticité filter bar ─────────────────────────────────────────────

function FilterBar({ tab, activeStatuts, onToggleStatut, activeCriticites, onToggleCriticite }: {
  tab: PlanningTab;
  activeStatuts: Set<string>; onToggleStatut: (s: string) => void;
  activeCriticites: Set<string>; onToggleCriticite: (c: string) => void;
}) {
  const statutEntries = tab === 'actions'
    ? Object.entries(STATUT_ACTION_CONFIG)
    : Object.entries(STATUT_CONFIG);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtrer :
      </div>

      {/* Statuts */}
      <div className="flex items-center gap-1 flex-wrap">
        {statutEntries.map(([key, cfg]) => {
          const active = activeStatuts.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleStatut(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active
                  ? `${cfg.bg} ${cfg.text} border-current opacity-100`
                  : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

      {/* Criticités */}
      <div className="flex items-center gap-1 flex-wrap">
        {(Object.entries(CRITICITE_EMOJI) as [string, string][]).map(([key, emoji]) => {
          const active = activeCriticites.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleCriticite(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}
            >
              <span className="leading-none">{emoji}</span>
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  controles: ControleWithMeta[];
  selectedTypes: string[];
  selectedSiteNames: string[];
  selectedAssignees?: { prestataires: Set<string>; agents: Set<string> };
}

const CAL_MODES: { key: CalendarMode; label: string; Icon: React.ElementType }[] = [
  { key: 'month',     label: 'Mois',         Icon: Calendar      },
  { key: 'week',      label: 'Semaine',       Icon: CalendarDays  },
  { key: 'year',      label: 'Année',         Icon: CalendarRange },
  { key: 'scheduler', label: 'Planificateur', Icon: LayoutGrid    },
];

const TAB_CONFIG: { key: PlanningTab; label: string }[] = [
  { key: 'controles', label: 'Contrôles'           },
  { key: 'points',    label: 'Points de contrôle'  },
  { key: 'actions',   label: 'Actions correctives' },
];

export default function ReglementairePlanning({ controles, selectedTypes, selectedSiteNames, selectedAssignees }: Props) {
  const today = new Date();
  const [calMode, setCalMode] = useState<CalendarMode>('month');
  const [tab, setTab]         = useState<PlanningTab>('controles');
  const [year,  setYear]      = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [week,  setWeek]      = useState(0);
  const [selectedDateFields, setSelectedDateFields] = useState<string[]>(['date_prochain_controle']);

  // Active filters for statut / criticite (all active by default)
  const allStatuts = tab === 'actions'
    ? Object.keys(STATUT_ACTION_CONFIG)
    : Object.keys(STATUT_CONFIG);
  const allCriticites = Object.keys(CRITICITE_EMOJI);
  const [activeStatuts,    setActiveStatuts]    = useState<Set<string>>(new Set(allStatuts));
  const [activeCriticites, setActiveCriticites] = useState<Set<string>>(new Set(allCriticites));

  const handleTabChange = (t: PlanningTab) => {
    setTab(t);
    setSelectedDateFields([DATE_FIELDS[t][0].key]);
    const newStatuts = t === 'actions' ? Object.keys(STATUT_ACTION_CONFIG) : Object.keys(STATUT_CONFIG);
    setActiveStatuts(new Set(newStatuts));
  };

  const toggleStatut = (s: string) =>
    setActiveStatuts(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const toggleCriticite = (c: string) =>
    setActiveCriticites(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

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

  const rawMonthEvents = useMemo(() =>
    generateMockEvents(tab, selectedDateFields, year, month, selectedTypes, selectedSiteNames),
    [tab, selectedDateFields, year, month, selectedTypes, selectedSiteNames]
  );

  const yearEvents = useMemo(() => {
    if (calMode !== 'year') return [];
    const evs: PlanningEvent[] = [];
    for (let m = 0; m < 12; m++)
      evs.push(...generateMockEvents(tab, selectedDateFields, year, m, selectedTypes, selectedSiteNames));
    return evs;
  }, [calMode, tab, selectedDateFields, year, selectedTypes, selectedSiteNames]);

  // Apply statut + criticite + assignee filters
  const hasAssigneeFilter = (selectedAssignees?.prestataires.size ?? 0) > 0 || (selectedAssignees?.agents.size ?? 0) > 0;
  const filterEvents = (evs: PlanningEvent[]) =>
    evs.filter(ev => {
      if (!activeStatuts.has(ev.statut)) return false;
      if (!activeCriticites.has(ev.criticite)) return false;
      if (hasAssigneeFilter && selectedAssignees) {
        if (ev.assigneeIsOrg && !selectedAssignees.prestataires.has(ev.assignee)) return false;
        if (!ev.assigneeIsOrg && !selectedAssignees.agents.has(ev.assignee)) return false;
      }
      return true;
    });

  const activeEvents = filterEvents(calMode === 'year' ? yearEvents : rawMonthEvents);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 space-y-2.5">
          {/* Row 1: object tabs + date field picker + calendar mode */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
              {TAB_CONFIG.map(t => (
                <button key={t.key} onClick={() => handleTabChange(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                    ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <CheckSquare className="w-3 h-3" />{t.label}
                </button>
              ))}
            </div>

            <DateFieldsPicker tab={tab} selected={selectedDateFields} onChange={setSelectedDateFields} />

            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 ml-auto flex-shrink-0">
              {CAL_MODES.map(m => (
                <button key={m.key} onClick={() => setCalMode(m.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                    ${calMode === m.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <m.Icon className="w-3.5 h-3.5" />{m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: statut + criticité filter chips */}
          <FilterBar
            tab={tab}
            activeStatuts={activeStatuts}       onToggleStatut={toggleStatut}
            activeCriticites={activeCriticites} onToggleCriticite={toggleCriticite}
          />
        </div>

        {/* ── Calendar body ─────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
          {calMode === 'month' && (
            <MonthGrid year={year} month={month} events={activeEvents}
              selectedTypes={selectedTypes} selectedSiteNames={selectedSiteNames}
              onNavigate={navigateMonth} />
          )}
          {calMode === 'week' && (
            <WeekGrid year={year} month={month} week={week} events={activeEvents}
              selectedTypes={selectedTypes} selectedSiteNames={selectedSiteNames}
              onNavigate={navigateWeek} />
          )}
          {calMode === 'year' && (
            <YearGrid year={year} events={activeEvents}
              onNavigate={navigateYear}
              onMonthClick={(m) => { setMonth(m); setCalMode('month'); }} />
          )}
          {calMode === 'scheduler' && (
            <SchedulerView year={year} month={month} events={activeEvents}
              onNavigate={navigateMonth} />
          )}
        </div>
    </div>
  );
}
