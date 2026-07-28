/*
  # Seed événements — Résidence Cavalier (tous équipements) + Scores renouvellement
*/

DO $$
DECLARE
  eq_asc  uuid := '5b4893c7-eff4-4773-80e5-17df95a205c2';
  eq_cha  uuid := 'd954801f-d1a1-441d-97bd-7fc3328839c2';
  eq_ecs  uuid := '23e6f181-12f3-4f25-931a-ff7c338fc839';
  eq_ele  uuid := 'f3384475-deac-4e5c-8462-7d0e44bbf2a8';
  eq_ssi  uuid := '93246a97-600f-4e58-b677-fa5a64cee8e7';
  eq_vmc  uuid := '14c63fb6-ca8f-42e7-b531-c6da3b1b8c01';
  eq_str  uuid := '515c282e-8e5b-4223-99a4-2f1345f37611';
  eq_arm  uuid := 'c3000001-0000-0000-0000-000000000001';
  cav_id  uuid := 'b1000001-0000-0000-0000-000000000011';
BEGIN

-- ASCENSEUR
INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne, rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel, statut, responsable, prestataire, cout_intervention, gravite, impact_service, observations) VALUES
(eq_asc, cav_id, 'panne', 'Arret ascenseur porte paliere R+3 bloquee', true, true, 100, '2022-04-18 08:00'::timestamptz, '2022-04-18 14:00'::timestamptz, 'termine', 'Leroy P.', 'KONE Maintenance', 480.00, 'majeure', 'fort', 'Capteur porte palier defaillant. Intervention KONE urgente.'),
(eq_asc, cav_id, 'maintenance_preventive', 'Visite annuelle reglementaire KONE', false, false, 0, '2022-10-12 09:00'::timestamptz, '2022-10-12 12:00'::timestamptz, 'termine', 'Leroy P.', 'KONE Maintenance', 650.00, 'mineure', 'faible', 'Visite reglementaire. RAS.'),
(eq_asc, cav_id, 'panne', 'Blocage cabine entre R+1 et R+2', true, true, 100, '2023-07-03 18:30'::timestamptz, '2023-07-03 20:00'::timestamptz, 'termine', 'Bernard C.', 'KONE Maintenance', 380.00, 'critique', 'critique', 'Occupants bloques 1h30. Cable de securite desserr.'),
(eq_asc, cav_id, 'maintenance_preventive', 'Visite annuelle reglementaire KONE', false, false, 0, '2023-10-08 09:00'::timestamptz, '2023-10-08 12:00'::timestamptz, 'termine', 'Leroy P.', 'KONE Maintenance', 650.00, 'mineure', 'faible', 'Remplacement guides usure. Age mecanique 9 ans.'),
(eq_asc, cav_id, 'panne', 'Defaut variateur arret complet', true, true, 100, '2024-09-16 07:00'::timestamptz, '2024-09-16 16:00'::timestamptz, 'termine', 'Moreau F.', 'KONE Maintenance', 1200.00, 'critique', 'critique', 'Variateur de frequence defaillant. Piece commandee. Ascenseur HS 9h.'),
(eq_asc, cav_id, 'maintenance_preventive', 'Visite annuelle reglementaire KONE', false, false, 0, '2024-10-14 09:00'::timestamptz, '2024-10-14 12:30'::timestamptz, 'termine', 'Leroy P.', 'KONE Maintenance', 650.00, 'mineure', 'faible', 'Machine vieillissante 10 ans. Recommandation etude modernisation.'),
(eq_asc, cav_id, 'panne', 'Panne portes automatiques coincees ouvertes', true, true, 60, '2025-03-20 14:00'::timestamptz, '2025-03-20 17:00'::timestamptz, 'termine', 'Roux P.', 'KONE Maintenance', 290.00, 'majeure', 'fort', 'Motoreducteur porte HS. Ascenseur partiellement utilisable.'),
(eq_asc, cav_id, 'maintenance_preventive', 'Visite annuelle reglementaire KONE', false, false, 0, '2025-10-06 09:00'::timestamptz, '2025-10-06 12:30'::timestamptz, 'termine', 'Leroy P.', 'KONE Maintenance', 650.00, 'mineure', 'faible', '11 ans. 4 pannes en 4 ans. Remplacement recommande horizon 2028.');

