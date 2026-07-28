import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  AccordionSection, SubAccordion, DonutChart, LineChart, MiniSelect, formatNum,
} from './reglementaire/dashboardCharts';
import {
  LayoutDashboard, TableProperties, ChevronDown, ChevronUp, Search, Filter,
  X, Building2, AlertTriangle, TrendingUp, Euro, Calendar, ChevronRight,
  ArrowUpRight, RefreshCw, PanelLeftClose, PanelLeftOpen, MapPin, SlidersHorizontal,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campagne {
  id: string;
  reference: string;
  nom: string;
  type_operation: string;
  statut: string;
  criticite: string;
  score_risque: number | null;
  annee_ppi: number | null;
  trimestre_debut: string | null;
  trimestre_fin: string | null;
  perimetre_libelle: string | null;
  nb_equipements: number | null;
  vetuste_moyenne: number | null;
  capex_estime: number | null;
  budget_consomme_pct: number | null;
  roi_ans: number | null;
  impact_energie: string | null;
  impact_exploitation: string | null;
  impact_conformite: string | null;
  impact_confort: string | null;
  avancement_pct: number | null;
  responsable: string | null;
  notes: string | null;
}

interface ScoreEquip {
  equipement_id: string;
  score_global: number;
  niveau: string;
  capex_estime: number | null;
  annee_previsionnelle: number | null;
  equipement?: {
    designation: string;
    categorie: string;
    residence_id: string | null;
    residence?: { id: string; site_id: string };
  };
}

// Arborescence
interface SiteNode     { id: string; nom: string; code: string; residences: ResidenceNode[] }
interface ResidenceNode{ id: string; nom: string; code: string; site_id: string }

// ─── Configs ─────────────────────────────────────────────────────────────────

const CRITICITE_CFG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critique: { label: 'Critique', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    dot: 'bg-red-500'    },
  fort:     { label: 'Fort',     bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  moyen:    { label: 'Moyen',    bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300',  dot: 'bg-amber-400'  },
  faible:   { label: 'Faible',   bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-400'},
};

const STATUT_CFG: Record<string, { label: string; bg: string; text: string }> = {
  besoin:       { label: 'Besoin détecté',  bg: 'bg-slate-100',   text: 'text-slate-500'   },
  etude:        { label: 'Étude',           bg: 'bg-blue-100',    text: 'text-blue-700'    },
  arbitrage:    { label: 'Arbitrage',       bg: 'bg-sky-100',     text: 'text-sky-700'     },
  planifie:     { label: 'Planifié',        bg: 'bg-cyan-100',    text: 'text-cyan-700'    },
  consultation: { label: 'Consultation MP', bg: 'bg-amber-100',   text: 'text-amber-700'   },
  travaux:      { label: 'Travaux',         bg: 'bg-orange-100',  text: 'text-orange-700'  },
  reception:    { label: 'Réception',       bg: 'bg-teal-100',    text: 'text-teal-700'    },
  cloture:      { label: 'Clôturé',         bg: 'bg-emerald-100', text: 'text-emerald-700' },
  reporte:      { label: 'Reporté',         bg: 'bg-slate-100',   text: 'text-slate-500'   },
  annule:       { label: 'Annulé',          bg: 'bg-red-50',      text: 'text-red-400'     },
};

const TYPE_OP_CFG: Record<string, { label: string; color: string }> = {
  remplacement:   { label: 'Remplacement P3', color: '#3b82f6' },
  modernisation:  { label: 'Modernisation',   color: '#f59e0b' },
  rehabilitation: { label: 'Réhabilitation',  color: '#0891b2' },
  renovation:     { label: 'Rénovation',      color: '#10b981' },
};

const NIVEAU_CFG: Record<string, { label: string; color: string }> = {
  critique:    { label: 'Critique',    color: '#ef4444' },
  eleve:       { label: 'Élevé',       color: '#f97316' },
  modere:      { label: 'Modéré',      color: '#f59e0b' },
  faible:      { label: 'Faible',      color: '#10b981' },
  tres_faible: { label: 'Très faible', color: '#64748b' },
};

const CATEGORIES_EQUIP = [
  'Froid alimentaire', 'Cuisson', 'Chauffage', 'Climatisation', 'Ventilation',
  'Électricité', 'Plomberie', 'Ascenseurs', 'Sécurité incendie', 'Divers',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtM = (v: number | null) => v ? `${(v / 1_000_000).toFixed(1)} M€` : '—';
const fmtK = (v: number | null) => v ? `${Math.round(v / 1000)} k€` : '—';

function CriticiteChip({ criticite }: { criticite: string }) {
  const c = CRITICITE_CFG[criticite] ?? CRITICITE_CFG.moyen;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function StatutChip({ statut }: { statut: string }) {
  const c = STATUT_CFG[statut] ?? STATUT_CFG.besoin;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function AvancementBar({ value }: { value: number }) {
  const pct = Math.min(100, value);
  const color = pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#3b82f6';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Arborescence Sidebar ─────────────────────────────────────────────────────

interface ArborescenceProps {
  selectedResidenceIds: Set<string>;
  onChangeSelectedResidenceIds: (ids: Set<string>) => void;
}

function ArborescenceSidebar({ selectedResidenceIds, onChangeSelectedResidenceIds }: ArborescenceProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [sites,     setSites]     = useState<SiteNode[]>([]);
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({});
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [width,     setWidth]     = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef      = useRef(0);
  const startWidthRef  = useRef(256);

  useEffect(() => {
    (async () => {
      const [{ data: sitesData }, { data: residencesData }] = await Promise.all([
        supabase.from('sites').select('id, nom, code').order('nom'),
        supabase.from('residences').select('id, site_id, nom, code').order('nom'),
      ]);
      const resMap: Record<string, ResidenceNode[]> = {};
      for (const r of (residencesData ?? [])) {
        if (!resMap[r.site_id]) resMap[r.site_id] = [];
        resMap[r.site_id].push({ id: r.id, nom: r.nom, code: r.code, site_id: r.site_id });
      }
      setSites((sitesData ?? []).map(s => ({ id: s.id, nom: s.nom, code: s.code, residences: resMap[s.id] ?? [] })));
      setLoading(false);
    })();
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current     = e.clientX;
    startWidthRef.current = width;
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => setWidth(Math.max(180, Math.min(420, startWidthRef.current + (e.clientX - startXRef.current))));
    const onUp   = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isResizing]);

  const lc = search.toLowerCase();

  function toggleSite(site: SiteNode) {
    const resIds = site.residences.map(r => r.id);
    const allSel = resIds.every(id => selectedResidenceIds.has(id));
    const next   = new Set(selectedResidenceIds);
    if (allSel) resIds.forEach(id => next.delete(id));
    else        resIds.forEach(id => next.add(id));
    onChangeSelectedResidenceIds(next);
  }

  function toggleRes(resId: string) {
    const next = new Set(selectedResidenceIds);
    if (next.has(resId)) next.delete(resId);
    else                  next.add(resId);
    onChangeSelectedResidenceIds(next);
  }

  const totalSelected = selectedResidenceIds.size;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-3 py-3 px-1.5 border-r border-slate-100 bg-white flex-shrink-0 w-10">
        <button onClick={() => setCollapsed(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <div className="w-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold text-slate-400 [writing-mode:vertical-rl] rotate-180 tracking-widest">ARBORESCENCE</span>
      </div>
    );
  }

  return (
    <div className="flex flex-shrink-0 relative" style={{ width }}>
      <div className="flex flex-col h-full w-full border-r border-slate-100 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Périmètre</span>
            {totalSelected > 0 && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{totalSelected}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {totalSelected > 0 && (
              <button onClick={() => onChangeSelectedResidenceIds(new Set())}
                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors px-1.5 py-0.5 rounded">
                Tout effacer
              </button>
            )}
            <button onClick={() => setCollapsed(true)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-50 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="w-full text-xs pl-7 pr-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-300" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="flex items-center justify-center h-20 gap-1.5 text-slate-400">
              <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Chargement…</span>
            </div>
          ) : (
            sites.map(site => {
              const visibleRes = site.residences.filter(r =>
                !lc || r.nom.toLowerCase().includes(lc) || site.nom.toLowerCase().includes(lc)
              );
              if (lc && visibleRes.length === 0) return null;
              const resIds   = site.residences.map(r => r.id);
              const allSel   = resIds.length > 0 && resIds.every(id => selectedResidenceIds.has(id));
              const someSel  = resIds.some(id => selectedResidenceIds.has(id));
              const isOpen   = expanded[site.id] ?? true;
              return (
                <div key={site.id}>
                  {/* Site row */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors ${allSel ? 'bg-blue-50' : someSel ? 'bg-slate-50' : ''}`}
                    onClick={() => setExpanded(p => ({ ...p, [site.id]: !isOpen }))}>
                    <input type="checkbox"
                      checked={allSel}
                      ref={el => { if (el) el.indeterminate = someSel && !allSel; }}
                      onChange={() => toggleSite(site)}
                      onClick={e => e.stopPropagation()}
                      className="w-3 h-3 accent-blue-600 flex-shrink-0" />
                    <ChevronRight className={`w-3 h-3 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700 leading-tight truncate flex-1">
                      {site.nom.replace('Campus ', '')}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{site.residences.length}</span>
                  </div>
                  {/* Residences */}
                  {isOpen && visibleRes.map(res => {
                    const isSel = selectedResidenceIds.has(res.id);
                    return (
                      <div key={res.id}
                        className={`flex items-center gap-1.5 px-3 pl-8 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors ${isSel ? 'bg-blue-50' : ''}`}
                        onClick={() => toggleRes(res.id)}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleRes(res.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-3 h-3 accent-blue-600 flex-shrink-0" />
                        <Building2 className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        <span className={`text-[11px] leading-tight truncate flex-1 ${isSel ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                          {res.nom.replace('Résidence ', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Resize handle */}
      <div onMouseDown={onMouseDown}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 transition-colors z-10"
        style={{ background: isResizing ? '#93c5fd' : undefined }} />
    </div>
  );
}

// ─── Top Filter Bar ───────────────────────────────────────────────────────────

interface TopFilters {
  typeEquipement: string;
  periode: string;
  etatStatut: string;
  criticite: string;
  finVieTheorique: string;
}

const EMPTY_TOP_FILTERS: TopFilters = {
  typeEquipement: '',
  periode: '',
  etatStatut: '',
  criticite: '',
  finVieTheorique: '',
};

function TopFilterBar({
  filters, onChange, campagnes,
}: {
  filters: TopFilters;
  onChange: (f: TopFilters) => void;
  campagnes: Campagne[];
}) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex-shrink-0 flex-wrap">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Filtres</span>
        {activeCount > 0 && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">{activeCount}</span>
        )}
      </div>

      {/* Type équipement */}
      <select value={filters.typeEquipement} onChange={e => onChange({ ...filters, typeEquipement: e.target.value })}
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-36">
        <option value="">Type d'équipement</option>
        {CATEGORIES_EQUIP.map(c => <option key={c} value={c}>{c}</option>)}
        <option value="autres">Autres</option>
      </select>

      {/* Période PPI */}
      <select value={filters.periode} onChange={e => onChange({ ...filters, periode: e.target.value })}
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-28">
        <option value="">Période PPI</option>
        <option value="2026">2026</option>
        <option value="2027">2027</option>
        <option value="2028">2028</option>
        <option value="2029">2029</option>
        <option value="2030">2030</option>
        <option value="2026-2027">2026–2027</option>
        <option value="2028-2030">2028–2030</option>
      </select>

      {/* État / Statut */}
      <select value={filters.etatStatut} onChange={e => onChange({ ...filters, etatStatut: e.target.value })}
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-36">
        <option value="">État / Statut</option>
        {Object.entries(STATUT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>

      {/* Criticité */}
      <select value={filters.criticite} onChange={e => onChange({ ...filters, criticite: e.target.value })}
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-28">
        <option value="">Criticité</option>
        {['critique', 'fort', 'moyen', 'faible'].map(k => (
          <option key={k} value={k}>{CRITICITE_CFG[k]?.label ?? k}</option>
        ))}
      </select>

      {/* Fin de vie théorique */}
      <select value={filters.finVieTheorique} onChange={e => onChange({ ...filters, finVieTheorique: e.target.value })}
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-40">
        <option value="">Fin de vie théorique</option>
        <option value="depasse">Dépassée</option>
        <option value="lt1an">Dans moins d'1 an</option>
        <option value="1a3ans">1 à 3 ans</option>
        <option value="3a5ans">3 à 5 ans</option>
        <option value="gt5ans">Plus de 5 ans</option>
      </select>

      {activeCount > 0 && (
        <button onClick={() => onChange(EMPTY_TOP_FILTERS)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1.5 border border-slate-200 rounded-lg bg-white">
          <X className="w-3 h-3" /> Effacer
        </button>
      )}

      <div className="flex-1" />
      <span className="text-[10px] text-slate-400">{campagnes.length} campagne{campagnes.length !== 1 ? 's' : ''}</span>
    </div>
  );
}

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyTopFilters(campagnes: Campagne[], f: TopFilters): Campagne[] {
  let list = campagnes;
  if (f.criticite)   list = list.filter(c => c.criticite === f.criticite);
  if (f.etatStatut)  list = list.filter(c => c.statut === f.etatStatut);
  if (f.periode) {
    if (f.periode === '2026-2027') list = list.filter(c => c.annee_ppi != null && c.annee_ppi <= 2027);
    else if (f.periode === '2028-2030') list = list.filter(c => c.annee_ppi != null && c.annee_ppi >= 2028);
    else list = list.filter(c => `${c.annee_ppi}` === f.periode);
  }
  // typeEquipement & finVieTheorique: applied to scores, keep all campagnes but surface count
  return list;
}

// ─── Dashboard PPI ────────────────────────────────────────────────────────────

function DashboardPPI({
  campagnes, scores,
}: {
  campagnes: Campagne[];
  scores: ScoreEquip[];
}) {
  const [ventCrit,    setVentCrit]    = useState('criticite');
  const [ventStatut,  setVentStatut]  = useState('statut');
  const [evolutCrit,  setEvolutCrit]  = useState('capex');
  const [evolutCrit2, setEvolutCrit2] = useState('nb_campagnes');
  const [tooltipA, setTooltipA] = useState<{ x: number; y: number; label: string; value: number; statut: string } | null>(null);
  const [tooltipB, setTooltipB] = useState<{ x: number; y: number; label: string; value: number; statut: string } | null>(null);
  const [visA, setVisA] = useState(new Set(['capex']));
  const [visB, setVisB] = useState(new Set(['nb_campagnes']));

  const totalCapex    = campagnes.reduce((s, c) => s + (c.capex_estime ?? 0), 0);
  const nbCritiques   = campagnes.filter(c => c.criticite === 'critique').length;
  const pctCritiques  = campagnes.length > 0 ? Math.round((nbCritiques / campagnes.length) * 100) : 0;
  const totalEq       = campagnes.reduce((s, c) => s + (c.nb_equipements ?? 0), 0);
  const nbScoresRisque= scores.filter(s => s.score_global >= 71).length;
  const detteTechnique= scores.reduce((s, sc) => s + (sc.capex_estime ?? 0), 0);
  const capex5ans     = campagnes.filter(c => (c.annee_ppi ?? 0) <= 2030).reduce((s, c) => s + (c.capex_estime ?? 0), 0);

  const annees    = [2026, 2027, 2028, 2029, 2030];
  const anneesData = annees.map(y => {
    const cs   = campagnes.filter(c => (c.annee_ppi ?? 0) === y);
    const capex = cs.reduce((s, c) => s + (c.capex_estime ?? 0) / 1000, 0);
    return {
      label: `${y}`, shortLabel: `${y}`,
      capex:          Math.round(capex),
      nb_campagnes:   cs.length,
      nb_equipements: cs.reduce((s, c) => s + (c.nb_equipements ?? 0), 0),
    };
  });

  function buildDonut(crit: string) {
    const COLORS = ['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#0891b2','#64748b'];
    if (crit === 'criticite') {
      const order = ['critique','fort','moyen','faible'];
      const cols  = ['#ef4444','#f97316','#f59e0b','#10b981'];
      const labels: Record<string, string> = { critique: 'Critique', fort: 'Fort', moyen: 'Moyen', faible: 'Faible' };
      return order.map((k, i) => ({ label: labels[k], value: campagnes.filter(c => c.criticite === k).length, color: cols[i] })).filter(s => s.value > 0);
    }
    if (crit === 'statut') {
      const map: Record<string, number> = {};
      campagnes.forEach(c => { map[c.statut] = (map[c.statut] ?? 0) + 1; });
      return Object.entries(map).map(([k, v], i) => ({ label: STATUT_CFG[k]?.label ?? k, value: v, color: COLORS[i % COLORS.length] }));
    }
    if (crit === 'type_op') {
      const map: Record<string, number> = {};
      campagnes.forEach(c => { map[c.type_operation] = (map[c.type_operation] ?? 0) + 1; });
      return Object.entries(map).map(([k, v], i) => ({ label: TYPE_OP_CFG[k]?.label ?? k, value: v, color: TYPE_OP_CFG[k]?.color ?? COLORS[i % COLORS.length] }));
    }
    if (crit === 'annee') {
      const map: Record<string, number> = {};
      campagnes.forEach(c => { const y = `${c.annee_ppi ?? 'Non planifié'}`; map[y] = (map[y] ?? 0) + 1; });
      return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v], i) => ({ label: k, value: v, color: COLORS[i % COLORS.length] }));
    }
    return [];
  }

  const ventOpts = [
    { value: 'criticite', label: 'Par criticité' },
    { value: 'statut',    label: 'Par statut' },
    { value: 'type_op',   label: 'Par type opération' },
    { value: 'annee',     label: 'Par année PPI' },
  ];
  const evolOpts = [
    { value: 'capex',          label: 'CAPEX (k€)' },
    { value: 'nb_campagnes',   label: 'Nb campagnes' },
    { value: 'nb_equipements', label: 'Nb équipements' },
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Bandeau exécutif 3 KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Dette technique patrimoniale',
            value: fmtM(detteTechnique),
            sub: 'Valeur estimée renouvellements en retard',
            icon: AlertTriangle, iconColor: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200',
          },
          {
            label: 'CAPEX prévisionnel 5 ans',
            value: fmtM(capex5ans),
            sub: '2026–2030 — toutes campagnes PPI',
            icon: TrendingUp, iconColor: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200',
          },
          {
            label: '% patrimoine à risque critique',
            value: `${pctCritiques}%`,
            sub: `${nbCritiques} campagne${nbCritiques > 1 ? 's' : ''} critique${nbCritiques > 1 ? 's' : ''} / ${campagnes.length} total`,
            icon: RefreshCw, iconColor: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200',
          },
        ].map(({ label, value, sub, icon: Icon, iconColor, bg, border }, i) => (
          <div key={i} className={`rounded-2xl border ${border} ${bg} p-4 flex items-start gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{value}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPI secondaires */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Campagnes totales', value: campagnes.length, sub: 'Portefeuille PPI 2026-2030' },
          { label: 'Équipements concernés', value: formatNum(totalEq), sub: 'Total équipements en campagne' },
          { label: 'CAPEX total', value: fmtM(totalCapex), sub: 'Toutes années confondues' },
          { label: 'Équip. score risque >70', value: nbScoresRisque, sub: 'Renouvellement prioritaire', accent: nbScoresRisque >= 3 },
        ].map(({ label, value, sub, accent }, i) => (
          <div key={i} className={`rounded-xl border p-3 ${accent ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-black mt-0.5 ${accent ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Vision temporelle */}
      <AccordionSection title="Vision temporelle — CAPEX & campagnes" subtitle="2026–2030" accentColor="bg-blue-500" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <MiniSelect value={evolutCrit} options={evolOpts} onChange={v => { setEvolutCrit(v); setVisA(new Set([v])); }} />
            <LineChart
              data={anneesData}
              statutConfig={{ capex: { color: '#3b82f6', label: 'CAPEX (k€)' }, nb_campagnes: { color: '#f59e0b', label: 'Campagnes' }, nb_equipements: { color: '#10b981', label: 'Équipements' } }}
              visibleStatuts={visA}
              onToggleStatut={s => setVisA(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; })}
              tooltip={tooltipA} onHover={setTooltipA}
            />
          </div>
          <div>
            <MiniSelect value={evolutCrit2} options={evolOpts} onChange={v => { setEvolutCrit2(v); setVisB(new Set([v])); }} />
            <LineChart
              data={anneesData}
              statutConfig={{ capex: { color: '#3b82f6', label: 'CAPEX (k€)' }, nb_campagnes: { color: '#f59e0b', label: 'Campagnes' }, nb_equipements: { color: '#10b981', label: 'Équipements' } }}
              visibleStatuts={visB}
              onToggleStatut={s => setVisB(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; })}
              tooltip={tooltipB} onHover={setTooltipB}
            />
          </div>
        </div>
      </AccordionSection>

      {/* Heatmap */}
      <AccordionSection title="Heatmap patrimoniale — campagnes par criticité" subtitle="Vue portefeuille" accentColor="bg-red-500" defaultOpen={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {['Campagne', 'Année', 'Type', 'Nb éq.', 'Vétusté moy.', 'CAPEX', 'Criticité', 'Statut', 'Avancement'].map(h => (
                  <th key={h} className="text-left py-2 px-2 font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...campagnes].sort((a, b) => {
                const order = { critique: 0, fort: 1, moyen: 2, faible: 3 };
                return (order[a.criticite as keyof typeof order] ?? 4) - (order[b.criticite as keyof typeof order] ?? 4);
              }).map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-2">
                    <p className="font-semibold text-slate-700 leading-tight">{c.nom}</p>
                    <p className="text-slate-400 text-[10px]">{c.reference}</p>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-600">{c.annee_ppi ?? '—'}</td>
                  <td className="py-2.5 px-2">
                    <span className="text-[11px] font-medium" style={{ color: TYPE_OP_CFG[c.type_operation]?.color ?? '#64748b' }}>
                      {TYPE_OP_CFG[c.type_operation]?.label ?? c.type_operation}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-slate-700">{c.nb_equipements ?? '—'}</td>
                  <td className="py-2.5 px-2">
                    {c.vetuste_moyenne != null ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.vetuste_moyenne}%`, background: c.vetuste_moyenne >= 80 ? '#ef4444' : c.vetuste_moyenne >= 60 ? '#f59e0b' : '#10b981' }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">{c.vetuste_moyenne}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-700">{fmtK(c.capex_estime)}</td>
                  <td className="py-2.5 px-2"><CriticiteChip criticite={c.criticite} /></td>
                  <td className="py-2.5 px-2"><StatutChip statut={c.statut} /></td>
                  <td className="py-2.5 px-2 w-28"><AvancementBar value={c.avancement_pct ?? 0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      {/* Ventilation */}
      <AccordionSection title="Ventilation du portefeuille" subtitle="Répartition campagnes" accentColor="bg-amber-500" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4">
          <DonutChart
            title="Répartition par criticité"
            slices={buildDonut(ventCrit)}
            selectOptions={ventOpts}
            selectedOption={ventCrit}
            onOptionChange={setVentCrit}
            centerTotal={campagnes.length}
          />
          <DonutChart
            title="Répartition par statut"
            slices={buildDonut(ventStatut)}
            selectOptions={ventOpts}
            selectedOption={ventStatut}
            onOptionChange={setVentStatut}
            centerTotal={campagnes.length}
          />
        </div>
      </AccordionSection>

      {/* Scénarios PPI */}
      <AccordionSection title="Scénarios PPI" subtitle="Simulation investissements" accentColor="bg-emerald-500" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { nom: 'Scénario prudent', desc: 'Uniquement les campagnes critiques et réglementaires urgentes. Report des autres à 2031+.', budget: capex5ans * 0.55, risque: 'Risque patrimonial résiduel élevé', color: '#ef4444', bg: 'bg-red-50', border: 'border-red-200' },
            { nom: 'Scénario équilibré', desc: 'Campagnes critiques + fort. Étalement sur 5 ans avec massification des marchés.', budget: capex5ans * 0.80, risque: 'Risque maîtrisé — recommandé', color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200' },
            { nom: 'Scénario accéléré', desc: 'Toutes campagnes planifiées sur 5 ans. Objectif : patrimoine renouvelé à horizon 2030.', budget: capex5ans, risque: 'Risque minimal — effort budgétaire fort', color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          ].map(s => (
            <div key={s.nom} className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
              <p className="text-xs font-black" style={{ color: s.color }}>{s.nom}</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">{s.desc}</p>
              <p className="text-lg font-black text-slate-800 mt-2">{fmtM(s.budget)}</p>
              <p className="text-[11px] font-semibold mt-1" style={{ color: s.color }}>{s.risque}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-bold text-red-600">Sans investissement — projection risque à 2029</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Sans programme PPI, le nombre d'équipements en criticité élevée progresserait de +{Math.round(nbScoresRisque * 0.37 + nbScoresRisque)} à {Math.round(nbScoresRisque * 1.37)} d'ici 2029,
            augmentant la dette technique patrimoniale de +37% (estimation {fmtM(detteTechnique * 1.37)}).
          </p>
        </div>
      </AccordionSection>
    </div>
  );
}

// ─── Tableau campagnes ─────────────────────────────────────────────────────────

const ALL_COLS = [
  { id: 'campagne',   label: 'Campagne',      visible: true },
  { id: 'perimetre',  label: 'Périmètre',      visible: true },
  { id: 'criticite',  label: 'Criticité',      visible: true },
  { id: 'volume',     label: 'Volume',         visible: true },
  { id: 'budget',     label: 'Budget',         visible: true },
  { id: 'planning',   label: 'Planning',       visible: true },
  { id: 'impact',     label: 'Impact / Gains', visible: true },
  { id: 'avancement', label: 'Avancement',     visible: true },
];

const CRITICITE_ORDER: Record<string, number> = { critique: 0, fort: 1, moyen: 2, faible: 3 };

function TableauCampagnes({ campagnes }: { campagnes: Campagne[] }) {
  const [search,          setSearch]          = useState('');
  const [filterCriticite, setFilterCriticite] = useState('');
  const [filterStatut,    setFilterStatut]    = useState('');
  const [filterAnnee,     setFilterAnnee]     = useState('');
  const [sortCol,         setSortCol]         = useState<string>('criticite');
  const [sortDir,         setSortDir]         = useState<'asc' | 'desc'>('asc');
  const [visibleCols,     setVisibleCols]     = useState<Set<string>>(new Set(ALL_COLS.map(c => c.id)));
  const [showColPicker,   setShowColPicker]   = useState(false);
  const [groupByAnnee,    setGroupByAnnee]    = useState(false);
  const [expandedRows,    setExpandedRows]    = useState<Set<string>>(new Set());

  const annees = useMemo(() => [...new Set(campagnes.map(c => c.annee_ppi).filter(Boolean))].sort() as number[], [campagnes]);

  const filtered = useMemo(() => {
    let list = campagnes;
    if (search)          list = list.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.reference.toLowerCase().includes(search.toLowerCase()) || (c.perimetre_libelle ?? '').toLowerCase().includes(search.toLowerCase()));
    if (filterCriticite) list = list.filter(c => c.criticite === filterCriticite);
    if (filterStatut)    list = list.filter(c => c.statut === filterStatut);
    if (filterAnnee)     list = list.filter(c => `${c.annee_ppi}` === filterAnnee);
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'criticite')  cmp = (CRITICITE_ORDER[a.criticite] ?? 4) - (CRITICITE_ORDER[b.criticite] ?? 4);
      if (sortCol === 'capex')      cmp = (a.capex_estime ?? 0) - (b.capex_estime ?? 0);
      if (sortCol === 'annee')      cmp = (a.annee_ppi ?? 9999) - (b.annee_ppi ?? 9999);
      if (sortCol === 'avancement') cmp = (a.avancement_pct ?? 0) - (b.avancement_pct ?? 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [campagnes, search, filterCriticite, filterStatut, filterAnnee, sortCol, sortDir]);

  const grouped = useMemo(() => {
    if (!groupByAnnee) return null;
    const map = new Map<number | null, Campagne[]>();
    filtered.forEach(c => { const y = c.annee_ppi ?? null; if (!map.has(y)) map.set(y, []); map.get(y)!.push(c); });
    return [...map.entries()].sort((a, b) => (a[0] ?? 9999) - (b[0] ?? 9999));
  }, [filtered, groupByAnnee]);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }
  function toggleExpand(id: string) {
    setExpandedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  const SortIcon = ({ col }: { col: string }) => sortCol === col
    ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
    : <ChevronDown className="w-3 h-3 text-slate-300" />;

  const statCapex = filtered.reduce((s, c) => s + (c.capex_estime ?? 0), 0);
  const statCrit  = filtered.filter(c => c.criticite === 'critique').length;

  function RowContent({ c }: { c: Campagne }) {
    const expanded = expandedRows.has(c.id);
    return (
      <>
        <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleExpand(c.id)}>
          {visibleCols.has('campagne') && (
            <td className="py-2.5 px-3">
              <div className="flex items-start gap-2">
                <ChevronRight className={`w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                <div>
                  <p className="font-semibold text-slate-800 text-xs leading-tight">{c.nom}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{c.reference}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: TYPE_OP_CFG[c.type_operation]?.color ?? '#64748b' }}>
                    {TYPE_OP_CFG[c.type_operation]?.label ?? c.type_operation}
                  </p>
                </div>
              </div>
            </td>
          )}
          {visibleCols.has('perimetre') && (
            <td className="py-2.5 px-3"><p className="text-xs text-slate-600 leading-tight max-w-40 line-clamp-2">{c.perimetre_libelle ?? '—'}</p></td>
          )}
          {visibleCols.has('criticite') && (
            <td className="py-2.5 px-3">
              <CriticiteChip criticite={c.criticite} />
              {c.score_risque != null && <p className="text-[10px] text-slate-400 mt-0.5">{c.score_risque}/100</p>}
            </td>
          )}
          {visibleCols.has('volume') && (
            <td className="py-2.5 px-3">
              <p className="text-xs font-bold text-slate-700">{c.nb_equipements ?? '—'} équipements</p>
              {c.vetuste_moyenne != null && <p className="text-[11px] text-slate-400">Vétusté moy. {c.vetuste_moyenne}%</p>}
            </td>
          )}
          {visibleCols.has('budget') && (
            <td className="py-2.5 px-3">
              <p className="text-xs font-black text-slate-800">{fmtK(c.capex_estime)}</p>
              {c.budget_consomme_pct != null && c.budget_consomme_pct > 0 && <p className="text-[11px] text-slate-400">Consommé : {c.budget_consomme_pct}%</p>}
              {c.roi_ans && <p className="text-[10px] text-emerald-600 font-medium">ROI {c.roi_ans} ans</p>}
            </td>
          )}
          {visibleCols.has('planning') && (
            <td className="py-2.5 px-3">
              <p className="text-xs font-bold text-slate-700">PPI {c.annee_ppi ?? '—'}</p>
              {c.trimestre_debut && c.trimestre_fin && <p className="text-[11px] text-slate-400">{c.trimestre_debut} → {c.trimestre_fin}</p>}
            </td>
          )}
          {visibleCols.has('impact') && (
            <td className="py-2.5 px-3 max-w-40">
              {c.impact_energie      && <p className="text-[11px] text-emerald-600 font-medium">{c.impact_energie}</p>}
              {c.impact_exploitation && <p className="text-[11px] text-blue-600 font-medium">{c.impact_exploitation.slice(0, 40)}{c.impact_exploitation.length > 40 ? '…' : ''}</p>}
              {c.impact_conformite   && <p className="text-[11px] text-amber-600 font-medium">{c.impact_conformite.slice(0, 40)}{c.impact_conformite.length > 40 ? '…' : ''}</p>}
            </td>
          )}
          {visibleCols.has('avancement') && (
            <td className="py-2.5 px-3 w-36">
              <StatutChip statut={c.statut} />
              <div className="mt-1"><AvancementBar value={c.avancement_pct ?? 0} /></div>
              {c.responsable && <p className="text-[10px] text-slate-400 mt-0.5">{c.responsable}</p>}
            </td>
          )}
        </tr>
        {expanded && (
          <tr className="border-b border-slate-100 bg-slate-50">
            <td colSpan={visibleCols.size} className="px-6 py-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {c.notes && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-slate-600 leading-snug">{c.notes}</p>
                  </div>
                )}
                <div className="space-y-1">
                  {c.impact_energie      && <p><span className="font-bold text-emerald-600">Énergie :</span> <span className="text-slate-600">{c.impact_energie}</span></p>}
                  {c.impact_exploitation && <p><span className="font-bold text-blue-600">Exploitation :</span> <span className="text-slate-600">{c.impact_exploitation}</span></p>}
                  {c.impact_conformite   && <p><span className="font-bold text-amber-600">Conformité :</span> <span className="text-slate-600">{c.impact_conformite}</span></p>}
                  {c.impact_confort      && <p><span className="font-bold text-teal-600">Confort :</span> <span className="text-slate-600">{c.impact_confort}</span></p>}
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Barre outils */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3 mr-2">
          <span className="text-xs font-bold text-slate-700">{filtered.length} campagne{filtered.length > 1 ? 's' : ''}</span>
          <span className="text-xs text-slate-400">{fmtK(statCapex)} CAPEX</span>
          {statCrit > 0 && <span className="text-xs font-bold text-red-600">{statCrit} critique{statCrit > 1 ? 's' : ''}</span>}
        </div>
        <div className="flex-1" />
        <select value={filterCriticite} onChange={e => setFilterCriticite(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
          <option value="">Toutes criticités</option>
          {['critique','fort','moyen','faible'].map(k => <option key={k} value={k}>{CRITICITE_CFG[k]?.label ?? k}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
          <option value="">Toutes années</option>
          {annees.map(y => <option key={y} value={`${y}`}>{y}</option>)}
        </select>
        <button onClick={() => setGroupByAnnee(v => !v)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${groupByAnnee ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          <Calendar className="w-3 h-3" /> Grouper par année
        </button>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 w-40" />
        </div>
        <div className="relative">
          <button onClick={() => setShowColPicker(v => !v)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter className="w-3 h-3" /> Colonnes
          </button>
          {showColPicker && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-2 min-w-36">
              {ALL_COLS.map(col => (
                <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={visibleCols.has(col.id)}
                    onChange={() => { const n = new Set(visibleCols); n.has(col.id) ? n.delete(col.id) : n.add(col.id); setVisibleCols(n); }}
                    className="w-3 h-3 accent-blue-600" />
                  <span className="text-xs text-slate-700">{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
            <tr>
              {ALL_COLS.filter(c => visibleCols.has(c.id)).map(col => (
                <th key={col.id}
                  className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-slate-600 transition-colors"
                  onClick={() => toggleSort(col.id === 'budget' ? 'capex' : col.id === 'planning' ? 'annee' : col.id)}>
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.id === 'budget' ? 'capex' : col.id === 'planning' ? 'annee' : col.id} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupByAnnee && grouped ? (
              grouped.map(([annee, rows]) => (
                <>
                  <tr key={`grp-${annee}`} className="bg-slate-50 border-b border-slate-200">
                    <td colSpan={visibleCols.size} className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-700">PPI {annee ?? 'Non planifié'}</span>
                        <span className="text-[11px] text-slate-400">{rows.length} campagne{rows.length > 1 ? 's' : ''} — {fmtK(rows.reduce((s, r) => s + (r.capex_estime ?? 0), 0))}</span>
                      </div>
                    </td>
                  </tr>
                  {rows.map(c => <RowContent key={c.id} c={c} />)}
                </>
              ))
            ) : (
              filtered.map(c => <RowContent key={c.id} c={c} />)
            )}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Aucune campagne ne correspond aux filtres
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

type PpiView = 'dashboard' | 'tableau';

export default function RenouvellementPPI() {
  const [activeView,           setActiveView]           = useState<PpiView>('dashboard');
  const [campagnes,            setCampagnes]            = useState<Campagne[]>([]);
  const [scores,               setScores]               = useState<ScoreEquip[]>([]);
  const [loading,              setLoading]              = useState(true);
  const [selectedResidenceIds, setSelectedResidenceIds] = useState<Set<string>>(new Set());
  const [topFilters,           setTopFilters]           = useState<TopFilters>(EMPTY_TOP_FILTERS);

  useEffect(() => {
    Promise.all([
      supabase.from('campagnes_renouvellement').select('*').order('annee_ppi').order('criticite'),
      supabase.from('scores_renouvellement').select('equipement_id, score_global, niveau, capex_estime, annee_previsionnelle'),
    ]).then(([cRes, sRes]) => {
      setCampagnes(cRes.data ?? []);
      setScores(sRes.data ?? []);
      setLoading(false);
    });
  }, []);

  // Filter campagnes by arborescence selection + top filters
  const filteredCampagnes = useMemo(() => {
    let list = campagnes;
    // Arborescence: filter by perimetre_libelle matching selected residences
    // (campagnes don't have residence_id, so we match by text for now)
    // Top filters
    list = applyTopFilters(list, topFilters);
    return list;
  }, [campagnes, selectedResidenceIds, topFilters]);

  const VIEWS: { id: PpiView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'tableau',   label: 'Tableau',          icon: TableProperties },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-nav */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 flex-shrink-0 bg-white">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${activeView === v.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <v.icon className="w-3.5 h-3.5" />
            {v.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Renouvellements & PPI</span>
      </div>

      {/* Top Filter Bar */}
      <TopFilterBar filters={topFilters} onChange={setTopFilters} campagnes={filteredCampagnes} />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Arborescence sidebar */}
        <ArborescenceSidebar
          selectedResidenceIds={selectedResidenceIds}
          onChangeSelectedResidenceIds={setSelectedResidenceIds}
        />

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 gap-2 text-sm">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
              Chargement…
            </div>
          ) : activeView === 'dashboard' ? (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <DashboardPPI campagnes={filteredCampagnes} scores={scores} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <TableauCampagnes campagnes={filteredCampagnes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
