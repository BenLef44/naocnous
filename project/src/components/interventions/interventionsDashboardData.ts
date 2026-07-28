// ─── Static slice data for Interventions dashboard charts ─────────────────────

export interface SliceRow { nom: string; [key: string]: number | string; }
export interface TimePoint { label: string; shortLabel: string; [key: string]: number | string; }

// ── Ventilation: par catégorie d'intervention ──────────────────────────────────

export const CATEGORIE_DATA: SliceRow[] = [
  { nom: 'Plomberie',               total: 420, en_cours: 22, en_retard: 48, resolu: 350 },
  { nom: 'Électricité',             total: 380, en_cours: 18, en_retard: 42, resolu: 320 },
  { nom: 'Chauffage / CVC',         total: 295, en_cours: 14, en_retard: 32, resolu: 249 },
  { nom: 'Serrurerie',              total: 185, en_cours: 8,  en_retard: 20, resolu: 157 },
  { nom: 'Menuiserie / Vitrerie',   total: 142, en_cours: 6,  en_retard: 16, resolu: 120 },
  { nom: 'Électroménager',          total: 210, en_cours: 10, en_retard: 24, resolu: 176 },
  { nom: 'Nettoyage / Hygiène',     total: 165, en_cours: 8,  en_retard: 18, resolu: 139 },
  { nom: 'Sécurité incendie',       total: 95,  en_cours: 5,  en_retard: 11, resolu: 79  },
  { nom: 'Ascenseur',               total: 78,  en_cours: 4,  en_retard: 9,  resolu: 65  },
  { nom: 'Froid / Réfrigération',   total: 55,  en_cours: 3,  en_retard: 6,  resolu: 46  },
  { nom: 'VMC / Ventilation',       total: 88,  en_cours: 4,  en_retard: 10, resolu: 74  },
  { nom: 'Autre',                   total: 235, en_cours: 12, en_retard: 26, resolu: 197 },
];

// ── Ventilation: par résidence ─────────────────────────────────────────────────

export const RESIDENCE_INT_DATA: SliceRow[] = [
  { nom: 'Jacques Cavalier',        total: 185, en_cours: 10, en_retard: 21, resolu: 154 },
  { nom: 'Jussieu',                 total: 164, en_cours: 9,  en_retard: 18, resolu: 137 },
  { nom: 'Jean Mermoz',             total: 152, en_cours: 8,  en_retard: 17, resolu: 127 },
  { nom: 'André Allix',             total: 138, en_cours: 7,  en_retard: 15, resolu: 116 },
  { nom: 'Paradin',                 total: 120, en_cours: 6,  en_retard: 13, resolu: 101 },
  { nom: 'Croix du Sud',            total: 98,  en_cours: 5,  en_retard: 11, resolu: 82  },
  { nom: 'La Madeleine',            total: 88,  en_cours: 5,  en_retard: 10, resolu: 73  },
  { nom: 'Voltaire',                total: 72,  en_cours: 4,  en_retard: 8,  resolu: 60  },
  { nom: 'Les Quais',               total: 65,  en_cours: 3,  en_retard: 7,  resolu: 55  },
  { nom: 'Confluence',              total: 58,  en_cours: 3,  en_retard: 6,  resolu: 49  },
  { nom: 'Autres',                  total: 208, en_cours: 10, en_retard: 23, resolu: 175 },
];

// ── Ventilation: par agent/prestataire ────────────────────────────────────────

export const AGENT_INT_DATA: SliceRow[] = [
  { nom: 'Martin D.',      total: 145, en_cours: 8, en_retard: 16, resolu: 121 },
  { nom: 'Leroy P.',       total: 132, en_cours: 7, en_retard: 14, resolu: 111 },
  { nom: 'Bernard C.',     total: 118, en_cours: 6, en_retard: 13, resolu: 99  },
  { nom: 'Laurent E.',     total: 108, en_cours: 6, en_retard: 12, resolu: 90  },
  { nom: 'Michel G.',      total: 95,  en_cours: 5, en_retard: 10, resolu: 80  },
  { nom: 'Non affecté',    total: 650, en_cours: 82, en_retard: 68, resolu: 500 },
];

