
/*
  # Seed ERP demo data — uses real Ferry Jules UUID, adds 4 more ERPs without FK constraints
*/

-- ─── Additional ERPs (NULL site/residence to avoid FK errors) ─────────────────

INSERT INTO erp (id, nom, categorie_erp, type_erp, capacite, adresse, responsable_securite, email_responsable, coordonnees_secours, date_mise_en_service, organisme_controle, contrat_controle_ref)
VALUES
  ('e1000001-ea11-4000-a000-000000000001','Résidence Jacques Cavalier','5eme','R',320,'12 Rue de la Buire, 69006 Lyon','Dupont Jean','jean.dupont@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 01','1985-09-01','SOCOTEC','SOCO-2026-0142'),
  ('e1000002-ea11-4000-a000-000000000002','Résidence Jussieu','4eme','R',580,'20 Avenue Lacassagne, 69003 Lyon','Martin Sophie','sophie.martin@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 02','1972-01-15','APAVE','APAVE-2026-0089'),
  ('e1000003-ea11-4000-a000-000000000003','Résidence Jean Mermoz','5eme','J',210,'8 Rue Joliot Curie, 69008 Lyon','Bernard Claire','claire.bernard@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 03','1999-09-01','Bureau Veritas','BV-2026-0231'),
  ('e1000004-ea11-4000-a000-000000000004','Resto''U Manufacture des Tabacs','3eme','N',800,'4 Cours Albert Thomas, 69008 Lyon','Leroy Pierre','pierre.leroy@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Responsable : 06 12 34 56 78','2005-03-15','SOCOTEC','SOCO-2026-0198'),
  ('e1000005-ea11-4000-a000-000000000005','Résidence Jussieu Studios','5eme','R',145,'22 Avenue Lacassagne, 69003 Lyon','Moreau Fabrice','fabrice.moreau@crous-lyon.fr','Pompiers : 18 | SAMU : 15 | Police : 17 | Gardien : 04 72 00 00 04','2011-09-01','Alpes Contrôles','AC-2026-0055')
ON CONFLICT (id) DO NOTHING;

-- ─── Contrôles ERP — Cavalier ─────────────────────────────────────────────────

