/*
  # Seed official CROUS Hauts-de-France residences

  Replaces demo residences with the full official list, mapped to correct campuses.
  Note: some campus groupings in the user list map to multiple sites in our DB:
  - "Villeneuve-d'Ascq autres secteurs" → Campus Flers-Château (FC)
  - "Lille Centre / Moulins / Santé" → Campus Lille-Moulins (MO) + Campus Santé (SA)
  - "Lens / Liévin" → Campus Lens (LE) + Campus Liévin (LV)
  - "Valenciennes ..." → Campus Mont Houy (MH) + Campus Tertiales (TE)
  - "Saint-Omer / Longuenesse" → Campus Saint-Omer (SO)
*/

DELETE FROM actions_correctives;
DELETE FROM points_controle;
DELETE FROM controles_reglementaires;
DELETE FROM equipements;
DELETE FROM logements;
DELETE FROM etages;
DELETE FROM batiments;
DELETE FROM residences;

-- ============================================================
-- Campus Cité Scientifique (aa000001-0001-0001-0001-000000000001)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000001', 'aa000001-0001-0001-0001-000000000001', 'CS-CAM', 'Résidence Albert Camus', 'disponible', 310),
  ('ba000001-0001-0001-0001-000000000002', 'aa000001-0001-0001-0001-000000000001', 'CS-EVA', 'Résidence Evariste', 'disponible', 124),
  ('ba000001-0001-0001-0001-000000000003', 'aa000001-0001-0001-0001-000000000001', 'CS-GAL', 'Résidence Galois Village', 'disponible', 280),
  ('ba000001-0001-0001-0001-000000000004', 'aa000001-0001-0001-0001-000000000001', 'CS-BAC', 'Résidence Gaston Bachelard', 'disponible', 198),
  ('ba000001-0001-0001-0001-000000000005', 'aa000001-0001-0001-0001-000000000001', 'CS-HEB', 'Résidence Hélène Boucher', 'disponible', 145),
  ('ba000001-0001-0001-0001-000000000006', 'aa000001-0001-0001-0001-000000000001', 'CS-KRO', 'Résidence Kromos''Home', 'disponible', 88),
  ('ba000001-0001-0001-0001-000000000007', 'aa000001-0001-0001-0001-000000000001', 'CS-PYT', 'Résidence Pythagore', 'disponible', 162);

-- ============================================================
-- Campus Pont-de-Bois (aa000001-0001-0001-0001-000000000002)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000008', 'aa000001-0001-0001-0001-000000000002', 'PB-PDB', 'Résidence Pont de Bois', 'disponible', 320);

-- ============================================================
-- Campus Flers-Château = "Villeneuve-d'Ascq autres secteurs"
-- (aa000001-0001-0001-0001-000000000005)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000009', 'aa000001-0001-0001-0001-000000000005', 'FC-EIF', 'Résidence Gustave Eiffel', 'disponible', 175),
  ('ba000001-0001-0001-0001-000000000010', 'aa000001-0001-0001-0001-000000000005', 'FC-BEL', 'Résidence Le Belvédère', 'disponible', 96),
  ('ba000001-0001-0001-0001-000000000011', 'aa000001-0001-0001-0001-000000000005', 'FC-COR', 'Résidence Le Corbusier', 'disponible', 140),
  ('ba000001-0001-0001-0001-000000000012', 'aa000001-0001-0001-0001-000000000005', 'FC-BAR', 'Résidence René Barjavel', 'disponible', 112),
  ('ba000001-0001-0001-0001-000000000013', 'aa000001-0001-0001-0001-000000000005', 'FC-TRI', 'Résidence Triolo', 'disponible', 230);

