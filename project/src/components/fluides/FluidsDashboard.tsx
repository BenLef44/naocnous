import React, { useMemo } from 'react';
import {
  Zap, Droplets, Flame, Thermometer, AlertTriangle, TrendingDown, TrendingUp,
  Euro, Leaf, Activity, CheckCircle2, XCircle, WifiOff, Link,
} from 'lucide-react';
import {
  ConsommationFluide, AlerteFluide, CompteurFluide, FactureFluide,
  FLUIDE_CFG, CRITICITE_CFG, MOIS_COURT, fmtEur, fmtNum, TypeFluide,
} from './fluideTypes';

interface Props {
  consommations: ConsommationFluide[];
  alertes: AlerteFluide[];
  compteurs: CompteurFluide[];
  factures: FactureFluide[];
  residenceLabel: string;
  annee: number;
  onAnneeChange: (a: number) => void;
  anneesDisponibles: number[];
}

// ─── Micro sparkline SVG ──────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 64, H = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={W} height={H} className="overflow-visible opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Area chart multi-fluides ─────────────────────────────────────────────────

function AreaChart({ series, W = 600, H = 180 }: {
  series: { label: string; data: number[]; color: string }[];
  W?: number; H?: number;
}) {
  const allVals = series.flatMap(s => s.data);
  const max = Math.max(...allVals, 1);
  const n = MOIS_COURT.length;
  const PAD = { l: 40, r: 16, t: 12, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const pts = (data: number[]) => data.map((v, i) => {
    const x = PAD.l + (i / (n - 1)) * cW;
    const y = PAD.t + cH - (v / max) * cH;
    return [x, y] as [number, number];
  });

  const areaPath = (data: number[]) => {
    const p = pts(data);
    const line = p.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const last = p[p.length - 1];
    const first = p[0];
    return `${line} L${last[0].toFixed(1)},${PAD.t + cH} L${first[0].toFixed(1)},${PAD.t + cH} Z`;
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PAD.t + cH * (1 - f);
        const val = max * f;
        return (
          <g key={f}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD.l - 4} y={y + 4} fontSize={8} textAnchor="end" fill="#94a3b8">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {MOIS_COURT.map((m, i) => (
        <text key={m} x={PAD.l + (i / (n - 1)) * cW} y={H - 6}
          fontSize={8} textAnchor="middle" fill="#94a3b8">{m}</text>
      ))}
      {series.map(s => (
        <path key={s.label} d={areaPath(s.data)} fill={s.color} fillOpacity={0.12} stroke="none" />
      ))}
      {series.map(s => {
        const p = pts(s.data);
        const linePts = p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
        return <polyline key={`l-${s.label}`} points={linePts} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />;
      })}
    </svg>
  );
}

// ─── Horizontal bar ───────────────────────────────────────────────────────────

function HBar({ label, value, max, color, badge }: {
  label: string; value: number; max: number; color: string; badge?: React.ReactNode;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-32 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      {badge}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function FluidsDashboard({ consommations, alertes, compteurs, factures, residenceLabel, annee, onAnneeChange, anneesDisponibles }: Props) {

  const conso = useMemo(() => consommations.filter(c => c.annee === annee), [consommations, annee]);
  const consoPrev = useMemo(() => consommations.filter(c => c.annee === annee - 1), [consommations, annee]);

  const totalCout = useMemo(() => conso.reduce((s, c) => s + (c.cout_euros ?? 0), 0), [conso]);
  const totalCoutPrev = useMemo(() => consoPrev.reduce((s, c) => s + (c.cout_euros ?? 0), 0), [consoPrev]);

  const totalKwh = useMemo(() => conso.filter(c => c.type_fluide !== 'eau').reduce((s, c) => s + (c.valeur_kwh ?? 0), 0), [conso]);
  const totalKwhPrev = useMemo(() => consoPrev.filter(c => c.type_fluide !== 'eau').reduce((s, c) => s + (c.valeur_kwh ?? 0), 0), [consoPrev]);

  // CO2 estimate: elec 0.0568, gaz 0.227, chaleur 0.062 kgCO2/kWh
  const co2 = useMemo(() => conso.reduce((s, c) => {
    if (c.type_fluide === 'electricite') return s + (c.valeur_kwh ?? 0) * 0.0568;
    if (c.type_fluide === 'gaz') return s + (c.valeur_kwh ?? 0) * 0.227;
    if (c.type_fluide === 'chaleur') return s + (c.valeur_kwh ?? 0) * 0.062;
    return s;
  }, 0) / 1000, [conso]);

  const alertesActives = useMemo(() => alertes.filter(a => a.statut !== 'resolue' && a.statut !== 'ignoree'), [alertes]);
  const alertesCritiques = useMemo(() => alertesActives.filter(a => a.criticite === 'critique'), [alertesActives]);

  const compteursOk = useMemo(() => compteurs.filter(c => c.statut_communication === 'connecte').length, [compteurs]);
  const compteursKo = useMemo(() => compteurs.filter(c => c.statut_communication !== 'connecte').length, [compteurs]);

  const scoreQualite = useMemo(() => {
    if (compteurs.length === 0) return 100;
    return Math.round(compteurs.reduce((s, c) => s + c.score_qualite_donnee, 0) / compteurs.length);
  }, [compteurs]);

  const varCout = totalCoutPrev > 0 ? ((totalCout - totalCoutPrev) / totalCoutPrev) * 100 : 0;
  const varKwh = totalKwhPrev > 0 ? ((totalKwh - totalKwhPrev) / totalKwhPrev) * 100 : 0;

  // Monthly area chart data
  const chartSeries = useMemo(() => {
    return (['electricite', 'gaz', 'eau', 'chaleur'] as TypeFluide[]).map(f => {
      const data = Array(12).fill(0);
      conso.filter(c => c.type_fluide === f).forEach(c => { data[c.mois - 1] = c.cout_euros ?? 0; });
      return { label: FLUIDE_CFG[f].label, data, color: FLUIDE_CFG[f].colorHex };
    });
  }, [conso]);

  // Top résidences par coût
  const topResidences = useMemo(() => {
    const map: Record<string, { nom: string; total: number }> = {};
    conso.forEach(c => {
      const nom = (c as any).residences?.nom ?? c.residence_id;
      if (!map[c.residence_id]) map[c.residence_id] = { nom, total: 0 };
      map[c.residence_id].total += c.cout_euros ?? 0;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [conso]);

  const maxResTotal = topResidences[0]?.total ?? 1;

  // Sparklines per fluid
  const sparklineData = useMemo(() => {
    const r: Record<string, number[]> = {};
    (['electricite', 'gaz', 'eau', 'chaleur'] as TypeFluide[]).forEach(f => {
      const data = Array(12).fill(0);
      conso.filter(c => c.type_fluide === f).forEach(c => { data[c.mois - 1] = c.cout_euros ?? 0; });
      r[f] = data;
    });
    return r;
  }, [conso]);

  const fluideTotaux = useMemo(() => {
    const r: Record<string, { cout: number; volume: number }> = {};
    conso.forEach(c => {
      if (!r[c.type_fluide]) r[c.type_fluide] = { cout: 0, volume: 0 };
      r[c.type_fluide].cout += c.cout_euros ?? 0;
      r[c.type_fluide].volume += (c.valeur_kwh ?? c.valeur_m3 ?? 0);
    });
    return r;
  }, [conso]);

  const facturesEnAttente = useMemo(() => factures.filter(f => f.statut_paiement === 'en_attente'), [factures]);
  const totalFacturesAttente = useMemo(() => facturesEnAttente.reduce((s, f) => s + f.montant_ttc, 0), [facturesEnAttente]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">

      {/* Year selector + context */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-slate-400">Périmètre · <span className="font-semibold text-slate-600">{residenceLabel}</span></p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {anneesDisponibles.map(a => (
            <button key={a} onClick={() => onAnneeChange(a)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${annee === a ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Consommation totale"
          value={totalKwh >= 1_000_000 ? `${(totalKwh / 1_000_000).toFixed(2)} GWh` : `${Math.round(totalKwh / 1000)} MWh`}
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          bg="bg-amber-50" border="border-amber-100"
          trend={varKwh} sparkData={sparklineData['electricite']} sparkColor="#f59e0b"
        />
        <KpiCard
          label="Coût énergétique"
          value={fmtEur(totalCout)}
          icon={<Euro className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-50" border="border-blue-100"
          trend={varCout} sparkData={sparklineData['gaz']} sparkColor="#3b82f6"
        />
        <KpiCard
          label="Émissions CO₂"
          value={`${fmtNum(co2)} tCO₂`}
          icon={<Leaf className="w-5 h-5 text-green-600" />}
          bg="bg-green-50" border="border-green-100"
          sparkData={sparklineData['chaleur']} sparkColor="#16a34a"
        />
        <KpiCard
          label="Alertes actives"
          value={`${alertesActives.length}`}
          subValue={alertesCritiques.length > 0 ? `${alertesCritiques.length} critique${alertesCritiques.length > 1 ? 's' : ''}` : undefined}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          bg={alertesCritiques.length > 0 ? 'bg-red-50' : 'bg-slate-50'} border={alertesCritiques.length > 0 ? 'border-red-100' : 'border-slate-100'}
          valueColor={alertesCritiques.length > 0 ? 'text-red-600' : 'text-slate-800'}
        />
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Compteurs connectés"
          value={`${compteursOk}/${compteurs.length}`}
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          bg="bg-emerald-50" border="border-emerald-100"
          subValue={compteursKo > 0 ? `${compteursKo} hors ligne` : undefined}
        />
        <KpiCard
          label="Qualité des données"
          value={`${scoreQualite}%`}
          icon={scoreQualite >= 90 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-amber-500" />}
          bg={scoreQualite >= 90 ? 'bg-emerald-50' : 'bg-amber-50'}
          border={scoreQualite >= 90 ? 'border-emerald-100' : 'border-amber-100'}
          valueColor={scoreQualite >= 90 ? 'text-emerald-700' : 'text-amber-700'}
        />
        <KpiCard
          label="Factures en attente"
          value={`${facturesEnAttente.length}`}
          subValue={fmtEur(totalFacturesAttente)}
          icon={<Euro className="w-5 h-5 text-orange-500" />}
          bg="bg-orange-50" border="border-orange-100"
        />
        <KpiCard
          label="Économies estimées"
          value="42 000 €"
          icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
          bg="bg-emerald-50" border="border-emerald-100"
          valueColor="text-emerald-700"
          subValue="vs trajectoire N-1"
        />
      </div>

      {/* Main chart + fluide cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-slate-700">Coûts mensuels par fluide</p>
              <p className="text-xs text-slate-400">{annee} · {residenceLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              {(['electricite', 'gaz', 'eau', 'chaleur'] as TypeFluide[]).map(f => {
                const cfg = FLUIDE_CFG[f];
                const Icon = cfg.icon;
                return (
                  <div key={f} className="flex items-center gap-1">
                    <Icon className="w-3 h-3" style={{ color: cfg.colorHex }} />
                    <span className="text-xs text-slate-500">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <AreaChart series={chartSeries} W={580} H={180} />
        </div>

        {/* Fluide breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-bold text-slate-700">Répartition par fluide</p>
          {(['electricite', 'gaz', 'eau', 'chaleur'] as TypeFluide[]).map(f => {
            const cfg = FLUIDE_CFG[f];
            const Icon = cfg.icon;
            const tot = fluideTotaux[f];
            if (!tot || tot.cout === 0) return null;
            const pct = totalCout > 0 ? Math.round((tot.cout / totalCout) * 100) : 0;
            return (
              <div key={f} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: cfg.colorHex + '20' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: cfg.colorHex }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 flex-1">{cfg.label}</span>
                  <span className="text-xs font-bold text-slate-700">{fmtEur(tot.cout)}</span>
                  <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-8">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.colorHex }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertes + Top résidences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Alertes critiques */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold text-slate-700">Alertes intelligentes</span>
            {alertesActives.length > 0 && (
              <span className="ml-auto text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{alertesActives.length}</span>
            )}
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {alertesActives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                <p className="text-sm text-slate-400">Aucune alerte active</p>
              </div>
            ) : alertesActives.slice(0, 6).map(a => {
              const crit = CRITICITE_CFG[a.criticite];
              const fluideCfg = FLUIDE_CFG[a.type_fluide];
              const FlIcon = fluideCfg.icon;
              return (
                <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                  <span className={`flex-shrink-0 mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${crit.bg} ${crit.text} ${crit.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${crit.dot}`} />
                    {crit.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{a.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <FlIcon className="w-3 h-3 flex-shrink-0" style={{ color: fluideCfg.colorHex }} />
                      <p className="text-xs text-slate-400 truncate">{(a as any).residences?.nom ?? '—'}</p>
                      {a.impact_euros_mois && a.impact_euros_mois > 0 && (
                        <span className="text-xs font-bold text-red-600 ml-auto flex-shrink-0">+{fmtEur(a.impact_euros_mois)}/mois</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top résidences */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-bold text-slate-700">Top dérives — résidences</p>
          {topResidences.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune donnée</p>
          ) : topResidences.map((r, i) => (
            <HBar
              key={r.nom}
              label={r.nom}
              value={r.total}
              max={maxResTotal}
              color={i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#f59e0b'}
              badge={<span className="text-xs font-bold text-slate-700 flex-shrink-0 w-20 text-right">{fmtEur(r.total)}</span>}
            />
          ))}

          {/* Statut compteurs mini */}
          <div className="border-t border-slate-100 pt-3 mt-2">
            <p className="text-xs font-semibold text-slate-500 mb-2">État des compteurs</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">{compteursOk} connectés</span>
              </div>
              {compteursKo > 0 && (
                <div className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500">{compteursKo} hors ligne / problème</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Factures vs compteurs */}
      {factures.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700">Factures récentes — rapprochement compteur</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wide">Résidence</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wide">Fournisseur</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wide">Fluide</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wide">Période</th>
                  <th className="text-right px-4 py-2 text-slate-400 font-semibold uppercase tracking-wide">Montant TTC</th>
                  <th className="text-right px-4 py-2 text-slate-400 font-semibold uppercase tracking-wide">Écart cpt.</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-semibold uppercase tracking-wide">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {factures.slice(0, 8).map(f => {
                  const fCfg = FLUIDE_CFG[f.type_fluide];
                  const FIcon = fCfg.icon;
                  const ecartAlert = f.ecart_compteur_pct != null && Math.abs(f.ecart_compteur_pct) > 5;
                  const statutCfg = {
                    en_attente: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En attente' },
                    paye:       { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Payé' },
                    impaye:     { bg: 'bg-red-50', text: 'text-red-700', label: 'Impayé' },
                    litige:     { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Litige' },
                  }[f.statut_paiement] ?? { bg: 'bg-slate-50', text: 'text-slate-500', label: f.statut_paiement };
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-slate-700 font-medium">{(f as any).residences?.nom ?? '—'}</td>
                      <td className="px-4 py-2.5 text-slate-500">{f.fournisseur}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <FIcon className="w-3 h-3" style={{ color: fCfg.colorHex }} />
                          <span className="text-slate-600">{fCfg.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {new Date(f.periode_debut).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })} – {new Date(f.periode_fin).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-700">{fmtEur(f.montant_ttc)}</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${ecartAlert ? 'text-red-600' : 'text-slate-500'}`}>
                        {f.ecart_compteur_pct != null ? `${f.ecart_compteur_pct > 0 ? '+' : ''}${f.ecart_compteur_pct.toFixed(1)}%` : '—'}
                        {ecartAlert && ' ⚠'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statutCfg.bg} ${statutCfg.text}`}>{statutCfg.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OSFI connectors status widget */}
      <OsfiWidget />
    </div>
  );
}

// ─── OSFI mini widget ─────────────────────────────────────────────────────────

const OSFI_MINI = [
  { initials: 'DK', bg: '#1a6b3c', color: '#fff', nom: 'Deepki',    status: 'ok',  synchro: '2 min',  mesures: '25.4k' },
  { initials: 'AV', bg: '#0066cc', color: '#fff', nom: 'Advizeo',   status: 'ok',  synchro: '15 min', mesures: '12.2k' },
  { initials: 'UG', bg: '#2e7d32', color: '#fff', nom: 'Ubigreen',  status: 'ok',  synchro: '8 min',  mesures: '8.9k'  },
  { initials: 'EN', bg: '#e65100', color: '#fff', nom: 'Energisme', status: 'err', synchro: 'Hier',   mesures: '—'     },
  { initials: 'CI', bg: '#f9c80e', color: '#1a1a1a', nom: 'Citron°',  status: 'off', synchro: '—',      mesures: '—'     },
  { initials: 'EC', bg: '#3dcd58', color: '#fff', nom: 'EcoStruX.', status: 'off', synchro: '—',      mesures: '—'     },
];

function OsfiWidget() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Link className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-bold text-slate-700">Connecteurs OSFI — état en temps réel</span>
        <span className="ml-auto text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{OSFI_MINI.filter(o => o.status === 'ok').length} actifs</span>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {OSFI_MINI.map(o => {
          const isOk = o.status === 'ok';
          const isErr = o.status === 'err';
          return (
            <div key={o.nom} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${isOk ? 'border-emerald-200 bg-emerald-50/50' : isErr ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm" style={{ background: o.bg, color: o.color }}>{o.initials}</div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOk ? 'bg-emerald-500' : isErr ? 'bg-red-500' : 'bg-slate-300'}`} />
              </div>
              <p className="text-xs font-semibold text-slate-700 text-center leading-tight">{o.nom}</p>
              {isOk ? (
                <>
                  <p className="text-[10px] text-slate-400 text-center">{o.synchro}</p>
                  <p className="text-[10px] font-bold text-emerald-600">{o.mesures}</p>
                </>
              ) : isErr ? (
                <p className="text-[10px] font-bold text-red-500">Erreur</p>
              ) : (
                <p className="text-[10px] text-slate-300">Non configuré</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, subValue, icon, bg, border, trend, sparkData, sparkColor, valueColor = 'text-slate-800' }: {
  label: string; value: string; subValue?: string; icon: React.ReactNode;
  bg: string; border: string; trend?: number; sparkData?: number[]; sparkColor?: string; valueColor?: string;
}) {
  return (
    <div className={`${bg} border ${border} rounded-xl p-3.5 flex flex-col gap-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-shrink-0">{icon}</div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trend > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium leading-none mb-1">{label}</p>
        <p className={`text-xl font-black leading-none ${valueColor}`}>{value}</p>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      {sparkData && sparkColor && (
        <div className="mt-1">
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}
    </div>
  );
}
