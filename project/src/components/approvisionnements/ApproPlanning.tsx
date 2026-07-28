import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Truck, PackageCheck,
  XCircle, AlertTriangle, Calendar, Link, Info, Clock,
} from 'lucide-react';
import { MOCK_DEMANDES, STATUT_DEMANDE_CFG, PRIORITE_CFG, EPONA_SYNC_CFG } from './approTypes';

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType = 'livraison' | 'reception' | 'rupture' | 'bloquee' | 'besoin';
type CalMode   = 'month' | 'week';

interface PlanningEvent {
  id: string;
  date: Date;
  type: EventType;
  titre: string;
  site: string;
  reference: string;
  priorite: string;
  intervention_liee_ref: string;
  montant?: number;
}

const EVENT_CFG: Record<EventType, { bg: string; text: string; borderColor: string; icon: React.ReactNode; label: string }> = {
  livraison: { bg: 'bg-blue-50',    text: 'text-blue-700',    borderColor: '#3b82f6', icon: <Truck className="w-3 h-3" />,         label: 'Livraison prévue'    },
  reception: { bg: 'bg-emerald-50', text: 'text-emerald-700', borderColor: '#10b981', icon: <PackageCheck className="w-3 h-3" />,  label: 'Réception'           },
  rupture:   { bg: 'bg-red-50',     text: 'text-red-700',     borderColor: '#ef4444', icon: <XCircle className="w-3 h-3" />,       label: 'Rupture stock'       },
  bloquee:   { bg: 'bg-orange-50',  text: 'text-orange-700',  borderColor: '#f97316', icon: <AlertTriangle className="w-3 h-3" />, label: 'Intervention bloquée' },
  besoin:    { bg: 'bg-amber-50',   text: 'text-amber-700',   borderColor: '#f59e0b', icon: <Calendar className="w-3 h-3" />,      label: 'Date de besoin'      },
};

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_LABELS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

// ── Build events from mock data ───────────────────────────────────────────────

function buildEvents(): PlanningEvent[] {
  const evs: PlanningEvent[] = [];
  MOCK_DEMANDES.forEach(d => {
    if (d.date_livraison_prevue) {
      evs.push({ id: `lv-${d.id}`, date: new Date(d.date_livraison_prevue), type: 'livraison',
        titre: d.titre, site: d.site_nom, reference: d.reference, priorite: d.priorite,
        intervention_liee_ref: d.intervention_liee_ref, montant: d.montant_estime_ht ?? undefined });
    }
    if (d.date_reception) {
      evs.push({ id: `rc-${d.id}`, date: new Date(d.date_reception), type: 'reception',
        titre: d.titre, site: d.site_nom, reference: d.reference, priorite: d.priorite,
        intervention_liee_ref: d.intervention_liee_ref });
    }
    if (d.date_besoin && !d.date_livraison_prevue && !d.date_reception) {
      evs.push({ id: `bs-${d.id}`, date: new Date(d.date_besoin), type: 'besoin',
        titre: d.titre, site: d.site_nom, reference: d.reference, priorite: d.priorite,
        intervention_liee_ref: d.intervention_liee_ref });
    }
    if (d.statut === 'bloquee' && d.intervention_liee_ref) {
      const refDate = d.date_besoin ? new Date(d.date_besoin) : new Date();
      evs.push({ id: `bl-${d.id}`, date: refDate, type: 'bloquee',
        titre: `Blocage DI ${d.intervention_liee_ref} — ${d.titre}`,
        site: d.site_nom, reference: d.reference, priorite: d.priorite,
        intervention_liee_ref: d.intervention_liee_ref });
    }
  });
  return evs;
}

// ── Event block ───────────────────────────────────────────────────────────────

