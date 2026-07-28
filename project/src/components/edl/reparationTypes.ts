import { CATEGORIES_DI, CRITICITE_CFG, type CriticiteDI } from '../interventions/interventionsTypes';

export { CATEGORIES_DI, CRITICITE_CFG };
export type { CriticiteDI };

export interface ReparationDetail {
  titre: string;
  description: string;
  categorie: string;
  criticite: CriticiteDI;
  justification: string;
  dateButoir: string;
  photo: string | null;
}

export function makeBlankDetail(): ReparationDetail {
  return {
    titre: '',
    description: '',
    categorie: '',
    criticite: 'moyenne',
    justification: '',
    dateButoir: '',
    photo: null,
  };
}

// Forfait prices per element ID (subset — others default to free entry)
export const FORFAITS: Record<string, { label: string; prix: number }[]> = {
  // Porte
  pp_porte:       [{ label: 'Repeindre porte', prix: 80 }, { label: 'Changer poignée', prix: 60 }, { label: 'Réparer serrure', prix: 90 }, { label: 'Reboucher trou', prix: 45 }],
  ent_porte:      [{ label: "Repeindre porte d'entrée", prix: 100 }, { label: 'Changer poignée', prix: 60 }, { label: 'Réparer serrure', prix: 90 }],
  sdb_porte:      [{ label: 'Repeindre porte', prix: 75 }, { label: 'Changer poignée', prix: 55 }, { label: 'Reboucher trou', prix: 40 }],
  wc_porte:       [{ label: 'Repeindre porte', prix: 75 }, { label: 'Changer poignée', prix: 55 }],
  cui_porte:      [{ label: 'Repeindre porte', prix: 75 }, { label: 'Changer poignée', prix: 55 }],
  // Murs
  pp_mur:         [{ label: 'Repeindre mur', prix: 120 }, { label: 'Reboucher trou', prix: 35 }, { label: 'Nettoyage tâches', prix: 50 }],
  sdb_mur:        [{ label: 'Rejointoyer carrelage', prix: 80 }, { label: 'Remplacer carrelage', prix: 150 }, { label: 'Nettoyage tâches', prix: 45 }],
  wc_mur:         [{ label: 'Rejointoyer carrelage', prix: 70 }, { label: 'Remplacer carrelage', prix: 130 }],
  cui_mur:        [{ label: 'Repeindre mur', prix: 110 }, { label: 'Reboucher trou', prix: 35 }],
  ent_mur:        [{ label: 'Repeindre mur', prix: 100 }, { label: 'Reboucher trou', prix: 30 }],
  // Sols
  pp_sol:         [{ label: 'Remplacer revêtement sol', prix: 280 }, { label: 'Ponçage parquet', prix: 180 }, { label: 'Reboucher accroc', prix: 60 }],
  sdb_sol:        [{ label: 'Remplacer carrelage sol', prix: 220 }, { label: 'Rejointoyer sol', prix: 90 }],
  wc_sol:         [{ label: 'Remplacer carrelage sol', prix: 180 }, { label: 'Rejointoyer sol', prix: 70 }],
  cui_sol:        [{ label: 'Remplacer revêtement sol', prix: 250 }, { label: 'Rejointoyer sol', prix: 80 }],
  ent_sol:        [{ label: 'Remplacer revêtement sol', prix: 200 }, { label: 'Reboucher accroc', prix: 50 }],
  // Fenêtre / vitre
  pp_fenetre:     [{ label: 'Réparer poignée fenêtre', prix: 45 }, { label: 'Remplacer joint fenêtre', prix: 55 }, { label: 'Nettoyage cadre', prix: 25 }],
  pp_vitre:       [{ label: 'Remplacer vitre', prix: 120 }, { label: 'Nettoyage vitre', prix: 20 }],
  // Volet
  pp_volet:       [{ label: 'Réparer volet', prix: 85 }, { label: 'Remplacer sangle', prix: 40 }, { label: 'Remplacer volet', prix: 180 }],
  // Éclairage
  pp_lum_couloir: [{ label: 'Remplacer ampoule', prix: 15 }, { label: 'Remplacer luminaire', prix: 45 }],
  pp_lum_bureau:  [{ label: 'Remplacer ampoule', prix: 15 }, { label: 'Remplacer luminaire', prix: 55 }],
  pp_lum_chevet:  [{ label: 'Remplacer ampoule', prix: 15 }, { label: 'Remplacer lampe', prix: 35 }],
  sdb_eclairage:  [{ label: 'Remplacer ampoule', prix: 15 }, { label: 'Remplacer luminaire', prix: 50 }],
  wc_eclairage:   [{ label: 'Remplacer ampoule', prix: 15 }, { label: 'Remplacer luminaire', prix: 40 }],
  cui_eclairage:  [{ label: 'Remplacer ampoule', prix: 15 }, { label: 'Remplacer luminaire', prix: 45 }],
  ent_lumiere:    [{ label: 'Remplacer ampoule', prix: 15 }, { label: 'Remplacer luminaire', prix: 40 }],
  // Sanitaires
  sdb_cabine:     [{ label: 'Remplacer cabine douche', prix: 450 }, { label: 'Reboucher fissure', prix: 90 }, { label: 'Nettoyage approfondi', prix: 60 }],
  sdb_mitigeur:   [{ label: 'Remplacer mitigeur', prix: 120 }, { label: 'Réparer mitigeur', prix: 70 }, { label: 'Anti-calcaire', prix: 30 }],
  sdb_meuble:     [{ label: 'Remplacer meuble vasque', prix: 280 }, { label: 'Réparer meuble', prix: 90 }],
  wc_cuvette:     [{ label: 'Remplacer cuvette', prix: 180 }, { label: 'Détartrage cuvette', prix: 40 }],
  wc_abattant:    [{ label: 'Remplacer abattant', prix: 45 }, { label: 'Resserrer abattant', prix: 15 }],
  wc_chasse:      [{ label: "Remplacer mécanisme chasse d'eau", prix: 80 }, { label: 'Réparer flotteur', prix: 35 }],
  // Cuisine
  cui_plan_travail:[{ label: 'Remplacer plan de travail', prix: 320 }, { label: 'Nettoyage approfondi', prix: 50 }],
  cui_credence:   [{ label: 'Reposer crédence', prix: 80 }, { label: 'Remplacer crédence', prix: 140 }],
  cui_evier:      [{ label: 'Remplacer évier', prix: 150 }, { label: 'Détartrage évier', prix: 35 }],
  cui_mitigeur:   [{ label: 'Remplacer mitigeur cuisine', prix: 110 }, { label: 'Réparer mitigeur', prix: 65 }],
  cui_plaques:    [{ label: 'Remplacer plaques cuisson', prix: 280 }, { label: 'Dégraissage plaques', prix: 45 }],
  cui_four:       [{ label: 'Remplacer four', prix: 350 }, { label: 'Réparer four', prix: 120 }, { label: 'Nettoyage four', prix: 50 }],
  cui_frigo:      [{ label: 'Remplacer réfrigérateur', prix: 420 }, { label: 'Réparer réfrigérateur', prix: 150 }],
  cui_hotte:      [{ label: 'Remplacer filtre hotte', prix: 25 }, { label: 'Remplacer hotte', prix: 180 }, { label: 'Nettoyage hotte', prix: 40 }],
  cui_meubles:    [{ label: 'Remplacer meuble cuisine', prix: 250 }, { label: 'Réparer charnière', prix: 30 }],
  // Radiateur
  pp_radiateur:   [{ label: 'Détartrage radiateur', prix: 60 }, { label: 'Remplacer radiateur', prix: 280 }],
  sdb_radiateur:  [{ label: 'Remplacer sèche-serviettes', prix: 220 }, { label: 'Réparer sèche-serviettes', prix: 80 }],
  // Patères
  pp_pateres:     [{ label: 'Remplacer patères', prix: 20 }, { label: 'Reposer patères', prix: 15 }],
  sdb_pateres:    [{ label: 'Remplacer patères', prix: 20 }, { label: 'Reposer patères', prix: 15 }],
  ent_pateres:    [{ label: 'Remplacer patères', prix: 20 }, { label: 'Reposer patères', prix: 15 }],
  // Plafond
  pp_plafond:     [{ label: 'Repeindre plafond', prix: 130 }, { label: 'Reboucher fissure plafond', prix: 50 }],
  // Détecteur
  pp_detecteur:   [{ label: 'Remplacer détecteur de fumée', prix: 35 }, { label: 'Changer pile', prix: 8 }],
};
