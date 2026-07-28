import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  ZoomIn, ZoomOut, Crosshair,
  Filter, X, Search, SlidersHorizontal,
  CheckCircle2, Circle,
  User, MapPin, Building2, Calendar, Clock,
  Wrench, AlertTriangle, Tag, Users, FileText, Folder,
} from 'lucide-react';
import { ALL_SITES, ALL_RESIDENCES, EQUIP_CATS } from '../GedFilterBar';
import { STATUT_DI_CFG, CRITICITE_CFG, CATEGORIES_DI, type StatutDI, type CriticiteDI } from './interventionsTypes';

const STATUTS_KEYS  = Object.keys(STATUT_DI_CFG) as StatutDI[];
const CRITICITE_KEYS = Object.keys(CRITICITE_CFG) as CriticiteDI[];

// ─── Types ─────────────────────────────────────────────────────────────────────

type Priorite = 'basse' | 'normale' | 'haute' | 'urgente';
type TypeAffaire = 'affaire' | 'chantier' | 'projet' | 'maintenance';

interface GanttTask {
  id: string;
  label: string;
  debut: string;
  fin: string;
  statut: StatutDI;
  assigne_a?: string;
  priorite?: Priorite;
  terminee?: boolean;
  description?: string;
}

interface GanttIntervention {
  id: string;
  reference: string;
  titre: string;
  type: TypeAffaire;
  statut: StatutDI;
  priorite: Priorite;
  site: string;
  batiment: string;
  localisation?: string;
  description: string;
  responsable: string;
  acteurs: string[];
  debut: string;
  fin: string;
  date_butoir: string;
  tasks: GanttTask[];
}

// ─── Mock data ──────────────────────────────────────────────────────────────────

const RESPONSABLES = ['Martin D.', 'Leroy P.', 'Dupont A.', 'Bernard C.', 'Moreau F.', 'Simon B.'];
const SITES = ['Limoges – Jean-Macé', 'Limoges – Beaubreuil', 'Limoges – La Bastide', 'Limoges – Hôtel de Ville', 'CROUS Lyon – Résidence A'];

