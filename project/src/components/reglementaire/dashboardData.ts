// ─── Static slice data ────────────────────────────────────────────────────────

export interface TypeControleRow { nom: string; manquant: number; en_retard: number; a_venir: number; realise: number; }
export interface ResidenceRow    { nom: string; manquant: number; en_retard: number; a_venir: number; realise: number; }

export const TYPE_CONTROLE_DATA: TypeControleRow[] = [
  { nom: '🔥 Sécurité incendie',             manquant: 30, en_retard: 60, a_venir: 80,  realise: 250 },
  { nom: '⚡ Électricité',                     manquant: 20, en_retard: 40, a_venir: 50,  realise: 150 },
  { nom: '💨 Ventilation / Désenfumage',       manquant: 15, en_retard: 35, a_venir: 40,  realise: 90  },
  { nom: '🛗 Ascenseurs / levage',             manquant: 10, en_retard: 10, a_venir: 15,  realise: 85  },
  { nom: '🔥 Gaz / chaufferies',               manquant: 10, en_retard: 15, a_venir: 25,  realise: 90  },
  { nom: '💧 Légionelles / ECS',               manquant: 10, en_retard: 20, a_venir: 20,  realise: 60  },
  { nom: '💡 BAES / éclairage sécurité',       manquant: 18, en_retard: 25, a_venir: 32,  realise: 65  },
  { nom: '🚪 Portes automatiques / coupe-feu', manquant: 12, en_retard: 20, a_venir: 18,  realise: 40  },
  { nom: '♿ Accessibilité PMR',                manquant:  8, en_retard: 10, a_venir: 12,  realise: 30  },
  { nom: '😷 Amiante / DTA',                   manquant:  4, en_retard:  6, a_venir: 10,  realise: 30  },
  { nom: '🏢 Structure / toiture',             manquant:  6, en_retard: 12, a_venir: 14,  realise: 38  },
  { nom: '❄️ Climatisation / F-Gaz',           manquant:  8, en_retard: 15, a_venir: 17,  realise: 40  },
  { nom: '⚙️ Équipements techniques divers',   manquant: 12, en_retard: 18, a_venir: 20,  realise: 35  },
  { nom: '📋 ERP / commissions sécurité',      manquant:  4, en_retard:  6, a_venir:  8,  realise: 22  },
  { nom: '🛠️ Sécurité travail / EPI',          manquant: 14, en_retard: 18, a_venir: 18,  realise: 30  },
  { nom: '🌍 Performance énergétique / DPE',   manquant: 18, en_retard:  6, a_venir: 12,  realise: 24  },
];

export const SITE_DATA: ResidenceRow[] = [
  { nom: 'La Doua / Villeurbanne',          manquant: 22, en_retard: 35, a_venir: 48, realise: 148 },
  { nom: 'Rockefeller / Laënnec',           manquant: 14, en_retard: 22, a_venir: 32, realise: 98  },
  { nom: 'Centre / Lyon 6',                 manquant:  6, en_retard: 10, a_venir: 14, realise: 42  },
  { nom: 'Berges du Rhône / Tabacs',        manquant: 18, en_retard: 28, a_venir: 38, realise: 115 },
  { nom: 'Porte des Alpes (Bron)',          manquant:  7, en_retard: 11, a_venir: 16, realise: 48  },
  { nom: 'ENS Lyon / Gerland',              manquant:  6, en_retard:  9, a_venir: 13, realise: 40  },
  { nom: 'Lyon 5 — Saint-Just',             manquant: 15, en_retard: 24, a_venir: 33, realise: 100 },
  { nom: 'Lyon Centre / Presqu\'île',       manquant:  4, en_retard:  6, a_venir:  9, realise: 26  },
  { nom: 'Lyon Centre / Lyon 6',            manquant:  3, en_retard:  4, a_venir:  6, realise: 18  },
  { nom: 'Saint-Priest',                    manquant:  3, en_retard:  4, a_venir:  6, realise: 18  },
  { nom: 'Bourg-en-Bresse',                 manquant:  2, en_retard:  3, a_venir:  5, realise: 14  },
  { nom: 'Saint-Étienne',                   manquant:  3, en_retard:  4, a_venir:  6, realise: 18  },
  { nom: 'Roanne',                          manquant:  2, en_retard:  3, a_venir:  4, realise: 12  },
];

export const RESIDENCE_DATA: ResidenceRow[] = [
  { nom: 'Jussieu',               manquant: 8, en_retard: 12, a_venir: 16, realise: 52 },
  { nom: 'Les Antonins',          manquant: 5, en_retard:  8, a_venir: 11, realise: 34 },
  { nom: 'Puvis de Chavannes',    manquant: 4, en_retard:  6, a_venir:  9, realise: 28 },
  { nom: 'Einstein',              manquant: 4, en_retard:  5, a_venir:  8, realise: 24 },
  { nom: 'Jussieu Studios',       manquant: 3, en_retard:  4, a_venir:  6, realise: 16 },
  { nom: 'Archimède',             manquant: 2, en_retard:  3, a_venir:  4, realise: 12 },
  { nom: 'Althéa',                manquant: 2, en_retard:  3, a_venir:  4, realise: 12 },
  { nom: 'Paradin',               manquant: 5, en_retard:  8, a_venir: 11, realise: 36 },
  { nom: 'Croix du Sud',          manquant: 3, en_retard:  5, a_venir:  8, realise: 22 },
  { nom: 'Jean Mermoz',           manquant: 7, en_retard: 11, a_venir: 15, realise: 48 },
  { nom: 'Jacques Cavalier',      manquant: 3, en_retard:  5, a_venir:  8, realise: 22 },
  { nom: 'Voltaire',              manquant: 2, en_retard:  3, a_venir:  5, realise: 14 },
  { nom: 'La Madeleine',          manquant: 5, en_retard:  8, a_venir: 11, realise: 36 },
  { nom: 'Les Quais',             manquant: 3, en_retard:  5, a_venir:  7, realise: 22 },
  { nom: 'Garibaldi',             manquant: 3, en_retard:  5, a_venir:  7, realise: 22 },
  { nom: 'Benjamin Delessert',    manquant: 3, en_retard:  4, a_venir:  6, realise: 18 },
  { nom: 'André Lirondelle',      manquant: 3, en_retard:  4, a_venir:  6, realise: 18 },
  { nom: 'Alice Guy',             manquant: 3, en_retard:  5, a_venir:  7, realise: 22 },
  { nom: 'Les Girondins',         manquant: 3, en_retard:  4, a_venir:  6, realise: 20 },
  { nom: 'André Allix',           manquant: 5, en_retard:  8, a_venir: 11, realise: 38 },
  { nom: 'Philomène Magnin',      manquant: 3, en_retard:  5, a_venir:  7, realise: 22 },
  { nom: "Arches d'Agrippa",      manquant: 2, en_retard:  3, a_venir:  5, realise: 14 },
  { nom: 'Jean Meygret',          manquant: 2, en_retard:  2, a_venir:  4, realise: 10 },
  { nom: 'Confluence',            manquant: 2, en_retard:  3, a_venir:  4, realise: 12 },
  { nom: 'Bugeaud',               manquant: 1, en_retard:  2, a_venir:  3, realise:  8 },
  { nom: 'Aimé Césaire',          manquant: 2, en_retard:  3, a_venir:  4, realise: 12 },
  { nom: 'CROUS Bourg-en-Bresse', manquant: 1, en_retard:  2, a_venir:  3, realise:  8 },
  { nom: 'CROUS Saint-Étienne',   manquant: 2, en_retard:  3, a_venir:  4, realise: 12 },
  { nom: 'CROUS Roanne',          manquant: 1, en_retard:  2, a_venir:  3, realise:  8 },
];

