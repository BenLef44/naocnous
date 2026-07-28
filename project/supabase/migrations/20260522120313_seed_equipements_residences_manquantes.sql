/*
  # Seed équipements pour les 23 résidences sans équipements

  ## Description
  Ajoute un jeu d'équipements représentatif pour chaque résidence du CROUS Lyon
  qui n'en avait pas encore, couvrant les 9 catégories principales.
  Chaque résidence reçoit 5 à 8 équipements selon sa taille.
*/

INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, residence_id, etat, marque, modele, date_mise_en_service, prochaine_echeance, frequence_controle, localisation_detail) VALUES

-- ─── RÉSIDENCE ALTHÉA (ALTH) ──────────────────────────────────────────────────
('ALTH-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000007','fonctionnel','OTIS','GeN2','2018-05-01','2025-05-01','annuelle','Cage principale'),
('ALTH-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000007','fonctionnel','VIESSMANN','Vitodens 200-W','2018-05-01','2025-05-01','annuelle','Chaufferie sous-sol'),
('ALTH-GAZ-001','Réseau gaz + détendeur','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000007','fonctionnel',NULL,NULL,'2018-05-01','2025-05-01','annuelle','Local gaz RDC'),
('ALTH-VMC-001','Extracteur VMC collectif','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000007','fonctionnel','ALDES','T.Flow Hygro+','2018-05-01','2025-05-01','annuelle','Toiture'),
('ALTH-SSI-001','Système Sécurité Incendie','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000007','fonctionnel','ESSER','FlexES Control','2018-05-01','2025-05-01','semestrielle','Local SSI RDC'),
('ALTH-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000007','fonctionnel','SCHNEIDER','Prisma P','2018-05-01','2025-05-01','annuelle','Local électrique sous-sol'),
('ALTH-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000007','fonctionnel','ATLANTIC','Calypso','2018-05-01','2025-05-01','annuelle','Local technique'),
('ALTH-STR-001','Toiture terrasse','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000007','fonctionnel',NULL,NULL,'2018-05-01','2028-05-01','décennale','Toiture R+5'),

-- ─── RÉSIDENCE ALICE GUY (ALICE) ──────────────────────────────────────────────
('ALICE-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000018','fonctionnel','KONE','EcoSpace','2020-09-01','2025-09-01','annuelle','Cage principale'),
('ALICE-ASC-002','Plateforme PMR','Ascenseurs','Plateforme PMR','b1000001-0000-0000-0000-000000000018','fonctionnel','CIBES','A5000','2020-09-01','2025-09-01','semestrielle','Hall entrée'),
('ALICE-CHA-001','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000018','fonctionnel','DANFOSS','AkvaHeat','2020-09-01','2025-09-01','annuelle','Local technique RDC'),
('ALICE-VMC-001','CTA double flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000018','fonctionnel','FRANCE AIR','Fluxair C','2020-09-01','2025-09-01','semestrielle','Toiture'),
('ALICE-SSI-001','Centrale incendie + SSI','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000018','fonctionnel','NOTIFIER','ID3000','2020-09-01','2025-09-01','semestrielle','Local SSI RDC'),
('ALICE-ELE-001','TGBT + groupe électrogène','Électricité','TGBT','b1000001-0000-0000-0000-000000000018','fonctionnel','SCHNEIDER','Prisma P','2020-09-01','2025-09-01','annuelle','Local électrique sous-sol'),
('ALICE-ECS-001','Ballons ECS x2 + surpresseur','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000018','fonctionnel','ATLANTIC','Calypso Neo','2020-09-01','2025-09-01','annuelle','Local technique sous-sol'),
('ALICE-STR-001','Façade et bardage','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000018','fonctionnel',NULL,NULL,'2020-09-01','2030-09-01','décennale','Façades nord/sud'),

-- ─── RÉSIDENCE ANDRÉ ALLIX (ALLIX) ───────────────────────────────────────────
('ALLIX-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000020','fonctionnel','SCHINDLER','3300','2016-03-01','2025-03-01','annuelle','Cage A'),
('ALLIX-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000020','fonctionnel','DE DIETRICH','Innovens','2016-03-01','2025-03-01','annuelle','Chaufferie sous-sol'),
('ALLIX-GAZ-001','Détendeur gaz','Gaz','Détendeur','b1000001-0000-0000-0000-000000000020','fonctionnel','FRANCEL','B25R','2016-03-01','2025-03-01','annuelle','Local gaz façade'),
('ALLIX-VMC-001','VMC hygroréglable','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000020','fonctionnel','ALDES','T.Flow Hygro+','2016-03-01','2025-03-01','annuelle','Toiture'),
('ALLIX-SSI-001','SSI central','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000020','fonctionnel','SIEMENS','Cerberus PRO','2016-03-01','2025-03-01','semestrielle','Loge gardien'),
('ALLIX-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000020','fonctionnel','LEGRAND','XL³ 4000','2016-03-01','2025-03-01','annuelle','Local électrique sous-sol'),
('ALLIX-ECS-001','Ballon ECS + adoucisseur','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000020','fonctionnel','ATLANTIC','Calypso','2016-03-01','2025-03-01','annuelle','Local technique'),
('ALLIX-STR-001','Toiture terrasse + garde-corps','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000020','fonctionnel',NULL,NULL,'2016-03-01','2026-03-01','décennale','Toiture R+6'),