-- CHAUFFAGE
INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne, rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel, statut, responsable, prestataire, cout_intervention, gravite, impact_service, observations) VALUES
(eq_cha, cav_id, 'panne', 'Defaut regulation chauffage absence chauffe', true, true, 100, '2022-01-12 06:00'::timestamptz, '2022-01-12 11:00'::timestamptz, 'termine', 'Bernard C.', 'Danfoss Services', 420.00, 'critique', 'critique', 'Vanne 3 voies bloquee fermee. Residence sans chauffage 5h en janvier.'),
(eq_cha, cav_id, 'maintenance_preventive', 'Maintenance preventive annuelle chaufferie', false, false, 0, '2022-09-20 09:00'::timestamptz, '2022-09-20 13:00'::timestamptz, 'termine', 'Bernard C.', 'Danfoss Services', 520.00, 'mineure', 'faible', 'Purge circuit, verification echangeur, test vannes. RAS.'),
(eq_cha, cav_id, 'panne', 'Fuite sur bypass sous-station', true, true, 30, '2023-02-28 10:00'::timestamptz, '2023-02-28 14:30'::timestamptz, 'termine', 'Moreau F.', 'Danfoss Services', 290.00, 'majeure', 'moyen', 'Fuite raccord compression. Reparation.'),
(eq_cha, cav_id, 'maintenance_preventive', 'Maintenance preventive annuelle chaufferie', false, false, 0, '2023-09-18 09:00'::timestamptz, '2023-09-18 13:00'::timestamptz, 'termine', 'Bernard C.', 'Danfoss Services', 520.00, 'mineure', 'faible', 'Remplacement joints flexibles. Echangeur legerement entartre.'),
(eq_cha, cav_id, 'maintenance_preventive', 'Maintenance preventive annuelle chaufferie', false, false, 0, '2024-09-16 09:00'::timestamptz, '2024-09-16 13:30'::timestamptz, 'termine', 'Bernard C.', 'Danfoss Services', 520.00, 'mineure', 'faible', 'Detartrage echangeur primaire. Performance nominale retrouvee.'),
(eq_cha, cav_id, 'maintenance_preventive', 'Maintenance preventive annuelle chaufferie', false, false, 0, '2025-09-22 09:00'::timestamptz, '2025-09-22 13:30'::timestamptz, 'termine', 'Leroy P.', 'Danfoss Services', 520.00, 'mineure', 'faible', 'Bilan 12 ans. Equipement en bon etat. Horizon renouvellement 2030.');

