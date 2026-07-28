import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronRight, ChevronDown, MapPin, Building2, Search, X, RefreshCw, PanelLeftClose, PanelLeftOpen, Layers, ArrowUpDown, Import as SortAsc, Dessert as SortDesc, ListFilter } from 'lucide-react';

// ─── Data structures ──────────────────────────────────────────────────────────

interface LogementNode { id: string; numero: string; surface_m2?: number }
interface EtageNode    { id: string; nom: string; numero: number; logements: LogementNode[] }
interface BatimentNode { id: string; nom: string; code: string; nb_logements: number; etages: EtageNode[] }
interface ResidenceNode { id: string; nom: string; code: string; nombre_logements: number; batiments: BatimentNode[] }
interface SiteNode {
  id: string;
  nom: string;
  code: string;
  residences: ResidenceNode[];
}

// ─── Sort definitions ─────────────────────────────────────────────────────────

export type SortAttr =
  | 'libelle'
  | 'date_prochain_controle'
  | 'nb_nc_critique'
  | 'nb_nc_majeure'
  | 'nb_nc_mineure'
  | 'nb_nc_total'
  | 'nb_controles_manquants'
  | 'nb_controles_retard'
  | 'nb_actions_attente'
  | 'nb_actions_retard'
  | 'nb_controles'
  | 'nb_points_controle'
  | 'nb_actions';

type SortDir = 'asc' | 'desc';

export const SORT_ATTR_OPTIONS: { value: SortAttr; label: string; type: 'text' | 'date' | 'number' }[] = [
  { value: 'libelle',                   label: 'Libellé',                           type: 'text'   },
  { value: 'date_prochain_controle',    label: 'Date prochain contrôle',            type: 'date'   },
  { value: 'nb_nc_critique',           label: 'Non-conformités critiques',         type: 'number' },
  { value: 'nb_nc_majeure',            label: 'Non-conformités majeures',          type: 'number' },
  { value: 'nb_nc_mineure',            label: 'Non-conformités mineures',          type: 'number' },
  { value: 'nb_nc_total',              label: 'Non-conformités (total)',            type: 'number' },
  { value: 'nb_controles_manquants',   label: 'Contrôles manquants',               type: 'number' },
  { value: 'nb_controles_retard',      label: 'Contrôles en retard',               type: 'number' },
  { value: 'nb_actions_attente',       label: 'Actions correctives en attente',    type: 'number' },
  { value: 'nb_actions_retard',        label: 'Actions correctives en retard',     type: 'number' },
  { value: 'nb_controles',             label: 'Nombre de contrôles',               type: 'number' },
  { value: 'nb_points_controle',       label: 'Nombre de points de contrôle',      type: 'number' },
  { value: 'nb_actions',               label: "Nombre d'actions correctives",      type: 'number' },
];

function sortDirOptions(type: 'text' | 'date' | 'number'): { value: SortDir; label: string }[] {
  if (type === 'text')   return [{ value: 'asc', label: 'A → Z' }, { value: 'desc', label: 'Z → A' }];
  if (type === 'date')   return [{ value: 'asc', label: 'Plus ancien en premier' }, { value: 'desc', label: 'Plus récent en premier' }];
  return [{ value: 'asc', label: 'Croissant' }, { value: 'desc', label: 'Décroissant' }];
}

// ─── Display level ─────────────────────────────────────────────────────────────

export type DisplayLevel = 1 | 2 | 3 | 4;
const LEVEL_OPTIONS: { value: DisplayLevel; label: string }[] = [
  { value: 1, label: '1 — Campus' },
  { value: 2, label: '2 — Résidences' },
  { value: 3, label: '3 — Étages' },
  { value: 4, label: '4 — Logements' },
];

// ─── Type contrôles export ────────────────────────────────────────────────────