-- ─── RÉSIDENCE ANDRÉ LIRONDELLE (LIRO) ───────────────────────────────────────
('LIRO-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000017','fonctionnel','OTIS','GeN2','2013-06-01','2025-06-01','annuelle','Cage principale'),
('LIRO-CHA-001','Pompe à chaleur air/eau','Chauffage','Pompe à chaleur','b1000001-0000-0000-0000-000000000017','fonctionnel','MITSUBISHI','Ecodan FTC5','2021-10-01','2025-10-01','annuelle','Cour intérieure'),
('LIRO-VMC-001','Extracteur VMC collectif','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000017','fonctionnel','ALDES','T.Flow Hygro+','2013-06-01','2025-06-01','annuelle','Toiture'),
('LIRO-SSI-001','Centrale incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000017','fonctionnel','HOCHIKI','FIREnet','2013-06-01','2025-06-01','semestrielle','Loge gardien'),
('LIRO-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000017','fonctionnel','SCHNEIDER','Prisma G','2013-06-01','2025-06-01','annuelle','Local électrique'),
('LIRO-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000017','fonctionnel','ATLANTIC','Calypso','2021-10-01','2025-10-01','annuelle','Local technique'),
('LIRO-STR-001','Charpente toiture','Structure bâtiment','Charpente','b1000001-0000-0000-0000-000000000017','fonctionnel',NULL,NULL,'2005-01-01','2025-01-01','quinquennale','Toiture principale'),

-- ─── RÉSIDENCE ARCHES D'AGRIPPA (ARCHE) ──────────────────────────────────────
('ARCHE-ASC-001','Ascenseur bâtiment A','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000022','fonctionnel','THYSSENKRUPP','Synergy','2019-04-01','2025-04-01','annuelle','Cage A'),
('ARCHE-CHA-001','Chaudière gaz','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000022','fonctionnel','BUDERUS','Logano plus','2019-04-01','2025-04-01','annuelle','Chaufferie sous-sol'),
('ARCHE-GAZ-001','Centrale gaz + détendeur','Gaz','Centrale gaz','b1000001-0000-0000-0000-000000000022','fonctionnel','FRANCEL','GRZ11','2019-04-01','2025-04-01','annuelle','Local gaz'),
('ARCHE-VMC-001','VMC double flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000022','fonctionnel','FRANCE AIR','Fluxair C','2019-04-01','2025-04-01','semestrielle','Toiture'),
('ARCHE-SSI-001','SSI + désenfumage','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000022','fonctionnel','ESSER','FlexES Control','2019-04-01','2025-04-01','semestrielle','Local SSI RDC'),
('ARCHE-ELE-001','TGBT + transformateur','Électricité','TGBT','b1000001-0000-0000-0000-000000000022','fonctionnel','SCHNEIDER','Prisma P','2019-04-01','2025-04-01','annuelle','Local électrique'),
('ARCHE-ECS-001','Ballon ECS thermodynamique','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000022','fonctionnel','ATLANTIC','Vertigo Split','2019-04-01','2025-04-01','annuelle','Local technique'),
('ARCHE-STR-001','Façade pierre + garde-corps','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000022','fonctionnel',NULL,NULL,'2019-04-01','2029-04-01','décennale','Façades ext.'),

