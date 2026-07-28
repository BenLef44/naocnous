import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, Timer, ArrowRight, Phone, Mail, ChevronDown, ChevronRight as ChevronRightIcon, TrendingUp, TrendingDown, Minus, Building2, Briefcase, Wrench, Filter } from 'lucide-react';
import type { DemandeParsed, StatutDI, CriticiteDI } from './interventionsTypes';
import { CRITICITE_CFG, STATUT_DI_CFG, fmtDateRelative } from './interventionsTypes';
import logoMyResidence from '../../assets/logo-crous-lyon-resize.png';
import {
  CATEGORIE_DATA, RESIDENCE_INT_DATA, AGENT_INT_DATA, PRESTATAIRE_INT_DATA, CANAL_INT_DATA,
  SITE_INT_DATA, MARCHE_INT_DATA, EQUIPEMENT_INT_DATA, DELAIS_DATA, MARCHE_KPI,
  MONTHLY_DI, YEARLY_DI, MONTHLY_TEMPS_RES, YEARLY_TEMPS_RES, COLORS_DI,
  type SliceRow, type TimePoint,
} from './interventionsDashboardData';

// ─── Canal per date range ─────────────────────────────────────────────────────

type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'year';
const CANAL_DATA_BY_RANGE: Record<DateRange, { my_residence: number; interne: number; telephone: number; email: number }> = {
  today:     { my_residence: 14, interne: 5,    telephone: 2,   email: 4   },
  yesterday: { my_residence: 36, interne: 12,   telephone: 6,   email: 9   },
  week:      { my_residence: 180, interne: 58,  telephone: 28,  email: 44  },
  month:     { my_residence: 720, interne: 230, telephone: 110, email: 175 },
  year:      { my_residence: 8640, interne: 2760, telephone: 1320, email: 2100 },
};
const DATE_RANGE_LABELS: Record<DateRange, string> = {
  today: "Aujourd'hui", yesterday: 'Hier', week: 'Cette semaine', month: 'Ce mois', year: 'Cette année',
};

// ─── Critical examples ────────────────────────────────────────────────────────

const CRITICAL_EXAMPLES = [
  { id: 'ex-1', reference: 'DI-2026-00089', titre: 'Inondation chambre 312 — fuite canalisation principale', created_at: new Date(Date.now() - 1.5 * 3600000).toISOString() },
  { id: 'ex-2', reference: 'DI-2026-00091', titre: 'Panne tableau électrique — bâtiment B entier hors tension', created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'ex-3', reference: 'DI-2026-00094', titre: 'Détecteur incendie déclenché — couloir RDC sans acquittement', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'ex-4', reference: 'DI-2026-00097', titre: "Ascenseur bloqué entre deux étages — occupant signalé à l'intérieur", created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: 'ex-5', reference: 'DI-2026-00101', titre: 'Fuite gaz signalée — cuisine collective RU Manufacture', created_at: new Date(Date.now() - 11 * 3600000).toISOString() },
];

// ─── Shared chart types & helpers ─────────────────────────────────────────────

type Periodicite = 'mois' | 'an';

interface PieSlice { label: string; value: number; color: string; }
interface TooltipState { x: number; y: number; label: string; value: number; statut: string; }

