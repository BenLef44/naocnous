import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import {
  ConsommationFluide, FLUIDE_CFG, MOIS_COURT, fmtEur, fmtNum, TypeFluide,
} from './fluideTypes';

interface Props {
  consommations: ConsommationFluide[];
  annee: number;
}

type GroupBy = 'residence' | 'fluide' | 'mois';

export default function FluidsTableau({ consommations, annee }: Props) {
  const [search, setSearch]       = useState('');
  const [filterFluide, setFilterFluide] = useState<TypeFluide | 'tous'>('tous');
  const [groupBy, setGroupBy]     = useState<GroupBy>('residence');

  const conso = useMemo(() => consommations.filter(c => c.annee === annee), [consommations, annee]);
  const consoPrev = useMemo(() => consommations.filter(c => c.annee === annee - 1), [consommations, annee]);

  // Build rows — one per residence/fluide combination with monthly breakdown
  const rows = useMemo(() => {
    const map = new Map<string, {
      key: string;
      residenceNom: string;
      fluide: TypeFluide;
      mensuel: number[];
      coutTotal: number;
      volume: number;
      alertes: number;
      indiceMax: number;
      prevCout: number;
    }>();

    conso.forEach(c => {
      const nom = (c as any).residences?.nom ?? c.residence_id.slice(0, 8);
      const key = `${c.residence_id}-${c.type_fluide}`;
      if (!map.has(key)) {
        map.set(key, { key, residenceNom: nom, fluide: c.type_fluide as TypeFluide,
          mensuel: Array(12).fill(0), coutTotal: 0, volume: 0, alertes: 0, indiceMax: 100, prevCout: 0 });
      }
      const row = map.get(key)!;
      row.mensuel[c.mois - 1] = c.cout_euros ?? 0;
      row.coutTotal += c.cout_euros ?? 0;
      row.volume += c.valeur_kwh ?? c.valeur_m3 ?? 0;
      if (c.alerte_seuil) row.alertes++;
      if ((c.indice_base100 ?? 100) > row.indiceMax) row.indiceMax = c.indice_base100 ?? 100;
    });

    consoPrev.forEach(c => {
      const key = `${c.residence_id}-${c.type_fluide}`;
      if (map.has(key)) {
        map.get(key)!.prevCout += c.cout_euros ?? 0;
      }
    });

    return [...map.values()];
  }, [conso, consoPrev]);

  const filtered = useMemo(() => rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.residenceNom.toLowerCase().includes(q) || r.fluide.includes(q);
    const matchFluide = filterFluide === 'tous' || r.fluide === filterFluide;
    return matchSearch && matchFluide;
  }), [rows, search, filterFluide]);

  const totalCout = filtered.reduce((s, r) => s + r.coutTotal, 0);
  const totalAlertes = filtered.reduce((s, r) => s + r.alertes, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap gap-3 items-center flex-shrink-0">
        <div className="relative min-w-48 max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Rechercher résidence, fluide…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <TabBtn active={filterFluide === 'tous'} onClick={() => setFilterFluide('tous')} label="Tous" />
          {(['electricite', 'gaz', 'eau', 'chaleur'] as TypeFluide[]).map(f => {
            const cfg = FLUIDE_CFG[f];
            const Icon = cfg.icon;
            return (
              <TabBtn key={f} active={filterFluide === f} onClick={() => setFilterFluide(f)}
                label={cfg.label} icon={<Icon className="w-3 h-3" style={{ color: cfg.colorHex }} />} />
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
          {totalAlertes > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />{totalAlertes} alerte{totalAlertes > 1 ? 's' : ''}
            </span>
          )}
          <span><span className="font-semibold text-slate-600">{fmtEur(totalCout)}</span> total</span>
          <span>{filtered.length} ligne{filtered.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Résidence</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Fluide</th>
              {MOIS_COURT.map(m => (
                <th key={m} className="text-right px-2 py-2.5 text-slate-400 font-semibold uppercase tracking-wide w-10">{m}</th>
              ))}
              <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Total</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Évol.</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Idx max</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(r => {
              const cfg = FLUIDE_CFG[r.fluide];
              const Icon = cfg.icon;
              const evol = r.prevCout > 0 ? ((r.coutTotal - r.prevCout) / r.prevCout) * 100 : null;
              const isHigh = r.indiceMax > 110;
              const isMid = r.indiceMax > 105;

              return (
                <tr key={r.key} className={`hover:bg-slate-50 transition-colors ${r.alertes > 0 ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-2.5 font-medium text-slate-700 max-w-36 truncate">{r.residenceNom}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: cfg.colorHex + '20' }}>
                        <Icon className="w-3 h-3" style={{ color: cfg.colorHex }} />
                      </div>
                      <span className="text-slate-600 font-medium">{cfg.label}</span>
                    </div>
                  </td>
                  {r.mensuel.map((v, i) => (
                    <td key={i} className={`px-2 py-2.5 text-right ${v > 0 ? 'text-slate-700 font-medium' : 'text-slate-200'}`}>
                      {v > 0 ? (v >= 10000 ? `${(v / 1000).toFixed(0)}k` : fmtNum(v)) : '—'}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right font-black text-slate-700">{fmtEur(r.coutTotal)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {evol !== null ? (
                      <span className={`flex items-center justify-end gap-0.5 font-bold ${evol > 5 ? 'text-red-600' : evol < -5 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {evol > 1 ? <TrendingUp className="w-3 h-3" /> : evol < -1 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {evol > 0 ? '+' : ''}{evol.toFixed(1)}%
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-bold ${isHigh ? 'text-red-600' : isMid ? 'text-amber-600' : 'text-slate-500'}`}>
                    {r.indiceMax}
                    {(isHigh || isMid) && <span className="ml-1">⚠</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.alertes > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle className="w-2.5 h-2.5" />{r.alertes} alerte{r.alertes > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Normal</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={17} className="px-4 py-16 text-center text-slate-400 text-sm">Aucune donnée pour les filtres sélectionnés</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      {icon}{label}
    </button>
  );
}
