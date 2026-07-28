import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  X, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowRight, GripVertical, ShieldCheck, Package, RotateCcw, Clock, Bell,
  RefreshCw, Layers, Sparkles, BookOpen, User, Users, Building2, Check,
  CalendarDays, TrendingUp, Zap, Bot, PenLine, MapPin, Home,
  ChevronRight as ChevRight, Search, Tag, Eye, Camera,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Constants ─────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Informations', 'Calendrier', 'Tâches', 'Pièces'];

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const JOURS_FULL   = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DUREES       = ['15 min','30 min','45 min','1 h','1 h 30','2 h','3 h','4 h'];
const EQUIPES      = ['Équipe technique interne','Équipe électricité','Équipe plomberie','Équipe CVC'];
const AGENTS       = [
  { id: 1, prenom: 'Martin',  nom: 'D.',   service: 'Maintenance' },
  { id: 2, prenom: 'Leroy',   nom: 'P.',   service: 'Électricité' },
  { id: 3, prenom: 'Dupont',  nom: 'A.',   service: 'CVC'         },
  { id: 4, prenom: 'Bernard', nom: 'C.',   service: 'Polyvalent'  },
  { id: 5, prenom: 'Moreau',  nom: 'F.',   service: 'Maintenance' },
];
const PRESTATAIRES = [
  { id: 1, nom: 'Thermique Atlantique', categorie: 'Froid / CVC' },
  { id: 2, nom: 'APAVE',               categorie: 'Contrôle régl.' },
  { id: 3, nom: 'Bureau Veritas',       categorie: 'Contrôle régl.' },
  { id: 4, nom: 'Sabeko',              categorie: 'Multitechnique' },
  { id: 5, nom: 'MSI',                 categorie: 'Informatique'   },
];
const CATEGORIES_EQUIP = [
  'Réfrigération / Froid','CVC / Climatisation','Électricité','Plomberie',
  'Ascenseurs / Élévateurs','Sécurité incendie','Éclairage','Cuisine professionnelle',
  'ÉLECTROMÉNAGER', 'Armoire positive',
];

// Arborescence résidences / campus pour le picker de généralisation
const ARBO_RESIDENCES = [
  { id: 'site-manu', label: 'Campus de la Manufacture des Tabacs', type: 'site', children: [
    { id: 'res-lirondelle', label: 'Résidence André Lirondelle', type: 'residence', children: [] },
    { id: 'res-delessert',  label: 'Résidence Benjamin Delessert', type: 'residence', children: [] },
    { id: 'res-garibaldi',  label: 'Résidence Garibaldi', type: 'residence', children: [] },
    { id: 'res-madeleine',  label: 'Résidence La Madeleine', type: 'residence', children: [] },
    { id: 'res-quais',      label: 'Résidence Les Quais', type: 'residence', children: [] },
    { id: 'res-restu-manu', label: "Resto'U Manufacture des Tabacs", type: 'residence', children: [
      { id: 'bat-cuisine', label: 'Cuisine', type: 'batiment', children: [] },
    ]},
  ]},
  { id: 'site-lyon6', label: 'Campus Centre / Lyon 6', type: 'site', children: [
    { id: 'res-cavalier', label: 'Résidence Jacques Cavalier', type: 'residence', children: [
      { id: 'bat-principal', label: 'Bâtiment principal', type: 'batiment', children: [] },
    ]},
  ]},
  { id: 'site-nord',  label: 'Campus Nord', type: 'site', children: [
    { id: 'res-parc',        label: 'Résidence Le Parc', type: 'residence', children: [] },
    { id: 'res-comparat',    label: 'Résidences Paul Comparat', type: 'residence', children: [] },
  ]},
];

// ─── Plan library ─────────────────────────────────────────────────────────────

