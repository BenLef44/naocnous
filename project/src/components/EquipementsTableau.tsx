import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Wrench, Hash, Tag, Package, Layers, Calendar, ShieldCheck, ShieldOff,
  ArrowUpDown, Settings2, ChevronRight, X, GripVertical, ChevronUp, ChevronDown,
  Thermometer, Lightbulb, Flame, WashingMachine, Zap, Wifi, Sofa, Droplets, Lock,
  ThumbsUp, ThumbsDown, Activity,
} from 'lucide-react';
import { Equipement } from '../types/patrimoine';
import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import FicheEquipement, { EquipementFiche } from './FicheEquipement';

// ─── Catégories ───────────────────────────────────────────────────────────────

interface CategorieCfg {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const CATEGORIES: Record<string, CategorieCfg> = {
  cvc:            { label: 'CVC',                  icon: <Thermometer   className="w-3.5 h-3.5" />, color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200' },
  eclairage:      { label: 'Éclairage',            icon: <Lightbulb     className="w-3.5 h-3.5" />, color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  incendie:       { label: 'Détection incendie',   icon: <Flame         className="w-3.5 h-3.5" />, color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200'    },
  electromenager: { label: 'Électroménager',       icon: <WashingMachine className="w-3.5 h-3.5" />, color: 'text-blue-600', bg: 'bg-blue-50',    border: 'border-blue-200'   },
  electricite:    { label: 'Électricité',          icon: <Zap           className="w-3.5 h-3.5" />, color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
  reseau:         { label: 'Réseau / Wi-Fi',       icon: <Wifi          className="w-3.5 h-3.5" />, color: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-200'   },
  mobilier:       { label: 'Mobilier',             icon: <Sofa          className="w-3.5 h-3.5" />, color: 'text-slate-600',  bg: 'bg-slate-100',  border: 'border-slate-200'  },
  sanitaires:     { label: 'Sanitaire',            icon: <Droplets      className="w-3.5 h-3.5" />, color: 'text-cyan-600',   bg: 'bg-cyan-50',    border: 'border-cyan-200'   },
  serrure:        { label: 'Serrure',              icon: <Lock          className="w-3.5 h-3.5" />, color: 'text-slate-700',  bg: 'bg-slate-50',   border: 'border-slate-300'  },
};

// 3 columns × 3 rows layout
const CATEGORIES_GRID: string[][] = [
  ['cvc', 'eclairage', 'incendie'],
  ['electromenager', 'electricite', 'reseau'],
  ['mobilier', 'sanitaires', 'serrure'],
];

function getCategorieKey(cat: string | undefined): string {
  if (!cat) return '';
  const lower = cat.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z]/g, '');
  const map: Record<string, string> = {
    cvc: 'cvc', chauffage: 'cvc', ventilation: 'cvc', climatisation: 'cvc',
    eclairage: 'eclairage', lumiere: 'eclairage',
    incendie: 'incendie', detecteur: 'incendie', detection: 'incendie', alarme: 'incendie',
    cuisine: 'electromenager', kitchenette: 'electromenager',
    electromenager: 'electromenager', electromenager2: 'electromenager',
    electricite: 'electricite', electrique: 'electricite',
    sanitaires: 'sanitaires', sanitaire: 'sanitaires', plomberie: 'sanitaires',
    mobilier: 'mobilier',
    serrure: 'serrure', acces: 'serrure',
    reseau: 'reseau', wifi: 'reseau',
  };
  return map[lower] || lower;
}

// ─── État configs ─────────────────────────────────────────────────────────────

type EtatKey = 'tres_bon' | 'fonctionnel' | 'moyen' | 'degrade' | 'a_remplacer' | 'en_panne' | 'hors_service';

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

interface StatutCfg {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const STATUT_CFG: Record<string, StatutCfg> = {
  en_service:    { label: 'En service',    bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
  en_panne:      { label: 'En panne',      bg: 'bg-red-50',      text: 'text-red-700',      border: 'border-red-200',     dot: 'bg-red-500'     },
  en_maintenance:{ label: 'En maintenance',bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',   dot: 'bg-amber-400'   },
  hors_service:  { label: 'Hors service',  bg: 'bg-slate-100',   text: 'text-slate-600',    border: 'border-slate-300',   dot: 'bg-slate-400'   },
  neutralise:    { label: 'Neutralisé',    bg: 'bg-orange-50',   text: 'text-orange-700',   border: 'border-orange-200',  dot: 'bg-orange-500'  },
  remplace:      { label: 'Remplacé',      bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border-blue-200',    dot: 'bg-blue-400'    },
  reforme:       { label: 'Réformé',       bg: 'bg-purple-50',   text: 'text-purple-700',   border: 'border-purple-200',  dot: 'bg-purple-400'  },
  // legacy aliases kept for backward compatibility
  en_travaux:    { label: 'En maintenance',bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',   dot: 'bg-amber-400'   },
  stocke:        { label: 'Stocké',        bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border-blue-200',    dot: 'bg-blue-400'    },
};

const STATUT_LIST = [
  'en_service', 'en_panne', 'en_maintenance', 'hors_service',
  'neutralise', 'remplace', 'reforme',
] as const;

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
  { id: 'categorie',    label: 'Catégorie',        icon: <Tag      className="w-3 h-3" />, defaultWidth: 160, minWidth: 120, canHide: false, sortable: true  },
  { id: 'designation',  label: 'Équipement',        icon: <Wrench   className="w-3 h-3" />, defaultWidth: 200, minWidth: 140, canHide: false, sortable: true  },
  { id: 'quantite',     label: 'Qté',               icon: <Package  className="w-3 h-3" />, defaultWidth: 60,  minWidth: 50,  canHide: true,  sortable: false },
  { id: 'marque',       label: 'Marque',  label2: 'Modèle',
    icon: <Layers       className="w-3 h-3" />,                                              defaultWidth: 160, minWidth: 120, canHide: true,  sortable: true  },
  { id: 'inventaire',   label: 'N° inventaire',     icon: <Hash     className="w-3 h-3" />, defaultWidth: 150, minWidth: 110, canHide: true,  sortable: false },
  { id: 'installation', label: 'Date installation', icon: <Calendar className="w-3 h-3" />, defaultWidth: 140, minWidth: 110, canHide: true,  sortable: true  },
  { id: 'garantie',     label: 'Garantie', label2: 'Date fin / Durée',
    icon: <ShieldCheck  className="w-3 h-3" />,                                              defaultWidth: 180, minWidth: 140, canHide: true,  sortable: false },
  { id: 'etat',         label: 'État',              icon: <ThumbsUp className="w-3 h-3" />, defaultWidth: 110, minWidth: 80,  canHide: true,  sortable: true  },
  { id: 'statut',       label: 'Statut',            icon: <Wrench   className="w-3 h-3" />, defaultWidth: 140, minWidth: 100, canHide: true,  sortable: true  },
];

const DEFAULT_VISIBLE = ALL_COLUMNS.map(c => c.id);

// ─── Sort options ─────────────────────────────────────────────────────────────

const TRI_OPTIONS = [
  { value: 'categorie_asc',    label: 'Catégorie (A → Z)' },
  { value: 'categorie_desc',   label: 'Catégorie (Z → A)' },
  { value: 'designation_asc',  label: 'Équipement (A → Z)' },
  { value: 'designation_desc', label: 'Équipement (Z → A)' },
  { value: 'installation_asc', label: 'Installation (plus ancien)' },
  { value: 'installation_desc',label: 'Installation (plus récent)' },
  { value: 'etat_asc',         label: 'État (meilleur en premier)' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

export function buildMockEquipements(logementId: string): Equipement[] {
  return [
    {
      id: 'eq-1', identifiant: 'EQ-LOG-001', designation: 'Radiateur électrique', categorie: 'cvc',
      logement_id: logementId, etat: 'fonctionnel', marque: 'Atlantic', modele: 'Galéo 1500W',
      numero_serie: 'ATL-2021-8842', date_mise_en_service: '2021-09-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: true, date_fin_garantie: '2026-09-01', duree_garantie_mois: 60 },
      created_at: '2021-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-2', identifiant: 'EQ-LOG-002', designation: 'VMC simple flux', categorie: 'cvc',
      logement_id: logementId, etat: 'fonctionnel', marque: 'Aldes', modele: 'T.ONE Compact',
      numero_serie: 'ALD-2019-3310', date_mise_en_service: '2019-06-15',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: false, date_fin_garantie: '2024-06-15', duree_garantie_mois: 60 },
      created_at: '2019-06-15T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-3', identifiant: 'EQ-LOG-003', designation: 'Détecteur de fumée', categorie: 'incendie',
      logement_id: logementId, etat: 'fonctionnel', marque: 'Kidde', modele: '10Y29',
      numero_serie: 'KID-2022-7701', date_mise_en_service: '2022-09-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: true, date_fin_garantie: '2032-09-01', duree_garantie_mois: 120 },
      created_at: '2022-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-4', identifiant: 'EQ-LOG-004', designation: 'Plaques de cuisson induction', categorie: 'electromenager',
      logement_id: logementId, etat: 'a_remplacer', marque: 'Whirlpool', modele: 'ACM 868/BA',
      numero_serie: 'WHP-2017-4456', date_mise_en_service: '2017-09-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: false, date_fin_garantie: '2019-09-01', duree_garantie_mois: 24 },
      created_at: '2017-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-5', identifiant: 'EQ-LOG-005', designation: 'Réfrigérateur', categorie: 'electromenager',
      logement_id: logementId, etat: 'moyen', marque: 'Bosch', modele: 'KTR15NWFA',
      numero_serie: 'BSH-2020-1123', date_mise_en_service: '2020-09-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: false, date_fin_garantie: '2022-09-01', duree_garantie_mois: 24 },
      created_at: '2020-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-6', identifiant: 'EQ-LOG-006', designation: 'Lit une place + matelas', categorie: 'mobilier',
      logement_id: logementId, etat: 'fonctionnel', marque: 'IKEA', modele: 'MALM 90x200',
      numero_serie: null, date_mise_en_service: '2021-09-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: false },
      created_at: '2021-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-7', identifiant: 'EQ-LOG-007', designation: 'Serrure électronique', categorie: 'serrure',
      logement_id: logementId, etat: 'fonctionnel', marque: 'Mul-T-Lock', modele: 'Entr-e',
      numero_serie: 'MTL-2023-0091', date_mise_en_service: '2023-06-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: true, date_fin_garantie: '2026-06-01', duree_garantie_mois: 36 },
      created_at: '2023-06-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-8', identifiant: 'EQ-LOG-008', designation: "Point d'accès Wi-Fi", categorie: 'reseau',
      logement_id: logementId, etat: 'fonctionnel', marque: 'TP-Link', modele: 'EAP245',
      numero_serie: 'TPL-2022-5591', date_mise_en_service: '2022-01-15',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: true, date_fin_garantie: '2025-01-15', duree_garantie_mois: 36 },
      created_at: '2022-01-15T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-9', identifiant: 'EQ-LOG-009', designation: 'Tableau électrique', categorie: 'electricite',
      logement_id: logementId, etat: 'fonctionnel', marque: 'Legrand', modele: 'XL³ 125',
      numero_serie: 'LGR-2021-4411', date_mise_en_service: '2021-09-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: true, date_fin_garantie: '2031-09-01', duree_garantie_mois: 120 },
      created_at: '2021-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-10', identifiant: 'EQ-LOG-010', designation: 'Douche + robinetterie', categorie: 'sanitaires',
      logement_id: logementId, etat: 'moyen', marque: 'Grohe', modele: 'Euphoria 110',
      numero_serie: null, date_mise_en_service: '2018-09-01',
      caracteristiques: { quantite: 1, statut: 'en_service', garantie: false },
      created_at: '2018-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'eq-11', identifiant: 'EQ-LOG-011', designation: 'Luminaire plafond chambre', categorie: 'eclairage',
      logement_id: logementId, etat: 'fonctionnel', marque: 'Philips', modele: 'Hue White E27',
      numero_serie: null, date_mise_en_service: '2022-09-01',
      caracteristiques: { quantite: 2, statut: 'en_service', garantie: true, date_fin_garantie: '2024-09-01', duree_garantie_mois: 24 },
      created_at: '2022-09-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd/MM/yyyy', { locale: fr }); } catch { return d; }
}

function getCaract(eq: Equipement, key: string) {
  return (eq.caracteristiques as Record<string, unknown> | undefined)?.[key];
}

function GarantieCell({ eq }: { eq: Equipement }) {
  const hasGarantie = getCaract(eq, 'garantie') as boolean | undefined;
  const dateFin     = getCaract(eq, 'date_fin_garantie') as string | undefined;
  const duree       = getCaract(eq, 'duree_garantie_mois') as number | undefined;

  const isActive = hasGarantie && dateFin
    ? differenceInDays(parseISO(dateFin), new Date()) > 0
    : !!hasGarantie;

  if (!hasGarantie && !dateFin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 italic">
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

// ─── Resizable header cell ────────────────────────────────────────────────────

function ResizableTh({
  col, width, onResize, sortField, sortDir, onSort,
}: {
  col: ColDef;
  width: number;
  onResize: (id: string, delta: number) => void;
  sortField: string;
  sortDir: 'asc' | 'desc';
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
    <th
      style={{ width, minWidth: col.minWidth, position: 'relative' }}
      className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 select-none align-top"
      onClick={() => col.sortable && onSort(col.id)}
    >
      <div className={`flex flex-col gap-0.5 pr-3 ${col.sortable ? 'cursor-pointer' : ''}`}>
        {/* Ligne 1 : icône + label (wrappable) */}
        <span className="flex items-start gap-1">
          {col.icon && <span className="text-slate-400 flex-shrink-0 mt-px">{col.icon}</span>}
          <span className="break-words leading-tight"
            style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
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
        {/* Ligne 2 optionnelle */}
        {col.label2 && (
          <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal pl-0.5 leading-tight"
            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {col.label2}
          </span>
        )}
      </div>
      {/* Drag handle */}
      <span
        onMouseDown={onMouseDown}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group"
        style={{ userSelect: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <span className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// ─── Settings sidebar ─────────────────────────────────────────────────────────

interface SidebarProps {
  visibleCols: string[];
  setVisibleCols: (cols: string[]) => void;
  defaultSort: string;
  setDefaultSort: (s: string) => void;
  onClose: () => void;
}

function SettingsSidebar({ visibleCols, setVisibleCols, defaultSort, setDefaultSort, onClose }: SidebarProps) {
  const hideable  = ALL_COLUMNS.filter(c => c.canHide);
  const selected  = visibleCols.filter(id => hideable.some(c => c.id === id));
  const available = hideable.filter(c => !selected.includes(c.id));
  const [localSel, setLocalSel]   = useState<string[]>(selected);
  const [localSort, setLocalSort] = useState(defaultSort);
  const dragOver = useRef<string | null>(null);

  const addCol    = (id: string) => setLocalSel(prev => [...prev, id]);
  const removeCol = (id: string) => setLocalSel(prev => prev.filter(x => x !== id));

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
                          <button onClick={() => removeCol(id)}
                            className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 px-1">
              <span className="font-medium text-slate-500">Catégorie</span> et <span className="font-medium text-slate-500">Équipement</span> sont toujours visibles.
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

interface CatFilterProps {
  activeCategories: Set<string>;
  toggleCategorie: (key: string) => void;
  clearCategories: () => void;
}

function CategoryFilterDropdown({ activeCategories, toggleCategorie, clearCategories }: CatFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useCallback(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCount = activeCategories.size;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
          ${open || activeCount > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
      >
        <Tag className="w-3.5 h-3.5" />
        Catégories
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3"
          style={{ minWidth: 320 }}>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
            {CATEGORIES_GRID.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1.5">
                {col.map(key => {
                  const cfg    = CATEGORIES[key];
                  const active = activeCategories.has(key);
                  return (
                    <button key={key} onClick={() => toggleCategorie(key)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all text-left w-full
                        ${active
                          ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
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

interface StatutFilterProps {
  activeStatuts: Set<string>;
  toggleStatut: (key: string) => void;
  clearStatuts: () => void;
}

function StatutFilterDropdown({ activeStatuts, toggleStatut, clearStatuts }: StatutFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useCallback(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCount = activeStatuts.size;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
          ${open || activeCount > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
      >
        <Activity className="w-3.5 h-3.5" />
        Statut
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3"
          style={{ minWidth: 220 }}>
          <div className="flex flex-col gap-1.5">
            {STATUT_LIST.map(key => {
              const cfg    = STATUT_CFG[key];
              const active = activeStatuts.has(key);
              return (
                <button key={key} onClick={() => toggleStatut(key)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full
                    ${active
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
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

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  equipements: Equipement[];
  loading?: boolean;
}

export default function EquipementsTableau({ equipements, loading = false }: Props) {
  const [sortField,        setSortField]        = useState('categorie');
  const [sortDir,          setSortDir]          = useState<'asc' | 'desc'>('asc');
  const [defaultSort,      setDefaultSort]      = useState('categorie_asc');
  const [visibleCols,      setVisibleCols]      = useState<string[]>(DEFAULT_VISIBLE);
  const [showSidebar,      setShowSidebar]      = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [activeStatuts,    setActiveStatuts]    = useState<Set<string>>(new Set());
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(ALL_COLUMNS.map(c => [c.id, c.defaultWidth]))
  );
  const [selectedEquip, setSelectedEquip] = useState<Equipement | null>(null);

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

  const toggleCategorie = (key: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleStatut = (key: string) => {
    setActiveStatuts(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const applyDefaultSort = (s: string) => {
    setDefaultSort(s);
    const parts = s.split('_');
    const dir   = parts.pop() as 'asc' | 'desc';
    const field = parts.join('_');
    setSortField(field);
    setSortDir(dir);
  };

  const display = useMemo(() => {
    let items = [...equipements];
    if (activeCategories.size > 0) {
      items = items.filter(eq => activeCategories.has(getCategorieKey(eq.categorie)));
    }
    if (activeStatuts.size > 0) {
      items = items.filter(eq => {
        const s = (getCaract(eq, 'statut') as string) ?? 'en_service';
        return activeStatuts.has(s);
      });
    }
    items.sort((a, b) => {
      let va = '', vb = '';
      if (sortField === 'categorie')    { va = a.categorie ?? ''; vb = b.categorie ?? ''; }
      if (sortField === 'designation')  { va = a.designation ?? ''; vb = b.designation ?? ''; }
      if (sortField === 'marque')       { va = a.marque ?? ''; vb = b.marque ?? ''; }
      if (sortField === 'installation') { va = a.date_mise_en_service ?? ''; vb = b.date_mise_en_service ?? ''; }
      if (sortField === 'etat')         { va = a.etat ?? ''; vb = b.etat ?? ''; }
      if (sortField === 'statut')       {
        va = (getCaract(a, 'statut') as string) ?? '';
        vb = (getCaract(b, 'statut') as string) ?? '';
      }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return items;
  }, [equipements, activeCategories, activeStatuts, sortField, sortDir]);

  const activeCols = ALL_COLUMNS.filter(c => visibleCols.includes(c.id));
  const totalWidth = activeCols.reduce((s, c) => s + colWidths[c.id], 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          Chargement des équipements…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barre de contrôles */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap">
        {/* Paramètres */}
        <button onClick={() => setShowSidebar(true)} title="Paramètres du tableau"
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-slate-700 flex-shrink-0">
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        {/* Ordre */}
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 flex-shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" /> Ordre :
        </span>
        <select value={`${sortField}_${sortDir}`}
          onChange={e => applyDefaultSort(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 cursor-pointer flex-shrink-0">
          {TRI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Séparateur */}
        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        {/* Filtre catégories */}
        <CategoryFilterDropdown
          activeCategories={activeCategories}
          toggleCategorie={toggleCategorie}
          clearCategories={() => setActiveCategories(new Set())}
        />

        {/* Filtre statut */}
        <StatutFilterDropdown
          activeStatuts={activeStatuts}
          toggleStatut={toggleStatut}
          clearStatuts={() => setActiveStatuts(new Set())}
        />

        {/* Compteur (poussé à droite) */}
        <span className="ml-auto text-xs text-slate-400 font-medium flex-shrink-0">
          {display.length} équipement{display.length > 1 ? 's' : ''}
          {(activeCategories.size + activeStatuts.size) > 0 && (
            <span className="ml-1 text-blue-500">
              ({activeCategories.size + activeStatuts.size} filtre{(activeCategories.size + activeStatuts.size) > 1 ? 's' : ''})
            </span>
          )}
        </span>
      </div>

      {/* Tableau */}
      <div className="flex-1 overflow-auto">
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: totalWidth }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {activeCols.map(col => (
                <ResizableTh
                  key={col.id}
                  col={col}
                  width={colWidths[col.id]}
                  onResize={handleResize}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {display.length === 0 ? (
              <tr>
                <td colSpan={activeCols.length} className="text-center py-16 text-slate-400 text-sm">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucun équipement{activeCategories.size > 0 ? ' pour ces catégories' : ' enregistré'}
                </td>
              </tr>
            ) : (
              display.map((eq, idx) => (
                <EquipRow key={eq.id} eq={eq} idx={idx} colWidths={colWidths} activeCols={activeCols} onRowClick={setSelectedEquip} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showSidebar && (
        <SettingsSidebar
          visibleCols={visibleCols}
          setVisibleCols={setVisibleCols}
          defaultSort={defaultSort}
          setDefaultSort={applyDefaultSort}
          onClose={() => setShowSidebar(false)}
        />
      )}

      {/* Fiche équipement — panneau droit */}
      {selectedEquip && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedEquip(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-[640px] bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
            <FicheEquipement
              eq={selectedEquip as unknown as EquipementFiche}
              onClose={() => setSelectedEquip(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function EquipRow({ eq, idx, colWidths, activeCols, onRowClick }: {
  eq: Equipement;
  idx: number;
  colWidths: Record<string, number>;
  activeCols: ColDef[];
  onRowClick?: (eq: Equipement) => void;
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
              ? <p className="text-xs font-medium text-slate-700"
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{eq.marque}</p>
              : <p className="text-xs text-slate-300 italic">—</p>}
            {eq.modele && (
              <p className="text-[11px] text-slate-400 mt-0.5"
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{eq.modele}</p>
            )}
          </td>
        );

      case 'inventaire':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {eq.identifiant
              ? <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{eq.identifiant}</span>
              : <span className="text-xs text-slate-300 italic">—</span>}
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
        const cfg = ETAT_CFG[eq.etat] ?? ETAT_CFG.fonctionnel;
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color}`} title={cfg.label}>
              {cfg.icon}
              <span className="text-[11px] text-slate-500">{cfg.label}</span>
            </span>
          </td>
        );
      }

      case 'statut': {
        const statutKey = (getCaract(eq, 'statut') as string) ?? 'en_service';
        const cfg = STATUT_CFG[statutKey] ?? STATUT_CFG.en_service;
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
      className={`${rowBg} hover:bg-blue-50/60 transition-colors cursor-pointer`}
      onClick={() => onRowClick?.(eq)}
    >
      {activeCols.map(col => cellFor(col.id))}
    </tr>
  );
}
