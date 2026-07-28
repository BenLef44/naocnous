/*
  # Seed — Compteurs, alertes et factures fluides

  Données de démonstration pour le module Conso. Fluides.
*/

-- ─── Compteurs ────────────────────────────────────────────────────────────────

INSERT INTO compteurs_fluides (id, residence_id, reference, type_fluide, localisation, type_compteur, marque, modele, date_installation, date_derniere_releve, statut_communication, niveau_batterie_pct, score_qualite_donnee, donnees_manquantes_j, protocole, actif) VALUES
('cf000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000026', 'ELC-CESAR-P01', 'electricite', 'Local technique RdC', 'principal', 'Schneider', 'iEM3255', '2021-03-15', '2026-05-28', 'connecte', 95, 98, 0, 'Télérelevé', true),
('cf000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000026', 'ELC-CESAR-S01', 'electricite', 'Communs bâtiment A', 'sous_compteur', 'Schneider', 'iEM3110', '2021-03-15', '2026-05-28', 'connecte', 88, 96, 1, 'Télérelevé', true),
('cf000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000026', 'EAU-CESAR-P01', 'eau', 'Nourrice générale', 'principal', 'Itron', 'Cyble5', '2020-06-10', '2026-05-27', 'connecte', 72, 94, 2, 'Pulse', true),
('cf000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000026', 'GAZ-CESAR-P01', 'gaz', 'Chaufferie', 'principal', 'Elster', 'BK-G16', '2019-11-20', '2026-05-25', 'batterie_faible', 18, 87, 4, 'Pulse', true),
('cf000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000026', 'CHU-CESAR-P01', 'chaleur', 'Sous-station chauffage', 'principal', 'Kamstrup', 'MULTICAL 603', '2022-01-10', '2026-05-28', 'connecte', NULL, 99, 0, 'Modbus', true),
('cf000001-0000-0000-0000-000000000006', 'b1000001-0000-0000-0000-000000000020', 'ELC-ALLIX-P01', 'electricite', 'TGBT RdC', 'principal', 'Legrand', 'EMDX3', '2020-09-01', '2026-05-28', 'connecte', NULL, 100, 0, 'Modbus', true),
('cf000001-0000-0000-0000-000000000007', 'b1000001-0000-0000-0000-000000000020', 'EAU-ALLIX-P01', 'eau', 'Comptoir eau froide', 'principal', 'Sensus', '620M', '2018-04-12', '2026-05-20', 'hors_ligne', NULL, 42, 8, 'Manuel', true),
('cf000001-0000-0000-0000-000000000008', 'b1000001-0000-0000-0000-000000000020', 'GAZ-ALLIX-P01', 'gaz', 'Chaufferie gaz', 'principal', 'Elster', 'BK-G10', '2019-02-14', '2026-05-26', 'connecte', 65, 91, 1, 'Pulse', true),
('cf000001-0000-0000-0000-000000000009', 'b1000001-0000-0000-0000-000000000018', 'ELC-AGUYE-P01', 'electricite', 'Local compt. bât. B', 'principal', 'Schneider', 'PM5320', '2023-06-15', '2026-05-28', 'connecte', NULL, 100, 0, 'Télérelevé', true),
('cf000001-0000-0000-0000-000000000010', 'b1000001-0000-0000-0000-000000000018', 'EAU-AGUYE-P01', 'eau', 'Réseau ECS', 'principal', 'Itron', 'Cyble5', '2022-03-20', '2026-05-28', 'connecte', 91, 97, 0, 'Pulse', true),
('cf000001-0000-0000-0000-000000000011', 'b1000001-0000-0000-0000-000000000018', 'CHU-AGUYE-P01', 'chaleur', 'Sous-station dist.', 'principal', 'Landis+Gyr', 'Ultraheat T550', '2021-11-08', '2026-05-22', 'anomalie', NULL, 61, 6, 'Modbus', true),
('cf000001-0000-0000-0000-000000000012', 'b1000001-0000-0000-0000-000000000017', 'ELC-LIRON-P01', 'electricite', 'Armoire électrique', 'principal', 'ABB', 'B24 112', '2022-07-19', '2026-05-28', 'connecte', NULL, 99, 0, 'Modbus', true),
('cf000001-0000-0000-0000-000000000013', 'b1000001-0000-0000-0000-000000000017', 'EAU-LIRON-P01', 'eau', 'Nourrice logements', 'principal', 'Sensus', 'iPERL', '2020-12-03', '2026-05-27', 'connecte', 55, 93, 1, 'Pulse', true),
('cf000001-0000-0000-0000-000000000014', 'b1000001-0000-0000-0000-000000000017', 'GAZ-LIRON-P01', 'gaz', 'Compteur gaz entrée', 'principal', 'Elster', 'BK-G25', '2018-08-22', '2026-05-15', 'non_communicant', NULL, 35, 14, 'Manuel', true),
('cf000001-0000-0000-0000-000000000015', 'b1000001-0000-0000-0000-000000000007', 'ELC-ALTHE-P01', 'electricite', 'TGBT Bât. principal', 'principal', 'Schneider', 'iEM3355', '2023-01-10', '2026-05-28', 'connecte', NULL, 100, 0, 'Télérelevé', true),
('cf000001-0000-0000-0000-000000000016', 'b1000001-0000-0000-0000-000000000007', 'EAU-ALTHE-P01', 'eau', 'Compteur général', 'principal', 'Itron', 'Cyble5', '2021-05-25', '2026-05-28', 'connecte', 83, 96, 0, 'Pulse', true),
('cf000001-0000-0000-0000-000000000017', 'b1000001-0000-0000-0000-000000000007', 'CHU-ALTHE-P01', 'chaleur', 'Échangeur primaire', 'principal', 'Kamstrup', 'MULTICAL 803', '2022-09-14', '2026-05-28', 'connecte', NULL, 98, 0, 'Modbus', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Alertes ──────────────────────────────────────────────────────────────────

INSERT INTO alertes_fluides (id, residence_id, compteur_id, type_fluide, type_anomalie, criticite, statut, titre, description, ecart_pct, impact_euros_mois, date_detection, action_suggeree, source) VALUES
('af000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000026', 'cf000001-0000-0000-0000-000000000003', 'eau', 'fuite_probable', 'critique', 'nouvelle',
 'Fuite eau probable — débit nocturne anormal',
 'Consommation eau enregistrée entre 02h et 05h : +42% vs moyenne nocturne des 30 derniers jours. Suspicion de fuite réseau intérieur.',
 42, 1240, '2026-05-27 03:22:00', 'Créer intervention plomberie urgente — vérifier réseau EF logements 3e étage', 'automatique'),

('af000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000018', 'cf000001-0000-0000-0000-000000000011', 'chaleur', 'derive_saisonniere', 'critique', 'nouvelle',
 'Anomalie sous-station chauffage — surconsommation +38%',
 'La consommation chaleur dépasse de 38% la courbe de chauffe théorique. Possible défaut régulateur.',
 38, 890, '2026-05-26 14:15:00', 'Vérifier régulateur sous-station — programmer visite technicien chauffagiste', 'automatique'),

('af000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000020', 'cf000001-0000-0000-0000-000000000007', 'eau', 'donnee_manquante', 'haute', 'en_analyse',
 'Compteur EAU-ALLIX-P01 hors ligne — 8 jours sans données',
 'Aucune donnée de consommation depuis le 20/05/2026. La consommation eau est estimée par interpolation.',
 NULL, 0, '2026-05-20 08:00:00', 'Envoyer technicien vérifier compteur et liaison télérelevé', 'automatique'),

('af000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000026', 'cf000001-0000-0000-0000-000000000004', 'gaz', 'compteur_hs', 'haute', 'en_analyse',
 'Batterie compteur gaz faible — 18% restant',
 'Le niveau de batterie du compteur GAZ-CESAR-P01 est critique. Risque de perte de communication imminente.',
 NULL, 0, '2026-05-25 10:30:00', 'Planifier remplacement batterie compteur gaz', 'automatique'),

('af000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000017', 'cf000001-0000-0000-0000-000000000014', 'gaz', 'donnee_manquante', 'haute', 'intervention_creee',
 'Compteur GAZ-LIRON-P01 non communicant — 14 jours sans données',
 'Le compteur gaz ne transmet plus de données. Relevé manuel effectué le 15/05.',
 NULL, 0, '2026-05-15 08:00:00', 'Remplacement module communication prévu le 05/06/2026', 'automatique'),

('af000001-0000-0000-0000-000000000006', 'b1000001-0000-0000-0000-000000000020', NULL, 'electricite', 'surconsommation', 'normale', 'nouvelle',
 'Surconsommation électricité mai 2026 — +18% vs N-1',
 'La consommation électrique de mai 2026 est supérieure de 18% à mai 2025. Aucune température exceptionnelle.',
 18, 320, '2026-05-28 07:00:00', 'Analyser postes de consommation — vérifier climatisation communs', 'automatique'),

('af000001-0000-0000-0000-000000000007', 'b1000001-0000-0000-0000-000000000007', NULL, 'electricite', 'pic_anormal', 'normale', 'resolue',
 'Pic de consommation électrique — samedi 24/05',
 'Pic de 45 kW détecté le 24/05 à 14h30 sur 2h. Confirmé comme événement ponctuel (travaux électricité communs).',
 NULL, 0, '2026-05-24 15:00:00', 'Aucune action requise — événement identifié', 'automatique'),

('af000001-0000-0000-0000-000000000008', 'b1000001-0000-0000-0000-000000000007', NULL, 'eau', 'derive_nocturne', 'info', 'nouvelle',
 'Légère hausse consommation eau nocturne — à surveiller',
 'Consommation nocturne eau en légère hausse (+8%) sur 7 derniers jours. Surveillance recommandée.',
 8, 85, '2026-05-28 06:00:00', 'Surveiller 7 jours supplémentaires avant action', 'automatique')
ON CONFLICT (id) DO NOTHING;

-- ─── Factures fluides ─────────────────────────────────────────────────────────

INSERT INTO factures_fluides (id, residence_id, type_fluide, fournisseur, reference_facture, periode_debut, periode_fin, consommation_valeur, consommation_unite, montant_ht, montant_ttc, date_emission, date_echeance, date_paiement, statut_paiement, ecart_compteur_pct, notes) VALUES
('ff000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000026', 'electricite', 'EDF', 'F-EDF-2026-0423', '2026-04-01', '2026-04-30', 48200, 'kWh', 7248, 8700, '2026-05-05', '2026-05-25', '2026-05-22', 'paye', 1.2, NULL),
('ff000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000026', 'electricite', 'EDF', 'F-EDF-2026-0524', '2026-05-01', '2026-05-31', 51400, 'kWh', 7722, 9267, '2026-06-03', '2026-06-23', NULL, 'en_attente', -0.8, NULL),
('ff000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000020', 'electricite', 'Engie', 'F-ENG-2026-0318', '2026-03-01', '2026-03-31', 62100, 'kWh', 9006, 10807, '2026-04-02', '2026-04-22', '2026-04-19', 'paye', 0, NULL),
('ff000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000020', 'electricite', 'Engie', 'F-ENG-2026-0418', '2026-04-01', '2026-04-30', 58400, 'kWh', 8470, 10164, '2026-05-03', '2026-05-23', '2026-05-20', 'paye', 0.5, NULL),
('ff000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000026', 'gaz', 'Engie', 'F-GAZ-2026-0312', '2026-03-01', '2026-03-31', 182400, 'kWh', 14228, 14228, '2026-04-05', '2026-04-25', '2026-04-22', 'paye', -2.1, NULL),
('ff000001-0000-0000-0000-000000000006', 'b1000001-0000-0000-0000-000000000026', 'gaz', 'Engie', 'F-GAZ-2026-0412', '2026-04-01', '2026-04-30', 124800, 'kWh', 9738, 9738, '2026-05-06', '2026-05-26', NULL, 'en_attente', NULL, 'Relevé estimé — batterie faible'),
('ff000001-0000-0000-0000-000000000007', 'b1000001-0000-0000-0000-000000000026', 'eau', 'Eau Métropole Lyon', 'F-EAU-2026-T1', '2026-01-01', '2026-03-31', 1840, 'm3', 9568, 11482, '2026-04-10', '2026-04-30', '2026-04-28', 'paye', 3.8, NULL),
('ff000001-0000-0000-0000-000000000008', 'b1000001-0000-0000-0000-000000000020', 'eau', 'Eau Métropole Lyon', 'F-EAU-2026-T1B', '2026-01-01', '2026-03-31', 2240, 'm3', 11648, 13978, '2026-04-10', '2026-04-30', '2026-04-29', 'paye', 0.2, NULL),
('ff000001-0000-0000-0000-000000000009', 'b1000001-0000-0000-0000-000000000026', 'chaleur', 'Dalkia', 'F-DAL-2026-0312', '2026-03-01', '2026-03-31', 284000, 'kWh', 19880, 23856, '2026-04-08', '2026-04-28', '2026-04-25', 'paye', 0, NULL),
('ff000001-0000-0000-0000-000000000010', 'b1000001-0000-0000-0000-000000000018', 'chaleur', 'Dalkia', 'F-DAL-2026-0412B', '2026-04-01', '2026-04-30', 198000, 'kWh', 13860, 16632, '2026-05-08', '2026-05-28', NULL, 'en_attente', 12.4, 'Écart suspect — compteur anomalie signalée')
ON CONFLICT (id) DO NOTHING;
