import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Wrench, Hash, Tag, Package, Layers, Calendar, ShieldCheck, ShieldOff,
  ArrowUpDown, Settings2, ChevronRight, X, GripVertical, ChevronUp, ChevronDown,
  Thermometer, Lightbulb, Flame, WashingMachine, Zap, Wifi, Sofa, Droplets, Lock,
  ThumbsUp, ThumbsDown, Activity, MapPin, Building2, Home, Layers as LayersIcon,
  Search, ChevronLeft,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EQUIPEMENTS_GLOBAL, type EquipementGlobal, type NiveauEquipement } from '../lib/generateEquipements';
import FicheEquipement, { type EquipementFiche } from './FicheEquipement';

// ─── Catégories ───────────────────────────────────────────────────────────────

interface CategorieCfg {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const CATEGORIES: Record<string, CategorieCfg> = {
  cvc:            { label: 'CVC',               icon: <Thermometer    className="w-3.5 h-3.5" />, color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200' },
  eclairage:      { label: 'Éclairage',         icon: <Lightbulb      className="w-3.5 h-3.5" />, color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  incendie:       { label: 'Détection incendie',icon: <Flame          className="w-3.5 h-3.5" />, color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200'    },
  electromenager: { label: 'Électroménager',    icon: <WashingMachine className="w-3.5 h-3.5" />, color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200'   },
  electricite:    { label: 'Électricité',       icon: <Zap            className="w-3.5 h-3.5" />, color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
  reseau:         { label: 'Réseau / Wi-Fi',    icon: <Wifi           className="w-3.5 h-3.5" />, color: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-200'   },
  mobilier:       { label: 'Mobilier',          icon: <Sofa           className="w-3.5 h-3.5" />, color: 'text-slate-600',  bg: 'bg-slate-100',  border: 'border-slate-200'  },
  sanitaires:     { label: 'Sanitaire',         icon: <Droplets       className="w-3.5 h-3.5" />, color: 'text-cyan-600',   bg: 'bg-cyan-50',    border: 'border-cyan-200'   },
  serrure:        { label: 'Serrure',           icon: <Lock           className="w-3.5 h-3.5" />, color: 'text-slate-700',  bg: 'bg-slate-50',   border: 'border-slate-300'  },
};

const CATEGORIES_GRID: string[][] = [
  ['cvc', 'eclairage', 'incendie'],
  ['electromenager', 'electricite', 'reseau'],
  ['mobilier', 'sanitaires', 'serrure'],
];

function getCategorieKey(cat: string | undefined): string {
  if (!cat) return '';
  const lower = cat.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
  const map: Record<string, string> = {
    cvc: 'cvc', chauffage: 'cvc', ventilation: 'cvc', climatisation: 'cvc',
    chaudiere: 'cvc', pompeachaleur: 'cvc', pac: 'cvc',
    eclairage: 'eclairage', lumiere: 'eclairage',
    incendie: 'incendie', detecteur: 'incendie', detection: 'incendie', alarme: 'incendie', ssi: 'incendie',
    cuisine: 'electromenager', kitchenette: 'electromenager',
    electromenager: 'electromenager',
    electricite: 'electricite', electrique: 'electricite', tgbt: 'electricite', tableau: 'electricite',
    sanitaires: 'sanitaires', sanitaire: 'sanitaires', plomberie: 'sanitaires', ecs: 'sanitaires',
    mobilier: 'mobilier',
    serrure: 'serrure', acces: 'serrure', ascenseur: 'serrure',
    reseau: 'reseau', wifi: 'reseau',
  };
  return map[lower] || lower;
}

// ─── État configs ─────────────────────────────────────────────────────────────

const ETAT_CFG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  tres_bon:     { label: 'Très bon état', icon: <ThumbsUp   className="w-4 h-4" />, color: 'text-emerald-500' },
  fonctionnel:  { label: 'Bon état',      icon: <ThumbsUp   className="w-4 h-4" />, color: 'text-emerald-500' },
  moyen:        { label: 'Moyen',         icon: <ThumbsUp   className="w-4 h-4" />, color: 'text-orange-300'  },
  degrade:      { label: 'Vétuste',       icon: <ThumbsDown className="w-4 h-4" />, color: 'text-orange-600'  },
  a_remplacer:  { label: 'À remplacer',   icon: <ThumbsDown className="w-4 h-4" />, color: 'text-red-600'     },
  en_panne:     { label: 'En panne',      icon: <ThumbsDown className="w-4 h-4" />, color: 'text-red-600'     },
  hors_service: { label: 'Hors service',  icon: <ThumbsDown className="w-4 h-4" />, color: 'text-slate-400'   },
};

// ─── Statut configs ───────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  en_service:    { label: 'En service',    bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
  en_panne:      { label: 'En panne',      bg: 'bg-red-50',      text: 'text-red-700',      border: 'border-red-200',     dot: 'bg-red-500'     },
  en_maintenance:{ label: 'En maintenance',bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',   dot: 'bg-amber-400'   },
  hors_service:  { label: 'Hors service',  bg: 'bg-slate-100',   text: 'text-slate-600',    border: 'border-slate-300',   dot: 'bg-slate-400'   },
  neutralise:    { label: 'Neutralisé',    bg: 'bg-orange-50',   text: 'text-orange-700',   border: 'border-orange-200',  dot: 'bg-orange-500'  },
  remplace:      { label: 'Remplacé',      bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border-blue-200',    dot: 'bg-blue-400'    },
  reforme:       { label: 'Réformé',       bg: 'bg-purple-50',   text: 'text-purple-700',   border: 'border-purple-200',  dot: 'bg-purple-400'  },
  en_travaux:    { label: 'En maintenance',bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',   dot: 'bg-amber-400'   },
};

const STATUT_LIST = [
  'en_service', 'en_panne', 'en_maintenance', 'hors_service',
  'neutralise', 'remplace', 'reforme',
] as const;

// ─── Niveau configs (fil d'ariane) ────────────────────────────────────────────

const NIVEAU_CFG: Record<NiveauEquipement, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  residence: { label: 'Résidence', icon: <Building2 className="w-3 h-3" />, bg: 'bg-slate-100',   text: 'text-slate-700',  border: 'border-slate-200' },
  etage:     { label: 'Étage',     icon: <LayersIcon className="w-3 h-3" />, bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200'  },
  logement:  { label: 'Logement',  icon: <Home       className="w-3 h-3" />, bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200'},
};

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
  id: string;
  label: string;
  label2?: string;
  icon?: React.ReactNode;
  defaultWidth: number;
  minWidth: number;
  canHide: boolean;
  sortable?: boolean;
}

const ALL_COLUMNS: ColDef[] = [
  { id: 'categorie',    label: 'Catégorie',        icon: <Tag        className="w-3 h-3" />, defaultWidth: 155, minWidth: 120, canHide: false, sortable: true  },
  { id: 'designation',  label: 'Équipement',        icon: <Wrench     className="w-3 h-3" />, defaultWidth: 195, minWidth: 140, canHide: false, sortable: true  },
  { id: 'site',         label: 'Site', label2: 'Localisation',
    icon: <MapPin       className="w-3 h-3" />,                                                defaultWidth: 230, minWidth: 160, canHide: false, sortable: true  },
  { id: 'quantite',     label: 'Qté',               icon: <Package    className="w-3 h-3" />, defaultWidth: 60,  minWidth: 50,  canHide: true,  sortable: false },
  { id: 'marque',       label: 'Marque', label2: 'Modèle',
    icon: <Layers       className="w-3 h-3" />,                                                defaultWidth: 155, minWidth: 120, canHide: true,  sortable: true  },
  { id: 'inventaire',   label: 'N° inventaire',     icon: <Hash       className="w-3 h-3" />, defaultWidth: 145, minWidth: 110, canHide: true,  sortable: false },
  { id: 'installation', label: 'Date installation', icon: <Calendar   className="w-3 h-3" />, defaultWidth: 135, minWidth: 110, canHide: true,  sortable: true  },
  { id: 'garantie',     label: 'Garantie', label2: 'Date fin / Durée',
    icon: <ShieldCheck  className="w-3 h-3" />,                                                defaultWidth: 175, minWidth: 140, canHide: true,  sortable: false },
  { id: 'etat',         label: 'État',              icon: <ThumbsUp   className="w-3 h-3" />, defaultWidth: 120, minWidth: 80,  canHide: true,  sortable: true  },
  { id: 'statut',       label: 'Statut',            icon: <Activity   className="w-3 h-3" />, defaultWidth: 140, minWidth: 100, canHide: true,  sortable: true  },
];

const DEFAULT_VISIBLE = ALL_COLUMNS.map(c => c.id);

// ─── Sort options ─────────────────────────────────────────────────────────────

const TRI_OPTIONS = [
  { value: 'categorie_asc',    label: 'Catégorie (A → Z)' },
  { value: 'categorie_desc',   label: 'Catégorie (Z → A)' },
  { value: 'designation_asc',  label: 'Équipement (A → Z)' },
  { value: 'designation_desc', label: 'Équipement (Z → A)' },
  { value: 'site_asc',         label: 'Site (A → Z)' },
  { value: 'site_desc',        label: 'Site (Z → A)' },
  { value: 'installation_asc', label: 'Installation (plus ancien)' },
  { value: 'installation_desc',label: 'Installation (plus récent)' },
  { value: 'etat_asc',         label: 'État (meilleur en premier)' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd/MM/yyyy', { locale: fr }); } catch { return d; }
}

function getCaract(eq: EquipementGlobal, key: string) {
  return eq.caracteristiques?.[key];
}

function GarantieCell({ eq }: { eq: EquipementGlobal }) {
  const hasGarantie = getCaract(eq, 'garantie') as boolean | undefined;
  const dateFin     = getCaract(eq, 'date_fin_garantie') as string | undefined;
  const duree       = getCaract(eq, 'duree_garantie_mois') as number | undefined;
  const isActive    = hasGarantie && dateFin
    ? differenceInDays(parseISO(dateFin), new Date()) > 0
    : !!hasGarantie;

  if (!hasGarantie && !dateFin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
        <ShieldOff className="w-3.5 h-3.5" /> Pas sous garantie
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
        {isActive ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
        {isActive ? 'Sous garantie' : 'Garantie expirée'}
      </span>
      {dateFin && <span className="text-[10px] text-slate-400">Fin : {fmtDate(dateFin)}</span>}
      {duree   && <span className="text-[10px] text-slate-400">{duree} mois</span>}
    </div>
  );
}

function ColorBadge({ label, bg, text, border, dot }: { label: string; bg: string; text: string; border: string; dot: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${bg} ${text} ${border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

// ─── Resizable header ─────────────────────────────────────────────────────────

function ResizableTh({ col, width, onResize, sortField, sortDir, onSort }: {
  col: ColDef; width: number;
  onResize: (id: string, delta: number) => void;
  sortField: string; sortDir: 'asc' | 'desc';
  onSort: (id: string) => void;
}) {
  const dragging = useRef(false);
  const startX   = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current   = e.clientX;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      onResize(col.id, ev.clientX - startX.current);
      startX.current = ev.clientX;
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [col.id, onResize]);

  const isActive = sortField === col.id;

  return (
    <th style={{ width, minWidth: col.minWidth, position: 'relative' }}
      className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 select-none align-top"
      onClick={() => col.sortable && onSort(col.id)}>
      <div className={`flex flex-col gap-0.5 pr-3 ${col.sortable ? 'cursor-pointer' : ''}`}>
        <span className="flex items-start gap-1">
          {col.icon && <span className="text-slate-400 flex-shrink-0 mt-px">{col.icon}</span>}
          <span className="break-words leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
            {col.label}
          </span>
          {col.sortable && (
            <span className="ml-auto flex-shrink-0 mt-px">
              {isActive
                ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />)
                : <ChevronUp className="w-3 h-3 text-slate-300" />}
            </span>
          )}
        </span>
        {col.label2 && (
          <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal pl-0.5 leading-tight"
            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {col.label2}
          </span>
        )}
      </div>
      <span onMouseDown={onMouseDown} onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group"
        style={{ userSelect: 'none' }}>
        <span className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// ─── Settings sidebar ─────────────────────────────────────────────────────────

function SettingsSidebar({ visibleCols, setVisibleCols, defaultSort, setDefaultSort, onClose }: {
  visibleCols: string[]; setVisibleCols: (c: string[]) => void;
  defaultSort: string;   setDefaultSort: (s: string) => void;
  onClose: () => void;
}) {
  const hideable  = ALL_COLUMNS.filter(c => c.canHide);
  const selected  = visibleCols.filter(id => hideable.some(c => c.id === id));
  const available = hideable.filter(c => !selected.includes(c.id));
  const [localSel,  setLocalSel]  = useState<string[]>(selected);
  const [localSort, setLocalSort] = useState(defaultSort);
  const dragOver = useRef<string | null>(null);

  const addCol    = (id: string) => setLocalSel(p => [...p, id]);
  const removeCol = (id: string) => setLocalSel(p => p.filter(x => x !== id));
  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('colId', id); };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    const srcId = e.dataTransfer.getData('colId');
    if (srcId === targetId) return;
    setLocalSel(prev => {
      const arr = [...prev];
      const from = arr.indexOf(srcId); const to = arr.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      arr.splice(from, 1); arr.splice(to, 0, srcId);
      return arr;
    });
    dragOver.current = null;
  };
  const apply = () => {
    const fixed   = ALL_COLUMNS.filter(c => !c.canHide).map(c => c.id);
    const ordered = ALL_COLUMNS.map(c => c.id).filter(id => fixed.includes(id) || localSel.includes(id));
    setVisibleCols(ordered);
    setDefaultSort(localSort);
    onClose();
  };
  const colLabel = (col: ColDef) => col.label2 ? `${col.label} / ${col.label2}` : col.label;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[520px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Paramètres du tableau</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" /> Tri par défaut
            </h4>
            <div className="space-y-1.5">
              {TRI_OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                    ${localSort === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  <input type="radio" name="sort" value={opt.value} checked={localSort === opt.value}
                    onChange={() => setLocalSort(opt.value)} className="accent-blue-600" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> Colonnes visibles
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Disponibles</p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                  {available.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Toutes affichées</p>
                    : available.map(col => (
                      <button key={col.id} onClick={() => addCol(col.id)}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group">
                        <span className="flex items-center gap-1.5">
                          {col.icon && <span className="text-slate-400">{col.icon}</span>}
                          {colLabel(col)}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                  Sélectionnées <span className="text-slate-300">— glisser</span>
                </p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-white p-2 space-y-1">
                  {localSel.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Aucune colonne</p>
                    : localSel.map(id => {
                      const col = hideable.find(c => c.id === id);
                      if (!col) return null;
                      return (
                        <div key={id} draggable
                          onDragStart={e => handleDragStart(e, id)}
                          onDragOver={e => { e.preventDefault(); dragOver.current = id; }}
                          onDrop={e => handleDrop(e, id)}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-slate-700 bg-blue-50 border border-blue-100 cursor-grab active:cursor-grabbing group">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                            {col.icon && <span className="text-slate-400">{col.icon}</span>}
                            <span className="font-medium">{colLabel(col)}</span>
                          </div>
                          <button onClick={() => removeCol(id)} className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 px-1">
              <span className="font-medium text-slate-500">Catégorie</span>, <span className="font-medium text-slate-500">Équipement</span> et <span className="font-medium text-slate-500">Site</span> sont toujours visibles.
            </p>
          </section>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
          <button onClick={apply}   className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Appliquer</button>
        </div>
      </div>
    </>
  );
}

// ─── Category filter dropdown ─────────────────────────────────────────────────

function CategoryFilterDropdown({ activeCategories, toggleCategorie, clearCategories }: {
  activeCategories: Set<string>; toggleCategorie: (k: string) => void; clearCategories: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = activeCategories.size;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
          ${open || activeCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <Tag className="w-3.5 h-3.5" />
        Catégories
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none">{activeCount}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3" style={{ minWidth: 320 }}>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
            {CATEGORIES_GRID.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1.5">
                {col.map(key => {
                  const cfg = CATEGORIES[key]; const active = activeCategories.has(key);
                  return (
                    <button key={key} onClick={() => toggleCategorie(key)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all text-left w-full
                        ${active ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                      <span className={active ? cfg.color : 'text-slate-400'}>{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {activeCount > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clearCategories(); setOpen(false); }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                <X className="w-3 h-3" /> Effacer les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Statut filter dropdown ───────────────────────────────────────────────────

function StatutFilterDropdown({ activeStatuts, toggleStatut, clearStatuts }: {
  activeStatuts: Set<string>; toggleStatut: (k: string) => void; clearStatuts: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = activeStatuts.size;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
          ${open || activeCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <Activity className="w-3.5 h-3.5" />
        Statut
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none">{activeCount}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3" style={{ minWidth: 220 }}>
          <div className="flex flex-col gap-1.5">
            {STATUT_LIST.map(key => {
              const cfg = STATUT_CFG[key]; const active = activeStatuts.has(key);
              return (
                <button key={key} onClick={() => toggleStatut(key)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full
                    ${active ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? cfg.dot : 'bg-slate-300'}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
          {activeCount > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clearStatuts(); setOpen(false); }}
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

// ─── Niveau filter dropdown ───────────────────────────────────────────────────

function NiveauFilterDropdown({ activeNiveaux, toggleNiveau, clearNiveaux }: {
  activeNiveaux: Set<string>; toggleNiveau: (k: string) => void; clearNiveaux: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = activeNiveaux.size;

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
          ${open || activeCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <MapPin className="w-3.5 h-3.5" />
        Niveau
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none">{activeCount}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3" style={{ minWidth: 200 }}>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(NIVEAU_CFG) as NiveauEquipement[]).map(key => {
              const cfg = NIVEAU_CFG[key]; const active = activeNiveaux.has(key);
              return (
                <button key={key} onClick={() => toggleNiveau(key)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full
                    ${active ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <span className={active ? cfg.text : 'text-slate-400'}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
          {activeCount > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clearNiveaux(); setOpen(false); }}
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function EquipementsGlobal() {
  const [sortField,        setSortField]        = useState('categorie');
  const [sortDir,          setSortDir]          = useState<'asc' | 'desc'>('asc');
  const [defaultSort,      setDefaultSort]      = useState('categorie_asc');
  const [visibleCols,      setVisibleCols]      = useState<string[]>(DEFAULT_VISIBLE);
  const [showSidebar,      setShowSidebar]      = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [activeStatuts,    setActiveStatuts]    = useState<Set<string>>(new Set());
  const [activeNiveaux,    setActiveNiveaux]    = useState<Set<string>>(new Set());
  const [search,           setSearch]           = useState('');
  const [pageSize,         setPageSize]         = useState(50);
  const [page,             setPage]             = useState(1);
  const [selectedEquip,    setSelectedEquip]    = useState<EquipementGlobal | null>(null);
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(ALL_COLUMNS.map(c => [c.id, c.defaultWidth]))
  );

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = ALL_COLUMNS.find(c => c.id === id)!;
      return { ...prev, [id]: Math.max(col.minWidth, prev[id] + delta) };
    });
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (key: string) => {
    setter(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  };

  const applyDefaultSort = (s: string) => {
    setDefaultSort(s);
    const parts = s.split('_');
    const dir   = parts.pop() as 'asc' | 'desc';
    setSortField(parts.join('_'));
    setSortDir(dir);
  };

  const display = useMemo(() => {
    setPage(1);
    let items = [...EQUIPEMENTS_GLOBAL];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(eq =>
        eq.designation.toLowerCase().includes(q) ||
        eq.identifiant.toLowerCase().includes(q) ||
        (eq.marque ?? '').toLowerCase().includes(q) ||
        (eq.modele ?? '').toLowerCase().includes(q) ||
        eq.site_label.toLowerCase().includes(q) ||
        (eq.sous_niveau_label ?? '').toLowerCase().includes(q)
      );
    }
    if (activeCategories.size > 0)
      items = items.filter(eq => activeCategories.has(getCategorieKey(eq.categorie)));
    if (activeStatuts.size > 0)
      items = items.filter(eq => activeStatuts.has((getCaract(eq, 'statut') as string) ?? 'en_service'));
    if (activeNiveaux.size > 0)
      items = items.filter(eq => activeNiveaux.has(eq.niveau));

    items.sort((a, b) => {
      let va = '', vb = '';
      if (sortField === 'categorie')    { va = a.categorie; vb = b.categorie; }
      if (sortField === 'designation')  { va = a.designation; vb = b.designation; }
      if (sortField === 'site')         { va = `${a.site_label}${a.sous_niveau_label ?? ''}`; vb = `${b.site_label}${b.sous_niveau_label ?? ''}`; }
      if (sortField === 'marque')       { va = a.marque ?? ''; vb = b.marque ?? ''; }
      if (sortField === 'installation') { va = a.date_mise_en_service ?? ''; vb = b.date_mise_en_service ?? ''; }
      if (sortField === 'etat')         { va = a.etat; vb = b.etat; }
      if (sortField === 'statut')       { va = (getCaract(a, 'statut') as string) ?? ''; vb = (getCaract(b, 'statut') as string) ?? ''; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return items;
  }, [activeCategories, activeStatuts, activeNiveaux, sortField, sortDir, search]);

  const totalPages  = Math.max(1, Math.ceil(display.length / pageSize));
  const safePage    = Math.min(page, totalPages);
  const pageItems   = display.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeCols  = ALL_COLUMNS.filter(c => visibleCols.includes(c.id));
  const totalWidth  = activeCols.reduce((s, c) => s + colWidths[c.id], 0);
  const totalFilters = activeCategories.size + activeStatuts.size + activeNiveaux.size;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête page */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0 bg-white">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-400" /> Équipements
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Tous les équipements — résidences, étages et logements</p>
        </div>

        {/* Recherche */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 focus:bg-white transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
          {EQUIPEMENTS_GLOBAL.length} équipements
        </span>
      </div>

      {/* Barre de contrôles */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap">
        <button onClick={() => setShowSidebar(true)} title="Paramètres du tableau"
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-slate-700 flex-shrink-0">
          <Settings2 className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 flex-shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" /> Ordre :
        </span>
        <select value={`${sortField}_${sortDir}`} onChange={e => applyDefaultSort(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 cursor-pointer flex-shrink-0">
          {TRI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        <CategoryFilterDropdown
          activeCategories={activeCategories}
          toggleCategorie={toggle(setActiveCategories)}
          clearCategories={() => setActiveCategories(new Set())}
        />
        <StatutFilterDropdown
          activeStatuts={activeStatuts}
          toggleStatut={toggle(setActiveStatuts)}
          clearStatuts={() => setActiveStatuts(new Set())}
        />
        <NiveauFilterDropdown
          activeNiveaux={activeNiveaux}
          toggleNiveau={toggle(setActiveNiveaux)}
          clearNiveaux={() => setActiveNiveaux(new Set())}
        />

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {display.length} résultat{display.length > 1 ? 's' : ''}
            {totalFilters > 0 && (
              <span className="ml-1 text-blue-500">· {totalFilters} filtre{totalFilters > 1 ? 's' : ''}</span>
            )}
          </span>
          <div className="w-px h-4 bg-slate-200" />
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 cursor-pointer"
          >
            {[20, 50, 100, 200].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="flex-1 overflow-auto">
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: totalWidth }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {activeCols.map(col => (
                <ResizableTh key={col.id} col={col} width={colWidths[col.id]}
                  onResize={handleResize} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {display.length === 0 ? (
              <tr>
                <td colSpan={activeCols.length} className="text-center py-16 text-slate-400 text-sm">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucun équipement pour ces filtres
                </td>
              </tr>
            ) : (
              pageItems.map((eq, idx) => (
                <EquipRow key={eq.id} eq={eq} idx={(safePage - 1) * pageSize + idx} colWidths={colWidths} activeCols={activeCols} onRowClick={setSelectedEquip} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {display.length > 0 && (
        <div className="flex-shrink-0 border-t border-slate-100 bg-white px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            {((safePage - 1) * pageSize) + 1}–{Math.min(safePage * pageSize, display.length)} sur {display.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 1}
              onClick={() => setPage(1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Première page"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i + 1;
              else if (safePage <= 4) p = i + 1;
              else if (safePage >= totalPages - 3) p = totalPages - 6 + i;
              else p = safePage - 3 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors
                    ${p === safePage ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {p}
                </button>
              );
            })}
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage(totalPages)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Dernière page"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-xs text-slate-400">Page {safePage} / {totalPages}</span>
        </div>
      )}

      {showSidebar && (
        <SettingsSidebar
          visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          defaultSort={defaultSort} setDefaultSort={applyDefaultSort}
          onClose={() => setShowSidebar(false)}
        />
      )}

      {selectedEquip && (() => {
        const fiche: EquipementFiche = {
          id:                   selectedEquip.id,
          identifiant:          selectedEquip.identifiant,
          designation:          selectedEquip.designation,
          categorie:            selectedEquip.categorie,
          sous_categorie:       selectedEquip.sous_categorie ?? null,
          marque:               selectedEquip.marque ?? null,
          modele:               selectedEquip.modele ?? null,
          numero_serie:         selectedEquip.numero_serie ?? null,
          etat:                 selectedEquip.etat ?? null,
          localisation_detail:  selectedEquip.sous_niveau_label ?? null,
          date_mise_en_service: selectedEquip.date_mise_en_service ?? null,
          garantie_fin:         (selectedEquip.caracteristiques?.garantie_fin as string) ?? null,
          caracteristiques:     selectedEquip.caracteristiques ?? null,
          site_label:           selectedEquip.site_label,
          sous_niveau_label:    selectedEquip.sous_niveau_label,
        };
        return <FicheEquipement eq={fiche} onClose={() => setSelectedEquip(null)} />;
      })()}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function EquipRow({ eq, idx, colWidths, activeCols, onRowClick }: {
  eq: EquipementGlobal; idx: number;
  colWidths: Record<string, number>; activeCols: ColDef[];
  onRowClick?: (eq: EquipementGlobal) => void;
}) {
  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

  const cellFor = (id: string) => {
    const w = colWidths[id];
    switch (id) {

      case 'categorie': {
        const key = getCategorieKey(eq.categorie);
        const cfg = CATEGORIES[key];
        if (!cfg) return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className="text-xs text-slate-400 italic">{eq.categorie || '—'}</span>
          </td>
        );
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={cfg.color}>{cfg.icon}</span>
              {cfg.label}
            </span>
          </td>
        );
      }

      case 'designation':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <p className="font-semibold text-slate-800 text-sm leading-snug"
              style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
              {eq.designation}
            </p>
            {eq.sous_categorie && (
              <p className="text-[11px] text-slate-400 mt-0.5">{eq.sous_categorie}</p>
            )}
          </td>
        );

      case 'site': {
        const nCfg = NIVEAU_CFG[eq.niveau];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {/* Résidence / Site */}
            <p className="text-xs font-medium text-slate-700 leading-tight truncate flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
              {eq.site_label}
            </p>
            {/* Sous-niveau (étage ou logement) */}
            {eq.sous_niveau_label && (
              <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${nCfg.bg} ${nCfg.text} ${nCfg.border}`}>
                {nCfg.icon}
                {eq.sous_niveau_label}
              </span>
            )}
            {/* Badge niveau (résidence uniquement, pas de sous-niveau) */}
            {!eq.sous_niveau_label && (
              <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${nCfg.bg} ${nCfg.text} ${nCfg.border}`}>
                {nCfg.icon}
                {nCfg.label}
              </span>
            )}
          </td>
        );
      }

      case 'quantite': {
        const qty = (getCaract(eq, 'quantite') as number) ?? 1;
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5 text-center">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {qty}
            </span>
          </td>
        );
      }

      case 'marque':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {eq.marque
              ? <p className="text-xs font-medium text-slate-700" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{eq.marque}</p>
              : <p className="text-xs text-slate-300 italic">—</p>}
            {eq.modele && (
              <p className="text-[11px] text-slate-400 mt-0.5" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{eq.modele}</p>
            )}
          </td>
        );

      case 'inventaire':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{eq.identifiant}</span>
            {eq.numero_serie && (
              <p className="font-mono text-[10px] text-slate-400 mt-0.5" style={{ wordBreak: 'break-all' }}>{eq.numero_serie}</p>
            )}
          </td>
        );

      case 'installation':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
              <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
              {fmtDate(eq.date_mise_en_service)}
            </span>
          </td>
        );

      case 'garantie':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <GarantieCell eq={eq} />
          </td>
        );

      case 'etat': {
        const etatKey = eq.etat in ETAT_CFG ? eq.etat : 'fonctionnel';
        const cfg = ETAT_CFG[etatKey];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
              {cfg.icon}
              <span className="text-[11px] text-slate-500">{cfg.label}</span>
            </span>
          </td>
        );
      }

      case 'statut': {
        const rawStatut = getCaract(eq, 'statut');
        const statutKey = typeof rawStatut === 'string' && rawStatut in STATUT_CFG ? rawStatut : 'en_service';
        const cfg = STATUT_CFG[statutKey];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <ColorBadge {...cfg} />
          </td>
        );
      }

      default:
        return <td key={id} style={{ width: w }} className="px-3 py-2.5" />;
    }
  };

  return (
    <tr
      className={`${rowBg} hover:bg-blue-50/40 transition-colors cursor-pointer`}
      onClick={() => onRowClick?.(eq)}
    >
      {activeCols.map(col => cellFor(col.id))}
    </tr>
  );
}
