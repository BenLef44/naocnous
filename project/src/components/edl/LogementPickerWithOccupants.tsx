import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Search, Loader2, List, GitBranch, Building2, Layers, Home,
  ChevronDown, ChevronRight, CheckCircle2, Star, Clock, Phone, Mail,
  CalendarDays, FileCheck, FileX, User,
} from 'lucide-react';import { supabase } from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SiteOption      { id: string; nom: string; code: string; }
interface ResidenceOption { id: string; nom: string; site_id: string; }
interface BatimentOption  { id: string; nom: string; residence_id: string; }
interface EtageOption     { id: string; nom: string; batiment_id: string; numero: number; }
interface LogementOption  { id: string; numero: string; etage_id: string; }

type NodeType = 'site' | 'residence' | 'batiment' | 'etage' | 'logement';
interface TreeNode { id: string; type: NodeType; nom: string; children?: TreeNode[]; }

interface RecentLoc {
  siteId: string; siteNom: string; siteCode: string;
  residenceId?: string; residenceNom?: string;
  batimentId?: string; batimentNom?: string;
  etageId?: string; etageNom?: string;
  logementId?: string; logementNum?: string;
  label: string;
}

export interface OccupantRow {
  id: string;
  logement_id: string;
  photo_url: string | null;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string | null;
  etablissement: string | null;
  type_contrat: string;
  reference_bail: string | null;
  date_entree: string | null;
  date_sortie_prevue: string | null;
  statut_edl_entrant: string;
  date_edl_entrant: string | null;
  statut_edl_sortant: string;
  date_edl_sortant: string | null;
  statut: string;
}

export interface LogementSelection {
  logementId: string;
  logementNumero: string;
  etageId: string;
  etageNom: string;
  batimentId: string;
  batimentNom: string;
  residenceId: string;
  residenceNom: string;
  siteId: string;
  siteNom: string;
  siteCode: string;
}

// ── localStorage helpers (shared with interventions wizard) ───────────────────

const FAV_SITES_KEY   = 'naofix_fav_sites';
const RECENT_LOCS_KEY = 'naofix_recent_locs';

function getFavSites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAV_SITES_KEY) ?? '[]'); } catch { return []; }
}
function toggleFavSite(siteId: string): string[] {
  const favs = getFavSites();
  const next = favs.includes(siteId) ? favs.filter(id => id !== siteId) : [siteId, ...favs];
  localStorage.setItem(FAV_SITES_KEY, JSON.stringify(next));
  return next;
}
function getRecentLocs(): RecentLoc[] {
  try { return JSON.parse(localStorage.getItem(RECENT_LOCS_KEY) ?? '[]'); } catch { return []; }
}
function addRecentLoc(loc: RecentLoc) {
  const recents = getRecentLocs().filter(r => r.label !== loc.label);
  localStorage.setItem(RECENT_LOCS_KEY, JSON.stringify([loc, ...recents].slice(0, 5)));
}

// ── Tree node icon ────────────────────────────────────────────────────────────

function TreeNodeIcon({ type }: { type: NodeType }) {
  const cls = 'w-3.5 h-3.5 flex-shrink-0 inline-block';
  if (type === 'site')      return <MapPin    className={`${cls} text-blue-500`}   />;
  if (type === 'residence') return <Building2 className={`${cls} text-indigo-500`} />;
  if (type === 'batiment')  return <Layers    className={`${cls} text-violet-500`} />;
  if (type === 'etage')     return <Layers    className={`${cls} text-slate-400`}  />;
  return                           <Home      className={`${cls} text-emerald-500`}/>;
}

// ── ArborescencePicker ────────────────────────────────────────────────────────

interface ArborescencePickerProps {
  tree: TreeNode[];
  selectedId: string;
  selectedType: NodeType | '';
  onSelect: (id: string, type: NodeType, path: string) => void;
  loading: boolean;
}

