/**
 * PatrimoinePicker — dropdown tree selector
 *
 * Loads the same Site > Résidence / Bâtiment hierarchy as the
 * "Référentiel Patrimoine" module and lets the user pick one node.
 * Only shows levels relevant for an ERP: sites, résidences, bâtiments
 * (both Supabase rows and Limoges static batiment_ext nodes).
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  MapPin, Building2, Layers, Landmark, Search, ChevronDown,
  ChevronRight, FolderOpen, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LIMOGES_DOMAINES } from '../../lib/limogesData';
import type { TreeNode } from '../../types/patrimoine';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PickedNode {
  id: string;
  nom: string;
  type: TreeNode['type'];
  adresse?: string;
  site_id?: string;
  residence_id?: string;
}

// ─── Icons per node type ───────────────────────────────────────────────────────

function NodeIcon({ type }: { type: TreeNode['type'] }) {
  const cls = 'w-3.5 h-3.5 flex-shrink-0';
  if (type === 'site')         return <MapPin     className={`${cls} text-blue-500`}   />;
  if (type === 'residence')    return <Building2  className={`${cls} text-teal-600`}   />;
  if (type === 'batiment')     return <Layers     className={`${cls} text-slate-500`}  />;
  if (type === 'batiment_ext') return <Landmark   className={`${cls} text-slate-600`}  />;
  if (type === 'domaine')      return <FolderOpen className={`${cls} text-amber-500`}  />;
  return null;
}

// ─── Flat list item shown in the picker tree ───────────────────────────────────

interface FlatNode {
  id: string;
  nom: string;
  type: TreeNode['type'];
  depth: number;
  adresse?: string;
  site_id?: string;
  residence_id?: string;
  hasChildren: boolean;
}

// ─── Build flat list from tree ─────────────────────────────────────────────────

const SELECTABLE_TYPES = new Set<TreeNode['type']>(['site', 'residence', 'batiment', 'batiment_ext']);
const VISIBLE_TYPES    = new Set<TreeNode['type']>(['site', 'residence', 'batiment', 'batiment_ext', 'domaine']);

function flattenTree(
  nodes: TreeNode[],
  expanded: Set<string>,
  depth: number,
  siteId: string | undefined,
  residenceId: string | undefined,
  out: FlatNode[],
): void {
  for (const node of nodes) {
    if (!VISIBLE_TYPES.has(node.type)) continue;

    const adresse = (node.data as Record<string, unknown>)?.adresse as string | undefined
      ?? node.adresse_heritee;

    const data = node.data as Record<string, unknown> | undefined;
    const nodeSiteId      = (data?.site_id as string | undefined) ?? siteId;
    const nodeResidenceId = (data?.residence_id as string | undefined) ?? residenceId;

    const hasChildren = (node.children ?? []).filter(c => VISIBLE_TYPES.has(c.type)).length > 0;

    out.push({
      id: node.id,
      nom: node.nom,
      type: node.type,
      depth,
      adresse,
      site_id: nodeSiteId,
      residence_id: nodeResidenceId,
      hasChildren,
    });

    if (hasChildren && expanded.has(node.id)) {
      flattenTree(
        node.children!,
        expanded,
        depth + 1,
        nodeSiteId,
        nodeResidenceId,
        out,
      );
    }
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  value: PickedNode | null;
  onChange: (node: PickedNode | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PatrimoinePicker({ value, onChange, placeholder = 'Sélectionner un bâtiment…', disabled }: Props) {
  const [open, setOpen]   = useState(false);
  const [tree, setTree]   = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Load tree on first open
  useEffect(() => {
    if (!open || tree.length > 0) return;
    loadTree();
  }, [open]);

  const loadTree = async () => {
    setLoading(true);
    const [
      { data: sites },
      { data: residences },
      { data: batiments },
    ] = await Promise.all([
      supabase.from('sites').select('id, nom, code, statut, adresse, ville').order('nom'),
      supabase.from('residences').select('id, site_id, nom, code, statut, adresse').order('nom'),
      supabase.from('batiments').select('id, residence_id, nom, code, statut').order('nom'),
    ]);

    // Indexed maps
    const batByRes: Record<string, typeof batiments> = {};
    for (const b of batiments ?? []) {
      (batByRes[b.residence_id] ??= []).push(b);
    }

    const resBysite: Record<string, typeof residences> = {};
    for (const r of residences ?? []) {
      (resBysite[r.site_id] ??= []).push(r);
    }

    // Build Supabase tree: Site > Résidence > Bâtiment
    const supabaseTree: TreeNode[] = (sites ?? []).map(site => ({
      id: site.id,
      type: 'site' as const,
      nom: site.nom,
      code: site.code,
      statut: site.statut,
      adresse_heritee: site.adresse ?? (site.ville ? `${site.ville}` : undefined),
      data: { adresse: site.adresse, ville: site.ville },
      children: (resBysite[site.id] ?? []).map(res => ({
        id: res.id,
        type: 'residence' as const,
        nom: res.nom,
        code: res.code,
        statut: res.statut,
        adresse_heritee: res.adresse ?? site.adresse,
        data: { site_id: site.id, adresse: res.adresse ?? site.adresse },
        children: (batByRes[res.id] ?? []).map(bat => ({
          id: bat.id,
          type: 'batiment' as const,
          nom: bat.nom,
          code: bat.code,
          statut: bat.statut,
          adresse_heritee: res.adresse ?? site.adresse,
          data: { site_id: site.id, residence_id: res.id, adresse: res.adresse ?? site.adresse },
          children: [],
        })),
      })),
    }));

    // Limoges static tree (domaines > batiment_ext)
    const limogesTree: TreeNode[] = LIMOGES_DOMAINES;

    const fullTree = [...supabaseTree, ...limogesTree];
    setTree(fullTree);

    // Auto-expand top-level nodes
    setExpanded(new Set(fullTree.map(n => n.id)));
    setLoading(false);
  };

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Filtered flat list
  const flatNodes = useMemo<FlatNode[]>(() => {
    const q = search.toLowerCase().trim();

    if (q) {
      // Flatten all nodes ignoring expand state, filter by name
      const all: FlatNode[] = [];
      const flatAll = (nodes: TreeNode[], depth: number, siteId?: string, resId?: string) => {
        for (const node of nodes) {
          if (!VISIBLE_TYPES.has(node.type)) continue;
          const data = node.data as Record<string, unknown> | undefined;
          const nSite = (data?.site_id as string) ?? siteId;
          const nRes  = (data?.residence_id as string) ?? resId;
          const adresse = (data?.adresse as string) ?? node.adresse_heritee;
          const hasChildren = (node.children ?? []).filter(c => VISIBLE_TYPES.has(c.type)).length > 0;
          if (node.nom.toLowerCase().includes(q)) {
            all.push({ id: node.id, nom: node.nom, type: node.type, depth: 0, adresse, site_id: nSite, residence_id: nRes, hasChildren });
          }
          if (node.children) flatAll(node.children, depth + 1, nSite, nRes);
        }
      };
      flatAll(tree, 0);
      return all;
    }

    const out: FlatNode[] = [];
    flattenTree(tree, expanded, 0, undefined, undefined, out);
    return out;
  }, [tree, expanded, search]);

  const handleSelect = (node: FlatNode) => {
    if (!SELECTABLE_TYPES.has(node.type)) {
      toggle(node.id);
      return;
    }
    onChange({ id: node.id, nom: node.nom, type: node.type, adresse: node.adresse, site_id: node.site_id, residence_id: node.residence_id });
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-xs text-left transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white hover:border-slate-300'}
          ${value ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'}`}
      >
        {value ? (
          <>
            <NodeIcon type={value.type} />
            <span className="flex-1 font-medium text-slate-700 truncate">{value.nom}</span>
            {value.adresse && <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{value.adresse}</span>}
            <button onClick={handleClear} className="p-0.5 hover:bg-red-100 rounded transition-colors flex-shrink-0 ml-1">
              <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
            </button>
          </>
        ) : (
          <>
            <Building2 className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <span className="flex-1 text-slate-400">{placeholder}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: 340 }}>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un site, bâtiment…"
              className="flex-1 text-xs focus:outline-none placeholder-slate-400 bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="flex-shrink-0">
                <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Tree content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-xs">
                <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Chargement…
              </div>
            ) : flatNodes.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">Aucun résultat</p>
            ) : (
              flatNodes.map(node => {
                const isSelectable = SELECTABLE_TYPES.has(node.type);
                const isDomaine    = node.type === 'domaine';
                const isSelected   = value?.id === node.id;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => handleSelect(node)}
                    style={{ paddingLeft: `${8 + node.depth * 14}px` }}
                    className={`w-full flex items-center gap-2 py-1.5 pr-3 text-left transition-colors group
                      ${isSelected ? 'bg-emerald-50' : isSelectable ? 'hover:bg-slate-50' : 'hover:bg-amber-50/50'}
                      ${!isSelectable && !isDomaine ? 'cursor-default' : ''}`}
                  >
                    {/* Expand/collapse chevron for nodes with children */}
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {node.hasChildren && !search ? (
                        expanded.has(node.id)
                          ? <ChevronDown  className="w-3 h-3 text-slate-400" />
                          : <ChevronRight className="w-3 h-3 text-slate-400" />
                      ) : null}
                    </span>

                    {/* Icon */}
                    {isDomaine ? (
                      <FolderOpen className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    ) : (
                      <NodeIcon type={node.type} />
                    )}

                    {/* Name */}
                    {isDomaine ? (
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide flex-1 truncate">{node.nom}</span>
                    ) : (
                      <span className={`text-xs flex-1 truncate ${isSelected ? 'text-emerald-700 font-semibold' : isSelectable ? 'text-slate-700' : 'text-slate-500'}`}>
                        {node.nom}
                      </span>
                    )}

                    {/* Address hint */}
                    {isSelectable && node.adresse && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[100px] hidden sm:block">{node.adresse}</span>
                    )}

                    {/* Selected check */}
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <p className="text-[10px] text-slate-400">Sélectionnez un site, résidence ou bâtiment</p>
          </div>
        </div>
      )}
    </div>
  );
}