export const BATIMENT_DATA: ResidenceRow[] = Array.from({ length: 8 }, (_, i) => ({
  nom: `Bâtiment ${String.fromCharCode(65 + i)}`,
  manquant: 1 + (i % 3),
  en_retard: 2 + (i % 4),
  a_venir:   3 + (i % 4),
  realise:   8 + (i % 8),
}));

export const ETAGE_DATA: ResidenceRow[] = [
  { nom: 'RDC',        manquant: 2, en_retard: 3, a_venir: 4, realise: 10 },
  { nom: '1er étage',  manquant: 1, en_retard: 2, a_venir: 3, realise: 8  },
  { nom: '2ème étage', manquant: 2, en_retard: 2, a_venir: 3, realise: 9  },
  { nom: '3ème étage', manquant: 1, en_retard: 1, a_venir: 2, realise: 7  },
  { nom: '4ème étage', manquant: 1, en_retard: 1, a_venir: 2, realise: 6  },
];

export const LOGEMENT_DATA: ResidenceRow[] = Array.from({ length: 20 }, (_, i) => ({
  nom: `Logement ${101 + i}`,
  manquant: i % 3 === 0 ? 1 : 0,
  en_retard: i % 4 === 0 ? 1 : 0,
  a_venir:   i % 2 === 0 ? 1 : 0,
  realise:   1 + (i % 3),
}));

export const EQUIPEMENT_DATA: ResidenceRow[] = [
  { nom: 'Ascenseur principal', manquant: 1, en_retard: 2, a_venir: 3, realise: 8 },
  { nom: 'Tableau électrique',  manquant: 2, en_retard: 3, a_venir: 4, realise: 12 },
  { nom: 'Chaudière collective',manquant: 1, en_retard: 1, a_venir: 2, realise: 6  },
  { nom: 'Sprinklers',          manquant: 0, en_retard: 2, a_venir: 3, realise: 9  },
  { nom: 'Ventilation VMC',     manquant: 2, en_retard: 2, a_venir: 3, realise: 7  },
  { nom: 'Désenfumage',         manquant: 1, en_retard: 1, a_venir: 2, realise: 5  },
];

// Assignation data
export const PRESTATAIRE_DATA: ResidenceRow[] = [
  { nom: 'APAVE',    manquant: 25, en_retard: 40, a_venir: 60, realise: 180 },
  { nom: 'SOCOTEC',  manquant: 20, en_retard: 32, a_venir: 50, realise: 150 },
  { nom: 'DEKRA',    manquant: 18, en_retard: 28, a_venir: 45, realise: 130 },
  { nom: 'Bureau Veritas', manquant: 15, en_retard: 22, a_venir: 35, realise: 110 },
  { nom: 'Qualiconsult', manquant: 10, en_retard: 18, a_venir: 28, realise: 90 },
  { nom: 'Autres',   manquant: 22, en_retard: 28, a_venir: 42, realise: 120 },
];

export const SERVICE_DATA: ResidenceRow[] = [
  { nom: 'Patrimoine',        manquant: 35, en_retard: 55, a_venir: 80,  realise: 240 },
  { nom: 'Technique',         manquant: 28, en_retard: 42, a_venir: 65,  realise: 195 },
  { nom: 'Sécurité',          manquant: 20, en_retard: 30, a_venir: 48,  realise: 145 },
  { nom: 'Vie étudiante',     manquant: 12, en_retard: 18, a_venir: 30,  realise: 90  },
  { nom: 'Informatique',      manquant:  5, en_retard:  8, a_venir: 12,  realise: 35  },
  { nom: 'Administration',    manquant: 10, en_retard: 15, a_venir: 25,  realise: 75  },
];

export const EQUIPE_DATA: ResidenceRow[] = [
  { nom: 'Équipe Nord',   manquant: 20, en_retard: 30, a_venir: 45, realise: 135 },
  { nom: 'Équipe Sud',    manquant: 18, en_retard: 28, a_venir: 42, realise: 125 },
  { nom: 'Équipe Est',    manquant: 15, en_retard: 22, a_venir: 35, realise: 105 },
  { nom: 'Équipe Ouest',  manquant: 12, en_retard: 18, a_venir: 28, realise: 90  },
  { nom: 'Équipe Centrale', manquant: 25, en_retard: 38, a_venir: 55, realise: 165 },
  { nom: 'Équipe Externe', manquant: 20, en_retard: 32, a_venir: 55, realise: 160 },
];

export const AGENT_DATA: ResidenceRow[] = [
  { nom: 'Martin D.',     manquant: 8, en_retard: 12, a_venir: 18, realise: 55 },
  { nom: 'Leroy P.',      manquant: 6, en_retard:  9, a_venir: 14, realise: 42 },
  { nom: 'Dupont A.',     manquant: 7, en_retard: 11, a_venir: 16, realise: 50 },
  { nom: 'Bernard C.',    manquant: 5, en_retard:  8, a_venir: 12, realise: 38 },
  { nom: 'Moreau F.',     manquant: 9, en_retard: 13, a_venir: 20, realise: 60 },
  { nom: 'Simon B.',      manquant: 4, en_retard:  6, a_venir:  9, realise: 28 },
  { nom: 'Laurent E.',    manquant: 6, en_retard:  9, a_venir: 14, realise: 43 },
  { nom: 'Michel G.',     manquant: 7, en_retard: 10, a_venir: 15, realise: 46 },
];

