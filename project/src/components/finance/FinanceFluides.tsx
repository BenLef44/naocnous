import { useState, useMemo } from 'react';
import { AlertTriangle, Zap, Droplets, Flame, Thermometer } from 'lucide-react';
import type { ConsommationFluide } from './financeTypes';
import { fmtEur } from './financeTypes';

// ─── SVG line chart ───────────────────────────────────────────────────────────

function LineChart({ series, xLabels, W = 320, H = 100 }: {
  series: { label: string; data: number[]; color: string }[];
  xLabels: string[];
  W?: number;
  H?: number;
}) {
  const allVals = series.flatMap(s => s.data).filter(v => v > 0);
  if (allVals.length === 0) return <div className="h-24 flex items-center justify-center text-slate-300 text-xs">Aucune donnée</div>;
  const max = Math.max(...allVals, 1);
  const n = xLabels.length;
  const PAD = { l: 32, r: 8, t: 8, b: 20 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  function pts(data: number[]) {
    return data.map((v, i) => {
      const x = PAD.l + (i / Math.max(n - 1, 1)) * chartW;
      const y = PAD.t + chartH - (v / max) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  return (
    <svg width={W} height={H} className="overflow-visible w-full">
      {/* Y grid */}
      {[0, 0.5, 1].map(f => {
        const y = PAD.t + chartH * (1 - f);
        return <line key={f} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />;
      })}
      {/* X labels */}
      {xLabels.map((l, i) => (
        <text key={i} x={PAD.l + (i / Math.max(n - 1, 1)) * chartW} y={H - 4}
          fontSize={7} textAnchor="middle" fill="#94a3b8">{l}</text>
      ))}
      {/* Lines */}
      {series.map(s => (
        <polyline key={s.label} points={pts(s.data)} fill="none" stroke={s.color} strokeWidth={1.5} strokeLinejoin="round" />
      ))}
      {/* Dots */}
      {series.map(s => s.data.map((v, i) => {
        const x = PAD.l + (i / Math.max(n - 1, 1)) * chartW;
        const y = PAD.t + chartH - (v / max) * chartH;
        return <circle key={`${s.label}-${i}`} cx={x} cy={y} r={2} fill={s.color} />;
      }))}
    </svg>
  );
}

// ─── Fluide config ────────────────────────────────────────────────────────────

const FLUIDE_CFG: Record<string, { label: string; icon: React.ElementType; color: string; unit: string }> = {
  electricite: { label: 'Électricité', icon: Zap,         color: '#f59e0b', unit: 'kWh' },
  gaz:         { label: 'Gaz',         icon: Flame,       color: '#3b82f6', unit: 'kWh' },
  eau:         { label: 'Eau',         icon: Droplets,    color: '#0891b2', unit: 'm³'  },
  chaleur:     { label: 'Chaleur',     icon: Thermometer, color: '#ef4444', unit: 'kWh' },
};

const MOIS_COURT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

interface Props { fluides: ConsommationFluide[] }

export default function FinanceFluides({ fluides }: Props) {
  const [annee, setAnnee] = useState(2026);

  const annees = useMemo(() => [...new Set(fluides.map(f => f.annee))].sort((a, b) => b - a), [fluides]);

  const byFluide = useMemo(() => {
    const map: Record<string, ConsommationFluide[]> = {};
    fluides.filter(f => f.annee === annee).forEach(f => {
      if (!map[f.type_fluide]) map[f.type_fluide] = [];
      map[f.type_fluide].push(f);
    });
    return map;
  }, [fluides, annee]);

  const alertes = fluides.filter(f => f.alerte_seuil && f.annee === annee);

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</p>
          <p className="text-sm font-bold text-cyan-600">OPERAT/OSFI — données simulées</p>
        </div>
        <select value={annee} onChange={e => setAnnee(+e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none">
          {annees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700">{alertes.length} alerte{alertes.length > 1 ? 's' : ''} de surconsommation détectée{alertes.length > 1 ? 's' : ''}</p>
            <p className="text-[11px] text-red-500 mt-0.5">
              Mois concernés : {alertes.map(a => `${MOIS_COURT[a.mois - 1]} ${a.annee} (${a.type_fluide})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* KPI par fluide */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(FLUIDE_CFG).map(([key, cfg]) => {
          const rows = (byFluide[key] ?? []).sort((a, b) => a.mois - b.mois);
          if (rows.length === 0) return null;
          const Icon = cfg.icon;
          const totalCout = rows.reduce((s, r) => s + (r.cout_euros ?? 0), 0);
          const totalKwh  = rows.reduce((s, r) => s + (r.valeur_kwh ?? 0), 0);
          const totalM3   = rows.reduce((s, r) => s + (r.valeur_m3 ?? 0), 0);
          const maxIndice = Math.max(...rows.map(r => r.indice_base100 ?? 100));
          const nbAlertes = rows.filter(r => r.alerte_seuil).length;

          const moisPresents = rows.map(r => r.mois);
          const coutData   = Array(12).fill(0);
          const valeurData = Array(12).fill(0);
          rows.forEach(r => {
            coutData[r.mois - 1]   = r.cout_euros ?? 0;
            valeurData[r.mois - 1] = r.valeur_kwh ?? r.valeur_m3 ?? 0;
          });
          const chartMois = rows.map(r => MOIS_COURT[r.mois - 1]);

          return (
            <div key={key} className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cfg.color + '20' }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">{cfg.label}</p>
                  <p className="text-[10px] text-slate-400">{annee}</p>
                </div>
                {nbAlertes > 0 && (
                  <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                    {nbAlertes} alerte{nbAlertes > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-[10px] text-slate-400">Coût total</p>
                  <p className="text-sm font-black text-slate-700">{fmtEur(totalCout)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Volume</p>
                  <p className="text-sm font-black text-slate-700">
                    {key === 'eau' ? `${Math.round(totalM3)} m³` : `${Math.round(totalKwh / 1000)} MWh`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Indice max</p>
                  <p className={`text-sm font-black ${maxIndice > 110 ? 'text-red-600' : maxIndice > 105 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {maxIndice}
                  </p>
                </div>
              </div>

              <LineChart
                series={[{ label: 'Coût (€)', data: rows.map(r => r.cout_euros ?? 0), color: cfg.color }]}
                xLabels={chartMois}
              />

              {/* Tableau mensuel compact */}
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-1 text-slate-400 font-bold uppercase">Mois</th>
                      <th className="text-right py-1 text-slate-400 font-bold uppercase">{cfg.unit}</th>
                      <th className="text-right py-1 text-slate-400 font-bold uppercase">Coût</th>
                      <th className="text-right py-1 text-slate-400 font-bold uppercase">Indice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id} className={`border-b border-slate-50 ${r.alerte_seuil ? 'bg-red-50' : ''}`}>
                        <td className="py-1 font-medium text-slate-600">{MOIS_COURT[r.mois - 1]}</td>
                        <td className="py-1 text-right text-slate-600">
                          {r.valeur_kwh != null ? Math.round(r.valeur_kwh).toLocaleString('fr-FR') : r.valeur_m3?.toLocaleString('fr-FR') ?? '—'}
                        </td>
                        <td className="py-1 text-right font-bold text-slate-700">{fmtEur(r.cout_euros)}</td>
                        <td className={`py-1 text-right font-bold ${r.indice_base100 != null && r.indice_base100 > 110 ? 'text-red-600' : r.indice_base100 != null && r.indice_base100 > 105 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {r.indice_base100 ?? '—'}
                          {r.alerte_seuil && ' ⚠'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
