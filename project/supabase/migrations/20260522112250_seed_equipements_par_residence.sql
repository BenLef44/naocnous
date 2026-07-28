/*
  # Seed équipements réalistes par résidence CROUS Lyon

  ## Description
  Supprime les équipements de démo génériques et insère des équipements réalistes
  rattachés aux 6 résidences principales du CROUS de Lyon, organisés en 9 catégories.
*/

DELETE FROM equipements;

-- ─── RÉSIDENCE JUSSIEU ────────────────────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, residence_id, etat, marque, modele, date_mise_en_service, prochaine_echeance, frequence_controle, localisation_detail) VALUES
('JUSS-ASC-001','Ascenseur principal bâtiment A','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000001','fonctionnel','OTIS','GeN2','2015-03-01','2025-03-01','annuelle','Cage A - Hall principal'),
('JUSS-ASC-002','Ascenseur bâtiment B','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000001','en_maintenance','KONE','MonoSpace','2012-06-15','2025-06-15','annuelle','Cage B - Accès logements'),
('JUSS-ASC-003','Plateforme PMR hall','Ascenseurs','Plateforme PMR','b1000001-0000-0000-0000-000000000001','fonctionnel','CIBES','A5000','2019-09-10','2025-09-10','semestrielle','Hall - Accès PMR'),
('JUSS-CHA-001','Chaudière gaz condensation principale','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000001','fonctionnel','VIESSMANN','Vitodens 200-W','2018-10-01','2025-10-01','annuelle','Chaufferie sous-sol'),
('JUSS-CHA-002','Sous-station chauffage urbain','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000001','fonctionnel','DANFOSS','FlatStation','2016-04-15','2025-04-15','annuelle','Local technique RDC'),
('JUSS-CHA-003','Réseau chauffage collectif','Chauffage','Réseau distribution','b1000001-0000-0000-0000-000000000001','fonctionnel',NULL,NULL,'2010-01-01','2026-01-01','quinquennale','Réseau enterré + colonnes'),
('JUSS-GAZ-001','Chaufferie gaz centrale','Gaz','Chaufferie','b1000001-0000-0000-0000-000000000001','fonctionnel','BUDERUS','Logano plus','2018-10-01','2025-10-01','annuelle','Chaufferie sous-sol'),
('JUSS-GAZ-002','Détendeur gaz entrée site','Gaz','Détendeur','b1000001-0000-0000-0000-000000000001','fonctionnel','FRANCEL','B25R','2014-06-01','2025-06-01','annuelle','Local gaz façade rue'),
('JUSS-VMC-001','CTA double flux bâtiment A','Ventilation','CTA','b1000001-0000-0000-0000-000000000001','fonctionnel','FRANCE AIR','Fluxair C','2020-07-01','2025-07-01','semestrielle','Toiture bâtiment A'),
('JUSS-VMC-002','Extracteur VMC logements','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000001','fonctionnel','ALDES','T.Flow Hygro+','2020-07-01','2025-07-01','annuelle','Gaines techniques'),
('JUSS-VMC-003','Système désenfumage cage escalier A','Ventilation','Désenfumage','b1000001-0000-0000-0000-000000000001','fonctionnel','CIAT','DAIS','2015-03-01','2025-03-01','semestrielle','Cage A - Niveau toiture'),
('JUSS-CLIM-001','Armoire climatisation local informatique','Climatisation','Armoire climatisation','b1000001-0000-0000-0000-000000000001','fonctionnel','DAIKIN','EWATQ','2021-05-01','2025-05-01','semestrielle','Local informatique RDC'),
('JUSS-SSI-001','Système de Sécurité Incendie central','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000001','fonctionnel','ESSER','FlexES Control','2019-01-15','2025-01-15','semestrielle','Local SSI RDC'),
('JUSS-SSI-002','Centrale détection incendie','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000001','fonctionnel','NOTIFIER','ID3000','2019-01-15','2025-01-15','semestrielle','Loge gardien'),
('JUSS-SSI-003','Colonnes sèches bâtiments A+B','Sécurité incendie','Colonnes sèches','b1000001-0000-0000-0000-000000000001','fonctionnel',NULL,NULL,'2010-01-01','2025-06-01','semestrielle','Cages escalier A et B'),
('JUSS-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000001','fonctionnel','SCHNEIDER','Prisma P','2018-10-01','2025-10-01','annuelle','Local électrique sous-sol'),
('JUSS-ELE-002','Groupe électrogène de secours','Électricité','Groupe électrogène','b1000001-0000-0000-0000-000000000001','fonctionnel','SDMO','J130K','2017-06-01','2025-06-01','semestrielle','Cour technique extérieur'),
('JUSS-ELE-003','Transformateur HTA/BT','Électricité','Transformateur','b1000001-0000-0000-0000-000000000001','fonctionnel','ABB','ONAN 630kVA','2018-10-01','2030-10-01','décennale','Poste transformation sous-sol'),
('JUSS-ECS-001','Ballon ECS solaire thermique','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000001','fonctionnel','ATLANTIC','Calypso Neo','2021-09-01','2025-09-01','annuelle','Local technique toiture'),
('JUSS-ECS-002','Surpresseur eau froide','Eau sanitaire','Surpresseur','b1000001-0000-0000-0000-000000000001','fonctionnel','GRUNDFOS','Hydro MPC','2016-04-01','2025-04-01','annuelle','Local technique sous-sol'),
('JUSS-ECS-003','Adoucisseur collectif','Eau sanitaire','Adoucisseur','b1000001-0000-0000-0000-000000000001','hors_service','BWT','Rondomat Duo','2013-03-01','2024-03-01','annuelle','Local technique sous-sol'),
('JUSS-STR-001','Toiture terrasse bâtiment A','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000001','fonctionnel',NULL,NULL,'2018-06-01','2028-06-01','décennale','Niveau R+7'),
('JUSS-STR-002','Façade principale','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000001','fonctionnel',NULL,NULL,'2010-01-01','2030-01-01','décennale','Façade nord'),
('JUSS-STR-003','Garde-corps terrasses','Structure bâtiment','Garde-corps','b1000001-0000-0000-0000-000000000001','fonctionnel',NULL,NULL,'2010-01-01','2025-01-01','triennale','Toitures et terrasses');

