import { useState, useMemo, useRef, useCallback } from 'react';
import {
  AlertTriangle, Calendar, Building2, CheckCircle2, XCircle, HelpCircle,
  Wrench, Eye, Pencil, Trash2, Settings2, ChevronUp, ChevronDown,
  ArrowUpDown, Droplets, X, Filter, GripVertical, ShieldCheck,
} from 'lucide-react';
import {
  TYPE_CONTROLE_DATA, SITE_DATA, RESIDENCE_DATA,
  PRESTATAIRE_DATA, AGENT_DATA,
} from './reglementaire/dashboardData';
import { STATUT_CONFIG } from './reglementaire/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ControleRow {
  id: string;
  type: string;
  categorie: string;
  periodicite: string;
  localisation: string;
  organisme: string;
  dateProchain: string | null;
  dateDernier: string | null;
  conformes: number;
  nonConformes: number;
  statut: 'manquant' | 'en_retard' | 'a_venir' | 'realise';
  criticite: 'Critique' | 'Majeure' | 'Mineure';
  actions: number;
}

// ─── Static config ────────────────────────────────────────────────────────────

const PERIODICITES = ['Annuelle', 'Semestrielle', 'Triennale', 'Quinquennale', 'Mensuelle', 'Trimestrielle'];

const PERIODICITE_MONTHS: Record<string, number> = {
  Mensuelle: 1, Trimestrielle: 3, Semestrielle: 6,
  Annuelle: 12, Triennale: 36, Quinquennale: 60,
};

const ORGANISMES = ['APAVE', 'SOCOTEC', 'DEKRA', 'Bureau Veritas', 'Qualiconsult'];
const CRITICITES: ControleRow['criticite'][] = ['Critique', 'Majeure', 'Mineure'];
const STATUTS: ControleRow['statut'][] = ['manquant', 'en_retard', 'a_venir', 'realise'];

const STATUT_LABELS: Record<ControleRow['statut'], string> = {
  manquant: 'Manquant', en_retard: 'En retard', a_venir: 'À venir', realise: 'Réalisé',
};

const CRITICITE_CFG: Record<ControleRow['criticite'], { bg: string; text: string; border: string; dot: string }> = {
  Critique: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  Majeure:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Mineure:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400'   },
};

