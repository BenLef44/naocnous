import { ControleReglementaire, TypeControle } from '../../types/patrimoine';

export type RegleView = 'dashboard' | 'tableau' | 'planning' | 'registre';

export interface RegleFilters {
  categorieType: string;
  siteIds: string[];
  echeance: '' | 'semaine' | 'mois' | 'trimestre' | 'annee';
  statut: string;
  logicOp: 'ET' | 'OU';
}

export const EMPTY_FILTERS: RegleFilters = {
  categorieType: '',
  siteIds: [],
  echeance: '',
  statut: '',
  logicOp: 'ET',
};

export interface ControleWithMeta extends ControleReglementaire {
  type_controle: TypeControle;
  site_nom?: string;
  site_code?: string;
  batiment_nom?: string;
  batiment_code?: string;
  residence_nom?: string;
}

export const STATUT_CONFIG = {
  manquant: { label: 'Manquant', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  en_retard: { label: 'En retard', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  a_venir: { label: 'À venir', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  realise: { label: 'Réalisé', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

export const CATEGORIE_ICONS: Record<string, string> = {
  'Électricité': '⚡',
  'Sécurité incendie': '🔥',
  'Équipements de levage': '🏗️',
  'Gaz & Chauffage': '🔥',
  'CVC & Ventilation': '💨',
  'Risques': '⚠️',
  'Accessibilité': '♿',
};