function ArborescencePicker({ tree, selectedId, selectedType, onSelect, loading }: ArborescencePickerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (!selectedId || !tree.length) return;
    const toExpand: Record<string, boolean> = {};
    function findAndCollect(node: TreeNode, target: string): boolean {
      if (node.id === target) return true;
      for (const child of node.children ?? []) {
        if (findAndCollect(child, target)) { toExpand[node.id] = true; return true; }
      }
      return false;
    }
    tree.forEach(root => findAndCollect(root, selectedId));
    if (Object.keys(toExpand).length) setExpanded(prev => ({ ...prev, ...toExpand }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tree]);

  function deepFilter(node: TreeNode, q: string): TreeNode | null {
    if (!q) return node;
    const selfMatch = node.nom.toLowerCase().includes(q.toLowerCase());
    const filteredChildren = (node.children ?? []).map(c => deepFilter(c, q)).filter(Boolean) as TreeNode[];
    if (selfMatch || filteredChildren.length > 0)
      return { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children };
    return null;
  }

  const visibleTree = search ? tree.map(n => deepFilter(n, search)).filter(Boolean) as TreeNode[] : tree;

  function NodeRow({ node, depth, ancestors }: { node: TreeNode; depth: number; ancestors: string[] }) {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded  = expanded[node.id] ?? (search.length > 0);
    const isSelected  = selectedId === node.id;
    const path = [...ancestors, node.nom].join(' › ');

    return (
      <div>
        <div
          className={`flex items-center gap-1.5 py-1.5 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
          style={{ paddingLeft: `${8 + depth * 16}px`, paddingRight: 8 }}
        >
          <span className="w-4 h-4 flex items-center justify-center text-slate-300 flex-shrink-0"
            onClick={e => { e.stopPropagation(); if (hasChildren) toggle(node.id); }}>
            {hasChildren ? (isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />) : null}
          </span>
          <input type="checkbox" checked={isSelected}
            onChange={() => onSelect(isSelected ? '' : node.id, node.type, isSelected ? '' : path)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0 accent-blue-600"
            onClick={e => e.stopPropagation()} />
          <span className="flex items-center gap-1.5 flex-1 min-w-0"
            onClick={() => { onSelect(isSelected ? '' : node.id, node.type, isSelected ? '' : path); if (hasChildren) toggle(node.id); }}>
            <TreeNodeIcon type={node.type} />
            <span className={`text-xs truncate ${isSelected ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>{node.nom}</span>
          </span>
        </div>
        {(isExpanded || search.length > 0) && hasChildren && (
          <div>{node.children!.map(child => <NodeRow key={child.id} node={child} depth={depth + 1} ancestors={[...ancestors, node.nom]} />)}</div>
        )}
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans l'arborescence..."
            className="w-full pl-6 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </div>
      </div>
      <div className="overflow-y-auto max-h-56 py-1 px-1">
        {visibleTree.length === 0
          ? <p className="text-xs text-slate-400 text-center py-4">Aucun résultat</p>
          : visibleTree.map(node => <NodeRow key={node.id} node={node} depth={0} ancestors={[]} />)}
      </div>
      {selectedId && (
        <div className="px-3 py-2 border-t border-blue-100 bg-blue-50 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-xs text-blue-700 font-medium truncate">
            {selectedType && <TreeNodeIcon type={selectedType as NodeType} />}{' '}Sélection confirmée
          </span>
          <button onClick={() => onSelect('', 'site', '')}
            className="ml-auto text-[10px] text-blue-500 hover:text-blue-700 transition-colors whitespace-nowrap">
            Effacer
          </button>
        </div>
      )}
    </div>
  );
}

// ── OccupantCard ──────────────────────────────────────────────────────────────

const CONTRAT_CFG: Record<string, { label: string; color: string }> = {
  bail_classique:         { label: 'Bail classique',         color: 'bg-blue-50 text-blue-700 border-blue-200'    },
  colocation:             { label: 'Colocation',             color: 'bg-violet-50 text-violet-700 border-violet-200' },
  logement_temporaire:    { label: 'Logement temporaire',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
  echange_international:  { label: 'Échange international',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const STATUT_OCC_CFG: Record<string, { label: string; dot: string; text: string }> = {
  occupant_actuel: { label: 'Occupant actuel', dot: 'bg-emerald-400', text: 'text-emerald-700' },
  a_venir:         { label: 'À venir',         dot: 'bg-blue-400',    text: 'text-blue-700'    },
  ancien_occupant: { label: 'Ancien occupant', dot: 'bg-slate-400',   text: 'text-slate-600'   },
};

const EDL_STATUS_CFG: Record<string, { label: string; icon: typeof FileCheck; color: string }> = {
  realise:         { label: 'Réalisé',       icon: FileCheck, color: 'text-emerald-600' },
  a_realiser:      { label: 'À réaliser',    icon: FileX,     color: 'text-orange-500'  },
  non_applicable:  { label: 'N/A',           icon: FileCheck, color: 'text-slate-400'   },
};

function OccupantCard({ occ }: { occ: OccupantRow }) {
  const initials = `${occ.prenom?.[0] ?? ''}${occ.nom?.[0] ?? ''}`.toUpperCase();
  const statutOcc = STATUT_OCC_CFG[occ.statut] ?? STATUT_OCC_CFG.occupant_actuel;
  const contrat = CONTRAT_CFG[occ.type_contrat];
  const edlE = EDL_STATUS_CFG[occ.statut_edl_entrant] ?? EDL_STATUS_CFG.a_realiser;
  const edlS = EDL_STATUS_CFG[occ.statut_edl_sortant] ?? EDL_STATUS_CFG.a_realiser;
  const EdlEIcon = edlE.icon;
  const EdlSIcon = edlS.icon;

  function fmt(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-100">
        {occ.photo_url ? (
          <img src={occ.photo_url} alt={`${occ.prenom} ${occ.nom}`}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{initials || <User className="w-5 h-5 text-white" />}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">
            {occ.nom.toUpperCase()} {occ.prenom}
          </p>
          {occ.etablissement && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{occ.etablissement}</p>
          )}
          <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold ${statutOcc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statutOcc.dot}`} />
            {statutOcc.label}
          </span>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 py-2.5 space-y-1.5 border-b border-slate-100">
        {occ.telephone && (
          <a href={`tel:${occ.telephone}`}
            className="flex items-center gap-2 text-xs text-slate-700 hover:text-blue-600 transition-colors">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {occ.telephone}
          </a>
        )}
        {occ.email && (
          <a href={`mailto:${occ.email}`}
            className="flex items-center gap-2 text-xs text-slate-700 hover:text-blue-600 transition-colors truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{occ.email}</span>
          </a>
        )}
      </div>

      {/* Contrat */}
      <div className="px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {contrat && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${contrat.color}`}>
              {contrat.label}
            </span>
          )}
          {occ.reference_bail && (
            <span className="text-[10px] text-slate-400 font-mono">{occ.reference_bail}</span>
          )}
        </div>
      </div>

      {/* Dates + EDL */}
      <div className="px-4 py-2.5 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Date d'entrée
          </p>
          <p className="text-xs font-semibold text-slate-700">{fmt(occ.date_entree) ?? '—'}</p>
          <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-semibold ${edlE.color}`}>
            <EdlEIcon className="w-3 h-3 flex-shrink-0" />
            EDL entrant : {edlE.label}
            {occ.date_edl_entrant && <span className="text-slate-400 font-normal ml-1">{fmt(occ.date_edl_entrant)}</span>}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Sortie prévue
          </p>
          <p className="text-xs font-semibold text-slate-700">{fmt(occ.date_sortie_prevue) ?? '—'}</p>
          <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-semibold ${edlS.color}`}>
            <EdlSIcon className="w-3 h-3 flex-shrink-0" />
            EDL sortant : {edlS.label}
            {occ.date_edl_sortant && <span className="text-slate-400 font-normal ml-1">{fmt(occ.date_edl_sortant)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialLogementId?: string | null;
  initialLabel?: string;
  onSelect: (sel: LogementSelection | null) => void;
  onOccupantsLoaded?: (occupants: OccupantRow[]) => void;
}

export default function LogementPickerWithOccupants({ initialLogementId, initialLabel, onSelect, onOccupantsLoaded }: Props) {
  const [locMode, setLocMode] = useState<'niveaux' | 'arborescence'>('niveaux');

  const [sites, setSites]         = useState<SiteOption[]>([]);
  const [residences, setResidences] = useState<ResidenceOption[]>([]);
  const [batiments, setBatiments] = useState<BatimentOption[]>([]);
  const [etages, setEtages]       = useState<EtageOption[]>([]);
  const [logements, setLogements] = useState<LogementOption[]>([]);
  const [siteSearch, setSiteSearch] = useState('');

  const [favSites, setFavSites]   = useState<string[]>(() => getFavSites());
  const [recentLocs, setRecentLocs] = useState<RecentLoc[]>(() => getRecentLocs());
  const [showFavPanel, setShowFavPanel] = useState(false);
  const [showRecentPanel, setShowRecentPanel] = useState(false);

  const [siteId, setSiteId]         = useState('');
  const [residenceId, setResidenceId] = useState('');
  const [batimentId, setBatimentId]   = useState('');
  const [etageId, setEtageId]         = useState('');
  const [logementId, setLogementId]   = useState(initialLogementId ?? '');

  const [locSectionOpen, setLocSectionOpen] = useState(!initialLogementId);
  const [selectedLabel, setSelectedLabel]   = useState(initialLabel ?? '');

  const [tree, setTree]             = useState<TreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [arboSelectedId, setArboSelectedId]     = useState('');
  const [arboSelectedType, setArboSelectedType] = useState<NodeType | ''>('');
  const [arboPath, setArboPath]                 = useState('');

  const [occupants, setOccupants]       = useState<OccupantRow[]>([]);
  const [occLoading, setOccLoading]     = useState(false);
  const [anciensOpen, setAnciensOpen]   = useState(false);

  // Always-current ref for the callback — avoids stale closure in async effects
  const onOccupantsLoadedRef = useRef(onOccupantsLoaded);
  useEffect(() => { onOccupantsLoadedRef.current = onOccupantsLoaded; }, [onOccupantsLoaded]);

  const skipCascade = useRef(false);
  void skipCascade;

  // ── Load all sites once ─────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('sites').select('id, nom, code').order('nom').then(({ data }) => setSites(data ?? []));
  }, []);

  // ── Cascade effects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!siteId) { setResidences([]); setResidenceId(''); return; }
    supabase.from('residences').select('id, nom, site_id').eq('site_id', siteId).order('nom')
      .then(({ data }) => setResidences(data ?? []));
  }, [siteId]);

  useEffect(() => {
    if (!residenceId) { setBatiments([]); setBatimentId(''); return; }
    supabase.from('batiments').select('id, nom, residence_id').eq('residence_id', residenceId).order('nom')
      .then(({ data }) => setBatiments(data ?? []));
  }, [residenceId]);

  useEffect(() => {
    if (!batimentId) { setEtages([]); setEtageId(''); return; }
    supabase.from('etages').select('id, nom, batiment_id, numero').eq('batiment_id', batimentId).order('numero')
      .then(({ data }) => setEtages(data ?? []));
  }, [batimentId]);

  useEffect(() => {
    if (!etageId) { setLogements([]); setLogementId(prev => prev && !initialLogementId ? '' : prev); return; }
    supabase.from('logements').select('id, numero, etage_id').eq('etage_id', etageId).order('numero')
      .then(({ data }) => setLogements(data ?? []));
  }, [etageId, initialLogementId]);

  // ── Single unified occupant fetch — fires when logementId state changes ─────
  useEffect(() => {
    if (!logementId) { setOccupants([]); return; }
    let cancelled = false;
    setOccLoading(true);
    supabase.from('occupants').select('*').eq('logement_id', logementId)
      .order('statut', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setOccLoading(false);
        const occs = (data ?? []) as OccupantRow[];
        setOccupants(occs);
        onOccupantsLoadedRef.current?.(occs);
      });
    return () => { cancelled = true; };
  }, [logementId]);

  // ── Build arborescence tree ──────────────────────────────────────────────────
  const buildTree = useCallback(async () => {
    setTreeLoading(true);
    const [
      { data: sd }, { data: rd }, { data: bd }, { data: ed }, { data: ld },
    ] = await Promise.all([
      supabase.from('sites').select('id, nom').order('nom'),
      supabase.from('residences').select('id, nom, site_id').order('nom'),
      supabase.from('batiments').select('id, nom, residence_id').order('nom'),
      supabase.from('etages').select('id, nom, batiment_id, numero').order('numero'),
      supabase.from('logements').select('id, numero, etage_id').order('numero'),
    ]);
    const logMap: Record<string, LogementOption[]> = {};
    for (const l of (ld ?? []) as LogementOption[]) (logMap[l.etage_id] ??= []).push(l);
    const etageMap: Record<string, EtageOption[]> = {};
    for (const e of (ed ?? []) as EtageOption[]) (etageMap[e.batiment_id] ??= []).push(e);
    const batMap: Record<string, BatimentOption[]> = {};
    for (const b of (bd ?? []) as BatimentOption[]) (batMap[b.residence_id] ??= []).push(b);
    const resMap: Record<string, ResidenceOption[]> = {};
    for (const r of (rd ?? []) as ResidenceOption[]) (resMap[r.site_id] ??= []).push(r);
    const nodes: TreeNode[] = (sd ?? []).map((s: SiteOption) => ({
      id: s.id, type: 'site' as const, nom: s.nom,
      children: (resMap[s.id] ?? []).map((r: ResidenceOption) => ({
        id: r.id, type: 'residence' as const, nom: r.nom,
        children: (batMap[r.id] ?? []).map((b: BatimentOption) => ({
          id: b.id, type: 'batiment' as const, nom: b.nom,
          children: (etageMap[b.id] ?? []).map((e: EtageOption) => ({
            id: e.id, type: 'etage' as const, nom: e.nom,
            children: (logMap[e.id] ?? []).map((l: LogementOption) => ({
              id: l.id, type: 'logement' as const, nom: `Logement ${l.numero}`,
            })),
          })),
        })),
      })),
    }));
    setTree(nodes);
    setTreeLoading(false);
  }, []);

  useEffect(() => {
    if (locMode === 'arborescence' && tree.length === 0) buildTree();
  }, [locMode, tree.length, buildTree]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const q = siteSearch.trim().toLowerCase();
  const filteredSites = q ? sites.filter(s => s.nom.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) : sites;
  const favSiteObjects = sites.filter(s => favSites.includes(s.id));

  const siteName     = sites.find(s => s.id === siteId)?.nom ?? '';
  const residenceName = residences.find(r => r.id === residenceId)?.nom ?? '';
  const batimentName  = batiments.find(b => b.id === batimentId)?.nom ?? '';
  const etageNom     = etages.find(e => e.id === etageId)?.nom ?? '';
  const logementNum  = logements.find(l => l.id === logementId)?.numero ?? '';

  const locSummary = selectedLabel || (locMode === 'arborescence'
    ? arboPath
    : [siteName, residenceName, batimentName, etageNom, logementNum ? `Logement ${logementNum}` : ''].filter(Boolean).join(' › '));

  function handleLogementSelected(lId: string) {
    const site = sites.find(s => s.id === siteId);
    const res  = residences.find(r => r.id === residenceId);
    const bat  = batiments.find(b => b.id === batimentId);
    const eta  = etages.find(e => e.id === etageId);
    const log  = logements.find(l => l.id === lId);
    const parts = [site?.code, res?.nom, bat?.nom, eta?.nom, log ? `Logement ${log.numero}` : ''].filter(Boolean);
    const label = parts.join(' › ');
    setSelectedLabel('');
    setLogementId(lId);
    setLocSectionOpen(false);
    const rec: RecentLoc = {
      siteId, siteNom: site?.nom ?? '', siteCode: site?.code ?? '',
      residenceId, residenceNom: res?.nom,
      batimentId, batimentNom: bat?.nom,
      etageId, etageNom: eta?.nom,
      logementId: lId, logementNum: log?.numero,
      label,
    };
    addRecentLoc(rec);
    setRecentLocs(getRecentLocs());
    onSelect({
      logementId: lId, logementNumero: log?.numero ?? '',
      etageId, etageNom: eta?.nom ?? '',
      batimentId, batimentNom: bat?.nom ?? '',
      residenceId, residenceNom: res?.nom ?? '',
      siteId, siteNom: site?.nom ?? '', siteCode: site?.code ?? '',
    });
  }

  function handleRecentSelect(r: RecentLoc) {
    setSiteId(r.siteId);
    setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId('');
    setSelectedLabel('');
    setShowRecentPanel(false);
    setShowFavPanel(false);
  }

  // ── Occupant section ─────────────────────────────────────────────────────────
  const hasLogement = !!logementId;
  const currentOccs = occupants.filter(o => o.statut === 'occupant_actuel');
  const nextOccs    = occupants.filter(o => o.statut === 'a_venir');
  const ancienOccs  = occupants.filter(o => o.statut === 'ancien_occupant');

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Left: Location picker ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Logement
          </h3>
          {favSiteObjects.length > 0 && (
            <button type="button"
              onClick={() => { setShowFavPanel(v => !v); setShowRecentPanel(false); }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${showFavPanel ? 'bg-amber-100' : 'hover:bg-amber-50'}`}
              title="Sites favoris">
              <Star className={`w-3.5 h-3.5 ${showFavPanel ? 'text-amber-500 fill-amber-400' : 'text-amber-400'}`} />
            </button>
          )}
          {recentLocs.length > 0 && (
            <button type="button"
              onClick={() => { setShowRecentPanel(v => !v); setShowFavPanel(false); }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${showRecentPanel ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
              title="Sites récents">
              <Clock className={`w-3.5 h-3.5 ${showRecentPanel ? 'text-slate-700' : 'text-slate-400'}`} />
            </button>
          )}
        </div>

        {showFavPanel && favSiteObjects.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap px-2 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
            {favSiteObjects.map(s => (
              <button key={s.id} type="button"
                onClick={() => { setSiteId(s.id); setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId(''); setSelectedLabel(''); setShowFavPanel(false); setLocSectionOpen(true); }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-colors ${siteId === s.id ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700'}`}>
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                <span>{s.code}</span>
                <span className="text-slate-400 font-normal hidden sm:inline">— {s.nom}</span>
              </button>
            ))}
          </div>
        )}

        {showRecentPanel && recentLocs.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            {recentLocs.map((r, i) => (
              <button key={i} type="button" onClick={() => handleRecentSelect(r)} title={r.label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors">
                <Clock className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                <span className="max-w-[120px] truncate">{r.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-2">
          {(['niveaux', 'arborescence'] as const).map(mode => {
            const Icon = mode === 'niveaux' ? List : GitBranch;
            const active = locMode === mode;
            return (
              <button key={mode} type="button"
                onClick={() => { setLocMode(mode); setLocSectionOpen(true); }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${active ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                    {mode === 'niveaux' ? 'Niveau par niveau' : 'Arborescence'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {mode === 'niveaux' ? 'Sélection guidée' : 'Vue hiérarchique'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Niveaux mode ─────────────────────────────────────────────────── */}
        {locMode === 'niveaux' && (
          <div className="space-y-2">
            {/* Accordion header */}
            <button type="button" onClick={() => setLocSectionOpen(o => !o)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${locSectionOpen ? 'border-slate-200 bg-slate-50' : logementId ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${logementId && !locSectionOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                {logementId && !locSectionOpen
                  ? <span className="text-xs font-semibold text-blue-700 truncate">{locSummary}</span>
                  : <span className="text-xs font-semibold text-slate-700">Sélection du logement</span>}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${locSectionOpen ? '' : '-rotate-90'}`} />
            </button>

            {locSectionOpen && (
              <div className="space-y-2.5 animate-[fadeIn_0.15s_ease-out]">
                {/* Site */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Site</label>
                    <button type="button"
                      onClick={() => { const next = toggleFavSite(siteId || ''); setFavSites(next); }}
                      disabled={!siteId}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-500 transition-colors disabled:opacity-30">
                      <Star className={`w-3.5 h-3.5 transition-colors ${siteId && favSites.includes(siteId) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      <span className="hidden sm:inline">Favori</span>
                    </button>
                  </div>
                  <div className="relative mb-1.5">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    <input value={siteSearch} onChange={e => setSiteSearch(e.target.value)}
                      placeholder="Rechercher par nom ou code..."
                      className="w-full pl-6 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
                  </div>
                  <select value={siteId}
                    onChange={e => { setSiteId(e.target.value); setSiteSearch(''); setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId(''); setSelectedLabel(''); onSelect(null); }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                    size={filteredSites.length > 0 && siteSearch && !siteId ? Math.min(filteredSites.length + 1, 6) : 1}>
                    <option value="">Sélectionner un site...</option>
                    {filteredSites.map(s => <option key={s.id} value={s.id}>{s.code} — {s.nom}</option>)}
                  </select>
                </div>

                {siteId && residences.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Résidence</label>
                    <select value={residenceId}
                      onChange={e => { setResidenceId(e.target.value); setBatimentId(''); setEtageId(''); setLogementId(''); setSelectedLabel(''); onSelect(null); }}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                      <option value="">Sélectionner une résidence...</option>
                      {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                    </select>
                  </div>
                )}

                {residenceId && batiments.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bâtiment</label>
                    <select value={batimentId}
                      onChange={e => { setBatimentId(e.target.value); setEtageId(''); setLogementId(''); setSelectedLabel(''); onSelect(null); }}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                      <option value="">Sélectionner un bâtiment...</option>
                      {batiments.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
                    </select>
                  </div>
                )}

                {batimentId && etages.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Étage</label>
                    <select value={etageId}
                      onChange={e => { setEtageId(e.target.value); setLogementId(''); setSelectedLabel(''); onSelect(null); }}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                      <option value="">Sélectionner un étage...</option>
                      {etages.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                    </select>
                  </div>
                )}

                {etageId && logements.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Logement</label>
                    <select value={logementId}
                      onChange={e => { if (e.target.value) handleLogementSelected(e.target.value); }}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                      <option value="">Sélectionner un logement...</option>
                      {logements.map(l => <option key={l.id} value={l.id}>Logement {l.numero}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Arborescence mode ─────────────────────────────────────────────── */}
        {locMode === 'arborescence' && (
          <div className="space-y-2">
            <button type="button" onClick={() => setLocSectionOpen(o => !o)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${locSectionOpen ? 'border-slate-200 bg-slate-50' : arboSelectedId ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <GitBranch className={`w-3.5 h-3.5 flex-shrink-0 ${arboSelectedId && !locSectionOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                {arboSelectedId && !locSectionOpen
                  ? <span className="text-xs font-semibold text-blue-700 truncate">{arboPath}</span>
                  : <span className="text-xs font-semibold text-slate-700">Sélection dans l'arborescence</span>}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${locSectionOpen ? '' : '-rotate-90'}`} />
            </button>

            {locSectionOpen && (
              <div className="animate-[fadeIn_0.15s_ease-out]">
                <ArborescencePicker tree={tree} selectedId={arboSelectedId} selectedType={arboSelectedType}
                  loading={treeLoading}
                  onSelect={(id, type, path) => {
                    setArboSelectedId(id);
                    setArboSelectedType(id ? type : '');
                    setArboPath(path);
                    if (id && type === 'logement') {
                      setLogementId(id);
                      setLocSectionOpen(false);
                      const pathParts = path.split(' › ');
                      const siteN = pathParts[0] ?? '';
                      const siteObj = sites.find(s => s.nom === siteN) ?? sites[0];
                      if (siteObj) {
                        addRecentLoc({ siteId: siteObj.id, siteNom: siteObj.nom, siteCode: siteObj.code, label: path });
                        setRecentLocs(getRecentLocs());
                      }
                      onSelect({ logementId: id, logementNumero: path.split(' › ').pop()?.replace('Logement ', '') ?? '', etageId: '', etageNom: '', batimentId: '', batimentNom: '', residenceId: '', residenceNom: pathParts[1] ?? '', siteId: siteObj?.id ?? '', siteNom: siteN, siteCode: siteObj?.code ?? '' });
                    } else if (!id) {
                      setLogementId('');
                      onSelect(null);
                    }
                  }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Occupant panel ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <User className="w-3.5 h-3.5" /> Occupant(s)
        </h3>

        {!hasLogement && (
          <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <User className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 text-center font-medium">Sélectionnez un logement<br />pour voir les occupants</p>
          </div>
        )}

        {hasLogement && occLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        )}

        {hasLogement && !occLoading && occupants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-slate-200">
            <User className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-500 text-center">Aucun occupant trouvé<br />pour ce logement</p>
          </div>
        )}

        {currentOccs.map(occ => <OccupantCard key={occ.id} occ={occ} />)}

        {nextOccs.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Prochain occupant
            </p>
            {nextOccs.map(occ => <OccupantCard key={occ.id} occ={occ} />)}
          </div>
        )}

        {ancienOccs.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button type="button"
              onClick={() => setAnciensOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Anciens occupants
                <span className="ml-1 bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {ancienOccs.length}
                </span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${anciensOpen ? '' : '-rotate-90'}`} />
            </button>
            {anciensOpen && (
              <div className="p-3 space-y-2 border-t border-slate-100">
                {ancienOccs.map(occ => <OccupantCard key={occ.id} occ={occ} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