const ORGANISME_LOGOS: Record<string, { bg: string }> = {
  'APAVE':          { bg: '#e8001d' },
  'SOCOTEC':        { bg: '#005baa' },
  'DEKRA':          { bg: '#006f3c' },
  'Bureau Veritas': { bg: '#003087' },
  'Qualiconsult':   { bg: '#e2001a' },
};
const ORGANISME_INITIALS: Record<string, string> = {
  'APAVE': 'AP', 'SOCOTEC': 'SC', 'DEKRA': 'DK', 'Bureau Veritas': 'BV', 'Qualiconsult': 'QC',
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const PERIODICITES_AMIANTE = [
  'Surveillance 3 ans', 'Repérage avant travaux', 'Dégradation',
  'Démolition', 'Après des travaux', 'Demande des autorités',
] as const;

function deterministicInt(seed: number, max: number) {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}
function pickFrom<T>(arr: T[], seed: number): T { return arr[deterministicInt(seed, arr.length)]; }
function fakeDate(seed: number, offsetDays: number): string {
  const d = new Date(Date.now() + (offsetDays + deterministicInt(seed, 60) - 30) * 86400000);
  return d.toISOString().slice(0, 10);
}
function lastFromNext(dateProchain: string, periodicite: string): string {
  const months = PERIODICITE_MONTHS[periodicite];
  if (!months) return dateProchain;
  const d = new Date(dateProchain);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

const AMIANTE_PROCHAIN_ONLY = new Set([2, 5, 9, 14, 18, 23, 28, 34, 39, 46]);

export const MOCK_CONTROLES_ALL: ControleRow[] = (() => {
  const rows: ControleRow[] = [];
  let idx = 0;

  for (const typeRow of TYPE_CONTROLE_DATA) {
    if (typeRow.nom === '😷 Amiante / DTA') continue;
    const total = typeRow.manquant + typeRow.en_retard + typeRow.a_venir + typeRow.realise;
    const step = Math.max(1, Math.floor(total / 3));
    const cats = { manquant: typeRow.manquant, en_retard: typeRow.en_retard, a_venir: typeRow.a_venir, realise: typeRow.realise };
    for (const statut of STATUTS) {
      const n = cats[statut];
      if (n === 0) continue;
      for (let k = 0; k < Math.min(n, Math.max(1, Math.round(n / step))); k++) {
        const s = idx + k * 7;
        const site = pickFrom(SITE_DATA, s);
        const res  = pickFrom(RESIDENCE_DATA, s + 1);
        const perio = pickFrom(PERIODICITES, s + 2);
        const dateNext = fakeDate(s, statut === 'en_retard' ? -60 : statut === 'a_venir' ? 90 : 0);
        rows.push({
          id: `c-${idx}-${k}`,
          type: typeRow.nom,
          categorie: typeRow.nom.replace(/^[\S]+ /, ''),
          periodicite: perio,
          localisation: `${site.nom} › ${res.nom}`,
          organisme: pickFrom(ORGANISMES, s + 3),
          dateProchain: dateNext,
          dateDernier: lastFromNext(dateNext, perio),
          conformes: statut === 'realise' ? 8 + deterministicInt(s + 6, 20) : 0,
          nonConformes: statut === 'realise' ? deterministicInt(s + 7, 5) : 0,
          statut,
          criticite: pickFrom(CRITICITES, s + 8),
          actions: statut === 'realise' ? deterministicInt(s + 8, 4) : statut === 'en_retard' ? 1 + deterministicInt(s + 8, 3) : 0,
        });
      }
      idx += 13;
    }
  }

  // Amiante rows
  for (let i = 0; i < 50; i++) {
    const s = 1000 + i * 7;
    const site  = pickFrom(SITE_DATA, s);
    const res   = pickFrom(RESIDENCE_DATA, s + 1);
    const perio = PERIODICITES_AMIANTE[deterministicInt(s + 2, PERIODICITES_AMIANTE.length)];
    const hasProchainsOnly = AMIANTE_PROCHAIN_ONLY.has(i);
    let dateProchain: string | null = null;
    let dateDernier:  string | null = null;
    let statut: ControleRow['statut'];
    if (hasProchainsOnly) {
      const offset = deterministicInt(s + 3, 2) === 0 ? 90 : -45;
      dateProchain = fakeDate(s + 3, offset);
      statut = new Date(dateProchain) < new Date() ? 'en_retard' : 'a_venir';
    } else {
      dateDernier = fakeDate(s + 4, -(180 + deterministicInt(s + 4, 900)));
      statut = 'realise';
    }
    rows.push({
      id: `amiante-${i}`,
      type: '😷 Amiante / DTA',
      categorie: 'Amiante / DTA',
      periodicite: perio,
      localisation: `${site.nom} › ${res.nom}`,
      organisme: pickFrom(ORGANISMES, s + 5),
      dateProchain,
      dateDernier,
      conformes: statut === 'realise' ? 4 + deterministicInt(s + 6, 12) : 0,
      nonConformes: statut === 'realise' ? deterministicInt(s + 7, 4) : 0,
      statut,
      criticite: pickFrom(CRITICITES, s + 9),
      actions: statut === 'realise' ? deterministicInt(s + 8, 3) : statut === 'en_retard' ? 1 + deterministicInt(s + 8, 2) : 0,
    });
  }

  return rows;
})();

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
  id: string; label: string; label2?: string;
  icon?: React.ReactNode;
  defaultWidth: number; minWidth: number;
  canHide: boolean; sortable?: boolean;
}

function buildColumns(hideLocalisation: boolean): ColDef[] {
  const all: ColDef[] = [
    { id: 'type',         label: 'Type de contrôle',    icon: <ShieldCheck className="w-3 h-3" />, defaultWidth: 200, minWidth: 150, canHide: false, sortable: true },
    { id: 'periodicite',  label: 'Périodicité',          icon: <ArrowUpDown className="w-3 h-3" />, defaultWidth: 130, minWidth: 100, canHide: true,  sortable: true },
    { id: 'localisation', label: 'Localisation',         icon: <Building2   className="w-3 h-3" />, defaultWidth: 180, minWidth: 130, canHide: true,  sortable: true },
    { id: 'organisme',    label: 'Organisme',            icon: <Droplets    className="w-3 h-3" />, defaultWidth: 160, minWidth: 120, canHide: true,  sortable: true },
    { id: 'dateProchain', label: 'Prochain contrôle',    icon: <Calendar    className="w-3 h-3" />, defaultWidth: 150, minWidth: 120, canHide: false, sortable: true },
    { id: 'dateDernier',  label: 'Dernier contrôle',     icon: <Calendar    className="w-3 h-3" />, defaultWidth: 130, minWidth: 110, canHide: true,  sortable: true },
    { id: 'conformite',   label: 'Conformité',           icon: <CheckCircle2 className="w-3 h-3" />, defaultWidth: 110, minWidth: 90,  canHide: true,  sortable: false },
    { id: 'criticite',    label: 'Criticité',            icon: <AlertTriangle className="w-3 h-3" />, defaultWidth: 110, minWidth: 90, canHide: true,  sortable: true },
    { id: 'actions_col',  label: 'Actions correctives',  icon: <Wrench      className="w-3 h-3" />, defaultWidth: 110, minWidth: 90,  canHide: true,  sortable: false },
    { id: 'statut',       label: 'Statut',               icon: <CheckCircle2 className="w-3 h-3" />, defaultWidth: 130, minWidth: 110, canHide: false, sortable: true },
    { id: 'btns',         label: '',                                                                   defaultWidth: 90,  minWidth: 80,  canHide: false, sortable: false },
  ];
  return hideLocalisation ? all.filter(c => c.id !== 'localisation') : all;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}
function daysUntil(d?: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrganismeBadge({ nom }: { nom: string }) {
  const cfg = ORGANISME_LOGOS[nom];
  const initials = ORGANISME_INITIALS[nom] ?? nom.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: cfg?.bg ?? '#64748b' }}>
        <span className="text-white text-[9px] font-bold leading-none">{initials}</span>
      </div>
      <span className="text-xs text-slate-600 whitespace-nowrap">{nom}</span>
    </div>
  );
}