-- ─── RÉSIDENCE BENJAMIN DELESSERT (DELE) ─────────────────────────────────────
('DELE-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000016','fonctionnel','KONE','MonoSpace','2011-09-01','2025-09-01','annuelle','Cage centrale'),
('DELE-CHA-001','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000016','fonctionnel','DANFOSS','FlatStation','2011-09-01','2025-09-01','annuelle','Local technique'),
('DELE-VMC-001','Extracteur VMC','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000016','fonctionnel','ALDES','T.Flow Hygro+','2011-09-01','2025-09-01','annuelle','Toiture'),
('DELE-SSI-001','Centrale incendie type 2','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000016','en_maintenance','SIEMENS','Sinteso FS20','2011-09-01','2024-09-01','semestrielle','Loge gardien'),
('DELE-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000016','fonctionnel','LEGRAND','XL³ 800','2011-09-01','2025-09-01','annuelle','Local électrique'),
('DELE-ECS-001','Ballon ECS + réseau collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000016','fonctionnel','ATLANTIC','Calypso','2011-09-01','2025-09-01','annuelle','Local technique'),
('DELE-STR-001','Toiture terrasse','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000016','fonctionnel',NULL,NULL,'2011-09-01','2021-09-01','décennale','R+4'),

-- ─── RÉSIDENCE BUGEAUD (BUGE) ─────────────────────────────────────────────────
('BUGE-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000025','fonctionnel','OTIS','GeN2 Comfort','2017-07-01','2025-07-01','annuelle','Cage A'),
('BUGE-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000025','fonctionnel','VIESSMANN','Vitodens 300-W','2017-07-01','2025-07-01','annuelle','Chaufferie sous-sol'),
('BUGE-GAZ-001','Réseau gaz bâtiment','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000025','fonctionnel',NULL,NULL,'2017-07-01','2025-07-01','annuelle','Colonnes + réseau'),
('BUGE-VMC-001','Tourelle VMC + désenfumage','Ventilation','Tourelle extraction','b1000001-0000-0000-0000-000000000025','fonctionnel','CIAT','DITE','2017-07-01','2025-07-01','semestrielle','Toiture'),
('BUGE-SSI-001','SSI central','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000025','fonctionnel','NOTIFIER','ID3000NET','2017-07-01','2025-07-01','semestrielle','Local SSI RDC'),
('BUGE-ELE-001','TGBT + armoires distribution','Électricité','TGBT','b1000001-0000-0000-0000-000000000025','fonctionnel','SCHNEIDER','Prisma G','2017-07-01','2025-07-01','annuelle','Local électrique'),
('BUGE-ECS-001','Ballons ECS + surpresseur','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000025','fonctionnel','GRUNDFOS','Hydro MPC','2017-07-01','2025-07-01','annuelle','Local technique sous-sol'),
('BUGE-STR-001','Garde-corps toiture','Structure bâtiment','Garde-corps','b1000001-0000-0000-0000-000000000025','fonctionnel',NULL,NULL,'2017-07-01','2025-07-01','triennale','Toiture + terrasses'),

-- ─── RÉSIDENCE CONFLUENCE (CONFL) ────────────────────────────────────────────
('CONFL-ASC-001','Ascenseur bâtiment A','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000024','fonctionnel','SCHINDLER','5500','2022-01-01','2025-01-01','annuelle','Cage A'),
('CONFL-ASC-002','Ascenseur bâtiment B','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000024','fonctionnel','SCHINDLER','5500','2022-01-01','2025-01-01','annuelle','Cage B'),
('CONFL-CHA-001','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000024','fonctionnel','DANFOSS','AkvaHeat','2022-01-01','2025-01-01','annuelle','Local technique RDC'),
('CONFL-VMC-001','CTA double flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000024','fonctionnel','FRANCE AIR','Fluxair C','2022-01-01','2025-01-01','semestrielle','Toiture bât A'),
('CONFL-CLIM-001','Groupe froid bureaux','Climatisation','Groupe froid','b1000001-0000-0000-0000-000000000024','fonctionnel','DAIKIN','VRV IV','2022-01-01','2025-01-01','semestrielle','Toiture bât B'),
('CONFL-SSI-001','SSI + colonnes sèches','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000024','fonctionnel','ESSER','FlexES Control','2022-01-01','2025-01-01','semestrielle','Local SSI RDC'),
('CONFL-ELE-001','TGBT + transformateur HTA/BT','Électricité','TGBT','b1000001-0000-0000-0000-000000000024','fonctionnel','SCHNEIDER','Prisma P','2022-01-01','2025-01-01','annuelle','Local électrique sous-sol'),
('CONFL-ECS-001','Ballons ECS solaires x3','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000024','fonctionnel','ATLANTIC','Calypso Neo','2022-01-01','2025-01-01','annuelle','Toiture'),
('CONFL-STR-001','Toiture terrasse végétalisée','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000024','fonctionnel',NULL,NULL,'2022-01-01','2032-01-01','décennale','Toiture R+8'),