-- ============================================================
-- Campus Lille-Moulins = "Lille Centre / Moulins / Santé" (part 1)
-- (aa000001-0001-0001-0001-000000000004)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000014', 'aa000001-0001-0001-0001-000000000004', 'MO-CHA', 'Résidence Albert Châtelet', 'disponible', 132),
  ('ba000001-0001-0001-0001-000000000015', 'aa000001-0001-0001-0001-000000000004', 'MO-ARS', 'Résidence Arsenal des Postes', 'disponible', 78),
  ('ba000001-0001-0001-0001-000000000016', 'aa000001-0001-0001-0001-000000000004', 'MO-LIE', 'Résidence Bas Liévin', 'disponible', 96),
  ('ba000001-0001-0001-0001-000000000017', 'aa000001-0001-0001-0001-000000000004', 'MO-COU', 'Résidence Courmont', 'disponible', 108),
  ('ba000001-0001-0001-0001-000000000018', 'aa000001-0001-0001-0001-000000000004', 'MO-FIV', 'Résidence Fives', 'disponible', 154),
  ('ba000001-0001-0001-0001-000000000019', 'aa000001-0001-0001-0001-000000000004', 'MO-LEF', 'Résidence Georges Lefèvre', 'disponible', 120),
  ('ba000001-0001-0001-0001-000000000020', 'aa000001-0001-0001-0001-000000000004', 'MO-MAU', 'Résidence Guy de Maupassant', 'disponible', 88),
  ('ba000001-0001-0001-0001-000000000021', 'aa000001-0001-0001-0001-000000000004', 'MO-ZAY', 'Résidence Jean Zay', 'disponible', 180),
  ('ba000001-0001-0001-0001-000000000022', 'aa000001-0001-0001-0001-000000000004', 'MO-MPC', 'Résidence Moulins Parc Centre', 'disponible', 210),
  ('ba000001-0001-0001-0001-000000000023', 'aa000001-0001-0001-0001-000000000004', 'MO-ROB', 'Résidence Robespierre', 'disponible', 144);

-- Campus Santé = "Lille Centre / Moulins / Santé" (part 2)
-- (aa000001-0001-0001-0001-000000000003)
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000024', 'aa000001-0001-0001-0001-000000000003', 'SA-MER', 'Résidence Jean Mermoz', 'disponible', 165);

-- ============================================================
-- Campus Roubaix-Tourcoing (aa000001-0001-0001-0001-000000000006)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000025', 'aa000001-0001-0001-0001-000000000006', 'RT-217', 'Résidence 217', 'disponible', 92),
  ('ba000001-0001-0001-0001-000000000026', 'aa000001-0001-0001-0001-000000000006', 'RT-GRR', 'Résidence Grand Rue', 'disponible', 76),
  ('ba000001-0001-0001-0001-000000000027', 'aa000001-0001-0001-0001-000000000006', 'RT-LIB', 'Résidence Liberté', 'disponible', 118),
  ('ba000001-0001-0001-0001-000000000028', 'aa000001-0001-0001-0001-000000000006', 'RT-TIL', 'Résidence Les Tilleuls', 'disponible', 134),
  ('ba000001-0001-0001-0001-000000000029', 'aa000001-0001-0001-0001-000000000006', 'RT-SBA', 'Résidence Sainte-Barbe', 'disponible', 98);

-- ============================================================
-- Campus Arras (aa000001-0001-0001-0001-000000000007)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000030', 'aa000001-0001-0001-0001-000000000007', 'AR-CIT', 'Résidence de la Citadelle', 'disponible', 210),
  ('ba000001-0001-0001-0001-000000000031', 'aa000001-0001-0001-0001-000000000007', 'AR-ART', 'Résidence de l''Artois', 'disponible', 156),
  ('ba000001-0001-0001-0001-000000000032', 'aa000001-0001-0001-0001-000000000007', 'AR-BER', 'Résidence Georges Bernanos', 'disponible', 88),
  ('ba000001-0001-0001-0001-000000000033', 'aa000001-0001-0001-0001-000000000007', 'AR-TEM', 'Résidence Les Templiers', 'disponible', 124);

-- ============================================================
-- Campus Béthune (aa000001-0001-0001-0001-000000000008)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000034', 'aa000001-0001-0001-0001-000000000008', 'BE-GER', 'Résidence Gérard Philipe', 'disponible', 112);

-- ============================================================
-- Campus Lens (aa000001-0001-0001-0001-000000000010)
-- Campus Liévin (aa000001-0001-0001-0001-000000000011)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000035', 'aa000001-0001-0001-0001-000000000010', 'LE-ALI', 'Résidence Alice Milliat', 'disponible', 148),
  ('ba000001-0001-0001-0001-000000000036', 'aa000001-0001-0001-0001-000000000011', 'LV-MOR', 'Résidence Moreau', 'disponible', 96);

-- ============================================================
-- Campus Boulogne-sur-Mer (aa000001-0001-0001-0001-000000000014)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000037', 'aa000001-0001-0001-0001-000000000014', 'BM-DAN', 'Résidence Danrémont', 'disponible', 120),
  ('ba000001-0001-0001-0001-000000000038', 'aa000001-0001-0001-0001-000000000014', 'BM-VIV', 'Résidence du Vivier', 'disponible', 84),
  ('ba000001-0001-0001-0001-000000000039', 'aa000001-0001-0001-0001-000000000014', 'BM-STL', 'Résidence Saint-Louis', 'disponible', 102);

