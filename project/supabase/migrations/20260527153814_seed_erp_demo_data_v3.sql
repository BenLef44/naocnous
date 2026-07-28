/*
  # Seed ERP demo data v3 — correct UUID format (8-4-4-4-12)
*/

-- ─── ERP ──────────────────────────────────────────────────────────────────────

INSERT INTO erp (id, nom, categorie_erp, type_erp, capacite, adresse, responsable_securite, email_responsable, coordonnees_secours, date_mise_en_service, organisme_controle, contrat_controle_ref, residence_id, site_id)
VALUES
  ('e1000001-ea11-4000-a000-000000000001','Résidence Jacques Cavalier','5eme','R',320,'12 Rue de la Buire, 69006 Lyon','Dupont Jean','jean.dupont@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 01','1985-09-01','SOCOTEC','SOCO-2026-0142','b1000001-0000-0000-0000-000000000011','a1000001-0000-0000-0000-000000000003'),
  ('e1000002-ea11-4000-a000-000000000002','Résidence Jussieu','4eme','R',580,'20 Avenue Lacassagne, 69003 Lyon','Martin Sophie','sophie.martin@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 02','1972-01-15','APAVE','APAVE-2026-0089','b1000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001'),
  ('e1000003-ea11-4000-a000-000000000003','Résidence Jean Mermoz','5eme','J',210,'8 Rue Joliot Curie, 69008 Lyon','Bernard Claire','claire.bernard@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 03','1999-09-01','Bureau Veritas','BV-2026-0231','b1000001-0000-0000-0000-000000000010','a1000001-0000-0000-0000-000000000002'),
  ('e1000004-ea11-4000-a000-000000000004','Resto''U Manufacture des Tabacs','3eme','N',800,'4 Cours Albert Thomas, 69008 Lyon','Leroy Pierre','pierre.leroy@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Responsable : 06 12 34 56 78','2005-03-15','SOCOTEC','SOCO-2026-0198','b2000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000004'),
  ('e1000005-ea11-4000-a000-000000000005','Résidence Jussieu Studios','5eme','R',145,'22 Avenue Lacassagne, 69003 Lyon','Moreau Fabrice','fabrice.moreau@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 04','2011-09-01','Alpes Contrôles','AC-2026-0055','b1000001-0000-0000-0000-000000000005','a1000001-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ─── Contrôles ERP ────────────────────────────────────────────────────────────

INSERT INTO controles_erp (id, erp_id, type_controle, categorie, periodicite, date_dernier_controle, date_prochain_controle, statut, prestataire, conformite_pct, commentaire)
VALUES
  -- Cavalier
  ('ce100001-ea11-4000-a000-000000000001','e1000001-ea11-4000-a000-000000000001','Vérification SSI','Sécurité incendie','mensuelle','2026-05-15','2026-06-15','conforme','SOCOTEC',100,NULL),
  ('ce100002-ea11-4000-a000-000000000002','e1000001-ea11-4000-a000-000000000001','Contrôle extincteurs','Sécurité incendie','annuelle','2026-01-10','2027-01-10','conforme','SOCOTEC',100,NULL),
  ('ce100003-ea11-4000-a000-000000000003','e1000001-ea11-4000-a000-000000000001','Vérification portes coupe-feu','Sécurité incendie','semestrielle','2026-03-01','2026-09-01','conforme','SOCOTEC',95,'1 porte avec ferme-porte à vérifier'),
  ('ce100004-ea11-4000-a000-000000000004','e1000001-ea11-4000-a000-000000000001','Contrôle installation électrique','Électricité','quinquennale','2024-06-20','2029-06-20','conforme','Bureau Veritas',100,NULL),
  ('ce100005-ea11-4000-a000-000000000005','e1000001-ea11-4000-a000-000000000001','Vérification désenfumage','Sécurité incendie','annuelle',NULL,'2026-06-30','non_realise',NULL,NULL,'À planifier'),
  ('ce100006-ea11-4000-a000-000000000006','e1000001-ea11-4000-a000-000000000001','Exercice évacuation','Sécurité incendie','annuelle','2025-10-15','2026-10-15','conforme','CROUS Interne',100,'Durée 4min30. Aucune anomalie.'),
  -- Jussieu
  ('ce200001-ea11-4000-a000-000000000001','e1000002-ea11-4000-a000-000000000002','Vérification SSI','Sécurité incendie','mensuelle','2026-05-20','2026-06-20','conforme','APAVE',100,NULL),
  ('ce200002-ea11-4000-a000-000000000002','e1000002-ea11-4000-a000-000000000002','Contrôle extincteurs','Sécurité incendie','annuelle','2025-11-05','2026-11-05','a_venir','APAVE',NULL,'Rappel envoyé'),
  ('ce200003-ea11-4000-a000-000000000003','e1000002-ea11-4000-a000-000000000002','Vérification ascenseurs','Ascenseurs','trimestrielle','2026-03-15','2026-06-15','en_retard','OTIS',NULL,'En retard de 2 semaines'),
  ('ce200004-ea11-4000-a000-000000000004','e1000002-ea11-4000-a000-000000000002','Contrôle gaz','Gaz','annuelle','2025-09-10','2026-09-10','conforme','SOCOTEC',100,NULL),
  ('ce200005-ea11-4000-a000-000000000005','e1000002-ea11-4000-a000-000000000002','Contrôle PMR','Accessibilité','quinquennale','2023-04-12','2028-04-12','conforme','APAVE',92,'Réserves sur la rampe d''accès'),
  -- Mermoz
  ('ce300001-ea11-4000-a000-000000000001','e1000003-ea11-4000-a000-000000000003','Vérification SSI','Sécurité incendie','mensuelle','2026-05-10','2026-06-10','conforme','Bureau Veritas',100,NULL),
  ('ce300002-ea11-4000-a000-000000000002','e1000003-ea11-4000-a000-000000000003','Contrôle extincteurs','Sécurité incendie','annuelle','2025-12-18','2026-12-18','conforme','Bureau Veritas',100,NULL),
  ('ce300003-ea11-4000-a000-000000000003','e1000003-ea11-4000-a000-000000000003','Vérification éclairage sécurité','Sécurité incendie','mensuelle','2026-05-22','2026-06-22','conforme','Bureau Veritas',100,NULL),
  -- Manufacture
  ('ce400001-ea11-4000-a000-000000000001','e1000004-ea11-4000-a000-000000000004','Vérification SSI','Sécurité incendie','mensuelle','2026-05-18','2026-06-18','conforme','SOCOTEC',100,NULL),
  ('ce400002-ea11-4000-a000-000000000002','e1000004-ea11-4000-a000-000000000004','Contrôle extincteurs','Sécurité incendie','annuelle','2026-02-14','2027-02-14','conforme','SOCOTEC',100,NULL),
  ('ce400003-ea11-4000-a000-000000000003','e1000004-ea11-4000-a000-000000000004','Contrôle HACCP','Cuisines collectives','annuelle','2026-04-08','2027-04-08','non_conforme','Bureau Veritas',71,'3 non-conformités majeures — plan d''action requis'),
  ('ce400004-ea11-4000-a000-000000000004','e1000004-ea11-4000-a000-000000000004','Vérification hotte et ventilation','Sécurité incendie','annuelle','2025-11-20','2026-11-20','conforme','SOCOTEC',100,NULL),
  ('ce400005-ea11-4000-a000-000000000005','e1000004-ea11-4000-a000-000000000004','Contrôle gaz cuisines','Gaz','annuelle','2026-01-15','2027-01-15','conforme','SOCOTEC',100,NULL),
  -- Jussieu Studios
  ('ce500001-ea11-4000-a000-000000000001','e1000005-ea11-4000-a000-000000000005','Vérification SSI','Sécurité incendie','mensuelle','2026-04-28','2026-05-28','en_retard','Alpes Contrôles',NULL,'Prestataire absent — à replanifier'),
  ('ce500002-ea11-4000-a000-000000000002','e1000005-ea11-4000-a000-000000000005','Contrôle extincteurs','Sécurité incendie','annuelle','2026-03-02','2027-03-02','conforme','Alpes Contrôles',100,NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── Incidents ERP ────────────────────────────────────────────────────────────

INSERT INTO incidents_erp (id, erp_id, reference, type_incident, date_incident, lieu, description, personnes_impliquees, degats_materiels, degats_description, actions_immediates, statut, responsable)
VALUES
  ('aa000001-ea11-4000-a000-000000000001','e1000001-ea11-4000-a000-000000000001','INC-2026-001','ssi_intempestif','2026-05-25 14:30:00+02','Couloir 2ème étage, Bât. A','Déclenchement intempestif alarme SSI suite à vapeurs de cuisine. Évacuation partielle. Aucun incendie réel.','Agent Dupont Jean, 42 résidents évacués',false,NULL,'Réarmement SSI. Ventilation couloir. Vérification détecteurs ioniques.','cloture','Dupont Jean'),
  ('aa000002-ea11-4000-a000-000000000002','e1000001-ea11-4000-a000-000000000001','INC-2026-002','panne_extincteur','2026-05-26 09:15:00+02','Couloir RDC, près de l''ascenseur','Extincteur CO2 EXT-RDC-03 hors service. Bouton de percussion bloqué, pression insuffisante.','Agent maintenance Martin Sophie',false,NULL,'Extincteur isolé et signalisé. Signalement SOCOTEC.','en_cours','Martin Sophie'),
  ('aa000003-ea11-4000-a000-000000000003','e1000001-ea11-4000-a000-000000000001','INC-2026-003','exercice_evacuation','2026-05-20 10:00:00+02','Ensemble de la résidence','Exercice annuel d''évacuation. Total en 4 min 30 sec. Point de rassemblement atteint conforme.','287 résidents, 8 agents CROUS',false,NULL,'RAS. Compte-rendu rédigé et archivé.','cloture','Dupont Jean'),
  ('aa000004-ea11-4000-a000-000000000004','e1000002-ea11-4000-a000-000000000002','INC-2026-004','panne_eclairage','2026-05-15 22:45:00+02','Cage escalier B, étages 3 à 6','Panne éclairage de sécurité cage escalier B. 4 blocs autonomes non-fonctionnels en ronde de nuit.','Agent de nuit Laurent E.',false,NULL,'Signalisation temporaire. Vérification gaine montante.','en_cours','Laurent E.'),
  ('aa000005-ea11-4000-a000-000000000005','e1000004-ea11-4000-a000-000000000004','INC-2026-005','autre','2026-04-28 11:30:00+02','Cuisine froide, zone légumes','Non-conformité HACCP : température chambre froide légumes à +8°C au lieu de +4°C max.','Responsable cuisine Moreau F., Inspecteur BV',true,'Perte de denrées évaluée à 420€','Vider chambre froide. Relevé T° toutes 2h. Appel technicien réfrigération.','en_cours','Leroy Pierre')
ON CONFLICT (id) DO NOTHING;

-- ─── Actions correctives ERP ──────────────────────────────────────────────────

INSERT INTO actions_correctives_erp (id, erp_id, reference, incident_id, controle_id, description, responsable, date_limite, statut, priorite, commentaire, ot_gmao_ref)
VALUES
  ('ab000001-ea11-4000-a000-000000000001','e1000001-ea11-4000-a000-000000000001','AC-2026-001','aa000002-ea11-4000-a000-000000000002',NULL,'Remplacer extincteur CO2 EXT-RDC-03 hors service (couloir RDC)','SOCOTEC','2026-05-30','en_cours',3,'Commande passée 26/05. Livraison prévue 28/05.','OT-2026-0542'),
  ('ab000002-ea11-4000-a000-000000000002','e1000001-ea11-4000-a000-000000000001','AC-2026-002','aa000001-ea11-4000-a000-000000000001',NULL,'Vérifier et remplacer détecteurs ioniques proches cuisines (Bât. A, 2ème étage)','SOCOTEC','2026-06-15','ouvert',2,NULL,NULL),
  ('ab000003-ea11-4000-a000-000000000003','e1000001-ea11-4000-a000-000000000001','AC-2026-003',NULL,'ce100005-ea11-4000-a000-000000000005','Planifier vérification annuelle du désenfumage (Rés. Cavalier)','SOCOTEC','2026-06-30','ouvert',2,'À planifier semaine 26',NULL),
  ('ab000004-ea11-4000-a000-000000000004','e1000002-ea11-4000-a000-000000000002','AC-2026-004','aa000004-ea11-4000-a000-000000000004',NULL,'Remplacer les 4 blocs autonomes d''éclairage défectueux — cage escalier B','Maintenance interne CROUS','2026-05-29','en_cours',3,'Pièces commandées. Intervention prévue 28/05.','OT-2026-0547'),
  ('ab000005-ea11-4000-a000-000000000005','e1000002-ea11-4000-a000-000000000002','AC-2026-005',NULL,'ce200003-ea11-4000-a000-000000000003','Planifier contrôle trimestriel ascenseurs en retard (Rés. Jussieu)','OTIS','2026-06-07','ouvert',2,'Contact OTIS 26/05. En attente confirmation créneau.',NULL),
  ('ab000006-ea11-4000-a000-000000000006','e1000004-ea11-4000-a000-000000000004','AC-2026-006','aa000005-ea11-4000-a000-000000000005','ce400003-ea11-4000-a000-000000000003','Mettre en conformité chambre froide légumes : révision groupe frigorifique + re-calibrage sonde','Technicien Froid Plus','2026-06-10','en_cours',4,'Technicien intervenu 28/04 : joint remplacé. Contre-visite BV prévue.','OT-2026-0531'),
  ('ab000007-ea11-4000-a000-000000000007','e1000004-ea11-4000-a000-000000000004','AC-2026-007',NULL,'ce400003-ea11-4000-a000-000000000003','Former à nouveau le personnel cuisine aux procédures HACCP','Responsable cuisine CROUS','2026-07-31','ouvert',2,'Session formation prévue début juillet.',NULL),
  ('ab000008-ea11-4000-a000-000000000008','e1000005-ea11-4000-a000-000000000005','AC-2026-008',NULL,'ce500001-ea11-4000-a000-000000000001','Replanifier vérification SSI mensuelle en retard (Jussieu Studios)','Alpes Contrôles','2026-06-05','ouvert',3,'Nouveau créneau proposé le 03/06/2026.',NULL)
ON CONFLICT (id) DO NOTHING;
