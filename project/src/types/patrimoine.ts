export type StatutType = 'disponible' | 'indisponible' | 'en_maintenance' | 'sinistre';
export type EtatEquipement = 'fonctionnel' | 'en_panne' | 'a_remplacer' | 'hors_service';
export type PrioriteIntervention = 'basse' | 'normale' | 'haute' | 'urgente';
export type StatutIntervention = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
export type TypeDocument = 'DTA' | 'bail' | 'rapport_controle' | 'plan' | 'contrat' | 'facture' | 'photo' | 'autre';

export interface Site {
  id: string;
  nom: string;
  code: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  statut: StatutType;
  created_at: string;
  updated_at: string;
  residences?: Residence[];
}

export interface Residence {
  id: string;
  site_id: string;
  nom: string;
  code: string;
  adresse?: string;
  statut: StatutType;
  created_at: string;
  updated_at: string;
  batiments?: Batiment[];
}

export interface Batiment {
  id: string;
  residence_id: string;
  nom: string;
  code: string;
  annee_construction?: number;
  surface_m2?: number;
  nb_logements: number;
  statut: StatutType;
  raison_indisponibilite?: string;
  date_fin_indisponibilite?: string;
  created_at: string;
  updated_at: string;
  etages?: Etage[];
}

export interface Etage {
  id: string;
  batiment_id: string;
  numero: number;
  nom: string;
  created_at: string;
  logements?: Logement[];
}

export interface Logement {
  id: string;
  etage_id: string;
  numero: string;
  surface_m2?: number;
  type_logement: string;
  statut: StatutType;
  occupant?: string;
  raison_indisponibilite?: string;
  date_fin_indisponibilite?: string;
  created_at: string;
  updated_at: string;
}

export interface Equipement {
  id: string;
  identifiant: string;
  designation: string;
  categorie: string;
  sous_categorie?: string;
  site_id?: string;
  batiment_id?: string;
  etage_id?: string;
  logement_id?: string;
  localisation_detail?: string;
  etat: EtatEquipement;
  date_mise_en_service?: string;
  marque?: string;
  modele?: string;
  numero_serie?: string;
  caracteristiques?: Record<string, unknown>;
  cout_acquisition?: number;
  prochaine_echeance?: string;
  frequence_controle?: string;
  created_at: string;
  updated_at: string;
}

export interface Intervention {
  id: string;
  titre: string;
  description?: string;
  type_intervention: string;
  priorite: PrioriteIntervention;
  statut: StatutIntervention;
  site_id?: string;
  batiment_id?: string;
  equipement_id?: string;
  logement_id?: string;
  agent_nom?: string;
  prestataire?: string;
  date_planifiee?: string;
  date_realisation?: string;
  cout?: number;
  compte_rendu?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  nom: string;
  type_document: TypeDocument;
  tags: string[];
  taille_ko?: number;
  url?: string;
  mime_type?: string;
  site_id?: string;
  batiment_id?: string;
  equipement_id?: string;
  contrat_id?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Contrat {
  id: string;
  nom: string;
  description?: string;
  prestataire: string;
  type_contrat: string;
  statut: 'actif' | 'expire' | 'resilie' | 'en_cours_renouvellement';
  date_debut: string;
  date_fin: string;
  cout_annuel?: number;
  type_reconduction?: string;
  marche_associe?: string;
  site_id?: string;
  batiment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Alerte {
  id: string;
  type_alerte: string;
  message: string;
  contrat_id?: string;
  equipement_id?: string;
  date_echeance?: string;
  statut: 'active' | 'traitee' | 'ignoree';
  created_at: string;
}

export type NodeType = 'site' | 'residence' | 'batiment' | 'etage' | 'logement' | 'categorie' | 'equipement' | 'domaine' | 'batiment_ext' | 'niveau' | 'piece';

/** Ancestor info stored on each node for breadcrumb display */
export interface NodeAncestor {
  type: NodeType;
  nom: string;
  id: string;
}

// ---- Module Réglementaire ----

export type StatutControle = 'manquant' | 'en_retard' | 'a_venir' | 'realise';
export type StatutPoint = 'conforme' | 'non_conforme';
export type StatutAction = 'en_attente' | 'planifiee' | 'terminee';

export interface TypeControle {
  id: string;
  code: string;
  nom: string;
  categorie: string;
  description?: string;
  icone?: string;
  couleur: string;
  periodicite_mois?: number;
  periodicite_label?: string;
  reference_reglementaire?: string;
  type_batiment?: string[];
  created_at: string;
}

export interface ControleReglementaire {
  id: string;
  type_controle_id: string;
  site_id?: string;
  batiment_id?: string;
  etage_id?: string;
  logement_id?: string;
  equipement_id?: string;
  localisation_detail?: string;
  organisme?: string;
  technicien?: string;
  date_dernier_controle?: string;
  date_prochain_controle?: string;
  statut: StatutControle;
  nb_conformes: number;
  nb_non_conformes: number;
  observations?: string;
  rapport_url?: string;
  created_at: string;
  updated_at: string;
  // Joined
  type_controle?: TypeControle;
  site?: { nom: string; code: string };
  batiment?: { nom: string; code: string };
}

export interface PointControle {
  id: string;
  controle_id: string;
  libelle: string;
  statut: StatutPoint;
  observation?: string;
  created_at: string;
}

export interface ActionCorrective {
  id: string;
  point_controle_id: string;
  controle_id: string;
  description: string;
  statut: StatutAction;
  priorite: string;
  responsable?: string;
  date_echeance?: string;
  date_realisation?: string;
  cout_estime?: number;
  created_at: string;
  updated_at: string;
}

export interface TreeNode {
  id: string;
  type: NodeType;
  nom: string;
  code?: string;
  statut: StatutType | string;
  children?: TreeNode[];
  data: Site | Residence | Batiment | Etage | Logement | Record<string, unknown>;
  /** Full ancestor chain from root to direct parent, ordered root → parent */
  ancestors?: NodeAncestor[];
  /** Inherited address from nearest ancestor that has one */
  adresse_heritee?: string;
  [key: string]: unknown;
}
