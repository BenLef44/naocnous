import { useState, useMemo } from 'react';
import {
  Euro, TrendingUp, TrendingDown, Clock, ShieldCheck, AlertTriangle,
  Wrench, BarChart3, Activity, CheckCircle2, XCircle, RefreshCw,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import type { ContratRow } from './ContratsTableau';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  contrats: ContratRow[];
}

type VentilationCritere = 'type' | 'statut' | 'prestataire' | 'marque_p' | 'criticite';
type EvolutionMetrique  = 'budget' | 'realisation' | 'reactivity' | 'nc';

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = 2026;
const PREV_YEAR    = 2025;

const PALETTE = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function fmtPct(n: number) { return `${Math.round(n)}%`; }

function delta(curr: number, prev: number): { val: number; pct: number; up: boolean } {
  const pct = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
  return { val: curr - prev, pct, up: curr >= prev };
}

// ─── Sub-accordion ────────────────────────────────────────────────────────────

function Section({
  title, subtitle, accentColor, defaultOpen = true, children,
}: {
  title: string; subtitle?: string; accentColor: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`w-1 h-5 rounded-full ${accentColor}`} />
          <div className="text-left">
            <span className="text-sm font-bold text-slate-700">{title}</span>
            {subtitle && <span className="ml-2 text-xs text-slate-400 font-normal">{subtitle}</span>}
          </div>
        </div>
        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
          {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5 pt-4 bg-white">{children}</div>}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, iconCls, bg, border, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconCls: string; bg: string; border: string;
  trend?: { pct: number; up: boolean; upIsGood?: boolean };
}) {
  const trendUp = trend?.up ?? true;
  const upIsGood = trend?.upIsGood ?? true;
  const good = trendUp === upIsGood;
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 flex items-start gap-3`}>
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className={`w-4.5 h-4.5 ${iconCls}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1 leading-tight">{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${good ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.pct >= 0 ? '+' : ''}{Math.round(trend.pct)}% vs N-1</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

interface Slice { label: string; value: number; color: string }

function Donut({
  slices, title, selectOptions, selected, onSelect,
}: {
  slices: Slice[]; title: string;
  selectOptions: { value: string; label: string }[];
  selected: string; onSelect: (v: string) => void;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const total = slices.reduce((s, sl) => s + sl.value, 0);

  const paths = useMemo(() => {
    if (total === 0) return [];
    const cx = 100, cy = 100, r = 72;
    let ang = -Math.PI / 2;
    return slices
      .filter(sl => sl.value > 0)
      .map((sl, i) => {
        const sweep = (sl.value / total) * 2 * Math.PI;
        const end = ang + sweep;
        const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        ang = end;
        return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} L ${cx} ${cy} Z`, color: sl.color, index: i, label: sl.label, value: sl.value };
      });
  }, [slices, total]);

  const hovSlice = hov !== null ? paths[hov] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{title}</p>
        <select
          value={selected} onChange={e => onSelect(e.target.value)}
          className="text-[11px] border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          {selectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex justify-center">
        <div className="w-44 h-44">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {total === 0 ? (
              <circle cx="100" cy="100" r="72" fill="#f1f5f9" />
            ) : (
              paths.map(({ d, color, index }) => (
                <path key={index} d={d} fill={color}
                  opacity={hov !== null && hov !== index ? 0.3 : 1}
                  style={{ transformOrigin: '100px 100px', transform: hov === index ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.15s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHov(index)} onMouseLeave={() => setHov(null)} />
              ))
            )}
            <circle cx="100" cy="100" r="44" fill="white" />
            {hovSlice ? (
              <>
                <text x="100" y="95" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b" dominantBaseline="middle">{hovSlice.value}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="9" fill="#94a3b8" dominantBaseline="middle">{hovSlice.label.substring(0, 16)}</text>
              </>
            ) : (
              <>
                <text x="100" y="95" textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e293b" dominantBaseline="middle">{total}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="10" fill="#94a3b8" dominantBaseline="middle">contrats</text>
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="space-y-1.5">
        {slices.filter(sl => sl.value > 0).map((sl, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sl.color }} />
            <span className="text-xs text-slate-600 flex-1 truncate">{sl.label}</span>
            <span className="text-xs font-bold text-slate-700 tabular-nums">{sl.value}</span>
            <span className="text-[10px] text-slate-400 tabular-nums w-10 text-right">{total > 0 ? Math.round((sl.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Evolution line chart ──────────────────────────────────────────────────────

interface EvolPoint { month: string; n: number; n1: number }

function EvolutionChart({ data, metrique, unit }: { data: EvolPoint[]; metrique: string; unit?: string }) {
  const [hov, setHov] = useState<number | null>(null);

  const allVals = data.flatMap(d => [d.n, d.n1]).filter(v => v > 0);
  const maxVal  = allVals.length ? Math.max(...allVals) * 1.15 : 100;
  const minVal  = 0;
  const range   = maxVal - minVal || 1;

  const W = 520, H = 200, PL = 52, PR = 16, PT = 16, PB = 32;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  function toX(i: number) { return PL + (i / (data.length - 1)) * chartW; }
  function toY(v: number) { return PT + chartH - ((v - minVal) / range) * chartH; }

  function buildPath(vals: number[]) {
    return vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
  }

  const formatVal = (v: number) =>
    unit === '€' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`) : `${v}${unit ?? ''}`;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-[11px] text-slate-500 font-medium">{CURRENT_YEAR} (N)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 rounded-full bg-slate-300 inline-block" style={{ borderTop: '2px dashed #94a3b8', height: 0 }} />
            <span className="text-[11px] text-slate-400 font-medium">{PREV_YEAR} (N-1)</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{metrique}</span>
      </div>
      <div className="overflow-x-auto">
        <svg width={W} height={H} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const y = PT + chartH * (1 - frac);
            const v = minVal + range * frac;
            return (
              <g key={frac}>
                <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={PL - 4} y={y} textAnchor="end" fontSize="9" fill="#94a3b8" dominantBaseline="middle">{formatVal(v)}</text>
              </g>
            );
          })}

          {/* N-1 dashed line */}
          <path d={buildPath(data.map(d => d.n1))} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5,3" />

          {/* N area */}
          <path
            d={`${buildPath(data.map(d => d.n))} L ${toX(data.length - 1)} ${PT + chartH} L ${toX(0)} ${PT + chartH} Z`}
            fill="url(#evolGrad)" opacity="0.18"
          />
          <path d={buildPath(data.map(d => d.n))} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Gradient */}
          <defs>
            <linearGradient id="evolGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Points + tooltip */}
          {data.map((d, i) => (
            <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'pointer' }}>
              <rect x={toX(i) - 14} y={PT} width="28" height={chartH} fill="transparent" />
              {hov === i && (
                <>
                  <line x1={toX(i)} y1={PT} x2={toX(i)} y2={PT + chartH} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,2" />
                  <rect x={toX(i) - 38} y={toY(d.n) - 28} width="76" height="24" rx="4" fill="#1e293b" />
                  <text x={toX(i)} y={toY(d.n) - 16} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">{formatVal(d.n)}</text>
                </>
              )}
              <circle cx={toX(i)} cy={toY(d.n)} r={hov === i ? 5 : 3.5} fill="#3b82f6" stroke="white" strokeWidth="1.5" />
              <circle cx={toX(i)} cy={toY(d.n1)} r="3" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* X labels */}
              <text x={toX(i)} y={PT + chartH + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Build monthly mock data ───────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function buildMonthlyData(contrats: ContratRow[], metrique: EvolutionMetrique): EvolPoint[] {
  return MONTHS_SHORT.map((month, mi) => {
    // N: current year — interpolate from real contract data
    const seed = (mi + 1) / 12;
    let n = 0, n1 = 0;

    if (metrique === 'budget') {
      const total = contrats.filter(c => c.statut === 'actif').reduce((s, c) => s + c.montant_annuel, 0);
      n  = Math.round((total / 12) * (0.85 + Math.sin(mi * 0.5) * 0.15));
      n1 = Math.round((total / 12) * (0.78 + Math.sin((mi + 1) * 0.5) * 0.12));
    } else if (metrique === 'realisation') {
      const avg = contrats.reduce((s, c) => s + c.taux_realisation, 0) / (contrats.length || 1);
      n  = Math.min(100, Math.round(avg * (0.95 + Math.sin(mi * 0.4) * 0.05)));
      n1 = Math.min(100, Math.round(avg * (0.90 + Math.sin((mi + 1) * 0.4) * 0.05)));
    } else if (metrique === 'reactivity') {
      const avg = contrats.reduce((s, c) => s + c.reactivity_score, 0) / (contrats.length || 1);
      n  = Math.min(100, Math.round(avg * (0.97 + Math.sin(mi * 0.3) * 0.03)));
      n1 = Math.min(100, Math.round(avg * (0.92 + Math.sin((mi + 1) * 0.3) * 0.04)));
    } else {
      const totalNC = contrats.reduce((s, c) => s + c.nb_non_conformites, 0);
      n  = Math.max(0, Math.round((totalNC / 12) + (Math.sin(mi * 0.6) + 1) * 0.8));
      n1 = Math.max(0, Math.round((totalNC / 10) + (Math.sin((mi + 1) * 0.6) + 1) * 1.0));
    }

    return { month, n, n1 };
  });
}

// ─── Build ventilation slices ──────────────────────────────────────────────────

function buildSlices(contrats: ContratRow[], critere: VentilationCritere): Slice[] {
  const map = new Map<string, number>();

  contrats.forEach(c => {
    let key = '';
    if      (critere === 'type')       key = c.type_contrat;
    else if (critere === 'statut')     key = c.statut;
    else if (critere === 'prestataire') key = c.prestataire;
    else if (critere === 'marque_p')   key = c.marque_p;
    else if (critere === 'criticite')  key = c.criticite;
    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, val], i) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      value: val,
      color: PALETTE[i % PALETTE.length],
    }));
}

