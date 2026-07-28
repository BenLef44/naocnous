/*
  # Replace sites with official CROUS Hauts-de-France campuses (v2)

  25 official campuses: Université de Lille, Artois, ULCO, UPHV, UPHF, UPJV
*/

DELETE FROM actions_correctives;
DELETE FROM points_controle;
DELETE FROM controles_reglementaires;
DELETE FROM equipements;
DELETE FROM logements;
DELETE FROM etages;
DELETE FROM batiments;
DELETE FROM residences;
DELETE FROM sites;

INSERT INTO sites (id, code, nom, ville, code_postal, region, statut) VALUES
  ('aa000001-0001-0001-0001-000000000001', 'CS', 'Campus Cité Scientifique', 'Villeneuve-d''Ascq', '59650', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000002', 'PB', 'Campus Pont-de-Bois', 'Villeneuve-d''Ascq', '59650', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000003', 'SA', 'Campus Santé', 'Lille', '59000', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000004', 'MO', 'Campus Lille-Moulins', 'Lille', '59000', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000005', 'FC', 'Campus Flers-Château', 'Villeneuve-d''Ascq', '59650', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000006', 'RT', 'Campus Roubaix-Tourcoing', 'Roubaix', '59100', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000007', 'AR', 'Campus Arras', 'Arras', '62000', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000008', 'BE', 'Campus Béthune', 'Béthune', '62400', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000009', 'DO', 'Campus Douai', 'Douai', '59500', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000010', 'LE', 'Campus Lens', 'Lens', '62300', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000011', 'LV', 'Campus Liévin', 'Liévin', '62800', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000012', 'DK', 'Campus Dunkerque', 'Dunkerque', '59140', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000013', 'CA', 'Campus Calais', 'Calais', '62100', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000014', 'BM', 'Campus Boulogne-sur-Mer', 'Boulogne-sur-Mer', '62200', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000015', 'SO', 'Campus Saint-Omer', 'Saint-Omer', '62500', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000016', 'MH', 'Campus Mont Houy', 'Valenciennes', '59300', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000017', 'TE', 'Campus Tertiales', 'Valenciennes', '59300', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000018', 'CB', 'Campus Cambrai', 'Cambrai', '59400', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000019', 'MA', 'Campus Maubeuge', 'Maubeuge', '59600', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000020', 'AM', 'Campus Amiens', 'Amiens', '80000', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000021', 'BV', 'Campus Beauvais', 'Beauvais', '60000', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000022', 'SQ', 'Campus Saint-Quentin', 'Saint-Quentin', '02100', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000023', 'LA', 'Campus Laon', 'Laon', '02000', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000024', 'SS', 'Campus Soissons', 'Soissons', '02200', 'Hauts-de-France', 'disponible'),
  ('aa000001-0001-0001-0001-000000000025', 'CR', 'Campus Creil', 'Creil', '60100', 'Hauts-de-France', 'disponible');

INSERT INTO residences (id, site_id, code, nom, adresse, statut, nombre_logements) VALUES
  ('ab000001-0001-0001-0001-000000000001', 'aa000001-0001-0001-0001-000000000001', 'CS-CAM', 'Résidence Camus', '2 rue Albert Camus, 59650 Villeneuve-d''Ascq', 'disponible', 310),
  ('ab000001-0001-0001-0001-000000000002', 'aa000001-0001-0001-0001-000000000001', 'CS-MON', 'Résidence Montaigne', '18 rue Francis de Pressensé, 59650 Villeneuve-d''Ascq', 'disponible', 198),
  ('ab000001-0001-0001-0001-000000000003', 'aa000001-0001-0001-0001-000000000002', 'PB-PRO', 'Résidence Prouvé', '5 avenue Paul Langevin, 59650 Villeneuve-d''Ascq', 'disponible', 145),
  ('ab000001-0001-0001-0001-000000000004', 'aa000001-0001-0001-0001-000000000003', 'SA-PAR', 'Résidence Parmentier', '42 rue Ambroise Paré, 59000 Lille', 'disponible', 120),
  ('ab000001-0001-0001-0001-000000000005', 'aa000001-0001-0001-0001-000000000005', 'FC-CHA', 'Résidence du Château', '1 allée du Château, 59650 Villeneuve-d''Ascq', 'disponible', 88),
  ('ab000001-0001-0001-0001-000000000006', 'aa000001-0001-0001-0001-000000000006', 'RT-FLE', 'Résidence des Fleurs', '19 rue des Fleurs, 59100 Roubaix', 'disponible', 142),
  ('ab000001-0001-0001-0001-000000000007', 'aa000001-0001-0001-0001-000000000007', 'AR-CIT', 'Résidence Cité Universitaire', '14 cité de la Brayelle, 62000 Arras', 'disponible', 210),
  ('ab000001-0001-0001-0001-000000000008', 'aa000001-0001-0001-0001-000000000010', 'LE-RES', 'Résidence Lens-Université', 'Rue de l''Université, 62300 Lens', 'disponible', 160),
  ('ab000001-0001-0001-0001-000000000009', 'aa000001-0001-0001-0001-000000000012', 'DK-POR', 'Résidence du Port', '2 avenue de l''Université, 59140 Dunkerque', 'disponible', 175),
  ('ab000001-0001-0001-0001-000000000010', 'aa000001-0001-0001-0001-000000000016', 'MH-VAL', 'Résidence Valenciennes', 'Le Mont Houy, 59313 Valenciennes', 'disponible', 220),
  ('ab000001-0001-0001-0001-000000000011', 'aa000001-0001-0001-0001-000000000020', 'AM-CAU', 'Résidence La Caulière', '55 rue Saint-Leu, 80000 Amiens', 'disponible', 156),
  ('ab000001-0001-0001-0001-000000000012', 'aa000001-0001-0001-0001-000000000020', 'AM-CIT', 'Résidence Citadelle', '7 rue des Jacobins, 80000 Amiens', 'disponible', 98);

INSERT INTO batiments (id, residence_id, code, nom, annee_construction, surface_totale, nombre_etages, statut, categorie) VALUES
  ('ac000001-0001-0001-0001-000000000001', 'ab000001-0001-0001-0001-000000000001', 'CAM-A', 'Bâtiment A', 1985, 4200, 8, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000002', 'ab000001-0001-0001-0001-000000000001', 'CAM-B', 'Bâtiment B', 1987, 3900, 8, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000003', 'ab000001-0001-0001-0001-000000000002', 'MON-P', 'Bâtiment Principal', 1992, 5100, 6, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000004', 'ab000001-0001-0001-0001-000000000007', 'AR-A', 'Bâtiment A', 1978, 3600, 7, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000005', 'ab000001-0001-0001-0001-000000000010', 'MH-T1', 'Tour 1', 1975, 6200, 12, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000006', 'ab000001-0001-0001-0001-000000000010', 'MH-T2', 'Tour 2', 1977, 6000, 12, 'en_maintenance', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000007', 'ab000001-0001-0001-0001-000000000011', 'AM-P', 'Bâtiment Principal', 1982, 4800, 9, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000008', 'ab000001-0001-0001-0001-000000000009', 'DK-M', 'Bâtiment Mer', 2005, 3200, 5, 'disponible', 'Résidentiel');

INSERT INTO etages (id, batiment_id, numero, nom, nombre_logements) VALUES
  ('ad000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000001', 0, 'Rez-de-chaussée', 6),
  ('ad000001-0001-0001-0001-000000000002', 'ac000001-0001-0001-0001-000000000001', 1, '1er étage', 18),
  ('ad000001-0001-0001-0001-000000000003', 'ac000001-0001-0001-0001-000000000001', 2, '2ème étage', 18),
  ('ad000001-0001-0001-0001-000000000004', 'ac000001-0001-0001-0001-000000000005', 0, 'Rez-de-chaussée', 4),
  ('ad000001-0001-0001-0001-000000000005', 'ac000001-0001-0001-0001-000000000005', 1, '1er étage', 10),
  ('ad000001-0001-0001-0001-000000000006', 'ac000001-0001-0001-0001-000000000007', 0, 'Rez-de-chaussée', 8),
  ('ad000001-0001-0001-0001-000000000007', 'ac000001-0001-0001-0001-000000000007', 1, '1er étage', 16);

INSERT INTO logements (id, etage_id, code, numero, type_logement, surface, statut) VALUES
  ('ae000001-0001-0001-0001-000000000001', 'ad000001-0001-0001-0001-000000000001', 'A-RDC-01', 'A-01', 'studio', 18, 'disponible'),
  ('ae000001-0001-0001-0001-000000000002', 'ad000001-0001-0001-0001-000000000001', 'A-RDC-02', 'A-02', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000003', 'ad000001-0001-0001-0001-000000000002', 'A-101', 'A-101', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000004', 'ad000001-0001-0001-0001-000000000002', 'A-102', 'A-102', 'T1', 24, 'disponible'),
  ('ae000001-0001-0001-0001-000000000005', 'ad000001-0001-0001-0001-000000000004', 'T1-RDC', 'T1-01', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000006', 'ad000001-0001-0001-0001-000000000006', 'AM-RDC', 'AM-01', 'T2', 36, 'disponible'),
  ('ae000001-0001-0001-0001-000000000007', 'ad000001-0001-0001-0001-000000000007', 'AM-101', 'AM-101', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000008', 'ad000001-0001-0001-0001-000000000007', 'AM-102', 'AM-102', 'studio', 18, 'en_maintenance');

INSERT INTO equipements (id, identifiant, designation, categorie, site_id, batiment_id, statut, etat, date_installation) VALUES
  ('af000001-0001-0001-0001-000000000001', 'ASC-CAM-A-001', 'Ascenseur Bât. A', 'Ascenseur', 'aa000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000001', 'disponible', 'bon', '2012-04-10'),
  ('af000001-0001-0001-0001-000000000002', 'CHA-CAM-001', 'Chaudière collective Camus', 'Chauffage', 'aa000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000001', 'disponible', 'correct', '2008-09-01'),
  ('af000001-0001-0001-0001-000000000003', 'TAB-MON-001', 'Tableau électrique TGBT', 'Électricité', 'aa000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000003', 'disponible', 'correct', '2001-03-15'),
  ('af000001-0001-0001-0001-000000000004', 'ASC-MH-T1-001', 'Ascenseur Tour 1', 'Ascenseur', 'aa000001-0001-0001-0001-000000000016', 'ac000001-0001-0001-0001-000000000005', 'disponible', 'bon', '2018-06-20'),
  ('af000001-0001-0001-0001-000000000005', 'CHA-MH-001', 'Chaudière Tour 2', 'Chauffage', 'aa000001-0001-0001-0001-000000000016', 'ac000001-0001-0001-0001-000000000006', 'en_maintenance', 'mauvais', '2000-11-10'),
  ('af000001-0001-0001-0001-000000000006', 'TAB-AM-001', 'Tableau électrique général', 'Électricité', 'aa000001-0001-0001-0001-000000000020', 'ac000001-0001-0001-0001-000000000007', 'disponible', 'correct', '1995-07-22'),
  ('af000001-0001-0001-0001-000000000007', 'CTA-DK-001', 'Centrale traitement d''air', 'Ventilation', 'aa000001-0001-0001-0001-000000000012', 'ac000001-0001-0001-0001-000000000008', 'disponible', 'bon', '2015-02-14'),
  ('af000001-0001-0001-0001-000000000008', 'ASC-AR-001', 'Ascenseur Arras', 'Ascenseur', 'aa000001-0001-0001-0001-000000000007', 'ac000001-0001-0001-0001-000000000004', 'disponible', 'correct', '2010-08-30');

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_dernier_controle, date_prochain_controle, statut, nb_conformes, nb_non_conformes, observations)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000001', 'aa000001-0001-0001-0001-000000000001',
  'SOCOTEC', '2024-03-15', '2025-03-15', 'en_retard', 12, 2, 'Deux prises défectueuses en RDC'
FROM types_controle tc WHERE tc.code = 'ELEC';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_dernier_controle, date_prochain_controle, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000001', 'aa000001-0001-0001-0001-000000000001',
  'APAVE', '2025-01-10', '2025-07-10', 'a_venir', 8, 0
FROM types_controle tc WHERE tc.code = 'ASCENSEUR';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_dernier_controle, date_prochain_controle, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000001', 'aa000001-0001-0001-0001-000000000001',
  'DEKRA', '2024-11-20', '2025-11-20', 'realise', 15, 0
FROM types_controle tc WHERE tc.code = 'SSI';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_prochain_controle, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000005', 'aa000001-0001-0001-0001-000000000016',
  'APAVE', '2025-06-30', 'a_venir', 0, 0
FROM types_controle tc WHERE tc.code = 'GAZ';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_dernier_controle, date_prochain_controle, statut, nb_conformes, nb_non_conformes, observations)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000005', 'aa000001-0001-0001-0001-000000000016',
  'APAVE', '2023-12-01', '2024-12-01', 'en_retard', 6, 1, 'Bouton d''alarme dysfonctionnel'
FROM types_controle tc WHERE tc.code = 'ASCENSEUR';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_prochain_controle, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000003', 'aa000001-0001-0001-0001-000000000001',
  'SECURITAS', '2025-09-01', 'a_venir', 0, 0
FROM types_controle tc WHERE tc.code = 'EXTINCTEUR';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_dernier_controle, date_prochain_controle, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000007', 'aa000001-0001-0001-0001-000000000020',
  'BUTAGAZ', '2025-02-14', '2026-02-14', 'realise', 4, 0
FROM types_controle tc WHERE tc.code = 'CHAUDIERE';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000004', 'aa000001-0001-0001-0001-000000000007',
  'manquant', 0, 0
FROM types_controle tc WHERE tc.code = 'AMIANTE';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_dernier_controle, date_prochain_controle, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000008', 'aa000001-0001-0001-0001-000000000012',
  'ALS QUALITY', '2025-04-01', '2025-10-01', 'a_venir', 3, 0
FROM types_controle tc WHERE tc.code = 'LEGIONELLES';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_dernier_controle, date_prochain_controle, statut, nb_conformes, nb_non_conformes, observations)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000007', 'aa000001-0001-0001-0001-000000000020',
  'BUREAU VERITAS', '2023-06-10', '2024-06-10', 'en_retard', 20, 3, 'Mise à la terre non conforme sur 3 circuits'
FROM types_controle tc WHERE tc.code = 'ELEC';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, organisme, date_prochain_controle, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000006', 'aa000001-0001-0001-0001-000000000016',
  'TECH AIR', '2025-08-15', 'a_venir', 0, 0
FROM types_controle tc WHERE tc.code = 'VMC';

INSERT INTO controles_reglementaires (type_controle_id, batiment_id, site_id, statut, nb_conformes, nb_non_conformes)
SELECT tc.id, 'ac000001-0001-0001-0001-000000000002', 'aa000001-0001-0001-0001-000000000001',
  'manquant', 0, 0
FROM types_controle tc WHERE tc.code = 'PMR';