INSERT INTO controles_erp (erp_id, type_controle, categorie, periodicite, date_dernier_controle, date_prochain_controle, statut, prestataire, conformite_pct, commentaire)
VALUES
  ('e1000001-ea11-4000-a000-000000000001','Vérification SSI','Sécurité incendie','mensuelle','2026-05-15','2026-06-15','conforme','SOCOTEC',100,NULL),
  ('e1000001-ea11-4000-a000-000000000001','Contrôle extincteurs','Sécurité incendie','annuelle','2026-01-10','2027-01-10','conforme','SOCOTEC',100,NULL),
  ('e1000001-ea11-4000-a000-000000000001','Vérification portes coupe-feu','Sécurité incendie','semestrielle','2026-03-01','2026-09-01','conforme','SOCOTEC',95,'1 porte avec ferme-porte à vérifier'),
  ('e1000001-ea11-4000-a000-000000000001','Contrôle installation électrique','Électricité','quinquennale','2024-06-20','2029-06-20','conforme','Bureau Veritas',100,NULL),
  ('e1000001-ea11-4000-a000-000000000001','Vérification désenfumage','Sécurité incendie','annuelle',NULL,'2026-06-30','non_realise',NULL,NULL,'À planifier'),
  ('e1000001-ea11-4000-a000-000000000001','Exercice évacuation','Sécurité incendie','annuelle','2025-10-15','2026-10-15','conforme','CROUS Interne',100,'Durée 4min30. Aucune anomalie.'),
  ('e1000001-ea11-4000-a000-000000000001','Contrôle colonnes sèches','Sécurité incendie','semestrielle','2026-02-10','2026-08-10','conforme','SOCOTEC',100,NULL),
  ('e1000001-ea11-4000-a000-000000000001','Vérification éclairage de sécurité','Sécurité incendie','mensuelle','2026-06-01','2026-07-01','conforme','SOCOTEC',100,NULL),

  -- Jussieu
  ('e1000002-ea11-4000-a000-000000000002','Vérification SSI','Sécurité incendie','mensuelle','2026-05-20','2026-06-20','conforme','APAVE',100,NULL),
  ('e1000002-ea11-4000-a000-000000000002','Contrôle extincteurs','Sécurité incendie','annuelle','2025-11-05','2026-11-05','a_venir','APAVE',NULL,'Rappel envoyé'),
  ('e1000002-ea11-4000-a000-000000000002','Vérification ascenseurs','Ascenseurs','trimestrielle','2026-03-15','2026-06-15','en_retard','OTIS',NULL,'En retard de 2 semaines'),
  ('e1000002-ea11-4000-a000-000000000002','Contrôle gaz','Gaz','annuelle','2025-09-10','2026-09-10','conforme','SOCOTEC',100,NULL),
  ('e1000002-ea11-4000-a000-000000000002','Contrôle PMR','Accessibilité','quinquennale','2023-04-12','2028-04-12','conforme','APAVE',92,'Réserves sur la rampe d''accès'),
  ('e1000002-ea11-4000-a000-000000000002','Contrôle installation électrique','Électricité','quinquennale','2022-07-14','2027-07-14','conforme','Bureau Veritas',100,NULL),
  ('e1000002-ea11-4000-a000-000000000002','Vérification désenfumage','Sécurité incendie','annuelle','2025-12-03','2026-12-03','conforme','APAVE',100,NULL),

  -- Mermoz
  ('e1000003-ea11-4000-a000-000000000003','Vérification SSI','Sécurité incendie','mensuelle','2026-05-10','2026-06-10','conforme','Bureau Veritas',100,NULL),
  ('e1000003-ea11-4000-a000-000000000003','Contrôle extincteurs','Sécurité incendie','annuelle','2025-12-18','2026-12-18','conforme','Bureau Veritas',100,NULL),
  ('e1000003-ea11-4000-a000-000000000003','Vérification éclairage sécurité','Sécurité incendie','mensuelle','2026-05-22','2026-06-22','conforme','Bureau Veritas',100,NULL),
  ('e1000003-ea11-4000-a000-000000000003','Contrôle installation électrique','Électricité','quinquennale','2021-09-05','2026-09-05','a_venir','Bureau Veritas',NULL,'Visite à programmer avant septembre'),
  ('e1000003-ea11-4000-a000-000000000003','Exercice évacuation','Sécurité incendie','annuelle','2025-11-08','2026-11-08','conforme','CROUS Interne',100,'3min58. RAS.'),

  -- Manufacture
  ('e1000004-ea11-4000-a000-000000000004','Vérification SSI','Sécurité incendie','mensuelle','2026-05-18','2026-06-18','conforme','SOCOTEC',100,NULL),
  ('e1000004-ea11-4000-a000-000000000004','Contrôle extincteurs','Sécurité incendie','annuelle','2026-02-14','2027-02-14','conforme','SOCOTEC',100,NULL),
  ('e1000004-ea11-4000-a000-000000000004','Contrôle HACCP','Cuisines collectives','annuelle','2026-04-08','2027-04-08','non_conforme','Bureau Veritas',71,'3 non-conformités majeures — plan d''action requis'),
  ('e1000004-ea11-4000-a000-000000000004','Vérification hotte et ventilation','Sécurité incendie','annuelle','2025-11-20','2026-11-20','conforme','SOCOTEC',100,NULL),
  ('e1000004-ea11-4000-a000-000000000004','Contrôle gaz cuisines','Gaz','annuelle','2026-01-15','2027-01-15','conforme','SOCOTEC',100,NULL),
  ('e1000004-ea11-4000-a000-000000000004','Contrôle ERP (commission de sécurité)','Commission de sécurité','triennale','2024-10-22','2027-10-22','conforme','Préfecture du Rhône',100,'Avis favorable sans réserve'),
  ('e1000004-ea11-4000-a000-000000000004','Vérification portes coupe-feu','Sécurité incendie','semestrielle','2026-01-08','2026-07-08','a_venir','SOCOTEC',NULL,'Prévu le 02/07/2026'),

  -- Jussieu Studios
  ('e1000005-ea11-4000-a000-000000000005','Vérification SSI','Sécurité incendie','mensuelle','2026-04-28','2026-05-28','en_retard','Alpes Contrôles',NULL,'Prestataire absent — à replanifier'),
  ('e1000005-ea11-4000-a000-000000000005','Contrôle extincteurs','Sécurité incendie','annuelle','2026-03-02','2027-03-02','conforme','Alpes Contrôles',100,NULL),
  ('e1000005-ea11-4000-a000-000000000005','Vérification éclairage sécurité','Sécurité incendie','mensuelle','2026-04-30','2026-05-30','en_retard','Alpes Contrôles',NULL,'À replanifier en urgence'),

  -- Ferry Jules (real UUID)
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','Vérification SSI','Sécurité incendie','mensuelle','2026-06-10','2026-07-10','conforme','DEKRA',100,NULL),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','Contrôle extincteurs','Sécurité incendie','annuelle','2026-03-15','2027-03-15','conforme','DEKRA',100,NULL),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','Vérification éclairage sécurité','Sécurité incendie','mensuelle','2026-06-05','2026-07-05','conforme','DEKRA',100,NULL),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','Contrôle installation électrique','Électricité','quinquennale','2023-09-12','2028-09-12','conforme','Bureau Veritas',100,NULL),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','Vérification portes coupe-feu','Sécurité incendie','semestrielle',NULL,'2026-07-15','non_realise',NULL,NULL,'Prévoir avant la rentrée'),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','Contrôle PMR','Accessibilité','quinquennale','2022-05-20','2027-05-20','conforme','Alpes Contrôles',88,'Rampe d''accès cantine conforme. Signalétique à renforcer.'),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','Exercice évacuation','Sécurité incendie','annuelle','2025-10-02','2026-10-02','conforme','CROUS Interne',100,'4min12. Tous les élèves évacués sans incident.');