-- ─── RÉSIDENCE LES ANTONINS ───────────────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, residence_id, etat, marque, modele, date_mise_en_service, prochaine_echeance, frequence_controle, localisation_detail) VALUES
('ANTO-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000002','fonctionnel','THYSSENKRUPP','Synergy','2014-02-01','2025-02-01','annuelle','Cage centrale'),
('ANTO-ASC-002','Monte-charge cuisine collective','Ascenseurs','Monte-charge','b1000001-0000-0000-0000-000000000002','fonctionnel','MITSUBISHI','ELENESSA','2014-02-01','2025-02-01','annuelle','Accès cuisine RDC-R+1'),
('ANTO-CHA-001','Pompe à chaleur air/eau','Chauffage','Pompe à chaleur','b1000001-0000-0000-0000-000000000002','fonctionnel','MITSUBISHI','Ecodan FTC5','2022-11-01','2025-11-01','annuelle','Cour intérieure'),
('ANTO-CHA-002','Réseau chauffage collectif','Chauffage','Réseau distribution','b1000001-0000-0000-0000-000000000002','fonctionnel',NULL,NULL,'2014-01-01','2026-01-01','quinquennale','Colonnes montantes'),
('ANTO-GAZ-001','Réseau gaz bâtiment','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000002','fonctionnel',NULL,NULL,'2005-01-01','2025-06-01','annuelle','Réseau enterré + colonnes'),
('ANTO-VMC-001','Extracteur VMC collectif','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000002','fonctionnel','ALDES','T.Flow Hygro+','2014-02-01','2025-02-01','annuelle','Toiture'),
('ANTO-VMC-002','Tourelle extraction parking','Ventilation','Tourelle extraction','b1000001-0000-0000-0000-000000000002','fonctionnel','CIAT','DITE','2014-02-01','2025-02-01','semestrielle','Toiture parking sous-sol'),
('ANTO-SSI-001','SSI - Système Sécurité Incendie','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000002','fonctionnel','HOCHIKI','FIREnet','2014-02-01','2025-02-01','semestrielle','Local SSI RDC'),
('ANTO-SSI-002','Désenfumage cage escalier','Sécurité incendie','Désenfumage','b1000001-0000-0000-0000-000000000002','fonctionnel','CIAT','DAIS','2014-02-01','2025-02-01','semestrielle','Cage escalier principale'),
('ANTO-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000002','fonctionnel','LEGRAND','XL³ 4000','2014-02-01','2025-02-01','annuelle','Local électrique sous-sol'),
('ANTO-ECS-001','Ballon ECS thermodynamique','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000002','fonctionnel','ATLANTIC','Vertigo Split','2022-11-01','2025-11-01','annuelle','Local technique RDC'),
('ANTO-ECS-002','Réseau ECS collectif','Eau sanitaire','Réseau ECS','b1000001-0000-0000-0000-000000000002','fonctionnel',NULL,NULL,'2014-01-01','2025-06-01','annuelle','Colonnes montantes'),
('ANTO-STR-001','Toiture terrasse','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000002','fonctionnel',NULL,NULL,'2014-01-01','2024-01-01','décennale','R+5'),
('ANTO-STR-002','Façades et ravalement','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000002','fonctionnel',NULL,NULL,'2020-06-01','2030-06-01','décennale','Toutes façades');