export const CATEGORIE_EQUIP_DATA: ResidenceRow[] = [
  { nom: 'Électrique',    manquant: 22, en_retard: 38, a_venir: 55, realise: 165 },
  { nom: 'Mécanique',     manquant: 18, en_retard: 30, a_venir: 45, realise: 135 },
  { nom: 'Hydraulique',   manquant: 12, en_retard: 20, a_venir: 30, realise: 90  },
  { nom: 'Thermique',     manquant: 15, en_retard: 25, a_venir: 38, realise: 115 },
  { nom: 'Structure',     manquant:  8, en_retard: 14, a_venir: 20, realise: 60  },
  { nom: 'Sécurité',      manquant: 20, en_retard: 32, a_venir: 48, realise: 145 },
  { nom: 'Divers',        manquant: 15, en_retard: 24, a_venir: 36, realise: 110 },
];

export const CATEGORIE_SITE_DATA: ResidenceRow[] = [
  { nom: 'Résidence universitaire', manquant: 45, en_retard: 70, a_venir: 105, realise: 315 },
  { nom: 'Cité administrative',     manquant: 20, en_retard: 32, a_venir:  48, realise: 145 },
  { nom: 'Foyer étudiant',          manquant: 15, en_retard: 24, a_venir:  36, realise: 110 },
  { nom: 'Résidence sociale',       manquant: 12, en_retard: 18, a_venir:  28, realise:  85 },
  { nom: 'Équipement culturel',     manquant:  8, en_retard: 12, a_venir:  18, realise:  55 },
  { nom: 'Autres',                  manquant: 10, en_retard: 16, a_venir:  25, realise:  75 },
];

// ─── Time-series ──────────────────────────────────────────────────────────────

export interface TimePoint { label: string; shortLabel: string; [key: string]: number | string; }

export const MONTHLY_CONTROLES: Record<number, TimePoint[]> = {
  2022: [
    { label: 'Jan', shortLabel: 'J', en_retard: 510, manquant: 340, a_venir: 580, realise: 720 },
    { label: 'Fév', shortLabel: 'F', en_retard: 498, manquant: 332, a_venir: 565, realise: 735 },
    { label: 'Mar', shortLabel: 'M', en_retard: 522, manquant: 348, a_venir: 590, realise: 710 },
    { label: 'Avr', shortLabel: 'A', en_retard: 505, manquant: 335, a_venir: 572, realise: 728 },
    { label: 'Mai', shortLabel: 'M', en_retard: 490, manquant: 325, a_venir: 558, realise: 745 },
    { label: 'Jun', shortLabel: 'J', en_retard: 475, manquant: 315, a_venir: 545, realise: 758 },
    { label: 'Jul', shortLabel: 'J', en_retard: 488, manquant: 322, a_venir: 560, realise: 742 },
    { label: 'Aoû', shortLabel: 'A', en_retard: 465, manquant: 308, a_venir: 535, realise: 768 },
    { label: 'Sep', shortLabel: 'S', en_retard: 478, manquant: 318, a_venir: 548, realise: 755 },
    { label: 'Oct', shortLabel: 'O', en_retard: 495, manquant: 328, a_venir: 568, realise: 738 },
    { label: 'Nov', shortLabel: 'N', en_retard: 482, manquant: 320, a_venir: 554, realise: 750 },
    { label: 'Déc', shortLabel: 'D', en_retard: 480, manquant: 310, a_venir: 520, realise: 780 },
  ],
  2023: [
    { label: 'Jan', shortLabel: 'J', en_retard: 465, manquant: 298, a_venir: 512, realise: 800 },
    { label: 'Fév', shortLabel: 'F', en_retard: 452, manquant: 290, a_venir: 498, realise: 818 },
    { label: 'Mar', shortLabel: 'M', en_retard: 470, manquant: 304, a_venir: 520, realise: 795 },
    { label: 'Avr', shortLabel: 'A', en_retard: 458, manquant: 295, a_venir: 505, realise: 812 },
    { label: 'Mai', shortLabel: 'M', en_retard: 444, manquant: 285, a_venir: 490, realise: 828 },
    { label: 'Jun', shortLabel: 'J', en_retard: 430, manquant: 276, a_venir: 478, realise: 842 },
    { label: 'Jul', shortLabel: 'J', en_retard: 442, manquant: 283, a_venir: 488, realise: 830 },
    { label: 'Aoû', shortLabel: 'A', en_retard: 420, manquant: 268, a_venir: 465, realise: 855 },
    { label: 'Sep', shortLabel: 'S', en_retard: 435, manquant: 278, a_venir: 480, realise: 840 },
    { label: 'Oct', shortLabel: 'O', en_retard: 448, manquant: 287, a_venir: 495, realise: 825 },
    { label: 'Nov', shortLabel: 'N', en_retard: 437, manquant: 280, a_venir: 483, realise: 836 },
    { label: 'Déc', shortLabel: 'D', en_retard: 430, manquant: 275, a_venir: 480, realise: 880 },
  ],
  2024: [
    { label: 'Jan', shortLabel: 'J', en_retard: 415, manquant: 262, a_venir: 458, realise: 900 },
    { label: 'Fév', shortLabel: 'F', en_retard: 402, manquant: 254, a_venir: 444, realise: 918 },
    { label: 'Mar', shortLabel: 'M', en_retard: 420, manquant: 268, a_venir: 470, realise: 895 },
    { label: 'Avr', shortLabel: 'A', en_retard: 408, manquant: 258, a_venir: 455, realise: 912 },
    { label: 'Mai', shortLabel: 'M', en_retard: 394, manquant: 248, a_venir: 440, realise: 928 },
    { label: 'Jun', shortLabel: 'J', en_retard: 380, manquant: 238, a_venir: 428, realise: 942 },
    { label: 'Jul', shortLabel: 'J', en_retard: 393, manquant: 246, a_venir: 440, realise: 930 },
    { label: 'Aoû', shortLabel: 'A', en_retard: 368, manquant: 230, a_venir: 415, realise: 955 },
    { label: 'Sep', shortLabel: 'S', en_retard: 382, manquant: 240, a_venir: 430, realise: 940 },
    { label: 'Oct', shortLabel: 'O', en_retard: 396, manquant: 250, a_venir: 445, realise: 926 },
    { label: 'Nov', shortLabel: 'N', en_retard: 384, manquant: 242, a_venir: 432, realise: 938 },
    { label: 'Déc', shortLabel: 'D', en_retard: 375, manquant: 248, a_venir: 435, realise: 960 },
  ],
  2025: [
    { label: 'Jan', shortLabel: 'J', en_retard: 362, manquant: 235, a_venir: 420, realise: 975 },
    { label: 'Fév', shortLabel: 'F', en_retard: 350, manquant: 228, a_venir: 408, realise: 990 },
    { label: 'Mar', shortLabel: 'M', en_retard: 368, manquant: 240, a_venir: 430, realise: 968 },
    { label: 'Avr', shortLabel: 'A', en_retard: 355, manquant: 231, a_venir: 415, realise: 984 },
    { label: 'Mai', shortLabel: 'M', en_retard: 341, manquant: 222, a_venir: 400, realise: 998 },
    { label: 'Jun', shortLabel: 'J', en_retard: 352, manquant: 231, a_venir: 410, realise: 980 },
    { label: 'Jul', shortLabel: 'J', en_retard: 338, manquant: 224, a_venir: 402, realise: 1005 },
    { label: 'Aoû', shortLabel: 'A', en_retard: 319, manquant: 218, a_venir: 388, realise: 1020 },
    { label: 'Sep', shortLabel: 'S', en_retard: 341, manquant: 212, a_venir: 375, realise: 1038 },
    { label: 'Oct', shortLabel: 'O', en_retard: 360, manquant: 222, a_venir: 398, realise: 990 },
    { label: 'Nov', shortLabel: 'N', en_retard: 347, manquant: 215, a_venir: 390, realise: 1010 },
    { label: 'Déc', shortLabel: 'D', en_retard: 325, manquant: 208, a_venir: 372, realise: 1042 },
  ],
  2026: [
    { label: 'Jan', shortLabel: 'J', en_retard: 308, manquant: 205, a_venir: 365, realise: 1050 },
    { label: 'Fév', shortLabel: 'F', en_retard: 315, manquant: 210, a_venir: 374, realise: 1035 },
    { label: 'Mar', shortLabel: 'M', en_retard: 298, manquant: 204, a_venir: 385, realise: 1048 },
    { label: 'Avr', shortLabel: 'A', en_retard: 291, manquant: 201, a_venir: 379, realise: 1052 },
    { label: 'Mai', shortLabel: 'M', en_retard: 290, manquant: 200, a_venir: 380, realise: 1050 },
    { label: 'Jun', shortLabel: 'J', en_retard: 284, manquant: 197, a_venir: 372, realise: 1058 },
    { label: 'Jul', shortLabel: 'J', en_retard: 278, manquant: 194, a_venir: 368, realise: 1062 },
    { label: 'Aoû', shortLabel: 'A', en_retard: 270, manquant: 190, a_venir: 360, realise: 1070 },
    { label: 'Sep', shortLabel: 'S', en_retard: 282, manquant: 196, a_venir: 370, realise: 1060 },
    { label: 'Oct', shortLabel: 'O', en_retard: 288, manquant: 199, a_venir: 376, realise: 1054 },
    { label: 'Nov', shortLabel: 'N', en_retard: 275, manquant: 193, a_venir: 365, realise: 1065 },
    { label: 'Déc', shortLabel: 'D', en_retard: 268, manquant: 188, a_venir: 358, realise: 1072 },
  ],
};