-- ─── RÉSIDENCE CROIX DU SUD (CROIX) ──────────────────────────────────────────
('CROIX-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000009','fonctionnel','OTIS','GeN2','2009-06-01','2025-06-01','annuelle','Cage principale'),
('CROIX-CHA-001','Chaudière gaz','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000009','fonctionnel','BUDERUS','Logamax plus GB172','2009-06-01','2025-06-01','annuelle','Chaufferie sous-sol'),
('CROIX-GAZ-001','Réseau gaz + détendeur','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000009','fonctionnel',NULL,NULL,'2009-06-01','2025-06-01','annuelle','Local gaz'),
('CROIX-VMC-001','VMC hygroréglable','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000009','fonctionnel','ALDES','T.Flow Hygro+','2009-06-01','2025-06-01','annuelle','Toiture'),
('CROIX-SSI-001','Centrale incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000009','fonctionnel','HOCHIKI','FIREnet','2009-06-01','2025-06-01','semestrielle','Loge gardien'),
('CROIX-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000009','fonctionnel','LEGRAND','XL³ 4000','2009-06-01','2025-06-01','annuelle','Local électrique'),
('CROIX-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000009','hors_service','ATLANTIC','Calypso','2009-06-01','2024-06-01','annuelle','Local technique'),
('CROIX-STR-001','Façade + charpente','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000009','fonctionnel',NULL,NULL,'2009-06-01','2019-06-01','décennale','Façades principales'),

-- ─── RÉSIDENCE JACQUES CAVALIER (CAVA) ───────────────────────────────────────
('CAVA-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000011','fonctionnel','KONE','EcoSpace','2014-10-01','2025-10-01','annuelle','Cage principale'),
('CAVA-CHA-001','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000011','fonctionnel','DANFOSS','FlatStation','2014-10-01','2025-10-01','annuelle','Local technique'),
('CAVA-VMC-001','Extracteur VMC collectif','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000011','fonctionnel','ALDES','T.Flow Hygro+','2014-10-01','2025-10-01','annuelle','Toiture'),
('CAVA-SSI-001','SSI central + colonnes sèches','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000011','fonctionnel','NOTIFIER','ID3000','2014-10-01','2025-10-01','semestrielle','Local SSI'),
('CAVA-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000011','fonctionnel','SCHNEIDER','Prisma P','2014-10-01','2025-10-01','annuelle','Local électrique sous-sol'),
('CAVA-ECS-001','Ballon ECS + surpresseur','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000011','fonctionnel','ATLANTIC','Calypso Neo','2014-10-01','2025-10-01','annuelle','Local technique sous-sol'),
('CAVA-STR-001','Toiture terrasse + garde-corps','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000011','fonctionnel',NULL,NULL,'2014-10-01','2024-10-01','décennale','R+5'),

-- ─── RÉSIDENCE JEAN MERMOZ (MERM) ────────────────────────────────────────────
('MERM-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000010','en_maintenance','OTIS','GeN2','2008-03-01','2025-03-01','annuelle','Cage centrale'),
('MERM-CHA-001','Chaudière fioul condensation','Chauffage','Chaudière fioul','b1000001-0000-0000-0000-000000000010','fonctionnel','DE DIETRICH','Innovens','2008-03-01','2025-03-01','annuelle','Chaufferie sous-sol'),
('MERM-GAZ-001','Réseau gaz bâtiment','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000010','fonctionnel',NULL,NULL,'2008-03-01','2025-03-01','annuelle','Colonnes'),
('MERM-VMC-001','Extracteur VMC + désenfumage','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000010','fonctionnel','ALDES','T.Flow Hygro+','2008-03-01','2025-03-01','annuelle','Toiture'),
('MERM-SSI-001','Centrale incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000010','fonctionnel','SIEMENS','Cerberus PRO','2008-03-01','2025-03-01','semestrielle','Loge gardien'),
('MERM-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000010','fonctionnel','LEGRAND','XL³ 4000','2008-03-01','2025-03-01','annuelle','Local électrique'),
('MERM-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000010','fonctionnel','ATLANTIC','Calypso','2008-03-01','2025-03-01','annuelle','Local technique'),
('MERM-STR-001','Charpente + toiture','Structure bâtiment','Charpente','b1000001-0000-0000-0000-000000000010','fonctionnel',NULL,NULL,'2008-03-01','2018-03-01','décennale','Toiture principale'),

