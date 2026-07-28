import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  FileText, Calendar, RefreshCw, Euro,
  Activity, ShieldCheck, ArrowUpDown, Settings2, ChevronUp, ChevronDown,
  X, GripVertical, AlertTriangle, CheckCircle2,
  Clock, XCircle, Tag, Banknote, BarChart3, Star, MapPin, Wrench,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoDekra          from '../assets/logo-Dekra.jpg';
import logoSocotec        from '../assets/logo-SOCOTEC.png';
import logoApave          from '../assets/logo-Apave.jpg';
import logoBureauVeritas  from '../assets/logo-Bureau-Veritas.jpg';
import logoAlpesControles from '../assets/logo-Alpes-Controles.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatutContrat = 'actif' | 'expire' | 'resilie' | 'en_renouvellement' | 'suspendu';
export type TypeContrat   = 'maintenance' | 'exploitation' | 'gardiennage' | 'nettoyage' | 'energie' | 'assurance' | 'autre';
export type Criticite     = 'haute' | 'normale' | 'basse';
export type MarqueP       = 'P1' | 'P2' | 'P3' | 'P5' | 'P6' | 'interessement' | 'controle_reglementaire';

export interface ContratRow {
  id:                  string;
  reference:           string;
  intitule:            string;
  emoji:               string;
  type_contrat:        TypeContrat;
  marque_p:            MarqueP;
  prestataire:         string;
  date_debut:          string;
  date_fin:            string;
  reconduction:        'tacite' | 'expresse' | 'sans_reconduction';
  preavis_mois:        number;
  prochaine_echeance:  string;
  montant_annuel:      number;
  couts_imputes:       number;
  taux_realisation:    number;   // 0-100
  reactivity_score:    number;   // 0-100
  nb_non_conformites:  number;
  statut:              StatutContrat;
  criticite:           Criticite;
  categorie_equipement?: string;
}

// ─── Prestataire logos / avatars ──────────────────────────────────────────────

interface PrestCfg {
  logo?: string;
  bg:    string;
  text:  string;
  abbr:  string;
}