-- ─── RÉSIDENCE PUVIS DE CHAVANNES ─────────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, residence_id, etat, marque, modele, date_mise_en_service, prochaine_echeance, frequence_controle, localisation_detail) VALUES
('PUVIS-ASC-001','Ascenseur principal bâtiment A','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000003','fonctionnel','OTIS','GeN2 Comfort','2016-09-01','2025-09-01','annuelle','Cage A'),
('PUVIS-ASC-002','Ascenseur bâtiment B','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000003','en_maintenance','OTIS','GeN2 Comfort','2016-09-01','2025-09-01','annuelle','Cage B'),
('PUVIS-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000003','fonctionnel','VIESSMANN','Vitodens 300-W','2020-10-01','2025-10-01','annuelle','Chaufferie RDC'),
('PUVIS-GAZ-001','Centrale gaz et détendeur','Gaz','Centrale gaz','b1000001-0000-0000-0000-000000000003','fonctionnel','FRANCEL','GRZ11','2020-10-01','2025-10-01','annuelle','Local gaz RDC'),
('PUVIS-VMC-001','CTA simple flux','Ventilation','CTA','b1000001-0000-0000-0000-000000000003','fonctionnel','FRANCE AIR','Semco AHU','2016-09-01','2025-09-01','semestrielle','Toiture'),
('PUVIS-SSI-001','Centrale incendie Alarme type 2a','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000003','fonctionnel','SIEMENS','Cerberus PRO','2016-09-01','2025-09-01','semestrielle','Loge gardien RDC'),
('PUVIS-ELE-001','TGBT - Tableau Général BT','Électricité','TGBT','b1000001-0000-0000-0000-000000000003','fonctionnel','SCHNEIDER','Prisma G','2016-09-01','2025-09-01','annuelle','Local électrique sous-sol'),
('PUVIS-ELE-002','Armoire électrique principale R+1','Électricité','Armoire électrique','b1000001-0000-0000-0000-000000000003','fonctionnel','SCHNEIDER','Prisma G','2016-09-01','2025-09-01','annuelle','Palier R+1'),
('PUVIS-ECS-001','Ballon ECS 500L + réseau collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000003','fonctionnel','ATLANTIC','Calypso Neo','2020-10-01','2025-10-01','annuelle','Local technique toiture'),
('PUVIS-STR-001','Charpente et toiture','Structure bâtiment','Charpente','b1000001-0000-0000-0000-000000000003','fonctionnel',NULL,NULL,'2005-01-01','2025-01-01','quinquennale','Toiture globale');