function buildSlicesTop(rows: SliceRow[], field: string, colors: string[], limit = 8): PieSlice[] {
  const sorted = rows
    .map((r, i) => ({ label: r.nom as string, value: (r[field] as number) ?? 0, color: colors[i % colors.length] }))
    .sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((s, r) => s + r.value, 0);
  if (rest > 0) top.push({ label: 'Autres', value: rest, color: '#94a3b8' });
  return top;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon, onClick }: {
  label: string; value: number | string; sub?: string;
  color: string; icon: React.ElementType; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 bg-white flex items-start gap-3 ${color} ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''}`}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-current/10">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-xs font-medium opacity-70 leading-tight">{label}</p>
        {sub && <p className="text-[10px] opacity-50 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

// ─── AccordionSection ─────────────────────────────────────────────────────────

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
          {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

function DonutChart({ slices, title, selectOptions, selectedOption, onOptionChange }: {
  slices: PieSlice[]; title: string;
  selectOptions?: { value: string; label: string }[];
  selectedOption?: string; onOptionChange?: (v: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((s, sl) => s + sl.value, 0);

  const paths = useMemo(() => {
    if (total === 0) return [];
    const cx = 100, cy = 100, r = 72;
    const result: { d: string; color: string; index: number }[] = [];
    let angle = -Math.PI / 2;
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      if (slice.value === 0) continue;
      const sweep = (slice.value / total) * 2 * Math.PI;
      const end = angle + sweep;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
      result.push({ d: `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} L ${cx} ${cy} Z`, color: slice.color, index: i });
      angle = end;
    }
    return result;
  }, [slices, total]);

  const hoveredSlice = hovered !== null ? slices[hovered] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
        {selectOptions && onOptionChange && (
          <select value={selectedOption} onChange={e => onOptionChange(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300">
            {selectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </div>
      <div className="flex justify-center">
        <div className="w-40 h-40">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {paths.map(({ d, color, index }) => (
              <path key={index} d={d} fill={color}
                opacity={hovered !== null && hovered !== index ? 0.35 : 1}
                style={{ transformOrigin: '100px 100px', transform: hovered === index ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} />
            ))}
            <circle cx="100" cy="100" r="44" fill="white" />
            {hoveredSlice ? (
              <>
                <text x="100" y="95" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b" dominantBaseline="middle">{hoveredSlice.value.toLocaleString('fr-FR')}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="9" fill="#94a3b8" dominantBaseline="middle">{hoveredSlice.label.substring(0, 16)}</text>
              </>
            ) : (
              <>
                <text x="100" y="96" textAnchor="middle" fontSize="20" fontWeight="900" fill="#1e293b" dominantBaseline="middle">{total.toLocaleString('fr-FR')}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="9" fill="#94a3b8" dominantBaseline="middle">total</text>
              </>
            )}
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {slices.map((sl, i) => (
          <div key={i} className="flex items-center gap-1.5 cursor-default min-w-0"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: sl.color, opacity: hovered !== null && hovered !== i ? 0.35 : 1 }} />
            <span className={`text-xs truncate flex-1 transition-colors ${hovered === i ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{sl.label}</span>
            <span className={`text-xs font-semibold flex-shrink-0 ml-1 ${hovered === i ? 'text-slate-800' : 'text-slate-400'}`}>{sl.value.toLocaleString('fr-FR')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LineChart ────────────────────────────────────────────────────────────────

interface StatutCfg { color: string; label: string; }

function LineChart({ data, statutConfig, visibleStatuts, onToggleStatut, tooltip, onHover, yUnit }: {
  data: TimePoint[];
  statutConfig: Record<string, StatutCfg>;
  visibleStatuts: Set<string>;
  onToggleStatut: (s: string) => void;
  tooltip: TooltipState | null;
  onHover: (t: TooltipState | null) => void;
  yUnit?: string;
}) {
  const activeStatuts = Object.keys(statutConfig).filter(k => visibleStatuts.has(k));
  const allValues = activeStatuts.flatMap(s => data.map(d => (d[s] as number) ?? 0));
  const minVal = Math.max(0, Math.min(...allValues) - Math.ceil((Math.max(...allValues) - Math.min(...allValues)) * 0.1));
  const maxVal = Math.max(...allValues) + Math.ceil((Math.max(...allValues) - Math.min(...allValues)) * 0.1);
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round(minVal + (i / 4) * (maxVal - minVal)));
  const W = 560, H = 260, padL = 56, padR = 16, padT = 12, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const toX = (i: number) => padL + (i / Math.max(1, data.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - ((v - minVal) / Math.max(1, maxVal - minVal)) * innerH;
  const buildPath = (s: string) => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY((d[s] as number) ?? 0)}`).join(' ');
  const buildArea = (s: string) => `${buildPath(s)} L ${toX(data.length - 1)} ${padT + innerH} L ${toX(0)} ${padT + innerH} Z`;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative" style={{ paddingBottom: '47%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" onMouseLeave={() => onHover(null)}>
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 6} y={toY(v)} textAnchor="end" fontSize="13" fill="#64748b" dominantBaseline="middle" fontWeight="600">{v}{yUnit}</text>
            </g>
          ))}
          {activeStatuts.map(s => <path key={`a-${s}`} d={buildArea(s)} fill={statutConfig[s].color} opacity="0.07" />)}
          {activeStatuts.map(s => <path key={`l-${s}`} d={buildPath(s)} fill="none" stroke={statutConfig[s].color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />)}
          {data.map((d, i) => (
            <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="13" fill="#64748b" fontWeight="600">{d.shortLabel as string}</text>
          ))}
          {activeStatuts.map(s => data.map((d, i) => (
            <circle key={`dot-${s}-${i}`} cx={toX(i)} cy={toY((d[s] as number) ?? 0)} r="10" fill={statutConfig[s].color} opacity="0"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => onHover({ x: toX(i), y: toY((d[s] as number) ?? 0), label: d.label as string, value: (d[s] as number) ?? 0, statut: s })} />
          )))}
          {tooltip && (
            <>
              <line x1={tooltip.x} x2={tooltip.x} y1={padT} y2={padT + innerH} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={tooltip.x} cy={tooltip.y} r="5" fill={statutConfig[tooltip.statut]?.color ?? '#94a3b8'} stroke="white" strokeWidth="2" />
            </>
          )}
        </svg>
        {tooltip && (() => {
          const leftPct = (tooltip.x / W) * 100;
          const topPct  = (tooltip.y / H) * 100;
          const flipX   = leftPct > 75;
          return (
            <div className="absolute pointer-events-none z-10 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
              style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: `translate(${flipX ? '-110%' : '10px'}, -50%)` }}>
              <div className="font-bold">{tooltip.label}</div>
              <div style={{ color: statutConfig[tooltip.statut]?.color }} className="font-semibold">
                {statutConfig[tooltip.statut]?.label} : {tooltip.value}{yUnit}
              </div>
            </div>
          );
        })()}
      </div>
      <div className="flex gap-2 flex-wrap pt-1 border-t border-slate-50">
        {Object.entries(statutConfig).map(([k, cfg]) => (
          <button key={k} onClick={() => onToggleStatut(k)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${visibleStatuts.has(k) ? 'border-transparent text-white' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}
            style={visibleStatuts.has(k) ? { background: cfg.color, borderColor: cfg.color } : {}}>
            {cfg.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const YEARS = [2022, 2023, 2024, 2025, 2026];
function YearSelect({ value, onChange }: { value: number; onChange: (y: number) => void }) {
  return (
    <select value={value} onChange={e => onChange(Number(e.target.value))}
      className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300">
      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}
function PeriodSelect({ value, onChange }: { value: Periodicite; onChange: (p: Periodicite) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as Periodicite)}
      className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300">
      <option value="mois">Par mois</option>
      <option value="an">Par an</option>
    </select>
  );
}

// ─── Délais moyens par criticité ─────────────────────────────────────────────

function DelaisSection() {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Criticité</th>
            <th className="text-right py-2 pr-3 text-slate-400 font-semibold">DI actives</th>
            <th className="text-right py-2 pr-3 text-slate-400 font-semibold">DMPT (h)</th>
            <th className="text-right py-2 pr-3 text-slate-400 font-semibold">DMR (h)</th>
            <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Objectif DMR</th>
            <th className="text-left py-2 text-slate-400 font-semibold">Écart objectif</th>
          </tr>
        </thead>
        <tbody>
          {DELAIS_DATA.map(row => {
            const ecart = row.dmr - row.objectif_dmr;
            const isOk = ecart <= 0;
            const ecartPct = Math.round((Math.abs(ecart) / row.objectif_dmr) * 100);
            return (
              <tr key={row.criticite} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 pr-3 font-semibold text-slate-700">{row.criticite}</td>
                <td className="py-2.5 pr-3 text-right text-slate-500">{row.nb}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-slate-600">{row.dmpt}h</td>
                <td className="py-2.5 pr-3 text-right font-mono font-bold text-slate-800">{row.dmr}h</td>
                <td className="py-2.5 pr-3 text-right text-slate-400">{row.objectif_dmr}h</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden w-20">
                      <div
                        className={`h-full rounded-full ${isOk ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, isOk ? 100 - ecartPct : ecartPct)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isOk ? <span className="flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />−{ecartPct}%</span>
                             : <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+{ecartPct}%</span>}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-4 text-xs">
        <div className="text-center">
          <p className="text-slate-400">DMR moyen global</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {Math.round(DELAIS_DATA.reduce((s, r) => s + r.dmr * r.nb, 0) / DELAIS_DATA.reduce((s, r) => s + r.nb, 0))}h
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400">DMPT moyen global</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {(DELAIS_DATA.reduce((s, r) => s + r.dmpt * r.nb, 0) / DELAIS_DATA.reduce((s, r) => s + r.nb, 0)).toFixed(1)}h
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400">Respect objectifs</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">
            {Math.round((DELAIS_DATA.filter(r => r.dmr <= r.objectif_dmr).length / DELAIS_DATA.length) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Ventilation sub-component ────────────────────────────────────────────────

const DI_FIELD_OPTIONS = [
  { value: 'total',      label: 'Total' },
  { value: 'en_cours',   label: 'En cours' },
  { value: 'en_retard',  label: 'En retard' },
  { value: 'resolu',     label: 'Résolues' },
];
const DIM1_OPTIONS = [
  { value: 'categorie',   label: 'Par catégorie' },
  { value: 'residence',   label: 'Par résidence' },
  { value: 'site',        label: 'Par site/campus' },
  { value: 'canal',       label: 'Par canal' },
  { value: 'equipement',  label: 'Par équipement' },
];
const DIM2_OPTIONS = [
  { value: 'agent',        label: 'Par agent' },
  { value: 'prestataire',  label: 'Par prestataire' },
  { value: 'marche',       label: 'Par marché/contrat' },
  { value: 'residence',    label: 'Par résidence' },
];

function getDim1Rows(dim: string): SliceRow[] {
  switch (dim) {
    case 'categorie':  return CATEGORIE_DATA;
    case 'residence':  return RESIDENCE_INT_DATA;
    case 'site':       return SITE_INT_DATA;
    case 'canal':      return CANAL_INT_DATA;
    case 'equipement': return EQUIPEMENT_INT_DATA;
    default:           return CATEGORIE_DATA;
  }
}
function getDim2Rows(dim: string): SliceRow[] {
  switch (dim) {
    case 'agent':       return AGENT_INT_DATA;
    case 'prestataire': return PRESTATAIRE_INT_DATA;
    case 'marche':      return MARCHE_INT_DATA;
    case 'residence':   return RESIDENCE_INT_DATA;
    default:            return AGENT_INT_DATA;
  }
}

function VentilationSection() {
  const [field1, setField1] = useState('en_cours');
  const [dim1, setDim1]     = useState('categorie');
  const [field2, setField2] = useState('en_retard');
  const [dim2, setDim2]     = useState('agent');

  const slices1 = buildSlicesTop(getDim1Rows(dim1), field1, COLORS_DI);
  const slices2 = buildSlicesTop(getDim2Rows(dim2), field2, COLORS_DI);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <select value={field1} onChange={e => setField1(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300">
            {DI_FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <DonutChart slices={slices1} title="" selectOptions={DIM1_OPTIONS} selectedOption={dim1} onOptionChange={setDim1} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <select value={field2} onChange={e => setField2(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300">
            {DI_FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <DonutChart slices={slices2} title="" selectOptions={DIM2_OPTIONS} selectedOption={dim2} onOptionChange={setDim2} />
      </div>
    </div>
  );
}

// ─── Evolution sub-component ──────────────────────────────────────────────────

const SC_DI = {
  nouvelles: { color: '#3b82f6', label: 'Nouvelles DI' },
  resolues:  { color: '#10b981', label: 'Résolues' },
  en_retard: { color: '#ef4444', label: 'En retard' },
  critiques: { color: '#f97316', label: 'Critiques' },
};
const SC_TEMPS = {
  critique: { color: '#ef4444', label: 'Critique' },
  haute:    { color: '#f97316', label: 'Majeure' },
  moyenne:  { color: '#3b82f6', label: 'Mineure' },
  faible:   { color: '#10b981', label: 'Aucune' },
};

function EvolutionSection() {
  const [per1, setPer1]     = useState<Periodicite>('mois');
  const [year1, setYear1]   = useState(2026);
  const [vis1, setVis1]     = useState<Set<string>>(new Set(['nouvelles', 'resolues', 'en_retard']));
  const [tip1, setTip1]     = useState<TooltipState | null>(null);

  const [per2, setPer2]     = useState<Periodicite>('mois');
  const [year2, setYear2]   = useState(2026);
  const [vis2, setVis2]     = useState<Set<string>>(new Set(['critique', 'haute']));
  const [tip2, setTip2]     = useState<TooltipState | null>(null);

  const data1 = per1 === 'mois' ? (MONTHLY_DI[year1] ?? MONTHLY_DI[2026]) : YEARLY_DI;
  const data2 = per2 === 'mois' ? (MONTHLY_TEMPS_RES[year2] ?? MONTHLY_TEMPS_RES[2026]) : YEARLY_TEMPS_RES;

  const toggle1 = (s: string) => setVis1(prev => { const n = new Set(prev); if (n.has(s)) { if (n.size > 1) n.delete(s); } else n.add(s); return n; });
  const toggle2 = (s: string) => setVis2(prev => { const n = new Set(prev); if (n.has(s)) { if (n.size > 1) n.delete(s); } else n.add(s); return n; });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-2">
      <div className="border border-slate-100 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-semibold text-slate-600">Évolution des demandes d'intervention</span>
          <div className="flex gap-2 ml-auto">
            <PeriodSelect value={per1} onChange={setPer1} />
            {per1 === 'mois' && <YearSelect value={year1} onChange={setYear1} />}
          </div>
        </div>
        <LineChart data={data1} statutConfig={SC_DI} visibleStatuts={vis1} onToggleStatut={toggle1} tooltip={tip1} onHover={setTip1} />
      </div>
      <div className="border border-slate-100 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-semibold text-slate-600">Temps moyen de résolution (heures)</span>
          <div className="flex gap-2 ml-auto">
            <PeriodSelect value={per2} onChange={setPer2} />
            {per2 === 'mois' && <YearSelect value={year2} onChange={setYear2} />}
          </div>
        </div>
        <LineChart data={data2} statutConfig={SC_TEMPS} visibleStatuts={vis2} onToggleStatut={toggle2} tooltip={tip2} onHover={setTip2} yUnit="h" />
      </div>
    </div>
  );
}

// ─── Workflow funnel data ─────────────────────────────────────────────────────

const FUNNEL_STEPS = [
  { key: 'creation',    label: 'Création',     count: 10620, color: 'bg-blue-500',    text: 'text-blue-700',    bar: 'bg-blue-500'    },
  { key: 'affectation', label: 'Affectation',  count: 9850,  color: 'bg-sky-500',     text: 'text-sky-700',     bar: 'bg-sky-500'     },
  { key: 'planif',      label: 'Planification', count: 8760, color: 'bg-cyan-500',    text: 'text-cyan-700',    bar: 'bg-cyan-500'    },
  { key: 'realisation', label: 'Réalisation',  count: 7940,  color: 'bg-yellow-500',  text: 'text-yellow-700',  bar: 'bg-yellow-500'  },
  { key: 'validation',  label: 'Validation',   count: 7210,  color: 'bg-violet-500',  text: 'text-violet-700',  bar: 'bg-violet-500'  },
  { key: 'cloture',     label: 'Clôture',      count: 9150,  color: 'bg-emerald-500', text: 'text-emerald-700', bar: 'bg-emerald-500' },
];

function WorkflowFunnel() {
  const max = Math.max(...FUNNEL_STEPS.map(s => s.count));
  return (
    <div className="mt-2 space-y-2">
      {FUNNEL_STEPS.map((step, i) => {
        const pct = Math.round((step.count / FUNNEL_STEPS[0].count) * 100);
        const drop = i > 0 ? FUNNEL_STEPS[i - 1].count - step.count : 0;
        const dropPct = i > 0 ? Math.round((drop / FUNNEL_STEPS[i - 1].count) * 100) : 0;
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0 text-right">
              <span className={`text-xs font-semibold ${step.text}`}>{step.label}</span>
            </div>
            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full ${step.bar} rounded-full transition-all flex items-center justify-end pr-2`}
                style={{ width: `${(step.count / max) * 100}%` }}
              >
                <span className="text-[10px] font-bold text-white">{step.count.toLocaleString('fr-FR')}</span>
              </div>
            </div>
            <div className="w-24 flex-shrink-0 text-xs text-slate-400">
              {i > 0 ? (
                <span className="text-red-400 font-semibold">−{drop.toLocaleString('fr-FR')} ({dropPct}%)</span>
              ) : (
                <span className="font-semibold text-slate-500">100%</span>
              )}
            </div>
          </div>
        );
      })}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
        <span>Taux de complétion global :</span>
        <span className="font-bold text-emerald-600">
          {Math.round((FUNNEL_STEPS[FUNNEL_STEPS.length - 1].count / FUNNEL_STEPS[0].count) * 100)}%
        </span>
        <span className="text-slate-400">({FUNNEL_STEPS[FUNNEL_STEPS.length - 1].count.toLocaleString('fr-FR')} / {FUNNEL_STEPS[0].count.toLocaleString('fr-FR')})</span>
      </div>
    </div>
  );
}

// ─── Temps répartition data ───────────────────────────────────────────────────

const TEMPS_TYPES = [
  { key: 'deplacement',    label: 'Déplacement',    minutes: 28,  color: 'bg-blue-500',   textColor: 'text-blue-700',   hex: '#3b82f6' },
  { key: 'preparation',    label: 'Préparation',    minutes: 12,  color: 'bg-sky-500',    textColor: 'text-sky-700',    hex: '#0ea5e9' },
  { key: 'intervention',   label: 'Intervention',   minutes: 85,  color: 'bg-emerald-500',textColor: 'text-emerald-700',hex: '#10b981' },
  { key: 'attente',        label: 'Attente',        minutes: 18,  color: 'bg-amber-500',  textColor: 'text-amber-700',  hex: '#f59e0b' },
  { key: 'administratif',  label: 'Administratif',  minutes: 15,  color: 'bg-slate-400',  textColor: 'text-slate-600',  hex: '#94a3b8' },
];

function TempsRepartition() {
  const total = TEMPS_TYPES.reduce((s, t) => s + t.minutes, 0);
  const totalH = Math.floor(total / 60);
  const totalMin = total % 60;

  // Simple horizontal stacked bar
  return (
    <div className="mt-2 space-y-4">
      {/* Stacked bar */}
      <div className="flex h-8 rounded-xl overflow-hidden w-full">
        {TEMPS_TYPES.map(t => (
          <div
            key={t.key}
            className={`${t.color} flex items-center justify-center transition-all`}
            style={{ width: `${(t.minutes / total) * 100}%` }}
            title={`${t.label}: ${t.minutes}min`}
          >
            {(t.minutes / total) > 0.1 && (
              <span className="text-[10px] font-bold text-white">{Math.round((t.minutes / total) * 100)}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend rows */}
      <div className="space-y-2">
        {TEMPS_TYPES.map(t => (
          <div key={t.key} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${t.color}`} />
            <span className="text-xs text-slate-600 flex-1">{t.label}</span>
            <span className={`text-xs font-bold ${t.textColor}`}>{t.minutes} min</span>
            <span className="text-xs text-slate-400 w-12 text-right">{Math.round((t.minutes / total) * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Durée moyenne par intervention</span>
        <span className="font-bold text-slate-700">{totalH}h{totalMin > 0 ? ` ${totalMin}min` : ''}</span>
      </div>
    </div>
  );
}

// ─── Écarts temps prévu vs réel ───────────────────────────────────────────────

const ECARTS_DATA = [
  { categorie: 'Plomberie',        prevu: 90,  reel: 112, nb: 142 },
  { categorie: 'Électricité',      prevu: 75,  reel: 68,  nb: 98  },
  { categorie: 'Chauffage/CVC',    prevu: 120, reel: 154, nb: 64  },
  { categorie: 'Serrurerie',       prevu: 45,  reel: 42,  nb: 187 },
  { categorie: 'Menuiserie',       prevu: 60,  reel: 73,  nb: 76  },
  { categorie: 'Électroménager',   prevu: 90,  reel: 95,  nb: 53  },
  { categorie: 'Nettoyage',        prevu: 30,  reel: 28,  nb: 210 },
];

function EcartsTemps() {
  return (
    <div className="mt-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-slate-400 font-semibold">Catégorie</th>
              <th className="text-right py-2 text-slate-400 font-semibold">Prévu</th>
              <th className="text-right py-2 text-slate-400 font-semibold">Réel</th>
              <th className="text-right py-2 text-slate-400 font-semibold">Écart</th>
              <th className="text-right py-2 text-slate-400 font-semibold">DI</th>
            </tr>
          </thead>
          <tbody>
            {ECARTS_DATA.map(row => {
              const ecart = row.reel - row.prevu;
              const ecartPct = Math.round((ecart / row.prevu) * 100);
              const isOver = ecart > 0;
              const isEven = Math.abs(ecartPct) <= 5;
              return (
                <tr key={row.categorie} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 font-medium text-slate-700">{row.categorie}</td>
                  <td className="py-2 text-right text-slate-500">{row.prevu}min</td>
                  <td className="py-2 text-right text-slate-700 font-semibold">{row.reel}min</td>
                  <td className="py-2 text-right">
                    <span className={`inline-flex items-center gap-0.5 font-bold ${isEven ? 'text-slate-400' : isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isEven ? <Minus className="w-3 h-3" /> : isOver ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {ecart > 0 ? '+' : ''}{ecart}min ({ecartPct > 0 ? '+' : ''}{ecartPct}%)
                    </span>
                  </td>
                  <td className="py-2 text-right text-slate-400">{row.nb}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Recent 20 interventions ──────────────────────────────────────────────────

const RECENT_INTERVENTIONS = Array.from({ length: 20 }, (_, i) => {
  const statuts: StatutDI[] = ['a_qualifier', 'qualifie', 'affecte', 'en_intervention', 'en_attente_validation', 'resolu', 'cloture'];
  const categories = ['Plomberie', 'Électricité', 'Serrurerie', 'Chauffage', 'Menuiserie', 'Nettoyage', 'Électroménager'];
  const criticites: CriticiteDI[] = ['faible', 'moyenne', 'haute', 'critique'];
  const residences = ['Cavalier', 'Domus', 'La Plaine', 'Saint-Exupéry', 'Rockefeller', 'Libération'];
  const agents = ['Martin D.', 'Sophie L.', 'Pierre B.', 'Ahmad R.', 'Claire M.', null];
  const prestataires = ['Sauvignet Élec.', 'Thermocom', 'Plombi-Sud', null, null, null];
  const titres = [
    'Fuite sous évier chambre', 'Prise défectueuse bureau', 'Serrure bloquée entrée',
    'Radiateur froid', 'Vitre fenêtre brisée', 'Nettoyage couloir après sinistre',
    'Réfrigérateur en panne', 'VMC bruyante palier', 'Badge non reconnu hall',
    'Court-circuit tableau élec.', 'Joint douche décollé', 'Volet roulant bloqué',
  ];
  const now = Date.now();
  const offset = (i + 1) * 2.3 * 3600000;
  const statut = statuts[i % statuts.length];
  const criticite = criticites[Math.floor(i / 5) % criticites.length];
  const agent = agents[i % agents.length];
  const prestataire = !agent ? prestataires[i % prestataires.length] : null;
  return {
    id: `r-${i}`,
    reference: `DI-2026-${String(10500 + i).padStart(5, '0')}`,
    titre: titres[i % titres.length],
    categorie: categories[i % categories.length],
    statut_demande: statut,
    criticite,
    residence: residences[i % residences.length],
    agent,
    prestataire,
    created_at: new Date(now - offset).toISOString(),
    date_planifiee: statut === 'affecte' || statut === 'en_intervention' ? new Date(now + (i + 1) * 86400000).toISOString() : null,
  };
});

function RecentInterventions({ onSelectDemande }: { onSelectDemande: (d: DemandeParsed) => void }) {
  void onSelectDemande; // used when rows become clickable with full data
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold whitespace-nowrap">Référence</th>
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Titre</th>
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold whitespace-nowrap">Catégorie</th>
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold whitespace-nowrap">Résidence</th>
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold whitespace-nowrap">Statut</th>
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Criticité</th>
            <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Affecté à</th>
            <th className="text-left py-2 text-slate-400 font-semibold whitespace-nowrap">Créée</th>
          </tr>
        </thead>
        <tbody>
          {RECENT_INTERVENTIONS.map(row => {
            const sCtg = STATUT_DI_CFG[row.statut_demande];
            const cCtg = CRITICITE_CFG[row.criticite];
            return (
              <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer group">
                <td className="py-2 pr-3 font-mono font-semibold text-slate-600 whitespace-nowrap group-hover:text-blue-600 transition-colors">{row.reference}</td>
                <td className="py-2 pr-3 text-slate-700 font-medium max-w-48 truncate">{row.titre}</td>
                <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{row.categorie}</td>
                <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{row.residence}</td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${sCtg.bg} ${sCtg.text} ${sCtg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sCtg.dot}`} />
                    {sCtg.label}
                  </span>
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${cCtg.badgeBg} ${cCtg.text}`}>
                    {cCtg.label}
                  </span>
                </td>
                <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">
                  {row.agent ?? row.prestataire ?? <span className="text-slate-300 italic">—</span>}
                </td>
                <td className="py-2 text-slate-400 whitespace-nowrap">{fmtDateRelative(row.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  demandes: DemandeParsed[];
  onSelectDemande: (d: DemandeParsed) => void;
  onFilterByStatut: (statuts: StatutDI[]) => void;
  onFilterByCriticite: (criticites: CriticiteDI[]) => void;
  onFilterByRetard: () => void;
}

export default function InterventionsDashboard({ demandes, onSelectDemande, onFilterByStatut, onFilterByCriticite, onFilterByRetard }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>('yesterday');
  const [filterPeriode, setFilterPeriode] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterTypo, setFilterTypo] = useState('');
  const [filterPrestataire, setFilterPrestataire] = useState('');
  const [filterMarche, setFilterMarche] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const canalCounts = CANAL_DATA_BY_RANGE[dateRange];

  const activeStatutOrder: StatutDI[] = ['a_qualifier', 'qualifie', 'affecte', 'en_intervention'];
  const closedStatutOrder: StatutDI[] = ['resolu', 'cloture', 'rejete'];

  // ── Live counts from real Supabase demandes ──────────────────────────────────
  const liveCounts = useMemo(() => {
    const counts: Partial<Record<StatutDI, number>> = {};
    for (const d of demandes) {
      if (d.draft_step !== null || d.statut_demande === 'brouillon') continue;
      const s = d.statut_demande;
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [demandes]);

  const activeTotal = activeStatutOrder.reduce((s, k) => s + (liveCounts[k] ?? 0), 0);
  const closedTotal = closedStatutOrder.reduce((s, k) => s + (liveCounts[k] ?? 0), 0);

  const liveCriticiteCounts = useMemo(() => {
    const active = new Set<StatutDI>(['a_qualifier', 'qualifie', 'affecte', 'en_intervention', 'nouveau']);
    const counts: Record<CriticiteDI, number> = { critique: 0, haute: 0, moyenne: 0, faible: 0 };
    for (const d of demandes) {
      if (!active.has(d.statut_demande) || d.draft_step !== null) continue;
      const c = (d.criticite ?? 'faible') as CriticiteDI;
      if (c in counts) counts[c]++;
    }
    return counts;
  }, [demandes]);

  const liveRetardCount = useMemo(() => {
    const activeStatuses = new Set<StatutDI>(['a_qualifier', 'qualifie', 'affecte', 'en_intervention', 'nouveau']);
    const now = Date.now();
    return demandes.filter(d => {
      if (!activeStatuses.has(d.statut_demande) || d.draft_step !== null) return false;
      if (d.date_planifiee && new Date(d.date_planifiee).getTime() < now) return true;
      const sla = (d.sla_heures ?? 48) * 3600 * 1000;
      return new Date(d.created_at).getTime() + sla < now;
    }).length;
  }, [demandes]);

  const dmrMoyenGlobal = Math.round(DELAIS_DATA.reduce((s, r) => s + r.dmr * r.nb, 0) / DELAIS_DATA.reduce((s, r) => s + r.nb, 0));
  const dmptMoyenGlobal = (DELAIS_DATA.reduce((s, r) => s + r.dmpt * r.nb, 0) / DELAIS_DATA.reduce((s, r) => s + r.nb, 0)).toFixed(1);
  const dureeInterventionMin = 158; // minutes (from TempsRepartition total)

  const hasActiveFilters = filterPeriode || filterSite || filterTypo || filterPrestataire || filterMarche;

  return (
    <div className="p-5 space-y-5">

      {/* ── Global filter bar ── */}
      <div className="bg-white rounded-xl border border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersVisible(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              filtersVisible || hasActiveFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtres
            {hasActiveFilters && <span className="ml-1 w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold flex items-center justify-center">!</span>}
          </button>
          {filtersVisible && (
            <>
              <select value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-300">
                <option value="">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-300">
                <option value="">Tous les sites</option>
                {SITE_INT_DATA.map(s => <option key={s.nom as string} value={s.nom as string}>{s.nom as string}</option>)}
              </select>
              <select value={filterTypo} onChange={e => setFilterTypo(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-300">
                <option value="">Toutes typologies</option>
                {CATEGORIE_DATA.map(c => <option key={c.nom as string} value={c.nom as string}>{c.nom as string}</option>)}
              </select>
              <select value={filterPrestataire} onChange={e => setFilterPrestataire(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-300">
                <option value="">Tous prestataires/agents</option>
                {PRESTATAIRE_INT_DATA.map(p => <option key={p.nom as string} value={p.nom as string}>{p.nom as string}</option>)}
                {AGENT_INT_DATA.filter(a => a.nom !== 'Non affecté').map(a => <option key={`agent-${a.nom}`} value={a.nom as string}>{a.nom as string}</option>)}
              </select>
              <select value={filterMarche} onChange={e => setFilterMarche(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-300">
                <option value="">Tous marchés/contrats</option>
                {MARCHE_INT_DATA.map(m => <option key={m.nom as string} value={m.nom as string}>{m.nom as string}</option>)}
              </select>
              {hasActiveFilters && (
                <button onClick={() => { setFilterPeriode(''); setFilterSite(''); setFilterTypo(''); setFilterPrestataire(''); setFilterMarche(''); }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold whitespace-nowrap">
                  Réinitialiser
                </button>
              )}
            </>
          )}
          {!filtersVisible && hasActiveFilters && (
            <span className="text-xs text-blue-600 font-medium">Filtres actifs</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-400">Données en temps réel</span>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-xs font-semibold text-red-700">
          {liveCriticiteCounts.critique} demandes critiques en cours
          {' · '}
          {liveRetardCount} en retard (date butoir dépassée)
        </p>
      </div>

      {/* KPI row — 8 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="Tickets ouverts" value={activeTotal} sub="actifs en ce moment" color="text-blue-600" icon={Clock}
          onClick={() => onFilterByStatut(['nouveau', 'a_qualifier', 'qualifie', 'affecte', 'en_intervention', 'en_attente_validation'])} />
        <KpiCard label="Résolus" value={(liveCounts.resolu ?? 0).toLocaleString('fr-FR')} sub="clôture en attente" color="text-emerald-600" icon={CheckCircle2}
          onClick={() => onFilterByStatut(['resolu'])} />
        <KpiCard label="Clos" value={(liveCounts.cloture ?? 0).toLocaleString('fr-FR')} sub="terminés définitivement" color="text-slate-500" icon={Minus}
          onClick={() => onFilterByStatut(['cloture'])} />
        <KpiCard label="En retard" value={liveRetardCount} sub="date butoir dépassée" color="text-amber-600" icon={Timer}
          onClick={onFilterByRetard} />
        <KpiCard label="DMR moyen" value={`${dmrMoyenGlobal}h`} sub="délai moyen résolution" color="text-violet-600" icon={TrendingDown} />
        <KpiCard label="DMPT moyen" value={`${dmptMoyenGlobal}h`} sub="délai mise en prise en charge" color="text-sky-600" icon={TrendingUp} />
        <KpiCard label="Durée moy./DI" value={`${Math.floor(dureeInterventionMin / 60)}h${dureeInterventionMin % 60}m`} sub="temps opérateur / DI" color="text-orange-600" icon={Wrench} />
        <KpiCard
          label="Sous marché"
          value={`${Math.round((MARCHE_KPI.di_sous_marche / (MARCHE_KPI.di_sous_marche + MARCHE_KPI.di_regie)) * 100)}%`}
          sub={`${MARCHE_KPI.di_sous_marche.toLocaleString('fr-FR')} DI / ${MARCHE_KPI.actifs} marchés`}
          color="text-teal-600"
          icon={Briefcase}
        />
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-3 gap-4">

        {/* ── Statuts ── */}
        <div className="col-span-1 bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Répartition par statut</p>
          <div className="space-y-2 mb-3">
            {activeStatutOrder.map(s => {
              const count = liveCounts[s] ?? 0;
              const cfg = STATUT_DI_CFG[s];
              const pct = activeTotal > 0 ? Math.round((count / activeTotal) * 100) : 0;
              const label = s === 'en_intervention' ? "En intervention aujourd'hui" : cfg.label;
              return (
                <button key={s} onClick={() => onFilterByStatut([s])}
                  className="w-full group text-left hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded-lg transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="text-xs text-slate-700 group-hover:text-blue-600 transition-colors">{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-600">{count.toLocaleString('fr-FR')}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                  <MiniBar pct={pct} color={cfg.dot} />
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 my-2" />
          <div className="space-y-2">
            {closedStatutOrder.map(s => {
              const count = liveCounts[s] ?? 0;
              const cfg = STATUT_DI_CFG[s];
              const pct = closedTotal > 0 ? Math.round((count / closedTotal) * 100) : 0;
              return (
                <button key={s} onClick={() => onFilterByStatut([s])}
                  className="w-full group text-left hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded-lg transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="text-xs text-slate-500 group-hover:text-blue-600 transition-colors">{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">{count.toLocaleString('fr-FR')}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                  <MiniBar pct={pct} color={cfg.dot} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Criticité + Canal ── */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Par criticité</p>
            <p className="text-[10px] text-slate-400 mb-3">Demandes actives uniquement</p>
            <div className="space-y-2">
              {(['critique', 'haute', 'moyenne', 'faible'] as const).map(c => {
                const count = liveCriticiteCounts[c];
                const cfg = CRITICITE_CFG[c];
                const critActiveTotal = liveCriticiteCounts.critique + liveCriticiteCounts.haute + liveCriticiteCounts.moyenne + liveCriticiteCounts.faible;
                const pct = critActiveTotal > 0 ? Math.round((count / critActiveTotal) * 100) : 0;
                return (
                  <button key={c} onClick={() => onFilterByCriticite([c])}
                    className="w-full group text-left hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded-lg transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-700 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-600">{count}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                    <MiniBar pct={pct} color={cfg.dot} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Canaux source</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Nouvelles demandes reçues</p>
              </div>
              <div className="relative">
                <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 text-[11px] font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer">
                  {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map(k => (
                    <option key={k} value={k}>{DATE_RANGE_LABELS[k]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex-shrink-0 overflow-hidden border border-slate-100 bg-white flex items-center justify-center">
                    <img src={logoMyResidence} alt="My Résidence" className="w-full h-full object-contain" />
                  </span>
                  My Résidence
                </span>
                <span className="text-xs font-bold text-slate-700">{canalCounts.my_residence}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex-shrink-0 overflow-hidden border border-slate-100 bg-white flex items-center justify-center">
                    <img src={logoMyResidence} alt="CROUS Lyon" className="w-full h-full object-contain" />
                  </span>
                  Interne
                </span>
                <span className="text-xs font-bold text-slate-700">{canalCounts.interne}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-blue-50 flex-shrink-0 flex items-center justify-center">
                    <Mail className="w-3 h-3 text-blue-500" />
                  </span>
                  Email
                </span>
                <span className="text-xs font-bold text-slate-700">{canalCounts.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-50 flex-shrink-0 flex items-center justify-center">
                    <Phone className="w-3 h-3 text-amber-500" />
                  </span>
                  Téléphone
                </span>
                <span className="text-xs font-bold text-slate-700">{canalCounts.telephone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Demandes critiques ── */}
        <div className="col-span-1 bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-xs font-bold text-slate-700">Demandes critiques</p>
            <span className="ml-auto text-xs font-bold text-red-600">{liveCriticiteCounts.critique}</span>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {CRITICAL_EXAMPLES.map(ex => (
              <div key={ex.id} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0 bg-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 leading-tight line-clamp-2">{ex.titre}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Timer className="w-2.5 h-2.5 text-red-400" />
                      {ex.reference} · {fmtDateRelative(ex.created_at)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 bg-red-100 text-red-700">Critique</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
            <button onClick={() => onFilterByCriticite(['critique'])}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
              Voir la liste complète
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Délais moyens ── */}
      <AccordionSection
        title="Délais moyens par criticité"
        subtitle="DMPT (prise en charge) · DMR (résolution) · Objectifs SLA"
        accentColor="bg-violet-500"
        defaultOpen={true}
      >
        <DelaisSection />
      </AccordionSection>

      {/* ── Volumes par marché + site ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-teal-500" />
            <p className="text-xs font-bold text-slate-700">Volumes par marché / contrat</p>
          </div>
          <div className="space-y-2">
            {MARCHE_INT_DATA.map((row, i) => {
              const total = MARCHE_INT_DATA.reduce((s, r) => s + (r.total as number), 0);
              const pct = Math.round(((row.total as number) / total) * 100);
              return (
                <div key={i} className="flex items-center gap-2 group">
                  <div className="w-28 flex-shrink-0 text-right">
                    <span className="text-[11px] text-slate-600 truncate block">{(row.nom as string).substring(0, 18)}</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all flex items-center justify-end pr-1.5"
                      style={{ width: `${pct}%`, background: COLORS_DI[i % COLORS_DI.length] }}
                    >
                      <span className="text-[9px] font-bold text-white">{pct}%</span>
                    </div>
                  </div>
                  <span className="w-12 flex-shrink-0 text-xs font-semibold text-slate-600 text-right">{(row.total as number).toLocaleString('fr-FR')}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Régie interne vs marchés</span>
            <span className="font-bold text-slate-700">
              {Math.round((MARCHE_KPI.di_regie / (MARCHE_KPI.di_sous_marche + MARCHE_KPI.di_regie)) * 100)}% régie
              {' / '}
              {Math.round((MARCHE_KPI.di_sous_marche / (MARCHE_KPI.di_sous_marche + MARCHE_KPI.di_regie)) * 100)}% marchés
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-bold text-slate-700">Volumes par site / campus</p>
          </div>
          <div className="space-y-2">
            {SITE_INT_DATA.map((row, i) => {
              const total = SITE_INT_DATA.reduce((s, r) => s + (r.total as number), 0);
              const pct = Math.round(((row.total as number) / total) * 100);
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-36 flex-shrink-0 text-right">
                    <span className="text-[11px] text-slate-600 truncate block">{(row.nom as string).substring(0, 24)}</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all flex items-center justify-end pr-1.5"
                      style={{ width: `${pct}%`, background: COLORS_DI[i % COLORS_DI.length] }}
                    >
                      <span className="text-[9px] font-bold text-white">{pct}%</span>
                    </div>
                  </div>
                  <span className="w-10 flex-shrink-0 text-xs font-semibold text-slate-600 text-right">{(row.total as number).toLocaleString('fr-FR')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Ventilation ── */}
      <AccordionSection
        title="Ventilation"
        subtitle="Répartition des demandes selon différents axes"
        accentColor="bg-blue-500"
        defaultOpen={false}
      >
        <VentilationSection />
      </AccordionSection>

      {/* ── Evolution ── */}
      <AccordionSection
        title="Évolution"
        subtitle="Tendances sur la période sélectionnée"
        accentColor="bg-emerald-500"
        defaultOpen={false}
      >
        <EvolutionSection />
      </AccordionSection>

      {/* ── Workflow Funnel ── */}
      <AccordionSection
        title="Entonnoir de workflow"
        subtitle="Progression des demandes dans le cycle de vie"
        accentColor="bg-cyan-500"
        defaultOpen={true}
      >
        <WorkflowFunnel />
      </AccordionSection>

      {/* ── Temps répartition + Écarts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AccordionSection
          title="Répartition des temps d'intervention"
          subtitle="Décomposition par type d'activité"
          accentColor="bg-amber-500"
          defaultOpen={true}
        >
          <TempsRepartition />
        </AccordionSection>
        <AccordionSection
          title="Écarts temps prévu vs réel"
          subtitle="Analyse des dépassements et gains"
          accentColor="bg-rose-500"
          defaultOpen={true}
        >
          <EcartsTemps />
        </AccordionSection>
      </div>

      {/* ── Recent 20 interventions ── */}
      <AccordionSection
        title="20 dernières interventions"
        subtitle="Suivi en temps réel des demandes récentes"
        accentColor="bg-slate-400"
        defaultOpen={true}
      >
        <RecentInterventions onSelectDemande={onSelectDemande} />
      </AccordionSection>

    </div>
  );
}
