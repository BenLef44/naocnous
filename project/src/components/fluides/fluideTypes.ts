import { Zap, Droplets, Flame, Thermometer, Sun, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── DB types ─────────────────────────────────────────────────────────────────

export interface ConsommationFluide {
  id: string;
  residence_id: string;
  annee: number;
  mois: number;
  type_fluide: TypeFluide;
  valeur_kwh: number | null;
  valeur_m3: number | null;
  cout_euros: number | null;
  indice_base100: number | null;
  alerte_seuil: boolean;
  source_systeme: string;
}

export interface CompteurFluide {
  id: string;
  residence_id: string | null;
  batiment_id: string | null;
  reference: string;
  type_fluide: TypeFluide;
  localisation: string | null;
  type_compteur: 'principal' | 'sous_compteur' | 'sous_sous_compteur';
  parent_compteur_id: string | null;
  marque: string | null;
  modele: string | null;
  numero_serie: string | null;
  date_installation: string | null;
  date_derniere_releve: string | null;
  statut_communication: StatutCommunication;
  niveau_batterie_pct: number | null;
  score_qualite_donnee: number;
  donnees_manquantes_j: number;
  protocole: string | null;
  actif: boolean;
  notes: string | null;
  // joined
  residences?: { nom: string } | null;
}

export interface AlerteFluide {
  id: string;
  residence_id: string | null;
  batiment_id: string | null;
  compteur_id: string | null;
  type_fluide: TypeFluide;
  type_anomalie: TypeAnomalie;
  criticite: Criticite;
  statut: StatutAlerte;
  titre: string;
  description: string | null;
  ecart_pct: number | null;
  impact_euros_mois: number | null;
  date_detection: string;
  date_resolution: string | null;
  action_suggeree: string | null;
  source: string;
  // joined
  residences?: { nom: string } | null;
  compteurs_fluides?: { reference: string } | null;
}

export interface FactureFluide {
  id: string;
  residence_id: string | null;
  type_fluide: TypeFluide;
  fournisseur: string;
  reference_facture: string | null;
  periode_debut: string;
  periode_fin: string;
  consommation_valeur: number | null;
  consommation_unite: string | null;
  montant_ht: number;
  montant_ttc: number;
  date_emission: string | null;
  date_echeance: string | null;
  date_paiement: string | null;
  statut_paiement: 'en_attente' | 'paye' | 'impaye' | 'litige';
  ecart_compteur_pct: number | null;
  notes: string | null;
  // joined
  residences?: { nom: string } | null;
}

// ─── Enum types ───────────────────────────────────────────────────────────────

export type TypeFluide = 'electricite' | 'gaz' | 'eau' | 'chaleur' | 'solaire' | 'biomasse';
export type StatutCommunication = 'connecte' | 'hors_ligne' | 'batterie_faible' | 'anomalie' | 'non_communicant';
export type TypeAnomalie = 'surconsommation' | 'fuite_probable' | 'derive_nocturne' | 'donnee_manquante' | 'compteur_hs' | 'pic_anormal' | 'derive_saisonniere';
export type Criticite = 'info' | 'normale' | 'haute' | 'critique';
export type StatutAlerte = 'nouvelle' | 'en_analyse' | 'intervention_creee' | 'resolue' | 'ignoree';

// ─── Config dictionaries ──────────────────────────────────────────────────────

export const FLUIDE_CFG: Record<TypeFluide, { label: string; icon: LucideIcon; color: string; colorHex: string; unit: string; unitAlt?: string }> = {
  electricite: { label: 'Électricité',    icon: Zap,         color: 'text-amber-500',   colorHex: '#f59e0b', unit: 'kWh', unitAlt: 'MWh' },
  gaz:         { label: 'Gaz',            icon: Flame,       color: 'text-blue-500',    colorHex: '#3b82f6', unit: 'kWh', unitAlt: 'MWh' },
  eau:         { label: 'Eau',            icon: Droplets,    color: 'text-cyan-500',    colorHex: '#06b6d4', unit: 'm³'  },
  chaleur:     { label: 'Chaleur urbaine',icon: Thermometer, color: 'text-red-500',     colorHex: '#ef4444', unit: 'kWh', unitAlt: 'MWh' },
  solaire:     { label: 'Solaire',        icon: Sun,         color: 'text-yellow-500',  colorHex: '#eab308', unit: 'kWh' },
  biomasse:    { label: 'Biomasse',       icon: Leaf,        color: 'text-green-600',   colorHex: '#16a34a', unit: 'kWh' },
};

export const CRITICITE_CFG: Record<Criticite, { label: string; bg: string; text: string; border: string; dot: string; ring: string }> = {
  info:     { label: 'Info',     bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400',   ring: 'ring-blue-200'   },
  normale:  { label: 'Normale',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500',  ring: 'ring-amber-200'  },
  haute:    { label: 'Haute',    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', ring: 'ring-orange-200' },
  critique: { label: 'Critique', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500',    ring: 'ring-red-200'    },
};

export const STATUT_ALERTE_CFG: Record<StatutAlerte, { label: string; bg: string; text: string; border: string }> = {
  nouvelle:             { label: 'Nouvelle',             bg: 'bg-red-50',      text: 'text-red-700',      border: 'border-red-200'      },
  en_analyse:           { label: 'En analyse',           bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200'    },
  intervention_creee:   { label: 'Intervention créée',   bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border-blue-200'     },
  resolue:              { label: 'Résolue',               bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200'  },
  ignoree:              { label: 'Ignorée',               bg: 'bg-slate-100',   text: 'text-slate-500',    border: 'border-slate-200'    },
};

export const COMM_CFG: Record<StatutCommunication, { label: string; bg: string; text: string; dot: string }> = {
  connecte:        { label: 'Connecté',        bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  hors_ligne:      { label: 'Hors ligne',      bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
  batterie_faible: { label: 'Batterie faible', bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500'   },
  anomalie:        { label: 'Anomalie',        bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-500'  },
  non_communicant: { label: 'Non communicant', bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
};

export const ANOMALIE_CFG: Record<TypeAnomalie, { label: string }> = {
  surconsommation:   { label: 'Surconsommation' },
  fuite_probable:    { label: 'Fuite probable' },
  derive_nocturne:   { label: 'Dérive nocturne' },
  donnee_manquante:  { label: 'Données manquantes' },
  compteur_hs:       { label: 'Compteur HS' },
  pic_anormal:       { label: 'Pic anormal' },
  derive_saisonniere:{ label: 'Dérive saisonnière' },
};

export const MOIS_COURT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const fmtEur = (v: number | null | undefined) =>
  v != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : '—';

export const fmtNum = (v: number | null | undefined, decimals = 0) =>
  v != null ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals }).format(v) : '—';

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-FR') : '—';
