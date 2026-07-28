export type EdlStatut = 'a_realiser' | 'realise' | 'non_applicable';
export type EdlType   = 'entrant' | 'sortant' | 'pre_sortant';

export type PreEdlStatut = 'cree' | 'inspection' | 'estimation' | 'restitue' | 'clos';

export interface EdlRecord {
  id: string;
  occupant_id: string;
  logement_id: string;
  nom: string;
  prenom: string;
  logement_numero: string;
  residence_nom: string;
  type: EdlType;
  statut: EdlStatut;
  date: string | null;
  lien: string | null;
  date_entree: string | null;
  date_sortie_prevue: string | null;
  etablissement: string | null;
  type_contrat: string | null;
  // enriched fields
  batiment_nom: string | null;
  etage_numero: number | null;
  type_logement: string | null;
  surface_m2: number | null;
  photo_url: string | null;
  agent_edl: string | null;
}

export interface PreEdlRecord {
  id: string;
  occupant_id: string;
  logement_id: string;
  nom: string;
  prenom: string;
  logement_numero: string;
  residence_nom: string;
  statut: PreEdlStatut;
  date_creation: string;
  date_inspection: string | null;
  date_restitution: string | null;
  date_cloture: string | null;
  estimation_peinture: number;
  estimation_mobilier: number;
  estimation_sols: number;
  estimation_nettoyage: number;
  estimation_autre: number;
  observations: string;
  anomalies: PreEdlAnomalie[];
  date_sortie_prevue: string | null;
}

export interface PreEdlAnomalie {
  id: string;
  piece: string;
  description: string;
  gravite: 'mineure' | 'moderee' | 'majeure';
  cout_estime: number;
}