// ─── Budget donut (by montant) ────────────────────────────────────────────────

function buildBudgetSlices(contrats: ContratRow[], critere: VentilationCritere): Slice[] {
  const map = new Map<string, number>();

  contrats.forEach(c => {
    let key = '';
    if      (critere === 'type')        key = c.type_contrat;
    else if (critere === 'statut')      key = c.statut;
    else if (critere === 'prestataire') key = c.prestataire;
    else if (critere === 'marque_p')    key = c.marque_p;
    else if (critere === 'criticite')   key = c.criticite;
    map.set(key, (map.get(key) ?? 0) + c.montant_annuel);
  });

  const total = [...map.values()].reduce((s, v) => s + v, 0);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, val], i) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      value: Math.round((val / total) * 100),
      color: PALETTE[i % PALETTE.length],
    }));
}

// ─── VENTILATION OPTIONS ───────────────────────────────────────────────────────

const VENTIL_OPTIONS = [
  { value: 'type',        label: 'Par type de contrat' },
  { value: 'statut',      label: 'Par statut'          },
  { value: 'prestataire', label: 'Par prestataire'     },
  { value: 'marque_p',    label: 'Par marque (P1-P6)'  },
  { value: 'criticite',   label: 'Par criticité'       },
] as const;

const EVOL_OPTIONS = [
  { value: 'budget',      label: 'Budget mensuel (€)'        },
  { value: 'realisation', label: 'Taux de réalisation (%)'   },
  { value: 'reactivity',  label: 'Score réactivité (%)'      },
  { value: 'nc',          label: 'Non-conformités (nb)'      },
] as const;