export const TYPE_CONTROLES = [
  { key: 'Sécurité incendie',              icon: '🔥' },
  { key: 'Électricité',                    icon: '⚡' },
  { key: 'Ventilation / Désenfumage',      icon: '💨' },
  { key: 'Ascenseurs / levage',            icon: '🛗' },
  { key: 'Gaz / chaufferies',              icon: '🔥' },
  { key: 'Légionelles / ECS',              icon: '💧' },
  { key: 'BAES / éclairage sécurité',      icon: '💡' },
  { key: 'Portes automatiques / coupe-feu',icon: '🚪' },
  { key: 'Accessibilité PMR',              icon: '♿' },
  { key: 'Amiante / DTA',                 icon: '😷' },
  { key: 'Structure / toiture',            icon: '🏢' },
  { key: 'Climatisation / F-Gaz',         icon: '❄️' },
  { key: 'Équipements techniques divers',  icon: '⚙️' },
  { key: 'ERP / commissions sécurité',     icon: '📋' },
  { key: 'Sécurité travail / EPI',         icon: '🛠️' },
  { key: 'Performance énergétique / DPE',  icon: '🌍' },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  selectedSiteIds: string[];
  onChangeSelectedSiteIds: (ids: string[]) => void;
  onChangeSelectedSiteNames?: (names: string[]) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getNodeLabel(node: SiteNode | ResidenceNode | BatimentNode | EtageNode, level: DisplayLevel): string {
  if (level === 1) return (node as SiteNode).nom.replace('Campus ', '');
  if (level === 2) return (node as ResidenceNode).nom.replace('Résidence ', '');
  if (level === 3) return (node as BatimentNode | EtageNode).nom;
  return (node as EtageNode).nom;
}

// Mock stat for sorting by numeric attribute (returns a deterministic pseudo-value per id)
function mockStat(id: string, attr: SortAttr): number {
  if (attr === 'libelle') return 0;
  // deterministic hash-based value
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h % 200);
}