-- ─── RÉSIDENCE JEAN MEYGRET (MEYG) ───────────────────────────────────────────
('MEYG-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000023','fonctionnel','SCHINDLER','3300','2018-11-01','2025-11-01','annuelle','Cage A'),
('MEYG-CHA-001','Chaudière gaz','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000023','fonctionnel','VIESSMANN','Vitodens 200-W','2018-11-01','2025-11-01','annuelle','Chaufferie'),
('MEYG-GAZ-001','Détendeur gaz façade','Gaz','Détendeur','b1000001-0000-0000-0000-000000000023','fonctionnel','FRANCEL','B25R','2018-11-01','2025-11-01','annuelle','Façade rue'),
('MEYG-VMC-001','VMC collectif','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000023','fonctionnel','ALDES','T.Flow Hygro+','2018-11-01','2025-11-01','annuelle','Toiture'),
('MEYG-SSI-001','SSI + colonnes sèches','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000023','fonctionnel','ESSER','FlexES Control','2018-11-01','2025-11-01','semestrielle','Local SSI'),
('MEYG-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000023','fonctionnel','SCHNEIDER','Prisma G','2018-11-01','2025-11-01','annuelle','Local électrique'),
('MEYG-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000023','fonctionnel','ATLANTIC','Calypso Neo','2018-11-01','2025-11-01','annuelle','Local technique'),
('MEYG-STR-001','Toiture terrasse végétalisée','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000023','fonctionnel',NULL,NULL,'2018-11-01','2028-11-01','décennale','R+5'),

-- ─── RÉSIDENCE JUSSIEU STUDIOS (JSSTU) ───────────────────────────────────────
('JSSTU-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000005','fonctionnel','OTIS','GeN2','2015-03-01','2025-03-01','annuelle','Cage principale'),
('JSSTU-CHA-001','Réseau chauffage collectif','Chauffage','Réseau distribution','b1000001-0000-0000-0000-000000000005','fonctionnel',NULL,NULL,'2015-03-01','2025-03-01','quinquennale','Colonnes montantes'),
('JSSTU-VMC-001','VMC hygroréglable','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000005','fonctionnel','ALDES','T.Flow Hygro+','2015-03-01','2025-03-01','annuelle','Toiture'),
('JSSTU-SSI-001','Centrale incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000005','fonctionnel','NOTIFIER','ID3000','2015-03-01','2025-03-01','semestrielle','Loge gardien'),
('JSSTU-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000005','fonctionnel','SCHNEIDER','Prisma G','2015-03-01','2025-03-01','annuelle','Local électrique'),
('JSSTU-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000005','fonctionnel','ATLANTIC','Calypso','2015-03-01','2025-03-01','annuelle','Local technique'),
('JSSTU-STR-001','Toiture terrasse','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000005','fonctionnel',NULL,NULL,'2015-03-01','2025-03-01','décennale','Toiture R+4'),

-- ─── RÉSIDENCE LA MADELEINE (MADE) ───────────────────────────────────────────
('MADE-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000013','fonctionnel','KONE','MonoSpace','2012-07-01','2025-07-01','annuelle','Cage principale'),
('MADE-CHA-001','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000013','fonctionnel','DANFOSS','AkvaHeat','2012-07-01','2025-07-01','annuelle','Local technique'),
('MADE-VMC-001','Tourelle VMC','Ventilation','Tourelle extraction','b1000001-0000-0000-0000-000000000013','fonctionnel','CIAT','DITE','2012-07-01','2025-07-01','annuelle','Toiture'),
('MADE-SSI-001','SSI central','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000013','fonctionnel','HOCHIKI','FIREnet','2012-07-01','2025-07-01','semestrielle','Local SSI RDC'),
('MADE-ELE-001','TGBT + armoires paliers','Électricité','TGBT','b1000001-0000-0000-0000-000000000013','fonctionnel','LEGRAND','XL³ 4000','2012-07-01','2025-07-01','annuelle','Local électrique sous-sol'),
('MADE-ECS-001','Ballon ECS + adoucisseur','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000013','fonctionnel','ATLANTIC','Calypso','2012-07-01','2025-07-01','annuelle','Local technique'),
('MADE-STR-001','Façade pierre + garde-corps','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000013','fonctionnel',NULL,NULL,'2012-07-01','2022-07-01','décennale','Façades principales'),

