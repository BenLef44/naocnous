import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Search, X, ChevronDown, ChevronRight, Timer, Settings2,
  Eye, EyeOff, Pin, PinOff, GripVertical, ArrowRight,
  Paperclip, Image, Mail, MapPin, MoreHorizontal, Plus, Trash2,
  SlidersHorizontal, ArrowUpDown, Hash, AlignLeft, Building2,
  User, CalendarDays, AlertTriangle, Activity, Zap, List,
  DollarSign, Calendar, Contact, CheckCheck, BookOpen,
  ArrowRightLeft, Layers, Ban, UserCheck, ShieldCheck, Wrench, Tag, Clock,
  Pencil, Droplets, Flame, Lock, Hammer, Monitor, ShieldAlert, Snowflake, Wind, Home, Paintbrush,
} from 'lucide-react';
import {
  CRITICITE_CFG, STATUT_DI_CFG, CANAL_CFG, CATEGORIES_DI,
  type DemandeParsed, type StatutDI, type CriticiteDI,
  fmtDateFR, fmtDateRelative, isSlaBreached, slaRemainingLabel,
} from './interventionsTypes';
import { calcCompleteness } from './completenessScore';
import {
  ListDropdown, ListFilterBtn, SitePicker, EquipPicker, CatDIPicker,
  DemandeurPicker, PeriodePicker,
  periodeRange, periodeLabel, EMPTY_PERIODE,
  type PeriodeFilter,
} from './listFilters';
import AssigneeFilterPanel, { type AssigneeSelection, EQUIPES } from '../reglementaire/AssigneeFilterPanel';
import logoCrous from '../../assets/logo-crous-lyon-resize.png';
/* @vite-ignore */
const logoMaResidence = new URL('../../assets/Logo-Ma-Résidence copy copy.png', import.meta.url).href;
import { AttachmentsModal, PhotosModal, EmailsModal } from './AttachmentsModals';
import { DemandeDetailModal } from './DemandeDetailModal';
import { AssigneSidecar } from './AssigneSidecar';
import PriseEnChargeModal from './PriseEnChargeModal';
import { supabase } from '../../lib/supabase';

// ─── Reference formatter ──────────────────────────────────────────────────────

function formatReference(ref: string, created_at: string): string {
  const d = new Date(created_at);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const jj = String(d.getDate()).padStart(2, '0');
  const match = ref.match(/(\d+)$/);
  const seq = match ? String(parseInt(match[1])).padStart(3, '0') : '001';
  return `Ti.${yy}${mm}${jj}-${seq}`;
}

// ─── Agent / org data ─────────────────────────────────────────────────────────

const AGENT_PHOTOS: Record<string, string> = {
  'Martin D.':  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Leroy P.':   'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Bernard C.': 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Laurent E.': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Michel G.':  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Dupont A.':  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Moreau F.':  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Simon B.':   'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
};

const AGENT_FONCTIONS: Record<string, string> = {
  'Martin D.':  'Plombier',
  'Leroy P.':   'Électricien',
  'Bernard C.': 'Chauffagiste',
  'Laurent E.': 'Serruriste',
  'Michel G.':  'Agent polyvalent',
  'Dupont A.':  'Technicien sécurité',
  'Moreau F.':  'Gestionnaire patrimoine',
  'Simon B.':   'Administratif',
};

const PRESTATAIRE_CATEGORIES: Record<string, string> = {
  'Atmeo':                    'Maintenance curative',
  'Thermocom':                'Chauffage / CVC',
  'Sabeko':                   'Maintenance curative',
  'MSI':                      'Maintenance curative',
  'Sauvignet':                'Électricité',
  'Sauvignet Élec.':          'Électricité',
  'APAVE':                    'Contrôle réglementaire',
  'SOCOTEC':                  'Bureau de contrôle',
  'DEKRA':                    'Contrôle réglementaire',
  'Bureau Veritas':           'Contrôle réglementaire',
  'QUALICONSULT':             'Contrôle réglementaire',
  'SGS':                      'Contrôle réglementaire',
  'Alpes Contrôles':          'Contrôle réglementaire',
  'SOCOTEC Diagnostic':       'Diagnostic',
  'Bureau Alliance Contrôle': 'Contrôle réglementaire',
  'Acritec':                  'Contrôle réglementaire',
  'Plomberie Martin':         'Plomberie',
  'Électricité Dupont':       'Électricité',
  'Otis Ascenseurs':          'Ascenseurs',
  'Thermidor CVC':            'Chauffage / CVC',
};

// ─── Category icon map ────────────────────────────────────────────────────────

const CAT_ICON_MAP: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  plomberie:         { icon: Droplets,   label: 'Plomberie',           color: 'text-blue-600',   bg: 'bg-blue-50'   },
  electricite:       { icon: Zap,        label: 'Électricité',         color: 'text-yellow-600', bg: 'bg-yellow-50' },
  chauffage:         { icon: Flame,      label: 'Chauffage / CVC',     color: 'text-orange-600', bg: 'bg-orange-50' },
  serrurerie:        { icon: Lock,       label: 'Serrurerie',          color: 'text-slate-600',  bg: 'bg-slate-100' },
  menuiserie:        { icon: Hammer,     label: 'Menuiserie',          color: 'text-amber-600',  bg: 'bg-amber-50'  },
  electromenager:    { icon: Monitor,    label: 'Électroménager',      color: 'text-violet-600', bg: 'bg-violet-50' },
  nettoyage:         { icon: Paintbrush, label: 'Nettoyage',           color: 'text-teal-600',   bg: 'bg-teal-50'   },
  securite_incendie: { icon: ShieldAlert,label: 'Sécurité incendie',   color: 'text-red-600',    bg: 'bg-red-50'    },
  ascenseur:         { icon: ArrowUpDown,label: 'Ascenseur',           color: 'text-indigo-600', bg: 'bg-indigo-50' },
  froid:             { icon: Snowflake,  label: 'Froid',               color: 'text-cyan-600',   bg: 'bg-cyan-50'   },
  vmc:               { icon: Wind,       label: 'VMC / Ventilation',   color: 'text-sky-600',    bg: 'bg-sky-50'    },
  toiture:           { icon: Home,       label: 'Toiture',             color: 'text-stone-600',  bg: 'bg-stone-100' },
  peinture:          { icon: Paintbrush, label: 'Peinture',            color: 'text-pink-600',   bg: 'bg-pink-50'   },
};

function fakeAttachments(ref: string) {
  let h = 0;
  for (let i = 0; i < ref.length; i++) h = (Math.imul(31, h) + ref.charCodeAt(i)) | 0;
  const total = Math.abs(h) % 5;
  const photos = Math.abs(h >> 3) % (total + 1);
  const emails = Math.abs(h >> 6) % 4;
  return { total, photos, emails };
}