export const YEARLY_CONTROLES: TimePoint[] = [
  { label: '2022', shortLabel: '2022', en_retard: 480, manquant: 310, a_venir: 520, realise: 780  },
  { label: '2023', shortLabel: '2023', en_retard: 430, manquant: 275, a_venir: 480, realise: 880  },
  { label: '2024', shortLabel: '2024', en_retard: 375, manquant: 248, a_venir: 435, realise: 960  },
  { label: '2025', shortLabel: '2025', en_retard: 332, manquant: 220, a_venir: 400, realise: 1020 },
  { label: '2026', shortLabel: '2026', en_retard: 290, manquant: 200, a_venir: 380, realise: 1050 },
];

export const MONTHLY_POINTS: Record<number, TimePoint[]> = {
  2022: [
    { label: 'Jan', shortLabel: 'J', non_conforme: 310, conforme: 1820 },
    { label: 'Fév', shortLabel: 'F', non_conforme: 298, conforme: 1835 },
    { label: 'Mar', shortLabel: 'M', non_conforme: 322, conforme: 1810 },
    { label: 'Avr', shortLabel: 'A', non_conforme: 305, conforme: 1826 },
    { label: 'Mai', shortLabel: 'M', non_conforme: 290, conforme: 1842 },
    { label: 'Jun', shortLabel: 'J', non_conforme: 275, conforme: 1858 },
    { label: 'Jul', shortLabel: 'J', non_conforme: 288, conforme: 1844 },
    { label: 'Aoû', shortLabel: 'A', non_conforme: 265, conforme: 1868 },
    { label: 'Sep', shortLabel: 'S', non_conforme: 278, conforme: 1855 },
    { label: 'Oct', shortLabel: 'O', non_conforme: 295, conforme: 1838 },
    { label: 'Nov', shortLabel: 'N', non_conforme: 282, conforme: 1850 },
    { label: 'Déc', shortLabel: 'D', non_conforme: 280, conforme: 1862 },
  ],
  2023: [
    { label: 'Jan', shortLabel: 'J', non_conforme: 265, conforme: 1905 },
    { label: 'Fév', shortLabel: 'F', non_conforme: 252, conforme: 1920 },
    { label: 'Mar', shortLabel: 'M', non_conforme: 270, conforme: 1902 },
    { label: 'Avr', shortLabel: 'A', non_conforme: 258, conforme: 1915 },
    { label: 'Mai', shortLabel: 'M', non_conforme: 244, conforme: 1930 },
    { label: 'Jun', shortLabel: 'J', non_conforme: 230, conforme: 1945 },
    { label: 'Jul', shortLabel: 'J', non_conforme: 242, conforme: 1932 },
    { label: 'Aoû', shortLabel: 'A', non_conforme: 220, conforme: 1955 },
    { label: 'Sep', shortLabel: 'S', non_conforme: 235, conforme: 1940 },
    { label: 'Oct', shortLabel: 'O', non_conforme: 248, conforme: 1928 },
    { label: 'Nov', shortLabel: 'N', non_conforme: 237, conforme: 1938 },
    { label: 'Déc', shortLabel: 'D', non_conforme: 230, conforme: 1960 },
  ],
  2024: [
    { label: 'Jan', shortLabel: 'J', non_conforme: 215, conforme: 1988 },
    { label: 'Fév', shortLabel: 'F', non_conforme: 202, conforme: 2001 },
    { label: 'Mar', shortLabel: 'M', non_conforme: 220, conforme: 1985 },
    { label: 'Avr', shortLabel: 'A', non_conforme: 208, conforme: 1998 },
    { label: 'Mai', shortLabel: 'M', non_conforme: 194, conforme: 2012 },
    { label: 'Jun', shortLabel: 'J', non_conforme: 180, conforme: 2026 },
    { label: 'Jul', shortLabel: 'J', non_conforme: 193, conforme: 2014 },
    { label: 'Aoû', shortLabel: 'A', non_conforme: 168, conforme: 2038 },
    { label: 'Sep', shortLabel: 'S', non_conforme: 182, conforme: 2024 },
    { label: 'Oct', shortLabel: 'O', non_conforme: 196, conforme: 2010 },
    { label: 'Nov', shortLabel: 'N', non_conforme: 184, conforme: 2022 },
    { label: 'Déc', shortLabel: 'D', non_conforme: 175, conforme: 2042 },
  ],
  2025: [
    { label: 'Jan', shortLabel: 'J', non_conforme: 162, conforme: 2058 },
    { label: 'Fév', shortLabel: 'F', non_conforme: 150, conforme: 2072 },
    { label: 'Mar', shortLabel: 'M', non_conforme: 168, conforme: 2055 },
    { label: 'Avr', shortLabel: 'A', non_conforme: 155, conforme: 2068 },
    { label: 'Mai', shortLabel: 'M', non_conforme: 141, conforme: 2082 },
    { label: 'Jun', shortLabel: 'J', non_conforme: 152, conforme: 2072 },
    { label: 'Jul', shortLabel: 'J', non_conforme: 138, conforme: 2085 },
    { label: 'Aoû', shortLabel: 'A', non_conforme: 119, conforme: 2104 },
    { label: 'Sep', shortLabel: 'S', non_conforme: 141, conforme: 2082 },
    { label: 'Oct', shortLabel: 'O', non_conforme: 160, conforme: 2063 },
    { label: 'Nov', shortLabel: 'N', non_conforme: 147, conforme: 2075 },
    { label: 'Déc', shortLabel: 'D', non_conforme: 125, conforme: 2098 },
  ],
  2026: [
    { label: 'Jan', shortLabel: 'J', non_conforme: 112, conforme: 2112 },
    { label: 'Fév', shortLabel: 'F', non_conforme: 119, conforme: 2106 },
    { label: 'Mar', shortLabel: 'M', non_conforme: 98,  conforme: 2126 },
    { label: 'Avr', shortLabel: 'A', non_conforme: 91,  conforme: 2134 },
    { label: 'Mai', shortLabel: 'M', non_conforme: 90,  conforme: 2135 },
    { label: 'Jun', shortLabel: 'J', non_conforme: 84,  conforme: 2142 },
    { label: 'Jul', shortLabel: 'J', non_conforme: 78,  conforme: 2148 },
    { label: 'Aoû', shortLabel: 'A', non_conforme: 70,  conforme: 2155 },
    { label: 'Sep', shortLabel: 'S', non_conforme: 82,  conforme: 2144 },
    { label: 'Oct', shortLabel: 'O', non_conforme: 88,  conforme: 2138 },
    { label: 'Nov', shortLabel: 'N', non_conforme: 75,  conforme: 2150 },
    { label: 'Déc', shortLabel: 'D', non_conforme: 68,  conforme: 2158 },
  ],
};

