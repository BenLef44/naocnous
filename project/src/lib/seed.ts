import { supabase } from './supabase';

export async function seedDemoData() {
  const { count } = await supabase.from('sites').select('*', { count: 'exact', head: true });
  if (count && count > 0) return;

  // Sites
  const { data: sites } = await supabase.from('sites').insert([
    { nom: 'Cité Universitaire Lyon Centre', code: 'SITE-LYO-001', adresse: '12 Rue de la Paix', ville: 'Lyon', code_postal: '69001', statut: 'disponible' },
    { nom: 'Campus Grenoble Nord', code: 'SITE-GRE-001', adresse: '45 Avenue des Sciences', ville: 'Grenoble', code_postal: '38000', statut: 'disponible' },
    { nom: 'Résidence Marseille Luminy', code: 'SITE-MRS-001', adresse: '3 Chemin du Luminy', ville: 'Marseille', code_postal: '13009', statut: 'disponible' },
  ]).select();

  if (!sites) return;

  // Résidences
  const { data: residences } = await supabase.from('residences').insert([
    { site_id: sites[0].id, nom: 'Résidence Les Érables', code: 'RES-LYO-001', adresse: '12 Rue de la Paix', statut: 'disponible' },
    { site_id: sites[0].id, nom: 'Résidence Les Chênes', code: 'RES-LYO-002', adresse: '14 Rue de la Paix', statut: 'disponible' },
    { site_id: sites[1].id, nom: 'Résidence Vaucanson', code: 'RES-GRE-001', adresse: '47 Avenue des Sciences', statut: 'disponible' },
    { site_id: sites[2].id, nom: 'Résidence Calanques', code: 'RES-MRS-001', adresse: '3 Chemin du Luminy', statut: 'indisponible' },
  ]).select();

  if (!residences) return;

  // Bâtiments
  const { data: batiments } = await supabase.from('batiments').insert([
    { residence_id: residences[0].id, nom: 'Bâtiment A', code: 'BAT-A', annee_construction: 1985, surface_m2: 2400, nb_logements: 48, statut: 'disponible' },
    { residence_id: residences[0].id, nom: 'Bâtiment B', code: 'BAT-B', annee_construction: 1990, surface_m2: 1800, nb_logements: 36, statut: 'en_maintenance', raison_indisponibilite: 'Rénovation toiture', date_fin_indisponibilite: '2026-08-01' },
    { residence_id: residences[1].id, nom: 'Bâtiment Principal', code: 'BAT-P', annee_construction: 2005, surface_m2: 3200, nb_logements: 60, statut: 'disponible' },
    { residence_id: residences[2].id, nom: 'Tour Vaucanson', code: 'BAT-TV', annee_construction: 1978, surface_m2: 4500, nb_logements: 90, statut: 'disponible' },
    { residence_id: residences[3].id, nom: 'Bâtiment Calanques', code: 'BAT-CAL', annee_construction: 2000, surface_m2: 2100, nb_logements: 42, statut: 'indisponible', raison_indisponibilite: 'Sinistre inondation' },
  ]).select();

  if (!batiments) return;

  // Étages
  const etagesData = [];
  for (const bat of batiments.slice(0, 3)) {
    for (let i = 0; i <= 3; i++) {
      etagesData.push({ batiment_id: bat.id, numero: i, nom: i === 0 ? 'Rez-de-chaussée' : `Étage ${i}` });
    }
  }
  const { data: etages } = await supabase.from('etages').insert(etagesData).select();
  if (!etages) return;

  // Logements (quelques-uns)
  const logementsData = [];
  for (const etage of etages.slice(0, 8)) {
    for (let j = 1; j <= 4; j++) {
      logementsData.push({
        etage_id: etage.id,
        numero: `${etage.numero}0${j}`,
        surface_m2: 18 + j,
        type_logement: j % 2 === 0 ? 'T1' : 'studio',
        statut: j === 3 ? 'en_maintenance' : 'disponible',
        occupant: j % 2 === 0 ? `Étudiant ${String.fromCharCode(64 + j)}` : undefined,
      });
    }
  }
  await supabase.from('logements').insert(logementsData);

  // Équipements
  const equipementsData = [
    { identifiant: 'EQ-CHF-001', designation: 'Chaudière centrale A', categorie: 'Chauffage', sous_categorie: 'Chaudière gaz', batiment_id: batiments[0].id, etat: 'fonctionnel', marque: 'Viessmann', modele: 'Vitodens 200', date_mise_en_service: '2015-09-01', prochaine_echeance: '2026-09-01', frequence_controle: 'annuelle', cout_acquisition: 8500 },
    { identifiant: 'EQ-CHF-002', designation: 'Chaudière centrale B', categorie: 'Chauffage', sous_categorie: 'Chaudière gaz', batiment_id: batiments[1].id, etat: 'en_panne', marque: 'Viessmann', modele: 'Vitodens 100', date_mise_en_service: '2010-03-15', prochaine_echeance: '2026-03-15', frequence_controle: 'annuelle', cout_acquisition: 6200 },
    { identifiant: 'EQ-ASC-001', designation: 'Ascenseur Bâtiment A', categorie: 'Ascenseur', sous_categorie: 'Ascenseur hydraulique', batiment_id: batiments[0].id, etat: 'fonctionnel', marque: 'Otis', modele: 'GeN2', date_mise_en_service: '2018-01-10', prochaine_echeance: '2026-07-10', frequence_controle: 'semestrielle', cout_acquisition: 45000 },
    { identifiant: 'EQ-ASC-002', designation: 'Ascenseur Tour Vaucanson', categorie: 'Ascenseur', batiment_id: batiments[3].id, etat: 'fonctionnel', marque: 'Schindler', modele: '3300', date_mise_en_service: '2012-05-20', prochaine_echeance: '2026-11-20', frequence_controle: 'semestrielle', cout_acquisition: 52000 },
    { identifiant: 'EQ-ELC-001', designation: 'Tableau électrique principal A', categorie: 'Électricité', sous_categorie: 'Tableau TGBT', batiment_id: batiments[0].id, etat: 'fonctionnel', marque: 'Schneider', date_mise_en_service: '2015-09-01', prochaine_echeance: '2026-09-01', frequence_controle: 'annuelle' },
    { identifiant: 'EQ-PLB-001', designation: 'Système eau chaude sanitaire', categorie: 'Plomberie', sous_categorie: 'ECS', batiment_id: batiments[2].id, etat: 'fonctionnel', marque: 'Atlantic', modele: 'Coralis S', date_mise_en_service: '2020-04-15', prochaine_echeance: '2027-04-15', frequence_controle: 'annuelle', cout_acquisition: 3200 },
    { identifiant: 'EQ-SEC-001', designation: 'Système alarme incendie A', categorie: 'Sécurité', sous_categorie: 'SSI Catégorie A', batiment_id: batiments[0].id, etat: 'fonctionnel', marque: 'Siemens', date_mise_en_service: '2015-09-01', prochaine_echeance: '2026-09-01', frequence_controle: 'annuelle', cout_acquisition: 12000 },
    { identifiant: 'EQ-VTL-001', designation: 'Système VMC collective', categorie: 'Ventilation', sous_categorie: 'VMC double flux', batiment_id: batiments[2].id, etat: 'a_remplacer', marque: 'Aldes', modele: 'DFE Easy', date_mise_en_service: '2005-10-01', prochaine_echeance: '2026-06-01', frequence_controle: 'semestrielle', cout_acquisition: 7800 },
  ];
  const { data: equipements } = await supabase.from('equipements').insert(equipementsData).select();

  // Interventions
  if (equipements) {
    await supabase.from('interventions').insert([
      { titre: 'Révision annuelle chaudière A', type_intervention: 'maintenance_preventive', priorite: 'normale', statut: 'terminee', batiment_id: batiments[0].id, equipement_id: equipements[0].id, agent_nom: 'Jean Dupont', prestataire: 'Thermo Services', date_planifiee: '2026-03-15', date_realisation: '2026-03-15', cout: 450 },
      { titre: 'Panne chaudière B - Brûleur défaillant', type_intervention: 'curative', priorite: 'haute', statut: 'en_cours', batiment_id: batiments[1].id, equipement_id: equipements[1].id, agent_nom: 'Marie Leblanc', prestataire: 'Thermo Services', date_planifiee: '2026-05-18', cout: 0 },
      { titre: 'Contrôle périodique ascenseur A', type_intervention: 'controle_reglementaire', priorite: 'normale', statut: 'planifiee', batiment_id: batiments[0].id, equipement_id: equipements[2].id, prestataire: 'Otis Maintenance', date_planifiee: '2026-07-10' },
      { titre: 'Remplacement joints plomberie étage 2', type_intervention: 'curative', priorite: 'basse', statut: 'terminee', batiment_id: batiments[0].id, agent_nom: 'Paul Martin', date_planifiee: '2026-04-20', date_realisation: '2026-04-22', cout: 180 },
      { titre: 'Vérification tableau électrique', type_intervention: 'maintenance_preventive', priorite: 'normale', statut: 'terminee', batiment_id: batiments[0].id, equipement_id: equipements[4].id, agent_nom: 'Sophie Chen', prestataire: 'Electro Pro', date_planifiee: '2026-02-10', date_realisation: '2026-02-10', cout: 320 },
      { titre: 'Contrôle SSI annuel', type_intervention: 'controle_reglementaire', priorite: 'haute', statut: 'planifiee', batiment_id: batiments[0].id, equipement_id: equipements[6].id, prestataire: 'Siemens Services', date_planifiee: '2026-09-01' },
    ]);
  }

  // Contrats
  const { data: contrats } = await supabase.from('contrats').insert([
    { nom: 'Contrat maintenance chauffage 2026', prestataire: 'Thermo Services SARL', type_contrat: 'maintenance_preventive', statut: 'actif', date_debut: '2026-01-01', date_fin: '2026-12-31', cout_annuel: 12000, type_reconduction: 'annuelle', marche_associe: 'MRC-2026-001', site_id: sites[0].id },
    { nom: 'Contrat entretien ascenseurs Otis', prestataire: 'Otis Maintenance', type_contrat: 'maintenance_preventive', statut: 'actif', date_debut: '2025-06-01', date_fin: '2026-05-31', cout_annuel: 8400, type_reconduction: 'annuelle', marche_associe: 'MRC-2025-003', site_id: sites[0].id },
    { nom: 'Contrat nettoyage parties communes', prestataire: 'ProNett Services', type_contrat: 'nettoyage', statut: 'actif', date_debut: '2026-01-01', date_fin: '2026-12-31', cout_annuel: 24000, type_reconduction: 'annuelle', site_id: sites[0].id },
    { nom: 'Maintenance SSI campus Grenoble', prestataire: 'Siemens Services', type_contrat: 'maintenance_preventive', statut: 'actif', date_debut: '2026-01-01', date_fin: '2026-12-31', cout_annuel: 5600, site_id: sites[1].id },
    { nom: 'Contrat entretien espaces verts', prestataire: 'Jardin Plus', type_contrat: 'espaces_verts', statut: 'en_cours_renouvellement', date_debut: '2025-04-01', date_fin: '2026-06-30', cout_annuel: 9600, site_id: sites[0].id },
  ]).select();

  // Alertes
  if (contrats) {
    await supabase.from('alertes').insert([
      { type_alerte: 'echeance_contrat', message: 'Le contrat "Contrat entretien ascenseurs Otis" expire dans 12 jours', contrat_id: contrats[1].id, date_echeance: '2026-05-31', statut: 'active' },
      { type_alerte: 'echeance_contrat', message: 'Le contrat "Contrat entretien espaces verts" expire dans 41 jours', contrat_id: contrats[4].id, date_echeance: '2026-06-30', statut: 'active' },
      { type_alerte: 'controle_equipement', message: 'VMC collective Bât. Principal - contrôle en retard', equipement_id: equipements?.[7]?.id, date_echeance: '2026-06-01', statut: 'active' },
    ]);
  }

  // Documents
  await supabase.from('documents').insert([
    { nom: 'DTA_BatimentA_2025.pdf', type_document: 'DTA', tags: ['amiante', 'diagnostic'], taille_ko: 2456, mime_type: 'application/pdf', batiment_id: batiments[0].id, uploaded_by: 'Marie Leblanc' },
    { nom: 'Plan_masse_Erables.pdf', type_document: 'plan', tags: ['architecture', 'masse'], taille_ko: 8900, mime_type: 'application/pdf', site_id: sites[0].id, uploaded_by: 'Jean Dupont' },
    { nom: 'Rapport_controle_ascenseur_2026.pdf', type_document: 'rapport_controle', tags: ['ascenseur', 'contrôle'], taille_ko: 1234, mime_type: 'application/pdf', batiment_id: batiments[0].id, uploaded_by: 'Otis Maintenance' },
    { nom: 'Bail_logement_002.pdf', type_document: 'bail', tags: ['bail', 'logement'], taille_ko: 456, mime_type: 'application/pdf', batiment_id: batiments[0].id, uploaded_by: 'Administrateur' },
    { nom: 'Contrat_chauffage_2026.pdf', type_document: 'contrat', tags: ['chauffage', 'contrat'], taille_ko: 678, mime_type: 'application/pdf', batiment_id: batiments[0].id, uploaded_by: 'Administrateur' },
    { nom: 'Facture_reparation_chaudiere.pdf', type_document: 'facture', tags: ['chaudière', 'facture'], taille_ko: 234, mime_type: 'application/pdf', batiment_id: batiments[1].id, uploaded_by: 'Thermo Services' },
    { nom: 'DTA_BatimentB_2024.pdf', type_document: 'DTA', tags: ['amiante', 'diagnostic'], taille_ko: 3200, mime_type: 'application/pdf', batiment_id: batiments[1].id, uploaded_by: 'Cabinet Expertise' },
  ]);
}
