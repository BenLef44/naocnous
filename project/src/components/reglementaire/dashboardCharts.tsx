import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TimePoint, COLORS_TYPE, COLORS_RESIDENCES } from './dashboardData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatNum(n: number): string {
  return n >= 1000 ? n.toLocaleString('fr-FR') : String(n);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PieSlice { label: string; value: number; color: string; }
export interface SliceRow  { nom: string; [key: string]: number | string; }

// ─── Sub-accordion ────────────────────────────────────────────────────────────

interface SubAccordionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  accentColor: string;
  children: React.ReactNode;
}

export function SubAccordion({ title, subtitle, defaultOpen = false, accentColor, children }: SubAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/70 hover:bg-slate-100/60 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-0.5 h-5 rounded-full ${accentColor}`} />
          <div className="text-left">
            <span className="text-sm font-bold text-slate-700">{title}</span>
            {subtitle && <span className="text-xs text-slate-400 ml-2">{subtitle}</span>}
          </div>
        </div>
        <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${open ? 'bg-slate-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
          {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>
      {open && <div className="px-4 pb-4 pt-3 bg-white">{children}</div>}
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

interface DonutChartProps {
  slices: PieSlice[];
  title: string;
  centerTotal?: number;
  selectOptions?: { value: string; label: string }[];
  selectedOption?: string;
  onOptionChange?: (v: string) => void;
}

export function DonutChart({ slices, title, centerTotal, selectOptions, selectedOption, onOptionChange }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const displayTotal = centerTotal ?? total;

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
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</div>
        {selectOptions && onOptionChange && (
          <select
            value={selectedOption}
            onChange={e => onOptionChange(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300"
          >
            {selectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </div>

      {/* Donut — centré, taille généreuse */}
      <div className="flex justify-center">
        <div className="w-44 h-44">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {paths.map(({ d, color, index }) => (
              <path key={index} d={d} fill={color}
                opacity={hovered !== null && hovered !== index ? 0.35 : 1}
                style={{ transformOrigin: '100px 100px', transform: hovered === index ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.15s ease, opacity 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} />
            ))}
            <circle cx="100" cy="100" r="44" fill="white" />
            {hoveredSlice ? (
              <>
                <text x="100" y="95" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b" dominantBaseline="middle">{hoveredSlice.value}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="9" fill="#94a3b8" dominantBaseline="middle">{hoveredSlice.label.substring(0, 16)}</text>
              </>
            ) : (
              <>
                <text x="100" y="96" textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e293b" dominantBaseline="middle">{formatNum(displayTotal)}</text>
                <text x="100" y="116" textAnchor="middle" fontSize="9" fill="#94a3b8" dominantBaseline="middle">total</text>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Légende en 2 colonnes sous le graphique */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {slices.map((sl, i) => (
          <div key={i} className="flex items-center gap-1.5 cursor-default min-w-0"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: sl.color, opacity: hovered !== null && hovered !== i ? 0.35 : 1 }} />
            <span className={`text-xs truncate flex-1 transition-colors ${hovered === i ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{sl.label}</span>
            <span className={`text-xs font-semibold flex-shrink-0 ml-1 ${hovered === i ? 'text-slate-800' : 'text-slate-400'}`}>{sl.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Build slices from rows ───────────────────────────────────────────────────

export function buildSlices(rows: SliceRow[], field: string, colors: string[]): PieSlice[] {
  return rows
    .map((r, i) => ({ label: r.nom as string, value: (r[field] as number) ?? 0, color: colors[i % colors.length] }))
    .sort((a, b) => b.value - a.value);
}

export function buildSlicesTop(rows: SliceRow[], field: string, colors: string[], limit = 10): PieSlice[] {
  const sorted = buildSlices(rows, field, colors);
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((s, r) => s + r.value, 0);
  if (rest > 0) top.push({ label: 'Autres', value: rest, color: colors[colors.length - 1] });
  return top;
}

// ─── LineChart ────────────────────────────────────────────────────────────────

interface StatutCfg { color: string; label: string }

interface LineChartProps {
  data: TimePoint[];
  statutConfig: Record<string, StatutCfg>;
  visibleStatuts: Set<string>;
  onToggleStatut: (s: string) => void;
  tooltip: { x: number; y: number; label: string; value: number; statut: string } | null;
  onHover: (t: { x: number; y: number; label: string; value: number; statut: string } | null) => void;
  yUnit?: string;
}

export function LineChart({ data, statutConfig, visibleStatuts, onToggleStatut, tooltip, onHover, yUnit }: LineChartProps) {
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

// ─── YearSelect / PeriodSelect ────────────────────────────────────────────────

export const YEARS = [2022, 2023, 2024, 2025, 2026];
export type Periodicite = 'mois' | 'an';
export type CriticitéKey = 'critique' | 'majeure' | 'mineure';

interface YearSelectProps { value: number; onChange: (y: number) => void; }
export function YearSelect({ value, onChange }: YearSelectProps) {
  return (
    <select value={value} onChange={e => onChange(Number(e.target.value))}
      className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300">
      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}

interface PeriodSelectProps { value: Periodicite; onChange: (p: Periodicite) => void; }
export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as Periodicite)}
      className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300">
      <option value="mois">Par mois</option>
      <option value="an">Par an</option>
    </select>
  );
}

// ─── CriticitéFilter ──────────────────────────────────────────────────────────

export const CRITICITE_CONFIG: Record<CriticitéKey, { color: string; label: string; icon: string }> = {
  critique: { color: '#ef4444', label: 'Critique', icon: '🚨' },
  majeure:  { color: '#f97316', label: 'Majeure',  icon: '⚠️' },
  mineure:  { color: '#3b82f6', label: 'Mineure',  icon: '🔎' },
};

export const CRITICITE_RATIOS: Record<CriticitéKey, number> = { critique: 0.15, majeure: 0.30, mineure: 0.55 };

export function CriticitéFilter({ selected, onChange }: { selected: Set<CriticitéKey>; onChange: (s: Set<CriticitéKey>) => void }) {
  const toggle = (k: CriticitéKey) => {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k); else next.add(k);
    onChange(next);
  };
  return (
    <div className="flex gap-3 flex-wrap">
      {(Object.entries(CRITICITE_CONFIG) as [CriticitéKey, typeof CRITICITE_CONFIG[CriticitéKey]][]).map(([k, cfg]) => (
        <label key={k} className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" checked={selected.has(k)} onChange={() => toggle(k)}
            className="w-3.5 h-3.5 rounded cursor-pointer flex-shrink-0" style={{ accentColor: cfg.color }} />
          <span className="text-sm leading-none">{cfg.icon}</span>
          <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Generic select for ventilation / assignation dims ───────────────────────

export const VENTILATION_TYPE_OPTIONS = [
  { value: 'type_controle',      label: 'Par type de contrôle' },
  { value: 'categorie_equipement', label: 'Par catégorie d\'équipement' },
  { value: 'categorie_site',     label: 'Par catégorie de site' },
];

export const VENTILATION_ACTIF_OPTIONS_ALL = [
  { value: 'campus',    label: 'Par campus' },
];
export const VENTILATION_ACTIF_OPTIONS_SITE = [
  { value: 'residence', label: 'Par résidence' },
];
export const VENTILATION_ACTIF_OPTIONS_RESIDENCE = [
  { value: 'batiment',  label: 'Par bâtiment' },
  { value: 'etage',     label: 'Par étage' },
  { value: 'logement',  label: 'Par logement' },
];
export const VENTILATION_ACTIF_OPTIONS_EQUIPEMENTS = [
  { value: 'equipement', label: 'Par équipement rattaché' },
];

export const VENTILATION_ASSIGNATION_OPTIONS = [
  { value: 'prestataire', label: 'Par prestataire' },
  { value: 'service',     label: 'Par service' },
  { value: 'equipe',      label: 'Par équipe' },
  { value: 'agent',       label: 'Par agent' },
];

export const EVOLUTION_ACTIF_OPTIONS_ALL = [
  { value: 'campus',     label: 'Par campus' },
  { value: 'equipement', label: 'Par équipement rattaché' },
];
export const EVOLUTION_ACTIF_OPTIONS_SITE = [
  { value: 'residence',  label: 'Par résidence (enfants)' },
  { value: 'equipement', label: 'Par équipement rattaché' },
];
export const EVOLUTION_ACTIF_OPTIONS_RESIDENCE = [
  { value: 'batiment',   label: 'Par bâtiment' },
  { value: 'etage',      label: 'Par étage' },
  { value: 'logement',   label: 'Par logement' },
  { value: 'equipement', label: 'Par équipement rattaché' },
];

export const ASSIGNATION_OPTIONS = [
  { value: 'prestataire', label: 'Par prestataire' },
  { value: 'service',     label: 'Par service' },
  { value: 'equipe',      label: 'Par équipe' },
  { value: 'agent',       label: 'Par agent' },
];

// ─── KpiCard ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string; value: number; img: string;
  bg: string; border: string; textColor: string; valueColor: string; accentBorder: string;
  isActive?: boolean; onClick?: () => void;
}

export function KpiCard({ label, value, img, bg, border, textColor, valueColor, accentBorder, isActive, onClick }: KpiCardProps) {
  return (
    <button onClick={onClick}
      className={`relative w-full text-left rounded-xl border-2 ${isActive ? accentBorder : border} ${bg} px-4 py-3 flex items-center gap-3 overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:shadow-sm' : ''} ${isActive ? 'shadow-sm' : ''}`}>
      <div className="flex-1 min-w-0 z-10">
        <span className={`block text-xs font-bold uppercase tracking-widest ${textColor} leading-tight mb-1`}>{label}</span>
        <span className={`block text-3xl font-bold ${valueColor} leading-none`}>{formatNum(value)}</span>
      </div>
      <img src={img} alt="" className="w-14 h-14 object-contain opacity-80 flex-shrink-0 pointer-events-none select-none" />
    </button>
  );
}

// ─── AccordionSection (top-level) ─────────────────────────────────────────────

interface AccordionSectionProps {
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  accentColor: string;
  children: React.ReactNode;
}

export function AccordionSection({ title, subtitle, defaultOpen = true, accentColor, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50/60 transition-colors group">
        <div className="flex items-center gap-3">
          <span className={`w-1 h-9 rounded-full ${accentColor}`} />
          <div className="text-left">
            <div className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</div>
            <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
          </div>
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${open ? 'bg-slate-100' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
          {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>
      {open && <div className="px-6 pb-6 pt-1">{children}</div>}
    </div>
  );
}

// ─── MiniSelect ──────────────────────────────────────────────────────────────

interface MiniSelectProps { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; }

export function MiniSelect({ value, onChange, options }: MiniSelectProps) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export { COLORS_TYPE, COLORS_RESIDENCES };
