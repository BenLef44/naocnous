import { useState, useMemo } from 'react';
import {
  AlertTriangle, Clock, Wrench, CalendarDays, ShieldAlert, FileText,
  PackageX, Brain, TrendingUp, TrendingDown, Minus, ChevronDown,
  ChevronRight, ArrowRight, Zap, BarChart3, RefreshCw, Flame,
  Building2, MapPin,
} from 'lucide-react';

// ─── Reused chart primitives (matching dashboardCharts.tsx pattern) ──────────

interface PieSlice { label: string; value: number; color: string; }

function formatNum(n: number): string {
  return n >= 1000 ? n.toLocaleString('fr-FR') : String(n);
}

function DonutChart({ slices, title, centerTotal, onSliceClick }: {
  slices: PieSlice[]; title: string; centerTotal?: number;
  onSliceClick?: (label: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const display = centerTotal ?? total;

  const paths = useMemo(() => {
    if (total === 0) return [];
    const cx = 100, cy = 100, r = 72;
    const result: { d: string; color: string; index: number }[] = [];
    let angle = -Math.PI / 2;
    for (let i = 0; i < slices.length; i++) {
      const sl = slices[i];
      if (sl.value === 0) continue;
      const sweep = (sl.value / total) * 2 * Math.PI;
      const end = angle + sweep;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
      result.push({ d: `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} L ${cx} ${cy} Z`, color: sl.color, index: i });
      angle = end;
    }
    return result;
  }, [slices, total]);

  const hoveredSlice = hovered !== null ? slices[hovered] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-3 h-full">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</div>
      <div className="flex justify-center">
        <div className="w-40 h-40">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {paths.map(({ d, color, index }) => (
              <path key={index} d={d} fill={color}
                opacity={hovered !== null && hovered !== index ? 0.3 : 1}
                style={{ transformOrigin: '100px 100px', transform: hovered === index ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.15s ease, opacity 0.15s ease', cursor: onSliceClick ? 'pointer' : 'default' }}
                onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}
                onClick={() => onSliceClick?.(slices[index].label)} />
            ))}
            <circle cx="100" cy="100" r="44" fill="white" />
            {hoveredSlice ? (
              <>
                <text x="100" y="95" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b" dominantBaseline="middle">{formatNum(hoveredSlice.value)}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="9" fill="#94a3b8" dominantBaseline="middle">{hoveredSlice.label.substring(0, 16)}</text>
              </>
            ) : (
              <>
                <text x="100" y="96" textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e293b" dominantBaseline="middle">{formatNum(display)}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="9" fill="#94a3b8" dominantBaseline="middle">total</text>
              </>
            )}
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {slices.map((sl, i) => (
          <div key={i} className="flex items-center gap-1.5 min-w-0 cursor-default"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            onClick={() => onSliceClick?.(sl.label)}>
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: sl.color, opacity: hovered !== null && hovered !== i ? 0.3 : 1 }} />
            <span className={`text-xs truncate flex-1 transition-colors ${hovered === i ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{sl.label}</span>
            <span className={`text-xs font-semibold flex-shrink-0 ml-1 ${hovered === i ? 'text-slate-800' : 'text-slate-400'}`}>{formatNum(sl.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TimePoint { label: string; [key: string]: number | string; }
interface StatutCfg { color: string; label: string; }

function AreaLineChart({ data, configs, title }: {
  data: TimePoint[]; configs: Record<string, StatutCfg>; title: string;
}) {
  const [hovered, setHovered] = useState<{ x: number; i: number } | null>(null);
  const keys = Object.keys(configs);
  const allVals = keys.flatMap(k => data.map(d => (d[k] as number) ?? 0));
  const maxVal = Math.max(...allVals, 1);
  const W = 520, H = 200, pL = 36, pR = 8, pT = 10, pB = 28;
  const iW = W - pL - pR, iH = H - pT - pB;
  const toX = (i: number) => pL + (i / Math.max(1, data.length - 1)) * iW;
  const toY = (v: number) => pT + iH - (v / maxVal) * iH;
  const buildPath = (k: string) => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY((d[k] as number) ?? 0)}`).join(' ');
  const buildArea = (k: string) => `${buildPath(k)} L ${toX(data.length - 1)} ${pT + iH} L ${toX(0)} ${pT + iH} Z`;
  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 h-full flex flex-col gap-2">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}
        onMouseLeave={() => setHovered(null)}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pL} x2={W - pR} y1={toY(v)} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={pL - 4} y={toY(v)} textAnchor="end" fontSize="10" fill="#94a3b8" dominantBaseline="middle">{v}</text>
          </g>
        ))}
        {keys.map(k => <path key={`a-${k}`} d={buildArea(k)} fill={configs[k].color} opacity="0.08" />)}
        {keys.map(k => <path key={`l-${k}`} d={buildPath(k)} fill="none" stroke={configs[k].color} strokeWidth="2" strokeLinejoin="round" />)}
        {data.map((_, i) => (
          <rect key={i} x={toX(i) - 10} y={pT} width="20" height={iH} fill="transparent" style={{ cursor: 'crosshair' }}
            onMouseEnter={() => setHovered({ x: toX(i), i })} />
        ))}
        {hovered && (
          <>
            <line x1={hovered.x} x2={hovered.x} y1={pT} y2={pT + iH} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />
            {keys.map(k => <circle key={k} cx={hovered.x} cy={toY((data[hovered.i][k] as number) ?? 0)} r="3.5" fill={configs[k].color} stroke="white" strokeWidth="1.5" />)}
            <rect x={Math.min(hovered.x + 6, W - 88)} y={pT} width="82" height={14 + keys.length * 13} rx="4" fill="white" stroke="#e2e8f0" />
            <text x={Math.min(hovered.x + 11, W - 83)} y={pT + 9} fontSize="10" fill="#475569" fontWeight="600">{data[hovered.i].label}</text>
            {keys.map((k, ki) => (
              <text key={k} x={Math.min(hovered.x + 11, W - 83)} y={pT + 20 + ki * 13} fontSize="10" fill={configs[k].color} fontWeight="700">
                {configs[k].label}: {(data[hovered.i][k] as number) ?? 0}
              </text>
            ))}
          </>
        )}
        {data.map((d, i) => <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>)}
      </svg>
      <div className="flex items-center gap-4 flex-wrap">
        {keys.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full" style={{ background: configs[k].color }} />
            <span className="text-[11px] text-slate-500">{configs[k].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedBarChart({ data, configs, title }: {
  data: TimePoint[]; configs: Record<string, StatutCfg>; title: string;
}) {
  const keys = Object.keys(configs);
  const totals = data.map(d => keys.reduce((s, k) => s + ((d[k] as number) ?? 0), 0));
  const maxVal = Math.max(...totals, 1);
  const W = 520, H = 180, pL = 40, pR = 8, pT = 10, pB = 28;
  const iW = W - pL - pR, iH = H - pT - pB;
  const barW = Math.max(8, iW / data.length * 0.55);
  const gap  = iW / data.length;
  const toY = (v: number) => pT + iH - (v / maxVal) * iH;
  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 h-full flex flex-col gap-2">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pL} x2={W - pR} y1={toY(v)} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={pL - 4} y={toY(v)} textAnchor="end" fontSize="10" fill="#94a3b8" dominantBaseline="middle">{v}</text>
          </g>
        ))}
        {data.map((d, i) => {
          let cum = 0;
          const x = pL + i * gap + gap / 2 - barW / 2;
          return (
            <g key={i}>
              {keys.map(k => {
                const val = (d[k] as number) ?? 0;
                const h = Math.max(0, (val / maxVal) * iH);
                const y = toY(cum + val);
                cum += val;
                return <rect key={k} x={x} y={y} width={barW} height={h} fill={configs[k].color} rx="1" opacity="0.85" />;
              })}
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 flex-wrap">
        {keys.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: configs[k].color }} />
            <span className="text-[11px] text-slate-500">{configs[k].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccordionSection({ title, subtitle, accentColor, defaultOpen = true, children }: {
  title: string; subtitle?: string; accentColor: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors group">
        <div className="flex items-center gap-3">
          <span className={`w-1 h-8 rounded-full ${accentColor}`} />
          <div className="text-left">
            <div className="text-sm font-bold text-slate-800">{title}</div>
            {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${open ? 'bg-slate-100' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
          {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Static demo data ─────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const seed = (base: number, spread: number, offset: number) =>
  Math.round(base + Math.sin(offset * 1.7) * spread + Math.cos(offset * 0.9) * spread * 0.4);

const INTERVENTIONS_TREND: TimePoint[] = MONTHS_SHORT.map((label, i) => ({
  label,
  crées:     seed(95, 25, i),
  réalisées: seed(78, 22, i + 1),
  retard:    seed(12, 6,  i + 2),
}));

const DEPENSES_TREND: TimePoint[] = MONTHS_SHORT.map((label, i) => ({
  label,
  maintenance:   seed(22, 5, i),
  contrats:      seed(14, 3, i + 1),
  reglementaire: seed(6,  2, i + 2),
  achats:        seed(7,  3, i + 3),
}));

const NC_TREND: TimePoint[] = MONTHS_SHORT.map((label, i) => ({
  label,
  détectées: seed(8, 4, i),
  clôturées: seed(6, 4, i + 2),
}));

const SITES    = ['Tous les sites', 'Campus Centre Lyon 6', 'Campus Manufacture des Tabacs', 'Campus Nord'];
const PERIODES = ['Ce mois', '3 derniers mois', '6 derniers mois', 'Cette année'];

// ─── Dashboard ────────────────────────────────────────────────────────────────

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [site, setSite]       = useState('Tous les sites');
  const [periode, setPeriode] = useState('Ce mois');

  const nav = (view: string) => onNavigate?.(view);

  const kpis = [
    { icon: Flame,        label: 'Alertes critiques',        value: 12, sub: '+3 vs hier',           color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-100',     trend: 'up',   view: 'interventions'      },
    { icon: Clock,        label: 'Actions en retard',         value: 34, sub: '−5 vs hier',           color: 'text-orange-600',  bg: 'bg-orange-50',   border: 'border-orange-100',  trend: 'down', view: 'interventions'      },
    { icon: Wrench,       label: 'Interventions en cours',    value: 78, sub: '16 non affectées',     color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-100',    trend: 'none', view: 'interventions'      },
    { icon: CalendarDays, label: 'Échéances à 30j',           value: 47, sub: 'Contrôles, contrats, MP', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100',  trend: 'up',   view: 'reglementaire'      },
    { icon: ShieldAlert,  label: 'Non-conformités ouvertes',  value: 18, sub: '4 critiques',          color: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-100',   trend: 'down', view: 'reglementaire'      },
    { icon: FileText,     label: 'Contrats à renouveler',     value: 9,  sub: 'à 90 jours',           color: 'text-teal-600',    bg: 'bg-teal-50',     border: 'border-teal-100',    trend: 'none', view: 'contrats'           },
    { icon: PackageX,     label: 'Risques appro.',            value: 6,  sub: '3 ruptures stock',     color: 'text-rose-600',    bg: 'bg-rose-50',     border: 'border-rose-100',    trend: 'up',   view: 'approvisionnements' },
    { icon: Brain,        label: 'Suggestions IA',            value: 14, sub: '5 prioritaires',       color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-100', trend: 'none', view: 'predictif'          },
  ] as const;

  const critiques = [
    { id: 'a1', label: 'DI-2026-097 — Ascenseur bloqué résidence Cavalier',  module: 'Interventions',  since: 'depuis 8h',    view: 'interventions' },
    { id: 'a2', label: 'Contrôle SSI échu — Résidence Les Quais J+3',        module: 'Réglementaire',  since: 'échu il y a 3j', view: 'reglementaire' },
    { id: 'a3', label: 'Armoire froide Resto\'U — Température hors seuil',   module: 'Équipements',    since: 'depuis 2h',    view: 'interventions' },
  ];
  const retards = [
    { id: 'r1', label: '12 interventions en retard (> 48h)',   view: 'interventions' },
    { id: 'r2', label: '5 contrôles réglementaires en retard', view: 'reglementaire' },
    { id: 'r3', label: '3 plans préventifs non réalisés',       view: 'interventions' },
  ];
  const ncIssues = [
    { id: 'nc1', label: '4 non-conformités critiques (ERP)',    view: 'reglementaire' },
    { id: 'nc2', label: '14 non-conformités majeures ouvertes', view: 'reglementaire' },
  ];
  const contratAlerts = [
    { id: 'c1', label: 'Contrat CVC — expire dans 28j',      view: 'contrats' },
    { id: 'c2', label: 'Contrat ascenseurs — expire dans 45j', view: 'contrats' },
    { id: 'c3', label: 'Contrat incendie — expiré',           view: 'contrats' },
  ];
  const approAlerts = [
    { id: 'ap1', label: 'Filtre G4 600×400mm — rupture stock',         view: 'approvisionnements' },
    { id: 'ap2', label: '3 commandes bloquées faute de validation',     view: 'approvisionnements' },
  ];

  const donutTypeInterv: PieSlice[] = [
    { label: 'Préventive',    value: 312, color: '#3b82f6' },
    { label: 'Corrective',    value: 189, color: '#f97316' },
    { label: 'Réglementaire', value: 87,  color: '#8b5cf6' },
    { label: 'Urgente',       value: 34,  color: '#ef4444' },
  ];
  const donutStatutInterv: PieSlice[] = [
    { label: 'Planifiées', value: 128, color: '#64748b' },
    { label: 'En cours',   value: 78,  color: '#3b82f6' },
    { label: 'Terminées',  value: 312, color: '#10b981' },
    { label: 'En retard',  value: 34,  color: '#f97316' },
    { label: 'Annulées',   value: 12,  color: '#94a3b8' },
  ];
  const donutPatrimoine: PieSlice[] = [
    { label: 'Bon état',     value: 612, color: '#10b981' },
    { label: 'À surveiller', value: 148, color: '#f59e0b' },
    { label: 'Dégradé',      value: 67,  color: '#f97316' },
    { label: 'Critique',     value: 23,  color: '#ef4444' },
  ];
  const donutDepenses: PieSlice[] = [
    { label: 'Maintenance',        value: 124, color: '#3b82f6' },
    { label: 'Réglementaire',      value: 42,  color: '#8b5cf6' },
    { label: 'Contrats',           value: 87,  color: '#06b6d4' },
    { label: 'Approvisionnements', value: 31,  color: '#f59e0b' },
    { label: 'Renouvellements',    value: 56,  color: '#10b981' },
  ];

  const aiRecs = [
    { icon: AlertTriangle, color: 'text-red-600 bg-red-50',       text: '3 ascenseurs présentent un risque de panne élevé d\'ici 30 jours selon l\'analyse prédictive.', view: 'predictif'          },
    { icon: RefreshCw,     color: 'text-blue-600 bg-blue-50',     text: 'Regrouper 12 interventions sur le Campus Nord permettrait d\'économiser ~8 déplacements.',      view: 'interventions'      },
    { icon: FileText,      color: 'text-amber-600 bg-amber-50',   text: 'Contrat chauffage à renouveler dans 60 jours — délai administratif moyen : 45 jours.',          view: 'contrats'           },
    { icon: PackageX,      color: 'text-rose-600 bg-rose-50',     text: 'Risque de rupture stock sur filtres CTA en septembre si aucune commande d\'ici 15 jours.',      view: 'approvisionnements' },
    { icon: CalendarDays,  color: 'text-violet-600 bg-violet-50', text: '5 contrôles réglementaires à planifier avant le 30 juin pour rester conforme.',                 view: 'reglementaire'      },
    { icon: BarChart3,     color: 'text-emerald-600 bg-emerald-50', text: 'Budget maintenance préventive à +12% vs N−1. Décaler 3 maintenances d\'octobre réduirait l\'écart.', view: 'finance'   },
    { icon: Building2,     color: 'text-teal-600 bg-teal-50',     text: '2 équipements résidence Cavalier à remplacer avant fin d\'année (score vétusté > 85%).',        view: 'ppi'                },
  ];

  const TREND: Record<string, React.ReactNode> = {
    up:   <TrendingUp   className="w-3 h-3 text-red-400" />,
    down: <TrendingDown className="w-3 h-3 text-emerald-400" />,
    none: <Minus        className="w-3 h-3 text-slate-300" />,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50" style={{ scrollbarWidth: 'thin' }}>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-2.5 flex items-center gap-3 flex-wrap shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-500 mr-1">Filtres :</span>
        {([
          { label: 'Site',    value: site,    opts: SITES,    set: setSite    },
          { label: 'Période', value: periode, opts: PERIODES, set: setPeriode },
        ] as const).map(f => (
          <div key={f.label} className="relative">
            <select value={f.value} onChange={e => (f.set as (v: string) => void)(e.target.value)}
              className="appearance-none text-xs font-medium border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 hover:border-slate-300 transition-colors">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Données en temps réel
        </div>
      </div>

      <div className="px-6 py-5 space-y-5 max-w-[1400px] mx-auto">

        {/* ── Zone 1 — Alertes prioritaires ────────────────────────────── */}
        <AccordionSection title="Alertes prioritaires" subtitle="Actions requises immédiatement" accentColor="bg-red-500" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

            {/* Critiques */}
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
              <div className="flex items-center gap-2 mb-2.5">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Critiques</span>
                <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{critiques.length}</span>
              </div>
              <div className="space-y-1.5">
                {critiques.map(a => (
                  <button key={a.id} onClick={() => nav(a.view)}
                    className="w-full text-left flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white border border-red-100 hover:border-red-300 hover:bg-red-50 transition-all group">
                    <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{a.label}</p>
                      <p className="text-[10px] text-slate-400">{a.module} · {a.since}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-red-300 group-hover:text-red-500 flex-shrink-0 mt-0.5 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Retards + NC */}
            <div className="space-y-3">
              <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Retards</span>
                </div>
                <div className="space-y-1">
                  {retards.map(r => (
                    <button key={r.id} onClick={() => nav(r.view)}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-orange-100 hover:border-orange-300 transition-all group">
                      <span className="text-xs text-slate-700">{r.label}</span>
                      <ArrowRight className="w-3 h-3 text-orange-300 group-hover:text-orange-500 flex-shrink-0 ml-2 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Non-conformités</span>
                </div>
                <div className="space-y-1">
                  {ncIssues.map(nc => (
                    <button key={nc.id} onClick={() => nav(nc.view)}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-amber-100 hover:border-amber-300 transition-all group">
                      <span className="text-xs text-slate-700">{nc.label}</span>
                      <ArrowRight className="w-3 h-3 text-amber-300 group-hover:text-amber-500 flex-shrink-0 ml-2 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contrats + Appro */}
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">Contrats</span>
                </div>
                <div className="space-y-1">
                  {contratAlerts.map(c => (
                    <button key={c.id} onClick={() => nav(c.view)}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-violet-100 hover:border-violet-300 transition-all group">
                      <span className="text-xs text-slate-700">{c.label}</span>
                      <ArrowRight className="w-3 h-3 text-violet-300 group-hover:text-violet-500 flex-shrink-0 ml-2 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <PackageX className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Approvisionnements</span>
                </div>
                <div className="space-y-1">
                  {approAlerts.map(a => (
                    <button key={a.id} onClick={() => nav(a.view)}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-rose-100 hover:border-rose-300 transition-all group">
                      <span className="text-xs text-slate-700">{a.label}</span>
                      <ArrowRight className="w-3 h-3 text-rose-300 group-hover:text-rose-500 flex-shrink-0 ml-2 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* ── Zone 2 — KPI ──────────────────────────────────────────────── */}
        <AccordionSection title="Chiffres clés" subtitle="Vue instantanée des indicateurs stratégiques" accentColor="bg-blue-500" defaultOpen>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {kpis.map(k => (
              <button key={k.label} onClick={() => nav(k.view)}
                className={`rounded-xl border p-3.5 flex flex-col gap-2 text-left hover:shadow-md transition-all hover:-translate-y-0.5 ${k.bg} ${k.border}`}>
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`} style={{ filter: 'brightness(0.88)' }}>
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                  </div>
                  {TREND[k.trend]}
                </div>
                <div>
                  <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
                  <p className="text-[11px] font-semibold text-slate-600 leading-tight mt-0.5">{k.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </AccordionSection>

        {/* ── Zone 3 — Ventilation ─────────────────────────────────────── */}
        <AccordionSection title="Ventilation" subtitle="Répartitions par catégorie" accentColor="bg-violet-500" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DonutChart title="Types d'interventions"  slices={donutTypeInterv}   onSliceClick={() => nav('interventions')} />
            <DonutChart title="Statuts des interventions" slices={donutStatutInterv} onSliceClick={() => nav('interventions')} />
            <DonutChart title="État du patrimoine"     slices={donutPatrimoine}   onSliceClick={() => nav('equipements')} />
            <DonutChart title="Répartition des dépenses (k€)" slices={donutDepenses} centerTotal={340} onSliceClick={() => nav('finance')} />
          </div>
        </AccordionSection>

        {/* ── Zone 4 — Évolutions ───────────────────────────────────────── */}
        <AccordionSection title="Évolutions" subtitle="Tendances sur 12 mois" accentColor="bg-emerald-500" defaultOpen>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <AreaLineChart title="Évolution des interventions" data={INTERVENTIONS_TREND}
              configs={{
                crées:     { color: '#64748b', label: 'Créées'    },
                réalisées: { color: '#3b82f6', label: 'Réalisées' },
                retard:    { color: '#f97316', label: 'En retard' },
              }} />
            <StackedBarChart title="Dépenses mensuelles (k€)" data={DEPENSES_TREND}
              configs={{
                maintenance:   { color: '#3b82f6', label: 'Maintenance'   },
                contrats:      { color: '#06b6d4', label: 'Contrats'      },
                reglementaire: { color: '#8b5cf6', label: 'Réglementaire' },
                achats:        { color: '#f59e0b', label: 'Achats'        },
              }} />
            <AreaLineChart title="Évolution des non-conformités" data={NC_TREND}
              configs={{
                détectées: { color: '#ef4444', label: 'Détectées' },
                clôturées: { color: '#10b981', label: 'Clôturées' },
              }} />
          </div>
        </AccordionSection>

        {/* ── Zone 5 — Assistant IA ─────────────────────────────────────── */}
        <AccordionSection title="Assistant IA" subtitle={`${aiRecs.length} recommandations générées`} accentColor="bg-emerald-400" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {aiRecs.map((rec, i) => (
              <button key={i} onClick={() => nav(rec.view)}
                className="text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border border-slate-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.color}`}>
                  <rec.icon className="w-4 h-4" />
                </div>
                <p className="flex-1 text-xs text-slate-700 leading-relaxed">{rec.text}</p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5 transition-colors" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[11px] text-slate-400">Recommandations générées par analyse prédictive · Mise à jour quotidienne</p>
          </div>
        </AccordionSection>

      </div>
    </div>
  );
}