export type ColKey =
  | 'reference' | 'titre' | 'localisation' | 'assigne' | 'date_signalement'
  | 'priorite' | 'statut' | 'actions'
  | 'criticite' | 'canal' | 'categorie' | 'cout' | 'date_planifiee' | 'demandeur'
  | 'completude';

interface ColDef {
  key: ColKey;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  width: number;
  visible: boolean;
  pinned: boolean;
  editable: boolean;
}

const COL_ICONS: Record<ColKey, React.ElementType> = {
  reference:        Hash,
  titre:            AlignLeft,
  localisation:     Building2,
  assigne:          User,
  date_signalement: CalendarDays,
  priorite:         AlertTriangle,
  statut:           Activity,
  actions:          Zap,
  criticite:        AlertTriangle,
  canal:            ArrowRightLeft,
  categorie:        List,
  cout:             DollarSign,
  date_planifiee:   Calendar,
  demandeur:        Contact,
  completude:       ShieldCheck,
};

const DEFAULT_COLS: ColDef[] = [
  { key: 'reference',        label: 'Référence',        icon: COL_ICONS.reference,        width: 120, visible: true,  pinned: true,  editable: false },
  { key: 'titre',            label: 'Libellé',          icon: COL_ICONS.titre,            sublabel: 'Catégorie(s) · Canal', width: 240, visible: true,  pinned: false, editable: true  },
  { key: 'localisation',     label: 'Localisation',     icon: COL_ICONS.localisation,     sublabel: 'et Catégorie',  width: 200, visible: true,  pinned: false, editable: false },
  { key: 'assigne',          label: 'Assigné à',        icon: COL_ICONS.assigne,          sublabel: 'et compétences', width: 170, visible: true,  pinned: false, editable: false },
  { key: 'date_signalement', label: 'Date signalement', icon: COL_ICONS.date_signalement, sublabel: 'et délais',      width: 120, visible: true,  pinned: false, editable: false },
  { key: 'priorite',         label: 'Priorité',         icon: COL_ICONS.priorite,         width: 120, visible: true,  pinned: false, editable: false },
  { key: 'statut',           label: 'Statut',           icon: COL_ICONS.statut,           width: 170, visible: true,  pinned: false, editable: false },
  { key: 'actions',          label: 'Actions',          icon: COL_ICONS.actions,          width: 46,  visible: true,  pinned: false, editable: false },
  { key: 'criticite',        label: 'Criticité',        icon: COL_ICONS.criticite,        width: 120, visible: false, pinned: false, editable: false },
  { key: 'canal',            label: 'Canal',            icon: COL_ICONS.canal,            width: 120, visible: false, pinned: false, editable: false },
  { key: 'categorie',        label: 'Catégorie',        icon: COL_ICONS.categorie,        width: 140, visible: false, pinned: false, editable: false },
  { key: 'cout',             label: 'Coût',             icon: COL_ICONS.cout,             width: 100, visible: false, pinned: false, editable: false },
  { key: 'date_planifiee',   label: 'Date planifiée',   icon: COL_ICONS.date_planifiee,   width: 130, visible: false, pinned: false, editable: false },
  { key: 'demandeur',        label: 'Demandeur',        icon: COL_ICONS.demandeur,        width: 150, visible: false, pinned: false, editable: false },
  { key: 'completude',       label: 'Complétude',       icon: COL_ICONS.completude,       width: 110, visible: false, pinned: false, editable: false },
];

const COLOR_MAP: Partial<Record<ColKey, string>> = {
  reference: 'bg-blue-500', titre: 'bg-emerald-500', localisation: 'bg-orange-400',
  assigne: 'bg-cyan-500', date_signalement: 'bg-amber-500', priorite: 'bg-red-400',
  statut: 'bg-violet-500', actions: 'bg-slate-400',
  criticite: 'bg-red-500', canal: 'bg-sky-500', categorie: 'bg-teal-500',
  cout: 'bg-emerald-600', date_planifiee: 'bg-amber-600', demandeur: 'bg-pink-400',
  completude: 'bg-blue-600',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  demandes: DemandeParsed[];
  onSelectDemande: (d: DemandeParsed) => void;
  onModifier?: (d: DemandeParsed) => void;
  onSupprimerBrouillon?: (d: DemandeParsed) => void;
  initialStatuts?: StatutDI[];
  initialCriticite?: CriticiteDI[];
  initialRetard?: boolean;
  newlyCreatedId?: string | null;
  onRefresh?: () => void;
}

const CRITICITE_ORDER: Record<CriticiteDI, number> = { critique: 0, haute: 1, moyenne: 2, faible: 3 };
const STATUT_ORDER_MAP: Partial<Record<StatutDI, number>> = {
  nouveau: 0, a_qualifier: 1, qualifie: 2, affecte: 3, en_intervention: 4,
  en_attente_validation: 5, resolu: 6, cloture: 7, rejete: 8,
};

type SortDir = 'asc' | 'desc';
interface SortLevel { col: string; dir: SortDir; }

const SORT_COL_OPTIONS = [
  { value: 'created_at',       label: 'Date signalement' },
  { value: 'criticite',        label: 'Criticité / Priorité' },
  { value: 'statut_demande',   label: 'Statut' },
  { value: 'reference',        label: 'Référence' },
  { value: 'titre',            label: 'Libellé' },
  { value: 'date_planifiee',   label: 'Date planifiée' },
];

// ─── Action menu ──────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { key: 'prise_en_charge', label: 'Prendre en charge',  icon: Zap,           color: 'text-blue-600'    },
  { key: 'modifier',        label: 'Modifier',            icon: Pencil,        color: 'text-slate-600'   },
  { key: 'valider',         label: 'Valider',             icon: CheckCheck,    color: 'text-emerald-600' },
  { key: 'etude',           label: "Mettre à l'étude",    icon: BookOpen,      color: 'text-blue-600'    },
  { key: 'transferer',      label: 'Transférer',          icon: ArrowRightLeft, color: 'text-cyan-600'   },
  { key: 'regrouper',       label: 'Regrouper',           icon: Layers,        color: 'text-amber-600'   },
  { key: 'refuser',         label: 'Refuser',             icon: Ban,           color: 'text-red-600'     },
  { key: 'assign_rapide',   label: 'Assignation rapide',  icon: UserCheck,     color: 'text-slate-600'   },
];

