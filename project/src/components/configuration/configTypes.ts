export type ConfigSection =
  | 'utilisateurs'
  | 'profils'
  | 'bibliotheque'
  | 'habilitations'
  | 'perimetres'
  | 'dashboards'
  | 'communication'
  | 'parametres'
  | 'journal';

export interface ConfigProfil {
  id: string;
  nom: string;
  description: string | null;
  emoji: string | null;
  actif: boolean;
  dashboard_defaut: string | null;
  created_at: string;
  updated_at: string;
  _nb_utilisateurs?: number;
  _modules?: ConfigProfilModule[];
}

export interface ConfigProfilModule {
  id: string;
  profil_id: string;
  module_id: string;
  peut_voir: boolean;
  peut_creer: boolean;
  peut_modifier: boolean;
  peut_supprimer: boolean;
  peut_exporter: boolean;
  peut_administrer: boolean;
}

export interface ConfigUtilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  profil_id: string | null;
  actif: boolean;
  perimetre: string | null;
  service: string | null;
  telephone: string | null;
  created_at: string;
  updated_at: string;
  _profil_nom?: string;
  _profil_emoji?: string;
}

export interface ConfigPerimetre {
  id: string;
  type: string;
  nom: string;
  description: string | null;
  parent_id: string | null;
  actif: boolean;
  created_at: string;
}

export interface ConfigJournalEntry {
  id: string;
  date_action: string;
  utilisateur_nom: string;
  type_action: string;
  objet_type: string;
  objet_nom: string;
  ancienne_valeur: string | null;
  nouvelle_valeur: string | null;
  details: string | null;
}

export const ALL_MODULES = [
  { id: 'interventions',      label: 'Interventions',            groupe: 'Opérations' },
  { id: 'arborescence',       label: 'Référentiel Patrimoine',   groupe: 'Patrimoine' },
  { id: 'equipements',        label: 'Équipements',              groupe: 'Patrimoine' },
  { id: 'maintenance',        label: 'Maintenance préventive',   groupe: 'Opérations' },
  { id: 'documents',          label: 'Documents (GED)',          groupe: 'Patrimoine' },
  { id: 'contrats',           label: 'Contrats',                 groupe: 'Administratif' },
  { id: 'reglementaire',      label: 'Réglementaire',            groupe: 'Sécurité' },
  { id: 'edl',                label: 'États des lieux',          groupe: 'Patrimoine' },
  { id: 'ppi',                label: 'Renouvellements & PPI',    groupe: 'Administratif' },
  { id: 'finance',            label: 'Coûts & Finances',         groupe: 'Administratif' },
  { id: 'fluides',            label: 'Conso. Fluides',           groupe: 'Opérations' },
  { id: 'predictif',          label: 'Prédictif IA',             groupe: 'Analytics' },
  { id: 'approvisionnements', label: 'Approvisionnements',       groupe: 'Opérations' },
  { id: 'communication',      label: 'Communication',            groupe: 'Transverse' },
  { id: 'configuration',      label: 'Configuration',            groupe: 'Transverse' },
] as const;

export const PERMISSION_ACTIONS = [
  { key: 'peut_voir',       label: 'Voir' },
  { key: 'peut_creer',      label: 'Créer' },
  { key: 'peut_modifier',   label: 'Modifier' },
  { key: 'peut_supprimer',  label: 'Supprimer' },
  { key: 'peut_exporter',   label: 'Exporter' },
  { key: 'peut_administrer',label: 'Administrer' },
] as const;

export const PERIMETRE_TYPES = ['CROUS', 'Campus', 'Résidence', 'Bâtiment', 'Service', 'Patrimoine'] as const;

export const DASHBOARD_OPTIONS = [
  { id: 'maintenance',        label: 'Dashboard Maintenance' },
  { id: 'reglementaire',      label: 'Dashboard Réglementaire' },
  { id: 'approvisionnements', label: 'Dashboard Approvisionnements' },
  { id: 'contrats',           label: 'Dashboard Contrats' },
  { id: 'direction',          label: 'Dashboard Direction' },
] as const;