export const PRESTATAIRE_INT_DATA: SliceRow[] = [
  { nom: 'Plomberie Martin',    total: 380, en_cours: 18, en_retard: 42, resolu: 320 },
  { nom: 'Électricité Dupont',  total: 295, en_cours: 14, en_retard: 32, resolu: 249 },
  { nom: 'Thermidor CVC',       total: 210, en_cours: 10, en_retard: 23, resolu: 177 },
  { nom: 'Otis Ascenseurs',     total: 88,  en_cours: 4,  en_retard: 10, resolu: 74  },
  { nom: 'SOCOTEC',             total: 75,  en_cours: 4,  en_retard: 8,  resolu: 63  },
  { nom: 'Autres',              total: 300, en_cours: 14, en_retard: 33, resolu: 253 },
];

// ── Ventilation: par canal source ─────────────────────────────────────────────

export const CANAL_INT_DATA: SliceRow[] = [
  { nom: 'My Résidence',  total: 5040, en_cours: 72, en_retard: 180, resolu: 4788 },
  { nom: 'Interne',       total: 2420, en_cours: 36, en_retard: 88,  resolu: 2296 },
  { nom: 'Téléphone',     total: 1180, en_cours: 18, en_retard: 42,  resolu: 1120 },
  { nom: 'Email',         total: 1708, en_cours: 26, en_retard: 62,  resolu: 1620 },
];

// ─── Time-series: Demandes par mois ──────────────────────────────────────────

