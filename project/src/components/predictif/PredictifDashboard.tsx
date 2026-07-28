import { useState, useMemo } from 'react';
import {
  Zap, AlertTriangle, Users, Package, TrendingUp, Activity,
  ArrowRight, RefreshCw, ChevronRight, Brain, Flame, BarChart3,
  Shield, Wind, Euro, Leaf, Target, CheckCircle2, Clock, ExternalLink,
} from 'lucide-react';
import {
  MOCK_PREDICTIONS, CRITICITE_PRED_CFG, CATEGORIE_PRED_CFG,
  SYNC_SOURCES, RISK_TIMELINE, RISK_COLORS, FINANCIAL_PROJECTION,
  computeKpis, type Prediction,
} from './predictifTypes';

// ─── Mini SVG line chart ──────────────────────────────────────────────────────

function SparkLine({ data, color = '#3b82f6', height = 40 }: {
  data: number[]; color?: string; height?: number;
}) {
  const max = Math.max(...data, 1);
  const w = 120, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - (data[data.length - 1] / max) * (h - 4) - 2}
        r="3" fill={color} />
    </svg>
  );
}

// ─── Multi-risk area chart ────────────────────────────────────────────────────

const RISK_SERIES = [
  { key: 'technique',    label: 'Technique' },
  { key: 'regle',       label: 'Réglementaire' },
  { key: 'rh',          label: 'RH' },
  { key: 'energie',     label: 'Énergie' },
  { key: 'budget',      label: 'Budget' },
  { key: 'utilisateurs',label: 'Utilisateurs' },
  { key: 'carbone',     label: 'Carbone' },
] as const;