-- ============================================================
-- Campus Calais (aa000001-0001-0001-0001-000000000013)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000040', 'aa000001-0001-0001-0001-000000000013', 'CA-GAM', 'Résidence Gambetta', 'disponible', 138);

-- ============================================================
-- Campus Dunkerque (aa000001-0001-0001-0001-000000000012)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000041', 'aa000001-0001-0001-0001-000000000012', 'DK-DUN', 'Résidence Dunkerque', 'disponible', 175);

-- ============================================================
-- Campus Saint-Omer (aa000001-0001-0001-0001-000000000015)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000042', 'aa000001-0001-0001-0001-000000000015', 'SO-OLY', 'Résidence Olympie', 'disponible', 94);

-- ============================================================
-- Campus Mont Houy (aa000001-0001-0001-0001-000000000016)
-- Campus Tertiales (aa000001-0001-0001-0001-000000000017)
-- "Valenciennes / Aulnoy / Famars"
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000043', 'aa000001-0001-0001-0001-000000000016', 'MH-ANS', 'Résidence Gustave Ansart', 'disponible', 220),
  ('ba000001-0001-0001-0001-000000000044', 'aa000001-0001-0001-0001-000000000016', 'MH-MAR', 'Résidence Jules Marmottan', 'disponible', 168),
  ('ba000001-0001-0001-0001-000000000045', 'aa000001-0001-0001-0001-000000000016', 'MH-MOU', 'Résidence Jules Mousseron', 'disponible', 142),
  ('ba000001-0001-0001-0001-000000000046', 'aa000001-0001-0001-0001-000000000017', 'TE-TER', 'Résidence Les Tertiales', 'disponible', 196);

-- ============================================================
-- Campus Cambrai (aa000001-0001-0001-0001-000000000018)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000047', 'aa000001-0001-0001-0001-000000000018', 'CB-ROC', 'Résidence Saint-Roch', 'disponible', 108);

-- ============================================================
-- Campus Maubeuge (aa000001-0001-0001-0001-000000000019)
-- ============================================================
INSERT INTO residences (id, site_id, code, nom, statut, nombre_logements) VALUES
  ('ba000001-0001-0001-0001-000000000048', 'aa000001-0001-0001-0001-000000000019', 'MA-ADR', 'Résidence Gaston Adriensence', 'disponible', 86);

-- ============================================================
-- Demo batiments linked to new residence IDs
-- ============================================================
INSERT INTO batiments (id, residence_id, code, nom, annee_construction, surface_totale, nombre_etages, statut, categorie) VALUES
  ('ac000001-0001-0001-0001-000000000001', 'ba000001-0001-0001-0001-000000000001', 'CAM-A', 'Bâtiment A', 1985, 4200, 8, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000002', 'ba000001-0001-0001-0001-000000000001', 'CAM-B', 'Bâtiment B', 1987, 3900, 8, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000003', 'ba000001-0001-0001-0001-000000000004', 'BAC-P', 'Bâtiment Principal', 1992, 5100, 6, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000004', 'ba000001-0001-0001-0001-000000000030', 'AR-A', 'Bâtiment A', 1978, 3600, 7, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000005', 'ba000001-0001-0001-0001-000000000043', 'MH-T1', 'Tour 1', 1975, 6200, 12, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000006', 'ba000001-0001-0001-0001-000000000043', 'MH-T2', 'Tour 2', 1977, 6000, 12, 'en_maintenance', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000007', 'ba000001-0001-0001-0001-000000000011', 'AM-P', 'Bâtiment Principal', 1982, 4800, 9, 'disponible', 'Résidentiel'),
  ('ac000001-0001-0001-0001-000000000008', 'ba000001-0001-0001-0001-000000000041', 'DK-M', 'Bâtiment Mer', 2005, 3200, 5, 'disponible', 'Résidentiel');

-- Etages
INSERT INTO etages (id, batiment_id, numero, nom, nombre_logements) VALUES
  ('ad000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000001', 0, 'Rez-de-chaussée', 6),
  ('ad000001-0001-0001-0001-000000000002', 'ac000001-0001-0001-0001-000000000001', 1, '1er étage', 18),
  ('ad000001-0001-0001-0001-000000000003', 'ac000001-0001-0001-0001-000000000001', 2, '2ème étage', 18),
  ('ad000001-0001-0001-0001-000000000004', 'ac000001-0001-0001-0001-000000000005', 0, 'Rez-de-chaussée', 4),
  ('ad000001-0001-0001-0001-000000000005', 'ac000001-0001-0001-0001-000000000005', 1, '1er étage', 10),
  ('ad000001-0001-0001-0001-000000000006', 'ac000001-0001-0001-0001-000000000007', 0, 'Rez-de-chaussée', 8),
  ('ad000001-0001-0001-0001-000000000007', 'ac000001-0001-0001-0001-000000000007', 1, '1er étage', 16);