-- ─── RÉSIDENCE LES GIRONDINS (GIRON) ─────────────────────────────────────────
('GIRON-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000019','fonctionnel','SCHINDLER','3300','2015-09-01','2025-09-01','annuelle','Cage principale'),
('GIRON-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000019','fonctionnel','VIESSMANN','Vitodens 300-W','2015-09-01','2025-09-01','annuelle','Chaufferie sous-sol'),
('GIRON-GAZ-001','Réseau gaz + détendeur','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000019','fonctionnel',NULL,NULL,'2015-09-01','2025-09-01','annuelle','Colonnes'),
('GIRON-VMC-001','CTA double flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000019','fonctionnel','FRANCE AIR','Fluxair C','2015-09-01','2025-09-01','semestrielle','Toiture'),
('GIRON-SSI-001','SSI + colonnes sèches','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000019','fonctionnel','NOTIFIER','ID3000NET','2015-09-01','2025-09-01','semestrielle','Local SSI RDC'),
('GIRON-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000019','fonctionnel','SCHNEIDER','Prisma P','2015-09-01','2025-09-01','annuelle','Local électrique'),
('GIRON-ECS-001','Ballons ECS x2','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000019','fonctionnel','ATLANTIC','Calypso Neo','2015-09-01','2025-09-01','annuelle','Local technique sous-sol'),
('GIRON-STR-001','Toiture terrasse + garde-corps','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000019','fonctionnel',NULL,NULL,'2015-09-01','2025-09-01','décennale','R+6'),

-- ─── RÉSIDENCE LES QUAIS (QUAIS) ─────────────────────────────────────────────
('QUAIS-ASC-001','Ascenseur bâtiment A','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000014','fonctionnel','OTIS','GeN2 Comfort','2017-02-01','2025-02-01','annuelle','Cage A'),
('QUAIS-ASC-002','Ascenseur bâtiment B','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000014','fonctionnel','OTIS','GeN2 Comfort','2017-02-01','2025-02-01','annuelle','Cage B'),
('QUAIS-CHA-001','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000014','fonctionnel','DANFOSS','AkvaHeat','2017-02-01','2025-02-01','annuelle','Local technique RDC'),
('QUAIS-VMC-001','CTA double flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000014','fonctionnel','FRANCE AIR','Semco AHU','2017-02-01','2025-02-01','semestrielle','Toiture'),
('QUAIS-SSI-001','SSI central + désenfumage','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000014','fonctionnel','ESSER','FlexES Control','2017-02-01','2025-02-01','semestrielle','Local SSI'),
('QUAIS-ELE-001','TGBT + groupe électrogène','Électricité','TGBT','b1000001-0000-0000-0000-000000000014','fonctionnel','SCHNEIDER','Prisma P','2017-02-01','2025-02-01','annuelle','Local électrique sous-sol'),
('QUAIS-ECS-001','Ballons ECS solaires','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000014','fonctionnel','ATLANTIC','Calypso Neo','2017-02-01','2025-02-01','annuelle','Toiture'),
('QUAIS-STR-001','Façade bardage + toiture terrasse','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000014','fonctionnel',NULL,NULL,'2017-02-01','2027-02-01','décennale','Façades ext. + toiture'),

-- ─── RÉSIDENCE PARADIN (PARA) ─────────────────────────────────────────────────
('PARA-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000008','fonctionnel','THYSSENKRUPP','Synergy','2010-04-01','2025-04-01','annuelle','Cage principale'),
('PARA-CHA-001','Chaudière fioul','Chauffage','Chaudière fioul','b1000001-0000-0000-0000-000000000008','fonctionnel','DE DIETRICH','Innovens','2010-04-01','2025-04-01','annuelle','Chaufferie sous-sol'),
('PARA-GAZ-001','Réseau gaz','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000008','fonctionnel',NULL,NULL,'2010-04-01','2025-04-01','annuelle','Colonnes'),
('PARA-VMC-001','VMC hygroréglable','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000008','fonctionnel','ALDES','T.Flow Hygro+','2010-04-01','2025-04-01','annuelle','Toiture'),
('PARA-SSI-001','Centrale incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000008','fonctionnel','SIEMENS','Cerberus PRO','2010-04-01','2025-04-01','semestrielle','Loge gardien'),
('PARA-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000008','fonctionnel','LEGRAND','XL³ 800','2010-04-01','2025-04-01','annuelle','Local électrique'),
('PARA-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000008','fonctionnel','ATLANTIC','Calypso','2010-04-01','2025-04-01','annuelle','Local technique'),
('PARA-STR-001','Charpente + couverture','Structure bâtiment','Charpente','b1000001-0000-0000-0000-000000000008','fonctionnel',NULL,NULL,'2010-04-01','2020-04-01','décennale','Toiture'),

