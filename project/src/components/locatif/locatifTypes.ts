export type TypeBail = 'location' | 'convention' | 'commercial' | 'temporaire' | 'autre';
export type StatutBail = 'en_preparation' | 'en_signature' | 'actif' | 'expire_bientot' | 'expire' | 'resilie';

export interface Locataire {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  date_naissance?: string;
  adresse_actuelle?: string;
  situation?: string;
  created_at?: string;
}

export interface Bail {
  id: string;
  reference: string;
  type_bail: TypeBail;
  statut: StatutBail;
  logement_id?: string;
  residence_id?: string;
  locataire_id?: string;
  locataire_nom?: string;
  loyer_mensuel: number;
  charges: number;
  depot_garantie: number;
  apl: number;
  date_debut?: string;
  date_fin?: string;
  tacite_reconduction?: boolean;
  preavis_mois?: number;
  periodicite?: string;
  indexation?: string;
  gestionnaire?: string;
  commentaires?: string;
  conditions_particulieres?: string;
  notes_internes?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export const STATUT_BAIL_CFG: Record<StatutBail, { label: string; bg: string; text: string; dot: string; border: string }> = {
  en_preparation: { label: 'En préparation', bg: 'bg-slate-100',   text: 'text-slate-600',  dot: 'bg-slate-400',   border: 'border-slate-200' },
  en_signature:   { label: 'En signature',   bg: 'bg-blue-50',     text: 'text-blue-700',   dot: 'bg-blue-500',    border: 'border-blue-200'  },
  actif:          { label: 'Actif',           bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-500', border: 'border-emerald-200'},
  expire_bientot: { label: 'Expire bientôt',  bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-500',   border: 'border-amber-200' },
  expire:         { label: 'Expiré',          bg: 'bg-red-50',      text: 'text-red-700',    dot: 'bg-red-500',     border: 'border-red-200'   },
  resilie:        { label: 'Résilié',         bg: 'bg-slate-100',   text: 'text-slate-500',  dot: 'bg-slate-300',   border: 'border-slate-200' },
};

export const TYPE_BAIL_CFG: Record<TypeBail, { label: string; color: string; bg: string }> = {
  location:    { label: 'Location',          color: 'text-blue-700',   bg: 'bg-blue-50'   },
  convention:  { label: 'Convention',        color: 'text-teal-700',   bg: 'bg-teal-50'   },
  commercial:  { label: 'Commercial',        color: 'text-violet-700', bg: 'bg-violet-50' },
  temporaire:  { label: 'Temporaire',        color: 'text-orange-700', bg: 'bg-orange-50' },
  autre:       { label: 'Autre',             color: 'text-slate-600',  bg: 'bg-slate-100' },
};
