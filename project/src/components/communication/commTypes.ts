// ─── Types Centre de communication ──────────────────────────────────────────

export type CommView =
  | 'dashboard'
  | 'notifications'
  | 'modeles'
  | 'regles'
  | 'destinataires'
  | 'escalades'
  | 'syntheses'
  | 'historique'
  | 'statistiques';

export type Canal = 'email' | 'notif' | 'email_notif' | 'sms';
export type StatutEnvoi = 'envoyee' | 'distribuee' | 'lue' | 'erreur';
export type ModuleSource =
  | 'interventions'
  | 'maintenance'
  | 'contrats'
  | 'reglementaire'
  | 'approvisionnements'
  | 'edl'
  | 'equipements'
  | 'renouvellements';

export interface Notification {
  id: string;
  date: string;
  type: string;
  objet: string;
  module: ModuleSource;
  destinataire: string;
  canal: Canal;
  statut: StatutEnvoi;
  lu: boolean;
  equipement?: string;
  localisation?: string[];
  targetView?: string;
}

export interface ModeleComm {
  id: string;
  nom: string;
  type: Canal;
  module: ModuleSource;
  evenement: string;
  actif: boolean;
  sujet: string;
  corps: string;
  dernierEnvoi?: string;
  nbEnvois: number;
  tauxOuverture: number;
}

export interface RegleDeclenchement {
  id: string;
  module: ModuleSource;
  evenement: string;
  modeleId: string;
  modeleNom: string;
  delai: string;
  frequence: string;
  actif: boolean;
}

export interface Escalade {
  id: string;
  nom: string;
  module: ModuleSource;
  evenement: string;
  niveaux: { niveau: number; destinataire: string; delai: string }[];
  actif: boolean;
}

export interface Synthese {
  id: string;
  nom: string;
  frequence: 'quotidienne' | 'hebdomadaire' | 'mensuelle';
  destinataires: string[];
  modules: ModuleSource[];
  actif: boolean;
  prochainEnvoi: string;
}

export interface HistoriqueEnvoi {
  id: string;
  date: string;
  canal: Canal;
  destinataire: string;
  modele: string;
  statut: StatutEnvoi;
  module: ModuleSource;
  objet: string;
}

export const MODULE_LABELS: Record<ModuleSource, string> = {
  interventions: 'Interventions',
  maintenance: 'Maintenance préventive',
  contrats: 'Contrats',
  reglementaire: 'Réglementaire',
  approvisionnements: 'Approvisionnements',
  edl: 'États des lieux',
  equipements: 'Équipements',
  renouvellements: 'Renouvellements & PPI',
};

export const CANAL_LABELS: Record<Canal, string> = {
  email: 'Email',
  notif: 'Notification',
  email_notif: 'Email + Notif.',
  sms: 'SMS',
};

export const STATUT_COLORS: Record<StatutEnvoi, { bg: string; text: string; dot: string }> = {
  envoyee:   { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  distribuee:{ bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500'  },
  lue:       { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  erreur:    { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'     },
};
