// ─── Core types ───────────────────────────────────────────────────────────────

export interface ERP {
  id: string;
  nom: string;
  categorie_erp: string;
  type_erp: string;
  capacite: number;
  adresse: string | null;
  responsable_securite: string | null;
  email_responsable: string | null;
  coordonnees_secours: string | null;
  date_mise_en_service: string | null;
  organisme_controle: string | null;
  contrat_controle_ref: string | null;
  residence_id: string | null;
  site_id: string | null;
  created_at: string;
  updated_at: string;
  // joined
  residence?: { nom: string } | null;
  site?: { nom: string } | null;
}

export interface ControleERP {
  id: string;
  erp_id: string;
  type_controle: string;
  categorie: string;
  periodicite: string;
  date_dernier_controle: string | null;
  date_prochain_controle: string | null;
  statut: string;
  prestataire: string | null;
  conformite_pct: number | null;
  rapport_url: string | null;
  commentaire: string | null;
  created_at: string;
}

export interface IncidentERP {
  id: string;
  erp_id: string;
  reference: string;
  type_incident: string;
  date_incident: string;
  lieu: string | null;
  description: string | null;
  personnes_impliquees: string | null;
  degats_materiels: boolean;
  degats_description: string | null;
  actions_immediates: string | null;
  statut: string;
  responsable: string | null;
  created_at: string;
}

export interface ActionCorrectiveERP {
  id: string;
  erp_id: string;
  reference: string;
  incident_id: string | null;
  controle_id: string | null;
  description: string;
  responsable: string | null;
  date_limite: string | null;
  statut: string;
  priorite: number;
  commentaire: string | null;
  ot_gmao_ref: string | null;
  created_at: string;
}

// ─── Config maps ──────────────────────────────────────────────────────────────

export const CATEGORIE_ERP_LABELS: Record<string, string> = {
  '1ere': '1ère catégorie (> 1500 pers.)',
  '2eme': '2ème catégorie (701–1500 pers.)',
  '3eme': '3ème catégorie (301–700 pers.)',
  '4eme': '4ème catégorie (< 300 pers.)',
  '5eme': '5ème catégorie (< seuil)',
};

export const TYPE_ERP_LABELS: Record<string, string> = {
  J: 'J — Enseignement / Éducation',
  R: 'R — Restaurant / Hébergement',
  N: 'N — Restauration rapide',
  M: 'M — Magasins et commerces',
  O: 'O — Hôtels',
  U: 'U — Établissements sanitaires',
  W: 'W — Administration',
};