-- ─── Incidents ERP ────────────────────────────────────────────────────────────

INSERT INTO incidents_erp (erp_id, reference, type_incident, date_incident, lieu, description, personnes_impliquees, degats_materiels, degats_description, actions_immediates, statut, responsable)
VALUES
  -- Cavalier
  ('e1000001-ea11-4000-a000-000000000001','INC-2026-001','ssi_intempestif','2026-05-25 14:30:00+02','Couloir 2ème étage, Bât. A','Déclenchement intempestif alarme SSI suite à vapeurs de cuisine. Évacuation partielle. Aucun incendie réel.','Agent Dupont Jean, 42 résidents évacués',false,NULL,'Réarmement SSI. Ventilation couloir. Vérification détecteurs ioniques.','cloture','Dupont Jean'),
  ('e1000001-ea11-4000-a000-000000000001','INC-2026-002','panne_extincteur','2026-05-26 09:15:00+02','Couloir RDC, près de l''ascenseur','Extincteur CO2 EXT-RDC-03 hors service. Bouton de percussion bloqué, pression insuffisante.','Agent maintenance Martin Sophie',false,NULL,'Extincteur isolé et signalisé. Signalement SOCOTEC.','en_cours','Martin Sophie'),
  ('e1000001-ea11-4000-a000-000000000001','INC-2026-003','exercice_evacuation','2026-05-20 10:00:00+02','Ensemble de la résidence','Exercice annuel d''évacuation. Total en 4 min 30 sec. Point de rassemblement atteint conforme.','287 résidents, 8 agents CROUS',false,NULL,'RAS. Compte-rendu rédigé et archivé.','cloture','Dupont Jean'),
  ('e1000001-ea11-4000-a000-000000000001','INC-2026-004','porte_coupe_feu','2026-04-12 08:45:00+02','Couloir 4ème étage, Bât. B','Porte coupe-feu CF 60 ne se referme plus automatiquement. Cale détectée sous la porte.','Ronde agent Petit Robert',false,NULL,'Retrait de la cale. Consignation. Contact prestataire.','cloture','Dupont Jean'),

  -- Jussieu
  ('e1000002-ea11-4000-a000-000000000002','INC-2026-005','panne_eclairage','2026-05-15 22:45:00+02','Cage escalier B, étages 3 à 6','Panne éclairage de sécurité cage escalier B. 4 blocs autonomes non-fonctionnels en ronde de nuit.','Agent de nuit Laurent E.',false,NULL,'Signalisation temporaire. Vérification gaine montante.','en_cours','Martin Sophie'),
  ('e1000002-ea11-4000-a000-000000000002','INC-2026-006','ssi_intempestif','2026-03-08 03:22:00+01','Hall d''entrée principal','Déclenchement alarme incendie à 3h22 du matin. Origine : détecteur optique encrassé en loge gardien.','Agent gardien Lemaire T., 320 résidents évacués',false,NULL,'Évacuation complète. Réarmement après inspection SDIS. Remplacement détecteur.','cloture','Martin Sophie'),

  -- Manufacture
  ('e1000004-ea11-4000-a000-000000000004','INC-2026-007','autre','2026-04-28 11:30:00+02','Cuisine froide, zone légumes','Non-conformité HACCP : température chambre froide légumes à +8°C au lieu de +4°C max.','Responsable cuisine Moreau F., Inspecteur BV',true,'Perte de denrées évaluée à 420€','Vider chambre froide. Relevé T° toutes 2h. Appel technicien réfrigération.','en_cours','Leroy Pierre'),
  ('e1000004-ea11-4000-a000-000000000004','INC-2026-008','fuite_gaz','2026-02-19 07:15:00+01','Local technique gaz, entrée cuisine','Odeur de gaz signalée par cuisinier. Fuite détectée sur raccord flexible vétuste devant piano de cuisson.','Cuisinier Roux D., Technicien GrDF',false,NULL,'Coupure gaz principale. Aération forcée. Intervention GrDF. Piano hors service 4h.','cloture','Leroy Pierre'),

  -- Jussieu Studios
  ('e1000005-ea11-4000-a000-000000000005','INC-2026-009','panne_extincteur','2026-06-01 14:00:00+02','RDC couloir principal','Extincteur eau EXT-001 : manomètre en zone rouge. Pression insuffisante constatée lors de la vérification mensuelle.','Agent Fontaine B.',false,NULL,'Extincteur retiré et remplacé par réserve. Commande passée.','en_cours','Moreau Fabrice'),

  -- Ferry Jules
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','INC-2026-010','exercice_evacuation','2026-06-03 10:00:00+02','École entière','Exercice d''évacuation incendie annuel. Toutes les classes évacuées en 4min12. Point de rassemblement sur parking.','280 élèves, 18 enseignants, 4 agents CROUS',false,NULL,'Compte-rendu rédigé. Fiche signée par directeur et responsable sécurité CROUS.','cloture','Bernard F.'),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','INC-2026-011','ssi_intempestif','2026-05-14 12:30:00+02','Salle de restauration — hotte centrale','Déclenchement SSI lors du service du déjeuner. Fumées cuisines. Évacuation partielle des élèves.','220 élèves, personnels restauration',false,NULL,'Réarmement. Vérification sensibilité détecteurs proximité hotte. Réglage en cours.','en_cours','Bernard F.');

