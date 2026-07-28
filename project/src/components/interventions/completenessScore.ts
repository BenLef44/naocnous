import type { DemandeParsed } from './interventionsTypes';

export type CriterionKey =
  | 'localisation'
  | 'categorie'
  | 'description'
  | 'criticite'
  | 'piece_jointe'
  | 'demandeur'
  | 'batiment';

export interface Criterion {
  key: CriterionKey;
  label: string;
  weight: number;
  filled: boolean;
  sectionId: string;
}

export interface CompletenessResult {
  score: number;
  criteria: Criterion[];
  status: 'complete' | 'good' | 'low';
}

export function calcCompleteness(
  demande: DemandeParsed,
  attachmentTotal: number,
): CompletenessResult {
  const criteria: Criterion[] = [
    {
      key: 'localisation',
      label: 'Localisation',
      weight: 20,
      filled: !!demande.site_id || !!demande.residence_id,
      sectionId: 'section-localisation',
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      weight: 15,
      filled: !!demande.type_intervention,
      sectionId: 'section-description',
    },
    {
      key: 'description',
      label: 'Description',
      weight: 20,
      filled: !!demande.description && demande.description.trim().length > 0,
      sectionId: 'section-description',
    },
    {
      key: 'criticite',
      label: 'Criticité',
      weight: 15,
      filled: !!demande.criticite,
      sectionId: 'section-criticite',
    },
    {
      key: 'piece_jointe',
      label: 'Pièce jointe',
      weight: 10,
      filled: attachmentTotal > 0,
      sectionId: 'section-attachments',
    },
    {
      key: 'demandeur',
      label: 'Demandeur',
      weight: 10,
      filled: !!demande.demandeur_nom && demande.demandeur_nom.trim().length > 0,
      sectionId: 'section-demandeur',
    },
    {
      key: 'batiment',
      label: 'Bâtiment',
      weight: 10,
      filled: !!demande.batiment_id || !!demande.batiment_nom,
      sectionId: 'section-localisation',
    },
  ];

  const score = criteria.reduce(
    (sum, c) => sum + (c.filled ? c.weight : 0),
    0,
  );

  const status: CompletenessResult['status'] =
    score === 100 ? 'complete' : score >= 50 ? 'good' : 'low';

  return { score, criteria, status };
}

// Color palette based on score thresholds
export function completenessColors(score: number) {
  if (score === 100) {
    // Dark green — complete
    return {
      text:   'text-emerald-800',
      bar:    'bg-emerald-600',
      track:  'bg-emerald-200',
      banner: 'bg-emerald-50 border-emerald-200',
      icon:   'text-emerald-700',
    };
  }
  if (score >= 50) {
    // Light green — good progress
    return {
      text:   'text-green-700',
      bar:    'bg-green-400',
      track:  'bg-green-100',
      banner: 'bg-green-50 border-green-200',
      icon:   'text-green-600',
    };
  }
  // Blue — neutral / starting
  return {
    text:   'text-blue-700',
    bar:    'bg-blue-500',
    track:  'bg-blue-100',
    banner: 'bg-blue-50 border-blue-200',
    icon:   'text-blue-600',
  };
}