export const YEARLY_POINTS: TimePoint[] = [
  { label: '2022', shortLabel: '2022', non_conforme: 280, conforme: 1862 },
  { label: '2023', shortLabel: '2023', non_conforme: 230, conforme: 1960 },
  { label: '2024', shortLabel: '2024', non_conforme: 175, conforme: 2042 },
  { label: '2025', shortLabel: '2025', non_conforme: 125, conforme: 2098 },
  { label: '2026', shortLabel: '2026', non_conforme: 90,  conforme: 2135 },
];

export const MONTHLY_ACTIONS: Record<number, TimePoint[]> = {
  2022: [
    { label: 'Jan', shortLabel: 'J', en_attente: 185, en_retard: 92, planifiees: 145, terminees: 210 },
    { label: 'Fév', shortLabel: 'F', en_attente: 178, en_retard: 88, planifiees: 140, terminees: 222 },
    { label: 'Mar', shortLabel: 'M', en_attente: 192, en_retard: 95, planifiees: 150, terminees: 205 },
    { label: 'Avr', shortLabel: 'A', en_attente: 180, en_retard: 90, planifiees: 143, terminees: 218 },
    { label: 'Mai', shortLabel: 'M', en_attente: 172, en_retard: 85, planifiees: 138, terminees: 228 },
    { label: 'Jun', shortLabel: 'J', en_attente: 165, en_retard: 82, planifiees: 132, terminees: 238 },
    { label: 'Jul', shortLabel: 'J', en_attente: 170, en_retard: 86, planifiees: 135, terminees: 232 },
    { label: 'Aoû', shortLabel: 'A', en_attente: 158, en_retard: 80, planifiees: 128, terminees: 245 },
    { label: 'Sep', shortLabel: 'S', en_attente: 165, en_retard: 83, planifiees: 133, terminees: 240 },
    { label: 'Oct', shortLabel: 'O', en_attente: 175, en_retard: 88, planifiees: 140, terminees: 228 },
    { label: 'Nov', shortLabel: 'N', en_attente: 168, en_retard: 84, planifiees: 135, terminees: 235 },
    { label: 'Déc', shortLabel: 'D', en_attente: 162, en_retard: 82, planifiees: 130, terminees: 242 },
  ],
  2023: [
    { label: 'Jan', shortLabel: 'J', en_attente: 158, en_retard: 79, planifiees: 126, terminees: 255 },
    { label: 'Fév', shortLabel: 'F', en_attente: 151, en_retard: 75, planifiees: 122, terminees: 268 },
    { label: 'Mar', shortLabel: 'M', en_attente: 162, en_retard: 81, planifiees: 130, terminees: 252 },
    { label: 'Avr', shortLabel: 'A', en_attente: 153, en_retard: 77, planifiees: 124, terminees: 262 },
    { label: 'Mai', shortLabel: 'M', en_attente: 145, en_retard: 73, planifiees: 118, terminees: 272 },
    { label: 'Jun', shortLabel: 'J', en_attente: 138, en_retard: 70, planifiees: 113, terminees: 282 },
    { label: 'Jul', shortLabel: 'J', en_attente: 143, en_retard: 72, planifiees: 116, terminees: 276 },
    { label: 'Aoû', shortLabel: 'A', en_attente: 132, en_retard: 67, planifiees: 108, terminees: 290 },
    { label: 'Sep', shortLabel: 'S', en_attente: 140, en_retard: 71, planifiees: 114, terminees: 284 },
    { label: 'Oct', shortLabel: 'O', en_attente: 148, en_retard: 74, planifiees: 120, terminees: 274 },
    { label: 'Nov', shortLabel: 'N', en_attente: 142, en_retard: 72, planifiees: 115, terminees: 280 },
    { label: 'Déc', shortLabel: 'D', en_attente: 136, en_retard: 69, planifiees: 110, terminees: 288 },
  ],
  2024: [
    { label: 'Jan', shortLabel: 'J', en_attente: 132, en_retard: 66, planifiees: 107, terminees: 298 },
    { label: 'Fév', shortLabel: 'F', en_attente: 125, en_retard: 63, planifiees: 103, terminees: 310 },
    { label: 'Mar', shortLabel: 'M', en_attente: 135, en_retard: 68, planifiees: 109, terminees: 295 },
    { label: 'Avr', shortLabel: 'A', en_attente: 128, en_retard: 64, planifiees: 105, terminees: 305 },
    { label: 'Mai', shortLabel: 'M', en_attente: 120, en_retard: 60, planifiees: 98,  terminees: 315 },
    { label: 'Jun', shortLabel: 'J', en_attente: 114, en_retard: 57, planifiees: 94,  terminees: 325 },
    { label: 'Jul', shortLabel: 'J', en_attente: 118, en_retard: 59, planifiees: 96,  terminees: 320 },
    { label: 'Aoû', shortLabel: 'A', en_attente: 108, en_retard: 54, planifiees: 88,  terminees: 335 },
    { label: 'Sep', shortLabel: 'S', en_attente: 115, en_retard: 58, planifiees: 93,  terminees: 328 },
    { label: 'Oct', shortLabel: 'O', en_attente: 122, en_retard: 61, planifiees: 99,  terminees: 318 },
    { label: 'Nov', shortLabel: 'N', en_attente: 116, en_retard: 58, planifiees: 94,  terminees: 326 },
    { label: 'Déc', shortLabel: 'D', en_attente: 110, en_retard: 55, planifiees: 89,  terminees: 338 },
  ],
  2025: [
    { label: 'Jan', shortLabel: 'J', en_attente: 106, en_retard: 53, planifiees: 86,  terminees: 345 },
    { label: 'Fév', shortLabel: 'F', en_attente: 100, en_retard: 50, planifiees: 82,  terminees: 356 },
    { label: 'Mar', shortLabel: 'M', en_attente: 108, en_retard: 54, planifiees: 87,  terminees: 342 },
    { label: 'Avr', shortLabel: 'A', en_attente: 102, en_retard: 51, planifiees: 83,  terminees: 352 },
    { label: 'Mai', shortLabel: 'M', en_attente: 96,  en_retard: 48, planifiees: 78,  terminees: 362 },
    { label: 'Jun', shortLabel: 'J', en_attente: 101, en_retard: 51, planifiees: 82,  terminees: 356 },
    { label: 'Jul', shortLabel: 'J', en_attente: 95,  en_retard: 48, planifiees: 77,  terminees: 366 },
    { label: 'Aoû', shortLabel: 'A', en_attente: 88,  en_retard: 44, planifiees: 72,  terminees: 378 },
    { label: 'Sep', shortLabel: 'S', en_attente: 95,  en_retard: 48, planifiees: 77,  terminees: 368 },
    { label: 'Oct', shortLabel: 'O', en_attente: 100, en_retard: 50, planifiees: 81,  terminees: 360 },
    { label: 'Nov', shortLabel: 'N', en_attente: 94,  en_retard: 47, planifiees: 76,  terminees: 370 },
    { label: 'Déc', shortLabel: 'D', en_attente: 88,  en_retard: 44, planifiees: 71,  terminees: 382 },
  ],
  2026: [
    { label: 'Jan', shortLabel: 'J', en_attente: 85,  en_retard: 43, planifiees: 69,  terminees: 390 },
    { label: 'Fév', shortLabel: 'F', en_attente: 88,  en_retard: 45, planifiees: 72,  terminees: 386 },
    { label: 'Mar', shortLabel: 'M', en_attente: 80,  en_retard: 40, planifiees: 65,  terminees: 398 },
    { label: 'Avr', shortLabel: 'A', en_attente: 76,  en_retard: 38, planifiees: 62,  terminees: 404 },
    { label: 'Mai', shortLabel: 'M', en_attente: 75,  en_retard: 38, planifiees: 61,  terminees: 406 },
    { label: 'Jun', shortLabel: 'J', en_attente: 72,  en_retard: 36, planifiees: 58,  terminees: 412 },
    { label: 'Jul', shortLabel: 'J', en_attente: 68,  en_retard: 34, planifiees: 55,  terminees: 418 },
    { label: 'Aoû', shortLabel: 'A', en_attente: 64,  en_retard: 32, planifiees: 52,  terminees: 426 },
    { label: 'Sep', shortLabel: 'S', en_attente: 70,  en_retard: 35, planifiees: 57,  terminees: 420 },
    { label: 'Oct', shortLabel: 'O', en_attente: 73,  en_retard: 37, planifiees: 59,  terminees: 416 },
    { label: 'Nov', shortLabel: 'N', en_attente: 67,  en_retard: 34, planifiees: 54,  terminees: 422 },
    { label: 'Déc', shortLabel: 'D', en_attente: 62,  en_retard: 31, planifiees: 50,  terminees: 430 },
  ],
};