-- ─── RÉSIDENCE EINSTEIN ───────────────────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, residence_id, etat, marque, modele, date_mise_en_service, prochaine_echeance, frequence_controle, localisation_detail) VALUES
('EINST-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000004','fonctionnel','KONE','EcoSpace','2017-04-01','2025-04-01','annuelle','Hall principal'),
('EINST-CHA-001','Sous-station chauffage urbain DALKIA','Chauffage','Sous-station','b1000001-0000-0000-0000-000000000004','fonctionnel','DANFOSS','AkvaHeat','2017-04-01','2025-04-01','annuelle','Local technique sous-sol'),
('EINST-GAZ-001','Réseau gaz bâtiment','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000004','fonctionnel',NULL,NULL,'2010-01-01','2025-06-01','annuelle','Réseau enterré + colonnes'),
('EINST-VMC-001','Extracteur VMC centralisé','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000004','fonctionnel','ALDES','T.Flow Hygro+','2017-04-01','2025-04-01','annuelle','Toiture'),
('EINST-CLIM-001','Groupe froid salle de réunion','Climatisation','Groupe froid','b1000001-0000-0000-0000-000000000004','fonctionnel','CARRIER','AquaForce 30XW','2021-06-01','2025-06-01','semestrielle','Toiture - Salle de réunion'),
('EINST-SSI-001','Système de Sécurité Incendie','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000004','fonctionnel','ESSER','FlexES Control','2017-04-01','2025-04-01','semestrielle','Local SSI RDC'),
('EINST-ELE-001','TGBT principal','Électricité','TGBT','b1000001-0000-0000-0000-000000000004','fonctionnel','SCHNEIDER','Prisma P','2017-04-01','2025-04-01','annuelle','Local électrique sous-sol'),
('EINST-ECS-001','Ballons ECS x3 en cascade','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000004','fonctionnel','ATLANTIC','Calypso','2017-04-01','2025-04-01','annuelle','Local technique sous-sol'),
('EINST-STR-001','Toiture terrasse végétalisée','Structure bâtiment','Toiture terrasse','b1000001-0000-0000-0000-000000000004','fonctionnel',NULL,NULL,'2017-04-01','2027-04-01','décennale','Toiture R+6'),
('EINST-STR-002','Garde-corps et acrotères','Structure bâtiment','Garde-corps','b1000001-0000-0000-0000-000000000004','fonctionnel',NULL,NULL,'2017-04-01','2025-04-01','triennale','Terrasses et balcons');

