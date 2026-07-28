import { useState, useMemo } from 'react';
import {
  Building2, Home, Users, FileText, Clock, AlertTriangle, Euro,
  TrendingUp, TrendingDown, Calendar, CheckCircle2, ChevronDown, ChevronRight,
} from 'lucide-react';
import type { Bail } from './locatifTypes';
import { STATUT_BAIL_CFG } from './locatifTypes';
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Section accordion ────────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true, accent = 'bg-blue-500' }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <span className={`w-1 h-5 rounded-full flex-shrink-0 ${accent}`} />
        <span className="flex-1 text-sm font-semibold text-slate-800">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
interface KpiProps {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconCls: string; bg: string; border: string;
  trend?: { pct: number; upIsGood?: boolean };
}
function KpiCard({ label, value, sub, icon: Icon, iconCls, bg, border, trend }: KpiProps) {
  const up = trend && trend.pct >= 0;
  const good = trend ? (up === (trend.upIsGood ?? true)) : true;
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 flex items-start gap-3 min-w-0`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
        <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1 leading-none">{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${good ? 'text-emerald-600' : 'text-red-500'}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.pct >= 0 ? '+' : ''}{Math.round(trend.pct)}% vs N-1</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SVG Donut ────────────────────────────────────────────────────────────────
interface DonutSlice { label: string; value: number; color: string; }
function Donut({ slices, title }: { slices: DonutSlice[]; title: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 56, r = 36, cx = 70, cy = 70;

  let angle = -90;
  const paths = slices.map((s, i) => {
    const pct = total ? s.value / total : 0;
    const sweep = pct * 360;
    const a1 = (angle * Math.PI) / 180;
    const a2 = ((angle + sweep) * Math.PI) / 180;
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    const xi1 = cx + r * Math.cos(a1), yi1 = cy + r * Math.sin(a1);
    const xi2 = cx + r * Math.cos(a2), yi2 = cy + r * Math.sin(a2);
    const large = sweep > 180 ? 1 : 0;
    const d = `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${r},${r} 0 ${large},0 ${xi1},${yi1} Z`;
    const result = { d, color: s.color, i };
    angle += sweep;
    return result;
  });

  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-slate-600">{title}</p>
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {paths.map(p => (
            <path
              key={p.i} d={p.d} fill={p.color}
              style={{ transform: hovered === p.i ? `scale(1.04)` : 'scale(1)', transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.15s ease' }}
              onMouseEnter={() => setHovered(p.i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            />
          ))}
          <circle cx={cx} cy={cy} r={r - 2} fill="white" />
          {hov ? (
            <>
              <text x={cx} y={cy - 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e293b">{hov.value}</text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#64748b">{total ? Math.round(hov.value / total * 100) : 0}%</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e293b">{total}</text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#64748b">total</text>
            </>
          )}
        </svg>
      </div>
      <div className="flex flex-col gap-1 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="flex-1 text-slate-600 truncate">{s.label}</span>
            <span className="font-semibold text-slate-700">{s.value}</span>
            <span className="text-slate-400 w-8 text-right">{total ? Math.round(s.value / total * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Evolution chart (12 months) ─────────────────────────────────────────────
function TauxEvolutionChart({ data }: { data: { mois: string; taux: number }[] }) {
  const W = 460, H = 160, pad = { top: 16, right: 16, bottom: 32, left: 36 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const min = 80, max = 100;
  const xs = data.map((_, i) => pad.left + (i / (data.length - 1)) * innerW);
  const ys = data.map(d => pad.top + innerH - ((d.taux - min) / (max - min)) * innerH);
  const pts = data.map((d, i) => `${xs[i]},${ys[i]}`).join(' ');
  const area = `M${xs[0]},${H - pad.bottom} L${pts.split(' ').map((p, i) => (i === 0 ? '' : '')).join('')}${pts} L${xs[xs.length - 1]},${H - pad.bottom} Z`;
  const areaPath = `M${xs[0]},${H - pad.bottom} L${data.map((d, i) => `${xs[i]},${ys[i]}`).join(' L')} L${xs[xs.length - 1]},${H - pad.bottom} Z`;
  const [hov, setHov] = useState<number | null>(null);
  const gradId = 'locEvol';
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[84, 88, 92, 96, 100].map(v => {
        const y = pad.top + innerH - ((v - min) / (max - min)) * innerH;
        return (
          <g key={v}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="0.8" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}%</text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r={hov === i ? 5 : 3.5} fill={hov === i ? '#3b82f6' : '#fff'} stroke="#3b82f6" strokeWidth="2"
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'pointer' }} />
          <text x={xs[i]} y={H - pad.bottom + 14} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{d.mois}</text>
          {hov === i && (
            <g>
              <rect x={xs[i] - 22} y={ys[i] - 24} width={44} height={18} rx="4" fill="#1e293b" />
              <text x={xs[i]} y={ys[i] - 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="white">{d.taux.toFixed(1)}%</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── Histogramme par résidence ────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex flex-col gap-2 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 w-36 truncate text-right flex-shrink-0">{d.label}</span>
          <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 w-8 text-right flex-shrink-0">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  baux: Bail[];
  onCreateBail?: () => void;
  onViewBail?: (b: Bail) => void;
}

const MOIS_LABELS = ['Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
const TAUX_EVOL = [92.1, 91.8, 92.4, 93.0, 93.2, 92.9, 93.1, 93.4, 93.5, 93.3, 93.4, 93.4];

const EVENEMENTS_MOCK = [
  { date: '2026-07-05', logement: 'A104', locataire: 'Dupont Marie',    evenement: 'Fin de bail',          priorite: 'orange' },
  { date: '2026-07-08', logement: 'B212', locataire: 'Robert Maxime',  evenement: 'Entrée',               priorite: 'vert'   },
  { date: '2026-07-10', logement: 'C315', locataire: 'Leroy Antoine',   evenement: 'État des lieux',        priorite: 'bleu'   },
  { date: '2026-07-15', logement: 'A012', locataire: 'Lambert Lea',     evenement: 'Signature',            priorite: 'violet' },
  { date: '2026-07-18', logement: 'B108', locataire: 'Bonnet Hugo',     evenement: 'Fin de bail',          priorite: 'orange' },
  { date: '2026-07-22', logement: 'C220', locataire: 'Girard Alice',    evenement: 'Renouvellement',       priorite: 'bleu'   },
  { date: '2026-08-01', logement: 'A302', locataire: 'Simon Lucas',     evenement: 'Révision loyer (IRL)', priorite: 'violet' },
];

const PRIORITE_CFG: Record<string, { bg: string; text: string }> = {
  orange: { bg: 'bg-amber-50',    text: 'text-amber-700'   },
  vert:   { bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  bleu:   { bg: 'bg-blue-50',     text: 'text-blue-700'    },
  violet: { bg: 'bg-violet-50',   text: 'text-violet-700'  },
  rouge:  { bg: 'bg-red-50',      text: 'text-red-700'     },
};

export default function BauxDashboard({ baux, onViewBail }: Props) {
  const today = new Date();

  const stats = useMemo(() => {
    const actifs    = baux.filter(b => b.statut === 'actif').length;
    const expBientot= baux.filter(b => b.statut === 'expire_bientot').length;
    const expires   = baux.filter(b => b.statut === 'expire').length;
    const totalLoyer= baux.filter(b => b.statut === 'actif').reduce((s, b) => s + b.loyer_mensuel + b.charges, 0);
    const logements = 2486;
    const occupes   = 2321;
    const vacants   = logements - occupes;
    const tauxOcc   = (occupes / logements * 100).toFixed(1);
    return { actifs, expBientot, expires, totalLoyer, logements, occupes, vacants, tauxOcc };
  }, [baux]);

  const statutSlices = [
    { label: 'Actifs',          value: baux.filter(b => b.statut === 'actif').length,          color: '#10b981' },
    { label: 'Expire bientôt',  value: baux.filter(b => b.statut === 'expire_bientot').length, color: '#f59e0b' },
    { label: 'Expirés',         value: baux.filter(b => b.statut === 'expire').length,          color: '#ef4444' },
    { label: 'En signature',    value: baux.filter(b => b.statut === 'en_signature').length,    color: '#3b82f6' },
    { label: 'Résiliés',        value: baux.filter(b => b.statut === 'resilie').length,         color: '#94a3b8' },
  ].filter(s => s.value > 0);

  const typeSlices = [
    { label: 'Location',    value: baux.filter(b => b.type_bail === 'location').length,   color: '#3b82f6' },
    { label: 'Convention',  value: baux.filter(b => b.type_bail === 'convention').length, color: '#14b8a6' },
    { label: 'Commercial',  value: baux.filter(b => b.type_bail === 'commercial').length, color: '#8b5cf6' },
    { label: 'Temporaire',  value: baux.filter(b => b.type_bail === 'temporaire').length, color: '#f97316' },
    { label: 'Autre',       value: baux.filter(b => b.type_bail === 'autre').length,      color: '#94a3b8' },
  ].filter(s => s.value > 0);

  const occupSlices = [
    { label: 'Occupés',       value: 2321, color: '#10b981' },
    { label: 'Vacants',       value: 121,  color: '#94a3b8' },
    { label: 'En travaux',    value: 32,   color: '#f97316' },
    { label: 'Réservés',      value: 12,   color: '#3b82f6' },
  ];

  const barData = [
    { label: 'Rés. Jacques Cavalier', value: 412 },
    { label: 'Rés. Campus Centre',    value: 326 },
    { label: 'Rés. Campus Manu.',     value: 289 },
    { label: 'Rés. Jussieu',          value: 241 },
    { label: 'Rés. Einstein',         value: 198 },
    { label: 'Rés. Archimède',        value: 187 },
  ];

  const evoData = MOIS_LABELS.map((mois, i) => ({ mois, taux: TAUX_EVOL[i] }));

  const alertes = [
    { level: 'error',   msg: '10 logements vacants depuis plus de 60 jours' },
    { level: 'warning', msg: '5 baux sans assurance locataire' },
    { level: 'error',   msg: '2 loyers impayés ce mois' },
    { level: 'warning', msg: '8 états des lieux à planifier' },
    { level: 'warning', msg: `${stats.expBientot} baux arrivent à échéance dans 30 jours` },
    { level: 'info',    msg: '3 dossiers en attente de signature électronique' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>

      {/* Section 1 — KPIs */}
      <Section title="Indicateurs principaux" accent="bg-blue-500">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mt-2">
          <KpiCard label="Logements"    value={stats.logements.toLocaleString('fr-FR')} icon={Building2} iconCls="bg-blue-100 text-blue-600"   bg="bg-blue-50/50"    border="border-blue-100"   />
          <KpiCard label="Occupés"      value={stats.occupes.toLocaleString('fr-FR')}   sub={`${stats.tauxOcc}%`} icon={Home} iconCls="bg-emerald-100 text-emerald-600" bg="bg-emerald-50/50" border="border-emerald-100" trend={{ pct: 1.2 }} />
          <KpiCard label="Vacants"      value={stats.vacants}    icon={Home}         iconCls="bg-slate-200 text-slate-500"   bg="bg-white"         border="border-slate-100"  />
          <KpiCard label="Baux actifs"  value={stats.actifs}     icon={FileText}     iconCls="bg-teal-100 text-teal-600"     bg="bg-teal-50/50"    border="border-teal-100"   />
          <KpiCard label="Expirent < 30j" value={stats.expBientot} icon={Clock}      iconCls="bg-amber-100 text-amber-600"   bg="bg-amber-50/50"   border="border-amber-100"  />
          <KpiCard label="Baux expirés" value={stats.expires}    icon={AlertTriangle} iconCls="bg-red-100 text-red-600"      bg="bg-red-50/50"     border="border-red-100"    />
          <KpiCard label="Loyers / mois" value={`${Math.round(stats.totalLoyer / 1000)}k €`} icon={Euro} iconCls="bg-violet-100 text-violet-600" bg="bg-violet-50/50" border="border-violet-100" trend={{ pct: 2.4 }} />
        </div>
      </Section>

      {/* Section 2 — Graphiques */}
      <Section title="Ventilation du parc" accent="bg-teal-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <Donut slices={occupSlices}  title="Taux d'occupation" />
          <Donut slices={statutSlices} title="Répartition des statuts" />
          <Donut slices={typeSlices}   title="Types de baux" />
        </div>
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 mb-1">Répartition des logements par résidence</p>
          <BarChart data={barData} />
        </div>
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 mb-3">Évolution du taux d'occupation — 12 derniers mois</p>
          <TauxEvolutionChart data={evoData} />
        </div>
      </Section>

      {/* Section 3 — Événements & Alertes */}
      <Section title="Prochains événements & alertes" accent="bg-amber-500">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mt-3">

          {/* Événements */}
          <div className="xl:col-span-3">
            <p className="text-xs font-semibold text-slate-600 mb-3">Calendrier des prochaines échéances</p>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-500">Date</th>
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-500">Logement</th>
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-500">Locataire</th>
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-500">Événement</th>
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-500">Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  {EVENEMENTS_MOCK.map((e, i) => {
                    const cfg = PRIORITE_CFG[e.priorite] ?? PRIORITE_CFG.bleu;
                    const date = parseISO(e.date);
                    const diff = differenceInDays(date, today);
                    return (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-700">
                          {format(date, 'dd/MM', { locale: fr })}
                          <span className="ml-1 text-[10px] text-slate-400">J+{diff}</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">{e.logement}</td>
                        <td className="py-2 px-3 text-slate-600">{e.locataire}</td>
                        <td className="py-2 px-3 text-slate-700">{e.evenement}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold capitalize ${cfg.bg} ${cfg.text}`}>
                            {e.priorite}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertes */}
          <div className="xl:col-span-2">
            <p className="text-xs font-semibold text-slate-600 mb-3">Alertes actives</p>
            <div className="space-y-2">
              {alertes.map((a, i) => {
                const cls = a.level === 'error'
                  ? { bg: 'bg-red-50',   border: 'border-red-100',   dot: 'bg-red-500',   text: 'text-red-700' }
                  : a.level === 'warning'
                  ? { bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500', text: 'text-amber-700' }
                  : { bg: 'bg-blue-50',  border: 'border-blue-100',  dot: 'bg-blue-500',  text: 'text-blue-700' };
                return (
                  <div key={i} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${cls.bg} ${cls.border}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${cls.dot}`} />
                    <p className={`text-xs font-medium ${cls.text}`}>{a.msg}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