-- ─── RÉSIDENCE PHILOMÈNE MAGNIN (PHILO) ──────────────────────────────────────
('PHILO-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000021','fonctionnel','KONE','EcoSpace','2017-06-01','2025-06-01','annuelle','Cage principale'),
('PHILO-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000021','fonctionnel','BUDERUS','Logamax plus GB172','2017-06-01','2025-06-01','annuelle','Chaufferie RDC'),
('PHILO-GAZ-001','Centrale gaz + détendeur','Gaz','Centrale gaz','b1000001-0000-0000-0000-000000000021','fonctionnel','FRANCEL','GRZ11','2017-06-01','2025-06-01','annuelle','Local gaz RDC'),
('PHILO-VMC-001','CTA simple flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000021','fonctionnel','FRANCE AIR','Semco AHU','2017-06-01','2025-06-01','semestrielle','Toiture'),
('PHILO-SSI-001','SSI + désenfumage','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000021','fonctionnel','NOTIFIER','ID3000','2017-06-01','2025-06-01','semestrielle','Local SSI RDC'),
('PHILO-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000021','fonctionnel','SCHNEIDER','Prisma P','2017-06-01','2025-06-01','annuelle','Local électrique sous-sol'),
('PHILO-ECS-001','Ballon ECS + réseau collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000021','fonctionnel','ATLANTIC','Calypso Neo','2017-06-01','2025-06-01','annuelle','Local technique'),
('PHILO-STR-001','Toiture terrasse + garde-corps','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000021','fonctionnel',NULL,NULL,'2017-06-01','2027-06-01','décennale','R+5'),

-- ─── RÉSIDENCE VOLTAIRE (VOLT) ────────────────────────────────────────────────
('VOLT-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000012','fonctionnel','OTIS','GeN2','2013-09-01','2025-09-01','annuelle','Cage A'),
('VOLT-CHA-001','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000012','fonctionnel','DANFOSS','FlatStation','2013-09-01','2025-09-01','annuelle','Local technique RDC'),
('VOLT-VMC-001','Extracteur VMC collectif','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000012','fonctionnel','ALDES','T.Flow Hygro+','2013-09-01','2025-09-01','annuelle','Toiture'),
('VOLT-SSI-001','SSI central','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000012','fonctionnel','ESSER','FlexES Control','2013-09-01','2025-09-01','semestrielle','Local SSI RDC'),
('VOLT-ELE-001','TGBT + armoires distribution','Électricité','TGBT','b1000001-0000-0000-0000-000000000012','fonctionnel','SCHNEIDER','Prisma G','2013-09-01','2025-09-01','annuelle','Local électrique sous-sol'),
('VOLT-ECS-001','Ballons ECS x2','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000012','fonctionnel','ATLANTIC','Calypso','2013-09-01','2025-09-01','annuelle','Local technique'),
('VOLT-STR-001','Façade haussmannienne + toiture','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000012','fonctionnel',NULL,NULL,'2013-09-01','2023-09-01','décennale','Façades ext.'),

-- ─── RÉSIDENCES CROUS BOURG-EN-BRESSE (BOURG1) ───────────────────────────────
('BOURG-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000027','fonctionnel','KONE','MonoSpace','2016-01-01','2025-01-01','annuelle','Cage principale'),
('BOURG-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000027','fonctionnel','VIESSMANN','Vitodens 200-W','2016-01-01','2025-01-01','annuelle','Chaufferie sous-sol'),
('BOURG-GAZ-001','Réseau gaz + détendeur','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000027','fonctionnel',NULL,NULL,'2016-01-01','2025-01-01','annuelle','Colonnes'),
('BOURG-VMC-001','VMC hygroréglable','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000027','fonctionnel','ALDES','T.Flow Hygro+','2016-01-01','2025-01-01','annuelle','Toiture'),
('BOURG-SSI-001','Centrale incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000027','fonctionnel','HOCHIKI','FIREnet','2016-01-01','2025-01-01','semestrielle','Loge gardien'),
('BOURG-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000027','fonctionnel','LEGRAND','XL³ 4000','2016-01-01','2025-01-01','annuelle','Local électrique'),
('BOURG-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000027','fonctionnel','ATLANTIC','Calypso','2016-01-01','2025-01-01','annuelle','Local technique'),
('BOURG-STR-001','Toiture + charpente','Structure bâtiment','Charpente','b1000001-0000-0000-0000-000000000027','fonctionnel',NULL,NULL,'2016-01-01','2026-01-01','quinquennale','Toiture principale'),