export default function ReglementaireSidebar({ selectedSiteIds, onChangeSelectedSiteIds, onChangeSelectedSiteNames }: Props) {
  const [collapsed, setCollapsed]           = useState(false);
  const [sites, setSites]                   = useState<SiteNode[]>([]);
  const [expanded, setExpanded]             = useState<Record<string, boolean>>({});
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [displayLevel, setDisplayLevel]     = useState<DisplayLevel>(1);
  const [sortAttr, setSortAttr]             = useState<SortAttr>('libelle');
  const [sortDir, setSortDir]               = useState<SortDir>('asc');
  const [width, setWidth]                   = useState(280);
  const [isResizing, setIsResizing]         = useState(false);
  const [showFilters, setShowFilters]       = useState(false);
  const startXRef                           = useRef(0);
  const startWidthRef                       = useRef(280);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: sitesData }, { data: residencesData }, { data: batimentsData }, { data: etagesData }, { data: logementsData }] = await Promise.all([
      supabase.from('sites').select('id, nom, code').order('nom'),
      supabase.from('residences').select('id, site_id, nom, code, nombre_logements').order('nom'),
      supabase.from('batiments').select('id, residence_id, nom, code, nb_logements').order('nom'),
      supabase.from('etages').select('id, batiment_id, nom, numero, nombre_logements').order('numero'),
      supabase.from('logements').select('id, etage_id, numero').order('numero'),
    ]);

    const logMap: Record<string, LogementNode[]> = {};
    for (const l of (logementsData || [])) {
      if (!logMap[l.etage_id]) logMap[l.etage_id] = [];
      logMap[l.etage_id].push({ id: l.id, numero: l.numero });
    }

    const etageMap: Record<string, EtageNode[]> = {};
    for (const e of (etagesData || [])) {
      if (!etageMap[e.batiment_id]) etageMap[e.batiment_id] = [];
      etageMap[e.batiment_id].push({ id: e.id, nom: e.nom, numero: e.numero, logements: logMap[e.id] || [] });
    }

    const batMap: Record<string, BatimentNode[]> = {};
    for (const b of (batimentsData || [])) {
      if (!batMap[b.residence_id]) batMap[b.residence_id] = [];
      batMap[b.residence_id].push({ id: b.id, nom: b.nom, code: b.code, nb_logements: b.nb_logements ?? 0, etages: etageMap[b.id] || [] });
    }

    const resMap: Record<string, ResidenceNode[]> = {};
    for (const r of (residencesData || [])) {
      if (!resMap[r.site_id]) resMap[r.site_id] = [];
      resMap[r.site_id].push({ id: r.id, nom: r.nom, code: r.code, nombre_logements: r.nombre_logements ?? 0, batiments: batMap[r.id] || [] });
    }

    setSites((sitesData || []).map((s) => ({
      id: s.id, nom: s.nom, code: s.code,
      residences: resMap[s.id] || [],
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Notify parent of selected site names whenever selection or site data changes
  useEffect(() => {
    if (!onChangeSelectedSiteNames || sites.length === 0) return;
    const names = sites
      .filter(s => selectedSiteIds.includes(s.id))
      .map(s => s.nom.replace('Campus ', ''));
    onChangeSelectedSiteNames(names);
  }, [selectedSiteIds, sites, onChangeSelectedSiteNames]);

  // ── Resizing ──
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current     = e.clientX;
    startWidthRef.current = width;
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      setWidth(Math.max(200, Math.min(520, startWidthRef.current + delta)));
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);

  // ── Filtering & sorting ──
  const lc = search.toLowerCase();

  const sortedAttrMeta = SORT_ATTR_OPTIONS.find(o => o.value === sortAttr)!;
  const dirOptions     = sortDirOptions(sortedAttrMeta.type);

  // Flatten nodes at the current display level for sorting
  type FlatNode = { id: string; label: string; parentChain: string[] };

  const flatNodes = useMemo((): FlatNode[] => {
    const nodes: FlatNode[] = [];
    for (const site of sites) {
      if (displayLevel === 1) {
        nodes.push({ id: site.id, label: getNodeLabel(site, 1), parentChain: [] });
      } else {
        for (const res of site.residences) {
          if (displayLevel === 2) {
            nodes.push({ id: res.id, label: getNodeLabel(res, 2), parentChain: [site.id] });
          } else {
            for (const bat of res.batiments) {
              for (const etage of bat.etages) {
                if (displayLevel === 3) {
                  nodes.push({ id: etage.id, label: etage.nom, parentChain: [site.id, res.id, bat.id] });
                } else {
                  for (const log of etage.logements) {
                    nodes.push({ id: log.id, label: log.numero, parentChain: [site.id, res.id, bat.id, etage.id] });
                  }
                }
              }
            }
          }
        }
      }
    }
    return nodes;
  }, [sites, displayLevel]);

  const sortedNodes = useMemo(() => {
    return [...flatNodes].sort((a, b) => {
      let cmp = 0;
      if (sortAttr === 'libelle') {
        cmp = a.label.localeCompare(b.label, 'fr');
      } else {
        cmp = mockStat(a.id, sortAttr) - mockStat(b.id, sortAttr);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [flatNodes, sortAttr, sortDir]);

  const filteredNodes = useMemo(() => {
    if (!lc) return sortedNodes;
    return sortedNodes.filter(n => n.label.toLowerCase().includes(lc));
  }, [sortedNodes, lc]);

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Collect all descendant IDs for a given node at displayLevel=1 ──
  const getDescendantIds = useCallback((siteId: string): string[] => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return [siteId];
    const resIds   = site.residences.map(r => r.id);
    const batIds   = site.residences.flatMap(r => r.batiments.map(b => b.id));
    const etageIds = site.residences.flatMap(r => r.batiments.flatMap(b => b.etages.map(e => e.id)));
    const logIds   = site.residences.flatMap(r => r.batiments.flatMap(b => b.etages.flatMap(e => e.logements.map(l => l.id))));
    return [siteId, ...resIds, ...batIds, ...etageIds, ...logIds];
  }, [sites]);

  const getResDescendantIds = useCallback((resId: string): string[] => {
    const res = sites.flatMap(s => s.residences).find(r => r.id === resId);
    if (!res) return [resId];
    const batIds   = res.batiments.map(b => b.id);
    const etageIds = res.batiments.flatMap(b => b.etages.map(e => e.id));
    const logIds   = res.batiments.flatMap(b => b.etages.flatMap(e => e.logements.map(l => l.id)));
    return [resId, ...batIds, ...etageIds, ...logIds];
  }, [sites]);

  const getBatDescendantIds = useCallback((batId: string): string[] => {
    const bat = sites.flatMap(s => s.residences.flatMap(r => r.batiments)).find(b => b.id === batId);
    if (!bat) return [batId];
    const etageIds = bat.etages.map(e => e.id);
    const logIds   = bat.etages.flatMap(e => e.logements.map(l => l.id));
    return [batId, ...etageIds, ...logIds];
  }, [sites]);

  const getEtageDescendantIds = useCallback((etageId: string): string[] => {
    const etage = sites.flatMap(s => s.residences.flatMap(r => r.batiments.flatMap(b => b.etages))).find(e => e.id === etageId);
    if (!etage) return [etageId];
    return [etageId, ...etage.logements.map(l => l.id)];
  }, [sites]);

  const toggleWithDescendants = (id: string, getDesc: (id: string) => string[]) => {
    const descendants = getDesc(id);
    const allSelected = descendants.every(d => selectedSiteIds.includes(d));
    if (allSelected) {
      onChangeSelectedSiteIds(selectedSiteIds.filter(s => !descendants.includes(s)));
    } else {
      onChangeSelectedSiteIds([...new Set([...selectedSiteIds, ...descendants])]);
    }
  };

  const toggleSiteId = (id: string) => {
    if (selectedSiteIds.includes(id)) {
      onChangeSelectedSiteIds(selectedSiteIds.filter(s => s !== id));
    } else {
      onChangeSelectedSiteIds([...selectedSiteIds, id]);
    }
  };

  const isChecked = (id: string) => selectedSiteIds.includes(id);

  // partial check: some (but not all) descendants selected
  const isPartial = (id: string, getDesc: (id: string) => string[]): boolean => {
    const desc = getDesc(id).filter(d => d !== id);
    if (desc.length === 0) return false;
    const count = desc.filter(d => selectedSiteIds.includes(d)).length;
    return count > 0 && count < desc.length;
  };

  const allChecked = filteredNodes.length > 0 && filteredNodes.every(n => selectedSiteIds.includes(n.id));
  const someChecked = filteredNodes.some(n => selectedSiteIds.includes(n.id));

  const toggleAll = () => {
    if (allChecked) {
      onChangeSelectedSiteIds(selectedSiteIds.filter(id => !filteredNodes.some(n => n.id === id)));
    } else {
      const newIds = [...new Set([...selectedSiteIds, ...filteredNodes.map(n => n.id)])];
      onChangeSelectedSiteIds(newIds);
    }
  };

  // Find site object by id for tree building
  const siteById = useMemo(() => Object.fromEntries(sites.map(s => [s.id, s])), [sites]);

  // ── Collapsed state ──
  if (collapsed) {
    return (
      <div className="w-10 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col items-center py-3 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          title="Ouvrir la sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <div className="w-px flex-1 bg-slate-100" />
      </div>
    );
  }

  const totalResidences = sites.reduce((a, s) => a + s.residences.length, 0);
  const totalLogements  = sites.reduce((a, s) =>
    a + s.residences.reduce((b, r) => b + r.nombre_logements, 0), 0);

  return (
    <div
      className="flex-shrink-0 bg-white border-r border-slate-100 flex flex-col overflow-hidden relative select-none"
      style={{ width }}
    >
      {/* ── Header ── */}
      <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Arborescence</span>
            {!loading && (
              <div className="flex flex-col mt-0.5">
                <p className="text-xs text-slate-500 font-medium">{totalLogements.toLocaleString('fr-FR')} logements</p>
                <p className="text-xs text-slate-400">{totalResidences} résidences</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`p-1 rounded-md transition-colors ${showFilters ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
              title="Filtres d'affichage"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
            <button onClick={load} className="p-1 hover:bg-slate-100 rounded-md transition-colors" title="Rafraîchir">
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-slate-100 rounded-md transition-colors" title="Réduire">
              <PanelLeftClose className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Filters panel — hidden by default, toggled by funnel icon */}
        {showFilters && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {/* Level selector */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <select
                value={displayLevel}
                onChange={e => { setDisplayLevel(Number(e.target.value) as DisplayLevel); setExpanded({}); }}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-300 text-slate-700"
              >
                {LEVEL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Sort attribute */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <select
                value={sortAttr}
                onChange={e => setSortAttr(e.target.value as SortAttr)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-300 text-slate-700 truncate"
              >
                {SORT_ATTR_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Sort direction */}
            <div className="flex items-center gap-1.5">
              {sortDir === 'asc'
                ? <SortAsc  className="w-3 h-3 text-slate-400 flex-shrink-0" />
                : <SortDesc className="w-3 h-3 text-slate-400 flex-shrink-0" />
              }
              <select
                value={sortDir}
                onChange={e => setSortDir(e.target.value as SortDir)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-300 text-slate-700"
              >
                {dirOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Search — always visible */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-6 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tree ── */}
      <div className="flex-1 overflow-y-auto py-1 min-h-0">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="px-3 py-6 text-xs text-slate-400 text-center">Aucun résultat</div>
        ) : (
          <>
            {/* Select all row */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-50">
              <input
                type="checkbox"
                checked={allChecked}
                ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                onChange={toggleAll}
                className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
              />
              <span
                className={`text-xs cursor-pointer ${selectedSiteIds.length === 0 ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}
                onClick={toggleAll}
              >
                {selectedSiteIds.length === 0 ? 'Tous sélectionnés' : `${selectedSiteIds.length} sélectionné${selectedSiteIds.length > 1 ? 's' : ''}`}
              </span>
              {selectedSiteIds.length > 0 && (
                <button
                  onClick={() => onChangeSelectedSiteIds([])}
                  className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {displayLevel === 1 && filteredNodes.map(node => {
              const site = siteById[node.id];
              if (!site) return null;
              const isExp   = expanded[site.id];
              const checked = isChecked(site.id);
              const partial = !checked && isPartial(site.id, getDescendantIds);
              return (
                <div key={site.id}>
                  {/* Campus row */}
                  <div className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors group ${checked ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      ref={el => { if (el) el.indeterminate = partial; }}
                      onChange={() => toggleWithDescendants(site.id, getDescendantIds)}
                      className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer flex-shrink-0"
                    />
                    <button
                      className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                      onClick={() => toggle(site.id)}
                    >
                      {site.residences.length > 0
                        ? isExp ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />
                        : <span className="w-3" />}
                    </button>
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${checked ? 'text-emerald-600' : 'text-blue-400'}`} />
                    <span className={`text-xs truncate flex-1 cursor-pointer ${checked ? 'text-emerald-700 font-semibold' : 'text-slate-700'}`}
                      onClick={() => toggleWithDescendants(site.id, getDescendantIds)}>
                      {node.label}
                    </span>
                    {(sortAttr === 'libelle' ? site.residences.length : mockStat(site.id, sortAttr)) > 0 && (
                      <span className={`text-xs flex-shrink-0 px-1 py-0.5 rounded-full font-medium ${checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        {sortAttr === 'libelle' ? site.residences.length : mockStat(site.id, sortAttr)}
                      </span>
                    )}
                  </div>

                  {/* Résidences (level 2) */}
                  {isExp && site.residences.map(res => {
                    const resChecked = isChecked(res.id);
                    const resPartial = !resChecked && isPartial(res.id, getResDescendantIds);
                    const resExp = expanded[res.id];
                    return (
                      <div key={res.id}>
                        <div className={`flex items-center gap-1.5 pl-7 pr-2 py-1 transition-colors group ${resChecked ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}>
                          <input
                            type="checkbox"
                            checked={resChecked}
                            ref={el => { if (el) el.indeterminate = resPartial; }}
                            onChange={() => toggleWithDescendants(res.id, getResDescendantIds)}
                            className="w-3 h-3 accent-emerald-600 cursor-pointer flex-shrink-0"
                          />
                          <button
                            className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0"
                            onClick={() => toggle(res.id)}
                          >
                            {res.batiments.length > 0
                              ? resExp ? <ChevronDown className="w-2.5 h-2.5 text-slate-300" /> : <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                              : <span className="w-2.5" />}
                          </button>
                          <Building2 className={`w-3 h-3 flex-shrink-0 ${resChecked ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className={`text-xs truncate flex-1 cursor-pointer leading-tight ${resChecked ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}
                            onClick={() => toggleWithDescendants(res.id, getResDescendantIds)}>
                            {res.nom.replace('Résidence ', '')}
                          </span>
                          <span className={`text-xs flex-shrink-0 font-medium ${resChecked ? 'text-emerald-500' : 'text-slate-300'}`}>
                            {sortAttr === 'libelle' ? res.nombre_logements : mockStat(res.id, sortAttr)}
                          </span>
                        </div>

                        {/* Étages (niveau 3) — on saute le niveau bâtiment */}
                        {resExp && res.batiments.flatMap(bat => bat.etages).map(etage => {
                          const etageChecked = isChecked(etage.id);
                          const etagePartial = !etageChecked && isPartial(etage.id, getEtageDescendantIds);
                          const etageExp = expanded[etage.id];
                          const displayedLogs = etage.logements.slice(0, 20);
                          const hiddenCount = etage.logements.length - displayedLogs.length;
                          return (
                            <div key={etage.id}>
                              <div className={`flex items-center gap-1 pl-14 pr-2 py-0.5 transition-colors group ${etageChecked ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                                <input
                                  type="checkbox"
                                  checked={etageChecked}
                                  ref={el => { if (el) el.indeterminate = etagePartial; }}
                                  onChange={() => toggleWithDescendants(etage.id, getEtageDescendantIds)}
                                  className="w-3 h-3 accent-emerald-600 cursor-pointer flex-shrink-0"
                                />
                                <button
                                  className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0"
                                  onClick={() => toggle(etage.id)}
                                >
                                  {etage.logements.length > 0
                                    ? etageExp ? <ChevronDown className="w-2.5 h-2.5 text-slate-300" /> : <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                                    : <span className="w-2.5" />}
                                </button>
                                <span className={`text-xs truncate flex-1 cursor-pointer ${etageChecked ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}
                                  onClick={() => toggleWithDescendants(etage.id, getEtageDescendantIds)}>
                                  {etage.nom}
                                </span>
                                <span className={`text-xs flex-shrink-0 font-medium ${etageChecked ? 'text-emerald-500' : 'text-slate-300'}`}>
                                  {sortAttr === 'libelle' ? etage.logements.length : mockStat(etage.id, sortAttr)}
                                </span>
                              </div>

                              {/* Logements (niveau 4) */}
                              {etageExp && (
                                <>
                                  {displayedLogs.map(log => {
                                    const logChecked = isChecked(log.id);
                                    return (
                                      <div key={log.id}
                                        className={`flex items-center gap-1.5 pl-20 pr-2 py-0.5 transition-colors ${logChecked ? 'bg-emerald-50/20' : 'hover:bg-slate-50'}`}>
                                        <input
                                          type="checkbox"
                                          checked={logChecked}
                                          onChange={() => toggleSiteId(log.id)}
                                          className="w-2.5 h-2.5 accent-emerald-600 cursor-pointer flex-shrink-0"
                                        />
                                        <span className={`text-xs cursor-pointer font-mono ${logChecked ? 'text-emerald-600 font-semibold' : 'text-slate-300'}`}
                                          onClick={() => toggleSiteId(log.id)}>
                                          {log.numero}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {hiddenCount > 0 && (
                                    <div className="pl-20 pr-2 py-0.5">
                                      <span className="text-xs text-slate-300 italic">+{hiddenCount} logements…</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {displayLevel === 2 && filteredNodes.map(node => {
              const checked = isChecked(node.id);
              const partial = !checked && isPartial(node.id, getResDescendantIds);
              return (
                <div key={node.id} className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors group ${checked ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    ref={el => { if (el) el.indeterminate = partial; }}
                    onChange={() => toggleWithDescendants(node.id, getResDescendantIds)}
                    className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer flex-shrink-0"
                  />
                  <Building2 className={`w-3.5 h-3.5 flex-shrink-0 ${checked ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={`text-xs truncate flex-1 cursor-pointer ${checked ? 'text-emerald-700 font-semibold' : 'text-slate-700'}`}
                    onClick={() => toggleWithDescendants(node.id, getResDescendantIds)}>
                    {node.label}
                  </span>
                </div>
              );
            })}

            {displayLevel === 3 && filteredNodes.map(node => {
              const checked = isChecked(node.id);
              const partial = !checked && isPartial(node.id, getEtageDescendantIds);
              return (
                <div key={node.id} className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors group ${checked ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    ref={el => { if (el) el.indeterminate = partial; }}
                    onChange={() => toggleWithDescendants(node.id, getEtageDescendantIds)}
                    className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer flex-shrink-0"
                  />
                  <Building2 className={`w-3.5 h-3.5 flex-shrink-0 ${checked ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span className={`text-xs truncate flex-1 cursor-pointer ${checked ? 'text-emerald-700 font-semibold' : 'text-slate-700'}`}
                    onClick={() => toggleWithDescendants(node.id, getEtageDescendantIds)}>
                    {node.label}
                  </span>
                </div>
              );
            })}

            {displayLevel === 4 && filteredNodes.map(node => {
              const checked = isChecked(node.id);
              return (
                <div key={node.id} className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors group ${checked ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSiteId(node.id)}
                    className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer flex-shrink-0"
                  />
                  <span className={`text-xs font-mono truncate flex-1 cursor-pointer ${checked ? 'text-emerald-700 font-semibold' : 'text-slate-700'}`}
                    onClick={() => toggleSiteId(node.id)}>
                    {node.label}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── Resize handle ── */}
      <div
        onMouseDown={onMouseDown}
        className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-10 group transition-colors ${isResizing ? 'bg-emerald-400' : 'hover:bg-emerald-300'}`}
        title="Redimensionner"
      >
        <div className={`absolute top-0 right-0 w-px h-full bg-slate-200 group-hover:bg-emerald-400 transition-colors ${isResizing ? 'bg-emerald-400' : ''}`} />
      </div>
    </div>
  );
}