export const EDL_CFG: Record<EdlStatut, { label: string; bg: string; text: string; border: string; dot: string }> = {
  a_realiser:     { label: 'À réaliser', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  realise:        { label: 'Réalisé',    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  non_applicable: { label: 'N/A',        bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
};

export const PRE_EDL_CFG: Record<PreEdlStatut, { label: string; bg: string; text: string; border: string; dot: string }> = {
  cree:       { label: 'Créé',            bg: 'bg-slate-50',    text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
  inspection: { label: 'Inspection',      bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  estimation: { label: 'Estimation',      bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  restitue:   { label: 'Restitué',        bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500'  },
  clos:       { label: 'Clôturé',         bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

export const PRE_EDL_WORKFLOW: PreEdlStatut[] = ['cree', 'inspection', 'estimation', 'restitue', 'clos'];

export const PRE_EDL_WORKFLOW_LABELS: Record<PreEdlStatut, string> = {
  cree:       'Démarrer inspection',
  inspection: 'Saisir estimation',
  estimation: 'Restituer à l\'étudiant',
  restitue:   'Clôturer',
  clos:       '',
};

export function preEdlTotal(r: PreEdlRecord): number {
  return r.estimation_peinture + r.estimation_mobilier + r.estimation_sols + r.estimation_nettoyage + r.estimation_autre;
}

// Synthetic demo pre-EDL records
export const DEMO_PRE_EDL: PreEdlRecord[] = [
  {
    id: 'pre-1',
    occupant_id: 'occ-1',
    logement_id: 'log-1',
    nom: 'Martin',
    prenom: 'Emma',
    logement_numero: 'A-204',
    residence_nom: 'Résidence Cavalier',
    statut: 'estimation',
    date_creation: '2026-05-10',
    date_inspection: '2026-05-12',
    date_restitution: null,
    date_cloture: null,
    estimation_peinture: 450,
    estimation_mobilier: 180,
    estimation_sols: 320,
    estimation_nettoyage: 95,
    estimation_autre: 0,
    observations: 'Mur salon abîmé. Bureau légèrement griffé.',
    date_sortie_prevue: '2026-06-30',
    anomalies: [
      { id: 'a1', piece: 'Salon', description: 'Mur nord - traces importantes', gravite: 'majeure', cout_estime: 320 },
      { id: 'a2', piece: 'Chambre', description: 'Bureau griffé sur le dessus', gravite: 'mineure', cout_estime: 80 },
    ],
  },
  {
    id: 'pre-2',
    occupant_id: 'occ-2',
    logement_id: 'log-2',
    nom: 'Dubois',
    prenom: 'Lucas',
    logement_numero: 'B-108',
    residence_nom: 'Résidence Vaucanson',
    statut: 'inspection',
    date_creation: '2026-05-18',
    date_inspection: '2026-05-20',
    date_restitution: null,
    date_cloture: null,
    estimation_peinture: 0,
    estimation_mobilier: 0,
    estimation_sols: 0,
    estimation_nettoyage: 0,
    estimation_autre: 0,
    observations: '',
    date_sortie_prevue: '2026-07-15',
    anomalies: [
      { id: 'a3', piece: 'Salle de bain', description: 'Joint de douche décollé', gravite: 'moderee', cout_estime: 60 },
    ],
  },
  {
    id: 'pre-3',
    occupant_id: 'occ-3',
    logement_id: 'log-3',
    nom: 'Bernard',
    prenom: 'Chloé',
    logement_numero: 'C-312',
    residence_nom: 'Résidence Jussieu',
    statut: 'cree',
    date_creation: '2026-05-25',
    date_inspection: null,
    date_restitution: null,
    date_cloture: null,
    estimation_peinture: 0,
    estimation_mobilier: 0,
    estimation_sols: 0,
    estimation_nettoyage: 0,
    estimation_autre: 0,
    observations: '',
    date_sortie_prevue: '2026-07-31',
    anomalies: [],
  },
  {
    id: 'pre-4',
    occupant_id: 'occ-4',
    logement_id: 'log-4',
    nom: 'Leroy',
    prenom: 'Hugo',
    logement_numero: 'A-115',
    residence_nom: 'Résidence Cavalier',
    statut: 'clos',
    date_creation: '2026-04-02',
    date_inspection: '2026-04-04',
    date_restitution: '2026-04-06',
    date_cloture: '2026-04-10',
    estimation_peinture: 600,
    estimation_mobilier: 250,
    estimation_sols: 180,
    estimation_nettoyage: 120,
    estimation_autre: 95,
    observations: 'Remis en état complet requis. EDL sortant confirmé les constats.',
    date_sortie_prevue: '2026-04-30',
    anomalies: [
      { id: 'a5', piece: 'Salon', description: 'Revêtement de sol dégradé', gravite: 'majeure', cout_estime: 180 },
      { id: 'a6', piece: 'Cuisine', description: 'Plaque vitrocéramique fissurée', gravite: 'majeure', cout_estime: 250 },
      { id: 'a7', piece: 'Chambre', description: 'Tâche incrustée sur la moquette', gravite: 'moderee', cout_estime: 90 },
    ],
  },
  {
    id: 'pre-5',
    occupant_id: 'occ-5',
    logement_id: 'log-5',
    nom: 'Petit',
    prenom: 'Inès',
    logement_numero: 'D-207',
    residence_nom: 'Résidence Chapelle',
    statut: 'restitue',
    date_creation: '2026-05-05',
    date_inspection: '2026-05-07',
    date_restitution: '2026-05-09',
    date_cloture: null,
    estimation_peinture: 380,
    estimation_mobilier: 0,
    estimation_sols: 220,
    estimation_nettoyage: 80,
    estimation_autre: 0,
    observations: 'Occupante informée et en accord sur les montants.',
    date_sortie_prevue: '2026-06-15',
    anomalies: [
      { id: 'a8', piece: 'Entrée', description: 'Traces sur la porte palière', gravite: 'mineure', cout_estime: 120 },
      { id: 'a9', piece: 'Chambre', description: 'Sol partiellement décollé', gravite: 'moderee', cout_estime: 220 },
    ],
  },
];