const PREST_CFG: Record<string, PrestCfg> = {
  'DEKRA Industrial':    { logo: logoDekra,          bg: '#1a6b30', text: '#fff', abbr: 'DE'  },
  'SOCOTEC Diagnostic':  { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SD'  },
  'APAVE':               { logo: logoApave,           bg: '#4a9520', text: '#fff', abbr: 'AP'  },
  'Bureau Veritas':      { logo: logoBureauVeritas,   bg: '#8b7355', text: '#fff', abbr: 'BV'  },
  'Alpes Contrôles':     { logo: logoAlpesControles,  bg: '#cc0000', text: '#fff', abbr: 'AC'  },
  'Schindler France':    { logo: undefined,            bg: '#e41f1f', text: '#fff', abbr: 'SCH' },
  'Dalkia':              { logo: undefined,            bg: '#005b9a', text: '#fff', abbr: 'DAL' },
  'Pronet Services':     { logo: undefined,            bg: '#2563eb', text: '#fff', abbr: 'PRO' },
  'Securitas':           { logo: undefined,            bg: '#c0392b', text: '#fff', abbr: 'SEC' },
  'Engie Pro':           { logo: undefined,            bg: '#00adef', text: '#fff', abbr: 'ENG' },
  'Rentokil Initial':    { logo: undefined,            bg: '#e67e22', text: '#fff', abbr: 'REN' },
  'AXA Immeuble':        { logo: undefined,            bg: '#00008b', text: '#fff', abbr: 'AXA' },
  'ThermoService Lyon':  { logo: undefined,            bg: '#0d9488', text: '#fff', abbr: 'TS'  },
  'Liebherr Service':    { logo: undefined,            bg: '#1e3a5f', text: '#fff', abbr: 'LIE' },
  'Cofely Services':     { logo: undefined,            bg: '#005b9a', text: '#fff', abbr: 'COF' },
};

function PrestLogo({ name }: { name: string }) {
  const cfg = PREST_CFG[name] ?? { bg: '#475569', text: '#fff', abbr: name.slice(0, 3).toUpperCase() };
  const [err, setErr] = useState(false);
  if (cfg.logo && !err) {
    return (
      <img src={cfg.logo} alt={name} onError={() => setErr(true)}
        className="rounded object-contain flex-shrink-0 bg-white border border-slate-200"
        style={{ width: 28, height: 28, padding: 3 }} />
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded flex-shrink-0 font-black leading-none text-[9px]"
      style={{ width: 28, height: 28, background: cfg.bg, color: cfg.text }}>
      {cfg.abbr}
    </span>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<StatutContrat, { label: string; bg: string; text: string; border: string; dot: string }> = {
  actif:             { label: 'Actif',             bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  expire:            { label: 'Expiré',            bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
  resilie:           { label: 'Résilié',           bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-300',   dot: 'bg-slate-400'   },
  en_renouvellement: { label: 'En renouvellement', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400'    },
  suspendu:          { label: 'Suspendu',          bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
};

const TYPE_CFG: Record<TypeContrat, { label: string; color: string; bg: string; border: string }> = {
  maintenance:  { label: 'Maintenance',  color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
  exploitation: { label: 'Exploitation', color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200'    },
  gardiennage:  { label: 'Gardiennage',  color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-300'   },
  nettoyage:    { label: 'Nettoyage',    color: 'text-cyan-700',    bg: 'bg-cyan-50',    border: 'border-cyan-200'    },
  energie:      { label: 'Énergie',      color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  assurance:    { label: 'Assurance',    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  autre:        { label: 'Autre',        color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200'   },
};

const MARQUE_P_CFG: Record<MarqueP, { label: string; color: string; bg: string; border: string; title: string }> = {
  P1:                     { label: 'P1',                          color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   title: 'P1 — Fourniture d\'énergie'         },
  P2:                     { label: 'P2',                          color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    title: 'P2 — Maintenance / exploitation'    },
  P3:                     { label: 'P3',                          color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  title: 'P3 — Gros entretien / renouvellement' },
  P5:                     { label: 'P5',                          color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200',    title: 'P5 — Travaux d\'amélioration'       },
  P6:                     { label: 'P6',                          color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'P6 — Engagement de résultats'       },
  interessement:          { label: 'Intéressement',               color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200',  title: 'Marché à intéressement'             },
  controle_reglementaire: { label: 'Contrôle régl.',              color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     title: 'Marché de contrôle réglementaire'   },
};

const CRITICITE_CFG: Record<Criticite, { label: string; color: string; bg: string; border: string }> = {
  haute:   { label: 'Haute',   color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'    },
  normale: { label: 'Normale', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  basse:   { label: 'Basse',   color: 'text-slate-600',  bg: 'bg-slate-100', border: 'border-slate-200'  },
};

const STATUT_LIST: StatutContrat[] = ['actif', 'expire', 'resilie', 'en_renouvellement', 'suspendu'];
const TYPE_LIST:   TypeContrat[]   = ['maintenance', 'exploitation', 'gardiennage', 'nettoyage', 'energie', 'assurance', 'autre'];
const MARQUE_P_LIST: MarqueP[]     = ['P1', 'P2', 'P3', 'P5', 'P6', 'interessement', 'controle_reglementaire'];

// ─── Localisation types (exported for use in Contrats.tsx) ───────────────────

export interface Residence {
  id:     string;
  nom:    string;
  campus: string;
}

// ─── Column definitions ───────────────────────────────────────────────────────

export interface ColDef {
  id:           string;
  label:        string;
  label2?:      string;
  icon?:        React.ReactNode;
  defaultWidth: number;
  minWidth:     number;
  canHide:      boolean;
  sortable?:    boolean;
}

export const BASE_COLS: ColDef[] = [
  { id: 'contrat',       label: 'Contrat',       label2: 'Réf. + intitulé',        icon: <FileText    className="w-3 h-3" />, defaultWidth: 220, minWidth: 160, canHide: false, sortable: true  },
  { id: 'type',          label: 'Type',           label2: 'Marché + prestataire',    icon: <Tag         className="w-3 h-3" />, defaultWidth: 190, minWidth: 140, canHide: false, sortable: true  },
  { id: 'localisation',  label: 'Localisation',   label2: 'Résidences concernées',   icon: <MapPin      className="w-3 h-3" />, defaultWidth: 200, minWidth: 150, canHide: true,  sortable: false },
  { id: 'periode',       label: 'Période',        label2: 'Début + fin',             icon: <Calendar    className="w-3 h-3" />, defaultWidth: 155, minWidth: 120, canHide: true,  sortable: true  },
  { id: 'echeances',     label: 'Échéances',      label2: 'Reconduction + préavis',  icon: <RefreshCw   className="w-3 h-3" />, defaultWidth: 170, minWidth: 130, canHide: true,  sortable: false },
  { id: 'budget',        label: 'Budget',         label2: 'Montant + coûts imputés', icon: <Euro        className="w-3 h-3" />, defaultWidth: 160, minWidth: 120, canHide: true,  sortable: true  },
  { id: 'performance',   label: 'Performance',    label2: 'Réactivité + taux + NC',  icon: <BarChart3   className="w-3 h-3" />, defaultWidth: 190, minWidth: 150, canHide: true,  sortable: false },
  { id: 'statut',        label: 'Statut',         label2: 'Statut + criticité',      icon: <ShieldCheck className="w-3 h-3" />, defaultWidth: 155, minWidth: 110, canHide: true,  sortable: true  },
];

// Without localisation (for site/equipement/logement tabs — localisation handled differently)
const COLS_WITHOUT_LOCALISATION = BASE_COLS.filter(c => c.id !== 'localisation');

const DEFAULT_VISIBLE_BASE         = BASE_COLS.map(c => c.id);
const DEFAULT_VISIBLE_NO_LOC       = COLS_WITHOUT_LOCALISATION.map(c => c.id);

// ─── Sort options ─────────────────────────────────────────────────────────────

const TRI_OPTIONS = [
  { value: 'intitule_asc',     label: 'Intitulé (A → Z)'        },
  { value: 'intitule_desc',    label: 'Intitulé (Z → A)'        },
  { value: 'type_asc',         label: 'Type (A → Z)'            },
  { value: 'date_fin_asc',     label: 'Date fin (plus tôt)'     },
  { value: 'date_fin_desc',    label: 'Date fin (plus tard)'    },
  { value: 'montant_desc',     label: 'Budget (décroissant)'    },
  { value: 'montant_asc',      label: 'Budget (croissant)'      },
  { value: 'performance_desc', label: 'Performance (meilleure)' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

export function buildMockContrats(context: 'site' | 'logement' | 'equipement' | string = 'site'): ContratRow[] {
  if (context === 'equipement') {
    return [
      {
        id: 'c-eq-001', reference: 'CTRQ-2024-001',
        intitule: 'Maintenance préventive semestrielle',
        emoji: '🔧',
        type_contrat: 'maintenance', marque_p: 'P2',
        prestataire: 'ThermoService Lyon',
        date_debut: '2024-01-01', date_fin: '2026-12-31',
        reconduction: 'tacite', preavis_mois: 3, prochaine_echeance: '2026-09-30',
        montant_annuel: 1800, couts_imputes: 1620,
        taux_realisation: 100, reactivity_score: 92, nb_non_conformites: 0,
        statut: 'actif', criticite: 'haute', categorie_equipement: 'Électroménager',
      },
      {
        id: 'c-eq-002', reference: 'CTRQ-2024-002',
        intitule: 'Contrôle F-Gaz & étanchéité',
        emoji: '🧪',
        type_contrat: 'exploitation', marque_p: 'controle_reglementaire',
        prestataire: 'SOCOTEC Diagnostic',
        date_debut: '2024-06-01', date_fin: '2025-05-31',
        reconduction: 'expresse', preavis_mois: 2, prochaine_echeance: '2025-03-31',
        montant_annuel: 420, couts_imputes: 420,
        taux_realisation: 100, reactivity_score: 88, nb_non_conformites: 0,
        statut: 'en_renouvellement', criticite: 'normale',
      },
      {
        id: 'c-eq-003', reference: 'CTRQ-2020-008',
        intitule: 'Garantie constructeur étendue',
        emoji: '🛡️',
        type_contrat: 'assurance', marque_p: 'P2',
        prestataire: 'Liebherr Service',
        date_debut: '2020-09-15', date_fin: '2025-09-15',
        reconduction: 'sans_reconduction', preavis_mois: 0, prochaine_echeance: '2025-09-15',
        montant_annuel: 0, couts_imputes: 0,
        taux_realisation: 100, reactivity_score: 95, nb_non_conformites: 0,
        statut: 'expire', criticite: 'basse',
      },
    ];
  }

  // site / logement / résidence context
  return [
    {
      id: 'c-001', reference: 'CTR-2024-001',
      intitule: 'Maintenance ascenseurs',
      emoji: '🛗',
      type_contrat: 'maintenance', marque_p: 'P2',
      prestataire: 'Schindler France',
      date_debut: '2024-01-01', date_fin: '2026-12-31',
      reconduction: 'tacite', preavis_mois: 6, prochaine_echeance: '2026-06-30',
      montant_annuel: 8400, couts_imputes: 8820,       // 105%
      taux_realisation: 97, reactivity_score: 88, nb_non_conformites: 1,
      statut: 'actif', criticite: 'haute',
    },
    {
      id: 'c-002', reference: 'CTR-2024-002',
      intitule: 'Exploitation chaufferie gaz',
      emoji: '🔥',
      type_contrat: 'exploitation', marque_p: 'P2',
      prestataire: 'Dalkia',
      date_debut: '2024-09-01', date_fin: '2027-08-31',
      reconduction: 'tacite', preavis_mois: 6, prochaine_echeance: '2027-02-28',
      montant_annuel: 32000, couts_imputes: 21300,
      taux_realisation: 100, reactivity_score: 94, nb_non_conformites: 0,
      statut: 'actif', criticite: 'haute',
    },
    {
      id: 'c-003', reference: 'CTR-2023-005',
      intitule: 'Nettoyage parties communes',
      emoji: '🧹',
      type_contrat: 'nettoyage', marque_p: 'P2',
      prestataire: 'Pronet Services',
      date_debut: '2023-01-01', date_fin: '2025-12-31',
      reconduction: 'tacite', preavis_mois: 3, prochaine_echeance: '2025-09-30',
      montant_annuel: 12600, couts_imputes: 12600,
      taux_realisation: 93, reactivity_score: 82, nb_non_conformites: 2,
      statut: 'actif', criticite: 'normale',
    },
    {
      id: 'c-004', reference: 'CTR-2022-011',
      intitule: 'Gardiennage et surveillance',
      emoji: '🔐',
      type_contrat: 'gardiennage', marque_p: 'P2',
      prestataire: 'Securitas',
      date_debut: '2022-09-01', date_fin: '2025-08-31',
      reconduction: 'expresse', preavis_mois: 4, prochaine_echeance: '2025-04-30',
      montant_annuel: 48000, couts_imputes: 53280,     // 111%
      taux_realisation: 100, reactivity_score: 91, nb_non_conformites: 0,
      statut: 'en_renouvellement', criticite: 'haute',
    },
    {
      id: 'c-005', reference: 'CTR-2024-018',
      intitule: 'Fourniture gaz',
      emoji: '⚡',
      type_contrat: 'energie', marque_p: 'P1',
      prestataire: 'Engie Pro',
      date_debut: '2024-01-01', date_fin: '2025-12-31',
      reconduction: 'tacite', preavis_mois: 3, prochaine_echeance: '2025-09-30',
      montant_annuel: 54000, couts_imputes: 31200,
      taux_realisation: 100, reactivity_score: 96, nb_non_conformites: 0,
      statut: 'actif', criticite: 'haute',
    },
    {
      id: 'c-006', reference: 'CTR-2021-003',
      intitule: 'Désinsectisation annuelle',
      emoji: '🪲',
      type_contrat: 'maintenance', marque_p: 'P2',
      prestataire: 'Rentokil Initial',
      date_debut: '2021-03-01', date_fin: '2024-02-28',
      reconduction: 'sans_reconduction', preavis_mois: 0, prochaine_echeance: '2024-02-28',
      montant_annuel: 1200, couts_imputes: 1200,
      taux_realisation: 100, reactivity_score: 100, nb_non_conformites: 0,
      statut: 'expire', criticite: 'basse',
    },
    {
      id: 'c-007', reference: 'CTR-2020-007',
      intitule: 'Contrôle réglementaire électrique',
      emoji: '⚡',
      type_contrat: 'maintenance', marque_p: 'controle_reglementaire',
      prestataire: 'DEKRA Industrial',
      date_debut: '2020-06-01', date_fin: '2023-05-31',
      reconduction: 'tacite', preavis_mois: 3, prochaine_echeance: '2023-02-28',
      montant_annuel: 2400, couts_imputes: 2400,
      taux_realisation: 83, reactivity_score: 76, nb_non_conformites: 3,
      statut: 'resilie', criticite: 'normale',
    },
    {
      id: 'c-008', reference: 'CTR-2025-024',
      intitule: 'Assurance multirisques immeubles',
      emoji: '🏠',
      type_contrat: 'assurance', marque_p: 'P2',
      prestataire: 'AXA Immeuble',
      date_debut: '2025-01-01', date_fin: '2025-12-31',
      reconduction: 'tacite', preavis_mois: 3, prochaine_echeance: '2025-09-30',
      montant_annuel: 18000, couts_imputes: 13500,
      taux_realisation: 100, reactivity_score: 97, nb_non_conformites: 0,
      statut: 'actif', criticite: 'haute',
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) { return new Date(d).toLocaleDateString('fr-FR'); }
function fmtCurrency(n: number) { return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }); }

function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-medium tabular-nums text-slate-600 w-8 text-right">{value}%</span>
    </div>
  );
}

// ─── Resizable column header ──────────────────────────────────────────────────

function ResizableTh({ col, width, sortKey, sortDir, onSort, onResize, children }: {
  col: ColDef; width: number;
  sortKey: string | null; sortDir: 'asc' | 'desc';
  onSort: (id: string) => void;
  onResize: (id: string, delta: number) => void;
  children: React.ReactNode;
}) {
  const dragging = useRef(false);
  const startX   = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    dragging.current = true; startX.current = e.clientX;
    const move = (ev: MouseEvent) => { if (!dragging.current) return; onResize(col.id, ev.clientX - startX.current); startX.current = ev.clientX; };
    const up   = () => { dragging.current = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  };

  const active = sortKey === col.id;
  return (
    <th style={{ width, minWidth: col.minWidth }}
      className="relative text-left px-3 py-0 bg-slate-50 border-b border-slate-200 select-none">
      <div className={`flex items-center gap-1 h-9 ${col.sortable ? 'cursor-pointer hover:text-slate-800' : ''} text-slate-500`}
        onClick={() => col.sortable && onSort(col.id)}>
        {col.icon && <span className="flex-shrink-0 opacity-60">{col.icon}</span>}
        <div className="flex flex-col leading-tight min-w-0">
          <span className={`text-[11px] font-semibold truncate ${active ? 'text-blue-700' : ''}`}>{col.label}</span>
          {col.label2 && <span className="text-[9px] text-slate-400 truncate">{col.label2}</span>}
        </div>
        {col.sortable && (active
          ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 text-blue-600 flex-shrink-0" />)
          : <ArrowUpDown className="w-3 h-3 opacity-30 flex-shrink-0" />)}
      </div>
      <div onMouseDown={onMouseDown} className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center group z-10">
        <div className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 group-hover:h-full transition-all" />
      </div>
    </th>
  );
}

// ─── Settings sidebar ─────────────────────────────────────────────────────────

function SettingsSidebar({ visibleCols, setVisibleCols, sortOption, setSortOption, onClose, allCols }: {
  visibleCols: string[]; setVisibleCols: (c: string[]) => void;
  sortOption: string; setSortOption: (v: string) => void; onClose: () => void;
  allCols: ColDef[];
}) {
  const dragIdx = useRef<number | null>(null);
  const moveCol = useCallback((from: number, to: number) => {
    const next = [...visibleCols]; const [item] = next.splice(from, 1); next.splice(to, 0, item); setVisibleCols(next);
  }, [visibleCols, setVisibleCols]);
  const hideable = allCols.filter(c => c.canHide);
  const hidden   = hideable.filter(c => !visibleCols.includes(c.id));

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-72 bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-400" /> Paramètres du tableau
          </span>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tri par défaut</p>
            <div className="space-y-1">
              {TRI_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors
                  ${sortOption === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}>
                  <input type="radio" name="sort" value={opt.value} checked={sortOption === opt.value}
                    onChange={() => setSortOption(opt.value)} className="accent-blue-600 w-3 h-3" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ordre des colonnes</p>
            <div className="space-y-1">
              {visibleCols.map((colId, idx) => {
                const col = ALL_COLS.find(c => c.id === colId); if (!col) return null;
                return (
                  <div key={colId} draggable
                    onDragStart={() => { dragIdx.current = idx; }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => { if (dragIdx.current !== null && dragIdx.current !== idx) { moveCol(dragIdx.current, idx); dragIdx.current = null; } }}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-300 select-none">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {col.icon && <span className="text-slate-400">{col.icon}</span>}
                    <span className="flex-1">{col.label}</span>
                    {!col.canHide && <span className="text-[10px] text-slate-400">fixe</span>}
                  </div>
                );
              })}
            </div>
          </div>
          {hidden.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Colonnes masquées</p>
              <div className="space-y-1">
                {hidden.map(col => (
                  <button key={col.id} onClick={() => setVisibleCols([...visibleCols, col.id])}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    {col.icon}<span>{col.label}</span><span className="ml-auto text-[10px] text-blue-500">+ Afficher</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Masquer une colonne</p>
            <div className="space-y-1">
              {hideable.filter(c => visibleCols.includes(c.id)).map(col => (
                <button key={col.id} onClick={() => setVisibleCols(visibleCols.filter(x => x !== col.id))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-red-200 hover:text-red-600 transition-colors">
                  {col.icon}<span>{col.label}</span><span className="ml-auto text-[10px] text-red-400">Masquer</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Équipements par résidence/catégorie (Supabase) ──────────────────────────

interface EquipRow {
  residence_id: string;
  categorie:    string;
  sous_categorie: string | null;
  nb:           number;
}

interface EquipState {
  loading: boolean;
  rows:    EquipRow[];
}

function useEquipementsContrat(
  residenceIds: string[],
  categories:   string[],
  enabled:      boolean,
): EquipState {
  const [state, setState] = useState<EquipState>({ loading: false, rows: [] });
  const key = residenceIds.join(',') + '|' + categories.join(',');

  useEffect(() => {
    if (!enabled || residenceIds.length === 0 || categories.length === 0) {
      setState({ loading: false, rows: [] });
      return;
    }
    let cancelled = false;
    setState(s => ({ ...s, loading: true }));
    supabase
      .from('equipements')
      .select('residence_id, categorie, sous_categorie')
      .in('residence_id', residenceIds)
      .in('categorie', categories)
      .then(({ data }) => {
        if (cancelled) return;
        // Group by residence_id + categorie + sous_categorie
        const map: Record<string, EquipRow> = {};
        for (const row of data ?? []) {
          const k = `${row.residence_id}||${row.categorie}||${row.sous_categorie ?? ''}`;
          if (!map[k]) map[k] = { residence_id: row.residence_id, categorie: row.categorie, sous_categorie: row.sous_categorie, nb: 0 };
          map[k].nb++;
        }
        setState({ loading: false, rows: Object.values(map) });
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return state;
}

// ─── EquipementsPanel — panneau dépliable sous les résidences ─────────────────

function EquipementsPanel({
  residenceIds,
  categories,
  allResidences,
}: {
  residenceIds:  string[];
  categories:    string[];
  allResidences: Residence[];
}) {
  const [open, setOpen] = useState(false);
  const { loading, rows } = useEquipementsContrat(residenceIds, categories, open);

  if (categories.length === 0) return null;

  // Pre-compute total even before open (we show count from rows when loaded)
  // Group rows by residence then by categorie
  const byResidence: Record<string, { nom: string; byCategorie: Record<string, number> }> = {};
  for (const row of rows) {
    if (!byResidence[row.residence_id]) {
      const res = allResidences.find(r => r.id === row.residence_id);
      byResidence[row.residence_id] = { nom: res?.nom ?? row.residence_id, byCategorie: {} };
    }
    const cat = row.categorie + (row.sous_categorie ? ` — ${row.sous_categorie}` : '');
    byResidence[row.residence_id].byCategorie[cat] = (byResidence[row.residence_id].byCategorie[cat] ?? 0) + row.nb;
  }

  const totalEq    = rows.reduce((s, r) => s + r.nb, 0);
  const nbRes      = Object.keys(byResidence).length;

  return (
    <div className="mt-1.5">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition-colors"
      >
        <Wrench className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
        {open && !loading && totalEq > 0 ? (
          <span className="font-medium text-blue-700">
            {totalEq} équipement{totalEq > 1 ? 's' : ''} · {nbRes} résidence{nbRes > 1 ? 's' : ''}
          </span>
        ) : open && loading ? (
          <span className="text-slate-400 italic">Chargement…</span>
        ) : (
          <span className="font-medium">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''} d'équipements
          </span>
        )}
        <ChevronDown className={`w-2.5 h-2.5 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !loading && (
        <div className="mt-1.5 space-y-2 pl-3 border-l-2 border-blue-100">
          {totalEq === 0 ? (
            <p className="text-[10px] text-slate-400 italic">Aucun équipement trouvé</p>
          ) : (
            Object.entries(byResidence).map(([rid, { nom, byCategorie }]) => {
              const resTotal = Object.values(byCategorie).reduce((s, n) => s + n, 0);
              return (
                <div key={rid}>
                  <p className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                    <MapPin className="w-2 h-2 text-slate-400 flex-shrink-0" />
                    {nom}
                    <span className="ml-auto font-normal text-slate-400">{resTotal} éq.</span>
                  </p>
                  <div className="pl-3 mt-0.5 space-y-0.5">
                    {Object.entries(byCategorie).map(([cat, nb]) => (
                      <div key={cat} className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span className="w-1 h-1 rounded-full bg-blue-300 flex-shrink-0" />
                        <span className="flex-1 truncate">{cat}</span>
                        <span className="text-slate-400 font-medium tabular-nums">{nb}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── LocalisationCell (exported for reuse) ────────────────────────────────────

export function LocalisationCell({ residenceIds, allResidences, categories }: {
  residenceIds:  string[];
  allResidences: Residence[];
  categories?:   string[];
}) {
  const [expanded, setExpanded] = useState(false);

  const byCampus: Record<string, string[]> = {};
  for (const rid of residenceIds) {
    const r = allResidences.find(x => x.id === rid);
    if (!r) continue;
    if (!byCampus[r.campus]) byCampus[r.campus] = [];
    byCampus[r.campus].push(r.nom);
  }
  const campusEntries = Object.entries(byCampus);
  const totalCount    = residenceIds.length;

  if (totalCount === 0) return <span className="text-[11px] text-slate-400">—</span>;

  return (
    <div className="min-w-0">
      {/* Résidences */}
      <button onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
        className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-blue-600 transition-colors">
        <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
        <span className="font-medium">
          {totalCount} résidence{totalCount > 1 ? 's' : ''}
          {campusEntries.length > 1
            ? ` · ${campusEntries.length} campus`
            : campusEntries[0] ? ` · ${campusEntries[0][0].replace('Campus ', '')}` : ''
          }
        </span>
        <ChevronDown className={`w-2.5 h-2.5 text-slate-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-2 pl-3 border-l-2 border-slate-100">
          {campusEntries.map(([campus, noms]) => (
            <div key={campus}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{campus}</p>
              {noms.map(nom => (
                <div key={nom} className="flex items-center gap-1 text-[10px] text-slate-500 leading-relaxed">
                  <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />{nom}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Équipements panel — uniquement si des catégories sont définies */}
      {categories && categories.length > 0 && (
        <EquipementsPanel
          residenceIds={residenceIds}
          categories={categories}
          allResidences={allResidences}
        />
      )}
    </div>
  );
}

// ─── Filter dropdowns ─────────────────────────────────────────────────────────

function TypeFilterDropdown({ activeTypes, toggle, onClose }: {
  activeTypes: Set<TypeContrat>; toggle: (t: TypeContrat) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute left-0 top-full mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[200px]">
        {TYPE_LIST.map(t => {
          const cfg = TYPE_CFG[t]; const active = activeTypes.has(t);
          return (
            <button key={t} onClick={() => toggle(t)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
              <span className="flex-1 text-left">{cfg.label}</span>
              {active && <CheckCircle2 className="w-3 h-3" />}
            </button>
          );
        })}
        {activeTypes.size > 0 && (
          <button onClick={() => TYPE_LIST.forEach(t => activeTypes.has(t) && toggle(t))}
            className="w-full text-xs text-red-500 hover:text-red-600 text-right px-2 pt-2 mt-1 border-t border-slate-100">Effacer</button>
        )}
      </div>
    </>
  );
}

function MarquePFilterDropdown({ activeMarques, toggle, onClose }: {
  activeMarques: Set<MarqueP>; toggle: (m: MarqueP) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute left-0 top-full mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[240px]">
        {MARQUE_P_LIST.map(m => {
          const cfg = MARQUE_P_CFG[m]; const active = activeMarques.has(m);
          return (
            <button key={m} onClick={() => toggle(m)} title={cfg.title}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${active ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{cfg.label}</span>
              <span className="flex-1 text-left">{cfg.title}</span>
              {active && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
            </button>
          );
        })}
        {activeMarques.size > 0 && (
          <button onClick={() => MARQUE_P_LIST.forEach(m => activeMarques.has(m) && toggle(m))}
            className="w-full text-xs text-red-500 hover:text-red-600 text-right px-2 pt-2 mt-1 border-t border-slate-100">Effacer</button>
        )}
      </div>
    </>
  );
}

function StatutFilterDropdown({ activeStatuts, toggle, onClose }: {
  activeStatuts: Set<StatutContrat>; toggle: (s: StatutContrat) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute left-0 top-full mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[180px]">
        {STATUT_LIST.map(s => {
          const cfg = STATUT_CFG[s]; const active = activeStatuts.has(s);
          return (
            <button key={s} onClick={() => toggle(s)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border ${cfg.border}` : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />{cfg.label}
              {active && <CheckCircle2 className="w-3 h-3 ml-auto" />}
            </button>
          );
        })}
        {activeStatuts.size > 0 && (
          <button onClick={() => STATUT_LIST.forEach(s => activeStatuts.has(s) && toggle(s))}
            className="w-full text-xs text-red-500 hover:text-red-600 text-right px-2 pt-2 mt-1 border-t border-slate-100">Effacer</button>
        )}
      </div>
    </>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

function ContratRowComp({ contrat, visibleCols, colWidths, isOdd, residenceIds, allResidences, equipCategories }: {
  contrat: ContratRow; visibleCols: string[]; colWidths: Record<string, number>; isOdd: boolean;
  residenceIds?: string[]; allResidences?: Residence[]; equipCategories?: string[];
}) {
  const statut    = STATUT_CFG[contrat.statut]     ?? STATUT_CFG.actif;
  const typeCfg   = TYPE_CFG[contrat.type_contrat]  ?? TYPE_CFG.autre;
  const marqueCfg = MARQUE_P_CFG[contrat.marque_p];
  const criticite = CRITICITE_CFG[contrat.criticite];
  const daysFin   = daysUntil(contrat.date_fin);
  const daysEch   = daysUntil(contrat.prochaine_echeance);
  const ratio     = contrat.montant_annuel > 0 ? contrat.couts_imputes / contrat.montant_annuel : 0;

  return (
    <tr className={`group transition-colors hover:bg-blue-50/40 border-b border-slate-100 ${isOdd ? 'bg-white' : 'bg-slate-50/50'}`}>
      {visibleCols.map(colId => {
        const w = colWidths[colId] ?? 160;
        switch (colId) {
          case 'contrat':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-lg leading-none flex-shrink-0 mt-0.5">{contrat.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate leading-snug">{contrat.intitule}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{contrat.reference}</p>
                  </div>
                </div>
              </td>
            );
          case 'type':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2">
                <div className="space-y-1">
                  <span title={marqueCfg.title}
                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border ${marqueCfg.bg} ${marqueCfg.color} ${marqueCfg.border} cursor-default`}>
                    {marqueCfg.label}
                  </span>
                  <div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                      {typeCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <PrestLogo name={contrat.prestataire} />
                    <span className="text-[10px] text-slate-500 truncate">{contrat.prestataire}</span>
                  </div>
                </div>
              </td>
            );
          case 'periode':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2">
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 w-8 flex-shrink-0 text-[10px]">Début</span>
                    <span className="font-medium">{fmt(contrat.date_debut)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 w-8 flex-shrink-0 text-[10px]">Fin</span>
                    <span className={`font-medium ${daysFin < 0 ? 'text-red-600' : daysFin < 90 ? 'text-amber-600' : ''}`}>{fmt(contrat.date_fin)}</span>
                  </div>
                </div>
              </td>
            );
          case 'echeances':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <RefreshCw className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">
                      {contrat.reconduction === 'tacite' ? 'Tacite' : contrat.reconduction === 'expresse' ? 'Expresse' : 'Sans reconduction'}
                    </span>
                    {contrat.preavis_mois > 0 && <span className="text-[10px] text-slate-400">· {contrat.preavis_mois}m</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                    <span className="text-[10px] text-slate-500 mr-0.5">Proch. éch.</span>
                    {daysEch < 0
                      ? <span className="text-[10px] font-medium text-red-600 flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" />Dépassée</span>
                      : daysEch < 90
                        ? <span className="text-[10px] font-medium text-amber-600">{fmt(contrat.prochaine_echeance)} ({daysEch}j)</span>
                        : <span className="text-[10px] text-slate-500">{fmt(contrat.prochaine_echeance)}</span>
                    }
                  </div>
                </div>
              </td>
            );
          case 'budget':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-slate-400">Annuel</span>
                    <span className="text-xs font-semibold text-slate-800">{fmtCurrency(contrat.montant_annuel)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-slate-400">Imputé</span>
                    <span className={`text-[11px] font-medium ${ratio > 1 ? 'text-red-600' : 'text-slate-600'}`}>
                      {fmtCurrency(contrat.couts_imputes)}
                    </span>
                  </div>
                  {contrat.montant_annuel > 0 && (
                    <div className="flex items-center gap-1 pt-0.5">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${ratio > 1 ? 'bg-red-400' : ratio > 0.85 ? 'bg-amber-400' : 'bg-blue-400'}`}
                          style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                      </div>
                      <span className={`text-[9px] font-medium ${ratio > 1 ? 'text-red-600' : 'text-slate-400'}`}>
                        {Math.round(ratio * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </td>
            );
          case 'performance':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2">
                <div className="space-y-1.5">
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Activity className="w-2.5 h-2.5 text-slate-400" />
                      <span className="text-[10px] text-slate-400">Réactivité</span>
                    </div>
                    <ScoreBar value={contrat.reactivity_score}
                      color={contrat.reactivity_score >= 90 ? 'bg-emerald-400' : contrat.reactivity_score >= 70 ? 'bg-amber-400' : 'bg-red-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-slate-400" />
                      <span className="text-[10px] text-slate-400">Taux réal.</span>
                    </div>
                    <ScoreBar value={contrat.taux_realisation}
                      color={contrat.taux_realisation >= 95 ? 'bg-emerald-400' : contrat.taux_realisation >= 80 ? 'bg-amber-400' : 'bg-red-400'} />
                  </div>
                  {contrat.nb_non_conformites > 0 ? (
                    <div className="flex items-center gap-1">
                      <XCircle className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
                      <span className="text-[10px] font-medium text-red-600">
                        {contrat.nb_non_conformites} Non-conforme{contrat.nb_non_conformites > 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-[10px] text-emerald-600">Aucune non-conformité</span>
                    </div>
                  )}
                </div>
              </td>
            );
          case 'statut':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2">
                <div className="space-y-1.5">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statut.bg} ${statut.text} ${statut.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} />{statut.label}
                  </span>
                  <div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${criticite.bg} ${criticite.color} ${criticite.border}`}>
                      <Star className="w-2 h-2" />{criticite.label}
                    </span>
                  </div>
                </div>
              </td>
            );
          case 'localisation':
            return (
              <td key={colId} style={{ width: w, minWidth: w }} className="px-3 py-2 align-top">
                {residenceIds && allResidences
                  ? <LocalisationCell
                      residenceIds={residenceIds}
                      allResidences={allResidences}
                      categories={equipCategories}
                    />
                  : <span className="text-[11px] text-slate-400">—</span>
                }
              </td>
            );
          default:
            return <td key={colId} style={{ width: w }} className="px-3 py-2" />;
        }
      })}
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ContratWithLocalisation extends ContratRow {
  residences?: string[]; // residence ids
}

interface Props {
  context?:           'site' | 'logement' | 'equipement';
  contrats?:          ContratWithLocalisation[];
  allResidences?:     Residence[];
  contratCategories?: Record<string, string[]>; // contratId → catégories équipements
  showLocalisation?:  boolean;
}

export default function ContratsTableau({
  context = 'site',
  contrats: propContrats,
  allResidences,
  contratCategories,
  showLocalisation = false,
}: Props) {
  const data = propContrats ?? buildMockContrats(context);

  const allCols        = showLocalisation ? BASE_COLS : COLS_WITHOUT_LOCALISATION;
  const defaultVisible = showLocalisation ? DEFAULT_VISIBLE_BASE : DEFAULT_VISIBLE_NO_LOC;

  const [visibleCols,      setVisibleCols]      = useState<string[]>(defaultVisible);
  const [colWidths,        setColWidths]        = useState<Record<string, number>>(
    Object.fromEntries(allCols.map(c => [c.id, c.defaultWidth]))
  );
  const [sortKey,          setSortKey]          = useState<string | null>('periode');
  const [sortDir,          setSortDir]          = useState<'asc' | 'desc'>('asc');
  const [sortOption,       setSortOption]       = useState('date_fin_asc');
  const [activeTypes,      setActiveTypes]      = useState<Set<TypeContrat>>(new Set());
  const [activeMarques,    setActiveMarques]    = useState<Set<MarqueP>>(new Set());
  const [activeStatuts,    setActiveStatuts]    = useState<Set<StatutContrat>>(new Set());
  const [search,           setSearch]           = useState('');
  const [showSettings,     setShowSettings]     = useState(false);
  const [showTypeFilter,   setShowTypeFilter]   = useState(false);
  const [showMarqueFilter, setShowMarqueFilter] = useState(false);
  const [showStatutFilter, setShowStatutFilter] = useState(false);

  const handleSort = (id: string) => {
    if (sortKey === id) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(id); setSortDir('asc'); }
  };

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = allCols.find(c => c.id === id);
      const cur = prev[id] ?? col?.defaultWidth ?? 160;
      return { ...prev, [id]: Math.max(col?.minWidth ?? 80, cur + delta) };
    });
  }, [allCols]);

  const toggleType   = (t: TypeContrat)   => setActiveTypes(s   => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const toggleMarque = (m: MarqueP)       => setActiveMarques(s => { const n = new Set(s); n.has(m) ? n.delete(m) : n.add(m); return n; });
  const toggleStatut = (s: StatutContrat) => setActiveStatuts(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.intitule.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q) ||
        r.prestataire.toLowerCase().includes(q)
      );
    }
    if (activeTypes.size   > 0) rows = rows.filter(r => activeTypes.has(r.type_contrat));
    if (activeMarques.size > 0) rows = rows.filter(r => activeMarques.has(r.marque_p));
    if (activeStatuts.size > 0) rows = rows.filter(r => activeStatuts.has(r.statut));

    const key = sortKey ?? 'periode';
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      switch (key) {
        case 'contrat':  return dir * a.intitule.localeCompare(b.intitule, 'fr');
        case 'type':     return dir * a.type_contrat.localeCompare(b.type_contrat, 'fr');
        case 'periode':  return dir * (new Date(a.date_fin).getTime() - new Date(b.date_fin).getTime());
        case 'budget':   return dir * (a.montant_annuel - b.montant_annuel);
        case 'statut':   return dir * a.statut.localeCompare(b.statut, 'fr');
        default:         return 0;
      }
    });
    return rows;
  }, [data, search, activeTypes, activeMarques, activeStatuts, sortKey, sortDir]);

  const stats = useMemo(() => ({
    total:       data.length,
    actifs:      data.filter(r => r.statut === 'actif').length,
    alertes:     data.filter(r => daysUntil(r.prochaine_echeance) < 90 && r.statut === 'actif').length,
    budgetTotal: data.reduce((s, r) => s + r.montant_annuel, 0),
  }), [data]);

  const totalTableWidth = visibleCols.reduce((s, id) => s + (colWidths[id] ?? 160), 0);

  const closeAllFilters = () => { setShowTypeFilter(false); setShowMarqueFilter(false); setShowStatutFilter(false); };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher contrat, prestataire…"
            className="w-full pl-7 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="w-3 h-3" /></button>}
        </div>

        {/* Type filter */}
        <div className="relative flex-shrink-0">
          <button onClick={() => { closeAllFilters(); setShowTypeFilter(v => !v); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all
              ${activeTypes.size > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Tag className="w-3 h-3" /> Type
            {activeTypes.size > 0 && <span className="bg-blue-600 text-white text-[9px] px-1 rounded-full">{activeTypes.size}</span>}
          </button>
          {showTypeFilter && <TypeFilterDropdown activeTypes={activeTypes} toggle={toggleType} onClose={() => setShowTypeFilter(false)} />}
        </div>

        {/* Marché P filter */}
        <div className="relative flex-shrink-0">
          <button onClick={() => { closeAllFilters(); setShowMarqueFilter(v => !v); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all
              ${activeMarques.size > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <BarChart3 className="w-3 h-3" /> Marché
            {activeMarques.size > 0 && <span className="bg-blue-600 text-white text-[9px] px-1 rounded-full">{activeMarques.size}</span>}
          </button>
          {showMarqueFilter && <MarquePFilterDropdown activeMarques={activeMarques} toggle={toggleMarque} onClose={() => setShowMarqueFilter(false)} />}
        </div>

        {/* Statut filter */}
        <div className="relative flex-shrink-0">
          <button onClick={() => { closeAllFilters(); setShowStatutFilter(v => !v); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all
              ${activeStatuts.size > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <ShieldCheck className="w-3 h-3" /> Statut
            {activeStatuts.size > 0 && <span className="bg-blue-600 text-white text-[9px] px-1 rounded-full">{activeStatuts.size}</span>}
          </button>
          {showStatutFilter && <StatutFilterDropdown activeStatuts={activeStatuts} toggle={toggleStatut} onClose={() => setShowStatutFilter(false)} />}
        </div>

        {(activeTypes.size > 0 || activeMarques.size > 0 || activeStatuts.size > 0) && (
          <button onClick={() => { setActiveTypes(new Set()); setActiveMarques(new Set()); setActiveStatuts(new Set()); }}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 flex-shrink-0">
            <X className="w-3 h-3" /> Effacer filtres
          </button>
        )}

        {/* Stats + settings */}
        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{stats.actifs} actif{stats.actifs > 1 ? 's' : ''}
            </span>
            {stats.alertes > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="w-3 h-3" />{stats.alertes} alerte{stats.alertes > 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Banknote className="w-3 h-3" />{fmtCurrency(stats.budgetTotal)}/an
            </span>
          </div>
          <span className="text-xs text-slate-400">{filtered.length}/{stats.total}</span>
          <button onClick={() => setShowSettings(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all
              ${showSettings ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Settings2 className="w-3.5 h-3.5" /> Colonnes
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="border-collapse" style={{ width: totalTableWidth, minWidth: '100%' }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {visibleCols.map(colId => {
                const col = allCols.find(c => c.id === colId); if (!col) return null;
                return (
                  <ResizableTh key={colId} col={col} width={colWidths[colId] ?? col.defaultWidth}
                    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onResize={handleResize}>
                    {col.label}
                  </ResizableTh>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length} className="px-4 py-16 text-center text-sm text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  Aucun contrat trouvé
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <ContratRowComp key={c.id} contrat={c} visibleCols={visibleCols}
                  colWidths={colWidths} isOdd={i % 2 === 0}
                  residenceIds={(c as ContratWithLocalisation).residences}
                  allResidences={allResidences}
                  equipCategories={contratCategories?.[c.id]}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showSettings && (
        <SettingsSidebar
          allCols={allCols}
          visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          sortOption={sortOption}
          setSortOption={(v) => {
            setSortOption(v);
            const isAsc = v.endsWith('_asc');
            const key   = isAsc ? v.slice(0, -4) : v.slice(0, -5);
            setSortKey(key); setSortDir(isAsc ? 'asc' : 'desc');
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