const MOCK_INTERVENTIONS: GanttIntervention[] = [
  {
    id: 'g1',
    reference: 'AFF-2026-001',
    titre: 'Réfection toiture École Jean-Macé',
    type: 'affaire',
    statut: 'en_intervention',
    priorite: 'haute',
    site: 'Limoges – Jean-Macé',
    batiment: 'Bâtiment Principal',
    localisation: 'Toiture – Niveau R+2',
    description: "Réfection complète de la toiture du bâtiment principal suite à des infiltrations répétées. Remplacement de la membrane d'étanchéité et pose de nouvelles tuiles.",
    responsable: 'Martin D.',
    acteurs: ['Martin D.', 'Simon B.', 'Thermocom', 'Sabeko'],
    debut: '2026-05-12',
    fin: '2026-07-18',
    date_butoir: '2026-07-31',
    tasks: [
      { id: 'g1t1', label: 'Diagnostic toiture', debut: '2026-05-12', fin: '2026-05-16', statut: 'resolu', terminee: true, assigne_a: 'Martin D.', description: 'Inspection visuelle et sondages de la toiture existante. Relevé des zones dégradées.' },
      { id: 'g1t2', label: 'Devis & validation', debut: '2026-05-19', fin: '2026-05-30', statut: 'resolu', terminee: true, assigne_a: 'Simon B.', description: 'Consultation des prestataires, analyse des devis et validation par la direction technique.' },
      { id: 'g1t3', label: 'Dépose ancienne toiture', debut: '2026-06-02', fin: '2026-06-13', statut: 'en_intervention', terminee: false, assigne_a: 'Thermocom', description: "Dépose de l'ensemble des tuiles et éléments de couverture existants. Évacuation des déchets." },
      { id: 'g1t4', label: 'Pose membrane étanchéité', debut: '2026-06-16', fin: '2026-06-27', statut: 'affecte', terminee: false, assigne_a: 'Thermocom', description: "Pose d'une nouvelle membrane d'étanchéité bicouche avec primaire d'accrochage." },
      { id: 'g1t5', label: 'Pose tuiles finales', debut: '2026-06-30', fin: '2026-07-11', statut: 'qualifie', terminee: false, assigne_a: 'Sabeko', description: 'Pose des tuiles de couverture et fixation des faîtières.' },
      { id: 'g1t6', label: 'Réception & contrôle', debut: '2026-07-14', fin: '2026-07-18', statut: 'nouveau', terminee: false, assigne_a: 'Martin D.', description: "Visite de réception avec le MOE, test d'étanchéité et levée des réserves." },
    ],
  },
  {
    id: 'g2',
    reference: 'CHT-2026-003',
    titre: 'Mise aux normes électriques – Beaubreuil',
    type: 'chantier',
    statut: 'affecte',
    priorite: 'urgente',
    site: 'Limoges – Beaubreuil',
    batiment: 'Bloc Enseignement',
    localisation: 'Tableaux électriques – RDC & R+1',
    description: "Mise en conformité des installations électriques suite au rapport CONSUEL défavorable. Remplacement de l'ensemble des tableaux de distribution et reprise du câblage des salles de classe.",
    responsable: 'Leroy P.',
    acteurs: ['Leroy P.', 'Laurent E.', 'MSI', 'Sauvignet'],
    debut: '2026-06-01',
    fin: '2026-08-29',
    date_butoir: '2026-09-01',
    tasks: [
      { id: 'g2t1', label: 'Audit tableau électrique', debut: '2026-06-01', fin: '2026-06-05', statut: 'resolu', terminee: true, assigne_a: 'Leroy P.', description: 'Audit complet des installations par le bureau de contrôle. Relevé des non-conformités.' },
      { id: 'g2t2', label: 'Plan de câblage', debut: '2026-06-08', fin: '2026-06-19', statut: 'resolu', terminee: true, assigne_a: 'Laurent E.', description: 'Élaboration du plan de câblage révisé avec les schémas unifilaires mis à jour.' },
      { id: 'g2t3', label: 'Remplacement tableaux', debut: '2026-06-22', fin: '2026-07-10', statut: 'affecte', terminee: false, assigne_a: 'MSI', description: 'Dépose des anciens tableaux et pose des nouveaux tableaux de distribution conformes.' },
      { id: 'g2t4', label: 'Câblage salles de classe', debut: '2026-07-14', fin: '2026-08-01', statut: 'qualifie', terminee: false, assigne_a: 'Sauvignet', description: "Reprise du câblage dans l'ensemble des 12 salles de classe du bloc." },
      { id: 'g2t5', label: 'Tests & conformité', debut: '2026-08-04', fin: '2026-08-22', statut: 'nouveau', terminee: false, assigne_a: 'Leroy P.', description: 'Tests des disjoncteurs, vérification de la continuité de terre et essais de fonctionnement.' },
      { id: 'g2t6', label: 'CONSUEL & réception', debut: '2026-08-25', fin: '2026-08-29', statut: 'nouveau', terminee: false, assigne_a: 'Laurent E.', description: 'Passage du contrôleur CONSUEL pour visa de conformité et réception officielle des travaux.' },
    ],
  },
  {
    id: 'g3',
    reference: 'PRJ-2026-007',
    titre: 'Rénovation façades – La Bastide',
    type: 'projet',
    statut: 'qualifie',
    priorite: 'normale',
    site: 'Limoges – La Bastide',
    batiment: 'Façade Nord',
    localisation: 'Façades extérieures – Ensemble du bâtiment',
    description: 'Projet de ravalement complet des façades extérieures incluant le nettoyage haute pression, la réfection des enduits dégradés et la peinture de finition.',
    responsable: 'Dupont A.',
    acteurs: ['Dupont A.', 'Bernard C.'],
    debut: '2026-06-15',
    fin: '2026-09-30',
    date_butoir: '2026-10-15',
    tasks: [
      { id: 'g3t1', label: 'Sondages & diagnostics', debut: '2026-06-15', fin: '2026-06-26', statut: 'en_intervention', terminee: false, assigne_a: 'Dupont A.', description: "Sondages des enduits existants et diagnostic de l'état structurel des façades." },
      { id: 'g3t2', label: 'Échafaudage', debut: '2026-06-29', fin: '2026-07-04', statut: 'qualifie', terminee: false, assigne_a: 'Bernard C.', description: "Montage de l'échafaudage tubulaire sur l'ensemble du périmètre du bâtiment." },
      { id: 'g3t3', label: 'Ravalement façade', debut: '2026-07-07', fin: '2026-08-28', statut: 'nouveau', terminee: false, assigne_a: 'Dupont A.', description: "Nettoyage HP, reprise des fissures, application de l'enduit de ragréage et finition." },
      { id: 'g3t4', label: 'Peinture & finitions', debut: '2026-09-01', fin: '2026-09-19', statut: 'nouveau', terminee: false, assigne_a: 'Bernard C.', description: 'Application de deux couches de peinture hydrofuge teinte RAL 9001.' },
      { id: 'g3t5', label: 'Démontage & réception', debut: '2026-09-22', fin: '2026-09-30', statut: 'nouveau', terminee: false, assigne_a: 'Dupont A.', description: "Démontage de l'échafaudage, nettoyage du site et visite de réception." },
    ],
  },
  {
    id: 'g4',
    reference: 'MAI-2026-012',
    titre: 'Maintenance préventive CVC – Hôtel de Ville',
    type: 'maintenance',
    statut: 'en_intervention',
    priorite: 'normale',
    site: 'Limoges – Hôtel de Ville',
    batiment: 'Tout le bâtiment',
    localisation: 'Chaufferie, combles, gaines techniques',
    description: "Campagne annuelle de maintenance préventive des équipements CVC : chaudières, centrales de traitement d'air, VMC et régulateurs de température.",
    responsable: 'Bernard C.',
    acteurs: ['Bernard C.', 'Moreau F.', 'Atmeo'],
    debut: '2026-06-03',
    fin: '2026-06-27',
    date_butoir: '2026-06-30',
    tasks: [
      { id: 'g4t1', label: 'Contrôle chaudières', debut: '2026-06-03', fin: '2026-06-06', statut: 'resolu', terminee: true, assigne_a: 'Atmeo', description: 'Vérification de la combustion, nettoyage des brûleurs et contrôle des sécurités.' },
      { id: 'g4t2', label: 'Nettoyage filtres CTA', debut: '2026-06-09', fin: '2026-06-13', statut: 'resolu', terminee: true, assigne_a: 'Bernard C.', description: "Remplacement des filtres G4 et F7 sur les 3 centrales de traitement d'air." },
      { id: 'g4t3', label: 'Vérification VMC', debut: '2026-06-16', fin: '2026-06-20', statut: 'en_intervention', terminee: false, assigne_a: 'Moreau F.', description: 'Contrôle des débits, nettoyage des bouches et vérification des motoréducteurs.' },
      { id: 'g4t4', label: 'Rapport & clôture', debut: '2026-06-23', fin: '2026-06-27', statut: 'nouveau', terminee: false, assigne_a: 'Bernard C.', description: "Rédaction du rapport de maintenance, mise à jour du carnet d'entretien et clôture de l'ordre de service." },
    ],
  },
  {
    id: 'g5',
    reference: 'AFF-2026-015',
    titre: 'Remplacement menuiseries extérieures – CROUS Lyon A',
    type: 'affaire',
    statut: 'nouveau',
    priorite: 'basse',
    site: 'CROUS Lyon – Résidence A',
    batiment: 'Bâtiment A1',
    localisation: 'Fenêtres et portes-fenêtres – Tous niveaux',
    description: 'Remplacement de 48 menuiseries extérieures simple vitrage par des doubles vitrages à haute performance énergétique. Amélioration du coefficient Uw de 4,5 à 1,2 W/m²K.',
    responsable: 'Moreau F.',
    acteurs: ['Moreau F.', 'Simon B.'],
    debut: '2026-07-06',
    fin: '2026-08-14',
    date_butoir: '2026-08-31',
    tasks: [
      { id: 'g5t1', label: 'Inventaire menuiseries', debut: '2026-07-06', fin: '2026-07-10', statut: 'nouveau', terminee: false, assigne_a: 'Moreau F.', description: "Relevé exhaustif des 48 menuiseries : dimensions, état, sens d'ouverture." },
      { id: 'g5t2', label: 'Commande matériaux', debut: '2026-07-13', fin: '2026-07-17', statut: 'nouveau', terminee: false, assigne_a: 'Simon B.', description: 'Passation des commandes auprès du fournisseur retenu avec délai de livraison de 15 jours.' },
      { id: 'g5t3', label: 'Pose remplacement', debut: '2026-07-20', fin: '2026-08-07', statut: 'nouveau', terminee: false, assigne_a: 'Moreau F.', description: 'Dépose des menuiseries existantes et pose des nouvelles unité par unité pour maintenir la sécurité.' },
      { id: 'g5t4', label: 'Contrôle & étanchéité', debut: '2026-08-10', fin: '2026-08-14', statut: 'nouveau', terminee: false, assigne_a: 'Simon B.', description: "Test d'étanchéité à l'eau et à l'air, mesures thermiques et levée des réserves." },
    ],
  },
  {
    id: 'g6',
    reference: 'CHT-2026-018',
    titre: 'Réhabilitation sanitaires – Beaubreuil RDC',
    type: 'chantier',
    statut: 'a_qualifier',
    priorite: 'haute',
    site: 'Limoges – Beaubreuil',
    batiment: 'RDC – Aile Ouest',
    localisation: 'Blocs sanitaires – Aile Ouest, RDC',
    description: "Réhabilitation complète des blocs sanitaires du RDC de l'aile Ouest : démolition des revêtements existants, reprise des réseaux d'évacuation, recarrelage et pose de nouveaux sanitaires.",
    responsable: 'Simon B.',
    acteurs: ['Simon B.', 'Leroy P.', 'Sabeko'],
    debut: '2026-08-17',
    fin: '2026-10-02',
    date_butoir: '2026-10-15',
    tasks: [
      { id: 'g6t1', label: 'Diagnostics sanitaires', debut: '2026-08-17', fin: '2026-08-21', statut: 'nouveau', terminee: false, assigne_a: 'Simon B.', description: "État des lieux complet : réseaux d'évacuation, canalisations, état du carrelage." },
      { id: 'g6t2', label: 'Démolition carrelages', debut: '2026-08-24', fin: '2026-09-04', statut: 'nouveau', terminee: false, assigne_a: 'Leroy P.', description: 'Dépose du carrelage mural et au sol, évacuation des gravats, préparation des supports.' },
      { id: 'g6t3', label: 'Plomberie & évacuations', debut: '2026-09-07', fin: '2026-09-18', statut: 'nouveau', terminee: false, assigne_a: 'Sabeko', description: "Reprise des collecteurs d'évacuation, pose des nouveaux siphons et raccordements." },
      { id: 'g6t4', label: 'Carrelage & faïence', debut: '2026-09-21', fin: '2026-09-25', statut: 'nouveau', terminee: false, assigne_a: 'Simon B.', description: "Pose du carrelage sol antidérapant et de la faïence murale jusqu'en hauteur." },
      { id: 'g6t5', label: 'Pose sanitaires', debut: '2026-09-28', fin: '2026-10-02', statut: 'nouveau', terminee: false, assigne_a: 'Leroy P.', description: 'Installation des équipements sanitaires (WC, lavabos, urinoirs) et finitions.' },
    ],
  },
];

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<TypeAffaire, { label: string; bg: string; text: string; border: string; fullBg: string }> = {
  affaire:     { label: 'Affaire',     bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    fullBg: '#dbeafe' },
  chantier:    { label: 'Chantier',    bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   fullBg: '#fef3c7' },
  projet:      { label: 'Projet',      bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  fullBg: '#ede9fe' },
  maintenance: { label: 'Maintenance', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', fullBg: '#d1fae5' },
};

const PRIORITE_CFG: Record<Priorite, { label: string; dot: string; badge: string; badgeText: string }> = {
  basse:   { label: 'Basse',   dot: 'bg-slate-300',  badge: 'bg-slate-100', badgeText: 'text-slate-600'  },
  normale: { label: 'Normale', dot: 'bg-blue-400',   badge: 'bg-blue-50',   badgeText: 'text-blue-700'   },
  haute:   { label: 'Haute',   dot: 'bg-orange-500', badge: 'bg-orange-50', badgeText: 'text-orange-700' },
  urgente: { label: 'Urgente', dot: 'bg-red-500',    badge: 'bg-red-50',    badgeText: 'text-red-700'    },
};

const TASK_STATUS_COLORS: Record<StatutDI, { bar: string; text: string }> = {
  brouillon:             { bar: 'bg-slate-300',   text: 'text-slate-600'   },
  nouveau:               { bar: 'bg-blue-300',    text: 'text-blue-700'    },
  a_qualifier:           { bar: 'bg-orange-400',  text: 'text-orange-700'  },
  qualifie:              { bar: 'bg-sky-400',      text: 'text-sky-700'     },
  affecte:               { bar: 'bg-cyan-400',    text: 'text-cyan-700'    },
  en_intervention:       { bar: 'bg-yellow-400',  text: 'text-yellow-700'  },
  en_attente_validation: { bar: 'bg-violet-400',  text: 'text-violet-700'  },
  resolu:                { bar: 'bg-emerald-500', text: 'text-emerald-700' },
  cloture:               { bar: 'bg-slate-400',   text: 'text-slate-600'   },
  rejete:                { bar: 'bg-red-400',      text: 'text-red-700'     },
};

const INTERVENTION_BAR_COLORS: Record<StatutDI, string> = {
  brouillon:             'bg-slate-200 border-slate-300',
  nouveau:               'bg-blue-100 border-blue-300',
  a_qualifier:           'bg-orange-100 border-orange-400',
  qualifie:              'bg-sky-100 border-sky-400',
  affecte:               'bg-cyan-100 border-cyan-400',
  en_intervention:       'bg-yellow-100 border-yellow-400',
  en_attente_validation: 'bg-violet-100 border-violet-400',
  resolu:                'bg-emerald-100 border-emerald-400',
  cloture:               'bg-slate-100 border-slate-300',
  rejete:                'bg-red-100 border-red-400',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Scale = 'semaine' | 'mois' | 'trimestre' | 'annee';

function parseDate(iso: string): Date { return new Date(iso + 'T00:00:00'); }
function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime() - a.getTime()) / 86400000); }
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfWeek(d: Date): Date { const r = new Date(d); const day = r.getDay(); r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day)); return r; }
function startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfQuarter(d: Date): Date { return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1); }
function startOfYear(d: Date): Date { return new Date(d.getFullYear(), 0, 1); }
function fmtFR(d: Date, opts: Intl.DateTimeFormatOptions): string { return d.toLocaleDateString('fr-FR', opts); }