-- ─── RÉSIDENCES CROUS ROANNE (ROAN1) ─────────────────────────────────────────
('ROAN-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000029','fonctionnel','SCHINDLER','3300','2014-05-01','2025-05-01','annuelle','Cage principale'),
('ROAN-CHA-001','Chaudière gaz','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000029','fonctionnel','BUDERUS','Logamax plus','2014-05-01','2025-05-01','annuelle','Chaufferie sous-sol'),
('ROAN-GAZ-001','Réseau gaz + détendeur','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000029','fonctionnel',NULL,NULL,'2014-05-01','2025-05-01','annuelle','Local gaz'),
('ROAN-VMC-001','VMC hygroréglable','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000029','fonctionnel','ALDES','T.Flow Hygro+','2014-05-01','2025-05-01','annuelle','Toiture'),
('ROAN-SSI-001','SSI central','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000029','fonctionnel','ESSER','FlexES Control','2014-05-01','2025-05-01','semestrielle','Local SSI RDC'),
('ROAN-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000029','fonctionnel','SCHNEIDER','Prisma G','2014-05-01','2025-05-01','annuelle','Local électrique'),
('ROAN-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000029','fonctionnel','ATLANTIC','Calypso','2014-05-01','2025-05-01','annuelle','Local technique'),
('ROAN-STR-001','Charpente + toiture','Structure bâtiment','Charpente','b1000001-0000-0000-0000-000000000029','fonctionnel',NULL,NULL,'2014-05-01','2024-05-01','décennale','Toiture principale'),

-- ─── RÉSIDENCES CROUS SAINT-ÉTIENNE (STETN1) ─────────────────────────────────
('STETN-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000028','fonctionnel','OTIS','GeN2','2015-06-01','2025-06-01','annuelle','Cage principale'),
('STETN-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000028','fonctionnel','VIESSMANN','Vitodens 200-W','2015-06-01','2025-06-01','annuelle','Chaufferie sous-sol'),
('STETN-GAZ-001','Réseau gaz + détendeur','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000028','fonctionnel',NULL,NULL,'2015-06-01','2025-06-01','annuelle','Colonnes'),
('STETN-VMC-001','Extracteur VMC collectif','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000028','fonctionnel','ALDES','T.Flow Hygro+','2015-06-01','2025-06-01','annuelle','Toiture'),
('STETN-SSI-001','Centrale incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000028','fonctionnel','NOTIFIER','ID3000','2015-06-01','2025-06-01','semestrielle','Loge gardien'),
('STETN-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000028','fonctionnel','LEGRAND','XL³ 4000','2015-06-01','2025-06-01','annuelle','Local électrique'),
('STETN-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000028','fonctionnel','ATLANTIC','Calypso','2015-06-01','2025-06-01','annuelle','Local technique'),
('STETN-STR-001','Façade + toiture terrasse','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000028','fonctionnel',NULL,NULL,'2015-06-01','2025-06-01','décennale','Façades ext.'),

-- ─── RÉSIDENCE AIMÉ CÉSAIRE (AIME) ───────────────────────────────────────────
('AIME-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000026','fonctionnel','KONE','EcoSpace','2019-10-01','2025-10-01','annuelle','Cage principale'),
('AIME-ASC-002','Monte-charge service','Ascenseurs','Monte-charge','b1000001-0000-0000-0000-000000000026','fonctionnel','MITSUBISHI','ELENESSA','2019-10-01','2025-10-01','annuelle','Accès service'),
('AIME-CHA-001','Pompe à chaleur air/eau','Chauffage','Pompe à chaleur','b1000001-0000-0000-0000-000000000026','fonctionnel','MITSUBISHI','Ecodan FTC5','2019-10-01','2025-10-01','annuelle','Toiture technique'),
('AIME-VMC-001','CTA double flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000026','fonctionnel','FRANCE AIR','Fluxair C','2019-10-01','2025-10-01','semestrielle','Toiture'),
('AIME-CLIM-001','Climatisation VRV bureaux','Climatisation','Climatisation VRV/DRV','b1000001-0000-0000-0000-000000000026','fonctionnel','DAIKIN','VRV IV','2019-10-01','2025-10-01','semestrielle','Bureaux R+1'),
('AIME-SSI-001','SSI + colonnes sèches','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000026','fonctionnel','ESSER','FlexES Control','2019-10-01','2025-10-01','semestrielle','Local SSI RDC'),
('AIME-ELE-001','TGBT + transformateur HTA/BT','Électricité','TGBT','b1000001-0000-0000-0000-000000000026','fonctionnel','SCHNEIDER','Prisma P','2019-10-01','2025-10-01','annuelle','Local électrique sous-sol'),
('AIME-ECS-001','Ballons ECS solaires x2','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000026','fonctionnel','ATLANTIC','Calypso Neo','2019-10-01','2025-10-01','annuelle','Toiture technique'),
('AIME-STR-001','Toiture terrasse végétalisée','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000026','fonctionnel',NULL,NULL,'2019-10-01','2029-10-01','décennale','R+7');
