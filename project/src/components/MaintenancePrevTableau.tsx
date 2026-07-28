import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Wrench, Handshake, ShieldCheck, Users, ChevronUp, ChevronDown,
  Settings2, ArrowUpDown, CheckCircle2, Filter, X, ExternalLink, Mail,
  Pencil, Trash2,
} from 'lucide-react';
import apaveLogo from '../assets/logo-Apave.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Origine = 'interne' | 'contrat' | 'reglementaire';

export interface PlanRow {
  id: string;
  nom: string;
  origine: Origine;
  responsable: string;
  frequence: string;
  prochaine_echeance: string;
  statut: 'planifiée' | 'à venir' | 'réalisée' | 'en retard';
  source_ref?: string;
  source_label?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ORIGINE_CFG: Record<Origine, { label: string; icon: React.ElementType; color: string }> = {
  interne:       { label: 'Interne',       icon: Wrench,      color: 'bg-blue-50 text-blue-700 border-blue-200'       },
  contrat:       { label: 'Contrat',       icon: Handshake,   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reglementaire: { label: 'Réglementaire', icon: ShieldCheck, color: 'bg-amber-50 text-amber-700 border-amber-200'     },
};

const STATUT_CFG: Record<string, string> = {
  'planifiée':  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'à venir':    'bg-slate-100 text-slate-600 border-slate-200',
  'réalisée':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'en retard':  'bg-red-50 text-red-700 border-red-200',
};

// Prestataires logo for "réglementaire" rows
const PRESTATAIRE_LOGOS: Record<string, { bg: string; initials: string; logo?: string }> = {
  'APAVE':         { bg: '#2e7d32', initials: 'AP', logo: apaveLogo },
  'SOCOTEC':       { bg: '#1565c0', initials: 'SC' },
  'Bureau Veritas':{ bg: '#c62828', initials: 'BV' },
  'DEKRA':         { bg: '#e65100', initials: 'DK' },
  'Qualiconsult':  { bg: '#6a1b9a', initials: 'QC' },
};

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
  id: string; label: string;
  icon?: React.ReactNode;
  defaultWidth: number; minWidth: number;
  canHide: boolean; sortable?: boolean;
}

const COLUMNS: ColDef[] = [
  { id: 'nom',               label: 'Nom du plan',          icon: <Wrench className="w-3 h-3" />,      defaultWidth: 240, minWidth: 160, canHide: false, sortable: true  },
  { id: 'origine',           label: 'Origine',              icon: <Filter className="w-3 h-3" />,      defaultWidth: 140, minWidth: 110, canHide: false, sortable: true  },
  { id: 'responsable',       label: 'Responsable',          icon: <Users className="w-3 h-3" />,       defaultWidth: 180, minWidth: 130, canHide: true,  sortable: true  },
  { id: 'frequence',         label: 'Fréquence',            icon: <ArrowUpDown className="w-3 h-3" />, defaultWidth: 130, minWidth: 100, canHide: true,  sortable: true  },
  { id: 'prochaine_echeance',label: 'Prochaine échéance',   icon: <CheckCircle2 className="w-3 h-3" />,defaultWidth: 150, minWidth: 120, canHide: false, sortable: true  },
  { id: 'statut',            label: 'Statut',               icon: <CheckCircle2 className="w-3 h-3" />,defaultWidth: 120, minWidth: 100, canHide: false, sortable: true  },
  { id: 'source',            label: 'Source',                                                           defaultWidth: 160, minWidth: 120, canHide: true,  sortable: false },
  { id: 'actions',           label: 'Actions',                                                          defaultWidth: 100, minWidth: 90,  canHide: false, sortable: false },
];

const SORT_OPTIONS = [
  { value: 'prochaine_echeance_asc',  label: 'Échéance (plus proche)' },
  { value: 'prochaine_echeance_desc', label: 'Échéance (plus éloignée)' },
  { value: 'nom_asc',                 label: 'Nom A → Z' },
  { value: 'nom_desc',                label: 'Nom Z → A' },
  { value: 'origine_asc',             label: 'Origine A → Z' },
  { value: 'statut_asc',              label: 'Statut' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrigBadge({ origine }: { origine: Origine }) {
  const cfg = ORIGINE_CFG[origine];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function ResponsableCell({ origine, responsable }: { origine: Origine; responsable: string }) {
  if (origine === 'interne') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">Equipe Electro.</span>
      </div>
    );
  }
  if (origine === 'reglementaire') {
    const cfg = PRESTATAIRE_LOGOS[responsable];
    return (
      <div className="flex items-center gap-1.5">
        {cfg?.logo ? (
          <img src={cfg.logo} alt={responsable} className="w-6 h-6 rounded object-contain border border-slate-100 bg-white flex-shrink-0" />
        ) : (
          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cfg?.bg ?? '#64748b' }}>
            <span className="text-white text-[9px] font-bold leading-none">{cfg?.initials ?? responsable.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <span className="text-xs text-slate-700 whitespace-nowrap">{responsable}</span>
      </div>
    );
  }
  // contrat
  return <span className="text-xs text-slate-700 whitespace-nowrap">{responsable}</span>;
}

function ResizableTh({ col, width, onResize, sortField, sortDir, onSort }: {
  col: ColDef; width: number;
  onResize: (id: string, delta: number) => void;
  sortField: string; sortDir: 'asc' | 'desc';
  onSort: (id: string) => void;
}) {
  const dragging = useRef(false); const startX = useRef(0);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); dragging.current = true; startX.current = e.clientX;
    const onMove = (ev: MouseEvent) => { if (!dragging.current) return; onResize(col.id, ev.clientX - startX.current); startX.current = ev.clientX; };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [col.id, onResize]);

  const isActive = sortField === col.id;
  if (!col.label) {
    return <th style={{ width, minWidth: col.minWidth }} className="px-3 py-2.5 bg-slate-50 border-b border-slate-200" />;
  }
  return (
    <th style={{ width, minWidth: col.minWidth, position: 'relative' }}
      className="px-3 py-2.5 text-left bg-slate-50 border-b border-slate-200 select-none align-middle"
      onClick={() => col.sortable && onSort(col.id)}>
      <div className={`flex items-center gap-1 pr-3 ${col.sortable ? 'cursor-pointer' : ''}`}>
        {col.icon && <span className="text-slate-400 flex-shrink-0">{col.icon}</span>}
        <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">{col.label}</span>
        {col.sortable && (
          <span className="ml-auto flex-shrink-0">
            {isActive
              ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />)
              : <ChevronUp className="w-3 h-3 text-slate-300" />}
          </span>
        )}
      </div>
      <span onMouseDown={onMouseDown} onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group" style={{ userSelect: 'none' }}>
        <span className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// FilterDropdown —————————————————————————————————————————————————————————————

interface FilterItem { key: string; label: string; color?: string }

function FilterDropdown({ label, icon, items, active, toggle, clear }: {
  label: string; icon: React.ReactNode;
  items: FilterItem[]; active: Set<string>;
  toggle: (k: string) => void; clear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = active.size;
  return (
    <div className="relative flex-shrink-0">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors
          ${count > 0 ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
        {icon}
        {label}
        {count > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{count}</span>}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-[101] bg-white rounded-xl shadow-xl border border-slate-100 p-1 min-w-[160px]">
            {items.map(item => (
              <button key={item.key} onClick={() => toggle(item.key)}
                className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors text-left
                  ${active.has(item.key) ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active.has(item.key) ? 'bg-blue-500' : 'bg-slate-300'}`} />
                {item.label}
              </button>
            ))}
            {count > 0 && (
              <button onClick={clear} className="w-full flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 px-3 py-1.5 border-t border-slate-100 mt-1">
                <X className="w-3 h-3" /> Effacer
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Column visibility sidebar ───────────────────────────────────────────────────

function ColVisPanel({ cols, visible, onChange, onClose }: {
  cols: ColDef[]; visible: string[];
  onChange: (id: string) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[200]" onClick={onClose} />
      <div className="absolute top-full left-0 mt-1 z-[201] bg-white rounded-xl shadow-xl border border-slate-100 p-3 min-w-[200px]">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Colonnes visibles</p>
        {cols.filter(c => c.canHide && c.label).map(col => (
          <label key={col.id} className="flex items-center gap-2 text-xs text-slate-700 px-1 py-1.5 cursor-pointer hover:bg-slate-50 rounded-lg">
            <input type="checkbox" checked={visible.includes(col.id)} onChange={() => onChange(col.id)}
              className="rounded text-blue-600 focus:ring-blue-300" />
            {col.label}
          </label>
        ))}
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  plans: PlanRow[];
  selectedId?: string;
  onSelect?: (plan: PlanRow) => void;
  onEmailClick?: (plan: PlanRow) => void;
  onEdit?: (plan: PlanRow) => void;
  onDelete?: (id: string) => void;
  newPlanId?: string;
}

export default function MaintenancePrevTableau({ plans, selectedId, onSelect, onEmailClick, onEdit, onDelete, newPlanId }: Props) {
  const defaultVisible = useMemo(() => COLUMNS.map(c => c.id), []);
  const [sortField, setSortField]       = useState('prochaine_echeance');
  const [sortDir,   setSortDir]         = useState<'asc' | 'desc'>('asc');
  const [visibleCols, setVisibleCols]   = useState<string[]>(defaultVisible);
  const [showColPanel, setShowColPanel] = useState(false);
  const [activeOrigine, setActiveOrigine] = useState<Set<string>>(new Set());
  const [activeStatut,  setActiveStatut]  = useState<Set<string>>(new Set());
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(COLUMNS.map(c => [c.id, c.defaultWidth]))
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [detailPlan,  setDetailPlan]  = useState<PlanRow | null>(null);

  useEffect(() => {
    if (!newPlanId) return;
    setHighlightId(newPlanId);
    const t = setTimeout(() => setHighlightId(null), 10000);
    return () => clearTimeout(t);
  }, [newPlanId]);

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = COLUMNS.find(c => c.id === id)!;
      return { ...prev, [id]: Math.max(col.minWidth, prev[id] + delta) };
    });
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const applySort = (s: string) => {
    const parts = s.split('_'); const dir = parts.pop() as 'asc' | 'desc'; const field = parts.join('_');
    setSortField(field); setSortDir(dir);
  };

  const toggleColVisible = (id: string) => {
    setVisibleCols(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const display = useMemo(() => {
    let items = [...plans];
    if (activeOrigine.size > 0) items = items.filter(r => activeOrigine.has(r.origine));
    if (activeStatut.size  > 0) items = items.filter(r => activeStatut.has(r.statut));
    items.sort((a, b) => {
      let va = '', vb = '';
      if (sortField === 'nom')                { va = a.nom;                vb = b.nom; }
      if (sortField === 'origine')            { va = a.origine;            vb = b.origine; }
      if (sortField === 'responsable')        { va = a.responsable;        vb = b.responsable; }
      if (sortField === 'frequence')          { va = a.frequence;          vb = b.frequence; }
      if (sortField === 'prochaine_echeance') { va = a.prochaine_echeance; vb = b.prochaine_echeance; }
      if (sortField === 'statut')             { va = a.statut;             vb = b.statut; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    // Pin the newly created plan at the top
    if (highlightId) {
      const idx = items.findIndex(p => p.id === highlightId);
      if (idx > 0) { const [pinned] = items.splice(idx, 1); items.unshift(pinned); }
    }
    return items;
  }, [plans, activeOrigine, activeStatut, sortField, sortDir, highlightId]);

  const filterCount = activeOrigine.size + activeStatut.size;

  const origineItems: FilterItem[] = [
    { key: 'interne',       label: 'Interne'       },
    { key: 'contrat',       label: 'Contrat'       },
    { key: 'reglementaire', label: 'Réglementaire' },
  ];
  const statutItems: FilterItem[] = [
    { key: 'planifiée',  label: 'Planifiée'  },
    { key: 'à venir',    label: 'À venir'    },
    { key: 'réalisée',   label: 'Réalisée'   },
    { key: 'en retard',  label: 'En retard'  },
  ];

  const visibleColDefs = COLUMNS.filter(c =>
    visibleCols.includes(c.id) || !c.canHide
  );

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap z-20 relative">
        <div className="relative flex-shrink-0">
          <button onClick={() => setShowColPanel(o => !o)} title="Colonnes visibles"
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-slate-700">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          {showColPanel && (
            <ColVisPanel cols={COLUMNS} visible={visibleCols} onChange={toggleColVisible} onClose={() => setShowColPanel(false)} />
          )}
        </div>

        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 flex-shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" /> Ordre :
        </span>
        <select value={`${sortField}_${sortDir}`} onChange={e => applySort(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 cursor-pointer flex-shrink-0">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        <FilterDropdown
          label="Origine" icon={<Filter className="w-3.5 h-3.5" />}
          items={origineItems} active={activeOrigine}
          toggle={k => setActiveOrigine(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })}
          clear={() => setActiveOrigine(new Set())}
        />
        <FilterDropdown
          label="Statut" icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          items={statutItems} active={activeStatut}
          toggle={k => setActiveStatut(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })}
          clear={() => setActiveStatut(new Set())}
        />

        <span className="ml-auto text-xs text-slate-400 font-medium flex-shrink-0">
          {display.length} plan{display.length > 1 ? 's' : ''}
          {filterCount > 0 && <span className="ml-1 text-blue-600">({filterCount} filtre{filterCount > 1 ? 's' : ''})</span>}
        </span>
      </div>

      {/* ── Active filter chips ── */}
      {filterCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex-wrap flex-shrink-0">
          <Filter className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span className="text-xs text-blue-700 font-medium">Filtres actifs :</span>
          {[...activeOrigine].map(k => (
            <span key={k} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {ORIGINE_CFG[k as Origine]?.label ?? k}
              <button onClick={() => setActiveOrigine(p => { const n = new Set(p); n.delete(k); return n; })}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          {[...activeStatut].map(k => (
            <span key={k} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {k.charAt(0).toUpperCase() + k.slice(1)}
              <button onClick={() => setActiveStatut(p => { const n = new Set(p); n.delete(k); return n; })}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          <button onClick={() => { setActiveOrigine(new Set()); setActiveStatut(new Set()); }}
            className="ml-auto text-[11px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
            <X className="w-3 h-3" /> Tout effacer
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {visibleColDefs.map(col => (
              <col key={col.id} style={{ width: colWidths[col.id] ?? col.defaultWidth }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr>
              {visibleColDefs.map(col => (
                <ResizableTh key={col.id} col={col} width={colWidths[col.id] ?? col.defaultWidth}
                  onResize={handleResize} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {display.map(plan => (
              <tr key={plan.id}
                onClick={() => { onSelect?.(plan); setDetailPlan(plan); }}
                className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${
                  highlightId === plan.id
                    ? 'bg-blue-50 ring-1 ring-inset ring-blue-200'
                    : selectedId === plan.id ? 'bg-blue-50/40' : ''
                }`}>
                {visibleColDefs.map(col => (
                  <td key={col.id} className="px-3 py-2.5 overflow-hidden" style={{ maxWidth: colWidths[col.id] }}>
                    {col.id === 'nom' && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-800 truncate block" title={plan.nom}>{plan.nom}</span>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); onEmailClick?.(plan); }}
                          title="Emails de notification"
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 transition-colors w-fit">
                          <Mail className="w-3 h-3" />
                          <span>Emails</span>
                        </button>
                      </div>
                    )}
                    {col.id === 'origine' && <OrigBadge origine={plan.origine} />}
                    {col.id === 'responsable' && <ResponsableCell origine={plan.origine} responsable={plan.responsable} />}
                    {col.id === 'frequence' && <span className="text-xs text-slate-500">{plan.frequence}</span>}
                    {col.id === 'prochaine_echeance' && (
                      <span className="text-xs font-medium text-slate-700">{plan.prochaine_echeance}</span>
                    )}
                    {col.id === 'statut' && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_CFG[plan.statut]}`}>
                        {plan.statut.charAt(0).toUpperCase() + plan.statut.slice(1)}
                      </span>
                    )}
                    {col.id === 'source' && (
                      plan.source_ref ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-mono font-semibold text-slate-700 truncate">{plan.source_ref}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Interne</span>
                      )
                    )}
                    {col.id === 'actions' && (
                      <div className="flex items-center gap-1 justify-end">
                        <button type="button"
                          onClick={e => { e.stopPropagation(); onEdit?.(plan); }}
                          title="Modifier"
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); onDelete?.(plan.id); }}
                          title="Supprimer"
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {display.length === 0 && (
              <tr>
                <td colSpan={visibleColDefs.length} className="px-4 py-10 text-center text-slate-400 text-sm">
                  Aucun plan ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Plan detail modal ── */}
      {detailPlan && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDetailPlan(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{detailPlan.nom}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <OrigBadge origine={detailPlan.origine} />
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_CFG[detailPlan.statut]}`}>
                    {detailPlan.statut.charAt(0).toUpperCase() + detailPlan.statut.slice(1)}
                  </span>
                </div>
              </div>
              <button onClick={() => setDetailPlan(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="px-5 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: 'Nom du plan',         value: detailPlan.nom },
                  { label: 'Origine',              value: ORIGINE_CFG[detailPlan.origine]?.label ?? detailPlan.origine },
                  { label: 'Responsable',          value: detailPlan.responsable },
                  { label: 'Fréquence',            value: detailPlan.frequence },
                  { label: 'Prochaine échéance',   value: detailPlan.prochaine_echeance },
                  { label: 'Statut',               value: detailPlan.statut.charAt(0).toUpperCase() + detailPlan.statut.slice(1) },
                ].map(row => (
                  <div key={row.label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm text-slate-700 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
              {detailPlan.source_ref && (
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Source</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">{detailPlan.source_ref}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  {detailPlan.source_label && (
                    <p className="text-xs text-slate-500 mt-1">{detailPlan.source_label}</p>
                  )}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => { setDetailPlan(null); onEdit?.(detailPlan); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Modifier
              </button>
              <button onClick={() => setDetailPlan(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