-- ECS
INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne, rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel, statut, responsable, prestataire, cout_intervention, gravite, impact_service, observations) VALUES
(eq_ecs, cav_id, 'panne', 'Panne resistance ballon ECS eau froide', true, true, 100, '2022-06-08 05:30'::timestamptz, '2022-06-08 13:00'::timestamptz, 'termine', 'Moreau F.', 'Atlantic SAV', 380.00, 'critique', 'fort', 'Resistance grillee eau froide 7h. Remplacement immediat.'),
(eq_ecs, cav_id, 'maintenance_preventive', 'Detartrage ballon ECS anode sacrificielle', false, false, 0, '2022-10-04 10:00'::timestamptz, '2022-10-04 13:00'::timestamptz, 'termine', 'Leroy P.', 'Atlantic SAV', 280.00, 'mineure', 'faible', 'Tartre important ballon age 8 ans.'),
(eq_ecs, cav_id, 'panne', 'Thermostat securite declenche eau froide', true, true, 100, '2023-08-17 06:00'::timestamptz, '2023-08-17 10:30'::timestamptz, 'termine', 'Moreau F.', 'Atlantic SAV', 240.00, 'critique', 'fort', 'Declenchement thermique suite ecaille sur resistance. Remplacement resistance.'),
(eq_ecs, cav_id, 'maintenance_preventive', 'Detartrage annuel controle legionelles', false, false, 0, '2023-10-10 09:00'::timestamptz, '2023-10-10 12:00'::timestamptz, 'termine', 'Leroy P.', 'Atlantic SAV', 320.00, 'mineure', 'faible', '9 ans tartre severe. Ballon a surveiller.'),
(eq_ecs, cav_id, 'panne', 'Fuite vanne securite inondation local', true, true, 100, '2024-05-29 08:00'::timestamptz, '2024-05-29 16:00'::timestamptz, 'termine', 'Bernard C.', 'Atlantic SAV', 580.00, 'critique', 'fort', 'Vanne de securite HS inondation local technique. Reparation sechage 8h.'),
(eq_ecs, cav_id, 'maintenance_preventive', 'Bilan complet evaluation remplacement', false, false, 0, '2024-10-08 09:00'::timestamptz, '2024-10-08 14:00'::timestamptz, 'termine', 'Leroy P.', 'Atlantic SAV', 350.00, 'mineure', 'faible', '10 ans. Duree vie theorique atteinte. Remplacement fortement recommande.'),
(eq_ecs, cav_id, 'panne', 'Panne thermostat surchauffe ballon 85C', true, true, 100, '2025-01-21 23:00'::timestamptz, '2025-01-22 06:00'::timestamptz, 'termine', 'Moreau F.', 'Atlantic SAV', 420.00, 'critique', 'critique', 'Surchauffe nocturne thermostat defaillant. Risque legionelles. Choc thermique declenche.');

-- TGBT
INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne, rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel, statut, responsable, prestataire, cout_intervention, gravite, impact_service, observations) VALUES
(eq_ele, cav_id, 'maintenance_preventive', 'Verification reglementaire electrique annuelle', false, false, 0, '2022-06-14 08:00'::timestamptz, '2022-06-14 17:00'::timestamptz, 'termine', 'Martin D.', 'APAVE', 1800.00, 'mineure', 'faible', 'Rapport APAVE 2 observations mineures. Aucune reserve critique.'),
(eq_ele, cav_id, 'maintenance_corrective', 'Remplacement disjoncteur R+2 declenchement repete', false, false, 20, '2022-09-28 14:00'::timestamptz, '2022-09-28 16:00'::timestamptz, 'termine', 'Roux P.', NULL, 85.00, 'mineure', 'moyen', 'Disjoncteur de tete R+2 vieillissant. Remplacement preventif.'),
(eq_ele, cav_id, 'maintenance_preventive', 'Verification reglementaire electrique annuelle', false, false, 0, '2023-06-19 08:00'::timestamptz, '2023-06-19 17:00'::timestamptz, 'termine', 'Martin D.', 'APAVE', 1800.00, 'mineure', 'faible', 'Rapport APAVE 1 observation cable en attente remplacement.'),
(eq_ele, cav_id, 'panne', 'Coupure secteur partielle court-circuit logements R+1', true, true, 25, '2023-11-06 20:00'::timestamptz, '2023-11-06 22:30'::timestamptz, 'termine', 'Bernard C.', NULL, 140.00, 'majeure', 'fort', 'Court-circuit sur derivation R+1. 12 logements sans courant 2h30.'),
(eq_ele, cav_id, 'maintenance_preventive', 'Verification reglementaire electrique annuelle', false, false, 0, '2024-06-10 08:00'::timestamptz, '2024-06-10 17:00'::timestamptz, 'termine', 'Martin D.', 'APAVE', 1800.00, 'mineure', 'faible', 'RAS. Mise a jour schemas electriques realisee.'),
(eq_ele, cav_id, 'maintenance_preventive', 'Verification reglementaire electrique annuelle', false, false, 0, '2025-06-09 08:00'::timestamptz, '2025-06-09 17:00'::timestamptz, 'termine', 'Martin D.', 'APAVE', 1800.00, 'mineure', 'faible', '11 ans. TGBT en bon etat. Remplacement estime 2032.');