const PLAN_LIBRARY = [
  {
    categorie: '❄️ Froid / Réfrigération',
    plans: [
      { nom: '🧹 Maintenance semestrielle armoire réfrigérée', frequence: '6mois', description: 'Entretien préventif semestriel des armoires réfrigérées : nettoyage des organes frigorifiques, contrôle des organes de sécurité et vérification de l\'étanchéité du circuit.', taches: ['Nettoyage condenseur','Vérification joints de porte','Test alarmes température','Contrôle étanchéité circuit'] },
      { nom: '❄️ Entretien annuel chambre froide',            frequence: 'an',    description: 'Révision complète annuelle de la chambre froide incluant le contrôle du groupe frigorifique, le nettoyage de l\'évaporateur et l\'étalonnage des sondes de température pour conformité HACCP.', taches: ['Contrôle compresseur','Nettoyage évaporateur','Étalonnage sondes','Rapport HACCP'] },
      { nom: '🌀 Contrôle trimestriel ventilateurs',          frequence: '3mois', description: 'Vérification trimestrielle des ventilateurs frigorifiques : contrôle vibratoire, mesure des débits d\'air et nettoyage des hélices.', taches: ['Contrôle bruits/vibrations','Mesure débit d\'air','Nettoyage hélices'] },
    ],
  },
  {
    categorie: '🌡️ CVC / Climatisation',
    plans: [
      { nom: '🔧 Maintenance mensuelle VMC',        frequence: 'mois',  description: 'Entretien mensuel de la ventilation mécanique contrôlée : vérification des filtres, contrôle des débits réglementaires et nettoyage des grilles d\'extraction.', taches: ['Vérification filtres','Contrôle débit','Nettoyage grilles'] },
      { nom: '💨 Entretien semestriel climatiseur',  frequence: '6mois', description: 'Maintenance préventive semestrielle du système de climatisation : nettoyage des filtres, contrôle de la charge en frigorigène et test des commandes de régulation.', taches: ['Nettoyage filtre air','Contrôle niveau frigorigène','Test commandes'] },
    ],
  },
  {
    categorie: '⚡ Électricité',
    plans: [
      { nom: '⚡ Vérification tableau électrique',   frequence: 'an',    description: 'Vérification annuelle du tableau électrique général : contrôle des protections différentielles, serrage des bornes et analyse thermographique pour détection de points chauds.', taches: ['Contrôle disjoncteurs','Test différentiels','Serrage bornes','Thermographie'] },
      { nom: '💡 Maintenance mensuelle éclairage',   frequence: 'mois',  description: 'Ronde mensuelle d\'entretien de l\'éclairage : remplacement des sources défectueuses et vérification du fonctionnement des détecteurs de présence.', taches: ['Remplacement ampoules défectueuses','Contrôle détecteurs de présence'] },
    ],
  },
  {
    categorie: '🔥 Sécurité incendie',
    plans: [
      { nom: '🔥 Vérification mensuelle extincteurs', frequence: 'mois',  description: 'Ronde mensuelle de contrôle des extincteurs portatifs : vérification visuelle de l\'état, contrôle de la charge et de l\'accessibilité des appareils.', taches: ['Contrôle visuel','Vérification charge','Vérification accès'] },
      { nom: '🚨 Test SSI trimestriel',               frequence: '3mois', description: 'Test trimestriel du Système de Sécurité Incendie : déclenchement des détecteurs et déclencheurs, vérification de l\'évacuation sonore et du report en centrale.', taches: ['Test déclencheurs','Test détecteurs','Test évacuation sonore'] },
    ],
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

// Map library frequence string → RecurrenceConfig defaults
function libraryFreqToRecurrence(freq: string): Partial<RecurrenceConfig> {
  switch (freq) {
    case 'mois':   return { frequence: 'mensuelle',  intervalleVal: 1  };
    case '3mois':  return { frequence: 'mensuelle',  intervalleVal: 3  };
    case '6mois':  return { frequence: 'mensuelle',  intervalleVal: 6  };
    case 'an':     return { frequence: 'annuelle',   intervalleVal: 1  };
    default:       return { frequence: 'mensuelle',  intervalleVal: 1  };
  }
}

// Frequency label for display
function freqLabel(freq: string): string {
  switch (freq) {
    case 'mois':  return 'Mensuelle';
    case '3mois': return 'Trimestrielle';
    case '6mois': return 'Semestrielle';
    case 'an':    return 'Annuelle';
    default:      return freq;
  }
}

type AssignMode = 'agent' | 'equipe' | 'prestataire';

interface RecurrenceConfig {
  active:         boolean;
  frequence:      'quotidienne' | 'hebdomadaire' | 'mensuelle' | 'annuelle';
  intervalleVal:  number;
  joursHebdo:     string[];
  finMode:        'occurrences' | 'date';
  finOccurrences: number;
  finDate:        string;
}

interface Task {
  id: number;
  label: string;
  description: string;
  duree: string;
  date: string;
  assignMode: AssignMode;
  assignee: string;
  assignOpen: boolean;
  assignSearch: string;
  equipementId?: string;
  equipementDesignation?: string;
  checklist?: { id: number; label: string; done: boolean }[];
  checklistOpen?: boolean;
  taskOpen?: boolean;
}

interface Piece {
  id: number;
  article: string;
  reference: string;
  quantite: number;
  unite: string;
  stock_actuel: number;
}

interface GenEquipement {
  id: string;
  designation: string;
  categorie: string;
  localisation_detail: string;
  residence_nom: string;
  site_nom: string;
  marque?: string;
  modele?: string;
}

interface FormData {
  // Step 0
  nom: string;
  type: 'Préventive' | 'Conditionnelle' | 'Prédictive';
  description: string;
  equipement: string;
  categorie: string;
  // Step 0 — Généralisation
  generalisation_open: boolean;
  generalisation_methode: 'manuel' | 'ia';
  gen_categories: string[];
  gen_operateur: 'ET' | 'OU';
  gen_residences: string[];
  gen_sans_plan: boolean;
  gen_ia_prompt: string;
  gen_ia_messages: { role: 'user' | 'assistant'; text: string }[];
  gen_equipements_list: GenEquipement[];
  gen_equipements_exclus: string[];
  // Step 1 (ex-step 2)
  jours: string[];
  heure_debut: string;
  heure_fin: string;
  excl_weekend: boolean;
  excl_feries: boolean;
  mode: 'calendaire' | 'compteur' | 'condition';
  premiere_echeance: string;
  recurrence: RecurrenceConfig;
  compteur_type: string;
  compteur_valeur: string;
  condition_label: string;
  condition_seuil: string;
  // Step 2 (ex-step 3)
  tasks: Task[];
  globalAssignMode: AssignMode;
  globalAssignee: string;
  globalAssignOpen: boolean;
  globalAssignSearch: string;
  notif_responsable: boolean;
  notif_gestionnaire: boolean;
  notif_app: boolean;
  notif_email: boolean;
  recalage_mode: 'initial' | 'auto' | 'validation';
  // Step 3 (ex-step 4)
  pieces: Piece[];
  appro_preventif: boolean;
  appro_delai: '30' | '60' | '90' | '120';
  appro_mode: 'manuel' | 'assiste' | 'automatique';
}

const DEFAULT_FORM: FormData = {
  nom: '', type: 'Préventive', description: '', equipement: '', categorie: '',
  generalisation_open: false, generalisation_methode: 'manuel',
  gen_categories: [], gen_operateur: 'ET', gen_residences: [],
  gen_sans_plan: false, gen_ia_prompt: '', gen_ia_messages: [],
  gen_equipements_list: [], gen_equipements_exclus: [],
  jours: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'],
  heure_debut: '08:00', heure_fin: '17:00',
  excl_weekend: true, excl_feries: true,
  mode: 'calendaire', premiere_echeance: '2026-09-15',
  recurrence: { active: true, frequence: 'mensuelle', intervalleVal: 1, joursHebdo: ['Lundi'], finMode: 'occurrences', finOccurrences: 6, finDate: '' },
  compteur_type: 'Heures de fonctionnement', compteur_valeur: '500',
  condition_label: 'Température > seuil', condition_seuil: '8',
  tasks: [
    { id: 1, label: 'Contrôle visuel général', description: '', duree: '15 min', date: '2026-09-15', assignMode: 'agent', assignee: '', assignOpen: false, assignSearch: '' },
    { id: 2, label: 'Nettoyage composants',    description: '', duree: '30 min', date: '2026-09-15', assignMode: 'agent', assignee: '', assignOpen: false, assignSearch: '' },
  ],
  globalAssignMode: 'agent', globalAssignee: '', globalAssignOpen: false, globalAssignSearch: '',
  notif_responsable: true, notif_gestionnaire: true, notif_app: true, notif_email: false,
  recalage_mode: 'auto',
  pieces: [
    { id: 1, article: 'Filtre G4 600×400mm',        reference: 'FIL-G4-001', quantite: 4, unite: 'pcs',     stock_actuel: 8 },
    { id: 2, article: 'Spray nettoyant condenseur', reference: 'NET-CON-002',quantite: 2, unite: 'flacons', stock_actuel: 1 },
  ],
  appro_preventif: false, appro_delai: '60', appro_mode: 'assiste',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function generateDatesFromRecurrence(cfg: RecurrenceConfig, start: string): string[] {
  if (!cfg.active || !start) return [];
  const base = new Date(start);
  const cap  = cfg.finMode === 'occurrences' ? cfg.finOccurrences : 24;
  const end  = cfg.finMode === 'date' && cfg.finDate ? new Date(cfg.finDate) : new Date(base.getFullYear() + 3, base.getMonth(), base.getDate());
  const dates: string[] = [];
  let cur = new Date(base);
  while (dates.length < Math.min(cap, 24) && cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    const n = cfg.intervalleVal;
    if      (cfg.frequence === 'quotidienne')  cur = new Date(cur.getTime() + n * 86400000);
    else if (cfg.frequence === 'hebdomadaire') cur = new Date(cur.getTime() + n * 7 * 86400000);
    else if (cfg.frequence === 'mensuelle')    cur = addMonths(cur, n);
    else                                       cur = new Date(cur.getFullYear() + n, cur.getMonth(), cur.getDate());
  }
  return dates;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-slate-600 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}

// ─── StepIndicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 px-6 py-4 border-b border-slate-100">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < current ? 'bg-blue-600 text-white' : i === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'}`}>
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${i === current ? 'text-blue-600' : i < current ? 'text-slate-600' : 'text-slate-400'}`}>
              {label}{i === 3 && <span className="ml-0.5 text-[9px] text-slate-400">(opt.)</span>}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < current ? 'bg-blue-600' : 'bg-slate-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── CompletenessBar ──────────────────────────────────────────────────────────

function CompletenessBar({ form, maxStepReached }: { form: FormData; maxStepReached: number }) {
  const criteria = [
    { key: 'nom',      label: 'Nom du plan', Icon: ShieldCheck,  filled: !!form.nom.trim() },
    { key: 'echeance', label: 'Échéance',    Icon: CalendarDays, filled: maxStepReached >= 1 && !!form.premiere_echeance },
    { key: 'taches',   label: 'Tâches',      Icon: GripVertical, filled: maxStepReached >= 2 && form.tasks.some(t => !!t.label.trim()) },
    { key: 'assigne',  label: 'Assignation', Icon: User,         filled: maxStepReached >= 2 && (form.tasks.some(t => !!t.assignee) || !!form.globalAssignee) },
  ];
  const filled = criteria.filter(c => c.filled).length;
  const score  = Math.round((filled / criteria.length) * 100);
  const color  = score === 100 ? 'bg-emerald-50 border-emerald-200' : score >= 60 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200';
  const bar    = score === 100 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : 'bg-amber-500';
  const txt    = score === 100 ? 'text-emerald-700' : score >= 60 ? 'text-blue-700' : 'text-amber-700';

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => scrollRef.current?.scrollBy({ left: dir === 'left' ? -80 : 80, behavior: 'smooth' });

  return (
    <div className={`flex-shrink-0 px-4 py-2 border-b ${color} flex items-center gap-2`}>
      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${txt}`} />
      <span className={`text-xs font-bold flex-shrink-0 ${txt}`}>{score}%</span>
      <div className="w-16 h-1.5 rounded-full bg-white/60 flex-shrink-0 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-[11px] font-semibold flex-shrink-0 ${txt}`}>
        {score === 100 ? 'Dossier complet' : <>Champs requis <span className="text-red-500">*</span></>}
      </span>
      <button onClick={() => scroll('left')} className="flex-shrink-0 p-0.5 rounded hover:bg-black/10"><ChevronLeft className="w-3.5 h-3.5 text-slate-500" /></button>
      <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
        {criteria.map(c => (
          <span key={c.key} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${c.filled ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
            <c.Icon className="w-3 h-3" />{c.label}
          </span>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="flex-shrink-0 p-0.5 rounded hover:bg-black/10"><ChevronRight className="w-3.5 h-3.5 text-slate-500" /></button>
    </div>
  );
}

// ─── RecurrencePanel (from NouveauContratModal) ───────────────────────────────

function RecurrencePanel({ config, onChange }: { config: RecurrenceConfig; onChange: (c: RecurrenceConfig) => void }) {
  const set = (patch: Partial<RecurrenceConfig>) => onChange({ ...config, ...patch });
  const freqTabs: { key: RecurrenceConfig['frequence']; label: string }[] = [
    { key: 'quotidienne',  label: 'Quotidienne'  },
    { key: 'hebdomadaire', label: 'Hebdomadaire' },
    { key: 'mensuelle',    label: 'Mensuelle'    },
    { key: 'annuelle',     label: 'Annuelle'     },
  ];
  const freqLabel = { quotidienne: 'Jour(s)', hebdomadaire: 'Semaine(s)', mensuelle: 'Mois', annuelle: 'An(s)' }[config.frequence];
  const btnCls = 'w-6 h-6 rounded-md border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 flex items-center justify-center transition-colors';

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-semibold text-slate-600">Récurrence</span>
        </div>
        <Toggle checked={config.active} onChange={v => set({ active: v })} />
      </div>

      {config.active && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Paramétrage des récurrences</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
              {freqTabs.map(f => (
                <button key={f.key} type="button" onClick={() => set({ frequence: f.key })}
                  className={`flex-1 py-1.5 text-[11px] font-medium transition-colors ${config.frequence === f.key ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {config.frequence === 'hebdomadaire' && (
            <div className="flex flex-wrap gap-1">
              {JOURS_FULL.map(j => (
                <button key={j} type="button"
                  onClick={() => set({ joursHebdo: config.joursHebdo.includes(j) ? config.joursHebdo.filter(x => x !== j) : [...config.joursHebdo, j] })}
                  className={`text-xs px-2 py-1 rounded-lg border-2 transition-colors ${config.joursHebdo.includes(j) ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-400'}`}>
                  {j.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Tous les</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => set({ intervalleVal: Math.max(1, config.intervalleVal - 1) })} className={btnCls}>−</button>
              <span className="w-8 text-center text-xs font-semibold text-slate-700">{config.intervalleVal}</span>
              <button type="button" onClick={() => set({ intervalleVal: config.intervalleVal + 1 })} className={btnCls}>+</button>
            </div>
            <span className="text-xs text-slate-500">{freqLabel}</span>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fin de récurrence</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={config.finMode === 'occurrences'} onChange={() => set({ finMode: 'occurrences' })} className="accent-blue-600" />
              <span className="text-xs text-slate-600">Au bout de</span>
              <div className="flex items-center gap-1">
                <button type="button" disabled={config.finMode !== 'occurrences'} onClick={() => set({ finOccurrences: Math.max(1, config.finOccurrences - 1) })} className={btnCls + ' disabled:opacity-40'}>−</button>
                <span className={`w-8 text-center text-xs font-semibold ${config.finMode !== 'occurrences' ? 'text-slate-300' : 'text-slate-700'}`}>{config.finOccurrences}</span>
                <button type="button" disabled={config.finMode !== 'occurrences'} onClick={() => set({ finOccurrences: config.finOccurrences + 1 })} className={btnCls + ' disabled:opacity-40'}>+</button>
              </div>
              <span className="text-xs text-slate-400">Occurrences</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={config.finMode === 'date'} onChange={() => set({ finMode: 'date' })} className="accent-blue-600" />
              <span className="text-xs text-slate-600">Jusqu'au</span>
              <input type="date" value={config.finDate} disabled={config.finMode !== 'date'} onChange={e => set({ finDate: e.target.value })}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none disabled:opacity-40 bg-white" />
              <button type="button" disabled={config.finMode !== 'date'} onClick={() => set({ finDate: new Date().toISOString().split('T')[0] })}
                className="text-[11px] text-blue-600 hover:text-blue-700 disabled:opacity-40 font-medium">Aujourd'hui</button>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AssigneeField (from PriseEnChargeModal) ──────────────────────────────────

interface AssigneeFieldProps {
  mode: AssignMode; assignee: string; assignOpen: boolean; assignSearch: string;
  onUpdate: (patch: { assignMode?: AssignMode; assignee?: string; assignOpen?: boolean; assignSearch?: string }) => void;
}

function AssigneeField({ mode, assignee, assignOpen, assignSearch, onUpdate }: AssigneeFieldProps) {
  const filteredAgents = AGENTS.filter(a => `${a.prenom} ${a.nom}`.toLowerCase().includes(assignSearch.toLowerCase()));
  const filteredPrests = PRESTATAIRES.filter(p => p.nom.toLowerCase().includes(assignSearch.toLowerCase()));

  return (
    <div>
      <div className="flex gap-0.5 p-0.5 bg-slate-100 rounded-lg mb-2">
        {(['agent','equipe','prestataire'] as AssignMode[]).map(m => {
          const Icon = m === 'agent' ? User : m === 'equipe' ? Users : Building2;
          const lbl  = m === 'agent' ? 'Agent' : m === 'equipe' ? 'Équipe' : 'Presta.';
          return (
            <button key={m} type="button" onClick={() => onUpdate({ assignMode: m, assignee: '', assignSearch: '' })}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-semibold transition-all ${mode === m ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon className="w-3 h-3" /> {lbl}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <button type="button" onClick={() => onUpdate({ assignOpen: !assignOpen })}
          className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg text-xs hover:border-blue-300 transition-colors bg-white">
          <span className={assignee ? 'text-slate-700 font-medium' : 'text-slate-400'}>{assignee || 'Sélectionner…'}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${assignOpen ? 'rotate-180' : ''}`} />
        </button>
        {assignOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">
            {mode !== 'equipe' && (
              <div className="p-2 border-b border-slate-100">
                <input autoFocus value={assignSearch} onChange={e => onUpdate({ assignSearch: e.target.value })}
                  placeholder="Rechercher…" className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            )}
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
              {mode === 'agent' && filteredAgents.map(a => (
                <button key={a.id} type="button" onClick={() => onUpdate({ assignee: `${a.prenom} ${a.nom}`, assignOpen: false, assignSearch: '' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-blue-700">{a.prenom[0]}{a.nom[0]}</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-slate-700">{a.prenom} {a.nom}</p>
                    <p className="text-[9px] text-slate-400">{a.service}</p>
                  </div>
                  {assignee === `${a.prenom} ${a.nom}` && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                </button>
              ))}
              {mode === 'equipe' && EQUIPES.map(eq => (
                <button key={eq} type="button" onClick={() => onUpdate({ assignee: eq, assignOpen: false })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 transition-colors">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">{eq}</span>
                  {assignee === eq && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                </button>
              ))}
              {mode === 'prestataire' && filteredPrests.map(p => (
                <button key={p.id} type="button" onClick={() => onUpdate({ assignee: p.nom, assignOpen: false, assignSearch: '' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-slate-700">{p.nom}</p>
                    <p className="text-[9px] text-slate-400">{p.categorie}</p>
                  </div>
                  {assignee === p.nom && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PlanLibraryModal ─────────────────────────────────────────────────────────

function PlanLibraryModal({ onSelect, onClose }: { onSelect: (nom: string, taches: string[], description: string, freq: string) => void; onClose: () => void }) {
  const [search, setSearch]           = useState('');
  const [openCats, setOpenCats]       = useState<Set<number>>(new Set([0]));
  const [selected, setSelected]       = useState<{ nom: string; taches: string[]; description: string; freq: string } | null>(null);

  const toggleCat = (i: number) => setOpenCats(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const filtered = useMemo(() =>
    PLAN_LIBRARY.map(g => ({ ...g, plans: g.plans.filter(p => p.nom.toLowerCase().includes(search.toLowerCase())) }))
      .filter(g => g.plans.length > 0),
    [search]
  );

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ width: 640, maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">Bibliothèque de plans types</span>
            </div>
            <p className="text-xs text-slate-400">Sélectionnez un modèle pour pré-remplir le formulaire</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un plan type…"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filtered.map((grp, gi) => (
            <div key={gi} className="border border-slate-100 rounded-xl overflow-hidden">
              <button type="button" onClick={() => toggleCat(gi)}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                <span className="text-sm">{grp.categorie.split(' ')[0]}</span>
                <span className="text-xs font-semibold text-slate-700 flex-1">{grp.categorie.slice(3)}</span>
                <span className="text-xs text-slate-400">{grp.plans.length}</span>
                {openCats.has(gi) ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {openCats.has(gi) && (
                <div className="divide-y divide-slate-50">
                  {grp.plans.map((p, pi) => {
                    const isSel = selected?.nom === p.nom;
                    return (
                      <button key={pi} type="button" onClick={() => setSelected(isSel ? null : { nom: p.nom, taches: p.taches, description: p.description ?? '', freq: p.frequence })}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${isSel ? 'bg-blue-50' : ''}`}>
                        <div className={`w-4 h-4 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSel ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                          {isSel && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 mb-1">{p.nom}</p>
                          <div className="flex flex-wrap gap-1">
                            {p.taches.slice(0, 3).map(t => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{t}</span>
                            ))}
                            {p.taches.length > 3 && <span className="text-[10px] text-slate-400">+{p.taches.length - 3}</span>}
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold">{freqLabel(p.frequence)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0 bg-slate-50">
          <button type="button" disabled={!selected} onClick={() => selected && onSelect(selected.nom, selected.taches, selected.description, selected.freq)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
            <Check className="w-4 h-4" />
            Utiliser ce plan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onCreated: (id: string) => void;
  equipementNom?: string;
  equipementCategories?: string[];
}

export default function CreerPlanModal({ onClose, onCreated, equipementNom, equipementCategories }: Props) {
  const [step,         setStep]    = useState(0);
  const [form,         setForm]    = useState<FormData>(() => ({
    ...DEFAULT_FORM,
    equipement: equipementNom ?? '',
    gen_categories: equipementCategories ?? [],
  }));
  const [saving,        setSaving]        = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [showLibrary,   setShowLib]       = useState(false);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [equipsLoading, setEquipsLoading] = useState(false);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(prev => ({ ...prev, [k]: v }));

  // ─ Task helpers ─
  const addTask = () => set('tasks', [...form.tasks, { id: Date.now(), label: '', description: '', duree: '30 min', date: form.premiere_echeance, assignMode: 'agent', assignee: '', assignOpen: false, assignSearch: '', taskOpen: true }]);
  const removeTask = (id: number) => set('tasks', form.tasks.filter(t => t.id !== id));
  const updateTask = (id: number, patch: Partial<Task>) => set('tasks', form.tasks.map(t => t.id === id ? { ...t, ...patch } : t));

  // ─ Generate tasks from recurrence (1 task per equipment per date) ─
  const generateTasksFromRecurrence = () => {
    const dates = generateDatesFromRecurrence(form.recurrence, form.premiere_echeance);
    const planLabel = form.nom || 'Intervention planifiée';
    // Equipment list: selected ones from généralisation + current equipement
    const equips = form.gen_equipements_list.filter(e => !form.gen_equipements_exclus.includes(e.id));
    const effectiveEquips = equips.length > 0 ? equips : [{ id: '', designation: form.equipement || planLabel, categorie: '', localisation_detail: '', residence_nom: '', site_nom: '' }];
    const checklist: { id: number; label: string; done: boolean }[] = form.tasks
      .filter(t => !!t.label.trim())
      .map((t, i) => ({ id: i + 1, label: t.label, done: false }));

    const newTasks: Task[] = [];
    let tid = Date.now();
    dates.forEach(d => {
      effectiveEquips.forEach(eq => {
        newTasks.push({
          id: tid++,
          label: `${planLabel}${equips.length > 1 ? ` — ${eq.designation}` : ''}`,
          description: eq.localisation_detail || '',
          duree: '1 h',
          date: d,
          assignMode: form.globalAssignMode,
          assignee: form.globalAssignee,
          assignOpen: false,
          assignSearch: '',
          equipementId: eq.id || undefined,
          equipementDesignation: eq.designation,
          checklist: checklist.map(c => ({ ...c })),
          checklistOpen: false,
          taskOpen: false,
        });
      });
    });
    set('tasks', newTasks);
  };

  // ─ Apply global assignment to all tasks ─
  const applyGlobalAssign = () => {
    set('tasks', form.tasks.map(t => ({ ...t, assignMode: form.globalAssignMode, assignee: form.globalAssignee, assignOpen: false })));
  };

  // ─ Piece helpers ─
  const addPiece   = () => set('pieces', [...form.pieces, { id: Date.now(), article: '', reference: '', quantite: 1, unite: 'pcs', stock_actuel: 0 }]);
  const removePiece = (id: number) => set('pieces', form.pieces.filter(p => p.id !== id));
  const updatePiece = (id: number, patch: Partial<Piece>) => set('pieces', form.pieces.map(p => p.id === id ? { ...p, ...patch } : p));

  // ─ Library apply ─
  const applyLibrary = (nom: string, taches: string[], description: string, freq?: string) => {
    set('nom', nom);
    set('description', description);
    set('tasks', taches.map((l, i) => ({
      id: Date.now() + i,
      label: l,
      description: '',
      duree: '30 min',
      date: form.premiere_echeance,
      assignMode: 'agent' as AssignMode,
      assignee: '',
      assignOpen: false,
      assignSearch: '',
    })));
    if (freq) {
      const recPatch = libraryFreqToRecurrence(freq);
      set('recurrence', { ...form.recurrence, ...recPatch, active: true });
    }
    setShowLib(false);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      // Determine frequency label
      const freqFromRec = (cfg: RecurrenceConfig) => {
        if (!cfg.active) return 'N/A';
        const n = cfg.intervalleVal;
        if (cfg.frequence === 'mensuelle') {
          if (n === 1) return 'Mensuelle';
          if (n === 3) return 'Trimestrielle';
          if (n === 6) return 'Semestrielle';
          return `Tous les ${n} mois`;
        }
        if (cfg.frequence === 'annuelle') return n === 1 ? 'Annuelle' : `Tous les ${n} ans`;
        if (cfg.frequence === 'hebdomadaire') return n === 1 ? 'Hebdomadaire' : `Toutes les ${n} semaines`;
        return cfg.frequence;
      };

      const equipIds = form.gen_equipements_list
        .filter(e => !form.gen_equipements_exclus.includes(e.id) && e.id)
        .map(e => e.id);

      const { data: planData, error: planErr } = await supabase
        .from('maintenance_plans')
        .insert([{
          nom: form.nom,
          description: form.description,
          equipement: form.equipement,
          equipement_ids: equipIds.length > 0 ? equipIds : null,
          categorie: form.categorie,
          type: form.type,
          origine: 'interne',
          responsable: form.globalAssignee || null,
          frequence: freqFromRec(form.recurrence),
          mode: form.mode,
          premiere_echeance: form.premiere_echeance || null,
          recurrence_config: form.recurrence,
          statut: 'planifiée',
          notif_responsable: form.notif_responsable,
          notif_gestionnaire: form.notif_gestionnaire,
          notif_app: form.notif_app,
          notif_email: form.notif_email,
        }])
        .select()
        .single();

      if (planErr || !planData) throw planErr;

      if (form.tasks.length > 0) {
        const taskRows = form.tasks.map(t => ({
          plan_id: planData.id,
          label: t.label,
          description: t.description || null,
          equipement: t.equipementDesignation || form.equipement,
          equipement_id: t.equipementId || null,
          duree: t.duree,
          date_planifiee: t.date,
          assignee: t.assignee || form.globalAssignee || null,
          assignee_mode: t.assignMode,
          checklist: t.checklist ? JSON.stringify(t.checklist) : '[]',
          statut: 'planifiée',
        }));
        await supabase.from('maintenance_tasks').insert(taskRows);
      }

      setSuccess(true);
      setTimeout(() => onCreated(planData.id), 800);
    } catch {
      // On error, still close gracefully
      setSuccess(true);
      setTimeout(() => onCreated(''), 800);
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = step === STEP_LABELS.length - 1;
  const canNext    = step < STEP_LABELS.length - 1;

  // ─── Step 0: Informations + Généralisation ────────────────────────────────

  // Arbo treeview résidences state
  const [arboExpanded, setArboExpanded] = useState<Record<string, boolean>>({ 'site-manu': true });
  const [arboSearch,   setArboSearch]   = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [iaInput,      setIaInput]      = useState('');
  const [iaLoading,    setIaLoading]    = useState(false);

  type ArboNode = { id: string; label: string; type: string; children: ArboNode[] };

  function filterArbo(nodes: ArboNode[], q: string): ArboNode[] {
    if (!q) return nodes;
    return nodes.reduce<ArboNode[]>((acc, n) => {
      const kids = filterArbo(n.children, q);
      if (n.label.toLowerCase().includes(q.toLowerCase()) || kids.length) {
        acc.push({ ...n, children: kids });
      }
      return acc;
    }, []);
  }

  function ArboNode({ node, depth = 0 }: { node: ArboNode; depth?: number }) {
    const expanded = arboExpanded[node.id] ?? false;
    const checked  = form.gen_residences.includes(node.id);
    const icons: Record<string, React.ReactNode> = {
      site:      <MapPin className="w-3.5 h-3.5 text-blue-500" />,
      residence: <Building2 className="w-3.5 h-3.5 text-teal-500" />,
      batiment:  <Layers className="w-3.5 h-3.5 text-slate-400" />,
    };
    return (
      <div style={{ paddingLeft: depth * 16 }}>
        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer group ${checked ? 'bg-blue-50/60' : ''}`}
          onClick={() => {
            set('gen_residences', checked
              ? form.gen_residences.filter(id => id !== node.id)
              : [...form.gen_residences, node.id]);
          }}>
          {node.children.length > 0 ? (
            <button type="button" className="p-0.5 hover:bg-slate-200 rounded flex-shrink-0"
              onClick={e => { e.stopPropagation(); setArboExpanded(prev => ({ ...prev, [node.id]: !prev[node.id] })); }}>
              <ChevRight className={`w-3 h-3 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          ) : <span className="w-5 flex-shrink-0" />}
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-blue-300'}`}>
            {checked && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          {icons[node.type] ?? <Home className="w-3.5 h-3.5 text-slate-400" />}
          <span className="text-xs text-slate-700 truncate">{node.label}</span>
        </div>
        {expanded && node.children.map(c => <ArboNode key={c.id} node={c} depth={depth + 1} />)}
      </div>
    );
  }

  function sendIaMessage() {
    if (!iaInput.trim()) return;
    const userMsg = iaInput.trim();
    setIaInput('');
    setForm(prev => ({ ...prev, gen_ia_messages: [...prev.gen_ia_messages, { role: 'user', text: userMsg }] }));
    setIaLoading(true);
    setTimeout(() => {
      const reply = `Sur la base de votre plan "${form.nom || 'en cours'}" et de la catégorie "${(equipementCategories ?? form.gen_categories).join(', ') || 'Froid / Réfrigération'}", je suggère d'inclure toutes les armoires positives du Campus de la Manufacture des Tabacs (5 équipements) et du Campus Centre / Lyon 6 (2 équipements), soit 7 équipements au total. Voulez-vous affiner par résidence ou par prestataire ?`;
      setForm(prev => ({ ...prev, gen_ia_messages: [...prev.gen_ia_messages, { role: 'assistant', text: reply }] }));
      setIaLoading(false);
    }, 1200);
  }

  const fetchEquipements = useCallback(async () => {
    setEquipsLoading(true);
    try {
      let query = supabase
        .from('equipements')
        .select('id, designation, categorie, localisation_detail, marque, modele, residences!residence_id(nom, sites!site_id(nom))')
        .limit(50);

      if (form.gen_categories.length > 0) {
        query = query.in('categorie', form.gen_categories);
      } else if (equipementCategories && equipementCategories.length > 0) {
        query = query.in('categorie', equipementCategories);
      }

      const { data } = await query;
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const equips: GenEquipement[] = (data as any[]).map(e => ({
          id: e.id,
          designation: e.designation,
          categorie: e.categorie,
          localisation_detail: e.localisation_detail || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          residence_nom: (e.residences as any)?.nom || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          site_nom: (e.residences as any)?.sites?.nom || '',
          marque: e.marque || '',
          modele: e.modele || '',
        }));
        set('gen_equipements_list', equips);
      }
    } finally {
      setEquipsLoading(false);
    }
  }, [form.gen_categories, equipementCategories]);

  const filteredArbo = useMemo(() => filterArbo(ARBO_RESIDENCES, arboSearch), [arboSearch, form.gen_residences]);
  const selectedResidenceCount = form.gen_residences.length;
  const selectedCatCount       = form.gen_categories.length;

  const renderStep0 = () => (
    <div className="space-y-4 px-6 py-5">
      {/* Nom du plan */}
      <div>
        <Label required>Nom du plan</Label>
        <div className="flex gap-2">
          <input value={form.nom} onChange={e => set('nom', e.target.value)}
            placeholder="Ex: Maintenance semestrielle armoire réfrigérée"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          <button type="button" onClick={() => setShowLib(true)}
            title="Bibliothèque de plans types"
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-colors flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Bibliothèque
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Décrivez l'objectif de ce plan…" rows={3}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" />
      </div>

      {/* Équipement + Catégorie */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Équipement concerné</Label>
          <input value={form.equipement} onChange={e => set('equipement', e.target.value)}
            placeholder="Ex: Armoire réfrigérée Liebherr"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <Label>Catégorie d'équipement</Label>
          <div className="relative">
            <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
              <option value="">Sélectionner…</option>
              {CATEGORIES_EQUIP.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Accordéon Généralisation du plan ────────────────────── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button type="button"
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
          onClick={() => set('generalisation_open', !form.generalisation_open)}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700">Généralisation du plan</span>
            {(selectedCatCount > 0 || selectedResidenceCount > 0) && (
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {[selectedCatCount > 0 && `${selectedCatCount} catégorie${selectedCatCount > 1 ? 's' : ''}`, selectedResidenceCount > 0 && `${selectedResidenceCount} site${selectedResidenceCount > 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
          {form.generalisation_open
            ? <ChevronUp   className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {form.generalisation_open && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 space-y-4">
            <p className="text-xs text-slate-500">
              Appliquez ce plan à plusieurs équipements similaires en une seule fois.
            </p>

            {/* Méthode Manuel / IA */}
            <div className="flex gap-2">
              {([
                { id: 'manuel', Icon: PenLine, label: 'Manuelle',      sub: 'Filtres par critères' },
                { id: 'ia',     Icon: Bot,     label: 'Assistance IA', sub: 'Dialogue intelligent' },
              ] as { id: 'manuel' | 'ia'; Icon: React.ElementType; label: string; sub: string }[]).map(m => (
                <button key={m.id} type="button" onClick={() => set('generalisation_methode', m.id)}
                  className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-colors ${form.generalisation_methode === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${form.generalisation_methode === m.id ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <m.Icon className={`w-4 h-4 ${form.generalisation_methode === m.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${form.generalisation_methode === m.id ? 'text-blue-700' : 'text-slate-700'}`}>{m.label}</p>
                    <p className="text-[10px] text-slate-400">{m.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Mode Manuel ── */}
            {form.generalisation_methode === 'manuel' && (
              <div className="space-y-3">

                {/* Opérateur ET / OU */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Combinaison des filtres :</span>
                  {(['ET','OU'] as const).map(op => (
                    <button key={op} type="button" onClick={() => set('gen_operateur', op)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border-2 transition-colors ${form.gen_operateur === op ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {op}
                    </button>
                  ))}
                </div>

                {/* A – Catégorie(s) */}
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">A</span>
                      <span className="text-xs font-semibold text-slate-700">Catégorie(s) d'équipement</span>
                    </div>
                    <button type="button" onClick={() => setShowCatModal(true)}
                      className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold hover:underline">
                      <Tag className="w-3 h-3" /> Arborescence
                    </button>
                  </div>
                  <div className="px-3 py-2.5">
                    {form.gen_categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {form.gen_categories.map(c => (
                          <span key={c} className="flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                            {c}
                            <button type="button" onClick={() => set('gen_categories', form.gen_categories.filter(x => x !== c))}
                              className="hover:text-red-500 transition-colors">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                        <button type="button" onClick={() => setShowCatModal(true)}
                          className="text-[11px] text-blue-600 font-semibold hover:underline px-1">+ Ajouter</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowCatModal(true)}
                        className="w-full text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg py-2 hover:border-blue-300 hover:text-blue-500 transition-colors">
                        Sélectionner des catégories…
                      </button>
                    )}
                  </div>
                </div>

                {/* B – Résidences / Campus */}
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">B</span>
                      <span className="text-xs font-semibold text-slate-700">Résidence(s) / Campus</span>
                      {selectedResidenceCount > 0 && (
                        <span className="ml-auto text-[10px] font-semibold text-blue-600">{selectedResidenceCount} sélectionné{selectedResidenceCount > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="px-3 pt-2 pb-1">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
                      <input value={arboSearch} onChange={e => setArboSearch(e.target.value)}
                        placeholder="Rechercher dans l'arborescence..."
                        className="w-full text-xs pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200" />
                    </div>
                    <div className="max-h-44 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                      {filteredArbo.map(n => <ArboNode key={n.id} node={n} />)}
                    </div>
                  </div>
                </div>

                {/* C – Sans ce plan */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded flex-shrink-0">C</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700">Sans ce plan de maintenance</p>
                      {form.nom && (
                        <p className="text-[10px] text-slate-400 truncate">Exclure les équipements qui ont déjà « {form.nom} »</p>
                      )}
                    </div>
                  </div>
                  <Toggle checked={form.gen_sans_plan} onChange={v => set('gen_sans_plan', v)} />
                </div>

                {/* Aperçu résultat */}
                {(selectedCatCount > 0 || selectedResidenceCount > 0) && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Aperçu de la sélection</p>
                        <p className="text-xs text-emerald-800">
                          {form.gen_equipements_list.length > 0
                            ? <><strong>{form.gen_equipements_list.filter(e => !form.gen_equipements_exclus.includes(e.id)).length} équipement{form.gen_equipements_list.filter(e => !form.gen_equipements_exclus.includes(e.id)).length > 1 ? 's' : ''}</strong> sélectionné{form.gen_equipements_list.filter(e => !form.gen_equipements_exclus.includes(e.id)).length > 1 ? 's' : ''}{form.gen_equipements_exclus.length > 0 && `, ${form.gen_equipements_exclus.length} exclu${form.gen_equipements_exclus.length > 1 ? 's' : ''}`}</>
                            : <><strong>~{selectedCatCount * 3 + selectedResidenceCount * 2} équipements</strong> estimés{form.gen_sans_plan ? ', hors ceux déjà couverts' : ''}</>
                          }
                        </p>
                      </div>
                      <button type="button" onClick={fetchEquipements} disabled={equipsLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex-shrink-0">
                        {equipsLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                        {equipsLoading ? 'Chargement…' : 'Afficher les équipements'}
                      </button>
                    </div>

                    {form.gen_equipements_list.length > 0 && (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {form.gen_equipements_list.map(eq => {
                          const excluded = form.gen_equipements_exclus.includes(eq.id);
                          return (
                            <div key={eq.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors ${excluded ? 'bg-white/40 border-slate-100 opacity-50' : 'bg-white border-emerald-100'}`}>
                              <button type="button"
                                onClick={() => set('gen_equipements_exclus', excluded
                                  ? form.gen_equipements_exclus.filter(id => id !== eq.id)
                                  : [...form.gen_equipements_exclus, eq.id])}
                                className={`w-4 h-4 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${!excluded ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                {!excluded && <Check className="w-2.5 h-2.5 text-white" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{eq.designation}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {eq.site_nom && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{eq.site_nom}</span>}
                                  {eq.residence_nom && <span className="text-[10px] text-slate-400">{eq.residence_nom}</span>}
                                  {eq.localisation_detail && <span className="text-[10px] text-slate-400 truncate">{eq.localisation_detail}</span>}
                                </div>
                              </div>
                              {eq.marque && (
                                <span className="text-[10px] text-slate-400 flex-shrink-0 flex items-center gap-0.5">
                                  <Camera className="w-2.5 h-2.5" />{eq.marque} {eq.modele}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Mode IA ── */}
            {form.generalisation_methode === 'ia' && (
              <div className="space-y-3">
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-start gap-2">
                  <Bot className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-violet-700">Assistant IA</p>
                    <p className="text-[11px] text-violet-600">Je vais identifier les équipements similaires à généraliser selon la catégorie et la proximité géographique.</p>
                  </div>
                </div>

                {/* Historique messages */}
                {form.gen_ia_messages.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {form.gen_ia_messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] text-[11px] px-3 py-2 rounded-2xl leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-700 rounded-bl-sm'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {iaLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-500 text-[11px] px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                          <span className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
                          Analyse en cours…
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions initiales si pas encore de messages */}
                {form.gen_ia_messages.length === 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Suggestions rapides</p>
                    {[
                      'Tous les équipements de même catégorie sur le même campus',
                      'Mêmes équipements chez le même prestataire',
                      'Toutes les armoires positives du parc CROUS Lyon',
                    ].map(s => (
                      <button key={s} type="button"
                        onClick={() => { set('gen_ia_prompt', s); }}
                        className="w-full text-left text-[11px] text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Saisie */}
                <div className="flex gap-2">
                  <input value={iaInput} onChange={e => setIaInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendIaMessage()}
                    placeholder="Décrivez quels équipements inclure…"
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-200" />
                  <button type="button" onClick={sendIaMessage} disabled={!iaInput.trim() || iaLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ── Fin accordéon ── */}

      {/* Modale arborescence catégories */}
      {showCatModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={() => setShowCatModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Tag className="w-4 h-4 text-blue-500" /> Arborescence des catégories</h3>
              <button type="button" onClick={() => setShowCatModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="space-y-1">
              {[
                { group: 'Froid & Cuisine', items: ['Réfrigération / Froid', 'ÉLECTROMÉNAGER', 'Armoire positive', 'Cuisine professionnelle'] },
                { group: 'Technique bâtiment', items: ['CVC / Climatisation', 'Électricité', 'Plomberie', 'Ascenseurs / Élévateurs'] },
                { group: 'Sécurité & Éclairage', items: ['Sécurité incendie', 'Éclairage'] },
              ].map(g => (
                <div key={g.group}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2 pb-1">{g.group}</p>
                  {g.items.map(item => {
                    const on = form.gen_categories.includes(item);
                    return (
                      <button key={item} type="button"
                        onClick={() => set('gen_categories', on ? form.gen_categories.filter(x => x !== item) : [...form.gen_categories, item])}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${on ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${on ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                          {on && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {item}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setShowCatModal(false)}
              className="w-full py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              Valider ({form.gen_categories.length} sélectionnée{form.gen_categories.length > 1 ? 's' : ''})
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Step 1: Fenêtre + Déclenchement (ex-Step 2) ─────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5 px-6 py-5">
      {/* Fenêtre d'intervention */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Fenêtre d'intervention</span>
        </div>
        <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
          <div>
            <Label>Jours autorisés</Label>
            <div className="flex flex-wrap gap-1.5">
              {JOURS_SEMAINE.map((j, i) => {
                const full = JOURS_FULL[i];
                const on   = form.jours.includes(full);
                return (
                  <button key={j} type="button"
                    onClick={() => set('jours', on ? form.jours.filter(x => x !== full) : [...form.jours, full])}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border-2 transition-colors ${on ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-400'}`}>
                    {j}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1"><Label>Début</Label>
              <input type="time" value={form.heure_debut} onChange={e => set('heure_debut', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="pb-2 text-slate-400">—</div>
            <div className="flex-1"><Label>Fin</Label>
              <input type="time" value={form.heure_fin} onChange={e => set('heure_fin', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
          </div>
          <div className="flex gap-4">
            {[['excl_weekend','Exclure les week-ends'],['excl_feries','Exclure les jours fériés']].map(([k, l]) => (
              <button key={k} type="button" onClick={() => set(k as 'excl_weekend' | 'excl_feries', !form[k as 'excl_weekend' | 'excl_feries'])}
                className="flex items-center gap-2 text-sm text-slate-700">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form[k as 'excl_weekend' | 'excl_feries'] ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                  {form[k as 'excl_weekend' | 'excl_feries'] && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="text-xs">{l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Déclenchement */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Déclenchement</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {([
            { id: 'calendaire', Icon: CalendarDays, label: 'Calendrier',  sub: 'Fréquence fixe' },
            { id: 'compteur',   Icon: TrendingUp,   label: 'Compteur',    sub: "Selon l'usage"  },
            { id: 'condition',  Icon: Zap,           label: 'Condition',   sub: 'Selon un seuil' },
          ] as { id: FormData['mode']; Icon: React.ElementType; label: string; sub: string }[]).map(m => (
            <button key={m.id} type="button" onClick={() => set('mode', m.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${form.mode === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <m.Icon className={`w-5 h-5 ${form.mode === m.id ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`text-xs font-bold ${form.mode === m.id ? 'text-blue-700' : 'text-slate-600'}`}>{m.label}</span>
              <span className="text-[10px] text-slate-400">{m.sub}</span>
            </button>
          ))}
        </div>

        {form.mode === 'calendaire' && (
          <div className="space-y-3">
            <div>
              <Label required>Première échéance</Label>
              <input type="date" value={form.premiere_echeance} onChange={e => set('premiere_echeance', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <RecurrencePanel config={form.recurrence} onChange={cfg => set('recurrence', cfg)} />
          </div>
        )}

        {form.mode === 'compteur' && (
          <div className="space-y-3">
            <div>
              <Label required>Compteur concerné</Label>
              <div className="relative">
                <select value={form.compteur_type} onChange={e => set('compteur_type', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                  {['Heures de fonctionnement','Cycles','Nombre de démarrages','Kilométrage'].map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label required>Déclencher tous les</Label>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={form.compteur_valeur} onChange={e => set('compteur_valeur', e.target.value)}
                  className="w-24 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                <span className="text-sm text-slate-500">{form.compteur_type.toLowerCase()}</span>
              </div>
            </div>
          </div>
        )}

        {form.mode === 'condition' && (
          <div className="space-y-3">
            <div>
              <Label required>Condition de déclenchement</Label>
              <input value={form.condition_label} onChange={e => set('condition_label', e.target.value)}
                placeholder="Ex : Température > seuil"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <Label required>Valeur seuil</Label>
              <div className="flex items-center gap-2">
                <input value={form.condition_seuil} onChange={e => set('condition_seuil', e.target.value)}
                  className="w-28 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                <span className="text-sm text-slate-500">°C / unité</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Step 2: Tâches + Assignation (ex-Step 3) ────────────────────────────
  const previewDates = generateDatesFromRecurrence(form.recurrence, form.premiere_echeance);

  const renderStep2 = () => (
    <div className="space-y-4 px-6 py-5">
      {/* Generate from recurrence */}
      {form.mode === 'calendaire' && form.recurrence.active && previewDates.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-700">{previewDates.length} occurrence{previewDates.length > 1 ? 's' : ''} planifiée{previewDates.length > 1 ? 's' : ''}</p>
            <p className="text-[11px] text-blue-500">{previewDates[0]} → {previewDates[previewDates.length - 1]}</p>
            {form.gen_equipements_list.filter(e => !form.gen_equipements_exclus.includes(e.id)).length > 1 && (
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                × {form.gen_equipements_list.filter(e => !form.gen_equipements_exclus.includes(e.id)).length} équipements = {previewDates.length * form.gen_equipements_list.filter(e => !form.gen_equipements_exclus.includes(e.id)).length} tâches
              </p>
            )}
          </div>
          <button type="button" onClick={generateTasksFromRecurrence}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-3 h-3" /> Générer les tâches
          </button>
        </div>
      )}

      {/* Group assignment */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assigner toutes les tâches</p>
        </div>
        <div className="px-4 py-3">
          <AssigneeField
            mode={form.globalAssignMode}
            assignee={form.globalAssignee}
            assignOpen={form.globalAssignOpen}
            assignSearch={form.globalAssignSearch}
            onUpdate={patch => setForm(prev => ({ ...prev,
              globalAssignMode: patch.assignMode ?? prev.globalAssignMode,
              globalAssignee:   patch.assignee   ?? prev.globalAssignee,
              globalAssignOpen: patch.assignOpen !== undefined ? patch.assignOpen : prev.globalAssignOpen,
              globalAssignSearch: patch.assignSearch ?? prev.globalAssignSearch,
            }))}
          />
          {form.globalAssignee && (
            <button type="button" onClick={applyGlobalAssign}
              className="mt-2 w-full text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition-colors">
              Appliquer à toutes les tâches ({form.tasks.length})
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {form.tasks.map((t, idx) => {
          const effectiveAssignee = t.assignee || form.globalAssignee;
          const effectiveMode    = t.assignee ? t.assignMode : form.globalAssignMode;
          const AssignIcon = effectiveMode === 'agent' ? User : effectiveMode === 'equipe' ? Users : Building2;
          return (
          <div key={t.id} className="border border-slate-200 rounded-xl overflow-hidden group shadow-sm">
            {/* ── Accordion header ── */}
            <button
              type="button"
              onClick={() => updateTask(t.id, { taskOpen: !t.taskOpen })}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-slate-50 transition-colors text-left"
            >
              <GripVertical className="w-4 h-4 text-slate-300 cursor-grab flex-shrink-0" onClick={e => e.stopPropagation()} />
              <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</div>

              {/* Col A — Tâche + équipement + localisation */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate leading-tight">{t.label || <span className="text-slate-400 italic">Tâche sans titre</span>}</p>
                {t.equipementDesignation && (
                  <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{t.equipementDesignation}</p>
                )}
                {t.description && (
                  <p className="text-[10px] text-slate-400 truncate leading-tight">{t.description}</p>
                )}
              </div>

              {/* Col B — Assigné à */}
              {effectiveAssignee ? (
                <div className="flex items-center gap-1 flex-shrink-0 px-2 py-0.5 bg-blue-50 rounded-full">
                  <AssignIcon className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-medium text-blue-700 max-w-[80px] truncate">{effectiveAssignee}</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-300 flex-shrink-0 px-2">—</span>
              )}

              {/* Col C — Durée */}
              <div className="flex items-center gap-1 flex-shrink-0 text-[10px] text-slate-500 min-w-[36px] justify-end">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{t.duree}</span>
              </div>

              {/* Col D — Date */}
              {t.date && (
                <span className="text-[10px] font-medium text-slate-500 flex-shrink-0 min-w-[68px] text-right">
                  {new Date(t.date).toLocaleDateString('fr-FR')}
                </span>
              )}

              {/* Chevron + delete */}
              {t.taskOpen
                ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              }
              <button type="button" onClick={e => { e.stopPropagation(); removeTask(t.id); }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </button>

            {/* ── Accordion body ── */}
            {t.taskOpen && (
              <div className="border-t border-slate-100">
                {/* Title edit row */}
                <div className="px-3 pt-3 pb-0">
                  <Label>Libellé de la tâche</Label>
                  <input value={t.label} onChange={e => updateTask(t.id, { label: e.target.value })} placeholder="Libellé de la tâche *"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200" />
                </div>
                <div className="px-3 py-3 grid grid-cols-2 gap-3">
                  {!t.equipementDesignation && (
                    <div>
                      <Label>Description</Label>
                      <input value={t.description} onChange={e => updateTask(t.id, { description: e.target.value })} placeholder="Précisions (optionnel)"
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200" />
                    </div>
                  )}
                  <div>
                    <Label>Durée estimée</Label>
                    <div className="relative">
                      <select value={t.duree} onChange={e => updateTask(t.id, { duree: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-200 bg-white">
                        {DUREES.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label>Date planifiée</Label>
                    <input type="date" value={t.date} onChange={e => updateTask(t.id, { date: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200" />
                  </div>
                  <div className="col-span-2">
                    <Label>Assigné à</Label>
                    <AssigneeField mode={t.assignMode} assignee={t.assignee} assignOpen={t.assignOpen} assignSearch={t.assignSearch}
                      onUpdate={patch => updateTask(t.id, {
                        assignMode: patch.assignMode ?? t.assignMode,
                        assignee:   patch.assignee   ?? t.assignee,
                        assignOpen: patch.assignOpen !== undefined ? patch.assignOpen : t.assignOpen,
                        assignSearch: patch.assignSearch ?? t.assignSearch,
                      })} />
                  </div>
                </div>
                {/* Checklist */}
                {t.checklist && t.checklist.length > 0 && (
                  <div className="border-t border-slate-100">
                    <button type="button"
                      onClick={() => updateTask(t.id, { checklistOpen: !t.checklistOpen })}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left transition-colors">
                      {t.checklistOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                      <span className="text-[11px] font-semibold text-slate-500">Check-list ({t.checklist.length} actions)</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{t.checklist.filter(c => c.done).length}/{t.checklist.length} fait{t.checklist.filter(c => c.done).length > 1 ? 's' : ''}</span>
                    </button>
                    {t.checklistOpen && (
                      <div className="px-3 pb-3 space-y-1">
                        {t.checklist.map(cl => (
                          <div key={cl.id} className="flex items-center gap-2">
                            <button type="button"
                              onClick={() => updateTask(t.id, { checklist: t.checklist!.map(c => c.id === cl.id ? { ...c, done: !c.done } : c) })}
                              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${cl.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                              {cl.done && <Check className="w-2.5 h-2.5 text-white" />}
                            </button>
                            <span className={`text-xs ${cl.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{cl.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>

      <button type="button" onClick={addTask}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 border-2 border-dashed border-blue-200 rounded-xl py-2.5 hover:bg-blue-50 hover:border-blue-300 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Ajouter une tâche
      </button>

      {/* Notifications */}
      <div className="border border-slate-100 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notifications</p>
        {([['notif_responsable','Responsable affecté'],['notif_gestionnaire','Gestionnaire maintenance'],['notif_app','Notification applicative'],['notif_email','Email']] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => set(k, !form[k])} className="flex items-center gap-2 text-sm text-slate-700 w-full">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${form[k] ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
              {form[k] && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="text-xs">{l}</span>
          </button>
        ))}
      </div>

      {/* Recalage */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gestion des retards</p>
        {([['initial',RotateCcw,'Conserver le calendrier initial'],['auto',Clock,'Recaler automatiquement'],['validation',Bell,'Recaler avec validation']] as [FormData['recalage_mode'], React.ElementType, string][]).map(([v, Icon, l]) => (
          <button key={v} type="button" onClick={() => set('recalage_mode', v)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${form.recalage_mode === v ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${form.recalage_mode === v ? 'bg-blue-100' : 'bg-slate-100'}`}>
              <Icon className={`w-4 h-4 ${form.recalage_mode === v ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
            <span className={`text-xs font-bold ${form.recalage_mode === v ? 'text-blue-700' : 'text-slate-700'}`}>{l}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Step 3: Pièces + Approvisionnement préventif (ex-Step 4) ─────────────
  const renderStep3 = () => (
    <div className="space-y-4 px-6 py-5">
      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <Package className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-500">Cette étape est <strong>optionnelle</strong>. Vous pouvez l'ignorer et créer le plan directement.</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Article','Référence','Qté','Unité','Stock actuel','Statut',''].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {form.pieces.map(p => {
              const ratio = p.stock_actuel / Math.max(p.quantite, 1);
              const st = ratio >= 1 ? { label: 'Couvert', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' }
                       : ratio >= 0.5 ? { label: 'Sous seuil', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
                       : { label: 'Rupture', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 group">
                  <td className="px-3 py-2"><input value={p.article} onChange={e => updatePiece(p.id, { article: e.target.value })} className="w-36 text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-200" placeholder="Nom article" /></td>
                  <td className="px-3 py-2"><input value={p.reference} onChange={e => updatePiece(p.id, { reference: e.target.value })} className="w-28 text-xs border border-slate-200 rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-blue-200" placeholder="REF" /></td>
                  <td className="px-3 py-2"><input type="number" min={1} value={p.quantite} onChange={e => updatePiece(p.id, { quantite: +e.target.value })} className="w-14 text-xs border border-slate-200 rounded px-2 py-1 text-center focus:outline-none" /></td>
                  <td className="px-3 py-2">
                    <select value={p.unite} onChange={e => updatePiece(p.id, { unite: e.target.value })} className="text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none">
                      {['pcs','L','kg','m','flacons','boites'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2"><input type="number" min={0} value={p.stock_actuel} onChange={e => updatePiece(p.id, { stock_actuel: +e.target.value })} className="w-14 text-xs border border-slate-200 rounded px-2 py-1 text-center focus:outline-none" /></td>
                  <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}</span></td>
                  <td className="px-2 py-2"><button type="button" onClick={() => removePiece(p.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {form.pieces.length === 0 && <p className="py-4 text-center text-xs text-slate-400">Aucune pièce ajoutée</p>}
      </div>
      <button type="button" onClick={addPiece}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 border-2 border-dashed border-blue-200 rounded-xl py-2.5 hover:bg-blue-50 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Ajouter une pièce
      </button>

      {/* Approvisionnement préventif — décoché par défaut */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-slate-700">Approvisionnement préventif</span>
          </div>
          <Toggle checked={form.appro_preventif} onChange={v => set('appro_preventif', v)} />
        </div>
        {form.appro_preventif && (
          <div className="px-4 py-4 bg-white space-y-3">
            <div>
              <Label>Délai d'anticipation</Label>
              <div className="flex gap-2">
                {(['30','60','90','120'] as const).map(d => (
                  <button key={d} type="button" onClick={() => set('appro_delai', d)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border-2 transition-colors ${form.appro_delai === d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                    {d}j{d === '60' ? ' ★' : ''}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['manuel','assiste','automatique'] as const).map(v => (
                  <button key={v} type="button" onClick={() => set('appro_mode', v)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border-2 capitalize transition-colors ${form.appro_mode === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                    {v === 'assiste' ? 'Assisté' : v === 'automatique' ? 'Automatique' : 'Manuel'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const STEP_CONTENT = [renderStep0, renderStep1, renderStep2, renderStep3];


  return (
    <>
      {showLibrary && <PlanLibraryModal onSelect={applyLibrary} onClose={() => setShowLib(false)} />}

      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: '100%', maxWidth: 760, maxHeight: '94vh' }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape {step + 1} sur {STEP_LABELS.length}</span>
                  <div className="flex items-center gap-0.5">
                    {STEP_LABELS.map((_, i) => <div key={i} className={`h-1 rounded-full transition-all ${i <= step ? 'bg-blue-500 w-6' : 'bg-slate-200 w-4'}`} />)}
                  </div>
                </div>
                <h2 className="text-base font-bold text-slate-800">Créer un plan de maintenance préventive</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* Completeness bar */}
          <CompletenessBar form={form} maxStepReached={maxStepReached} />

          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {STEP_CONTENT[step]()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white flex-shrink-0">
            <button type="button" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
              className="flex items-center gap-1.5 text-sm text-slate-500 font-medium px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Annuler' : 'Précédent'}
            </button>
            <div className="flex items-center gap-2">
              {step === 3 && (
                <button type="button" onClick={handleCreate} disabled={saving}
                  className="text-sm font-semibold text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
                  Ignorer les pièces et créer
                </button>
              )}
              {!isLastStep ? (
                <button type="button" onClick={() => { setStep(s => { const n = s + 1; setMaxStepReached(prev => Math.max(prev, n)); return n; }); }}
                  className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleCreate} disabled={saving || !form.nom.trim()}
                  className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-50 ${success ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {saving ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Création…</>
                  : success ? <><CheckCircle2 className="w-4 h-4" /> Plan créé !</>
                  : <>Créer le plan <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
