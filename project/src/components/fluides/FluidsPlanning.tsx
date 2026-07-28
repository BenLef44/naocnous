import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Droplets, Zap, Flame, Thermometer, AlertTriangle, Wrench, FileText } from 'lucide-react';
import { AlerteFluide, FactureFluide, FLUIDE_CFG, CRITICITE_CFG, fmtEur, fmtDate } from './fluideTypes';

interface PlanningEvent {
  id: string;
  date: Date;
  type: 'releve' | 'alerte' | 'facture' | 'maintenance';
  titre: string;
  detail?: string;
  fluide?: string;
  criticite?: string;
  montant?: number;
  residenceNom?: string;
}

interface Props {
  alertes: AlerteFluide[];
  factures: FactureFluide[];
}

const TYPE_CFG = {
  releve:      { label: 'Relevé',      color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500'    },
  alerte:      { label: 'Alerte',      color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500'     },
  facture:     { label: 'Facture',     color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500'   },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500'  },
};

export default function FluidsPlanning({ alertes, factures }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const events = useMemo((): PlanningEvent[] => {
    const evts: PlanningEvent[] = [];

    // Alertes → événements
    alertes.forEach(a => {
      const date = new Date(a.date_detection);
      evts.push({
        id: `alerte-${a.id}`,
        date,
        type: 'alerte',
        titre: a.titre,
        detail: a.description ?? undefined,
        fluide: a.type_fluide,
        criticite: a.criticite,
        residenceNom: (a as any).residences?.nom,
      });
    });

    // Factures → échéances
    factures.forEach(f => {
      if (f.date_echeance) {
        evts.push({
          id: `facture-${f.id}`,
          date: new Date(f.date_echeance),
          type: 'facture',
          titre: `Échéance ${f.fournisseur} — ${FLUIDE_CFG[f.type_fluide]?.label ?? f.type_fluide}`,
          fluide: f.type_fluide,
          montant: f.montant_ttc,
          residenceNom: (f as any).residences?.nom,
        });
      }
      if (f.date_emission) {
        evts.push({
          id: `emission-${f.id}`,
          date: new Date(f.date_emission),
          type: 'facture',
          titre: `Facture ${f.reference_facture ?? f.fournisseur}`,
          fluide: f.type_fluide,
          montant: f.montant_ttc,
          residenceNom: (f as any).residences?.nom,
        });
      }
    });

    // Synthetic scheduled meter reads (every month on 5th)
    const months = [0, 1, 2, 3, 4, 5];
    months.forEach(m => {
      ['ELC-CESAR-P01', 'EAU-ALLIX-P01', 'GAZ-LIRON-P01'].forEach((ref, i) => {
        evts.push({
          id: `releve-${m}-${ref}`,
          date: new Date(2026, m, 5 + i),
          type: 'releve',
          titre: `Relevé programmé — ${ref}`,
          fluide: i === 0 ? 'electricite' : i === 1 ? 'eau' : 'gaz',
        });
      });
    });

    return evts;
  }, [alertes, factures]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Monday start
  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7;

  const days = Array.from({ length: totalCells }, (_, i) => {
    const d = i - startPad + 1;
    return d >= 1 && d <= lastDay.getDate() ? new Date(year, month, d) : null;
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, PlanningEvent[]>();
    events.forEach(e => {
      const key = e.date.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    if (!selectedDay) return [];
    return eventsByDay.get(selectedDay.toISOString().slice(0, 10)) ?? [];
  }, [selectedDay, eventsByDay]);

  const monthName = firstDay.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 flex gap-0 overflow-hidden">
      {/* Calendar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Month nav */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-sm font-bold text-slate-700 capitalize flex-1 text-center">{monthName}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Legend */}
          <div className="flex items-center gap-3 ml-4">
            {Object.entries(TYPE_CFG).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs text-slate-400">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-20 rounded-lg" />;
              const key = day.toISOString().slice(0, 10);
              const dayEvents = eventsByDay.get(key) ?? [];
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDay?.toDateString() === day.toDateString();
              const hasAlerte = dayEvents.some(e => e.type === 'alerte');
              const hasFacture = dayEvents.some(e => e.type === 'facture');

              return (
                <div key={key}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`h-20 rounded-lg border p-1.5 cursor-pointer transition-all ${isSelected ? 'border-blue-400 bg-blue-50 shadow-sm' : isToday ? 'border-blue-200 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}>
                  <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map(e => {
                      const cfg = TYPE_CFG[e.type];
                      return (
                        <div key={e.id} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate border ${cfg.color}`}>
                          {e.titre}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 pl-1">+{dayEvents.length - 2} autres</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="w-72 border-l border-slate-200 bg-white flex flex-col flex-shrink-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-700">
            {selectedDay
              ? selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
              : 'Sélectionnez un jour'}
          </p>
          {selectedEvents.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">{selectedEvents.length} événement{selectedEvents.length > 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {!selectedDay ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Calendar className="w-8 h-8 text-slate-200" />
              <p className="text-xs text-slate-400 text-center">Cliquez sur un jour pour voir les événements</p>
            </div>
          ) : selectedEvents.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Aucun événement ce jour</p>
          ) : selectedEvents.map(e => {
            const cfg = TYPE_CFG[e.type];
            const FlIcon = e.fluide ? FLUIDE_CFG[e.fluide as any]?.icon : Calendar;
            const fluideCfg = e.fluide ? FLUIDE_CFG[e.fluide as any] : null;
            return (
              <div key={e.id} className={`rounded-lg border p-3 space-y-1.5 ${cfg.color}`}>
                <div className="flex items-start gap-2">
                  <FlIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={fluideCfg ? { color: fluideCfg.colorHex } : {}} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-tight">{e.titre}</p>
                    {e.residenceNom && <p className="text-[10px] opacity-75 mt-0.5">{e.residenceNom}</p>}
                  </div>
                </div>
                {e.detail && <p className="text-[10px] opacity-80 leading-relaxed">{e.detail.slice(0, 100)}{e.detail.length > 100 ? '…' : ''}</p>}
                {e.montant != null && (
                  <p className="text-[10px] font-bold">{fmtEur(e.montant)}</p>
                )}
                {e.criticite && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${CRITICITE_CFG[e.criticite as any].bg} ${CRITICITE_CFG[e.criticite as any].text}`}>
                    <AlertTriangle className="w-2.5 h-2.5" />{CRITICITE_CFG[e.criticite as any].label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Monthly summary */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          <p className="text-xs font-bold text-slate-600">Résumé du mois</p>
          {Object.entries(
            events
              .filter(e => e.date.getMonth() === month && e.date.getFullYear() === year)
              .reduce((acc, e) => { acc[e.type] = (acc[e.type] ?? 0) + 1; return acc; }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${TYPE_CFG[type as keyof typeof TYPE_CFG].dot}`} />
                <span className="text-xs text-slate-500">{TYPE_CFG[type as keyof typeof TYPE_CFG].label}</span>
              </div>
              <span className="text-xs font-bold text-slate-700">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