-- SSI
INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne, rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel, statut, responsable, prestataire, cout_intervention, gravite, impact_service, observations) VALUES
(eq_ssi, cav_id, 'maintenance_preventive', 'Verification SSI annuelle reglementaire', false, false, 0, '2022-05-16 09:00'::timestamptz, '2022-05-16 16:00'::timestamptz, 'termine', 'Dupont A.', 'SOCOTEC', 1400.00, 'mineure', 'faible', 'Rapport SOCOTEC 3 detecteurs a remplacer. Declenchement SSI teste OK.'),
(eq_ssi, cav_id, 'maintenance_corrective', 'Remplacement 3 detecteurs fumee defaillants', false, false, 0, '2022-07-04 10:00'::timestamptz, '2022-07-04 13:00'::timestamptz, 'termine', 'Dupont A.', 'NOTIFIER SAV', 360.00, 'mineure', 'faible', 'Suite rapport SOCOTEC. Detecteurs R+1 et R+3.'),
(eq_ssi, cav_id, 'panne', 'Declenchement intempestif SSI alarme generale', true, true, 100, '2023-03-14 03:00'::timestamptz, '2023-03-14 04:30'::timestamptz, 'termine', 'Dupont A.', 'NOTIFIER SAV', 280.00, 'critique', 'critique', 'Declenchement nocturne intempestif evacuation residence. Detecteur R+4 defaillant.'),
(eq_ssi, cav_id, 'maintenance_preventive', 'Verification SSI annuelle reglementaire', false, false, 0, '2023-05-22 09:00'::timestamptz, '2023-05-22 16:00'::timestamptz, 'termine', 'Dupont A.', 'SOCOTEC', 1400.00, 'mineure', 'faible', 'Rapport SOCOTEC centrale SSI 9 ans remplacement recommande.'),
(eq_ssi, cav_id, 'maintenance_preventive', 'Verification SSI annuelle reglementaire', false, false, 0, '2024-05-20 09:00'::timestamptz, '2024-05-20 16:00'::timestamptz, 'termine', 'Dupont A.', 'SOCOTEC', 1400.00, 'mineure', 'faible', '10 ans duree de vie theorique atteinte. Mise en conformite obligatoire.'),
(eq_ssi, cav_id, 'panne', 'Defaut centrale SSI boucle 2 alarme permanente', true, true, 0, '2025-02-04 09:00'::timestamptz, '2025-02-04 16:00'::timestamptz, 'termine', 'Dupont A.', 'NOTIFIER SAV', 640.00, 'critique', 'fort', 'Carte boucle 2 defaillante 11 ans. Remplacement carte urgente.'),
(eq_ssi, cav_id, 'maintenance_preventive', 'Verification SSI annuelle reglementaire', false, false, 0, '2025-05-19 09:00'::timestamptz, '2025-05-19 16:00'::timestamptz, 'termine', 'Dupont A.', 'Bureau Veritas', 1400.00, 'mineure', 'faible', '11 ans. Commission securite exige remplacement avant 2027.');