export const STATUT_CONTROLE_CFG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  conforme:      { label: 'Conforme',      bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  a_venir:       { label: 'À venir',       bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400',    border: 'border-blue-200'    },
  en_retard:     { label: 'En retard',     bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500',     border: 'border-red-200'     },
  non_realise:   { label: 'Non réalisé',   bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400',   border: 'border-slate-300'   },
  non_conforme:  { label: 'Non conforme',  bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-500',  border: 'border-orange-200'  },
};

export const STATUT_INCIDENT_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  ouvert:    { label: 'Ouvert',    bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'     },
  en_cours:  { label: 'En cours',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  cloture:   { label: 'Clôturé',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export const STATUT_ACTION_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  ouvert:    { label: 'Ouvert',    bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'     },
  en_cours:  { label: 'En cours',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  termine:   { label: 'Terminé',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  annule:    { label: 'Annulé',    bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400'   },
};

export const TYPE_INCIDENT_LABELS: Record<string, { label: string; icon: string }> = {
  ssi_intempestif:     { label: 'Déclenchement SSI intempestif', icon: '🔔' },
  panne_extincteur:    { label: 'Panne extincteur',              icon: '🧯' },
  panne_eclairage:     { label: 'Panne éclairage sécurité',      icon: '💡' },
  porte_coupe_feu:     { label: 'Porte coupe-feu défectueuse',   icon: '🚪' },
  fuite_gaz:           { label: 'Fuite de gaz',                  icon: '⚠️' },
  exercice_evacuation: { label: 'Exercice d\'évacuation',        icon: '🏃' },
  degradation_amiante: { label: 'Dégradation matériau amiante',  icon: '🦺' },
  autre:               { label: 'Autre incident',                icon: '📋' },
};

export const PRIORITE_CFG: Record<number, { label: string; color: string; stars: number }> = {
  1: { label: 'Basse',    color: 'text-slate-500',  stars: 1 },
  2: { label: 'Moyenne',  color: 'text-blue-600',   stars: 2 },
  3: { label: 'Haute',    color: 'text-amber-600',  stars: 3 },
  4: { label: 'Critique', color: 'text-red-600',    stars: 4 },
};

// ─── Registre de Sécurité Dématérialisé ──────────────────────────────────────

export interface SignatureRegistre {
  acteur: string;       // nom signataire
  role: string;         // ex. "Responsable sécurité"
  date: string;         // ISO date
  email?: string;
  valide: boolean;
}

export interface DocumentRegistre {
  nom: string;
  type: string;
  url: string;
  taille?: string;
  ajoute_le?: string;
}

export interface PointRassemblement {
  id: string;
  nom: string;
  description: string;
  capacite: number | null;
  commentaire: string;
  // position relative on the plan image (0–100 percent)
  x: number;
  y: number;
}

export interface EquipementSecurite {
  id: string;
  designation: string;
  categorie: string;
  localisation: string;
  organisme: string | null;
  date_dernier_controle: string | null;
  date_prochain_controle: string | null;
  statut: string;
  // position on plan (0–100 percent), nullable if not placed
  x: number | null;
  y: number | null;
}

export interface CommissionERP {
  id: string;
  date_visite: string;
  type: string;
  prescriptions: string;
  reserves: string;
  levee_reserves: string;
  rapport_url: string | null;
}

export interface ExerciceEvacuation {
  id: string;
  date: string;
  type: 'partiel' | 'complet' | 'incendie' | 'intrusion';
  effectif_participants: number | null;
  duree_evacuation: number | null;
  observations: string;
  satisfaisant: boolean;
}

export interface DocumentLiaison {
  id: string;
  nom: string;
  type: string;
  source: 'ged' | 'manuel';
  ged_ref: string | null;
  url: string | null;
  date_ajout: string;
}

export interface RegistreSecuriteRecord {
  id: string;
  erp_id: string;
  reference: string;
  annee: number;
  responsable_registre: string | null;
  responsable_legal: string | null;
  date_ouverture: string | null;

  consignes_incendie: string | null;
  plan_evac_url: string | null;
  point_rassemblement: string | null;
  consignes_pmr: string | null;

  nb_extincteurs: number | null;
  derniere_verif_ssi: string | null;
  derniere_verif_extincteurs: string | null;
  derniere_verif_eclairage: string | null;
  derniere_verif_desenfumage: string | null;
  organisme_controle: string | null;

  organismes_controle: string[];
  points_rassemblement: PointRassemblement[];
  equipements_securite: EquipementSecurite[];
  commissions: CommissionERP[];
  exercices: ExerciceEvacuation[];
  documents_lies: DocumentLiaison[];

  nb_exercices_annee: number | null;
  date_dernier_exercice: string | null;
  nb_incidents_annee: number | null;
  observations: string | null;

  documents: DocumentRegistre[];
  signatures: SignatureRegistre[];

  statut: 'brouillon' | 'en_cours' | 'valide' | 'archive';
  completude_pct: number;

  created_at: string;
  updated_at: string;

  // joined
  erp?: { nom: string; categorie_erp: string; type_erp: string } | null;
}

export const STATUT_REGISTRE_CFG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  brouillon: { label: 'Brouillon',  bg: 'bg-slate-100',    text: 'text-slate-600',   dot: 'bg-slate-400',    border: 'border-slate-300'   },
  en_cours:  { label: 'En cours',   bg: 'bg-amber-50',     text: 'text-amber-700',   dot: 'bg-amber-500',    border: 'border-amber-200'   },
  valide:    { label: 'Validé',     bg: 'bg-emerald-50',   text: 'text-emerald-700', dot: 'bg-emerald-500',  border: 'border-emerald-200' },
  archive:   { label: 'Archivé',    bg: 'bg-blue-50',      text: 'text-blue-700',    dot: 'bg-blue-400',     border: 'border-blue-200'    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

export function getControleAlerte(c: ControleERP): 'retard' | 'bientot' | null {
  if (!c.date_prochain_controle) return null;
  const diff = (new Date(c.date_prochain_controle).getTime() - Date.now()) / 86400000;
  if (diff < 0) return 'retard';
  if (diff < 30) return 'bientot';
  return null;
}
