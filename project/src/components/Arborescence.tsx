import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { usePatrimoineStore } from '../store/patrimoineStore';
import { LIMOGES_DOMAINES } from '../lib/limogesData';
import {
  Building2, MapPin, Layers, Home, ChevronRight, ChevronDown, ChevronUp,
  RefreshCw, AlertTriangle, Search, X, ChevronsDownUp, ChevronsUpDown,
  Wrench, Zap, Flame, Wind, Thermometer, ShieldAlert, Droplets, LayoutPanelTop,
  ArrowUpDown, Settings2, FolderOpen, DoorOpen, Landmark,
  Lightbulb, Camera, Leaf, Activity,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Statut = 'disponible' | 'indisponible' | 'en_maintenance' | 'sinistre' | 'fonctionnel' | 'hors_service';

interface EquipementRow {
  id: string;
  identifiant: string;
  designation: string;
  categorie: string;
  sous_categorie: string | null;
  etat: string;
  marque: string | null;
  modele: string | null;
  localisation_detail: string | null;
  prochaine_echeance: string | null;
  residence_id: string | null;
  batiment_id: string | null;
}

interface LogementRow {
  id: string; etage_id: string; numero: string; statut: Statut;
  annee_construction?: number; annee_derniere_renovation?: number;
  nom_occupant?: string; prenom_occupant?: string;
  email_occupant?: string; telephone_occupant?: string;
  statut_occupation?: string; type_logement?: string; surface?: number;
}
interface EtageRow {
  id: string; batiment_id: string; nom: string; numero: number;
  annee_construction?: number; annee_derniere_renovation?: number;
}
interface BatimentRow {
  id: string; residence_id: string; nom: string; code: string; statut: Statut;
  annee_construction?: number; annee_derniere_renovation?: number;
  surface_totale?: number; nombre_etages?: number;
}
interface ResidenceRow {
  id: string; site_id: string; nom: string; code: string; statut: Statut;
  adresse?: string;
  annee_construction?: number; annee_derniere_renovation?: number;
}
interface SiteRow {
  id: string; nom: string; code: string; statut: Statut;
  adresse?: string; ville?: string; code_postal?: string;
  annee_construction?: number; annee_derniere_renovation?: number;
}

// ─── Virtual node for category / equipment ───────────────────────────────────

type NodeType = 'site' | 'residence' | 'batiment' | 'etage' | 'logement' | 'categorie' | 'equipement' | 'domaine' | 'batiment_ext' | 'niveau' | 'piece';

interface NodeAncestor { type: NodeType; nom: string; id: string }

interface TreeNode {
  id: string;
  type: NodeType;
  nom: string;
  code?: string;
  statut?: Statut | string;
  children?: TreeNode[];
  data?: unknown;
  ancestors?: NodeAncestor[];
  adresse_heritee?: string;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Ascenseurs':         { icon: ArrowUpDown,   color: 'text-violet-600', bg: 'bg-violet-50' },
  'Chauffage':          { icon: Flame,          color: 'text-orange-600', bg: 'bg-orange-50' },
  'Gaz':                { icon: Flame,          color: 'text-amber-600',  bg: 'bg-amber-50'  },
  'Ventilation':        { icon: Wind,           color: 'text-sky-600',    bg: 'bg-sky-50'    },
  'Climatisation':      { icon: Thermometer,    color: 'text-cyan-600',   bg: 'bg-cyan-50'   },
  'Sécurité incendie':  { icon: ShieldAlert,    color: 'text-red-600',    bg: 'bg-red-50'    },
  'Électricité':        { icon: Zap,            color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'Eau sanitaire':      { icon: Droplets,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
  'Structure bâtiment': { icon: LayoutPanelTop, color: 'text-slate-600',  bg: 'bg-slate-100' },
  'Mobilier urbain':    { icon: Activity,      color: 'text-lime-600',   bg: 'bg-lime-50'   },
  'Éclairage public':   { icon: Lightbulb,     color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'Signalisation':      { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  'Vidéosurveillance':  { icon: Camera,        color: 'text-slate-600',  bg: 'bg-slate-100' },
  'Sécurité / Accès':  { icon: ShieldAlert,   color: 'text-red-600',    bg: 'bg-red-50'    },
  'Espaces verts':      { icon: Leaf,          color: 'text-green-600',  bg: 'bg-green-50'  },
  'Fontainerie':        { icon: Droplets,      color: 'text-blue-600',   bg: 'bg-blue-50'   },
  'Équipements sportifs': { icon: Activity,   color: 'text-purple-600', bg: 'bg-purple-50' },
};

const ETAT_CONFIG: Record<string, { dot: string; label: string }> = {
  fonctionnel:    { dot: 'bg-emerald-500', label: 'Fonctionnel'    },
  en_maintenance: { dot: 'bg-amber-500',   label: 'En maintenance' },
  hors_service:   { dot: 'bg-red-500',     label: 'Hors service'   },
  disponible:     { dot: 'bg-emerald-500', label: 'Disponible'     },
  indisponible:   { dot: 'bg-red-500',     label: 'Indisponible'   },
};

// ─── Grouping ─────────────────────────────────────────────────────────────────

type GroupingKey = 'physical' | 'equip_l1' | 'equip_l2' | 'site_l1' | 'site_l2';

interface GroupingOption {
  key: GroupingKey;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const GROUPING_OPTIONS: GroupingOption[] = [
  {
    key:   'physical',
    label: 'Regroupement physique',
    desc:  'École > Bâtiment > Étage > Pièce',
    icon:  Building2,
    color: 'text-blue-700',
    bg:    'bg-blue-50 border-blue-200',
  },
  {
    key:   'equip_l1',
    label: 'Catégorie équip. N1',
    desc:  'Chauffage, Ascenseurs, Électricité…',
    icon:  Wrench,
    color: 'text-orange-700',
    bg:    'bg-orange-50 border-orange-200',
  },
  {
    key:   'equip_l2',
    label: 'Catégorie équip. N2',
    desc:  'Chaudière gaz, Chaudière fioul…',
    icon:  Settings2,
    color: 'text-amber-700',
    bg:    'bg-amber-50 border-amber-200',
  },
  {
    key:   'site_l1',
    label: 'Catégorie site N1',
    desc:  'Bâti, Non-bâti…',
    icon:  MapPin,
    color: 'text-teal-700',
    bg:    'bg-teal-50 border-teal-200',
  },
  {
    key:   'site_l2',
    label: 'Catégorie site N2',
    desc:  'Culture, Enseignement, Hébergement…',
    icon:  FolderOpen,
    color: 'text-emerald-700',
    bg:    'bg-emerald-50 border-emerald-200',
  },
];

// ─── Tree grouping helpers ────────────────────────────────────────────────────

function stripEquipFromTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.map(node => {
    if (!node.children) return node;
    const filtered = node.children
      .filter(c => !(c.type === 'categorie' && (c.id as string).startsWith('cat-')))
      .map(c => ({ ...c, children: c.children ? stripEquipFromTree(c.children) : undefined }));
    return { ...node, children: filtered };
  });
}

function buildEquipChildrenL1(
  resId: string,
  catMap: Record<string, EquipementRow[]>,
  ancestors: NodeAncestor[],
): TreeNode[] {
  return Object.entries(catMap).map(([cat, eqs]) => ({
    id: `cat-${resId}-${cat}`,
    type: 'categorie' as const,
    nom: cat,
    statut: 'disponible' as const,
    data: {},
    ancestors,
    children: eqs.map(eq => ({
      id: eq.id,
      type: 'equipement' as const,
      nom: eq.designation,
      code: eq.identifiant,
      statut: eq.etat,
      data: eq,
      ancestors: [...ancestors, { type: 'categorie' as const, nom: cat, id: `cat-${resId}-${cat}` }],
    })),
  }));
}

function buildEquipChildrenL2(
  resId: string,
  catMap: Record<string, EquipementRow[]>,
  ancestors: NodeAncestor[],
): TreeNode[] {
  const sousMap: Record<string, EquipementRow[]> = {};
  for (const eqs of Object.values(catMap)) {
    for (const eq of eqs) {
      const key = eq.sous_categorie ?? `${eq.categorie ?? 'Autre'} — Général`;
      (sousMap[key] ??= []).push(eq);
    }
  }
  return Object.entries(sousMap).sort(([a], [b]) => a.localeCompare(b)).map(([sousCat, eqs]) => ({
    id: `sousCat-${resId}-${sousCat}`,
    type: 'categorie' as const,
    nom: sousCat,
    statut: 'disponible' as const,
    data: {},
    ancestors,
    children: eqs.map(eq => ({
      id: eq.id,
      type: 'equipement' as const,
      nom: eq.designation,
      code: eq.identifiant,
      statut: eq.etat,
      data: eq,
      ancestors: [...ancestors, { type: 'categorie' as const, nom: sousCat, id: `sousCat-${resId}-${sousCat}` }],
    })),
  }));
}

function addEquipToResidences(
  nodes: TreeNode[],
  rawEquipMap: Record<string, Record<string, EquipementRow[]>>,
  useL2: boolean,
): TreeNode[] {
  return nodes.map(node => {
    const isResidence = node.type === 'residence';
    const isNonBatiDomaine = node.type === 'domaine' && !!(node.data as Record<string, unknown>)?.nonBatiRes;
    const isBatimentWithEquip = node.type === 'batiment_ext' && !!rawEquipMap[node.id];
    if (isResidence || isNonBatiDomaine || isBatimentWithEquip) {
      const catMap = rawEquipMap[node.id];
      if (!catMap) {
        if (node.children) {
          return { ...node, children: addEquipToResidences(node.children, rawEquipMap, useL2) };
        }
        return node;
      }
      const anc = [...(node.ancestors ?? []), { type: node.type as const, nom: node.nom, id: node.id }] as NodeAncestor[];
      const equipNodes = useL2
        ? buildEquipChildrenL2(node.id, catMap, anc)
        : buildEquipChildrenL1(node.id, catMap, anc);
      const updatedChildren = node.children
        ? addEquipToResidences(node.children, rawEquipMap, useL2)
        : [];
      return { ...node, children: [...updatedChildren, ...equipNodes] };
    }
    if (node.children) {
      return { ...node, children: addEquipToResidences(node.children, rawEquipMap, useL2) };
    }
    return node;
  });
}

function buildFlatEquipTree(allEquips: EquipementRow[], useL2: boolean): TreeNode[] {
  const groups: Record<string, EquipementRow[]> = {};
  for (const eq of allEquips) {
    const key = useL2
      ? (eq.sous_categorie ?? `${eq.categorie ?? 'Autre'} — Général`)
      : (eq.categorie ?? 'Autre');
    (groups[key] ??= []).push(eq);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([cat, eqs]) => ({
    id: `flatCat-${cat}`,
    type: 'categorie' as const,
    nom: cat,
    statut: 'disponible' as const,
    data: {},
    ancestors: [],
    children: eqs.map(eq => ({
      id: eq.id,
      type: 'equipement' as const,
      nom: eq.designation,
      code: eq.identifiant,
      statut: eq.etat,
      data: eq,
      ancestors: [{ type: 'categorie' as const, nom: cat, id: `flatCat-${cat}` }],
    })),
  }));
}

function wrapWithSiteL2(nodes: TreeNode[]): TreeNode[] {
  const groups: Record<string, TreeNode[]> = {};
  for (const node of nodes) {
    if (node.type === 'domaine') {
      if (node.id === 'lim-nonbati-root') {
        // Expand non-bâti subcategories as separate N2 groups
        for (const child of node.children ?? []) {
          groups[child.nom] = child.children ?? [];
        }
      } else {
        groups[node.nom] = node.children ?? [];
      }
    } else {
      // CROUS sites
      const lower = node.nom.toLowerCase();
      const cat = lower.includes('manufacture') || lower.includes('restau')
        ? 'Restauration universitaire'
        : 'Hébergement & Campus';
      (groups[cat] ??= []).push(node);
    }
  }
  return Object.entries(groups).map(([nom, children]) => ({
    id: `siteL2-${nom}`,
    type: 'domaine' as const,
    nom,
    statut: 'fonctionnel' as const,
    data: {},
    ancestors: [],
    children,
  }));
}

function wrapWithSiteL1(nodes: TreeNode[]): TreeNode[] {
  const NON_BATI_NAMES = new Set(['Voirie', 'Places publiques', 'Parcs et jardins', 'Sites sportifs extérieurs']);
  const bati: TreeNode[] = [];
  const nonBati: TreeNode[] = [];
  for (const node of nodes) {
    if (node.id === 'lim-nonbati-root') {
      nonBati.push(...(node.children ?? []));
    } else if (NON_BATI_NAMES.has(node.nom)) {
      nonBati.push(node);
    } else {
      bati.push(node);
    }
  }
  const result: TreeNode[] = [];
  if (bati.length > 0) result.push({
    id: 'siteL1-bati',
    type: 'domaine' as const,
    nom: 'Bâti',
    statut: 'fonctionnel' as const,
    data: {},
    ancestors: [],
    children: bati,
  });
  if (nonBati.length > 0) result.push({
    id: 'siteL1-nonbati',
    type: 'domaine' as const,
    nom: 'Non-bâti',
    statut: 'fonctionnel' as const,
    data: {},
    ancestors: [],
    children: nonBati,
  });
  return result;
}

function applyGroupings(
  tree: TreeNode[],
  groupings: GroupingKey[],
  rawEquipMap: Record<string, Record<string, EquipementRow[]>>,
  allEquips: EquipementRow[],
): TreeNode[] {
  const hasPhysical = groupings.includes('physical');
  const hasEquipL1  = groupings.includes('equip_l1');
  const hasEquipL2  = groupings.includes('equip_l2');
  const hasSiteL1   = groupings.includes('site_l1');
  const hasSiteL2   = groupings.includes('site_l2');

  const physIdx  = hasPhysical ? groupings.indexOf('physical') : Infinity;
  const siteL1Idx = hasSiteL1 ? groupings.indexOf('site_l1') : Infinity;
  const siteL2Idx = hasSiteL2 ? groupings.indexOf('site_l2') : Infinity;

  let result: TreeNode[];

  if (hasPhysical) {
    result = stripEquipFromTree(tree);
    if (hasEquipL1 || hasEquipL2) {
      result = addEquipToResidences(result, rawEquipMap, hasEquipL2 && !hasEquipL1);
    }
  } else if (hasEquipL1 || hasEquipL2) {
    result = buildFlatEquipTree(allEquips, hasEquipL2);
  } else {
    result = tree.map(n => ({ ...n, children: undefined }));
  }

  if (hasSiteL2 && siteL2Idx < physIdx) {
    result = wrapWithSiteL2(result);
  }
  if (hasSiteL1 && siteL1Idx < Math.min(siteL2Idx, physIdx)) {
    result = wrapWithSiteL1(result);
  }

  return result;
}

// ─── Grouping panel ───────────────────────────────────────────────────────────

interface GroupingPanelProps {
  activeGroupings: GroupingKey[];
  onChange: (g: GroupingKey[]) => void;
}

function GroupingPanel({ activeGroupings, onChange }: GroupingPanelProps) {
  const [open, setOpen] = useState(false);
  const available = GROUPING_OPTIONS.filter(o => !activeGroupings.includes(o.key));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...activeGroupings];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === activeGroupings.length - 1) return;
    const next = [...activeGroupings];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const remove = (key: GroupingKey) => onChange(activeGroupings.filter(k => k !== key));
  const add    = (key: GroupingKey) => onChange([...activeGroupings, key]);

  return (
    <div className="border-b border-slate-100 flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Groupement</span>
          {activeGroupings.length > 0 && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold leading-none">
              {activeGroupings.length}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp    className="w-3.5 h-3.5 text-slate-400" />
          : <ChevronDown  className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {open && (
        <div className="px-2 pb-2.5 space-y-1.5">
          {/* Active levels */}
          {activeGroupings.length > 0 ? (
            <div className="space-y-1">
              {activeGroupings.map((key, idx) => {
                const opt = GROUPING_OPTIONS.find(o => o.key === key)!;
                const Icon = opt.icon;
                return (
                  <div key={key} className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md flex-shrink-0 w-[44px] text-center leading-none">
                      Niv.&nbsp;{idx + 1}
                    </span>
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${opt.color}`} />
                    <span className={`text-xs flex-1 font-medium truncate ${opt.color}`}>{opt.label}</span>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0}
                        className="p-0.5 hover:bg-slate-100 rounded transition-colors disabled:opacity-25">
                        <ChevronUp className="w-3 h-3 text-slate-500" />
                      </button>
                      <button onClick={() => moveDown(idx)} disabled={idx === activeGroupings.length - 1}
                        className="p-0.5 hover:bg-slate-100 rounded transition-colors disabled:opacity-25">
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>
                      <button onClick={() => remove(key)}
                        className="p-0.5 hover:bg-red-50 rounded transition-colors">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center py-1 italic">Aucun groupement actif</p>
          )}

          {/* Available options to add */}
          {available.length > 0 && (
            <div className="pt-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5 px-0.5">
                + Ajouter
              </p>
              <div className="flex flex-wrap gap-1">
                {available.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => add(opt.key)}
                      title={opt.desc}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all hover:shadow-sm ${opt.bg} ${opt.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeGroupings.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-[11px] text-slate-400 hover:text-red-500 pt-1.5 pb-0.5 border-t border-slate-100 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Node icons ───────────────────────────────────────────────────────────────

function NodeIcon({ node }: { node: TreeNode }) {
  const cls = 'w-3.5 h-3.5 flex-shrink-0';

  if (node.type === 'site')         return <MapPin      className={`${cls} text-blue-500`}   />;
  if (node.type === 'residence')    return <Building2   className={`${cls} text-teal-600`}   />;
  if (node.type === 'batiment')     return <Layers      className={`${cls} text-slate-500`}  />;
  if (node.type === 'etage')        return <Layers      className={`${cls} text-slate-400`}  />;
  if (node.type === 'logement')     return <Home        className={`${cls} text-slate-400`}  />;

  // Limoges types
  if (node.type === 'domaine')      return <FolderOpen  className={`${cls} text-amber-500`}  />;
  if (node.type === 'batiment_ext') return <Landmark    className={`${cls} text-slate-600`}  />;
  if (node.type === 'niveau')       return <Layers      className={`${cls} text-slate-400`}  />;
  if (node.type === 'piece')        return <DoorOpen    className={`${cls} text-amber-600`}  />;

  if (node.type === 'categorie') {
    const cfg = CATEGORIE_CONFIG[node.nom];
    if (cfg) {
      const Icon = cfg.icon;
      return <Icon className={`${cls} ${cfg.color}`} />;
    }
    return <Settings2 className={`${cls} text-slate-400`} />;
  }

  if (node.type === 'equipement') return <Wrench className={`${cls} text-slate-400`} />;

  return null;
}

// ─── Etat dot ────────────────────────────────────────────────────────────────

function EtatDot({ etat }: { etat: string }) {
  const cfg = ETAT_CONFIG[etat] ?? { dot: 'bg-slate-300', label: etat };
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
      title={cfg.label}
    />
  );
}

// ─── Tree row ─────────────────────────────────────────────────────────────────

interface RowProps {
  node: TreeNode;
  depth: number;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  selected: TreeNode | null;
  onSelect: (node: TreeNode) => void;
  searchQuery: string;
}

function matches(node: TreeNode, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    node.nom.toLowerCase().includes(lower) ||
    (node.code?.toLowerCase().includes(lower) ?? false)
  );
}

function TreeItemRow({ node, depth, expanded, toggle, selected, onSelect, searchQuery }: RowProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded  = expanded[node.id];
  const isSelected  = selected?.id === node.id;
  const highlight   = searchQuery && matches(node, searchQuery);

  const isAlert = node.statut && !['disponible', 'fonctionnel'].includes(node.statut);

  const catCfg = node.type === 'categorie' ? CATEGORIE_CONFIG[node.nom] : null;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 cursor-pointer rounded-lg mx-1 transition-all
          ${isSelected ? 'bg-blue-50' : highlight ? 'ring-1 ring-blue-200 bg-blue-50/40' : 'hover:bg-slate-50'}
          ${node.type === 'categorie' ? 'my-0.5' : ''}`}
        style={{ paddingLeft: `${6 + depth * 14}px`, paddingRight: 6 }}
        onClick={() => {
          onSelect(node);
          if (hasChildren) toggle(node.id);
        }}
      >
        {/* Expand chevron */}
        <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-slate-300">
          {hasChildren
            ? isExpanded
              ? <ChevronDown  className="w-3 h-3" />
              : <ChevronRight className="w-3 h-3" />
            : null}
        </span>

        {/* Category pill or standard icon */}
        {node.type === 'categorie' && catCfg ? (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${catCfg.bg} ${catCfg.color} flex-shrink-0`}>
            <catCfg.icon className="w-3 h-3" />
            {node.nom}
          </span>
        ) : node.type === 'domaine' ? (
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex-1 truncate">{node.nom}</span>
        ) : (
          <>
            <NodeIcon node={node} />
            <span className={`text-xs flex-1 truncate ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'} ${node.type === 'equipement' ? 'text-slate-600' : ''}`}>
              {node.nom}
            </span>
          </>
        )}

        {/* Code badge for batiment/residence */}
        {node.code && node.type !== 'logement' && node.type !== 'categorie' && node.type !== 'equipement' && node.type !== 'domaine' && node.type !== 'batiment_ext' && node.type !== 'niveau' && node.type !== 'piece' && (
          <span className="text-[10px] text-slate-300 font-mono flex-shrink-0">{node.code}</span>
        )}

        {/* Equipment etat dot */}
        {node.type === 'equipement' && node.statut && (
          <EtatDot etat={node.statut} />
        )}

        {/* Alert icon */}
        {isAlert && node.type !== 'equipement' && (
          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeItemRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              selected={selected}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Arborescence() {
  const [tree, setTree]           = useState<TreeNode[]>([]);
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({});
  const [loading, setLoading]     = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const { selectedNode, setSelectedNode, searchQuery } = usePatrimoineStore();

  const [activeGroupings, setActiveGroupings] = useState<GroupingKey[]>(['physical', 'equip_l1']);
  const [rawEquipMap, setRawEquipMap] = useState<Record<string, Record<string, EquipementRow[]>>>({});
  const [allEquips, setAllEquips]     = useState<EquipementRow[]>([]);

  const activeSearch = localSearch || searchQuery;

  const buildTree = useCallback(async () => {
    setLoading(true);

    const [
      { data: sites },
      { data: residences },
      { data: batiments },
      { data: etages },
      { data: logements },
      { data: equipements },
    ] = await Promise.all([
      supabase.from('sites').select('id, nom, code, statut, adresse, ville, code_postal, annee_construction, annee_derniere_renovation').order('nom'),
      supabase.from('residences').select('id, site_id, nom, code, statut, adresse, annee_construction, annee_derniere_renovation').order('nom'),
      supabase.from('batiments').select('id, residence_id, nom, code, statut, annee_construction, annee_derniere_renovation, surface_totale, nombre_etages').order('nom'),
      supabase.from('etages').select('id, batiment_id, nom, numero, annee_construction, annee_derniere_renovation').order('numero'),
      supabase.from('logements').select('id, etage_id, numero, statut, annee_construction, annee_derniere_renovation, nom_occupant, prenom_occupant, email_occupant, telephone_occupant, statut_occupation, type_logement, surface, surface_m2, capacite_accueil, services, adresse_complete').order('numero'),
      supabase.from('equipements').select('id, identifiant, designation, categorie, sous_categorie, etat, marque, modele, localisation_detail, prochaine_echeance, residence_id, batiment_id').order('categorie').order('designation'),
    ]);

    // Index maps
    const logementsMap: Record<string, LogementRow[]> = {};
    for (const l of (logements ?? []) as LogementRow[]) {
      (logementsMap[l.etage_id] ??= []).push(l);
    }

    const etagesMap: Record<string, EtageRow[]> = {};
    for (const e of (etages ?? []) as EtageRow[]) {
      (etagesMap[e.batiment_id] ??= []).push(e);
    }

    const batimentsMap: Record<string, BatimentRow[]> = {};
    for (const b of (batiments ?? []) as BatimentRow[]) {
      (batimentsMap[b.residence_id] ??= []).push(b);
    }

    const residencesMap: Record<string, ResidenceRow[]> = {};
    for (const r of (residences ?? []) as ResidenceRow[]) {
      (residencesMap[r.site_id] ??= []).push(r);
    }

    // Group equipements by residence_id → categorie AND batiment_id → categorie
    const equipsMap: Record<string, Record<string, EquipementRow[]>> = {};
    for (const eq of (equipements ?? []) as EquipementRow[]) {
      const cat = eq.categorie ?? 'Autre';
      // Key by residence_id
      if (eq.residence_id) {
        if (!equipsMap[eq.residence_id]) equipsMap[eq.residence_id] = {};
        (equipsMap[eq.residence_id][cat] ??= []).push(eq);
      }
      // Also key by batiment_id (for limogesData batiment_ext nodes with fixedId)
      if (eq.batiment_id) {
        if (!equipsMap[eq.batiment_id]) equipsMap[eq.batiment_id] = {};
        (equipsMap[eq.batiment_id][cat] ??= []).push(eq);
      }
    }
    setRawEquipMap(equipsMap);
    setAllEquips((equipements ?? []) as EquipementRow[]);

    // Build category + equipment nodes for a residence
    const buildEquipNodes = (resId: string, ancestors: { type: NodeType; nom: string; id: string }[]): TreeNode[] => {
      const catMap = equipsMap[resId];
      if (!catMap) return [];
      return Object.entries(catMap).map(([cat, eqs]) => ({
        id:        `cat-${resId}-${cat}`,
        type:      'categorie' as const,
        nom:       cat,
        statut:    'disponible' as const,
        data:      {},
        ancestors,
        children: eqs.map((eq) => ({
          id:        eq.id,
          type:      'equipement' as const,
          nom:       eq.designation,
          code:      eq.identifiant,
          statut:    eq.etat,
          data:      eq,
          ancestors: [...ancestors, { type: 'categorie' as const, nom: cat, id: `cat-${resId}-${cat}` }],
        })),
      }));
    };

    // Build batiment subtree
    const buildBatNode = (
      bat: BatimentRow,
      ancestors: { type: NodeType; nom: string; id: string }[],
      adresseHeritee: string,
    ): TreeNode => {
      const batAncestors = [...ancestors, { type: 'batiment' as const, nom: bat.nom, id: bat.id }];
      return {
        id:             bat.id,
        type:           'batiment',
        nom:            bat.nom,
        code:           bat.code,
        statut:         bat.statut,
        data:           bat,
        ancestors,
        adresse_heritee: adresseHeritee,
        children: (etagesMap[bat.id] ?? []).map((etage) => {
          const etageAncestors = [...batAncestors, { type: 'etage' as const, nom: etage.nom, id: etage.id }];
          return {
            id:             etage.id,
            type:           'etage' as const,
            nom:            etage.nom,
            statut:         'disponible' as const,
            data:           etage,
            ancestors:      batAncestors,
            adresse_heritee: adresseHeritee,
            children: (logementsMap[etage.id] ?? []).map((log) => ({
              id:             log.id,
              type:           'logement' as const,
              nom:            log.numero,
              code:           log.numero,
              statut:         log.statut,
              data:           log,
              ancestors:      etageAncestors,
              adresse_heritee: adresseHeritee,
            })),
          };
        }),
      };
    };

    const nodes: TreeNode[] = (sites ?? [])
      .filter((site: SiteRow) => site.id !== 'a0000001-0000-0000-0000-000000000001')
      .map((site: SiteRow) => {
      const siteAdresse = [site.adresse, site.ville, site.code_postal].filter(Boolean).join(', ');

      const siteAncestors = [{ type: 'site' as const, nom: site.nom, id: site.id }];

      return {
        id:     site.id,
        type:   'site' as const,
        nom:    site.nom,
        code:   site.code,
        statut: site.statut,
        data:   site,
        ancestors: [],
        adresse_heritee: siteAdresse,
        children: (residencesMap[site.id] ?? []).map((res: ResidenceRow) => {
          const resAdresse = res.adresse || siteAdresse;

          const resAncestors = [...siteAncestors, { type: 'residence' as const, nom: res.nom, id: res.id }];
          const batNodes = (batimentsMap[res.id] ?? []).map(b => buildBatNode(b, resAncestors, resAdresse));
          const catNodes = buildEquipNodes(res.id, resAncestors);

          return {
            id:             res.id,
            type:           'residence' as const,
            nom:            res.nom,
            code:           res.code,
            statut:         res.statut,
            data:           res,
            ancestors:      siteAncestors,
            adresse_heritee: resAdresse,
            children: [
              ...(batNodes.length > 0 ? [{
                id:       `bat-section-${res.id}`,
                type:     'categorie' as const,
                nom:      'Bâtiments',
                statut:   'disponible' as const,
                data:     {},
                ancestors: resAncestors,
                children: batNodes,
              }] : []),
              ...catNodes,
            ],
          };
        }),
      };
    });

    setTree([...nodes, ...LIMOGES_DOMAINES as unknown as TreeNode[]]);
    setLoading(false);
  }, []);

  useEffect(() => { buildTree(); }, [buildTree]);

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const expandAll = () => {
    const map: Record<string, boolean> = {};
    function collect(nodes: TreeNode[]) {
      for (const n of nodes) {
        if ((n.children?.length ?? 0) > 0) map[n.id] = true;
        if (n.children) collect(n.children);
      }
    }
    collect(tree);
    setExpanded(map);
  };

  const collapseAll = () => setExpanded({});

  // Deep filter: keep node if it or any descendant matches
  const deepFilter = (node: TreeNode, q: string): TreeNode | null => {
    if (!q) return node;
    const selfMatch = matches(node, q);
    const filteredChildren = (node.children ?? [])
      .map(c => deepFilter(c, q))
      .filter(Boolean) as TreeNode[];
    if (selfMatch || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children };
    }
    return null;
  };

  // Apply grouping transformations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const displayTree = useMemo(
    () => applyGroupings(tree, activeGroupings, rawEquipMap, allEquips),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tree, activeGroupings, rawEquipMap, allEquips],
  );

  const filteredTree = activeSearch
    ? displayTree.map(n => deepFilter(n, activeSearch)).filter(Boolean) as TreeNode[]
    : displayTree;

  // Count stats from raw tree
  const countEquips = (nodes: TreeNode[]): number =>
    nodes.reduce((acc, n) => acc + (n.type === 'equipement' ? 1 : 0) + countEquips(n.children ?? []), 0);
  const equipsCount = countEquips(tree);

  const countByType = (nodes: TreeNode[], type: NodeType): number =>
    nodes.reduce((acc, n) => acc + (n.type === type ? 1 : 0) + countByType(n.children ?? [], type), 0);
  const residencesCount = countByType(tree, 'residence');
  const logementsCount  = countByType(tree, 'logement');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header — title + refresh buttons */}
      <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide leading-none">
              Référentiel Patrimoine
            </h2>
            {!loading && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {residencesCount} résidence{residencesCount !== 1 ? 's' : ''}
                {' · '}
                {logementsCount.toLocaleString('fr-FR')} logement{logementsCount !== 1 ? 's' : ''}
                {' · '}
                {equipsCount} équipement{equipsCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={expandAll}   className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Tout déplier">
              <ChevronsUpDown   className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button onClick={collapseAll} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Tout replier">
              <ChevronsDownUp   className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button onClick={buildTree}   className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Rafraîchir">
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Groupement panel */}
      <GroupingPanel activeGroupings={activeGroupings} onChange={setActiveGroupings} />

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher site, résidence, équipement..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-6 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 min-h-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="px-4 py-8 text-xs text-slate-400 text-center">
            {activeSearch ? 'Aucun résultat' : 'Aucun élément'}
          </div>
        ) : (
          filteredTree.map((node) => (
            <TreeItemRow
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              toggle={toggle}
              selected={selectedNode as TreeNode | null}
              onSelect={setSelectedNode as (n: TreeNode) => void}
              searchQuery={activeSearch}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-slate-100 flex-shrink-0 flex items-center gap-3 flex-wrap">
        {Object.entries(ETAT_CONFIG).slice(0, 3).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
            {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}