export const MONTHLY_DI: Record<number, TimePoint[]> = {
  2022: [
    { label: 'Jan', shortLabel: 'J', nouvelles: 52, resolues: 45, en_retard: 28, critiques: 4 },
    { label: 'Fév', shortLabel: 'F', nouvelles: 48, resolues: 50, en_retard: 25, critiques: 3 },
    { label: 'Mar', shortLabel: 'M', nouvelles: 61, resolues: 55, en_retard: 30, critiques: 5 },
    { label: 'Avr', shortLabel: 'A', nouvelles: 55, resolues: 58, en_retard: 27, critiques: 4 },
    { label: 'Mai', shortLabel: 'M', nouvelles: 49, resolues: 52, en_retard: 24, critiques: 3 },
    { label: 'Jun', shortLabel: 'J', nouvelles: 44, resolues: 47, en_retard: 22, critiques: 2 },
    { label: 'Jul', shortLabel: 'J', nouvelles: 38, resolues: 41, en_retard: 18, critiques: 2 },
    { label: 'Aoû', shortLabel: 'A', nouvelles: 32, resolues: 35, en_retard: 15, critiques: 1 },
    { label: 'Sep', shortLabel: 'S', nouvelles: 58, resolues: 52, en_retard: 29, critiques: 5 },
    { label: 'Oct', shortLabel: 'O', nouvelles: 64, resolues: 60, en_retard: 32, critiques: 6 },
    { label: 'Nov', shortLabel: 'N', nouvelles: 60, resolues: 58, en_retard: 30, critiques: 5 },
    { label: 'Déc', shortLabel: 'D', nouvelles: 55, resolues: 62, en_retard: 26, critiques: 4 },
  ],
  2023: [
    { label: 'Jan', shortLabel: 'J', nouvelles: 58, resolues: 52, en_retard: 26, critiques: 5 },
    { label: 'Fév', shortLabel: 'F', nouvelles: 54, resolues: 56, en_retard: 23, critiques: 4 },
    { label: 'Mar', shortLabel: 'M', nouvelles: 68, resolues: 62, en_retard: 28, critiques: 6 },
    { label: 'Avr', shortLabel: 'A', nouvelles: 62, resolues: 66, en_retard: 25, critiques: 5 },
    { label: 'Mai', shortLabel: 'M', nouvelles: 55, resolues: 58, en_retard: 22, critiques: 3 },
    { label: 'Jun', shortLabel: 'J', nouvelles: 50, resolues: 54, en_retard: 20, critiques: 2 },
    { label: 'Jul', shortLabel: 'J', nouvelles: 42, resolues: 46, en_retard: 16, critiques: 2 },
    { label: 'Aoû', shortLabel: 'A', nouvelles: 36, resolues: 40, en_retard: 13, critiques: 1 },
    { label: 'Sep', shortLabel: 'S', nouvelles: 65, resolues: 58, en_retard: 27, critiques: 6 },
    { label: 'Oct', shortLabel: 'O', nouvelles: 72, resolues: 68, en_retard: 30, critiques: 7 },
    { label: 'Nov', shortLabel: 'N', nouvelles: 68, resolues: 65, en_retard: 28, critiques: 6 },
    { label: 'Déc', shortLabel: 'D', nouvelles: 62, resolues: 70, en_retard: 24, critiques: 4 },
  ],
  2024: [
    { label: 'Jan', shortLabel: 'J', nouvelles: 72, resolues: 65, en_retard: 24, critiques: 7 },
    { label: 'Fév', shortLabel: 'F', nouvelles: 68, resolues: 70, en_retard: 21, critiques: 5 },
    { label: 'Mar', shortLabel: 'M', nouvelles: 84, resolues: 78, en_retard: 26, critiques: 8 },
    { label: 'Avr', shortLabel: 'A', nouvelles: 78, resolues: 82, en_retard: 23, critiques: 6 },
    { label: 'Mai', shortLabel: 'M', nouvelles: 70, resolues: 74, en_retard: 20, critiques: 5 },
    { label: 'Jun', shortLabel: 'J', nouvelles: 63, resolues: 68, en_retard: 18, critiques: 3 },
    { label: 'Jul', shortLabel: 'J', nouvelles: 55, resolues: 58, en_retard: 14, critiques: 3 },
    { label: 'Aoû', shortLabel: 'A', nouvelles: 46, resolues: 50, en_retard: 11, critiques: 2 },
    { label: 'Sep', shortLabel: 'S', nouvelles: 80, resolues: 72, en_retard: 25, critiques: 8 },
    { label: 'Oct', shortLabel: 'O', nouvelles: 88, resolues: 84, en_retard: 28, critiques: 9 },
    { label: 'Nov', shortLabel: 'N', nouvelles: 84, resolues: 80, en_retard: 26, critiques: 8 },
    { label: 'Déc', shortLabel: 'D', nouvelles: 78, resolues: 86, en_retard: 22, critiques: 6 },
  ],
  2025: [
    { label: 'Jan', shortLabel: 'J', nouvelles: 88, resolues: 80, en_retard: 22, critiques: 9 },
    { label: 'Fév', shortLabel: 'F', nouvelles: 84, resolues: 86, en_retard: 19, critiques: 7 },
    { label: 'Mar', shortLabel: 'M', nouvelles: 102, resolues: 95, en_retard: 24, critiques: 10 },
    { label: 'Avr', shortLabel: 'A', nouvelles: 95, resolues: 100, en_retard: 21, critiques: 8 },
    { label: 'Mai', shortLabel: 'M', nouvelles: 86, resolues: 90, en_retard: 18, critiques: 6 },
    { label: 'Jun', shortLabel: 'J', nouvelles: 78, resolues: 83, en_retard: 16, critiques: 4 },
    { label: 'Jul', shortLabel: 'J', nouvelles: 68, resolues: 72, en_retard: 12, critiques: 3 },
    { label: 'Aoû', shortLabel: 'A', nouvelles: 58, resolues: 62, en_retard: 9,  critiques: 2 },
    { label: 'Sep', shortLabel: 'S', nouvelles: 98, resolues: 88, en_retard: 23, critiques: 10 },
    { label: 'Oct', shortLabel: 'O', nouvelles: 108, resolues: 102, en_retard: 26, critiques: 12 },
    { label: 'Nov', shortLabel: 'N', nouvelles: 102, resolues: 98, en_retard: 24, critiques: 11 },
    { label: 'Déc', shortLabel: 'D', nouvelles: 95, resolues: 105, en_retard: 20, critiques: 8 },
  ],
  2026: [
    { label: 'Jan', shortLabel: 'J', nouvelles: 108, resolues: 98,  en_retard: 20, critiques: 12 },
    { label: 'Fév', shortLabel: 'F', nouvelles: 102, resolues: 105, en_retard: 17, critiques: 9  },
    { label: 'Mar', shortLabel: 'M', nouvelles: 122, resolues: 112, en_retard: 22, critiques: 14 },
    { label: 'Avr', shortLabel: 'A', nouvelles: 115, resolues: 118, en_retard: 19, critiques: 11 },
    { label: 'Mai', shortLabel: 'M', nouvelles: 104, resolues: 108, en_retard: 16, critiques: 8  },
    { label: 'Jun', shortLabel: 'J', nouvelles: 95,  resolues: 100, en_retard: 14, critiques: 6  },
    { label: 'Jul', shortLabel: 'J', nouvelles: 82,  resolues: 88,  en_retard: 11, critiques: 4  },
    { label: 'Aoû', shortLabel: 'A', nouvelles: 70,  resolues: 75,  en_retard: 8,  critiques: 3  },
    { label: 'Sep', shortLabel: 'S', nouvelles: 118, resolues: 105, en_retard: 21, critiques: 13 },
    { label: 'Oct', shortLabel: 'O', nouvelles: 128, resolues: 122, en_retard: 24, critiques: 15 },
    { label: 'Nov', shortLabel: 'N', nouvelles: 122, resolues: 116, en_retard: 22, critiques: 14 },
    { label: 'Déc', shortLabel: 'D', nouvelles: 115, resolues: 125, en_retard: 18, critiques: 10 },
  ],
};