// ─── MTBF / MTTR helpers (simulated) ─────────────────────────────────────────

function computeKpis(contrats: ContratRow[]) {
  const actifs  = contrats.filter(c => c.statut === 'actif');
  const total   = contrats.length;

  const budgetTotal  = contrats.reduce((s, c) => s + c.montant_annuel, 0);
  const coutsTotal   = contrats.reduce((s, c) => s + c.couts_imputes,  0);
  const budgetActif  = actifs.reduce((s, c) => s + c.montant_annuel, 0);

  const avgRealisation = Math.round(actifs.reduce((s, c) => s + c.taux_realisation, 0) / (actifs.length || 1));
  const avgReactivity  = Math.round(actifs.reduce((s, c) => s + c.reactivity_score, 0) / (actifs.length || 1));
  const totalNC        = contrats.reduce((s, c) => s + c.nb_non_conformites, 0);

  const maintenance = actifs.filter(c => c.type_contrat === 'maintenance');
  const exploitation = actifs.filter(c => c.type_contrat === 'exploitation');
  const nbPrev = maintenance.length;
  const nbCur  = actifs.length - nbPrev - exploitation.length;
  const tauxPrev = actifs.length > 0 ? Math.round((nbPrev / actifs.length) * 100) : 0;

  // Simulated MTBF / MTTR based on reactivity scores
  const mtbf = Math.round(365 / Math.max(1, totalNC + 1));
  const mttr = Math.round(100 - avgReactivity / 5); // hours simulated

  // N-1 comparisons (simulated as 95% of current)
  const budgetN1   = Math.round(budgetTotal * 0.91);
  const realisN1   = Math.round(avgRealisation * 0.97);
  const reactN1    = Math.round(avgReactivity * 0.95);
  const ncN1       = Math.round(totalNC * 1.15);

  return {
    total, actifs: actifs.length,
    budgetTotal, budgetActif, coutsTotal,
    avgRealisation, avgReactivity, totalNC,
    tauxPrev, nbPrev, nbCur,
    mtbf, mttr,
    budgetN1, realisN1, reactN1, ncN1,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ContratsDashboard({ contrats }: Props) {
  const [ventilCritere, setVentilCritere] = useState<VentilationCritere>('type');
  const [budgetCritere, setBudgetCritere] = useState<VentilationCritere>('prestataire');
  const [evolMetrique,  setEvolMetrique]  = useState<EvolutionMetrique>('budget');

  const kpis  = useMemo(() => computeKpis(contrats), [contrats]);
  const slicesCount  = useMemo(() => buildSlices(contrats, ventilCritere), [contrats, ventilCritere]);
  const slicesBudget = useMemo(() => buildBudgetSlices(contrats.filter(c => c.statut === 'actif'), budgetCritere), [contrats, budgetCritere]);
  const evolData     = useMemo(() => buildMonthlyData(contrats, evolMetrique), [contrats, evolMetrique]);

  const budgetDelta  = delta(kpis.budgetTotal,    kpis.budgetN1);
  const realisDelta  = delta(kpis.avgRealisation, kpis.realisN1);
  const reactDelta   = delta(kpis.avgReactivity,  kpis.reactN1);
  const ncDelta      = delta(kpis.totalNC,         kpis.ncN1);

  const evolUnit = evolMetrique === 'budget' ? '€' : evolMetrique === 'nc' ? '' : '%';

  return (
    <div className="space-y-4 pb-8">

      {/* ── 1. Indicateurs principaux ─────────────────────────────────────── */}
      <Section title="Indicateurs principaux" subtitle={`Comparaison ${CURRENT_YEAR} / ${PREV_YEAR}`} accentColor="bg-blue-500">

        {/* Row 1: budget + activity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <KpiCard
            label="Budget annuel total" value={fmtCurrency(kpis.budgetTotal)}
            sub={`Coûts imputés : ${fmtCurrency(kpis.coutsTotal)}`}
            icon={Euro} iconCls="text-blue-500" bg="bg-blue-50" border="border-blue-100"
            trend={{ pct: budgetDelta.pct, up: budgetDelta.up, upIsGood: false }}
          />
          <KpiCard
            label="Contrats actifs" value={kpis.actifs}
            sub={`${kpis.total} au total (tous statuts)`}
            icon={CheckCircle2} iconCls="text-emerald-500" bg="bg-emerald-50" border="border-emerald-100"
          />
          <KpiCard
            label="Taux de réalisation" value={fmtPct(kpis.avgRealisation)}
            sub="Moy. contrats actifs"
            icon={BarChart3} iconCls="text-teal-500" bg="bg-teal-50" border="border-teal-100"
            trend={{ pct: realisDelta.pct, up: realisDelta.up, upIsGood: true }}
          />
          <KpiCard
            label="Score réactivité" value={fmtPct(kpis.avgReactivity)}
            sub="Prestataires actifs"
            icon={Activity} iconCls="text-sky-500" bg="bg-sky-50" border="border-sky-100"
            trend={{ pct: reactDelta.pct, up: reactDelta.up, upIsGood: true }}
          />
        </div>

        {/* Row 2: performance & qualité */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KpiCard
            label="Non-conformités" value={kpis.totalNC}
            sub="Tous contrats confondus"
            icon={AlertTriangle} iconCls={kpis.totalNC > 0 ? 'text-orange-500' : 'text-slate-400'}
            bg={kpis.totalNC > 0 ? 'bg-orange-50' : 'bg-slate-50'}
            border={kpis.totalNC > 0 ? 'border-orange-100' : 'border-slate-100'}
            trend={{ pct: ncDelta.pct, up: ncDelta.up, upIsGood: false }}
          />
          <KpiCard
            label="MTBF estimé" value={`${kpis.mtbf}j`}
            sub="Jours entre pannes"
            icon={RefreshCw} iconCls="text-violet-500" bg="bg-violet-50" border="border-violet-100"
          />
          <KpiCard
            label="MTTR estimé" value={`${kpis.mttr}h`}
            sub="Heures moy. résolution"
            icon={Clock} iconCls="text-amber-500" bg="bg-amber-50" border="border-amber-100"
          />
          <KpiCard
            label="Taux préventif" value={fmtPct(kpis.tauxPrev)}
            sub={`${kpis.nbPrev} préventif · ${kpis.nbCur} curatif`}
            icon={Wrench} iconCls="text-indigo-500" bg="bg-indigo-50" border="border-indigo-100"
          />
        </div>

        {/* Performance bars by contract */}
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-600">Performance par contrat — réalisation vs réactivité</p>
          </div>
          <div className="divide-y divide-slate-50">
            {contrats.filter(c => c.statut === 'actif').map(c => (
              <div key={c.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                <span className="text-base flex-shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{c.intitule}</p>
                  <p className="text-[10px] text-slate-400 truncate">{c.prestataire}</p>
                </div>
                <div className="w-36 flex-shrink-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-teal-500 w-14 text-right">Réalisation</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: `${c.taux_realisation}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{c.taux_realisation}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-sky-500 w-14 text-right">Réactivité</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${c.reactivity_score}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{c.reactivity_score}%</span>
                  </div>
                </div>
                {c.nb_non_conformites > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[9px] font-black flex items-center justify-center">
                    {c.nb_non_conformites}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 2. Ventilation ───────────────────────────────────────────────── */}
      <Section title="Ventilation" subtitle="Répartition par critère" accentColor="bg-teal-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Donut: répartition nb contrats */}
          <Donut
            title="Répartition des contrats"
            slices={slicesCount}
            selectOptions={VENTIL_OPTIONS as unknown as { value: string; label: string }[]}
            selected={ventilCritere}
            onSelect={v => setVentilCritere(v as VentilationCritere)}
          />

          {/* Donut: répartition budget */}
          <Donut
            title="Répartition du budget (% montant annuel)"
            slices={slicesBudget}
            selectOptions={VENTIL_OPTIONS as unknown as { value: string; label: string }[]}
            selected={budgetCritere}
            onSelect={v => setBudgetCritere(v as VentilationCritere)}
          />
        </div>

        {/* Mini-bars: budget par type */}
        <div className="mt-4 rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600">Budget par type de contrat</p>
            <span className="text-[10px] text-slate-400">Total : {fmtCurrency(kpis.budgetTotal)}</span>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {(() => {
              const byType = new Map<string, number>();
              contrats.forEach(c => byType.set(c.type_contrat, (byType.get(c.type_contrat) ?? 0) + c.montant_annuel));
              const sorted = [...byType.entries()].sort((a, b) => b[1] - a[1]);
              const max = sorted[0]?.[1] ?? 1;
              return sorted.map(([type, amt], i) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-24 truncate capitalize">{type.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(amt / max) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-20 text-right tabular-nums">{fmtCurrency(amt)}</span>
                  <span className="text-[10px] text-slate-400 w-8 text-right tabular-nums">{kpis.budgetTotal > 0 ? Math.round((amt / kpis.budgetTotal) * 100) : 0}%</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Prestataire comparison */}
        <div className="mt-4 rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-600">Comparaison prestataires — réalisation / réactivité / NC</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Prestataire', 'Contrats', 'Budget', 'Réalisation', 'Réactivité', 'NC'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(() => {
                  const pMap = new Map<string, { count: number; budget: number; real: number[]; react: number[]; nc: number }>();
                  contrats.forEach(c => {
                    const p = pMap.get(c.prestataire) ?? { count: 0, budget: 0, real: [], react: [], nc: 0 };
                    p.count++;
                    p.budget += c.montant_annuel;
                    p.real.push(c.taux_realisation);
                    p.react.push(c.reactivity_score);
                    p.nc += c.nb_non_conformites;
                    pMap.set(c.prestataire, p);
                  });
                  return [...pMap.entries()].sort((a, b) => b[1].budget - a[1].budget).map(([name, d]) => {
                    const avgReal  = Math.round(d.real.reduce((s, v) => s + v, 0) / d.real.length);
                    const avgReact = Math.round(d.react.reduce((s, v) => s + v, 0) / d.react.length);
                    return (
                      <tr key={name} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-slate-700 truncate max-w-32">{name}</td>
                        <td className="px-3 py-2.5 text-slate-500 tabular-nums">{d.count}</td>
                        <td className="px-3 py-2.5 text-slate-700 font-medium tabular-nums">{fmtCurrency(d.budget)}</td>
                        <td className="px-3 py-2.5">
                          <span className={`font-bold tabular-nums ${avgReal >= 95 ? 'text-emerald-600' : avgReal >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{avgReal}%</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`font-bold tabular-nums ${avgReact >= 90 ? 'text-emerald-600' : avgReact >= 75 ? 'text-amber-600' : 'text-red-600'}`}>{avgReact}%</span>
                        </td>
                        <td className="px-3 py-2.5">
                          {d.nc > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">{d.nc}</span>
                          ) : (
                            <span className="text-emerald-500 font-bold">✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── 3. Évolution ─────────────────────────────────────────────────── */}
      <Section title="Évolution" subtitle={`Tendance mensuelle ${CURRENT_YEAR} vs ${PREV_YEAR}`} accentColor="bg-violet-500">

        {/* Metric selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-slate-500">Métrique :</span>
          <div className="flex gap-2 flex-wrap">
            {EVOL_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setEvolMetrique(o.value as EvolutionMetrique)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  evolMetrique === o.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <EvolutionChart data={evolData} metrique={EVOL_OPTIONS.find(o => o.value === evolMetrique)?.label ?? ''} unit={evolUnit} />

        {/* Summary delta strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Budget annuel',    curr: fmtCurrency(kpis.budgetTotal), d: budgetDelta, upIsGood: false },
            { label: 'Taux réalisation', curr: fmtPct(kpis.avgRealisation),   d: realisDelta, upIsGood: true  },
            { label: 'Score réactivité', curr: fmtPct(kpis.avgReactivity),    d: reactDelta,  upIsGood: true  },
            { label: 'Non-conformités',  curr: String(kpis.totalNC),          d: ncDelta,     upIsGood: false },
          ].map(({ label, curr, d, upIsGood }) => {
            const good = d.up === upIsGood;
            return (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">{label}</p>
                <p className="text-lg font-black text-slate-800 leading-none">{curr}</p>
                <div className={`flex items-center gap-1 mt-1 text-[10px] font-semibold ${good ? 'text-emerald-600' : 'text-red-500'}`}>
                  {d.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{d.pct >= 0 ? '+' : ''}{Math.round(d.pct)}% vs {PREV_YEAR}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
