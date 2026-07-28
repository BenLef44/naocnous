import React, { useState, useMemo } from 'react';
import { AlertTriangle, Search, CheckCircle2, Clock, Wrench, EyeOff, Zap, Droplets, Flame, Thermometer } from 'lucide-react';
import {
  AlerteFluide, Criticite, StatutAlerte,
  FLUIDE_CFG, CRITICITE_CFG, STATUT_ALERTE_CFG, ANOMALIE_CFG, TypeFluide,
  fmtEur, fmtDate,
} from './fluideTypes';

interface Props {
  alertes: AlerteFluide[];
  onUpdateStatut?: (id: string, statut: StatutAlerte) => void;
}

const COLUMNS: { id: StatutAlerte; label: string; icon: React.ReactNode }[] = [
  { id: 'nouvelle',           label: 'Nouvelles',           icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> },
  { id: 'en_analyse',         label: 'En analyse',          icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'intervention_creee', label: 'Intervention créée',  icon: <Wrench className="w-3.5 h-3.5 text-blue-500" /> },
  { id: 'resolue',            label: 'Résolues',            icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
  { id: 'ignoree',            label: 'Ignorées',            icon: <EyeOff className="w-3.5 h-3.5 text-slate-400" /> },
];

export default function FluidsAlertes({ alertes, onUpdateStatut }: Props) {
  const [search, setSearch]               = useState('');
  const [filterCrit, setFilterCrit]       = useState<Criticite | 'toutes'>('toutes');
  const [filterFluide, setFilterFluide]   = useState<TypeFluide | 'tous'>('tous');
  const [viewMode, setViewMode]           = useState<'kanban' | 'liste'>('kanban');

  const filtered = useMemo(() => alertes.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.titre.toLowerCase().includes(q) || (a.residences as any)?.nom?.toLowerCase().includes(q);
    const matchCrit   = filterCrit === 'toutes' || a.criticite === filterCrit;
    const matchFluide = filterFluide === 'tous' || a.type_fluide === filterFluide;
    return matchSearch && matchCrit && matchFluide;
  }), [alertes, search, filterCrit, filterFluide]);

  const alertesCritiques = useMemo(() => filtered.filter(a => a.criticite === 'critique' && a.statut !== 'resolue' && a.statut !== 'ignoree').length, [filtered]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap gap-3 items-center flex-shrink-0">
        <div className="relative min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Rechercher alerte…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['toutes', 'critique', 'haute', 'normale', 'info'] as const).map(c => {
            const cfg = c !== 'toutes' ? CRITICITE_CFG[c] : null;
            return (
              <button key={c} onClick={() => setFilterCrit(c)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${filterCrit === c ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                {c === 'toutes' ? 'Toutes' : cfg!.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['tous', 'electricite', 'gaz', 'eau', 'chaleur'] as const).map(f => {
            if (f === 'tous') return <button key={f} onClick={() => setFilterFluide('tous')} className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${filterFluide === 'tous' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tous</button>;
            const cfg = FLUIDE_CFG[f];
            const Icon = cfg.icon;
            return (
              <button key={f} onClick={() => setFilterFluide(f)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${filterFluide === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Icon className="w-3 h-3" style={{ color: cfg.colorHex }} />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {alertesCritiques > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />{alertesCritiques} critique{alertesCritiques > 1 ? 's' : ''}
            </span>
          )}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Kanban</button>
            <button onClick={() => setViewMode('liste')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'liste' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Liste</button>
          </div>
        </div>
      </div>

      {/* Kanban */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-3 p-4 h-full min-w-max">
            {COLUMNS.map(col => {
              const colAlertes = filtered.filter(a => a.statut === col.id);
              return (
                <div key={col.id} className="w-72 flex-shrink-0 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200">
                    {col.icon}
                    <span className="text-xs font-bold text-slate-700">{col.label}</span>
                    <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{colAlertes.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {colAlertes.map(a => (
                      <AlerteCard key={a.id} alerte={a} onUpdateStatut={onUpdateStatut} />
                    ))}
                    {colAlertes.length === 0 && (
                      <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-slate-100">
                        <p className="text-xs text-slate-300">Aucune alerte</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Liste */
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Criticité</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Titre</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Résidence</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Fluide</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Anomalie</th>
                <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Écart</th>
                <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Impact €/mois</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Détection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(a => {
                const crit = CRITICITE_CFG[a.criticite];
                const statut = STATUT_ALERTE_CFG[a.statut];
                const fluideCfg = FLUIDE_CFG[a.type_fluide];
                const FlIcon = fluideCfg.icon;
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${crit.bg} ${crit.text} ${crit.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${crit.dot}`} />{crit.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700 max-w-52 truncate">{a.titre}</td>
                    <td className="px-4 py-2.5 text-slate-500">{(a as any).residences?.nom ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <FlIcon className="w-3 h-3" style={{ color: fluideCfg.colorHex }} />
                        <span className="text-slate-600">{fluideCfg.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{ANOMALIE_CFG[a.type_anomalie].label}</td>
                    <td className={`px-4 py-2.5 text-right font-bold ${a.ecart_pct && a.ecart_pct > 20 ? 'text-red-600' : 'text-slate-500'}`}>
                      {a.ecart_pct != null ? `+${a.ecart_pct}%` : '—'}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold ${a.impact_euros_mois && a.impact_euros_mois > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {a.impact_euros_mois && a.impact_euros_mois > 0 ? fmtEur(a.impact_euros_mois) : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statut.bg} ${statut.text} ${statut.border}`}>{statut.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{fmtDate(a.date_detection)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AlerteCard({ alerte: a, onUpdateStatut }: { alerte: AlerteFluide; onUpdateStatut?: (id: string, s: StatutAlerte) => void }) {
  const crit = CRITICITE_CFG[a.criticite];
  const fluideCfg = FLUIDE_CFG[a.type_fluide];
  const FlIcon = fluideCfg.icon;

  const nextStatut: Partial<Record<StatutAlerte, StatutAlerte>> = {
    nouvelle: 'en_analyse',
    en_analyse: 'intervention_creee',
    intervention_creee: 'resolue',
  };

  return (
    <div className={`bg-white rounded-lg border ${a.criticite === 'critique' ? 'border-red-200' : a.criticite === 'haute' ? 'border-orange-200' : 'border-slate-200'} p-3 space-y-2 shadow-sm`}>
      <div className="flex items-start gap-2">
        <span className={`flex-shrink-0 mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${crit.bg} ${crit.text} ${crit.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${crit.dot}`} />{crit.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-700 leading-tight">{a.titre}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FlIcon className="w-3 h-3 flex-shrink-0" style={{ color: fluideCfg.colorHex }} />
        <span className="truncate">{(a as any).residences?.nom ?? '—'}</span>
        <span className="text-slate-200">·</span>
        <span>{ANOMALIE_CFG[a.type_anomalie].label}</span>
      </div>

      {a.ecart_pct != null && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Écart :</span>
          <span className="text-xs font-bold text-red-600">+{a.ecart_pct}%</span>
          {a.impact_euros_mois != null && a.impact_euros_mois > 0 && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-xs font-bold text-red-600">+{fmtEur(a.impact_euros_mois)}/mois</span>
            </>
          )}
        </div>
      )}

      {a.action_suggeree && (
        <p className="text-[10px] text-slate-500 bg-slate-50 rounded px-2 py-1 leading-relaxed">{a.action_suggeree}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-300">{fmtDate(a.date_detection)}</span>
        {nextStatut[a.statut] && onUpdateStatut && (
          <button onClick={() => onUpdateStatut(a.id, nextStatut[a.statut]!)}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors">
            {nextStatut[a.statut] === 'en_analyse' ? 'Analyser' : nextStatut[a.statut] === 'intervention_creee' ? 'Créer intervention' : 'Résoudre'}
          </button>
        )}
      </div>
    </div>
  );
}