function ActionMenu({ onSelect, isDraft }: { onSelect: (key: string) => void; isDraft?: boolean }) {
  const [open, setOpen] = useState(false);
  const actions = isDraft
    ? [
        { key: 'modifier',   label: 'Reprendre',        icon: Pencil,  color: 'text-blue-600' },
        { key: 'supprimer',  label: 'Supprimer',         icon: Trash2,  color: 'text-red-600'  },
      ]
    : QUICK_ACTIONS;
  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        title="Actions">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-48 overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {actions.map(a => {
              const Icon = a.icon;
              return (
                <button key={a.key} onClick={() => { onSelect(a.key); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${a.color}`}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function CellReference({ d }: { d: DemandeParsed }) {
  return (
    <span className="font-mono text-[11px] text-slate-600 font-bold tracking-tight">
      {formatReference(d.reference, d.created_at)}
    </span>
  );
}

function CellTitre({ d, onClickTitle, onClickAttachments, onClickPhotos, onClickEmails }: {
  d: DemandeParsed;
  onClickTitle: () => void;
  onClickAttachments: () => void;
  onClickPhotos: () => void;
  onClickEmails: () => void;
}) {
  const cat = CATEGORIES_DI.find(c => c.key === d.type_intervention);
  const atts = fakeAttachments(d.reference);
  const isMaRes = d.canal_source === 'my_residence';

  return (
    <div className="min-w-0">
      <button
        onClick={e => { e.stopPropagation(); onClickTitle(); }}
        className="text-xs font-semibold text-slate-800 leading-tight hover:text-blue-600 hover:underline text-left transition-colors">
        {d.titre}
      </button>

      {/* Category badge */}
      {cat && (
        <div className="mt-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="text-sm leading-none">{cat.icon}</span>
            {cat.label}
          </span>
        </div>
      )}

      {/* Canal badge */}
      <div className="mt-1.5">
        {isMaRes ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 border border-red-100">
            <img src={logoMaResidence} alt="Ma Résidence" className="w-5 h-5 rounded object-cover flex-shrink-0" />
            <span className="text-[11px] font-bold text-red-700">Ma Résidence</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <img src={logoCrous} alt="CROUS" className="w-5 h-5 rounded object-contain flex-shrink-0" />
            <span className="text-[11px] font-bold text-slate-600">Interne CROUS</span>
          </span>
        )}
      </div>

      {/* Attachments / photos / emails — clickable */}
      {(atts.total > 0 || atts.photos > 0 || atts.emails > 0) && (
        <div className="flex items-center gap-3 mt-1.5">
          {atts.total > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onClickAttachments(); }}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium hover:text-blue-600 hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
              title="Voir les pièces jointes">
              <Paperclip className="w-3.5 h-3.5" />{atts.total}
            </button>
          )}
          {atts.photos > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onClickPhotos(); }}
              className="inline-flex items-center gap-1 text-[11px] text-blue-500 font-medium hover:text-blue-700 hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
              title="Voir les photos">
              <Image className="w-3.5 h-3.5" />{atts.photos}
            </button>
          )}
          {atts.emails > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onClickEmails(); }}
              className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium hover:text-amber-700 hover:bg-amber-50 rounded px-1 py-0.5 transition-colors"
              title="Voir les emails">
              <Mail className="w-3.5 h-3.5" />{atts.emails}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CellLocalisation({ d }: { d: DemandeParsed }) {
  const parts = [d.site_nom, d.residence_nom, d.localisation_detail].filter(Boolean);
  const cat = CAT_ICON_MAP[d.categorie ?? ''] ?? { icon: Wrench, label: d.categorie ?? 'Autre', color: 'text-slate-500', bg: 'bg-slate-100' };
  const CatIcon = cat.icon;
  return (
    <div className="min-w-0">
      <div className="flex items-start gap-1">
        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
        <span className="text-xs text-slate-700 leading-tight break-words whitespace-normal">
          {parts.join(' › ') || '—'}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className={`w-10 h-8 rounded-md flex items-center justify-center flex-shrink-0 border border-slate-200 ${cat.bg}`}>
          <CatIcon className={`w-4 h-4 ${cat.color}`} />
        </div>
        <span className={`text-xs font-semibold truncate ${cat.color}`}>{cat.label}</span>
      </div>
    </div>
  );
}

function CellAssigne({ d, onClickAssigne }: { d: DemandeParsed; onClickAssigne: () => void }) {
  const isAgent = !!d.agent;
  const label = d.agent ?? d.prestataire;
  if (!label) return <span className="text-slate-300 text-xs">—</span>;

  const sous = isAgent
    ? (AGENT_FONCTIONS[label] ?? 'Agent')
    : (PRESTATAIRE_CATEGORIES[label] ?? 'Prestataire');

  const photo = isAgent ? AGENT_PHOTOS[label] : null;

  return (
    <button
      onClick={e => { e.stopPropagation(); onClickAssigne(); }}
      className="flex items-center gap-2 min-w-0 w-full text-left hover:bg-slate-50 rounded-lg px-1 py-0.5 -mx-1 transition-colors group">
      {photo ? (
        <img src={photo} alt={label} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200 shadow-sm group-hover:border-blue-300 transition-colors" />
      ) : (
        <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 border border-slate-200 group-hover:border-blue-300 transition-colors">
          {label.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{label}</p>
        <p className="text-[10px] text-slate-400 truncate">{sous}</p>
      </div>
    </button>
  );
}

function CellDateSignalement({ d }: { d: DemandeParsed }) {
  const breached = isSlaBreached(d);
  return (
    <div>
      <p className="text-xs text-slate-700 font-medium">{fmtDateFR(d.created_at)}</p>
      <p className="text-[10px] text-slate-400">{fmtDateRelative(d.created_at)}</p>
      <p className={`text-[10px] font-semibold mt-0.5 ${breached ? 'text-red-600' : 'text-emerald-600'}`}>
        {slaRemainingLabel(d)}
      </p>
    </div>
  );
}

function CellPriorite({ d }: { d: DemandeParsed }) {
  const cfg = CRITICITE_CFG[d.criticite];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full w-full justify-center ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className="text-sm leading-none">{cfg.icon}</span>{cfg.label}
    </span>
  );
}

const STATUT_FLOW: StatutDI[] = [
  'nouveau', 'a_qualifier', 'qualifie', 'affecte',
  'en_intervention', 'en_attente_validation', 'resolu', 'cloture',
];

function CellStatut({ d, onChanged }: { d: DemandeParsed; onChanged: (id: string, s: StatutDI) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUT_DI_CFG[d.statut_demande];

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  async function select(s: StatutDI) {
    if (s === d.statut_demande) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);
    const { error } = await supabase
      .from('interventions')
      .update({ statut_demande: s })
      .eq('id', d.id);
    if (!error) {
      await supabase.from('historique_intervention').insert([{
        intervention_id: d.id,
        type_evenement: s,
        description: `Statut changé en "${STATUT_DI_CFG[s].label}"`,
        auteur: 'Utilisateur',
      }]);
      onChanged(d.id, s);
    }
    setSaving(false);
  }

  const choices = d.statut_demande === 'rejete' ? [] : [
    ...STATUT_FLOW,
    'rejete' as StatutDI,
  ];

  return (
    <div ref={ref} className="relative w-full" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => !saving && setOpen(v => !v)}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full w-full justify-center border transition-all ${cfg.bg} ${cfg.text} ${cfg.border} ${saving ? 'opacity-60 cursor-wait' : 'hover:opacity-80 cursor-pointer'}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
        {!saving && <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 min-w-[160px] bg-white border border-slate-200 rounded-xl shadow-lg py-1 overflow-hidden">
          {choices.map(s => {
            const c = STATUT_DI_CFG[s];
            const isCurrent = s === d.statut_demande;
            return (
              <button
                key={s}
                onClick={() => select(s)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-left transition-colors ${
                  isCurrent ? `${c.bg} ${c.text}` : 'hover:bg-slate-50 text-slate-700'
                }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                {c.label}
                {isCurrent && <CheckCheck className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CellCriticite({ d }: { d: DemandeParsed }) {
  const cfg = CRITICITE_CFG[d.criticite];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function CellCanal({ d }: { d: DemandeParsed }) {
  const cfg = CANAL_CFG[d.canal_source];
  return <span className="text-xs text-slate-600">{cfg.icon} {cfg.label}</span>;
}

function CellCategorie({ d }: { d: DemandeParsed }) {
  const cat = CATEGORIES_DI.find(c => c.key === d.type_intervention);
  return <span className="text-xs text-slate-600">{cat ? `${cat.icon} ${cat.label}` : '—'}</span>;
}

function CellCout({ d }: { d: DemandeParsed }) {
  return <span className="text-xs text-slate-700 font-semibold">{d.cout != null ? `${d.cout.toLocaleString('fr-FR')} €` : '—'}</span>;
}

function CellDatePlanifiee({ d }: { d: DemandeParsed }) {
  return <span className="text-xs text-slate-600">{d.date_planifiee ? fmtDateFR(d.date_planifiee) : '—'}</span>;
}

function CellDemandeur({ d }: { d: DemandeParsed }) {
  return <span className="text-xs text-slate-600 truncate">{d.demandeur_nom ?? '—'}</span>;
}

function CellCompletude({ d }: { d: DemandeParsed }) {
  const attachments = fakeAttachments(d.reference);
  const { score, status } = calcCompleteness(d, attachments.total);
  const dotColor =
    status === 'complete'     ? 'bg-emerald-500' :
    status === 'recommended'  ? 'bg-amber-500' :
                                'bg-red-500';
  const textColor =
    status === 'complete'     ? 'text-emerald-700' :
    status === 'recommended'  ? 'text-amber-700' :
                                'text-red-600';
  const trackColor =
    status === 'complete'     ? 'bg-emerald-100' :
    status === 'recommended'  ? 'bg-amber-100' :
                                'bg-red-100';
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className={`text-xs font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className={`w-full h-1 rounded-full overflow-hidden ${trackColor}`}>
        <div
          className={`h-full rounded-full ${dotColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface CellCallbacks {
  onClickTitle: () => void;
  onClickAttachments: () => void;
  onClickPhotos: () => void;
  onClickEmails: () => void;
  onClickAssigne: () => void;
  onModifier: () => void;
  onSupprimerBrouillon: () => void;
  onPriseEnCharge: () => void;
  onChangeStatut: (id: string, s: StatutDI) => void;
}

function renderCell(col: ColDef, d: DemandeParsed, onSelect: () => void, cb: CellCallbacks) {
  switch (col.key) {
    case 'reference':        return <CellReference d={d} />;
    case 'titre':            return <CellTitre d={d} onClickTitle={cb.onClickTitle} onClickAttachments={cb.onClickAttachments} onClickPhotos={cb.onClickPhotos} onClickEmails={cb.onClickEmails} />;
    case 'localisation':     return <CellLocalisation d={d} />;
    case 'assigne':          return <CellAssigne d={d} onClickAssigne={cb.onClickAssigne} />;
    case 'date_signalement': return <CellDateSignalement d={d} />;
    case 'priorite':         return <CellPriorite d={d} />;
    case 'statut':           return <CellStatut d={d} onChanged={cb.onChangeStatut} />;
    case 'actions':          return <ActionMenu isDraft={d.statut_demande === 'brouillon'} onSelect={(key) => {
      if (key === 'modifier')         cb.onModifier();
      if (key === 'supprimer')        cb.onSupprimerBrouillon();
      if (key === 'prise_en_charge')  cb.onPriseEnCharge();
    }} />;
    case 'criticite':        return <CellCriticite d={d} />;
    case 'canal':            return <CellCanal d={d} />;
    case 'categorie':        return <CellCategorie d={d} />;
    case 'cout':             return <CellCout d={d} />;
    case 'date_planifiee':   return <CellDatePlanifiee d={d} />;
    case 'demandeur':        return <CellDemandeur d={d} />;
    case 'completude':       return <CellCompletude d={d} />;
    default:                 return null;
  }
}

// ─── Column header with resize, pin & sort ────────────────────────────────────

interface ColHeaderProps {
  col: ColDef;
  sortLevels: SortLevel[];
  onToggleSort: (col: ColKey) => void;
  onTogglePin: (col: ColKey) => void;
  onResize: (col: ColKey, delta: number) => void;
}

function ColHeader({ col, sortLevels, onToggleSort, onTogglePin, onResize }: ColHeaderProps) {
  const sortLevel = sortLevels.find(l => l.col === col.key);
  const sortIndex = sortLevels.findIndex(l => l.col === col.key);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const Icon = col.icon;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startW: col.width };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      onResize(col.key, ev.clientX - dragRef.current.startX);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [col.key, col.width, onResize]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-1 min-w-0">
        <Icon className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate flex-1">
          {col.label}
        </span>
        {/* Sort toggle */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSort(col.key); }}
          className={`flex-shrink-0 p-0.5 rounded transition-colors ${
            sortLevel ? 'text-blue-500 bg-blue-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
          }`}
          title={sortLevel ? `Tri actif (niveau ${sortIndex + 1})` : 'Trier'}>
          {sortLevel?.dir === 'asc' ? (
            <ChevronDown className="w-3 h-3" style={{ transform: 'rotate(180deg)' }} />
          ) : sortLevel?.dir === 'desc' ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
          {sortLevel && sortLevels.length > 1 && (
            <span className="text-[8px] font-bold leading-none">{sortIndex + 1}</span>
          )}
        </button>
        {/* Pin toggle */}
        <button
          onClick={e => { e.stopPropagation(); onTogglePin(col.key); }}
          className={`flex-shrink-0 p-0.5 rounded transition-colors ${
            col.pinned ? 'text-blue-500 bg-blue-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
          }`}
          title={col.pinned ? 'Détacher la colonne' : 'Figer la colonne'}>
          <Pin className="w-3 h-3" />
        </button>
        {/* Resize handle */}
        <div
          onMouseDown={onMouseDown}
          className="flex-shrink-0 w-1.5 h-5 cursor-col-resize flex items-center justify-center hover:bg-blue-200 rounded-sm transition-colors ml-0.5 group"
          title="Redimensionner">
          <div className="w-0.5 h-3 bg-slate-300 group-hover:bg-blue-400 rounded-full transition-colors" />
        </div>
      </div>
      {col.sublabel && (
        <span className="text-[9px] font-normal text-slate-400 normal-case tracking-normal mt-0.5 ml-4">
          {col.sublabel}
        </span>
      )}
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function AccordionSection({ title, number, icon: Icon, defaultOpen = false, children }: {
  title: string; number: string; icon?: React.ElementType; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          <span className="text-xs font-bold text-slate-600">{number}. {title}</span>
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

function SettingsPanel({
  cols, onClose, onChange, sortLevels, onSortChange,
}: {
  cols: ColDef[];
  onClose: () => void;
  onChange: (cols: ColDef[]) => void;
  sortLevels: SortLevel[];
  onSortChange: (levels: SortLevel[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const visibleCols = cols.filter(c => c.visible);

  function toggleVisible(key: ColKey) {
    onChange(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  }
  function togglePinned(key: ColKey) {
    onChange(cols.map(c => c.key === key ? { ...c, pinned: !c.pinned } : c));
  }
  function onDragStart(i: number) { setDragIdx(i); }
  function onDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverIdx(i); }
  function onDrop(i: number) {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return; }
    const next = [...cols];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onChange(next);
    setDragIdx(null); setDragOverIdx(null);
  }

  function addSortLevel() {
    onSortChange([...sortLevels, { col: 'created_at', dir: 'desc' }]);
  }
  function removeSortLevel(i: number) {
    onSortChange(sortLevels.filter((_, idx) => idx !== i));
  }
  function updateSortLevel(i: number, patch: Partial<SortLevel>) {
    onSortChange(sortLevels.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  }

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-l border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Configuration du tableau</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* 1. Attributs */}
        <AccordionSection number="1" title="Attributs" icon={GripVertical} defaultOpen={true}>
          <div className="flex border-t border-slate-100 overflow-hidden" style={{ height: 280 }}>
            {/* Left: available */}
            <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Attributs disponibles</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {cols.map(col => {
                  const Icon = col.icon;
                  return (
                    <button key={col.key} onClick={() => toggleVisible(col.key)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left border-b border-slate-50 hover:bg-blue-50/40 transition-colors group">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 truncate">{col.label}</span>
                        {col.visible && (
                          <span className="flex-shrink-0 text-[8px] font-bold px-1 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            Utilisé
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Right: selected */}
            <div className="w-36 flex flex-col overflow-hidden">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Sélect. ({visibleCols.length})
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {visibleCols.map(col => (
                  <div key={col.key} className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-50">
                    <GripVertical className="w-2.5 h-2.5 text-slate-300 flex-shrink-0" />
                    <span className="text-[11px] text-slate-700 flex-1 truncate">{col.label}</span>
                    <button onClick={() => toggleVisible(col.key)} className="p-0.5 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* 2. Ordre des colonnes */}
        <AccordionSection number="2" title="Ordre des colonnes" icon={ArrowUpDown} defaultOpen={false}>
          <div className="px-4 py-2 bg-blue-50 border-y border-blue-100">
            <p className="text-[10px] text-blue-700 leading-relaxed">
              <span className="font-bold">Réorganisez</span> par drag &amp; drop.
              Icône <span className="font-bold">oeil</span> = afficher/masquer,
              <span className="font-bold"> épingle</span> = figer.
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {cols.map((col, i) => {
              const Icon = col.icon;
              return (
                <div
                  key={col.key}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={e => onDragOver(e, i)}
                  onDrop={() => onDrop(i)}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  className={`flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing select-none transition-all ${
                    dragOverIdx === i && dragIdx !== i ? 'bg-blue-50 border-l-2 border-blue-400' :
                    dragIdx === i ? 'opacity-40 bg-slate-50' : 'hover:bg-slate-50/60'
                  }`}>
                  <GripVertical className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  <span className="text-[9px] font-bold text-slate-400 w-4 flex-shrink-0 tabular-nums">{i + 1}</span>
                  <button onClick={() => toggleVisible(col.key)}
                    className={`flex-shrink-0 p-0.5 rounded transition-colors ${col.visible ? 'text-slate-600' : 'text-slate-300'}`}>
                    {col.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button onClick={() => togglePinned(col.key)}
                    className={`flex-shrink-0 p-0.5 rounded transition-colors ${col.pinned ? 'text-blue-600' : 'text-slate-300'}`}>
                    {col.pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                  </button>
                  <Icon className={`w-3 h-3 flex-shrink-0 ${COLOR_MAP[col.key] ? '' : 'text-slate-300'}`} style={{ color: undefined }} />
                  <span className={`text-xs flex-1 truncate ${col.visible ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{col.label}</span>
                  <span className="text-[9px] text-slate-400 flex-shrink-0">{col.width}px</span>
                </div>
              );
            })}
          </div>
        </AccordionSection>

        {/* 3. Ordonnancement */}
        <AccordionSection number="3" title="Ordonnancement (Tri multi-colonnes)" icon={ArrowUpDown} defaultOpen={false}>
          <div className="px-4 py-2 bg-blue-50 border-y border-blue-100">
            <p className="text-[10px] text-blue-700 leading-relaxed">
              <span className="font-bold">Tri hiérarchique :</span> Ex : d'abord par date, puis par statut pour les mêmes dates.
            </p>
          </div>
          <div className="px-3 py-3 space-y-3">
            {sortLevels.map((level, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex-1">Niveau {i + 1}</span>
                  <button onClick={() => removeSortLevel(i)}
                    className="p-0.5 text-slate-300 hover:text-red-400 rounded transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium mb-1 block">Colonne</label>
                    <select value={level.col} onChange={e => updateSortLevel(i, { col: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 text-slate-700">
                      {SORT_COL_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium mb-1 block">Ordre de tri</label>
                    <select value={level.dir} onChange={e => updateSortLevel(i, { dir: e.target.value as SortDir })}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 text-slate-700">
                      <option value="desc">Anti-chronologique (Plus récent → Plus ancien)</option>
                      <option value="asc">Croissant (A → Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addSortLevel}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-slate-200 text-xs font-semibold text-slate-400 hover:border-blue-300 hover:text-blue-500 rounded-xl transition-colors">
              <Plus className="w-3.5 h-3.5" /> Ajouter un niveau de tri
            </button>
          </div>
        </AccordionSection>

      </div>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

const STATUTS_KEYS = Object.keys(STATUT_DI_CFG) as StatutDI[];
const CRITICITE_KEYS = Object.keys(CRITICITE_CFG) as CriticiteDI[];

function FilterBar({ activeStatuts, onToggleStatut, activeCriticites, onToggleCriticite }: {
  activeStatuts: Set<StatutDI>; onToggleStatut: (s: StatutDI) => void;
  activeCriticites: Set<CriticiteDI>; onToggleCriticite: (c: CriticiteDI) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium flex-shrink-0">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtrer :
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {STATUTS_KEYS.map(key => {
          const cfg = STATUT_DI_CFG[key];
          const active = activeStatuts.has(key);
          return (
            <button key={key} onClick={() => onToggleStatut(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-90'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>
      <div className="w-px h-4 bg-slate-200 flex-shrink-0" />
      <div className="flex items-center gap-1 flex-wrap">
        {CRITICITE_KEYS.map(key => {
          const cfg = CRITICITE_CFG[key];
          const active = activeCriticites.has(key);
          return (
            <button key={key} onClick={() => onToggleCriticite(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-90'}`}>
              <span className="text-sm leading-none">{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DemandesListe({ demandes, onSelectDemande, onModifier, onSupprimerBrouillon, initialStatuts, initialCriticite, initialRetard, newlyCreatedId, onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [statutOverrides, setStatutOverrides] = useState<Record<string, StatutDI>>({});
  const [activeStatuts, setActiveStatuts] = useState<Set<StatutDI>>(
    initialStatuts ? new Set(initialStatuts) : new Set()
  );
  const [activeCriticites, setActiveCriticites] = useState<Set<CriticiteDI>>(
    initialCriticite ? new Set(initialCriticite) : new Set()
  );
  const [filterSlaBreached, setFilterSlaBreached] = useState(initialRetard ?? false);

  // Advanced filters
  const [filterSiteIds,     setFilterSiteIds]     = useState<string[]>([]);
  const [filterResIds,      setFilterResIds]       = useState<string[]>([]);
  const [filterEquipCats,   setFilterEquipCats]    = useState<string[]>([]);
  const [filterEquipSubs,   setFilterEquipSubs]    = useState<string[]>([]);
  const [filterCatsDI,      setFilterCatsDI]       = useState<string[]>([]);
  const [filterDemandeurs,  setFilterDemandeurs]   = useState<string[]>([]);
  const [filterPeriode,     setFilterPeriode]      = useState<PeriodeFilter>(EMPTY_PERIODE);
  const [showAssigneePanel, setShowAssigneePanel]  = useState(false);
  const [assigneeSelection, setAssigneeSelection]  = useState<AssigneeSelection>({
    prestataires: new Set(),
    agents: new Set(),
    equipes: new Set(),
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cols, setCols] = useState<ColDef[]>(DEFAULT_COLS);
  const [sortLevels, setSortLevels] = useState<SortLevel[]>([
    { col: 'created_at', dir: 'desc' },
  ]);

  // ── Modal states ─────────────────────────────────────────────────────────────
  type ModalType = 'detail' | 'attachments' | 'photos' | 'emails' | 'prise_en_charge' | null;
  const [activeModal, setActiveModal] = useState<{ type: ModalType; demande: DemandeParsed } | null>(null);
  const [assigneSidecar, setAssigneSidecar] = useState<{ label: string; isAgent: boolean } | null>(null);

  // ── Highlight newly created row ───────────────────────────────────────────────
  const [highlightedId, setHighlightedId] = useState<string | null>(newlyCreatedId ?? null);
  const [highlightFading, setHighlightFading] = useState(false);
  const newRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!newlyCreatedId) return;
    setHighlightedId(newlyCreatedId);
    setHighlightFading(false);
    const t0 = setTimeout(() => {
      newRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    // Start fade after 500ms
    const t1 = setTimeout(() => setHighlightFading(true), 500);
    // Clear after transition completes
    const t2 = setTimeout(() => { setHighlightedId(null); setHighlightFading(false); }, 2600);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [newlyCreatedId]);

  function toggleStatut(s: StatutDI) {
    setActiveStatuts(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  }
  function toggleCriticite(c: CriticiteDI) {
    setActiveCriticites(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  }

  // Column resize
  const handleResize = useCallback((key: ColKey, delta: number) => {
    setCols(prev => prev.map(c => {
      if (c.key !== key) return c;
      return { ...c, width: Math.max(80, c.width + delta) };
    }));
  }, []);

  // Column sort toggle from header click
  function handleToggleSort(key: ColKey) {
    const mapped = key === 'date_signalement' ? 'created_at'
      : key === 'priorite' ? 'criticite'
      : key === 'statut' ? 'statut_demande'
      : key;
    setSortLevels(prev => {
      const idx = prev.findIndex(l => l.col === mapped);
      if (idx === -1) return [...prev, { col: mapped, dir: 'desc' }];
      if (prev[idx].dir === 'desc') return prev.map((l, i) => i === idx ? { ...l, dir: 'asc' } : l);
      return prev.filter((_, i) => i !== idx);
    });
  }

  // Column pin toggle from header
  function handleTogglePinFromHeader(key: ColKey) {
    setCols(prev => prev.map(c => c.key === key ? { ...c, pinned: !c.pinned } : c));
  }

  // Unique demandeur names for the picker
  const demandeurItems = useMemo(() =>
    [...new Set(demandes.map(d => d.demandeur_nom).filter((n): n is string => !!n))].sort(),
    [demandes]
  );

  const hasAssigneeFilter = assigneeSelection.prestataires.size > 0 || assigneeSelection.agents.size > 0 || assigneeSelection.equipes.size > 0;
  const advancedCount = filterSiteIds.length + filterResIds.length + filterEquipCats.length +
    filterEquipSubs.length + filterCatsDI.length + filterDemandeurs.length +
    (filterPeriode.preset !== null ? 1 : 0) +
    (hasAssigneeFilter ? 1 : 0);

  function resetAdvancedFilters() {
    setFilterSiteIds([]); setFilterResIds([]);
    setFilterEquipCats([]); setFilterEquipSubs([]);
    setFilterCatsDI([]); setFilterDemandeurs([]);
    setFilterPeriode(EMPTY_PERIODE);
    setAssigneeSelection({ prestataires: new Set(), agents: new Set(), equipes: new Set() });
  }

  const filtered = useMemo(() => {
    let res = demandes.map(d =>
      statutOverrides[d.id] ? { ...d, statut_demande: statutOverrides[d.id] } : d
    );

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(d =>
        d.titre.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q) ||
        (d.demandeur_nom ?? '').toLowerCase().includes(q) ||
        (d.site_nom ?? '').toLowerCase().includes(q) ||
        (d.residence_nom ?? '').toLowerCase().includes(q)
      );
    }

    // Statuts + criticités chips
    res = res.filter(d => activeStatuts.size === 0 || activeStatuts.has(d.statut_demande));
    res = res.filter(d => activeCriticites.size === 0 || activeCriticites.has(d.criticite));
    if (filterSlaBreached) res = res.filter(d => isSlaBreached(d));

    // Sites / résidences
    if (filterSiteIds.length > 0 || filterResIds.length > 0) {
      res = res.filter(d =>
        filterSiteIds.includes(d.site_id ?? '') ||
        filterResIds.includes(d.residence_id ?? '')
      );
    }

    // Catégories DI
    if (filterCatsDI.length > 0) {
      res = res.filter(d => filterCatsDI.includes(d.categorie ?? ''));
    }

    // Demandeurs
    if (filterDemandeurs.length > 0) {
      res = res.filter(d => filterDemandeurs.includes(d.demandeur_nom ?? ''));
    }

    // Assigné à
    if (hasAssigneeFilter) {
      res = res.filter(d => {
        if (assigneeSelection.equipes.size > 0) {
          const agentName = d.agent ?? null;
          const inEquipe = agentName && EQUIPES.some(eq =>
            assigneeSelection.equipes.has(eq.key) && eq.membres.includes(agentName)
          );
          if (inEquipe) return true;
        }
        if (d.agent && assigneeSelection.agents.has(d.agent)) return true;
        if (d.prestataire && assigneeSelection.prestataires.has(d.prestataire)) return true;
        return false;
      });
    }

    // Période (based on created_at)
    const range = periodeRange(filterPeriode);
    if (range) {
      const [start, end] = range;
      res = res.filter(d => {
        const t = new Date(d.created_at).getTime();
        return t >= start && t <= end;
      });
    }

    // Sort
    if (sortLevels.length > 0) {
      res.sort((a, b) => {
        for (const level of sortLevels) {
          let diff = 0;
          if (level.col === 'created_at')     diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          if (level.col === 'criticite')      diff = CRITICITE_ORDER[a.criticite] - CRITICITE_ORDER[b.criticite];
          if (level.col === 'statut_demande') diff = (STATUT_ORDER_MAP[a.statut_demande] ?? 9) - (STATUT_ORDER_MAP[b.statut_demande] ?? 9);
          if (level.col === 'reference')      diff = a.reference.localeCompare(b.reference);
          if (level.col === 'titre')          diff = a.titre.localeCompare(b.titre);
          if (diff !== 0) return level.dir === 'asc' ? diff : -diff;
        }
        return 0;
      });
    }

    return res;
  }, [
    demandes, search, activeStatuts, activeCriticites, filterSlaBreached,
    filterSiteIds, filterResIds, filterEquipCats, filterEquipSubs,
    filterCatsDI, filterDemandeurs, filterPeriode,
    hasAssigneeFilter, assigneeSelection,
    sortLevels,
  ]);

  const visibleCols = cols.filter(c => c.visible);
  const hasActiveFilters = activeStatuts.size > 0 || activeCriticites.size > 0 || filterSlaBreached || advancedCount > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-100 bg-white space-y-2.5">

        {/* Row 1: search + quick actions */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une demande..."
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-slate-300" />
          </div>

          <button onClick={() => setFilterSlaBreached(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex-shrink-0 ${
              filterSlaBreached ? 'bg-red-50 border-red-200 text-red-700' : 'border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
            }`}>
            <Timer className="w-3.5 h-3.5" />
            SLA dépassé
          </button>

          {hasActiveFilters && (
            <button onClick={() => {
              setActiveStatuts(new Set()); setActiveCriticites(new Set()); setFilterSlaBreached(false);
              resetAdvancedFilters();
            }}
              className="flex items-center gap-1 px-2.5 py-2 text-xs text-red-500 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
              <X className="w-3 h-3" /> Réinit.
            </button>
          )}

          <button onClick={() => setSettingsOpen(v => !v)}
            className={`p-2 rounded-lg border transition-all flex-shrink-0 ${
              settingsOpen ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}>
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: advanced filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtres :
          </div>

          {/* Sites */}
          <ListDropdown width={360}
            trigger={
              <ListFilterBtn
                icon={<MapPin className="w-3 h-3" />}
                label="Sites"
                count={filterSiteIds.length + filterResIds.length}
                active={filterSiteIds.length + filterResIds.length > 0}
              />
            }
          >
            <SitePicker
              selectedSiteIds={filterSiteIds} selectedResIds={filterResIds}
              onChange={(s, r) => { setFilterSiteIds(s); setFilterResIds(r); }}
            />
          </ListDropdown>

          {/* Équipements */}
          <ListDropdown width={320}
            trigger={
              <ListFilterBtn
                icon={<Wrench className="w-3 h-3" />}
                label="Équipements"
                count={filterEquipCats.length + filterEquipSubs.length}
                active={filterEquipCats.length + filterEquipSubs.length > 0}
              />
            }
          >
            <EquipPicker
              selectedCats={filterEquipCats} selectedSubCats={filterEquipSubs}
              onChange={(c, s) => { setFilterEquipCats(c); setFilterEquipSubs(s); }}
            />
          </ListDropdown>

          {/* Catégories */}
          <ListDropdown width={280}
            trigger={
              <ListFilterBtn
                icon={<Tag className="w-3 h-3" />}
                label="Catégories"
                count={filterCatsDI.length}
                active={filterCatsDI.length > 0}
              />
            }
          >
            <CatDIPicker selected={filterCatsDI} onChange={setFilterCatsDI} />
          </ListDropdown>

          {/* Assigné à */}
          <button
            type="button"
            onClick={() => setShowAssigneePanel(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all flex-shrink-0
              ${showAssigneePanel || hasAssigneeFilter
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <User className="w-3 h-3" />
            <span>Assigné à</span>
            {hasAssigneeFilter && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">
                {assigneeSelection.prestataires.size + assigneeSelection.agents.size + assigneeSelection.equipes.size}
              </span>
            )}
          </button>

          {/* Demandeurs */}
          <ListDropdown width={280}
            trigger={
              <ListFilterBtn
                icon={<Contact className="w-3 h-3" />}
                label="Demandeurs"
                count={filterDemandeurs.length}
                active={filterDemandeurs.length > 0}
              />
            }
          >
            <DemandeurPicker
              items={demandeurItems}
              selected={filterDemandeurs}
              onChange={setFilterDemandeurs}
            />
          </ListDropdown>

          {/* Période */}
          <ListDropdown width={260}
            trigger={
              <ListFilterBtn
                icon={<Clock className="w-3 h-3" />}
                label={periodeLabel(filterPeriode) ?? 'Période'}
                count={filterPeriode.preset !== null ? 1 : 0}
                active={filterPeriode.preset !== null}
              />
            }
          >
            <PeriodePicker value={filterPeriode} onChange={setFilterPeriode} />
          </ListDropdown>

          {/* Reset advanced */}
          {advancedCount > 0 && (
            <button onClick={resetAdvancedFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors flex-shrink-0">
              <X className="w-3 h-3" /> Réinitialiser ({advancedCount})
            </button>
          )}
        </div>

        {/* Row 3: statut + criticité chips */}
        <FilterBar
          activeStatuts={activeStatuts}       onToggleStatut={toggleStatut}
          activeCriticites={activeCriticites} onToggleCriticite={toggleCriticite}
        />
      </div>

      {/* Count bar */}
      <div className="flex-shrink-0 flex items-center px-4 py-1.5 bg-slate-50 border-b border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-bold text-slate-700">{filtered.length}</span> demande{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters && <span className="text-slate-400 ml-1">(filtrées)</span>}
        </p>
        {sortLevels.length > 0 && (
          <span className="ml-3 flex items-center gap-1 text-[10px] text-slate-400">
            <ArrowUpDown className="w-3 h-3" />
            {sortLevels.map((l, i) => (
              <span key={i}>{SORT_COL_OPTIONS.find(o => o.value === l.col)?.label} {l.dir === 'asc' ? '↑' : '↓'}{i < sortLevels.length - 1 ? ' ·' : ''}</span>
            ))}
          </span>
        )}
      </div>

      {/* Table + settings + assignee panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Assignee filter panel (collapsible) */}
        {showAssigneePanel && (
          <AssigneeFilterPanel
            selection={assigneeSelection}
            onChange={setAssigneeSelection}
          />
        )}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ minWidth: visibleCols.reduce((s, c) => s + c.width, 0) }}>
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-slate-200 shadow-sm">
                {visibleCols.map(col => (
                  <th
                    key={col.key}
                    style={{ width: col.width, minWidth: col.width }}
                    className={`px-3 py-2.5 text-left bg-white border-r border-slate-100 last:border-r-0 ${
                      col.pinned ? 'sticky left-0 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.06)]' : ''
                    }`}>
                    <ColHeader
                      col={col}
                      sortLevels={sortLevels}
                      onToggleSort={handleToggleSort}
                      onTogglePin={handleTogglePinFromHeader}
                      onResize={handleResize}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Search className="w-8 h-8 opacity-50" />
                      <p className="text-sm font-medium text-slate-400">Aucune demande trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((d, ri) => {
                const breached = isSlaBreached(d);
                const atts = fakeAttachments(d.reference);
                const cb: CellCallbacks = {
                  onClickTitle:       () => setActiveModal({ type: 'detail', demande: d }),
                  onClickAttachments: () => setActiveModal({ type: 'attachments', demande: d }),
                  onClickPhotos:      () => setActiveModal({ type: 'photos', demande: d }),
                  onClickEmails:      () => setActiveModal({ type: 'emails', demande: d }),
                  onClickAssigne:     () => {
                    const label = d.agent ?? d.prestataire;
                    if (label) setAssigneSidecar({ label, isAgent: !!d.agent });
                  },
                  onModifier:              () => onModifier?.(d),
                  onSupprimerBrouillon:    () => onSupprimerBrouillon?.(d),
                  onPriseEnCharge:         () => setActiveModal({ type: 'prise_en_charge', demande: d }),
                  onChangeStatut:          (id, s) => {
                    setStatutOverrides(prev => ({ ...prev, [id]: s }));
                    onRefresh?.();
                  },
                };
                return (
                  <tr
                    key={d.id}
                    ref={d.id === newlyCreatedId ? newRowRef : undefined}
                    onClick={() => onSelectDemande(d)}
                    style={d.id === highlightedId ? {
                      backgroundColor: highlightFading ? 'transparent' : '#E8F3FF',
                      transition: highlightFading ? 'background-color 2s ease-out' : undefined,
                    } : undefined}
                    className={`group cursor-pointer border-b border-slate-50 transition-colors ${
                      d.id === highlightedId ? '' : (ri % 2 === 0 ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/20 hover:bg-blue-50/40')
                    } ${breached ? 'border-l-2 border-l-red-300' : ''}`}>
                    {visibleCols.map(col => (
                      <td
                        key={col.key}
                        style={{ width: col.width, minWidth: col.width }}
                        className={`px-3 py-2.5 border-r border-slate-50 last:border-r-0 align-middle ${
                          col.pinned ? 'sticky left-0 z-10 bg-white group-hover:bg-blue-50/40' : ''
                        } ${col.key === 'actions' ? 'text-center' : ''}`}>
                        {renderCell(col, d, () => onSelectDemande(d), cb)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {settingsOpen && (
          <SettingsPanel
            cols={cols}
            onClose={() => setSettingsOpen(false)}
            onChange={setCols}
            sortLevels={sortLevels}
            onSortChange={setSortLevels}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {activeModal?.type === 'detail' && (
        <DemandeDetailModal d={activeModal.demande} onClose={() => setActiveModal(null)} />
      )}
      {activeModal?.type === 'attachments' && (() => {
        const atts = fakeAttachments(activeModal.demande.reference);
        return atts.total > 0 ? (
          <AttachmentsModal ticketRef={activeModal.demande.reference} count={atts.total} onClose={() => setActiveModal(null)} />
        ) : null;
      })()}
      {activeModal?.type === 'photos' && (() => {
        const atts = fakeAttachments(activeModal.demande.reference);
        return atts.photos > 0 ? (
          <PhotosModal ticketRef={activeModal.demande.reference} count={atts.photos} onClose={() => setActiveModal(null)} />
        ) : null;
      })()}
      {activeModal?.type === 'emails' && (() => {
        const atts = fakeAttachments(activeModal.demande.reference);
        return atts.emails > 0 ? (
          <EmailsModal ticketRef={activeModal.demande.reference} count={atts.emails} onClose={() => setActiveModal(null)} demande={activeModal.demande} />
        ) : null;
      })()}
      {activeModal?.type === 'prise_en_charge' && (
        <PriseEnChargeModal
          demande={activeModal.demande}
          onClose={() => setActiveModal(null)}
          onUpdated={() => { setActiveModal(null); onRefresh?.(); }}
        />
      )}

      {/* ── Assigne sidecar ── */}
      {assigneSidecar && (
        <AssigneSidecar
          assigneLabel={assigneSidecar.label}
          isAgent={assigneSidecar.isAgent}
          onClose={() => setAssigneSidecar(null)}
        />
      )}
    </div>
  );
}