export const YEARLY_DI: TimePoint[] = [
  { label: '2022', shortLabel: '2022', nouvelles: 616, resolues: 615, en_retard: 28, critiques: 4  },
  { label: '2023', shortLabel: '2023', nouvelles: 692, resolues: 695, en_retard: 24, critiques: 5  },
  { label: '2024', shortLabel: '2024', nouvelles: 846, resolues: 857, en_retard: 22, critiques: 6  },
  { label: '2025', shortLabel: '2025', nouvelles: 1062, resolues: 1061, en_retard: 20, critiques: 9 },
  { label: '2026', shortLabel: '2026', nouvelles: 1181, resolues: 1172, en_retard: 18, critiques: 12 },
];

// ── Temps de résolution moyen (heures) ────────────────────────────────────────

export const MONTHLY_TEMPS_RES: Record<number, TimePoint[]> = {
  2026: [
    { label: 'Jan', shortLabel: 'J', critique: 3.8, haute: 7.2, moyenne: 38, faible: 68 },
    { label: 'Fév', shortLabel: 'F', critique: 3.5, haute: 6.8, moyenne: 36, faible: 65 },
    { label: 'Mar', shortLabel: 'M', critique: 4.1, haute: 7.5, moyenne: 40, faible: 72 },
    { label: 'Avr', shortLabel: 'A', critique: 3.9, haute: 7.1, moyenne: 37, faible: 69 },
    { label: 'Mai', shortLabel: 'M', critique: 3.6, haute: 6.9, moyenne: 35, faible: 63 },
    { label: 'Jun', shortLabel: 'J', critique: 3.4, haute: 6.5, moyenne: 33, faible: 61 },
    { label: 'Jul', shortLabel: 'J', critique: 3.2, haute: 6.2, moyenne: 32, faible: 58 },
    { label: 'Aoû', shortLabel: 'A', critique: 3.0, haute: 5.8, moyenne: 30, faible: 55 },
    { label: 'Sep', shortLabel: 'S', critique: 3.7, haute: 7.0, moyenne: 36, faible: 65 },
    { label: 'Oct', shortLabel: 'O', critique: 4.0, haute: 7.3, moyenne: 39, faible: 70 },
    { label: 'Nov', shortLabel: 'N', critique: 3.8, haute: 7.1, moyenne: 37, faible: 67 },
    { label: 'Déc', shortLabel: 'D', critique: 3.5, haute: 6.7, moyenne: 34, faible: 62 },
  ],
};

export const YEARLY_TEMPS_RES: TimePoint[] = [
  { label: '2022', shortLabel: '2022', critique: 5.2, haute: 9.8,  moyenne: 55, faible: 95 },
  { label: '2023', shortLabel: '2023', critique: 4.8, haute: 9.0,  moyenne: 50, faible: 88 },
  { label: '2024', shortLabel: '2024', critique: 4.4, haute: 8.2,  moyenne: 45, faible: 80 },
  { label: '2025', shortLabel: '2025', critique: 4.0, haute: 7.5,  moyenne: 40, faible: 72 },
  { label: '2026', shortLabel: '2026', critique: 3.5, haute: 6.9,  moyenne: 35, faible: 63 },
];

