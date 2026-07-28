import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Droplets, Zap, Flame, Settings2, X, GripVertical, ChevronUp, ChevronDown,
  ArrowUpDown, Tag, AlertTriangle, CheckCircle2, HelpCircle, Camera, Paperclip,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TypeFluide  = 'eau' | 'electricite' | 'gaz';
export type StatutReleve = 'valide' | 'a_verifier' | 'anomalie';

export interface Releve {
  id: string;
  type_fluide: TypeFluide;
  compteur_ref: string;
  periode_label: string;        // e.g. "Mai 2026"
  date_releve: string;          // ISO date
  index_debut: number;
  index_fin: number;
  unite: string;                // "kWh" | "m³"
  cout_estime?: number | null;
  anomalie: boolean;
  anomalie_desc?: string | null;
  statut: StatutReleve;
  has_photo: boolean;
  has_pj: boolean;
}

// ─── Mock data builders ───────────────────────────────────────────────────────

// Données réalistes pour un logement étudiant de 10 m² — 12 mois
// Index initiaux : élec 1000 kWh, gaz 500 kWh, eau 10 m³
export function buildMockRelevesSite(): Releve[] {
  return [
    // Électricité — 12 mois (tarif ~0,22 €/kWh)
    // Statuts :
    //   e2→e1 : 170→180 kWh, +5.9% → valide
    //   e3→e2 : 160→170 kWh, -5.9% → valide
    //   e4→e3 : 130→160 kWh, -18.8% → valide (baisse saisonnière normale)
    //   e5→e4 : 120→130 kWh, -7.7% → valide
    //   e6→e5 : 110→120 kWh, -8.3% → valide
    //   e7→e6 : 100→110 kWh, -9.1% → valide
    //   e8→e7 : 100→100 kWh,  0.0% → à_verifier (écart ≤5%)
    //   e9→e8 : 120→100 kWh, +20.0% → anomalie (pic brutal retour occupant)
    //   e10→e9 : 140→120 kWh, +16.7% → valide (remontée saisonnière)
    //   e11→e10 : 160→140 kWh, +14.3% → valide
    //   e12→e11 : 180→160 kWh, +12.5% → valide
    { id: 'e1',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Janvier 2025',  date_releve: '2025-01-31', index_debut: 1000, index_fin: 1180, unite: 'kWh', cout_estime: 39.60, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: true  },
    { id: 'e2',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Février 2025', date_releve: '2025-02-28', index_debut: 1180, index_fin: 1350, unite: 'kWh', cout_estime: 37.40, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'e3',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Mars 2025',    date_releve: '2025-03-31', index_debut: 1350, index_fin: 1510, unite: 'kWh', cout_estime: 35.20, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'e4',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Avril 2025',   date_releve: '2025-04-30', index_debut: 1510, index_fin: 1640, unite: 'kWh', cout_estime: 28.60, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: true  },
    { id: 'e5',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Mai 2025',     date_releve: '2025-05-31', index_debut: 1640, index_fin: 1760, unite: 'kWh', cout_estime: 26.40, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'e6',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Juin 2025',    date_releve: '2025-06-30', index_debut: 1760, index_fin: 1870, unite: 'kWh', cout_estime: 24.20, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'e7',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Juillet 2025', date_releve: '2025-07-31', index_debut: 1870, index_fin: 1970, unite: 'kWh', cout_estime: 22.00, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'e8',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Août 2025',    date_releve: '2025-08-31', index_debut: 1970, index_fin: 2070, unite: 'kWh', cout_estime: 22.00, anomalie: false,  anomalie_desc: 'Consommation identique au mois précédent (écart 0%) — absence prolongée de l\'occupant possible, relevé à confirmer', statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'e9',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Sept. 2025',   date_releve: '2025-09-30', index_debut: 2070, index_fin: 2190, unite: 'kWh', cout_estime: 26.40, anomalie: true,   anomalie_desc: 'Hausse brutale +20% vs août — retour occupant après vacances, appareils en veille prolongée ou chauffe-eau défaillant',  statut: 'anomalie',   has_photo: true,  has_pj: false },
    { id: 'e10', type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Octobre 2025', date_releve: '2025-10-31', index_debut: 2190, index_fin: 2330, unite: 'kWh', cout_estime: 30.80, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: true  },
    { id: 'e11', type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Nov. 2025',    date_releve: '2025-11-30', index_debut: 2330, index_fin: 2490, unite: 'kWh', cout_estime: 35.20, anomalie: false,                                                                                                 statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'e12', type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-LOG-108', periode_label: 'Déc. 2025',    date_releve: '2025-12-31', index_debut: 2490, index_fin: 2670, unite: 'kWh', cout_estime: 39.60, anomalie: false,                                                                                                 statut: 'valide',     has_photo: true,  has_pj: true  },
    // Eau froide — 12 mois (tarif ~4,00 €/m³)
    // Statuts :
    //   w2→w1 : 4.0→4.0 m³,  0.0% → à_verifier (écart ≤5%)
    //   w3→w2 : 4.0→4.0 m³,  0.0% → à_verifier
    //   w4→w3 : 3.5→4.0 m³, -12.5% → valide
    //   w5→w4 : 3.5→3.5 m³,  0.0% → à_verifier
    //   w6→w5 : 3.0→3.5 m³, -14.3% → valide
    //   w7→w6 : 3.0→3.0 m³,  0.0% → à_verifier
    //   w8→w7 : 3.0→3.0 m³,  0.0% → à_verifier
    //   w9→w8 : 3.5→3.0 m³, +16.7% → valide (reprise activité)
    //   w10→w9 : 4.0→3.5 m³, +14.3% → valide
    //   w11→w10 : 4.0→4.0 m³, 0.0% → à_verifier
    //   ANOMALIE w6 : pic +40% vs w5 attendu (fuite)
    { id: 'w1',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Janvier 2025',  date_releve: '2025-01-31', index_debut:  10.0, index_fin:  14.0, unite: 'm³', cout_estime: 16.00, anomalie: false,                                                                                                  statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'w2',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Février 2025', date_releve: '2025-02-28', index_debut:  14.0, index_fin:  18.0, unite: 'm³', cout_estime: 16.00, anomalie: false, anomalie_desc: 'Consommation identique à janvier (écart 0%) — relevé à confirmer',                 statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'w3',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Mars 2025',    date_releve: '2025-03-31', index_debut:  18.0, index_fin:  22.0, unite: 'm³', cout_estime: 16.00, anomalie: false, anomalie_desc: 'Consommation identique à février (écart 0%) — relevé à confirmer',                statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'w4',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Avril 2025',   date_releve: '2025-04-30', index_debut:  22.0, index_fin:  25.5, unite: 'm³', cout_estime: 14.00, anomalie: false,                                                                                                  statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'w5',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Mai 2025',     date_releve: '2025-05-31', index_debut:  25.5, index_fin:  29.0, unite: 'm³', cout_estime: 14.00, anomalie: false, anomalie_desc: 'Consommation identique à avril (écart 0%) — relevé à confirmer',                 statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'w6',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Juin 2025',    date_releve: '2025-06-30', index_debut:  29.0, index_fin:  33.8, unite: 'm³', cout_estime: 19.20, anomalie: true,  anomalie_desc: 'Surconsommation +37% vs mai (4,8 m³ vs 3,5 m³) — fuite robinet ou chasse d\'eau suspectée, intervention demandée', statut: 'anomalie',   has_photo: true,  has_pj: true  },
    { id: 'w7',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Juillet 2025', date_releve: '2025-07-31', index_debut:  33.8, index_fin:  36.8, unite: 'm³', cout_estime: 12.00, anomalie: false, anomalie_desc: 'Consommation identique à juin normalisée (écart 0%) — relevé à confirmer',       statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'w8',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Août 2025',    date_releve: '2025-08-31', index_debut:  36.8, index_fin:  39.8, unite: 'm³', cout_estime: 12.00, anomalie: false, anomalie_desc: 'Consommation identique à juillet (écart 0%) — relevé à confirmer',              statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'w9',  type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Sept. 2025',   date_releve: '2025-09-30', index_debut:  39.8, index_fin:  43.3, unite: 'm³', cout_estime: 14.00, anomalie: false,                                                                                                  statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'w10', type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Octobre 2025', date_releve: '2025-10-31', index_debut:  43.3, index_fin:  47.3, unite: 'm³', cout_estime: 16.00, anomalie: false,                                                                                                  statut: 'valide',     has_photo: false, has_pj: true  },
    { id: 'w11', type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Nov. 2025',    date_releve: '2025-11-30', index_debut:  47.3, index_fin:  51.3, unite: 'm³', cout_estime: 16.00, anomalie: false, anomalie_desc: 'Consommation identique à octobre (écart 0%) — relevé à confirmer',              statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'w12', type_fluide: 'eau', compteur_ref: 'CPT-EAU-LOG-108', periode_label: 'Déc. 2025',    date_releve: '2025-12-31', index_debut:  51.3, index_fin:  55.3, unite: 'm³', cout_estime: 16.00, anomalie: false,                                                                                                  statut: 'valide',     has_photo: true,  has_pj: true  },
    // Gaz — 12 mois (tarif ~0,12 €/kWh)
    // Statuts :
    //   g2→g1 : 190→200 kWh, -5.0% → à_verifier (écart ≤5%)
    //   g3→g2 : 180→190 kWh, -5.3% → valide
    //   g4→g3 : 140→180 kWh, -22.2% → anomalie (baisse trop forte)
    //   g5→g4 : 130→140 kWh, -7.1% → valide
    //   g6→g5 : 120→130 kWh, -7.7% → valide
    //   g7→g6 : 110→120 kWh, -8.3% → valide
    //   g8→g7 : 110→110 kWh,  0.0% → à_verifier
    //   g9→g8 : 130→110 kWh, +18.2% → valide
    //   g10→g9: 150→130 kWh, +15.4% → valide
    //   g11→g10: 170→150 kWh, +13.3% → valide
    //   g12→g11: 200→170 kWh, +17.6% → valide
    { id: 'g1',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Janvier 2025',  date_releve: '2025-01-31', index_debut:  500, index_fin:  700, unite: 'kWh', cout_estime: 24.00, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'g2',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Février 2025', date_releve: '2025-02-28', index_debut:  700, index_fin:  890, unite: 'kWh', cout_estime: 22.80, anomalie: false, anomalie_desc: 'Consommation quasi identique à janvier (écart 5%) — relevé à confirmer',                              statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'g3',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Mars 2025',    date_releve: '2025-03-31', index_debut:  890, index_fin: 1070, unite: 'kWh', cout_estime: 21.60, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'g4',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Avril 2025',   date_releve: '2025-04-30', index_debut: 1070, index_fin: 1210, unite: 'kWh', cout_estime: 16.80, anomalie: true,  anomalie_desc: 'Chute brutale -22% vs mars (140 kWh vs 180 kWh) — arrêt chauffage non planifié ou dysfonctionnement chaudière', statut: 'anomalie',   has_photo: false, has_pj: true  },
    { id: 'g5',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Mai 2025',     date_releve: '2025-05-31', index_debut: 1210, index_fin: 1340, unite: 'kWh', cout_estime: 15.60, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'g6',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Juin 2025',    date_releve: '2025-06-30', index_debut: 1340, index_fin: 1460, unite: 'kWh', cout_estime: 14.40, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'g7',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Juillet 2025', date_releve: '2025-07-31', index_debut: 1460, index_fin: 1570, unite: 'kWh', cout_estime: 13.20, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'g8',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Août 2025',    date_releve: '2025-08-31', index_debut: 1570, index_fin: 1680, unite: 'kWh', cout_estime: 13.20, anomalie: false, anomalie_desc: 'Consommation identique à juillet (écart 0%) — relevé à confirmer',                                    statut: 'a_verifier', has_photo: false, has_pj: false },
    { id: 'g9',  type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Sept. 2025',   date_releve: '2025-09-30', index_debut: 1680, index_fin: 1810, unite: 'kWh', cout_estime: 15.60, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'g10', type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Octobre 2025', date_releve: '2025-10-31', index_debut: 1810, index_fin: 1960, unite: 'kWh', cout_estime: 18.00, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: true  },
    { id: 'g11', type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Nov. 2025',    date_releve: '2025-11-30', index_debut: 1960, index_fin: 2130, unite: 'kWh', cout_estime: 20.40, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'g12', type_fluide: 'gaz', compteur_ref: 'CPT-GAZ-LOG-108', periode_label: 'Déc. 2025',    date_releve: '2025-12-31', index_debut: 2130, index_fin: 2330, unite: 'kWh', cout_estime: 24.00, anomalie: false,                                                                                                                        statut: 'valide',     has_photo: true,  has_pj: true  },
  ];
}

// Données réalistes pour une armoire positive 5°C ±2°C, 1361 L — tarif ~0,22 €/kWh
// Index initial : 5 000 kWh. Consommations calées sur le tableau fourni (valeur médiane de chaque plage).
export function buildMockRelevesEquipement(): Releve[] {
  return [
    { id: 'eq-e1',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Janvier 2025',  date_releve: '2025-01-31', index_debut: 5000, index_fin: 5090, unite: 'kWh', cout_estime: 19.80, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e2',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Février 2025', date_releve: '2025-02-28', index_debut: 5090, index_fin: 5180, unite: 'kWh', cout_estime: 19.80, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e3',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Mars 2025',    date_releve: '2025-03-31', index_debut: 5180, index_fin: 5280, unite: 'kWh', cout_estime: 22.00, anomalie: false, statut: 'valide',     has_photo: false, has_pj: true  },
    { id: 'eq-e4',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Avril 2025',   date_releve: '2025-04-30', index_debut: 5280, index_fin: 5390, unite: 'kWh', cout_estime: 24.20, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e5',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Mai 2025',     date_releve: '2025-05-31', index_debut: 5390, index_fin: 5510, unite: 'kWh', cout_estime: 26.40, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e6',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Juin 2025',    date_releve: '2025-06-30', index_debut: 5510, index_fin: 5640, unite: 'kWh', cout_estime: 28.60, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e7',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Juillet 2025', date_releve: '2025-07-31', index_debut: 5640, index_fin: 5780, unite: 'kWh', cout_estime: 30.80, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e8',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Août 2025',    date_releve: '2025-08-31', index_debut: 5780, index_fin: 5920, unite: 'kWh', cout_estime: 30.80, anomalie: true, anomalie_desc: 'Consommation élevée — écart 15–20°C avec la consigne, porte mal fermée suspectée', statut: 'anomalie', has_photo: true, has_pj: true },
    { id: 'eq-e9',  type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Sept. 2025',   date_releve: '2025-09-30', index_debut: 5920, index_fin: 6050, unite: 'kWh', cout_estime: 28.60, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e10', type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Octobre 2025', date_releve: '2025-10-31', index_debut: 6050, index_fin: 6160, unite: 'kWh', cout_estime: 24.20, anomalie: false, statut: 'valide',     has_photo: false, has_pj: true  },
    { id: 'eq-e11', type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Nov. 2025',    date_releve: '2025-11-30', index_debut: 6160, index_fin: 6260, unite: 'kWh', cout_estime: 22.00, anomalie: false, statut: 'valide',     has_photo: false, has_pj: false },
    { id: 'eq-e12', type_fluide: 'electricite', compteur_ref: 'CPT-ELEC-ARM-POS-01', periode_label: 'Déc. 2025',    date_releve: '2025-12-31', index_debut: 6260, index_fin: 6350, unite: 'kWh', cout_estime: 19.80, anomalie: false, statut: 'valide',     has_photo: true,  has_pj: true  },
  ];
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const FLUIDE_CFG: Record<TypeFluide, { label: string; icon: React.ReactNode; unit: string; bg: string; text: string; border: string; dot: string }> = {
  eau:          { label: 'Eau',          icon: <Droplets className="w-3.5 h-3.5" />, unit: 'm³',  bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-500'   },
  electricite:  { label: 'Électricité',  icon: <Zap      className="w-3.5 h-3.5" />, unit: 'kWh', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'  },
  gaz:          { label: 'Gaz',          icon: <Flame    className="w-3.5 h-3.5" />, unit: 'kWh', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500' },
};

const STATUT_CFG: Record<StatutReleve, { label: string; icon: React.ReactNode; bg: string; text: string; border: string; dot: string }> = {
  valide:     { label: 'Validé',     icon: <CheckCircle2 className="w-3 h-3" />, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  a_verifier: { label: 'À vérifier', icon: <HelpCircle   className="w-3 h-3" />, bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  anomalie:   { label: 'Anomalie',   icon: <AlertTriangle className="w-3 h-3" />, bg: 'bg-red-50',    text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
};

const FLUIDE_LIST  = Object.keys(FLUIDE_CFG)  as TypeFluide[];
const STATUT_LIST  = Object.keys(STATUT_CFG)  as StatutReleve[];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  try { return format(parseISO(d), 'dd/MM/yyyy', { locale: fr }); } catch { return d; }
}
function fmtNum(n: number, unit: string) {
  return `${new Intl.NumberFormat('fr-FR').format(n)} ${unit}`;
}
function fmtCout(n?: number | null) {
  if (n == null) return null;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n);
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef { id: string; label: string; label2?: string; icon?: React.ReactNode; defaultWidth: number; minWidth: number; canHide: boolean; sortable?: boolean }

const ALL_COLUMNS: ColDef[] = [
  { id: 'fluide',    label: 'Type de fluide',      icon: <Droplets className="w-3 h-3" />, defaultWidth: 130, minWidth: 100, canHide: false, sortable: true },
  { id: 'compteur',  label: 'Compteur associé',     icon: <Tag      className="w-3 h-3" />, defaultWidth: 170, minWidth: 130, canHide: true,  sortable: true },
  { id: 'periode',   label: 'Période', label2: 'Date de relevé', icon: <ArrowUpDown className="w-3 h-3" />, defaultWidth: 160, minWidth: 120, canHide: false, sortable: true },
  { id: 'index',     label: 'Index début', label2: 'Index fin',  icon: <ArrowUpDown className="w-3 h-3" />, defaultWidth: 170, minWidth: 140, canHide: true,  sortable: false },
  { id: 'conso',     label: 'Consommation',         icon: <Zap      className="w-3 h-3" />, defaultWidth: 130, minWidth: 100, canHide: false, sortable: true },
  { id: 'cout_pj',   label: 'Coût estimé', label2: 'Pièces jointes', icon: <Tag className="w-3 h-3" />, defaultWidth: 150, minWidth: 120, canHide: true, sortable: true },
  { id: 'anomalie',  label: 'Anomalie',             icon: <AlertTriangle className="w-3 h-3" />, defaultWidth: 170, minWidth: 130, canHide: true,  sortable: false },
  { id: 'statut',    label: 'Statut de validation', icon: <CheckCircle2  className="w-3 h-3" />, defaultWidth: 140, minWidth: 110, canHide: false, sortable: true },
];

const TRI_OPTIONS = [
  { value: 'date_releve_desc', label: 'Date de relevé (plus récent)' },
  { value: 'date_releve_asc',  label: 'Date de relevé (plus ancien)' },
  { value: 'fluide_asc',       label: 'Type de fluide (A → Z)' },
  { value: 'conso_desc',       label: 'Consommation (plus élevée)' },
  { value: 'conso_asc',        label: 'Consommation (plus faible)' },
  { value: 'cout_desc',        label: 'Coût (plus élevé)' },
  { value: 'cout_asc',         label: 'Coût (plus faible)' },
  { value: 'statut_asc',       label: 'Statut (A → Z)' },
];

// ─── Resizable TH ─────────────────────────────────────────────────────────────

function ResizableTh({ col, width, onResize, sortField, sortDir, onSort }: {
  col: ColDef; width: number;
  onResize: (id: string, delta: number) => void;
  sortField: string; sortDir: 'asc' | 'desc'; onSort: (id: string) => void;
}) {
  const dragging = useRef(false); const startX = useRef(0);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); dragging.current = true; startX.current = e.clientX;
    const onMove = (ev: MouseEvent) => { if (!dragging.current) return; onResize(col.id, ev.clientX - startX.current); startX.current = ev.clientX; };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [col.id, onResize]);

  const isActive = sortField === col.id;
  return (
    <th style={{ width, minWidth: col.minWidth, position: 'relative' }}
      className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 select-none align-top"
      onClick={() => col.sortable && onSort(col.id)}>
      <div className={`flex flex-col gap-0.5 pr-3 ${col.sortable ? 'cursor-pointer' : ''}`}>
        <span className="flex items-start gap-1">
          {col.icon && <span className="text-slate-400 flex-shrink-0 mt-px">{col.icon}</span>}
          <span className="break-words leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{col.label}</span>
          {col.sortable && (
            <span className="ml-auto flex-shrink-0 mt-px">
              {isActive ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />) : <ChevronUp className="w-3 h-3 text-slate-300" />}
            </span>
          )}
        </span>
        {col.label2 && <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal pl-0.5 leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{col.label2}</span>}
      </div>
      <span onMouseDown={onMouseDown} className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group" style={{ userSelect: 'none' }} onClick={e => e.stopPropagation()}>
        <span className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// ─── Settings sidebar ─────────────────────────────────────────────────────────

function SettingsSidebar({ visibleCols, setVisibleCols, defaultSort, setDefaultSort, onClose }: {
  visibleCols: string[]; setVisibleCols: (c: string[]) => void;
  defaultSort: string; setDefaultSort: (s: string) => void; onClose: () => void;
}) {
  const hideable = ALL_COLUMNS.filter(c => c.canHide);
  const [localSel,  setLocalSel]  = useState(visibleCols.filter(id => hideable.some(c => c.id === id)));
  const [localSort, setLocalSort] = useState(defaultSort);
  const dragOver = useRef<string | null>(null);

  const addCol    = (id: string) => setLocalSel(p => [...p, id]);
  const removeCol = (id: string) => setLocalSel(p => p.filter(x => x !== id));
  const available = hideable.filter(c => !localSel.includes(c.id));
  const colLabel  = (c: ColDef) => c.label2 ? `${c.label} / ${c.label2}` : c.label;

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('colId', id); };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    const srcId = e.dataTransfer.getData('colId'); if (srcId === targetId) return;
    setLocalSel(prev => { const arr = [...prev]; const from = arr.indexOf(srcId); const to = arr.indexOf(targetId); if (from === -1 || to === -1) return prev; arr.splice(from, 1); arr.splice(to, 0, srcId); return arr; });
    dragOver.current = null;
  };

  const apply = () => {
    const fixed   = ALL_COLUMNS.filter(c => !c.canHide).map(c => c.id);
    const ordered = ALL_COLUMNS.map(c => c.id).filter(id => fixed.includes(id) || localSel.includes(id));
    setVisibleCols(ordered);
    setDefaultSort(localSort);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[480px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Paramètres du tableau</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><ArrowUpDown className="w-3.5 h-3.5" /> Tri par défaut</h4>
            <div className="space-y-1.5">
              {TRI_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${localSort === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  <input type="radio" name="sort" value={opt.value} checked={localSort === opt.value} onChange={() => setLocalSort(opt.value)} className="accent-blue-600" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" /> Colonnes visibles</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Disponibles</p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                  {available.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Toutes affichées</p>
                    : available.map(col => (
                      <button key={col.id} onClick={() => addCol(col.id)} className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group">
                        <span className="flex items-center gap-1.5">{col.icon && <span className="text-slate-400">{col.icon}</span>}{colLabel(col)}</span>
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Sélectionnées — glisser</p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-white p-2 space-y-1">
                  {localSel.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Aucune</p>
                    : localSel.map(id => {
                        const col = hideable.find(c => c.id === id); if (!col) return null;
                        return (
                          <div key={id} draggable onDragStart={e => handleDragStart(e, id)} onDragOver={e => { e.preventDefault(); dragOver.current = id; }} onDrop={e => handleDrop(e, id)}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-slate-700 bg-blue-50 border border-blue-100 cursor-grab active:cursor-grabbing group">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                              {col.icon && <span className="text-slate-400">{col.icon}</span>}
                              <span className="font-medium">{colLabel(col)}</span>
                            </div>
                            <button onClick={() => removeCol(id)} className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
          <button onClick={apply}   className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Appliquer</button>
        </div>
      </div>
    </>
  );
}

// ─── Filter dropdowns ─────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({ label, icon, items, active, toggle, clear }: {
  label: string; icon: React.ReactNode;
  items: { key: T; label: string; bg: string; text: string; border: string; dot: string; icon?: React.ReactNode }[];
  active: Set<string>; toggle: (k: string) => void; clear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = active.size;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${open || count > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <span className="text-current">{icon}</span>
        {label}
        {count > 0 && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">{count}</span>}
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[200px]">
          <div className="flex flex-col gap-1.5">
            {items.map(it => {
              const isActive = active.has(it.key);
              return (
                <button key={it.key} onClick={() => toggle(it.key)} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full ${isActive ? `${it.bg} ${it.text} ${it.border} shadow-sm` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  {it.icon
                    ? <span className={isActive ? it.text : 'text-slate-400'}>{it.icon}</span>
                    : <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? it.dot : 'bg-slate-300'}`} />}
                  {it.label}
                </button>
              );
            })}
          </div>
          {count > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clear(); setOpen(false); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                <X className="w-3 h-3" /> Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function ReleveRow({ releve, idx, colWidths, activeCols }: {
  releve: Releve; idx: number; colWidths: Record<string, number>; activeCols: ColDef[];
}) {
  const conso = releve.index_fin - releve.index_debut;
  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

  const cellFor = (id: string) => {
    const w = colWidths[id];
    switch (id) {

      case 'fluide': {
        const cfg = FLUIDE_CFG[releve.type_fluide];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={cfg.text}>{cfg.icon}</span>{cfg.label}
            </span>
          </td>
        );
      }

      case 'compteur':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{releve.compteur_ref}</span>
          </td>
        );

      case 'periode':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <p className="text-xs font-semibold text-slate-800">{releve.periode_label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(releve.date_releve)}</p>
          </td>
        );

      case 'index': {
        const cfg = FLUIDE_CFG[releve.type_fluide];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <p className="text-xs text-slate-600"><span className="text-[10px] text-slate-400 mr-1">Déb.</span>{fmtNum(releve.index_debut, releve.unite)}</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5"><span className={`text-[10px] mr-1 ${cfg.text}`}>Fin.</span>{fmtNum(releve.index_fin, releve.unite)}</p>
          </td>
        );
      }

      case 'conso': {
        const cfg = FLUIDE_CFG[releve.type_fluide];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`text-sm font-bold ${cfg.text}`}>{fmtNum(conso, releve.unite)}</span>
          </td>
        );
      }

      case 'cout_pj':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {releve.cout_estime != null
              ? <p className="text-xs font-semibold text-slate-800">{fmtCout(releve.cout_estime)}</p>
              : <p className="text-xs text-slate-300 italic">—</p>}
            <div className="flex items-center gap-2 mt-1">
              <span title="Photos" className={`flex items-center gap-0.5 text-[10px] font-medium ${releve.has_photo ? 'text-blue-500' : 'text-slate-200'}`}>
                <Camera className="w-3 h-3" />
              </span>
              <span title="Pièces jointes" className={`flex items-center gap-0.5 text-[10px] font-medium ${releve.has_pj ? 'text-slate-600' : 'text-slate-200'}`}>
                <Paperclip className="w-3 h-3" />
              </span>
            </div>
          </td>
        );

      case 'anomalie':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {releve.anomalie
              ? (
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-px" />
                  <p className="text-[11px] text-red-700 leading-snug" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{releve.anomalie_desc ?? 'Anomalie détectée'}</p>
                </div>
              )
              : <span className="text-xs text-slate-300">—</span>}
          </td>
        );

      case 'statut': {
        const cfg = STATUT_CFG[releve.statut];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </span>
          </td>
        );
      }

      default:
        return <td key={id} style={{ width: w }} className="px-3 py-2.5" />;
    }
  };

  return (
    <tr className={`${rowBg} hover:bg-blue-50/30 transition-colors`}>
      {activeCols.map(col => cellFor(col.id))}
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  releves: Releve[];
  lockFluide?: TypeFluide; // if set, fluide filter is locked and column may be hidden
}

export default function ConsommationsTableau({ releves, lockFluide }: Props) {
  const defaultVisible = ALL_COLUMNS.map(c => c.id).filter(id => !lockFluide || id !== 'fluide');

  const [sortField,    setSortField]    = useState('date_releve');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [defaultSort,  setDefaultSort]  = useState('date_releve_desc');
  const [visibleCols,  setVisibleCols]  = useState<string[]>(defaultVisible);
  const [showSidebar,  setShowSidebar]  = useState(false);
  const [activeFluide, setActiveFluide] = useState<Set<string>>(lockFluide ? new Set([lockFluide]) : new Set());
  const [activeStatut, setActiveStatut] = useState<Set<string>>(new Set());
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(ALL_COLUMNS.map(c => [c.id, c.defaultWidth]))
  );

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = ALL_COLUMNS.find(c => c.id === id)!;
      return { ...prev, [id]: Math.max(col.minWidth, prev[id] + delta) };
    });
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const applyDefaultSort = (s: string) => {
    setDefaultSort(s);
    const parts = s.split('_'); const dir = parts.pop() as 'asc' | 'desc'; const field = parts.join('_');
    setSortField(field); setSortDir(dir);
  };

  const display = useMemo(() => {
    let items = [...releves];
    if (activeFluide.size > 0) items = items.filter(r => activeFluide.has(r.type_fluide));
    if (activeStatut.size > 0) items = items.filter(r => activeStatut.has(r.statut));
    items.sort((a, b) => {
      const conso = (r: Releve) => r.index_fin - r.index_debut;
      let va = 0, vb = 0; let sa = '', sb = '';
      if (sortField === 'date_releve') { sa = a.date_releve; sb = b.date_releve; }
      if (sortField === 'fluide')      { sa = a.type_fluide; sb = b.type_fluide; }
      if (sortField === 'conso')       { va = conso(a); vb = conso(b); }
      if (sortField === 'cout')        { va = a.cout_estime ?? 0; vb = b.cout_estime ?? 0; }
      if (sortField === 'statut')      { sa = a.statut; sb = b.statut; }
      if (sa || sb) return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return items;
  }, [releves, activeFluide, activeStatut, sortField, sortDir]);

  const activeCols = ALL_COLUMNS.filter(c => visibleCols.includes(c.id));
  const totalWidth = activeCols.reduce((s, c) => s + colWidths[c.id], 0);
  const filterCount = (activeFluide.size - (lockFluide ? 1 : 0)) + activeStatut.size;

  const fluideItems = FLUIDE_LIST.map(k => ({ key: k, ...FLUIDE_CFG[k], icon: FLUIDE_CFG[k].icon }));
  const statutItems = STATUT_LIST.map(k => ({ key: k, ...STATUT_CFG[k], icon: STATUT_CFG[k].icon }));

  const toggleFluide = (k: string) => {
    if (lockFluide) return;
    setActiveFluide(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap">
        <button onClick={() => setShowSidebar(true)} title="Paramètres"
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-slate-700 flex-shrink-0">
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 flex-shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" /> Ordre :
        </span>
        <select value={`${sortField}_${sortDir}`} onChange={e => applyDefaultSort(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 cursor-pointer flex-shrink-0">
          {TRI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        {!lockFluide && (
          <FilterDropdown
            label="Fluide" icon={<Droplets className="w-3.5 h-3.5" />}
            items={fluideItems} active={activeFluide} toggle={toggleFluide} clear={() => setActiveFluide(new Set())}
          />
        )}
        <FilterDropdown
          label="Statut" icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          items={statutItems} active={activeStatut} toggle={k => setActiveStatut(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })} clear={() => setActiveStatut(new Set())}
        />

        <span className="ml-auto text-xs text-slate-400 font-medium flex-shrink-0">
          {display.length} relevé{display.length > 1 ? 's' : ''}
          {filterCount > 0 && <span className="ml-1 text-blue-500">({filterCount} filtre{filterCount > 1 ? 's' : ''})</span>}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: totalWidth }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {activeCols.map(col => (
                <ResizableTh key={col.id} col={col} width={colWidths[col.id]} onResize={handleResize} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {display.length === 0
              ? (
                <tr>
                  <td colSpan={activeCols.length} className="text-center py-16 text-slate-400 text-sm">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucun relevé{filterCount > 0 ? ' pour ces filtres' : ' disponible'}
                  </td>
                </tr>
              )
              : display.map((r, idx) => (
                <ReleveRow key={r.id} releve={r} idx={idx} colWidths={colWidths} activeCols={activeCols} />
              ))
            }
          </tbody>
        </table>
      </div>

      {showSidebar && (
        <SettingsSidebar visibleCols={visibleCols} setVisibleCols={setVisibleCols} defaultSort={defaultSort} setDefaultSort={applyDefaultSort} onClose={() => setShowSidebar(false)} />
      )}
    </div>
  );
}