// ─── Resizable TH ─────────────────────────────────────────────────────────────

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
        <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap leading-tight">{col.label}</span>
        {col.label2 && <span className="text-[10px] text-slate-400 ml-1">{col.label2}</span>}
        {col.sortable && (
          <span className="ml-auto flex-shrink-0">
            {isActive
              ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />)
              : <ChevronUp className="w-3 h-3 text-slate-300" />}
          </span>
        )}
      </div>
      <span onMouseDown={onMouseDown} onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group" style={{ userSelect: 'none' }}>
        <span className="w-px h-4 bg-slate-300 group-hover:bg-emerald-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// ─── Settings sidebar ─────────────────────────────────────────────────────────

function SettingsSidebar({ ALL_COLS, visibleCols, setVisibleCols, onClose }: {
  ALL_COLS: ColDef[];
  visibleCols: string[]; setVisibleCols: (c: string[]) => void;
  onClose: () => void;
}) {
  const hideable  = ALL_COLS.filter(c => c.canHide);
  const [localSel, setLocalSel] = useState<string[]>(visibleCols.filter(id => hideable.some(c => c.id === id)));
  const available = hideable.filter(c => !localSel.includes(c.id));
  const dragOver  = useRef<string | null>(null);

  const addCol    = (id: string) => setLocalSel(p => [...p, id]);
  const removeCol = (id: string) => setLocalSel(p => p.filter(x => x !== id));

  const handleDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData('text/plain', id);
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const dragged = e.dataTransfer.getData('text/plain');
    if (!dragged || dragged === targetId) return;
    setLocalSel(prev => {
      const next = prev.filter(x => x !== dragged);
      const ti = next.indexOf(targetId);
      next.splice(ti, 0, dragged);
      return next;
    });
  };

  const apply = () => {
    const mandatoryFirst = ALL_COLS.filter(c => !c.canHide && c.id !== 'btns').map(c => c.id);
    const ordered = [...mandatoryFirst, ...localSel, 'btns'];
    setVisibleCols(ordered);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Settings2 className="w-4 h-4 text-slate-400" />Paramètres du tableau</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" /> Colonnes visibles</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Disponibles</p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                  {available.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Toutes affichées</p>
                    : available.map(col => (
                      <button key={col.id} onClick={() => addCol(col.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                        {col.icon && <span className="text-slate-400">{col.icon}</span>}
                        <span>{col.label}</span>
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Sélectionnées</p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-white p-2 space-y-1">
                  {localSel.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Aucune</p>
                    : localSel.map(id => {
                      const col = hideable.find(c => c.id === id); if (!col) return null;
                      return (
                        <div key={id} draggable
                          onDragStart={e => handleDragStart(e, id)}
                          onDragOver={e => { e.preventDefault(); dragOver.current = id; }}
                          onDrop={e => handleDrop(e, id)}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-slate-700 bg-emerald-50 border border-emerald-100 cursor-grab active:cursor-grabbing group">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                            {col.icon && <span className="text-slate-400">{col.icon}</span>}
                            <span className="font-medium">{col.label}</span>
                          </div>
                          <button onClick={() => removeCol(id)} className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
          <button onClick={apply}   className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">Appliquer</button>
        </div>
      </div>
    </>
  );
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({ label, icon, items, active, toggle, clear }: {
  label: string; icon: React.ReactNode;
  items: { key: T; label: string; bg: string; text: string; border: string; dot: string }[];
  active: Set<string>; toggle: (k: string) => void; clear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = active.size;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${open || count > 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <span>{icon}</span>
        {label}
        {count > 0 && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold">{count}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[200px]">
          <div className="flex flex-col gap-1.5">
            {items.map(it => {
              const isActive = active.has(it.key);
              return (
                <button key={it.key} onClick={() => toggle(it.key)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full ${isActive ? `${it.bg} ${it.text} ${it.border} shadow-sm` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? it.dot : 'bg-slate-300'}`} />
                  {it.label}
                </button>
              );
            })}
          </div>
          {count > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clear(); setOpen(false); }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                <X className="w-3 h-3" /> Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function ControleTableRow({ row, idx, activeCols, colWidths }: {
  row: ControleRow; idx: number; activeCols: ColDef[]; colWidths: Record<string, number>;
}) {
  const isRetard = row.statut === 'en_retard';
  const days = daysUntil(row.dateProchain);
  const isUrgent = days !== null && days <= 30 && days >= 0;
  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
  const statutCfg = STATUT_CONFIG[row.statut];
  const critCfg   = CRITICITE_CFG[row.criticite];

  const cellFor = (id: string) => {
    const w = colWidths[id];
    switch (id) {
      case 'type':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className="font-medium text-slate-700 text-xs leading-snug block"
              style={{ maxWidth: w - 24, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.type}
            </span>
          </td>
        );

      case 'periodicite':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {(PERIODICITES_AMIANTE as readonly string[]).includes(row.periodicite)
              ? <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">⚡ {row.periodicite}</span>
              : <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">{row.periodicite}</span>}
          </td>
        );

      case 'localisation': {
        const parts = row.localisation.split(' › ');
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3 flex-shrink-0 text-slate-400" />
                <span className="font-medium text-slate-600 truncate">{parts[0]}</span>
              </div>
              {parts[1] && (
                <div className="flex items-center gap-1 mt-0.5 pl-4">
                  <span className="text-slate-300">›</span>
                  <span className="truncate">{parts[1]}</span>
                </div>
              )}
            </div>
          </td>
        );
      }

      case 'organisme':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <OrganismeBadge nom={row.organisme} />
          </td>
        );

      case 'dateProchain':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {row.dateProchain ? (
              <>
                <div className={`flex items-center gap-1 text-xs ${isRetard ? 'text-red-600 font-semibold' : isUrgent ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
                  {(isRetard || isUrgent) && <AlertTriangle className="w-3 h-3" />}
                  <Calendar className="w-3 h-3" />
                  {formatDate(row.dateProchain)}
                </div>
                {days !== null && (
                  <div className={`text-[10px] mt-0.5 ${isRetard ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-slate-400'}`}>
                    {isRetard ? `${Math.abs(days)} j de retard` : `J-${days}`}
                  </div>
                )}
              </>
            ) : <span className="text-slate-300 text-xs">—</span>}
          </td>
        );

      case 'dateDernier':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {row.dateDernier ? (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />{formatDate(row.dateDernier)}
              </div>
            ) : <span className="text-slate-300 text-xs">—</span>}
          </td>
        );

      case 'conformite':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {row.conformes + row.nonConformes > 0 ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-0.5 text-emerald-600 font-medium"><CheckCircle2 className="w-3 h-3" />{row.conformes}</span>
                {row.nonConformes > 0 && <span className="flex items-center gap-0.5 text-red-600 font-medium"><XCircle className="w-3 h-3" />{row.nonConformes}</span>}
              </div>
            ) : <span className="text-slate-300 text-xs">—</span>}
          </td>
        );

      case 'criticite':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${critCfg.bg} ${critCfg.text} ${critCfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${critCfg.dot}`} />
              {row.criticite}
            </span>
          </td>
        );

      case 'actions_col':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {row.actions > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                <Wrench className="w-3 h-3" />{row.actions}
              </span>
            ) : <span className="text-slate-300 text-xs">—</span>}
          </td>
        );

      case 'statut':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${statutCfg.bg} ${statutCfg.text} ${statutCfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statutCfg.dot}`} />
              {statutCfg.label}
            </span>
          </td>
        );

      case 'btns':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Voir"><Eye className="w-3.5 h-3.5" /></button>
              <button className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Modifier"><Pencil className="w-3.5 h-3.5" /></button>
              <button className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </td>
        );

      default:
        return <td key={id} style={{ width: w }} className="px-3 py-2.5" />;
    }
  };

  return (
    <tr className={`${rowBg} ${isRetard ? 'bg-red-50/30' : ''} hover:bg-emerald-50/20 transition-colors cursor-pointer`}>
      {activeCols.map(col => cellFor(col.id))}
    </tr>
  );
}

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'dateProchain_asc',  label: 'Prochain contrôle (plus proche)' },
  { value: 'dateProchain_desc', label: 'Prochain contrôle (plus éloigné)' },
  { value: 'type_asc',          label: 'Type (A → Z)' },
  { value: 'type_desc',         label: 'Type (Z → A)' },
  { value: 'statut_asc',        label: 'Statut (A → Z)' },
  { value: 'criticite_asc',     label: 'Criticité (A → Z)' },
  { value: 'organisme_asc',     label: 'Organisme (A → Z)' },
  { value: 'dateDernier_desc',  label: 'Dernier contrôle (plus récent)' },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  rows?: ControleRow[];
  hideLocalisation?: boolean;
}

export default function ControlesTableau({ rows: propRows, hideLocalisation = false }: Props) {
  const ALL_COLS = useMemo(() => buildColumns(hideLocalisation), [hideLocalisation]);
  const defaultVisible = useMemo(() => ALL_COLS.map(c => c.id), [ALL_COLS]);

  const dataRows = propRows ?? MOCK_CONTROLES_ALL;

  const [sortField, setSortField] = useState('dateProchain');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [visibleCols, setVisibleCols] = useState<string[]>(defaultVisible);
  const [showSidebar,  setShowSidebar]  = useState(false);
  const [activeStatut,   setActiveStatut]   = useState<Set<string>>(new Set());
  const [activeCriticite, setActiveCriticite] = useState<Set<string>>(new Set());
  const [activeCategorie, setActiveCategorie] = useState<Set<string>>(new Set());
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(ALL_COLS.map(c => [c.id, c.defaultWidth]))
  );

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = ALL_COLS.find(c => c.id === id)!;
      return { ...prev, [id]: Math.max(col.minWidth, prev[id] + delta) };
    });
  }, [ALL_COLS]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const applySort = (s: string) => {
    const parts = s.split('_'); const dir = parts.pop() as 'asc' | 'desc'; const field = parts.join('_');
    setSortField(field); setSortDir(dir);
  };

  const display = useMemo(() => {
    let items = [...dataRows];
    if (activeStatut.size > 0)    items = items.filter(r => activeStatut.has(r.statut));
    if (activeCriticite.size > 0) items = items.filter(r => activeCriticite.has(r.criticite));
    if (activeCategorie.size > 0) items = items.filter(r => activeCategorie.has(r.categorie));
    items.sort((a, b) => {
      let va = '', vb = '';
      if (sortField === 'type')         { va = a.type;         vb = b.type; }
      if (sortField === 'periodicite')  { va = a.periodicite;  vb = b.periodicite; }
      if (sortField === 'localisation') { va = a.localisation; vb = b.localisation; }
      if (sortField === 'organisme')    { va = a.organisme;    vb = b.organisme; }
      if (sortField === 'dateProchain') { va = a.dateProchain ?? ''; vb = b.dateProchain ?? ''; }
      if (sortField === 'dateDernier')  { va = a.dateDernier  ?? ''; vb = b.dateDernier  ?? ''; }
      if (sortField === 'statut')       { va = a.statut;       vb = b.statut; }
      if (sortField === 'criticite')    { va = a.criticite;    vb = b.criticite; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return items;
  }, [dataRows, activeStatut, activeCriticite, activeCategorie, sortField, sortDir]);

  const activeCols = ALL_COLS.filter(c => visibleCols.includes(c.id));
  const totalWidth = activeCols.reduce((s, c) => s + colWidths[c.id], 0);
  const filterCount = activeStatut.size + activeCriticite.size + activeCategorie.size;

  // Build filter items
  const statutItems = STATUTS.map(k => ({ key: k, label: STATUT_LABELS[k], ...STATUT_CONFIG[k] }));
  const criticiteItems = CRITICITES.map(k => ({ key: k, label: k, ...CRITICITE_CFG[k] }));
  const categorieItems = TYPE_CONTROLE_DATA.map(t => ({
    key: t.nom.replace(/^[\S]+ /, ''),
    label: t.nom,
    bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400',
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar — sticky */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap z-20">
        <button onClick={() => setShowSidebar(true)} title="Paramètres"
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-slate-700 flex-shrink-0">
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 flex-shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" /> Ordre :
        </span>
        <select value={`${sortField}_${sortDir}`} onChange={e => applySort(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/40 cursor-pointer flex-shrink-0">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        <FilterDropdown
          label="Catégorie" icon={<ShieldCheck className="w-3.5 h-3.5" />}
          items={categorieItems} active={activeCategorie}
          toggle={k => setActiveCategorie(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })}
          clear={() => setActiveCategorie(new Set())}
        />
        <FilterDropdown
          label="Statut" icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          items={statutItems} active={activeStatut}
          toggle={k => setActiveStatut(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })}
          clear={() => setActiveStatut(new Set())}
        />
        <FilterDropdown
          label="Criticité" icon={<AlertTriangle className="w-3.5 h-3.5" />}
          items={criticiteItems} active={activeCriticite}
          toggle={k => setActiveCriticite(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })}
          clear={() => setActiveCriticite(new Set())}
        />

        <span className="ml-auto text-xs text-slate-400 font-medium flex-shrink-0">
          {display.length} contrôle{display.length > 1 ? 's' : ''}
          {filterCount > 0 && <span className="ml-1 text-emerald-600">({filterCount} filtre{filterCount > 1 ? 's' : ''})</span>}
        </span>
      </div>

      {/* Active filter chips */}
      {filterCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/60 border-b border-emerald-100 flex-wrap flex-shrink-0">
          <Filter className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-700 font-medium">Filtres actifs :</span>
          {[...activeStatut].map(k => (
            <span key={k} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {STATUT_LABELS[k as ControleRow['statut']]}
              <button onClick={() => setActiveStatut(p => { const n = new Set(p); n.delete(k); return n; })}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          {[...activeCriticite].map(k => (
            <span key={k} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              {k}
              <button onClick={() => setActiveCriticite(p => { const n = new Set(p); n.delete(k); return n; })}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          {[...activeCategorie].map(k => (
            <span key={k} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {k}
              <button onClick={() => setActiveCategorie(p => { const n = new Set(p); n.delete(k); return n; })}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          <button onClick={() => { setActiveStatut(new Set()); setActiveCriticite(new Set()); setActiveCategorie(new Set()); }}
            className="ml-auto text-[11px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
            <X className="w-3 h-3" /> Tout effacer
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: totalWidth }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {activeCols.map(col => (
                <ResizableTh key={col.id} col={col} width={colWidths[col.id]} onResize={handleResize}
                  sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {display.length === 0 ? (
              <tr>
                <td colSpan={activeCols.length} className="text-center py-16 text-slate-400 text-sm">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  Aucun contrôle{filterCount > 0 ? ' pour ces filtres' : ''}
                </td>
              </tr>
            ) : display.map((row, idx) => (
              <ControleTableRow key={row.id} row={row} idx={idx} activeCols={activeCols} colWidths={colWidths} />
            ))}
          </tbody>
        </table>
      </div>

      {showSidebar && (
        <SettingsSidebar ALL_COLS={ALL_COLS} visibleCols={visibleCols} setVisibleCols={setVisibleCols} onClose={() => setShowSidebar(false)} />
      )}
    </div>
  );
}