export const YEARLY_ACTIONS: TimePoint[] = [
  { label: '2022', shortLabel: '2022', en_attente: 162, en_retard: 82, planifiees: 130, terminees: 242 },
  { label: '2023', shortLabel: '2023', en_attente: 136, en_retard: 69, planifiees: 110, terminees: 288 },
  { label: '2024', shortLabel: '2024', en_attente: 110, en_retard: 55, planifiees: 89,  terminees: 338 },
  { label: '2025', shortLabel: '2025', en_attente: 88,  en_retard: 44, planifiees: 71,  terminees: 382 },
  { label: '2026', shortLabel: '2026', en_attente: 75,  en_retard: 38, planifiees: 61,  terminees: 406 },
];

export const MONTHLY_ANCIENNETE: Record<number, TimePoint[]> = {
  2022: [
    { label: 'Jan', shortLabel: 'J', anciennete: 183 }, { label: 'Fév', shortLabel: 'F', anciennete: 178 },
    { label: 'Mar', shortLabel: 'M', anciennete: 181 }, { label: 'Avr', shortLabel: 'A', anciennete: 175 },
    { label: 'Mai', shortLabel: 'M', anciennete: 172 }, { label: 'Jun', shortLabel: 'J', anciennete: 169 },
    { label: 'Jul', shortLabel: 'J', anciennete: 174 }, { label: 'Aoû', shortLabel: 'A', anciennete: 171 },
    { label: 'Sep', shortLabel: 'S', anciennete: 165 }, { label: 'Oct', shortLabel: 'O', anciennete: 163 },
    { label: 'Nov', shortLabel: 'N', anciennete: 159 }, { label: 'Déc', shortLabel: 'D', anciennete: 156 },
  ],
  2023: [
    { label: 'Jan', shortLabel: 'J', anciennete: 153 }, { label: 'Fév', shortLabel: 'F', anciennete: 149 },
    { label: 'Mar', shortLabel: 'M', anciennete: 147 }, { label: 'Avr', shortLabel: 'A', anciennete: 144 },
    { label: 'Mai', shortLabel: 'M', anciennete: 141 }, { label: 'Jun', shortLabel: 'J', anciennete: 138 },
    { label: 'Jul', shortLabel: 'J', anciennete: 143 }, { label: 'Aoû', shortLabel: 'A', anciennete: 140 },
    { label: 'Sep', shortLabel: 'S', anciennete: 135 }, { label: 'Oct', shortLabel: 'O', anciennete: 131 },
    { label: 'Nov', shortLabel: 'N', anciennete: 128 }, { label: 'Déc', shortLabel: 'D', anciennete: 124 },
  ],
  2024: [
    { label: 'Jan', shortLabel: 'J', anciennete: 121 }, { label: 'Fév', shortLabel: 'F', anciennete: 118 },
    { label: 'Mar', shortLabel: 'M', anciennete: 115 }, { label: 'Avr', shortLabel: 'A', anciennete: 112 },
    { label: 'Mai', shortLabel: 'M', anciennete: 109 }, { label: 'Jun', shortLabel: 'J', anciennete: 107 },
    { label: 'Jul', shortLabel: 'J', anciennete: 111 }, { label: 'Aoû', shortLabel: 'A', anciennete: 108 },
    { label: 'Sep', shortLabel: 'S', anciennete: 103 }, { label: 'Oct', shortLabel: 'O', anciennete: 99  },
    { label: 'Nov', shortLabel: 'N', anciennete: 96  }, { label: 'Déc', shortLabel: 'D', anciennete: 93  },
  ],
  2025: [
    { label: 'Jan', shortLabel: 'J', anciennete: 90 }, { label: 'Fév', shortLabel: 'F', anciennete: 87 },
    { label: 'Mar', shortLabel: 'M', anciennete: 84 }, { label: 'Avr', shortLabel: 'A', anciennete: 82 },
    { label: 'Mai', shortLabel: 'M', anciennete: 79 }, { label: 'Jun', shortLabel: 'J', anciennete: 77 },
    { label: 'Jul', shortLabel: 'J', anciennete: 80 }, { label: 'Aoû', shortLabel: 'A', anciennete: 78 },
    { label: 'Sep', shortLabel: 'S', anciennete: 74 }, { label: 'Oct', shortLabel: 'O', anciennete: 71 },
    { label: 'Nov', shortLabel: 'N', anciennete: 68 }, { label: 'Déc', shortLabel: 'D', anciennete: 65 },
  ],
  2026: [
    { label: 'Jan', shortLabel: 'J', anciennete: 62 }, { label: 'Fév', shortLabel: 'F', anciennete: 59 },
    { label: 'Mar', shortLabel: 'M', anciennete: 57 }, { label: 'Avr', shortLabel: 'A', anciennete: 55 },
    { label: 'Mai', shortLabel: 'M', anciennete: 52 }, { label: 'Jun', shortLabel: 'J', anciennete: 50 },
    { label: 'Jul', shortLabel: 'J', anciennete: 53 }, { label: 'Aoû', shortLabel: 'A', anciennete: 51 },
    { label: 'Sep', shortLabel: 'S', anciennete: 48 }, { label: 'Oct', shortLabel: 'O', anciennete: 47 },
    { label: 'Nov', shortLabel: 'N', anciennete: 46 }, { label: 'Déc', shortLabel: 'D', anciennete: 45 },
  ],
};

