// ─── Finance module shared types ─────────────────────────────────────────────

export interface Charge {
  id: string;
  reference: string;
  batiment_id: string | null;
  equipement_id: string | null;
  residence_id: string | null;
  annexe4_regle_id: string | null;
  type_charge: string;
  type_intervention: string;
  responsable: string;
  cout_estime: number;
  cout_reel: number | null;
  statut: string;
  date_declaration: string;
  date_intervention: string | null;
  contrat_id: string | null;
  source_systeme: string | null;
  commentaire: string | null;
  created_at: string;
  updated_at: string;
  // joined
  batiment?: { nom: string } | null;
  residence?: { nom: string } | null;
  contrat?: { nom: string } | null;
}

export interface Budget {
  id: string;
  residence_id: string;
  annee: number;
  type_budget: string;
  montant_initial: number;
  montant_consomme: number;
  montant_engage: number;
  statut_budget: string;
  source_systeme: string;
}

export interface Facture {
  id: string;
  reference: string;
  charge_id: string | null;
  contrat_id: string | null;
  prestataire_id: string | null;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  date_emission: string;
  date_echeance: string | null;
  date_paiement: string | null;
  statut: string;
  source_systeme: string | null;
  notes: string | null;
}

export interface ConsommationFluide {
  id: string;
  residence_id: string;
  annee: number;
  mois: number;
  type_fluide: string;
  valeur_kwh: number | null;
  valeur_m3: number | null;
  cout_euros: number | null;
  indice_base100: number | null;
  alerte_seuil: boolean;
  source_systeme: string;
}

export interface Annexe4Regle {
  id: string;
  ref_section: string;
  section_label: string;
  sous_section: string | null;
  nature_ouvrage: string;
  sous_ref: string | null;
  type_intervention: string;
  responsable: string;
}

// ─── Config statuts ───────────────────────────────────────────────────────────

export const STATUT_CHARGE_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  en_attente: { label: 'En attente',  bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400'   },
  planifie:   { label: 'Planifié',    bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  en_cours:   { label: 'En cours',    bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  valide:     { label: 'Validé',      bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  litige:     { label: 'Litige',      bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  annule:     { label: 'Annulé',      bg: 'bg-slate-50',    text: 'text-slate-400',   dot: 'bg-slate-300'   },
  clos:       { label: 'Clôturé',     bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-500'   },
  travaux:    { label: 'Travaux',     bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500'  },
  arbitrage:  { label: 'Arbitrage',   bg: 'bg-sky-100',     text: 'text-sky-700',     dot: 'bg-sky-500'     },
  etude:      { label: 'Étude',       bg: 'bg-cyan-100',    text: 'text-cyan-700',    dot: 'bg-cyan-500'    },
};

export const STATUT_FACTURE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  non_facture: { label: 'Non facturé', bg: 'bg-slate-100',   text: 'text-slate-500'   },
  facture:     { label: 'Facturé',     bg: 'bg-blue-100',    text: 'text-blue-700'    },
  paye:        { label: 'Payé',        bg: 'bg-emerald-100', text: 'text-emerald-700' },
  impaye:      { label: 'Impayé',      bg: 'bg-red-100',     text: 'text-red-700'     },
  annule:      { label: 'Annulé',      bg: 'bg-slate-50',    text: 'text-slate-400'   },
};

export const RESPONSABLE_CFG: Record<string, { label: string; color: string; bg: string }> = {
  'Propriétaire': { label: 'Propriétaire', color: '#2563eb', bg: 'bg-blue-100'    },
  'Gestionnaire': { label: 'Gestionnaire', color: '#059669', bg: 'bg-emerald-100' },
  'Partagé':      { label: 'Partagé',      color: '#d97706', bg: 'bg-amber-100'   },
};

export const SOURCE_CFG: Record<string, { label: string; color: string }> = {
  'Manuel':      { label: 'Manuel',      color: '#64748b' },
  'BNS':         { label: 'BNS',         color: '#2563eb' },
  'SI Logement': { label: 'SI Logement', color: '#7c3aed' },
  'Epona':       { label: 'Epona',       color: '#059669' },
  'OPERAT/OSFI': { label: 'OPERAT/OSFI', color: '#0891b2' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const fmtEur = (v: number | null | undefined) =>
  v != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : '—';

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-FR') : '—';
