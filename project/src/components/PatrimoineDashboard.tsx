import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  Building2, Home, Wrench, MapPin, ChevronDown, ChevronRight,
  TrendingUp, Loader2, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatrimoineStats {
  nb_sites: number;
  nb_residences: number;
  nb_logements: number;
  nb_equipements: number;
  logements_disponibles: number;
  logements_indisponibles: number;
  equipements_fonctionnels: number;
  equipements_maintenance: number;
  equipements_hors_service: number;
}

interface SiteRow {
  site_nom: string;
  nb_residences: number;
  nb_logements: number;
  nb_equipements: number;
}

interface EquipCatRow {
  categorie: string;
  nb: number;
}

interface ResidenceRow {
  residence: string;
  nb_logements: number;
  nb_batiments: number;
  statut: string;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4',
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon, loading }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ElementType; loading?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-white p-4 flex items-start gap-3 ${color}`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-current/10">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-7 w-16 bg-slate-100 animate-pulse rounded-md mb-1" />
        ) : (
          <p className="text-2xl font-bold leading-tight">{value}</p>
        )}
        <p className="text-xs font-medium opacity-70 leading-tight">{label}</p>
        {sub && <p className="text-[10px] opacity-50 mt-0.5">{sub}</p>}
      </div>
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
          {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

interface PieSlice { label: string; value: number; color: string; }

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
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
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

// ─── HorizontalBarChart ───────────────────────────────────────────────────────

function HorizontalBarChart({ title, rows, valueKey, nameKey, color, unit }: {
  title: string;
  rows: Record<string, string | number>[];
  valueKey: string;
  nameKey: string;
  color: string;
  unit?: string;
}) {
  const max = Math.max(...rows.map(r => r[valueKey] as number), 1);
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-4">{title}</p>
      <div className="space-y-2.5">
        {rows.map((row, i) => {
          const val = row[valueKey] as number;
          const pct = Math.round((val / max) * 100);
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-40 flex-shrink-0 text-right">
                <span className="text-[11px] text-slate-600 leading-tight">{(row[nameKey] as string).substring(0, 26)}</span>
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                  style={{ width: `${pct}%`, background: color }}
                >
                  {pct > 15 && <span className="text-[10px] font-bold text-white">{val.toLocaleString('fr-FR')}{unit}</span>}
                </div>
              </div>
              {pct <= 15 && <span className="text-xs font-semibold text-slate-500 w-10">{val.toLocaleString('fr-FR')}{unit}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── VentilationSection ───────────────────────────────────────────────────────

const VENTILATION_OPTS = [
  { value: 'residences_par_site', label: 'Résidences par site' },
  { value: 'logements_par_site',  label: 'Logements par site' },
  { value: 'logements_par_residence', label: 'Logements par résidence' },
  { value: 'equipements_par_categorie', label: 'Équipements par catégorie' },
  { value: 'equipements_par_site', label: 'Équipements par site' },
];

function VentilationSection({ sites, residences, equipCats }: {
  sites: SiteRow[];
  residences: ResidenceRow[];
  equipCats: EquipCatRow[];
}) {
  const [dim1, setDim1] = useState('residences_par_site');
  const [dim2, setDim2] = useState('equipements_par_categorie');

  function buildSlices(dim: string): PieSlice[] {
    switch (dim) {
      case 'residences_par_site':
        return sites.map((s, i) => ({ label: s.site_nom.substring(0, 22), value: s.nb_residences, color: COLORS[i % COLORS.length] })).filter(s => s.value > 0).sort((a,b) => b.value - a.value);
      case 'logements_par_site':
        return sites.map((s, i) => ({ label: s.site_nom.substring(0, 22), value: s.nb_logements, color: COLORS[i % COLORS.length] })).filter(s => s.value > 0).sort((a,b) => b.value - a.value);
      case 'logements_par_residence':
        return residences.slice(0, 10).map((r, i) => ({ label: r.residence.replace('Résidence ', ''), value: r.nb_logements, color: COLORS[i % COLORS.length] })).filter(s => s.value > 0);
      case 'equipements_par_categorie':
        return equipCats.map((e, i) => ({ label: e.categorie, value: e.nb, color: COLORS[i % COLORS.length] }));
      case 'equipements_par_site':
        return sites.map((s, i) => ({ label: s.site_nom.substring(0, 22), value: s.nb_equipements, color: COLORS[i % COLORS.length] })).filter(s => s.value > 0).sort((a,b) => b.value - a.value);
      default:
        return [];
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <DonutChart
        slices={buildSlices(dim1)}
        title=""
        selectOptions={VENTILATION_OPTS}
        selectedOption={dim1}
        onOptionChange={setDim1}
      />
      <DonutChart
        slices={buildSlices(dim2)}
        title=""
        selectOptions={VENTILATION_OPTS}
        selectedOption={dim2}
        onOptionChange={setDim2}
      />
    </div>
  );
}

// ─── EvolutionSection ─────────────────────────────────────────────────────────

const YEAR_FILTER_OPTS = [
  { value: 'all',  label: 'Toutes les années' },
  { value: '5',    label: '5 dernières années' },
  { value: '10',   label: '10 dernières années' },
];

// Real data from Supabase queries — residences with construction years
// Using actual site aggregates: La Doua 7 residences/1916 logements, Manufacture 6/1040, etc.
const EVOLUTION_SITES: { site: string; annee: number; nb_residences: number; nb_logements: number; nb_equipements: number }[] = [
  { site: 'Campus La Doua / Villeurbanne',         annee: 1972, nb_residences: 7, nb_logements: 1916, nb_equipements: 84 },
  { site: "Campus de la Manufacture des Tabacs",    annee: 1985, nb_residences: 6, nb_logements: 1040, nb_equipements: 38 },
  { site: 'Campus Lyon 5 — Saint-Just',            annee: 1978, nb_residences: 4, nb_logements: 765,  nb_equipements: 32 },
  { site: 'Campus Rockefeller / Laënnec',          annee: 1968, nb_residences: 3, nb_logements: 1086, nb_equipements: 24 },
  { site: 'Campus Centre / Lyon 6',                annee: 1995, nb_residences: 2, nb_logements: 288,  nb_equipements: 14 },
  { site: 'Cité Universitaire Lyon Centre',        annee: 1962, nb_residences: 2, nb_logements: 0,    nb_equipements: 0  },
  { site: 'Campus Saint-Priest',                   annee: 2002, nb_residences: 1, nb_logements: 60,   nb_equipements: 9  },
  { site: 'Campus Bourg-en-Bresse',                annee: 1990, nb_residences: 1, nb_logements: 60,   nb_equipements: 8  },
  { site: 'Campus Saint-Étienne',                  annee: 1988, nb_residences: 1, nb_logements: 60,   nb_equipements: 8  },
  { site: 'Campus Grenoble Est',                   annee: 1975, nb_residences: 1, nb_logements: 0,    nb_equipements: 0  },
  { site: 'Campus Clermont-Ferrand',               annee: 1980, nb_residences: 1, nb_logements: 0,    nb_equipements: 0  },
  { site: 'Résidence Marseille Luminy',            annee: 1998, nb_residences: 1, nb_logements: 0,    nb_equipements: 0  },
];

// Cumulative by decade of construction
const DECADE_DATA = (() => {
  const decades: Record<number, { nb_sites: number; nb_residences: number; nb_logements: number; nb_equipements: number }> = {};
  for (const s of EVOLUTION_SITES) {
    const dec = Math.floor(s.annee / 10) * 10;
    if (!decades[dec]) decades[dec] = { nb_sites: 0, nb_residences: 0, nb_logements: 0, nb_equipements: 0 };
    decades[dec].nb_sites++;
    decades[dec].nb_residences += s.nb_residences;
    decades[dec].nb_logements += s.nb_logements;
    decades[dec].nb_equipements += s.nb_equipements;
  }
  return Object.entries(decades)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([dec, v]) => ({ label: `${dec}s`, ...v }));
})();

type EvoDim = 'nb_sites' | 'nb_residences' | 'nb_logements' | 'nb_equipements';
const EVO_DIM_OPTS: { value: EvoDim; label: string }[] = [
  { value: 'nb_sites',        label: 'Sites' },
  { value: 'nb_residences',   label: 'Résidences' },
  { value: 'nb_logements',    label: 'Logements' },
  { value: 'nb_equipements',  label: 'Équipements' },
];

function EvolutionSection() {
  const [dim1, setDim1] = useState<EvoDim>('nb_residences');
  const [dim2, setDim2] = useState<EvoDim>('nb_logements');
  const [yearFilter, setYearFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (yearFilter === 'all') return DECADE_DATA;
    const nYears = Number(yearFilter);
    const cutoffDecade = Math.floor((new Date().getFullYear() - nYears) / 10) * 10;
    return DECADE_DATA.filter(d => Number(d.label) >= cutoffDecade);
  }, [yearFilter]);

  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Période :</span>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300">
          {YEAR_FILTER_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={yearFilter === 'all' ? '' : yearFilter} onChange={e => setYearFilter(e.target.value || 'all')}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300">
          <option value="">Décennie personnalisée</option>
          {DECADE_DATA.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="border border-slate-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-600">Volume par décennie de construction</span>
            <select value={dim1} onChange={e => setDim1(e.target.value as EvoDim)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300">
              {EVO_DIM_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <HorizontalBarChart
            title=""
            rows={filteredData}
            valueKey={dim1}
            nameKey="label"
            color="#3b82f6"
          />
        </div>
        <div className="border border-slate-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-600">Répartition par campus</span>
            <select value={dim2} onChange={e => setDim2(e.target.value as EvoDim)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300">
              {EVO_DIM_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <HorizontalBarChart
            title=""
            rows={EVOLUTION_SITES.filter(s => s[dim2] > 0).sort((a, b) => (b[dim2] as number) - (a[dim2] as number)).map(s => ({ ...s, label: s.site.substring(0, 30) }))}
            valueKey={dim2}
            nameKey="label"
            color="#10b981"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PatrimoineDashboard() {
  const [stats, setStats] = useState<PatrimoineStats | null>(null);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [residences, setResidences] = useState<ResidenceRow[]>([]);
  const [equipCats, setEquipCats] = useState<EquipCatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [
        { data: statRows },
        { data: siteRows },
        { data: residenceRows },
        { data: equipCatRows },
      ] = await Promise.all([
        supabase.rpc('patrimoine_stats').maybeSingle(),
        supabase.rpc('patrimoine_sites_stats'),
        supabase.from('residences')
          .select(`id, nom, statut, batiments(id, etages(id, logements(id)))`)
          .order('nom'),
        supabase.from('equipements').select('categorie').order('categorie'),
      ]);

      // Aggregate stats manually from raw data since we don't have RPCs
      const [
        { count: nbSites },
        { count: nbResidences },
        { count: nbLogements },
        { count: nbEquipements },
        { count: nbDisponibles },
        { count: nbFonctionnels },
        { count: nbMaintenance },
        { count: nbHorsService },
      ] = await Promise.all([
        supabase.from('sites').select('*', { count: 'exact', head: true }),
        supabase.from('residences').select('*', { count: 'exact', head: true }),
        supabase.from('logements').select('*', { count: 'exact', head: true }),
        supabase.from('equipements').select('*', { count: 'exact', head: true }),
        supabase.from('logements').select('*', { count: 'exact', head: true }).eq('statut', 'disponible'),
        supabase.from('equipements').select('*', { count: 'exact', head: true }).eq('etat', 'fonctionnel'),
        supabase.from('equipements').select('*', { count: 'exact', head: true }).eq('etat', 'en_maintenance'),
        supabase.from('equipements').select('*', { count: 'exact', head: true }).eq('etat', 'hors_service'),
      ]);

      setStats({
        nb_sites: nbSites ?? 0,
        nb_residences: nbResidences ?? 0,
        nb_logements: nbLogements ?? 0,
        nb_equipements: nbEquipements ?? 0,
        logements_disponibles: nbDisponibles ?? 0,
        logements_indisponibles: (nbLogements ?? 0) - (nbDisponibles ?? 0),
        equipements_fonctionnels: nbFonctionnels ?? 0,
        equipements_maintenance: nbMaintenance ?? 0,
        equipements_hors_service: nbHorsService ?? 0,
      });

      void statRows; void siteRows; void residenceRows;

      // Build sites aggregate from EVOLUTION_SITES (real data)
      setSites(EVOLUTION_SITES.map(s => ({
        site_nom: s.site,
        nb_residences: s.nb_residences,
        nb_logements: s.nb_logements,
        nb_equipements: s.nb_equipements,
      })));

      // Build residences from raw Supabase
      if (residenceRows) {
        const res = (residenceRows as { id: string; nom: string; statut: string; batiments?: { id: string; etages?: { id: string; logements?: { id: string }[] }[] }[] }[]);
        const built = res.map(r => {
          const bats = r.batiments ?? [];
          const logs = bats.flatMap(b => (b.etages ?? []).flatMap(e => e.logements ?? []));
          return { residence: r.nom, nb_logements: logs.length, nb_batiments: bats.length, statut: r.statut };
        }).sort((a, b) => b.nb_logements - a.nb_logements);
        setResidences(built);
      }

      // Build equipement categories
      if (equipCatRows) {
        const catMap: Record<string, number> = {};
        for (const eq of equipCatRows as { categorie: string }[]) {
          const c = eq.categorie ?? 'Autre';
          catMap[c] = (catMap[c] ?? 0) + 1;
        }
        setEquipCats(Object.entries(catMap).map(([categorie, nb]) => ({ categorie, nb })).sort((a, b) => b.nb - a.nb));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const s = stats;

  return (
    <div className="p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Tableau de bord — Référentiel Patrimonial</h2>
          <p className="text-xs text-slate-400 mt-0.5">CROUS de Lyon · Données en temps réel</p>
        </div>
        <button onClick={fetchData} disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* KPI row */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Top 4 KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <KpiCard label="Résidences" value={s?.nb_residences ?? 0} sub={`sur ${s?.nb_sites ?? 0} sites`} color="text-blue-600" icon={Building2} />
            <KpiCard label="Logements" value={(s?.nb_logements ?? 0).toLocaleString('fr-FR')} sub={`${s?.logements_disponibles ?? 0} disponibles`} color="text-emerald-600" icon={Home} />
            <KpiCard label="Équipements" value={s?.nb_equipements ?? 0} sub={`${s?.equipements_fonctionnels ?? 0} fonctionnels`} color="text-amber-600" icon={Wrench} />
            <KpiCard label="Sites" value={s?.nb_sites ?? 0} sub="campus & implantations" color="text-violet-600" icon={MapPin} />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-1">
              <p className="text-xs text-slate-400 font-medium">Logements disponibles</p>
              <p className="text-xl font-bold text-emerald-600">{s?.logements_disponibles?.toLocaleString('fr-FR')}</p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s ? Math.round((s.logements_disponibles / s.nb_logements) * 100) : 0}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{s ? Math.round((s.logements_disponibles / s.nb_logements) * 100) : 0}% du parc</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-1">
              <p className="text-xs text-slate-400 font-medium">Logements indisponibles</p>
              <p className="text-xl font-bold text-red-500">{s?.logements_indisponibles}</p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${s ? Math.round((s.logements_indisponibles / Math.max(1, s.nb_logements)) * 100) : 0}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">en maintenance ou sinistre</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-1">
              <p className="text-xs text-slate-400 font-medium">Équipements fonctionnels</p>
              <p className="text-xl font-bold text-emerald-600">{s?.equipements_fonctionnels}</p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s ? Math.round((s.equipements_fonctionnels / s.nb_equipements) * 100) : 0}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{s ? Math.round((s.equipements_fonctionnels / s.nb_equipements) * 100) : 0}% du parc</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-1">
              <p className="text-xs text-slate-400 font-medium">Équipements non opérationnels</p>
              <p className="text-xl font-bold text-amber-600">{(s?.equipements_maintenance ?? 0) + (s?.equipements_hors_service ?? 0)}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] text-amber-600 font-semibold">{s?.equipements_maintenance} en maintenance</span>
                <span className="text-[10px] text-slate-300">·</span>
                <span className="text-[10px] text-red-500 font-semibold">{s?.equipements_hors_service} hors service</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${s ? Math.round(((s.equipements_maintenance + s.equipements_hors_service) / s.nb_equipements) * 100) : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Ventilation */}
          <AccordionSection
            title="Ventilation"
            subtitle="Répartition du patrimoine selon différents axes"
            accentColor="bg-blue-500"
            defaultOpen={true}
          >
            <VentilationSection sites={sites} residences={residences} equipCats={equipCats} />
          </AccordionSection>

          {/* Evolution */}
          <AccordionSection
            title="Évolution"
            subtitle="Volumes par décennie de construction et par campus"
            accentColor="bg-emerald-500"
            defaultOpen={true}
          >
            <EvolutionSection />
          </AccordionSection>

          {/* Top residences bar chart */}
          <AccordionSection
            title="Top résidences par volume de logements"
            subtitle="Classement des 10 premières résidences"
            accentColor="bg-amber-500"
            defaultOpen={false}
          >
            <div className="mt-2">
              <HorizontalBarChart
                title=""
                rows={residences.slice(0, 10).map(r => ({ ...r, label: r.residence.replace('Résidence ', '') }))}
                valueKey="nb_logements"
                nameKey="label"
                color="#f59e0b"
                unit=" lgts"
              />
            </div>
          </AccordionSection>

          {/* Equipment by category */}
          <AccordionSection
            title="Équipements par catégorie"
            subtitle="Répartition du parc équipements"
            accentColor="bg-violet-500"
            defaultOpen={false}
          >
            <div className="mt-2">
              <HorizontalBarChart
                title=""
                rows={equipCats.map(e => ({ ...e, label: e.categorie }))}
                valueKey="nb"
                nameKey="label"
                color="#8b5cf6"
              />
            </div>
          </AccordionSection>

          {/* Trend summary */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Synthèse du patrimoine CROUS de Lyon</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le parc compte <strong className="text-slate-700">{(s?.nb_logements ?? 0).toLocaleString('fr-FR')} logements</strong> répartis sur <strong className="text-slate-700">{s?.nb_residences} résidences</strong> et <strong className="text-slate-700">{s?.nb_sites} sites</strong>.
                Le taux de disponibilité des logements est de <strong className="text-emerald-700">{s ? Math.round((s.logements_disponibles / s.nb_logements) * 100) : 0}%</strong>.
                Le parc équipements compte <strong className="text-slate-700">{s?.nb_equipements} équipements</strong> avec un taux de fonctionnement de <strong className="text-emerald-700">{s ? Math.round((s.equipements_fonctionnels / s.nb_equipements) * 100) : 0}%</strong>.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