-- Logements
INSERT INTO logements (id, etage_id, code, numero, type_logement, surface, statut) VALUES
  ('ae000001-0001-0001-0001-000000000001', 'ad000001-0001-0001-0001-000000000001', 'A-RDC-01', 'A-01', 'studio', 18, 'disponible'),
  ('ae000001-0001-0001-0001-000000000002', 'ad000001-0001-0001-0001-000000000001', 'A-RDC-02', 'A-02', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000003', 'ad000001-0001-0001-0001-000000000002', 'A-101', 'A-101', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000004', 'ad000001-0001-0001-0001-000000000002', 'A-102', 'A-102', 'T1', 24, 'disponible'),
  ('ae000001-0001-0001-0001-000000000005', 'ad000001-0001-0001-0001-000000000004', 'T1-RDC', 'T1-01', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000006', 'ad000001-0001-0001-0001-000000000006', 'AM-RDC', 'AM-01', 'T2', 36, 'disponible'),
  ('ae000001-0001-0001-0001-000000000007', 'ad000001-0001-0001-0001-000000000007', 'AM-101', 'AM-101', 'studio', 18, 'indisponible'),
  ('ae000001-0001-0001-0001-000000000008', 'ad000001-0001-0001-0001-000000000007', 'AM-102', 'AM-102', 'studio', 18, 'en_maintenance');

-- Equipements
INSERT INTO equipements (id, identifiant, designation, categorie, site_id, batiment_id, statut, etat, date_installation) VALUES
  ('af000001-0001-0001-0001-000000000001', 'ASC-CAM-A-001', 'Ascenseur Bât. A', 'Ascenseur', 'aa000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000001', 'disponible', 'bon', '2012-04-10'),
  ('af000001-0001-0001-0001-000000000002', 'CHA-CAM-001', 'Chaudière collective Camus', 'Chauffage', 'aa000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000001', 'disponible', 'correct', '2008-09-01'),
  ('af000001-0001-0001-0001-000000000003', 'TAB-BAC-001', 'Tableau électrique TGBT', 'Électricité', 'aa000001-0001-0001-0001-000000000001', 'ac000001-0001-0001-0001-000000000003', 'disponible', 'correct', '2001-03-15'),
  ('af000001-0001-0001-0001-000000000004', 'ASC-MH-T1-001', 'Ascenseur Tour 1', 'Ascenseur', 'aa000001-0001-0001-0001-000000000016', 'ac000001-0001-0001-0001-000000000005', 'disponible', 'bon', '2018-06-20'),
  ('af000001-0001-0001-0001-000000000005', 'CHA-MH-001', 'Chaudière Tour 2', 'Chauffage', 'aa000001-0001-0001-0001-000000000016', 'ac000001-0001-0001-0001-000000000006', 'en_maintenance', 'mauvais', '2000-11-10'),
  ('af000001-0001-0001-0001-000000000006', 'CTA-DK-001', 'Centrale traitement d''air', 'Ventilation', 'aa000001-0001-0001-0001-000000000012', 'ac000001-0001-0001-0001-000000000008', 'disponible', 'bon', '2015-02-14'),
  ('af000001-0001-0001-0001-000000000007', 'ASC-AR-001', 'Ascenseur Arras', 'Ascenseur', 'aa000001-0001-0001-0001-000000000007', 'ac000001-0001-0001-0001-000000000004', 'disponible', 'correct', '2010-08-30'),
  ('af000001-0001-0001-0001-000000000008', 'TAB-COR-001', 'Tableau TGBT Le Corbusier', 'Électricité', 'aa000001-0001-0001-0001-000000000005', 'ac000001-0001-0001-0001-000000000007', 'disponible', 'correct', '2005-11-18');

-- Controles reglementaires
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
SELECT tc.id, 'ac000001-0001-0001-0001-000000000007', 'aa000001-0001-0001-0001-000000000005',
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
SELECT tc.id, 'ac000001-0001-0001-0001-000000000006', 'aa000001-0001-0001-0001-000000000016',
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