function MultiRiskChart({ data }: { data: typeof RISK_TIMELINE }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const W = 780, H = 220, padL = 32, padR = 12, padT = 12, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = 100;

  function toX(i: number) { return padL + (i / (data.length - 1)) * innerW; }
  function toY(v: number) { return padT + innerH - (v / max) * innerH; }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        {RISK_SERIES.map(s => (
          <button key={s.key}
            onMouseEnter={() => setHovered(s.key)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5 text-xs font-medium transition-opacity"
            style={{ opacity: hovered && hovered !== s.key ? 0.35 : 1 }}>
            <span className="w-3 h-1.5 rounded-full" style={{ background: RISK_COLORS[s.key] }} />
            {s.label}
          </button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 4} y={toY(v) + 4} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* Lines */}
        {RISK_SERIES.map(s => {
          const pts = data.map((d, i) => `${toX(i)},${toY((d as any)[s.key])}`).join(' ');
          const isHovered = hovered === s.key;
          return (
            <polyline key={s.key} points={pts} fill="none"
              stroke={RISK_COLORS[s.key]}
              strokeWidth={isHovered ? 2.5 : 1.5}
              strokeLinecap="round" strokeLinejoin="round"
              opacity={hovered && !isHovered ? 0.2 : 1}
              className="transition-all duration-150" />
          );
        })}
        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 4} fontSize="9" fill="#94a3b8" textAnchor="middle">{d.month}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Financial bar chart ──────────────────────────────────────────────────────

function FinancialChart({ data }: { data: typeof FINANCIAL_PROJECTION }) {
  const W = 560, H = 200, padL = 50, padR = 12, padT = 12, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...data.flatMap(d => [d.capex + d.opex + d.energie + d.carbone_cost])) * 1.1;
  const barW = (innerW / data.length) * 0.6;
  const barGap = innerW / data.length;
  const series = [
    { key: 'capex', label: 'CAPEX', color: '#3b82f6' },
    { key: 'opex',  label: 'OPEX',  color: '#10b981' },
    { key: 'energie', label: 'Énergie', color: '#eab308' },
    { key: 'carbone_cost', label: 'Carbone', color: '#84cc16' },
  ] as const;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        {series.map(s => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="w-3 h-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {[0, 150, 300, 450, 600].map(v => (
          <g key={v}>
            <line x1={padL} y1={padT + innerH - (v / max) * innerH} x2={W - padR} y2={padT + innerH - (v / max) * innerH} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 4} y={padT + innerH - (v / max) * innerH + 4} fontSize="9" fill="#94a3b8" textAnchor="end">{v}k€</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * barGap + barGap / 2 - barW / 2;
          let y = padT + innerH;
          return (
            <g key={d.year}>
              {series.map(s => {
                const h = ((d as any)[s.key] / max) * innerH;
                y -= h;
                return <rect key={s.key} x={x} y={y} width={barW} height={h} fill={s.color} rx="1" opacity="0.85" />;
              })}
              <text x={x + barW / 2} y={H - 6} fontSize="10" fill="#64748b" textAnchor="middle">{d.year}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Radar chart ─────────────────────────────────────────────────────────────

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores);
  const n = entries.length;
  const cx = 120, cy = 110, r = 85;
  const MAX = 100;

  function angle(i: number) { return (Math.PI * 2 * i) / n - Math.PI / 2; }
  function point(i: number, v: number) {
    const a = angle(i);
    const rv = (v / MAX) * r;
    return [cx + Math.cos(a) * rv, cy + Math.sin(a) * rv] as [number, number];
  }

  const polygon = entries.map(([, v], i) => point(i, v)).map(p => p.join(',')).join(' ');
  const gridLevels = [25, 50, 75, 100];

  return (
    <svg width="240" height="220" viewBox="0 0 240 220">
      {/* Grid */}
      {gridLevels.map(lvl => (
        <polygon key={lvl}
          points={entries.map((_, i) => point(i, lvl).join(',')).join(' ')}
          fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {/* Axes */}
      {entries.map((_, i) => {
        const [x, y] = point(i, MAX);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      {/* Data */}
      <polygon points={polygon} fill="#3b82f620" stroke="#3b82f6" strokeWidth="2" />
      {/* Dots */}
      {entries.map(([, v], i) => {
        const [x, y] = point(i, v);
        return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
      })}
      {/* Labels */}
      {entries.map(([label, v], i) => {
        const [x, y] = point(i, MAX + 14);
        return (
          <g key={i}>
            <text x={x} y={y} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">{label}</text>
            <text x={x} y={y + 11} textAnchor="middle" fontSize="8" fill="#94a3b8">{v}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Heatmap patrimoine ────────────────────────────────────────────────────────

const HEATMAP_DATA = [
  { nom: 'Cavalier',       score: 88, critiques: 2, cat: 'technique'   },
  { nom: 'Voltaire',       score: 82, critiques: 2, cat: 'reglementaire'},
  { nom: 'Jussieu',        score: 56, critiques: 0, cat: 'energie'      },
  { nom: 'Berges',         score: 71, critiques: 1, cat: 'rh'           },
  { nom: 'Aimé Césaire',   score: 68, critiques: 1, cat: 'technique'   },
  { nom: 'Alice Guy',      score: 42, critiques: 0, cat: 'budget'       },
  { nom: 'André Allix',    score: 35, critiques: 0, cat: 'carbone'      },
  { nom: 'Archimède',      score: 62, critiques: 1, cat: 'logistique'   },
  { nom: 'La Madeleine',   score: 78, critiques: 1, cat: 'assurance'    },
  { nom: 'Les Quais',      score: 44, critiques: 0, cat: 'utilisateurs' },
  { nom: 'Einstein',       score: 58, critiques: 0, cat: 'energie'      },
  { nom: 'Paradin',        score: 90, critiques: 0, cat: 'surveillance'  },
];

function scoreToColor(s: number): string {
  if (s >= 80) return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' } as any;
  if (s >= 65) return { bg: '#fff7ed', text: '#ea580c', border: '#fdba74' } as any;
  if (s >= 45) return { bg: '#fefce8', text: '#ca8a04', border: '#fde047' } as any;
  return { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' } as any;
}

// ─── AI Alert Widget ───────────────────────────────────────────────────────────

function AiAlertWidget({ pred, onAction }: { pred: Prediction; onAction: (p: Prediction) => void }) {
  const critCfg = CRITICITE_PRED_CFG[pred.criticite];
  const catCfg  = CATEGORIE_PRED_CFG[pred.categorie];
  return (
    <div className={`rounded-xl border p-3.5 transition-all hover:shadow-md cursor-pointer ${critCfg.bg} ${critCfg.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{critCfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${catCfg.bg} ${catCfg.color} ${catCfg.border} border`}>
              {catCfg.icon} {catCfg.label}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">{pred.probabilite}% probabilité</span>
          </div>
          <p className={`text-xs font-bold leading-tight ${critCfg.text}`}>{pred.titre}</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{pred.justification_ia}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-400">
              Échéance : <span className="font-semibold text-slate-600">{new Date(pred.date_estimee).toLocaleDateString('fr-FR')}</span>
            </span>
            <button
              onClick={e => { e.stopPropagation(); onAction(pred); }}
              className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Transformer en action <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, bg, border, trend, sparkData }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; bg: string; border: string;
  trend?: 'up' | 'down' | 'flat'; sparkData?: number[];
}) {
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-slate-400';
  const trendIcon  = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 bg-white hover:shadow-md transition-all ${border}`}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
        {sparkData && <SparkLine data={sparkData} color={color.replace('text-', '').includes('#') ? color : undefined} height={32} />}
        {trend && <span className={`text-xs font-bold ${trendColor}`}>{trendIcon}</span>}
      </div>
      <div>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
        <div className="text-xs font-semibold text-slate-600 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Score Gauge ──────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const r = 52, cx = 70, cy = 70;
  const circumference = Math.PI * r;
  const pct = score / 100;
  const dash = pct * circumference;
  const color = score > 70 ? '#ef4444' : score > 45 ? '#f97316' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="90" viewBox="0 0 140 90">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`} />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="900" fill={color}>{score}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="#94a3b8">/100</text>
      </svg>
      <p className="text-xs font-bold text-slate-600 -mt-1">Score prédictif global</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface Props {
  onOpenPrediction: (p: Prediction) => void;
}

export default function PredictifDashboard({ onOpenPrediction }: Props) {
  const [period,   setPeriod]   = useState<'7j' | '30j' | '90j' | '1an' | '5ans'>('30j');
  const [perimetre, setPerimetre] = useState('CROUS Lyon');
  const [syncing,  setSyncing]  = useState(false);

  const preds = MOCK_PREDICTIONS;
  const kpis  = useMemo(() => computeKpis(preds), []);

  const topAlerts = useMemo(() =>
    preds
      .filter(p => p.statut !== 'resolu' && p.statut !== 'ignore')
      .sort((a, b) => (b.score_ia - a.score_ia) || (b.probabilite - a.probabilite))
      .slice(0, 5),
    []
  );

  const radarScores = {
    'Technique':     74,
    'RH':            45,
    'Réglementaire': 68,
    'Énergie':       58,
    'Budget':        52,
    'Carbone':       38,
    'Utilisateurs':  65,
  };

  function handleSync() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1800);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Périmètre */}
          <select value={perimetre} onChange={e => setPerimetre(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40">
            {['CROUS Lyon', 'Campus Centre / Lyon 6', 'Campus La Doua', 'Campus Manufacture'].map(s =>
              <option key={s}>{s}</option>)}
          </select>

          {/* Période */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['7j','30j','90j','1an','5ans'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors
                  ${period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleSync}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-blue-500' : 'text-slate-400'}`} />
              {syncing ? 'Synchro…' : 'Actualiser'}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Brain className="w-3 h-3" />
              Analyser IA
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Target className="w-3 h-3" />
              Simuler scénario
            </button>
          </div>
        </div>

        {/* Sync bandeau */}
        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Sources :</span>
          {SYNC_SOURCES.map(s => (
            <span key={s.key}
              className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border
                ${s.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {s.icon} {s.label}
              <span className="opacity-60">{s.ok ? s.lag : 'KO'}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* ── Row 1: KPI cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard icon={<Zap className="w-5 h-5 text-red-600" />}
            label="Risques techniques" value={kpis.technique}
            sub={`${kpis.critiques} critiques`}
            color="text-red-600" bg="bg-red-50" border="border-red-100"
            trend="up" sparkData={[28,35,42,38,45,52,61]} />
          <KpiCard icon={<Shield className="w-5 h-5 text-emerald-600" />}
            label="Risques réglementaires" value={kpis.reglementaire}
            sub="2 commissions à risque"
            color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100"
            trend="up" sparkData={[18,22,28,31,35,38,44]} />
          <KpiCard icon={<Users className="w-5 h-5 text-violet-600" />}
            label="Risques RH" value={kpis.rh}
            sub="Semaines 28-29 saturées"
            color="text-violet-600" bg="bg-violet-50" border="border-violet-100"
            trend="up" sparkData={[12,15,18,22,20,25,32]} />
          <KpiCard icon={<Package className="w-5 h-5 text-orange-600" />}
            label="Risques logistiques" value={2}
            sub="1 rupture stock imminente"
            color="text-orange-600" bg="bg-orange-50" border="border-orange-100"
            trend="flat" sparkData={[4,3,2,3,2,3,2]} />
          <KpiCard icon={<Zap className="w-5 h-5 text-yellow-600" />}
            label="Risques énergie" value={kpis.energie}
            sub="+34% dérive Jussieu"
            color="text-yellow-600" bg="bg-yellow-50" border="border-yellow-100"
            trend="up" sparkData={[20,28,32,38,32,38,38]} />
          <KpiCard icon={<Activity className="w-5 h-5 text-blue-600" />}
            label="Score prédictif" value={kpis.scorePredictif}
            sub={`${kpis.probMoyenne}% prob. moy.`}
            color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
            trend="up" />
        </div>

        {/* ── Row 2: main charts + alerts ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Multi-risk chart — 2/3 */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Évolution multi-risques</h3>
                <p className="text-xs text-slate-400">Score de risque par famille — 12 mois glissants</p>
              </div>
              <BarChart3 className="w-4 h-4 text-slate-300" />
            </div>
            <MultiRiskChart data={RISK_TIMELINE} />
          </div>

          {/* AI Alerts — 1/3 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  Alertes prioritaires IA
                </h3>
                <p className="text-xs text-slate-400">Top 5 · Triées par score IA</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5">
              {topAlerts.map(p => (
                <AiAlertWidget key={p.id} pred={p} onAction={onOpenPrediction} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Radar + Score + Heatmap ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Radar multi-risques */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center">
            <div className="w-full mb-2">
              <h3 className="text-sm font-bold text-slate-800">Radar risques patrimoine</h3>
              <p className="text-xs text-slate-400">Synthèse multi-dimensions</p>
            </div>
            <RadarChart scores={radarScores} />
          </div>

          {/* Score gauge + breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Score prédictif global</h3>
            <p className="text-xs text-slate-400 mb-4">Indice composite IA — CROUS Lyon</p>
            <ScoreGauge score={kpis.scorePredictif} />
            <div className="mt-4 space-y-2">
              {[
                { label: 'Technique',      score: 74, color: '#3b82f6' },
                { label: 'Réglementaire',  score: 68, color: '#10b981' },
                { label: 'Énergie',        score: 58, color: '#eab308' },
                { label: 'RH',             score: 45, color: '#8b5cf6' },
                { label: 'Budget',         score: 52, color: '#14b8a6' },
              ].map(({ label, score, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-24 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap patrimoine */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Heatmap patrimoine</h3>
            <p className="text-xs text-slate-400 mb-4">Score de risque par résidence</p>
            <div className="grid grid-cols-3 gap-1.5">
              {HEATMAP_DATA.map(d => {
                const c = scoreToColor(d.score) as any;
                return (
                  <div key={d.nom}
                    className="rounded-lg p-2 flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-90 transition-opacity border"
                    style={{ background: c.bg, borderColor: c.border }}>
                    <div className="text-sm font-black" style={{ color: c.text }}>{d.score}</div>
                    <div className="text-[9px] font-semibold text-center leading-tight" style={{ color: c.text }}>
                      {d.nom.replace('Résidence ', '')}
                    </div>
                    {d.critiques > 0 && (
                      <span className="text-[8px] font-bold text-red-600 bg-red-100 px-1 rounded">
                        {d.critiques} crit.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 text-[9px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-200" />Critique</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-200" />Majeur</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-200" />Mineur</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-200" />OK</span>
            </div>
          </div>
        </div>

        {/* ── Row 4: Financial + Satisfaction ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Projection financière */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Euro className="w-4 h-4 text-teal-500" />
                  Projection financière 2024–2029
                </h3>
                <p className="text-xs text-slate-400">CAPEX · OPEX · Énergie · Carbone (k€)</p>
              </div>
            </div>
            <FinancialChart data={FINANCIAL_PROJECTION} />
          </div>

          {/* Impact utilisateurs */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  Impact utilisateurs prévu
                </h3>
                <p className="text-xs text-slate-400">Satisfaction & incidents prédits</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Risque plaintes chauffage', prob: 78, icon: '🔥', color: '#f97316', date: 'hiver 2026' },
                { label: 'Impact satisfaction ascenseur', prob: 81, icon: '🛗', color: '#ef4444', date: 'juil. 2026' },
                { label: 'Pic usage examens', prob: 88, icon: '📚', color: '#8b5cf6', date: '2-20 juin 2026' },
                { label: 'Dégradation confort thermique', prob: 62, icon: '🌡️', color: '#eab308', date: 'août 2026' },
                { label: 'Satisfaction globale -8pts', prob: 71, icon: '📉', color: '#ec4899', date: 'S2 2026' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-slate-700 truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.prob}%`, background: item.color }} />
                      </div>
                      <span className="text-[10px] font-bold w-8 text-right" style={{ color: item.color }}>{item.prob}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Widgets IA */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recommandations IA</p>
              {[
                { text: 'Fenêtre idéale maintenance : 21-28 août (fréquentation -70%)', ok: true },
                { text: 'Renforcer astreinte semaines 23-24 (examens)', ok: false },
                { text: 'Prévenir locataires Cavalier de l\'intervention chaudière', ok: true },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                  {r.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />}
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
