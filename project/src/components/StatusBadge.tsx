import { StatutType, EtatEquipement, StatutIntervention } from '../types/patrimoine';

type StatusBadgeProps = {
  status: StatutType | EtatEquipement | StatutIntervention | string;
  size?: 'sm' | 'md';
};

const statusConfig: Record<string, { label: string; classes: string }> = {
  disponible: { label: 'Disponible', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  indisponible: { label: 'Indisponible', classes: 'bg-red-100 text-red-700 border border-red-200' },
  en_maintenance: { label: 'En maintenance', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
  sinistre: { label: 'Sinistre', classes: 'bg-red-200 text-red-800 border border-red-300' },
  fonctionnel: { label: 'Fonctionnel', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  en_panne: { label: 'En panne', classes: 'bg-red-100 text-red-700 border border-red-200' },
  a_remplacer: { label: 'À remplacer', classes: 'bg-orange-100 text-orange-700 border border-orange-200' },
  hors_service: { label: 'Hors service', classes: 'bg-gray-200 text-gray-600 border border-gray-300' },
  planifiee: { label: 'Planifiée', classes: 'bg-blue-100 text-blue-700 border border-blue-200' },
  en_cours: { label: 'En cours', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
  terminee: { label: 'Terminée', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  annulee: { label: 'Annulée', classes: 'bg-gray-100 text-gray-500 border border-gray-200' },
  actif: { label: 'Actif', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  expire: { label: 'Expiré', classes: 'bg-red-100 text-red-700 border border-red-200' },
  resilie: { label: 'Résilié', classes: 'bg-gray-200 text-gray-600 border border-gray-300' },
  en_cours_renouvellement: { label: 'Renouvellement', classes: 'bg-blue-100 text-blue-700 border border-blue-200' },
  active: { label: 'Active', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
  traitee: { label: 'Traitée', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  ignoree: { label: 'Ignorée', classes: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, classes: 'bg-gray-100 text-gray-600 border border-gray-200' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.classes}`}>
      {config.label}
    </span>
  );
}