// ── Ventilation: par site/campus ──────────────────────────────────────────────

export const SITE_INT_DATA: SliceRow[] = [
  { nom: 'Campus Centre Lyon 6',           total: 512, en_cours: 28, en_retard: 58, resolu: 426 },
  { nom: 'Campus Manufacture des Tabacs',   total: 318, en_cours: 17, en_retard: 36, resolu: 265 },
  { nom: 'Campus Nord',                     total: 245, en_cours: 13, en_retard: 28, resolu: 204 },
  { nom: 'Campus Rockefeller',              total: 183, en_cours: 10, en_retard: 21, resolu: 152 },
  { nom: 'Campus Berges du Rhône',          total: 134, en_cours: 7,  en_retard: 15, resolu: 112 },
  { nom: 'Autres sites',                    total: 756, en_cours: 39, en_retard: 86, resolu: 631 },
];

// ── Ventilation: par marché / contrat ─────────────────────────────────────────

export const MARCHE_INT_DATA: SliceRow[] = [
  { nom: 'Marché plomberie — Lot 1',        total: 420, en_cours: 22, en_retard: 48, resolu: 350 },
  { nom: 'Marché élec. — Lot 2',            total: 380, en_cours: 18, en_retard: 42, resolu: 320 },
  { nom: 'Marché CVC — Lot 3',              total: 295, en_cours: 14, en_retard: 32, resolu: 249 },
  { nom: 'Marché ascenseurs — Lot 4',       total: 88,  en_cours: 4,  en_retard: 10, resolu: 74  },
  { nom: 'Marché sécurité — Lot 5',         total: 95,  en_cours: 5,  en_retard: 11, resolu: 79  },
  { nom: 'Régie interne',                   total: 870, en_cours: 50, en_retard: 95, resolu: 725 },
  { nom: 'Autres marchés',                  total: 200, en_cours: 11, en_retard: 23, resolu: 166 },
];

// ── Ventilation: par équipement ───────────────────────────────────────────────

export const EQUIPEMENT_INT_DATA: SliceRow[] = [
  { nom: 'Robinetterie / Sanitaires',       total: 320, en_cours: 17, en_retard: 36, resolu: 267 },
  { nom: 'Tableau électrique',              total: 210, en_cours: 11, en_retard: 24, resolu: 175 },
  { nom: 'Chaudière / Chaufferie',          total: 180, en_cours: 9,  en_retard: 20, resolu: 151 },
  { nom: 'Ascenseur',                       total: 88,  en_cours: 4,  en_retard: 10, resolu: 74  },
  { nom: 'VMC / CTA',                       total: 88,  en_cours: 4,  en_retard: 10, resolu: 74  },
  { nom: 'Armoire réfrigérée',              total: 55,  en_cours: 3,  en_retard: 6,  resolu: 46  },
  { nom: 'Serrurerie / Contrôle accès',     total: 185, en_cours: 8,  en_retard: 20, resolu: 157 },
  { nom: 'Menuiserie / Vitrerie',           total: 142, en_cours: 6,  en_retard: 16, resolu: 120 },
  { nom: 'Autres équipements',              total: 580, en_cours: 31, en_retard: 66, resolu: 483 },
];

// ── Délais moyens par criticité (heures) ──────────────────────────────────────

export interface DelaiRow { criticite: string; dmpt: number; dmr: number; nb: number; objectif_dmr: number; }

export const DELAIS_DATA: DelaiRow[] = [
  { criticite: 'Critique', dmpt: 0.5,  dmr: 3.5,  nb: 14,  objectif_dmr: 4   },
  { criticite: 'Haute',    dmpt: 2.0,  dmr: 7.1,  nb: 25,  objectif_dmr: 8   },
  { criticite: 'Moyenne',  dmpt: 12.0, dmr: 36.0, nb: 31,  objectif_dmr: 48  },
  { criticite: 'Faible',   dmpt: 24.0, dmr: 63.0, nb: 78,  objectif_dmr: 120 },
];

// ── Volumes marché (pour KPI) ─────────────────────────────────────────────────

export const MARCHE_KPI = {
  total_marches: 5,
  actifs: 5,
  valeur_engagee: 187400,
  di_sous_marche: 1348,
  di_regie: 870,
};


export const COLORS_DI = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4',
];