const COL_WIDTH_BY_SCALE: Record<Scale, number> = { semaine: 28, mois: 14, trimestre: 6, annee: 2 };

function buildColumns(viewStart: Date, totalDays: number, scale: Scale) {
  const cols: { date: Date; label: string; subLabel?: string; span: number }[] = [];
  if (scale === 'semaine') {
    let cur = startOfWeek(viewStart);
    while (daysBetween(viewStart, cur) < totalDays) {
      const weekNum = Math.ceil((daysBetween(new Date(cur.getFullYear(), 0, 1), cur) + 1) / 7);
      cols.push({ date: cur, label: `S${weekNum}`, subLabel: fmtFR(cur, { day: '2-digit', month: 'short' }), span: 7 });
      cur = addDays(cur, 7);
    }
  } else if (scale === 'mois') {
    let cur = startOfMonth(viewStart);
    while (daysBetween(viewStart, cur) < totalDays) {
      const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
      cols.push({ date: cur, label: fmtFR(cur, { month: 'long' }), subLabel: String(cur.getFullYear()), span: daysInMonth });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  } else if (scale === 'trimestre') {
    let cur = startOfQuarter(viewStart);
    while (daysBetween(viewStart, cur) < totalDays) {
      const q = Math.floor(cur.getMonth() / 3) + 1;
      const daysInQ = [0, 90, 91, 92, 92][q] ?? 91;
      cols.push({ date: cur, label: `T${q} ${cur.getFullYear()}`, span: daysInQ });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 3, 1);
    }
  } else {
    let cur = startOfYear(viewStart);
    while (daysBetween(viewStart, cur) < totalDays) {
      const isLeap = cur.getFullYear() % 4 === 0;
      cols.push({ date: cur, label: String(cur.getFullYear()), span: isLeap ? 366 : 365 });
      cur = new Date(cur.getFullYear() + 1, 0, 1);
    }
  }
  return cols;
}