function EventBlock({ ev, onClick }: { ev: PlanningEvent; onClick: () => void }) {
  const cfg = EVENT_CFG[ev.type];
  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-md border-l-[3px] px-1.5 py-0.5 text-[10px] mb-0.5 overflow-hidden hover:brightness-95 transition-all ${cfg.bg}`}
      style={{ borderLeftColor: cfg.borderColor }}>
      <div className={`flex items-center gap-1 font-semibold truncate leading-snug ${cfg.text}`}>
        {cfg.icon}<span className="truncate">{ev.titre}</span>
      </div>
      <div className="text-slate-500 truncate">{ev.site}</div>
    </button>
  );
}

// ── Detail side panel ─────────────────────────────────────────────────────────

function DetailPanel({ ev, onClose }: { ev: PlanningEvent; onClose: () => void }) {
  const cfg     = EVENT_CFG[ev.type];
  const demande = MOCK_DEMANDES.find(d => d.reference === ev.reference);
  const eCfg    = demande ? EPONA_SYNC_CFG[demande.epona_sync_statut] : null;

  const timeline = demande ? [
    { label: 'Demande créée',    date: demande.created_at,            done: true  },
    { label: 'Transmise Epona',  date: demande.epona_sync_date_envoi, done: !!demande.epona_sync_date_envoi },
    { label: 'Commandée',        date: demande.date_commande,         done: !!demande.date_commande    },
    { label: 'Livraison prévue', date: demande.date_livraison_prevue, done: false },
    { label: 'Réceptionnée',     date: demande.date_reception,        done: !!demande.date_reception   },
  ] : [];

  return (
    <div className="w-72 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
      <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${cfg.bg}`}>
        <div className={`flex items-center gap-2 font-semibold text-sm ${cfg.text}`}>
          {cfg.icon} {cfg.label}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/10">
          <XCircle className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Objet</div>
          <div className="text-sm font-semibold text-slate-800">{ev.titre}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><div className="text-slate-400 mb-0.5">Site</div><div className="font-medium text-slate-700">{ev.site}</div></div>
          <div><div className="text-slate-400 mb-0.5">Référence</div><div className="font-mono font-medium text-slate-700">{ev.reference}</div></div>
          <div><div className="text-slate-400 mb-0.5">Date</div><div className="font-medium text-slate-700">{ev.date.toLocaleDateString('fr-FR')}</div></div>
          {ev.montant != null && (
            <div><div className="text-slate-400 mb-0.5">Montant HT</div><div className="font-bold text-slate-800">{ev.montant.toFixed(2)} €</div></div>
          )}
        </div>
        {ev.intervention_liee_ref && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <Link className="w-3.5 h-3.5" /> Intervention liée
            </div>
            <div className="text-sm font-bold text-blue-700">{ev.intervention_liee_ref}</div>
          </div>
        )}
        {demande && eCfg && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600 mb-2">Sync Epona</div>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${eCfg.bg} ${eCfg.text}`}>
              {eCfg.label}
            </div>
            {demande.epona_numero_commande && (
              <div className="text-xs font-mono font-semibold text-blue-700 mt-1.5">{demande.epona_numero_commande}</div>
            )}
          </div>
        )}
        {demande && (
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Timeline</div>
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${t.done ? 'bg-emerald-500 border-emerald-500' : t.date ? 'bg-blue-400 border-blue-400' : 'bg-slate-200 border-slate-200'}`} />
                  {i < timeline.length - 1 && <div className={`w-0.5 my-0.5 ${t.done ? 'bg-emerald-200' : 'bg-slate-100'}`} style={{ height: 16 }} />}
                </div>
                <div className="pb-2 flex-1">
                  <div className={`text-xs font-medium ${t.done ? 'text-slate-800' : 'text-slate-400'}`}>{t.label}</div>
                  {t.date && <div className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {demande?.commentaire && (
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Commentaire</div>
            <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{demande.commentaire}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Month grid ────────────────────────────────────────────────────────────────

function MonthGrid({ year, month, events, onEventClick }: {
  year: number; month: number; events: PlanningEvent[];
  onEventClick: (ev: PlanningEvent) => void;
}) {
  const today    = new Date();
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = useMemo(() => {
    const map = new Map<number, PlanningEvent[]>();
    events.forEach(ev => {
      if (ev.date.getFullYear() === year && ev.date.getMonth() === month) {
        const d = ev.date.getDate();
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(ev);
      }
    });
    return map;
  }, [events, year, month]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-slate-100 flex-shrink-0">
        {DAY_LABELS.map(d => (
          <div key={d} className="px-2 py-1.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-auto"
        style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(90px, 1fr))` }}>
        {cells.map((day, idx) => {
          const isToday = day !== null && new Date(year, month, day).toDateString() === today.toDateString();
          const dayEvs  = day ? (byDay.get(day) ?? []) : [];
          const extra   = dayEvs.length - 3;
          return (
            <div key={idx}
              className={`border-r border-b border-slate-100 p-1 overflow-hidden ${!day ? 'bg-slate-50/40' : 'bg-white hover:bg-slate-50/20 transition-colors'}`}>
              {day && (
                <>
                  <div className={`text-xs font-medium mb-0.5 w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{day}</div>
                  {dayEvs.slice(0, 3).map(ev => <EventBlock key={ev.id} ev={ev} onClick={() => onEventClick(ev)} />)}
                  {extra > 0 && <div className="text-[10px] text-slate-400 pl-1">+{extra} de plus</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week timeline ─────────────────────────────────────────────────────────────

function WeekTimeline({ weekStart, events, onEventClick }: {
  weekStart: Date; events: PlanningEvent[];
  onEventClick: (ev: PlanningEvent) => void;
}) {
  const days  = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const today = new Date();

  const byDay = useMemo(() => {
    const map = new Map<string, PlanningEvent[]>();
    events.forEach(ev => { const k = ev.date.toDateString(); if (!map.has(k)) map.set(k, []); map.get(k)!.push(ev); });
    return map;
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <div className="grid grid-cols-7 border-b border-slate-100 flex-shrink-0">
        {days.map(d => {
          const isToday   = d.toDateString() === today.toDateString();
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div key={d.toISOString()} className={`text-center py-3 border-r border-slate-100 last:border-r-0 ${isWeekend ? 'bg-slate-50' : ''}`}>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                {DAY_LABELS[(d.getDay() + 6) % 7]}
              </div>
              <div className={`text-base font-bold w-8 h-8 flex items-center justify-center rounded-full mx-auto
                ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 flex-1" style={{ minHeight: 300 }}>
        {days.map(d => {
          const dayEvs    = byDay.get(d.toDateString()) ?? [];
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div key={d.toISOString()}
              className={`border-r border-slate-100 last:border-r-0 p-1.5 ${isWeekend ? 'bg-slate-50/40' : 'bg-white'}`}>
              {dayEvs.map(ev => <EventBlock key={ev.id} ev={ev} onClick={() => onEventClick(ev)} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ApproPlanning() {
  const today  = new Date();
  const [year,    setYear]    = useState(today.getFullYear());
  const [month,   setMonth]   = useState(today.getMonth());
  const [calMode, setCalMode] = useState<CalMode>('month');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedEv, setSelectedEv] = useState<PlanningEvent | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<EventType>>(
    new Set(['livraison','reception','rupture','bloquee','besoin'])
  );

  const allEvents = useMemo(() => buildEvents(), []);
  const events    = useMemo(() => allEvents.filter(ev => activeTypes.has(ev.type)), [allEvents, activeTypes]);

  // Compute week start for week view
  const weekStart = useMemo(() => {
    const base = new Date(year, month, 1);
    const dow  = (base.getDay() + 6) % 7;
    const mon  = new Date(base.getFullYear(), base.getMonth(), base.getDate() - dow);
    mon.setDate(mon.getDate() + weekOffset * 7);
    return mon;
  }, [year, month, weekOffset]);

  const navigateMonth = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setMonth(m); setYear(y); setWeekOffset(0);
  };

  const headerLabel = calMode === 'month'
    ? `${MONTH_NAMES[month]} ${year}`
    : `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()].slice(0,3)} – ${new Date(weekStart.getTime() + 6*86400000).getDate()} ${MONTH_NAMES[new Date(weekStart.getTime() + 6*86400000).getMonth()].slice(0,3)} ${year}`;

  const upcomingLivraisons = useMemo(() => {
    const todayMs = new Date().setHours(0,0,0,0);
    return allEvents.filter(ev => ev.type === 'livraison' && ev.date.getTime() >= todayMs)
      .sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }, [allEvents]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Upcoming deliveries strip */}
      {upcomingLivraisons.length > 0 && (
        <div className="flex-shrink-0 bg-blue-50 border-b border-blue-100 px-4 py-2.5">
          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 flex-shrink-0">
              <Truck className="w-3.5 h-3.5" /> Prochaines livraisons :
            </div>
            {upcomingLivraisons.map(ev => {
              const daysLeft = Math.ceil((ev.date.getTime() - new Date().setHours(0,0,0,0)) / 86400000);
              return (
                <button key={ev.id} onClick={() => setSelectedEv(ev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-medium text-slate-700 hover:border-blue-400 transition-colors flex-shrink-0">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span className="truncate max-w-[120px]">{ev.titre}</span>
                  <span className={`font-bold flex-shrink-0 ${daysLeft <= 2 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-blue-600'}`}>
                    {daysLeft === 0 ? 'Auj.' : daysLeft === 1 ? 'Demain' : `J-${daysLeft}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 flex items-center gap-3 flex-wrap">
        <button onClick={() => calMode === 'month' ? navigateMonth(-1) : setWeekOffset(w => w - 1)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700 min-w-[200px] text-center">{headerLabel}</span>
        <button onClick={() => calMode === 'month' ? navigateMonth(1) : setWeekOffset(w => w + 1)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 ml-2">
          {(['month','week'] as CalMode[]).map(m => (
            <button key={m} onClick={() => setCalMode(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${calMode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {m === 'month' ? 'Mois' : 'Semaine'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-2 flex-wrap">
          {(Object.entries(EVENT_CFG) as [EventType, typeof EVENT_CFG[EventType]][]).map(([key, cfg]) => {
            const active = activeTypes.has(key);
            const count  = allEvents.filter(ev => ev.type === key).length;
            return (
              <button key={key} onClick={() => {
                const next = new Set(activeTypes);
                active ? next.delete(key) : next.add(key);
                setActiveTypes(next);
              }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                  ${active ? `${cfg.bg} ${cfg.text} border-current/30` : 'bg-white text-slate-400 border-slate-200 opacity-60'}`}>
                {cfg.icon} {cfg.label}
                {count > 0 && <span className={`px-1 rounded-full text-[10px] font-bold ${active ? 'bg-white/60' : 'bg-slate-100'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="ml-auto text-xs text-slate-400">{events.length} événement{events.length > 1 ? 's' : ''}</div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0">
          {calMode === 'month' && (
            <MonthGrid year={year} month={month} events={events} onEventClick={setSelectedEv} />
          )}
          {calMode === 'week' && (
            <WeekTimeline weekStart={weekStart} events={events} onEventClick={setSelectedEv} />
          )}
        </div>
        {selectedEv && <DetailPanel ev={selectedEv} onClose={() => setSelectedEv(null)} />}
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 border-t border-slate-100 px-4 py-1.5 flex items-center gap-4 flex-wrap text-[10px] text-slate-400">
        <Info className="w-3 h-3 flex-shrink-0" />
        {(Object.entries(EVENT_CFG) as [EventType, typeof EVENT_CFG[EventType]][]).map(([key, cfg]) => (
          <div key={key} className={`flex items-center gap-1 ${cfg.text}`}>{cfg.icon}<span>{cfg.label}</span></div>
        ))}
      </div>
    </div>
  );
}