-- ─── RÉSIDENCE ARCHIMÈDE ──────────────────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, residence_id, etat, marque, modele, date_mise_en_service, prochaine_echeance, frequence_controle, localisation_detail) VALUES
('ARCH-ASC-001','Ascenseur bâtiment principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000006','fonctionnel','SCHINDLER','3300','2019-07-01','2025-07-01','annuelle','Cage principale'),
('ARCH-ASC-002','Escalier mécanique hall','Ascenseurs','Escalier mécanique','b1000001-0000-0000-0000-000000000006','hors_service','KONE','TravelMaster 110','2010-03-01','2024-03-01','semestrielle','Hall principal RDC'),
('ARCH-CHA-001','Chaudière fioul condensation','Chauffage','Chaudière fioul','b1000001-0000-0000-0000-000000000006','fonctionnel','DE DIETRICH','Innovens','2013-10-01','2025-10-01','annuelle','Chaufferie sous-sol'),
('ARCH-GAZ-001','Détendeur gaz façade','Gaz','Détendeur','b1000001-0000-0000-0000-000000000006','fonctionnel','FRANCEL','B15R','2013-10-01','2025-10-01','annuelle','Façade rue'),
('ARCH-VMC-001','VMC hygroréglable type B','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000006','fonctionnel','ALDES','T.Flow Hygro+','2019-07-01','2025-07-01','annuelle','Toiture'),
('ARCH-VMC-002','Désenfumage parking sous-sol','Ventilation','Désenfumage','b1000001-0000-0000-0000-000000000006','fonctionnel','CIAT','DITS','2019-07-01','2025-07-01','semestrielle','Parking sous-sol'),
('ARCH-CLIM-001','Climatisation VRV/DRV bureaux','Climatisation','Climatisation VRV/DRV','b1000001-0000-0000-0000-000000000006','fonctionnel','DAIKIN','VRV IV','2021-07-01','2025-07-01','semestrielle','Bureaux direction R+1'),
('ARCH-SSI-001','SSI et centrale alarme','Sécurité incendie','SSI','b1000001-0000-0000-0000-000000000006','fonctionnel','NOTIFIER','ID3000NET','2019-07-01','2025-07-01','semestrielle','Local SSI RDC'),
('ARCH-ELE-001','TGBT + armoires de distribution','Électricité','TGBT','b1000001-0000-0000-0000-000000000006','fonctionnel','SCHNEIDER','Prisma P','2019-07-01','2025-07-01','annuelle','Local électrique RDC'),
('ARCH-ECS-001','Ballon ECS 300L + surpresseur','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000006','fonctionnel','ATLANTIC','Calypso','2019-07-01','2025-07-01','annuelle','Local technique sous-sol'),
('ARCH-STR-001','Façade bardage ventilé','Structure bâtiment','Façade','b1000001-0000-0000-0000-000000000006','fonctionnel',NULL,NULL,'2019-07-01','2029-07-01','décennale','Façades est et ouest');

-- ─── RÉSIDENCE GARIBALDI ──────────────────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, residence_id, etat, marque, modele, date_mise_en_service, prochaine_echeance, frequence_controle, localisation_detail) VALUES
('GARI-ASC-001','Ascenseur principal','Ascenseurs','Ascenseur électrique','b1000001-0000-0000-0000-000000000015','fonctionnel','OTIS','GeN2','2011-05-01','2025-05-01','annuelle','Cage principale'),
('GARI-CHA-001','Chaudière gaz condensation','Chauffage','Chaudière gaz','b1000001-0000-0000-0000-000000000015','fonctionnel','BUDERUS','Logamax plus GB172','2023-10-01','2026-10-01','annuelle','Chaufferie sous-sol'),
('GARI-GAZ-001','Réseau gaz + détendeur','Gaz','Réseau gaz','b1000001-0000-0000-0000-000000000015','fonctionnel','FRANCEL','B25R','2023-10-01','2025-10-01','annuelle','Local gaz RDC'),
('GARI-VMC-001','Extracteur VMC logements','Ventilation','Extracteur VMC','b1000001-0000-0000-0000-000000000015','fonctionnel','ALDES','T.Flow Hygro+','2023-10-01','2025-10-01','annuelle','Toiture'),
('GARI-SSI-001','Centrale incendie type 4','Sécurité incendie','Centrale incendie','b1000001-0000-0000-0000-000000000015','fonctionnel','SIEMENS','Sinteso FS20','2023-10-01','2025-10-01','semestrielle','Loge gardien RDC'),
('GARI-ELE-001','TGBT général','Électricité','TGBT','b1000001-0000-0000-0000-000000000015','fonctionnel','LEGRAND','XL³ 800','2023-10-01','2025-10-01','annuelle','Local technique RDC'),
('GARI-ECS-001','Ballon ECS collectif','Eau sanitaire','Ballon ECS','b1000001-0000-0000-0000-000000000015','fonctionnel','ATLANTIC','Calypso','2023-10-01','2025-10-01','annuelle','Local technique sous-sol'),
('GARI-STR-001','Toiture en tuiles + charpente','Structure bâtiment','Charpente','b1000001-0000-0000-0000-000000000015','fonctionnel',NULL,NULL,'2011-05-01','2026-05-01','quinquennale','Toiture principale');