export const YEARLY_ANCIENNETE: TimePoint[] = [
  { label: '2022', shortLabel: '2022', anciennete: 170 },
  { label: '2023', shortLabel: '2023', anciennete: 139 },
  { label: '2024', shortLabel: '2024', anciennete: 108 },
  { label: '2025', shortLabel: '2025', anciennete: 78  },
  { label: '2026', shortLabel: '2026', anciennete: 52  },
];

export const MONTHLY_TEMPS_RESOLUTION: Record<number, TimePoint[]> = {
  2022: [
    { label: 'Jan', shortLabel: 'J', critique: 46, majeure: 26, mineure: 10 },
    { label: 'Fév', shortLabel: 'F', critique: 44, majeure: 25, mineure: 10 },
    { label: 'Mar', shortLabel: 'M', critique: 45, majeure: 26, mineure: 11 },
    { label: 'Avr', shortLabel: 'A', critique: 43, majeure: 24, mineure: 10 },
    { label: 'Mai', shortLabel: 'M', critique: 44, majeure: 25, mineure: 10 },
    { label: 'Jun', shortLabel: 'J', critique: 42, majeure: 24, mineure:  9 },
    { label: 'Jul', shortLabel: 'J', critique: 45, majeure: 25, mineure: 10 },
    { label: 'Aoû', shortLabel: 'A', critique: 43, majeure: 24, mineure: 10 },
    { label: 'Sep', shortLabel: 'S', critique: 41, majeure: 23, mineure:  9 },
    { label: 'Oct', shortLabel: 'O', critique: 42, majeure: 24, mineure:  9 },
    { label: 'Nov', shortLabel: 'N', critique: 40, majeure: 23, mineure:  9 },
    { label: 'Déc', shortLabel: 'D', critique: 39, majeure: 22, mineure:  9 },
  ],
  2023: [
    { label: 'Jan', shortLabel: 'J', critique: 38, majeure: 22, mineure: 9 },
    { label: 'Fév', shortLabel: 'F', critique: 37, majeure: 21, mineure: 8 },
    { label: 'Mar', shortLabel: 'M', critique: 36, majeure: 21, mineure: 8 },
    { label: 'Avr', shortLabel: 'A', critique: 35, majeure: 20, mineure: 8 },
    { label: 'Mai', shortLabel: 'M', critique: 36, majeure: 21, mineure: 8 },
    { label: 'Jun', shortLabel: 'J', critique: 34, majeure: 20, mineure: 8 },
    { label: 'Jul', shortLabel: 'J', critique: 36, majeure: 21, mineure: 8 },
    { label: 'Aoû', shortLabel: 'A', critique: 35, majeure: 20, mineure: 8 },
    { label: 'Sep', shortLabel: 'S', critique: 33, majeure: 19, mineure: 7 },
    { label: 'Oct', shortLabel: 'O', critique: 32, majeure: 19, mineure: 7 },
    { label: 'Nov', shortLabel: 'N', critique: 31, majeure: 18, mineure: 7 },
    { label: 'Déc', shortLabel: 'D', critique: 30, majeure: 18, mineure: 7 },
  ],
  2024: [
    { label: 'Jan', shortLabel: 'J', critique: 30, majeure: 18, mineure: 7 },
    { label: 'Fév', shortLabel: 'F', critique: 29, majeure: 17, mineure: 7 },
    { label: 'Mar', shortLabel: 'M', critique: 28, majeure: 17, mineure: 7 },
    { label: 'Avr', shortLabel: 'A', critique: 28, majeure: 16, mineure: 6 },
    { label: 'Mai', shortLabel: 'M', critique: 27, majeure: 16, mineure: 6 },
    { label: 'Jun', shortLabel: 'J', critique: 26, majeure: 16, mineure: 6 },
    { label: 'Jul', shortLabel: 'J', critique: 28, majeure: 17, mineure: 7 },
    { label: 'Aoû', shortLabel: 'A', critique: 27, majeure: 16, mineure: 6 },
    { label: 'Sep', shortLabel: 'S', critique: 25, majeure: 15, mineure: 6 },
    { label: 'Oct', shortLabel: 'O', critique: 25, majeure: 15, mineure: 6 },
    { label: 'Nov', shortLabel: 'N', critique: 24, majeure: 14, mineure: 6 },
    { label: 'Déc', shortLabel: 'D', critique: 23, majeure: 14, mineure: 6 },
  ],
  2025: [
    { label: 'Jan', shortLabel: 'J', critique: 23, majeure: 14, mineure: 6 },
    { label: 'Fév', shortLabel: 'F', critique: 22, majeure: 13, mineure: 6 },
    { label: 'Mar', shortLabel: 'M', critique: 22, majeure: 13, mineure: 6 },
    { label: 'Avr', shortLabel: 'A', critique: 21, majeure: 13, mineure: 5 },
    { label: 'Mai', shortLabel: 'M', critique: 21, majeure: 13, mineure: 5 },
    { label: 'Jun', shortLabel: 'J', critique: 22, majeure: 13, mineure: 5 },
    { label: 'Jul', shortLabel: 'J', critique: 23, majeure: 14, mineure: 6 },
    { label: 'Aoû', shortLabel: 'A', critique: 22, majeure: 13, mineure: 5 },
    { label: 'Sep', shortLabel: 'S', critique: 21, majeure: 13, mineure: 5 },
    { label: 'Oct', shortLabel: 'O', critique: 21, majeure: 12, mineure: 5 },
    { label: 'Nov', shortLabel: 'N', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Déc', shortLabel: 'D', critique: 20, majeure: 12, mineure: 5 },
  ],
  2026: [
    { label: 'Jan', shortLabel: 'J', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Fév', shortLabel: 'F', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Mar', shortLabel: 'M', critique: 21, majeure: 13, mineure: 5 },
    { label: 'Avr', shortLabel: 'A', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Mai', shortLabel: 'M', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Jun', shortLabel: 'J', critique: 21, majeure: 12, mineure: 5 },
    { label: 'Jul', shortLabel: 'J', critique: 21, majeure: 13, mineure: 6 },
    { label: 'Aoû', shortLabel: 'A', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Sep', shortLabel: 'S', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Oct', shortLabel: 'O', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Nov', shortLabel: 'N', critique: 20, majeure: 12, mineure: 5 },
    { label: 'Déc', shortLabel: 'D', critique: 20, majeure: 12, mineure: 5 },
  ],
};

export const YEARLY_TEMPS_RESOLUTION: TimePoint[] = [
  { label: '2022', shortLabel: '2022', critique: 43, majeure: 24, mineure: 10 },
  { label: '2023', shortLabel: '2023', critique: 34, majeure: 20, mineure:  8 },
  { label: '2024', shortLabel: '2024', critique: 27, majeure: 16, mineure:  6 },
  { label: '2025', shortLabel: '2025', critique: 21, majeure: 13, mineure:  5 },
  { label: '2026', shortLabel: '2026', critique: 20, majeure: 12, mineure:  5 },
];

// ─── Color palettes ───────────────────────────────────────────────────────────

export const COLORS_TYPE = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#f97316','#6366f1','#84cc16','#ec4899',
  '#14b8a6','#a855f7','#eab308','#0ea5e9','#22c55e','#e11d48',
];

export const COLORS_RESIDENCES = [
  '#3b82f6','#10b981','#f59e0b','#8b5cf6','#06b6d4',
  '#f97316','#6366f1','#ec4899','#14b8a6','#0ea5e9','#94a3b8',
];