-- ─── Grab incident IDs for action FK references ───────────────────────────────

-- Actions correctives — using subqueries for incident references
INSERT INTO actions_correctives_erp (erp_id, reference, description, responsable, date_limite, statut, priorite, commentaire, ot_gmao_ref)
VALUES
  -- Cavalier
  ('e1000001-ea11-4000-a000-000000000001','AC-2026-001','Remplacer extincteur CO2 EXT-RDC-03 hors service (couloir RDC)','SOCOTEC','2026-06-10','en_cours',3,'Commande passée 26/05. Livraison prévue 28/05.','OT-2026-0542'),
  ('e1000001-ea11-4000-a000-000000000001','AC-2026-002','Vérifier et remplacer détecteurs ioniques proches cuisines (Bât. A, 2ème étage)','SOCOTEC','2026-07-15','ouvert',2,NULL,NULL),
  ('e1000001-ea11-4000-a000-000000000001','AC-2026-003','Planifier vérification annuelle du désenfumage (Rés. Cavalier)','SOCOTEC','2026-06-30','ouvert',2,'À planifier semaine 26',NULL),
  ('e1000001-ea11-4000-a000-000000000001','AC-2026-004','Remplacer ferme-porte défectueux porte coupe-feu CF-B402','Maintenance interne CROUS','2026-07-01','termine',1,'Pièce remplacée le 18/04/2026.',NULL),

  -- Jussieu
  ('e1000002-ea11-4000-a000-000000000002','AC-2026-005','Remplacer les 4 blocs autonomes d''éclairage défectueux — cage escalier B','Maintenance interne CROUS','2026-05-29','en_cours',3,'Pièces commandées. Intervention prévue 28/05.','OT-2026-0547'),
  ('e1000002-ea11-4000-a000-000000000002','AC-2026-006','Planifier contrôle trimestriel ascenseurs en retard (Rés. Jussieu)','OTIS','2026-06-07','ouvert',2,'Contact OTIS 26/05. En attente confirmation créneau.',NULL),
  ('e1000002-ea11-4000-a000-000000000002','AC-2026-007','Remplacement détecteur optique encrassé en loge gardien','APAVE','2026-03-15','termine',2,'Remplacement effectué lors de l''intervention post-incident INC-006.','OT-2026-0489'),

  -- Manufacture
  ('e1000004-ea11-4000-a000-000000000004','AC-2026-008','Mettre en conformité chambre froide légumes : révision groupe frigorifique + re-calibrage sonde','Technicien Froid Plus','2026-06-10','en_cours',4,'Technicien intervenu 28/04 : joint remplacé. Contre-visite BV prévue.','OT-2026-0531'),
  ('e1000004-ea11-4000-a000-000000000004','AC-2026-009','Former à nouveau le personnel cuisine aux procédures HACCP','Responsable cuisine CROUS','2026-07-31','ouvert',2,'Session formation prévue début juillet.',NULL),
  ('e1000004-ea11-4000-a000-000000000004','AC-2026-010','Remplacement raccord flexible gaz défectueux devant piano de cuisson N°2','GrDF / Plombier chauffagiste','2026-02-25','termine',4,'Raccord remplacé par GrDF le 19/02. Contrôle étanchéité OK.','OT-2026-0412'),
  ('e1000004-ea11-4000-a000-000000000004','AC-2026-011','Lever les 3 non-conformités HACCP : température, traçabilité, étiquetage','Chef de cuisine / CROUS','2026-08-31','ouvert',3,'Plan d''action soumis à BV le 15/05. Contre-visite planifiée fin août.',NULL),

  -- Jussieu Studios
  ('e1000005-ea11-4000-a000-000000000005','AC-2026-012','Replanifier vérification SSI mensuelle en retard (Jussieu Studios)','Alpes Contrôles','2026-06-05','ouvert',3,'Nouveau créneau proposé le 03/06/2026.',NULL),
  ('e1000005-ea11-4000-a000-000000000005','AC-2026-013','Replanifier vérification éclairage de sécurité en retard','Alpes Contrôles','2026-06-10','ouvert',3,'Groupé avec AC-012 lors de la prochaine visite.',NULL),
  ('e1000005-ea11-4000-a000-000000000005','AC-2026-014','Remplacer extincteur eau EXT-001 hors pression (RDC)','Alpes Contrôles','2026-06-15','en_cours',2,'Pièce de remplacement en cours de livraison.','OT-2026-0601'),

  -- Ferry Jules
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','AC-2026-015','Planifier vérification semestrielle portes coupe-feu (avant rentrée scolaire)','DEKRA','2026-08-20','ouvert',2,'À effectuer pendant les vacances d''été.',NULL),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','AC-2026-016','Régler sensibilité détecteurs SSI proximité hotte restauration scolaire','DEKRA','2026-06-30','en_cours',3,'Prestataire contacté. Intervention prévue semaine 27.','OT-2026-0612'),
  ('56b4fd93-a9e7-466e-9f88-cf175b96fc23','AC-2026-017','Renforcer signalétique PMR salle de restauration et couloir accès','Maintenance interne CROUS','2026-07-15','ouvert',1,'Devis commandé. Pose prévue vacances.',NULL);