-- VMC
INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne, rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel, statut, responsable, prestataire, cout_intervention, gravite, impact_service, observations) VALUES
(eq_vmc, cav_id, 'maintenance_preventive', 'Entretien annuel VMC nettoyage filtres', false, false, 0, '2022-04-05 09:00'::timestamptz, '2022-04-05 12:00'::timestamptz, 'termine', 'Roux P.', 'ALDES Services', 380.00, 'mineure', 'faible', 'Filtres nettoyes. Debit nominal verifie.'),
(eq_vmc, cav_id, 'panne', 'Extracteur VMC en panne courroie cassee', true, true, 100, '2022-11-28 11:00'::timestamptz, '2022-11-28 14:30'::timestamptz, 'termine', 'Roux P.', 'ALDES Services', 180.00, 'majeure', 'moyen', 'Courroie entrainement cassee. Remplacement reglage tension.'),
(eq_vmc, cav_id, 'maintenance_preventive', 'Entretien annuel VMC nettoyage mesures', false, false, 0, '2023-04-11 09:00'::timestamptz, '2023-04-11 12:30'::timestamptz, 'termine', 'Roux P.', 'ALDES Services', 380.00, 'mineure', 'faible', 'Bouches encrassees nettoyage HP. Debit legerement insuffisant.'),
(eq_vmc, cav_id, 'panne', 'Defaut moteur extracteur roulements uses', true, true, 100, '2024-06-03 08:00'::timestamptz, '2024-06-03 15:00'::timestamptz, 'termine', 'Roux P.', 'ALDES Services', 420.00, 'critique', 'moyen', 'Roulements moteur uses bruit vibrations. Remplacement moteur complet.'),
(eq_vmc, cav_id, 'maintenance_preventive', 'Entretien annuel VMC bilan 10 ans', false, false, 0, '2024-04-15 09:00'::timestamptz, '2024-04-15 13:00'::timestamptz, 'termine', 'Roux P.', 'ALDES Services', 380.00, 'mineure', 'faible', '10 ans. Machine fiable mais approche fin duree de vie 15 ans.'),
(eq_vmc, cav_id, 'maintenance_preventive', 'Entretien annuel VMC', false, false, 0, '2025-04-14 09:00'::timestamptz, '2025-04-14 13:00'::timestamptz, 'termine', 'Roux P.', 'ALDES Services', 380.00, 'mineure', 'faible', '11 ans. Efficacite energetique degradee. Remplacement recommande 2028.');

-- SCORES RENOUVELLEMENT
INSERT INTO scores_renouvellement (equipement_id, score_patrimonial, score_exploitation, score_risque, score_global, niveau, duree_vie_theorique, annee_previsionnelle, capex_estime, notes)
VALUES
(eq_arm, 72, 68, 82, 74, 'remplacement_prioritaire', 15, 2027, 8500.00, '7 pannes en 4 ans. Compresseur remplace 2025. Carte controleur 2023. Recommandation remplacement 2027.'),
(eq_asc, 58, 65, 78, 65, 'risque_eleve', 20, 2028, 45000.00, '4 pannes dont 1 blocage occupants. Variateur remplace 2024. Age 12 ans. Modernisation recommandee 2028.'),
(eq_cha, 42, 25, 20, 28, 'surveillance', 20, 2030, 38000.00, 'Sous-station en bon etat. 1 panne mineure. Echangeur detartre 2024. Horizon renouvellement 2030.'),
(eq_ecs, 80, 82, 88, 83, 'remplacement_prioritaire', 15, 2026, 22000.00, 'Duree de vie theorique depassee. 3 pannes eau froide. Surchauffe 2025. Risque legionelles. Remplacement URGENT 2026.'),
(eq_ele, 35, 18, 24, 22, 'surveillance', 25, 2032, 55000.00, 'TGBT recent par rapport duree de vie. 1 court-circuit mineur. Verifications reglementaires a jour. Horizon 2032.'),
(eq_ssi, 85, 78, 95, 88, 'remplacement_prioritaire', 12, 2026, 28000.00, 'Age = duree de vie theorique. Commission securite exige remplacement avant 2027. Boucle defaillante 2025. URGENCE REGLEMENTAIRE.'),
(eq_vmc, 62, 52, 48, 55, 'risque_eleve', 15, 2028, 12000.00, '2 pannes mecaniques. Efficacite degradee. 3 ans avant fin duree de vie. Remplacement recommande 2028.'),
(eq_str, 28, 10, 15, 18, 'bon_etat', 30, 2035, 80000.00, 'Structure en bon etat. 12/30 ans. Aucune panne. Prochaine inspection quinquennale 2029.')
ON CONFLICT (equipement_id) DO UPDATE SET
  score_patrimonial  = EXCLUDED.score_patrimonial,
  score_exploitation = EXCLUDED.score_exploitation,
  score_risque       = EXCLUDED.score_risque,
  score_global       = EXCLUDED.score_global,
  niveau             = EXCLUDED.niveau,
  annee_previsionnelle = EXCLUDED.annee_previsionnelle,
  capex_estime       = EXCLUDED.capex_estime,
  notes              = EXCLUDED.notes,
  calculated_at      = now();

END $$;