const MIN_LEFT_PANEL = 160;
const MAX_LEFT_PANEL = 600;
const DEFAULT_LEFT_PANEL = 300;
const ROW_H = 40;

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface ModalState {
  intervention: GanttIntervention;
  task: GanttTask | null;
}

function DetailModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const { intervention: intv, task } = state;
  const typeCfg = TYPE_CFG[intv.type];
  const priorCfg = PRIORITE_CFG[intv.priorite];
  const progress = Math.round((intv.tasks.filter(t => t.terminee).length / intv.tasks.length) * 100);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border} flex-shrink-0`}>
              {typeCfg.label}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-slate-400">{intv.reference}</p>
              <h2 className="text-base font-bold text-slate-800 leading-tight truncate">{intv.titre}</h2>
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Intervention recap */}
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Affaire / Intervention</p>

            {/* Description */}
            {intv.description && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed">
                {intv.description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Site" value={intv.site} />
              <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Bâtiment" value={intv.batiment} />
              {intv.localisation && (
                <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label="Localisation" value={intv.localisation} />
              )}
              <InfoRow
                icon={<AlertTriangle className="w-3.5 h-3.5" />}
                label="Priorité"
                value={
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${priorCfg.badge} ${priorCfg.badgeText}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorCfg.dot}`} />
                    {priorCfg.label}
                  </span>
                }
              />
              <InfoRow
                icon={<Calendar className="w-3.5 h-3.5" />}
                label="Période"
                value={`${fmtFR(parseDate(intv.debut), { day: '2-digit', month: 'short', year: 'numeric' })} → ${fmtFR(parseDate(intv.fin), { day: '2-digit', month: 'short', year: 'numeric' })}`}
              />
              <InfoRow
                icon={<Clock className="w-3.5 h-3.5 text-red-400" />}
                label="Date butoir"
                value={<span className="font-semibold text-red-600">{fmtFR(parseDate(intv.date_butoir), { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
              />
            </div>

            {/* Avancement */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Avancement global</span>
                <span className="text-xs font-bold text-slate-700">{progress}% ({intv.tasks.filter(t => t.terminee).length}/{intv.tasks.length} tâches)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Acteurs */}
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Acteurs impliqués
              </p>
              <div className="flex flex-wrap gap-1.5">
                {intv.acteurs.map(a => (
                  <span key={a} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">{a}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Task detail (if a task was clicked) */}
          {task && (
            <div className="px-6 py-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Tâche sélectionnée</p>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center gap-2 mb-3">
                  {task.terminee
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  }
                  <p className="text-sm font-bold text-slate-800">{task.label}</p>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-semibold ${TASK_STATUS_COLORS[task.statut].bar} ${TASK_STATUS_COLORS[task.statut].text}`}>
                    {STATUT_DI_CFG[task.statut]?.label ?? task.statut}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{task.description}</p>
                )}

                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {task.assigne_a && (
                    <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Assignée à" value={task.assigne_a} />
                  )}
                  <InfoRow
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    label="Début"
                    value={fmtFR(parseDate(task.debut), { day: '2-digit', month: 'long', year: 'numeric' })}
                  />
                  <InfoRow
                    icon={<Clock className="w-3.5 h-3.5" />}
                    label="Fin prévue"
                    value={fmtFR(parseDate(task.fin), { day: '2-digit', month: 'long', year: 'numeric' })}
                  />
                  <InfoRow
                    icon={<Wrench className="w-3.5 h-3.5" />}
                    label="Durée"
                    value={`${daysBetween(parseDate(task.debut), parseDate(task.fin)) + 1} jours`}
                  />
                  <InfoRow
                    icon={<FileText className="w-3.5 h-3.5" />}
                    label="Statut"
                    value={task.terminee ? 'Terminée' : 'En cours'}
                  />
                </div>
              </div>

              {/* Other tasks summary */}
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2">Toutes les tâches de cette affaire</p>
                <div className="space-y-1">
                  {intv.tasks.map(t => (
                    <div key={t.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${t.id === task.id ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}`}>
                      {t.terminee
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        : <Circle className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      }
                      <span className={`flex-1 truncate ${t.id === task.id ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>{t.label}</span>
                      <span className="text-slate-400 flex-shrink-0">{t.assigne_a}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TASK_STATUS_COLORS[t.statut].bar} ${TASK_STATUS_COLORS[t.statut].text}`}>
                        {STATUT_DI_CFG[t.statut]?.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* If intervention bar clicked (no specific task) */}
          {!task && (
            <div className="px-6 py-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Tâches ({intv.tasks.length})</p>
              <div className="space-y-1">
                {intv.tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-xs">
                    {t.terminee
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      : <Circle className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    }
                    <span className="flex-1 truncate text-slate-700 font-medium">{t.label}</span>
                    <span className="text-slate-400 flex-shrink-0">{t.assigne_a}</span>
                    <span className="text-slate-400 flex-shrink-0">
                      {fmtFR(parseDate(t.debut), { day: '2-digit', month: 'short' })} → {fmtFR(parseDate(t.fin), { day: '2-digit', month: 'short' })}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TASK_STATUS_COLORS[t.statut].bar} ${TASK_STATUS_COLORS[t.statut].text}`}>
                      {STATUT_DI_CFG[t.statut]?.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Statut : <span className={`font-semibold ${STATUT_DI_CFG[intv.statut]?.text}`}>{STATUT_DI_CFG[intv.statut]?.label}</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <div className="text-xs font-medium text-slate-700">{value}</div>
      </div>
    </div>
  );
}

// ─── Planning-style filter components ────────────────────────────────────────

function PlanningDropdown({ trigger, children, width = 300 }: {
  trigger: React.ReactNode; children: React.ReactNode; width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          style={{ width }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PlanningFilterBtn({ icon, label, count, active }: {
  icon: React.ReactNode; label: string; count?: number; active?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none
      ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
      {icon}
      <span>{label}</span>
      {count != null && count > 0 && (
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
          ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
      <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
    </div>
  );
}

function SitePicker({ selectedSiteIds, selectedResIds, onChange }: {
  selectedSiteIds: string[];
  selectedResIds: string[];
  onChange: (siteIds: string[], resIds: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredSites = useMemo(() => {
    if (!search) return ALL_SITES;
    const q = search.toLowerCase();
    return ALL_SITES.filter(s =>
      s.nom.toLowerCase().includes(q) ||
      ALL_RESIDENCES.filter(r => r.siteId === s.id).some(r => r.nom.toLowerCase().includes(q))
    );
  }, [search]);

  const toggleSite = (id: string) => {
    const removing = selectedSiteIds.includes(id);
    const nextSite = removing ? selectedSiteIds.filter(x => x !== id) : [...selectedSiteIds, id];
    const siteResIds = ALL_RESIDENCES.filter(r => r.siteId === id).map(r => r.id);
    const nextRes = removing ? selectedResIds.filter(r => !siteResIds.includes(r)) : selectedResIds;
    onChange(nextSite, nextRes);
  };

  const toggleRes = (id: string) => {
    const next = selectedResIds.includes(id) ? selectedResIds.filter(x => x !== id) : [...selectedResIds, id];
    onChange(selectedSiteIds, next);
  };

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const total = selectedSiteIds.length + selectedResIds.length;

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un site ou résidence…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filteredSites.map(site => {
          const residences = ALL_RESIDENCES.filter(r => r.siteId === site.id);
          const isExpanded = expanded.has(site.id) || !!search;
          const siteSelected = selectedSiteIds.includes(site.id);
          const someResSelected = residences.some(r => selectedResIds.includes(r.id));
          return (
            <div key={site.id}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 group">
                <button onClick={() => toggleExpand(site.id)} className="flex-shrink-0 text-slate-400">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                <input type="checkbox" checked={siteSelected || someResSelected}
                  ref={el => { if (el) el.indeterminate = !siteSelected && someResSelected; }}
                  onChange={() => toggleSite(site.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-xs text-slate-700 flex-1 min-w-0 truncate font-medium">{site.nom}</span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{site.code}</span>
              </div>
              {isExpanded && residences.map(res => (
                <div key={res.id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 ml-6">
                  <input type="checkbox" checked={selectedResIds.includes(res.id)}
                    onChange={() => toggleRes(res.id)}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                  <Folder className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 flex-1 min-w-0 truncate">{res.nom}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{total} sélectionné{total > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([], [])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

function EquipPicker({ selectedCats, selectedSubCats, onChange }: {
  selectedCats: string[];
  selectedSubCats: string[];
  onChange: (cats: string[], subCats: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredCats = useMemo(() => {
    if (!search) return EQUIP_CATS;
    const q = search.toLowerCase();
    return EQUIP_CATS
      .map(c => ({ ...c, sousCats: c.sousCats.filter((s: string) => s.toLowerCase().includes(q) || c.categorie.toLowerCase().includes(q)) }))
      .filter(c => c.sousCats.length > 0 || c.categorie.toLowerCase().includes(q));
  }, [search]);

  const toggleCat = (cat: string) => {
    const removing = selectedCats.includes(cat);
    const nextCat = removing ? selectedCats.filter(x => x !== cat) : [...selectedCats, cat];
    const catObj = EQUIP_CATS.find((c: { categorie: string }) => c.categorie === cat);
    const nextSub = removing ? selectedSubCats.filter((s: string) => !catObj?.sousCats.includes(s)) : selectedSubCats;
    onChange(nextCat, nextSub);
  };

  const toggleSub = (sub: string) => {
    const next = selectedSubCats.includes(sub) ? selectedSubCats.filter(x => x !== sub) : [...selectedSubCats, sub];
    onChange(selectedCats, next);
  };

  const toggleExpand = (cat: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });

  const total = selectedCats.length + selectedSubCats.length;

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filteredCats.map(({ categorie, sousCats }: { categorie: string; sousCats: string[] }) => {
          const isExpanded = expanded.has(categorie) || !!search;
          const catSelected = selectedCats.includes(categorie);
          const someSubSel = sousCats.some((s: string) => selectedSubCats.includes(s));
          return (
            <div key={categorie}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50">
                <button onClick={() => toggleExpand(categorie)} className="flex-shrink-0 text-slate-400">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                <input type="checkbox" checked={catSelected || someSubSel}
                  ref={el => { if (el) el.indeterminate = !catSelected && someSubSel; }}
                  onChange={() => toggleCat(categorie)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                <Wrench className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-700 flex-1 min-w-0 truncate font-medium">{categorie}</span>
                <span className="text-[10px] text-slate-400">{sousCats.length}</span>
              </div>
              {isExpanded && sousCats.map((sub: string) => (
                <div key={sub} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 ml-6">
                  <input type="checkbox" checked={selectedSubCats.includes(sub)}
                    onChange={() => toggleSub(sub)}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                  <span className="text-[11px] text-slate-600">{sub}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{total} sélectionné{total > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([], [])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

function CatDIPicker({ selected, onChange }: {
  selected: string[]; onChange: (cats: string[]) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return CATEGORIES_DI;
    const q = search.toLowerCase();
    return CATEGORIES_DI.filter(c => c.label.toLowerCase().includes(q));
  }, [search]);

  const toggle = (key: string) => {
    const next = selected.includes(key) ? selected.filter(x => x !== key) : [...selected, key];
    onChange(next);
  };

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filtered.map(cat => {
          const active = selected.includes(cat.key);
          return (
            <div key={cat.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => toggle(cat.key)}>
              <input type="checkbox" checked={active} onChange={() => toggle(cat.key)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
              <span className="text-sm flex-shrink-0">{cat.icon}</span>
              <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{cat.label}</span>
            </div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{selected.length} sélectionnée{selected.length > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

function GanttFilterBar({ activeStatuts, onToggleStatut, activeCriticites, onToggleCriticite }: {
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
            <button key={key} type="button" onClick={() => onToggleStatut(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current opacity-100` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
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
            <button key={key} type="button" onClick={() => onToggleCriticite(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current opacity-100` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
              <span className="leading-none">{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InterventionsGantt() {
  const [scale, setScale] = useState<Scale>('mois');
  const [viewStart, setViewStart] = useState<Date>(() => new Date('2026-05-01'));
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['g1', 'g2']));
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TypeAffaire[]>([]);
  const [filterResponsable, setFilterResponsable] = useState<string[]>([]);
  const [filterPriorite, setFilterPriorite] = useState<Priorite[]>([]);
  const [activeStatuts, setActiveStatuts] = useState<Set<StatutDI>>(new Set(STATUTS_KEYS));
  const [activeCriticites, setActiveCriticites] = useState<Set<CriticiteDI>>(new Set(CRITICITE_KEYS));
  const [filterSiteIds, setFilterSiteIds] = useState<string[]>([]);
  const [filterResIds, setFilterResIds] = useState<string[]>([]);
  const [filterEquipCats, setFilterEquipCats] = useState<string[]>([]);
  const [filterEquipSubs, setFilterEquipSubs] = useState<string[]>([]);
  const [filterCatsDI, setFilterCatsDI] = useState<string[]>([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<HTMLDivElement>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(DEFAULT_LEFT_PANEL);
  const resizingRef = useRef(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(0);

  function handleResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    resizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = leftPanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizeStartXRef.current;
      const next = Math.min(MAX_LEFT_PANEL, Math.max(MIN_LEFT_PANEL, resizeStartWidthRef.current + delta));
      setLeftPanelWidth(next);
    };
    const onUp = () => {
      resizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const totalDays = useMemo(() => {
    const map: Record<Scale, number> = { semaine: 84, mois: 180, trimestre: 365, annee: 730 };
    return map[scale];
  }, [scale]);

  const pxPerDay = COL_WIDTH_BY_SCALE[scale];
  const columns = useMemo(() => buildColumns(viewStart, totalDays, scale), [viewStart, totalDays, scale]);
  const today = useMemo(() => new Date(), []);

  const todayOffset = useMemo(() => {
    const off = daysBetween(viewStart, today);
    return off >= 0 && off <= totalDays ? off * pxPerDay : null;
  }, [viewStart, today, totalDays, pxPerDay]);

  const filtered = useMemo(() => MOCK_INTERVENTIONS.filter(i => {
    if (search && !i.titre.toLowerCase().includes(search.toLowerCase()) && !i.reference.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType.length && !filterType.includes(i.type)) return false;
    if (!activeStatuts.has(i.statut)) return false;
    if (filterResponsable.length && !filterResponsable.includes(i.responsable)) return false;
    if (filterPriorite.length && !filterPriorite.includes(i.priorite)) return false;
    if (filterSiteIds.length && !filterSiteIds.some(id => ALL_SITES.find(s => s.id === id)?.nom === i.site)) return false;
    return true;
  }), [search, filterType, activeStatuts, filterResponsable, filterPriorite, filterSiteIds]);

  const rows = useMemo(() => {
    const result: ({ kind: 'intervention'; data: GanttIntervention } | { kind: 'task'; data: GanttTask; parent: GanttIntervention })[] = [];
    for (const intv of filtered) {
      result.push({ kind: 'intervention', data: intv });
      if (expanded.has(intv.id)) {
        for (const task of intv.tasks) {
          result.push({ kind: 'task', data: task, parent: intv });
        }
      }
    }
    return result;
  }, [filtered, expanded]);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function navigate(dir: -1 | 1) {
    setViewStart(prev => addDays(prev, Math.floor(totalDays * 0.3) * dir));
  }

  function goToday() { setViewStart(addDays(today, -30)); }
  function zoomIn() { const o: Scale[] = ['annee', 'trimestre', 'mois', 'semaine']; const i = o.indexOf(scale); if (i < o.length - 1) setScale(o[i + 1]); }
  function zoomOut() { const o: Scale[] = ['annee', 'trimestre', 'mois', 'semaine']; const i = o.indexOf(scale); if (i > 0) setScale(o[i - 1]); }

  function barStyle(debut: string, fin: string) {
    const start = parseDate(debut);
    const end = parseDate(fin);
    const left = daysBetween(viewStart, start) * pxPerDay;
    const width = Math.max((daysBetween(start, end) + 1) * pxPerDay, pxPerDay);
    const visible = end >= viewStart && start <= addDays(viewStart, totalDays);
    return { left, width, visible };
  }

  function taskProgress(intv: GanttIntervention) {
    if (!intv.tasks.length) return 0;
    return Math.round((intv.tasks.filter(t => t.terminee).length / intv.tasks.length) * 100);
  }

  const clearFilters = () => {
    setFilterType([]);
    setActiveStatuts(new Set(STATUTS_KEYS));
    setActiveCriticites(new Set(CRITICITE_KEYS));
    setFilterSiteIds([]);
    setFilterResIds([]);
    setFilterEquipCats([]);
    setFilterEquipSubs([]);
    setFilterCatsDI([]);
    setFilterResponsable([]);
    setFilterPriorite([]);
    setSearch('');
  };
  const activeFilterCount = filterType.length + filterSiteIds.length + filterResIds.length +
    filterEquipCats.length + filterEquipSubs.length + filterCatsDI.length +
    filterResponsable.length + filterPriorite.length +
    (activeStatuts.size < STATUTS_KEYS.length ? STATUTS_KEYS.length - activeStatuts.size : 0) +
    (activeCriticites.size < CRITICITE_KEYS.length ? CRITICITE_KEYS.length - activeCriticites.size : 0) +
    (search ? 1 : 0);
  const hasFilters = activeFilterCount > 0;

  function handleChartScroll(e: React.UIEvent<HTMLDivElement>) {
    if (syncRef.current) syncRef.current.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
  }

  const totalWidth = totalDays * pxPerDay;
  const headerH = scale === 'semaine' ? 56 : 40;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <button onClick={goToday}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <Crosshair className="w-3.5 h-3.5" /> Aujourd'hui
          </button>
          <div className="flex items-center rounded-lg overflow-hidden border border-slate-200">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-50 transition-colors text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => navigate(1)} className="p-1.5 hover:bg-slate-50 transition-colors text-slate-500 border-l border-slate-200"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center rounded-lg overflow-hidden border border-slate-200">
            <button onClick={zoomOut} className="p-1.5 hover:bg-slate-50 transition-colors text-slate-500" title="Zoom arrière"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={zoomIn} className="p-1.5 hover:bg-slate-50 transition-colors text-slate-500 border-l border-slate-200" title="Zoom avant"><ZoomIn className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {(['semaine', 'mois', 'trimestre', 'annee'] as Scale[]).map(s => (
            <button key={s} onClick={() => setScale(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${scale === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <button onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${hasFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-600 bg-slate-100 border-transparent hover:bg-slate-200'}`}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtres
            {hasFilters && <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">{activeFilterCount}</span>}
          </button>
          {hasFilters && <button onClick={clearFilters} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </div>

      {/* ── Filter panel ── */}
      {filterOpen && (
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-3 space-y-2.5">
          {/* Row 1: dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <PlanningDropdown width={360} trigger={
              <PlanningFilterBtn icon={<MapPin className="w-3.5 h-3.5" />} label="Sites"
                count={filterSiteIds.length + filterResIds.length}
                active={filterSiteIds.length > 0 || filterResIds.length > 0} />
            }>
              <SitePicker selectedSiteIds={filterSiteIds} selectedResIds={filterResIds}
                onChange={(s, r) => { setFilterSiteIds(s); setFilterResIds(r); }} />
            </PlanningDropdown>

            <PlanningDropdown width={320} trigger={
              <PlanningFilterBtn icon={<Wrench className="w-3.5 h-3.5" />} label="Équipements"
                count={filterEquipCats.length + filterEquipSubs.length}
                active={filterEquipCats.length > 0 || filterEquipSubs.length > 0} />
            }>
              <EquipPicker selectedCats={filterEquipCats} selectedSubCats={filterEquipSubs}
                onChange={(c, s) => { setFilterEquipCats(c); setFilterEquipSubs(s); }} />
            </PlanningDropdown>

            <PlanningDropdown width={280} trigger={
              <PlanningFilterBtn icon={<Tag className="w-3.5 h-3.5" />} label="Catégories"
                count={filterCatsDI.length}
                active={filterCatsDI.length > 0} />
            }>
              <CatDIPicker selected={filterCatsDI} onChange={setFilterCatsDI} />
            </PlanningDropdown>

            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors ml-auto">
                <X className="w-3 h-3" /> Effacer tout
              </button>
            )}
          </div>

          {/* Row 2: statut + criticité pills */}
          <GanttFilterBar
            activeStatuts={activeStatuts}
            onToggleStatut={key => setActiveStatuts(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; })}
            activeCriticites={activeCriticites}
            onToggleCriticite={key => setActiveCriticites(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; })}
          />
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-1.5 bg-white border-b border-slate-100 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{filtered.length} affaire{filtered.length > 1 ? 's' : ''}</span>
        {Object.entries(TYPE_CFG).map(([k, v]) => {
          const cnt = filtered.filter(i => i.type === k).length;
          if (!cnt) return null;
          return <span key={k} className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${v.bg} ${v.text} ${v.border}`}>{v.label} ({cnt})</span>;
        })}
        <span className="ml-auto text-[10px]">Du {fmtFR(viewStart, { day: '2-digit', month: 'short', year: 'numeric' })} au {fmtFR(addDays(viewStart, totalDays), { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel ── */}
        <div className="flex-shrink-0 flex flex-col bg-white relative" style={{ width: leftPanelWidth }}>
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50" style={{ height: headerH }}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate">Affaires / Chantiers</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden border-r border-slate-200">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-xs text-slate-400 gap-2">
                <Filter className="w-5 h-5" /> Aucune affaire
              </div>
            ) : rows.map((row, idx) => {
              if (row.kind === 'intervention') {
                const intv = row.data;
                const isExp = expanded.has(intv.id);
                const progress = taskProgress(intv);
                const cfg = TYPE_CFG[intv.type];
                const pCfg = PRIORITE_CFG[intv.priorite];
                return (
                  <div key={intv.id}
                    className={`flex items-center gap-2 px-2 cursor-pointer select-none border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}
                    style={{ height: ROW_H }}
                    onClick={() => toggleExpand(intv.id)}
                  >
                    <span className="flex-shrink-0 text-slate-400">
                      {isExp ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pCfg.dot}`} />
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>{cfg.label.slice(0, 3).toUpperCase()}</span>
                    <span className="flex-1 text-xs font-semibold text-slate-700 truncate leading-tight">{intv.titre}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0 font-mono">{progress}%</span>
                  </div>
                );
              } else {
                const task = row.data;
                const sCfg = TASK_STATUS_COLORS[task.statut];
                return (
                  <div key={task.id}
                    className={`flex items-center gap-2 pl-8 pr-2 border-b border-slate-100 ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}
                    style={{ height: ROW_H }}
                  >
                    <span className="flex-shrink-0 text-slate-300 text-xs">└</span>
                    {task.terminee
                      ? <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${sCfg.text}`} />
                      : <Circle className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
                    }
                    <span className="flex-1 text-xs text-slate-600 truncate font-medium">{task.label}</span>
                    <span className={`text-[10px] font-semibold flex-shrink-0 ${sCfg.text}`}>{STATUT_DI_CFG[task.statut]?.label ?? task.statut}</span>
                  </div>
                );
              }
            })}
          </div>
          {/* ── Resize handle ── */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize group z-10"
            title="Redimensionner"
          >
            <div className="absolute inset-y-0 right-0 w-1 bg-slate-200 group-hover:bg-blue-400 transition-colors" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-6 -translate-x-1 rounded flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-400">
              <span className="w-0.5 h-2.5 bg-white rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Column headers (synced scroll) */}
          <div className="flex-shrink-0 overflow-hidden" ref={syncRef}>
            <div style={{ width: totalWidth }}>
              <div className="flex" style={{ height: scale === 'semaine' ? 28 : 24, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                {columns.map((col, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center justify-center border-r border-slate-100 text-[11px] font-semibold text-slate-500 truncate px-1"
                    style={{ width: col.span * pxPerDay }}>
                    {col.label}
                  </div>
                ))}
              </div>
              {scale === 'semaine' && (
                <div className="flex" style={{ height: 28, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {columns.map((col, i) => (
                    <div key={i} className="flex-shrink-0 flex items-center justify-center border-r border-slate-100 text-[10px] text-slate-400 px-1"
                      style={{ width: col.span * pxPerDay }}>
                      {col.subLabel}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart body */}
          <div className="flex-1 overflow-auto" ref={chartRef} onScroll={handleChartScroll}>
            <div style={{ width: totalWidth, position: 'relative', minHeight: rows.length * ROW_H }}>
              {/* Grid */}
              {columns.map((col, i) => (
                <div key={i} className="absolute top-0 bottom-0 border-r border-slate-100"
                  style={{ left: daysBetween(viewStart, col.date) * pxPerDay, width: col.span * pxPerDay }} />
              ))}

              {/* Today marker */}
              {todayOffset !== null && (
                <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none" style={{ left: todayOffset }}>
                  <div className="w-2 h-2 rounded-full bg-red-400 -translate-x-[3px]" />
                </div>
              )}

              {/* Rows */}
              {rows.map((row, idx) => {
                const isEven = idx % 2 === 0;
                if (row.kind === 'intervention') {
                  const intv = row.data;
                  const { left, width, visible } = barStyle(intv.debut, intv.fin);
                  const progress = taskProgress(intv);
                  const barCls = INTERVENTION_BAR_COLORS[intv.statut];
                  return (
                    <div key={intv.id}
                      className={`absolute left-0 right-0 flex items-center ${isEven ? 'bg-white' : 'bg-slate-50/60'}`}
                      style={{ top: idx * ROW_H, height: ROW_H }}>
                      {visible && (
                        <div
                          className={`absolute rounded-md border flex items-center px-2.5 overflow-hidden cursor-pointer hover:brightness-95 transition-all ${barCls}`}
                          style={{ left, width: Math.max(width, 8), height: ROW_H - 10, top: 5 }}
                          onClick={() => setModalState({ intervention: intv, task: null })}
                        >
                          <div className="absolute left-0 top-0 bottom-0 opacity-25 rounded-l-md"
                            style={{ width: `${progress}%`, background: 'currentColor' }} />
                          <span className="relative text-xs font-semibold truncate z-10">{intv.titre}</span>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  const task = row.data;
                  const { left, width, visible } = barStyle(task.debut, task.fin);
                  const barCls = TASK_STATUS_COLORS[task.statut];
                  return (
                    <div key={task.id}
                      className={`absolute left-0 right-0 flex items-center ${isEven ? 'bg-white' : 'bg-slate-50/60'}`}
                      style={{ top: idx * ROW_H, height: ROW_H }}>
                      {visible && (
                        <div
                          className={`absolute rounded flex items-center px-2 overflow-hidden cursor-pointer hover:brightness-95 transition-all ${barCls.bar}`}
                          style={{ left, width: Math.max(width, 6), height: ROW_H - 14, top: 7 }}
                          onClick={() => setModalState({ intervention: row.parent, task })}
                        >
                          <span className="relative text-xs font-medium truncate z-10">{task.label}</span>
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail modal ── */}
      {modalState && <DetailModal state={modalState} onClose={() => setModalState(null)} />}
    </div>
  );
}
