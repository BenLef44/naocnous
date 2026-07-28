/*
  # Campus Manufacture des Tabacs — Resto'U + Cuisine + Armoire positive

  1. Rename
     - Site "Campus Berges du Rhône / Manufacture des Tabacs"
       → "Campus de la Manufacture des Tabacs"

  2. New residence
     - "Resto'U Manufacture des Tabacs" rattachée au campus (id fixe)

  3. New bâtiment (used as sub-site "Cuisine")
     - "Cuisine" rattachée à la résidence Resto'U (id fixe)

  4. New equipment
     - "Armoire positive 5°C ± 2°C 1361 L" Liebherr GKPV 1470
       rattachée au bâtiment Cuisine, avec toutes les caractéristiques techniques
*/

-- 0. Rename campus
UPDATE sites
SET nom = 'Campus de la Manufacture des Tabacs'
WHERE id = 'a1000001-0000-0000-0000-000000000004';

-- 1. Resto'U Manufacture des Tabacs (résidence)
INSERT INTO residences (id, site_id, code, nom, adresse, nombre_logements)
VALUES (
  'b2000001-0000-0000-0000-000000000001',
  'a1000001-0000-0000-0000-000000000004',
  'RESTU-MANU',
  'Resto''U Manufacture des Tabacs',
  'Rue du Professeur Rollet, 69003 Lyon',
  0
)
ON CONFLICT (id) DO UPDATE SET
  nom     = EXCLUDED.nom,
  site_id = EXCLUDED.site_id;

-- 2. Cuisine (bâtiment enfant du Resto'U)
INSERT INTO batiments (id, residence_id, code, nom, nombre_etages)
VALUES (
  'b2000002-0000-0000-0000-000000000001',
  'b2000001-0000-0000-0000-000000000001',
  'MANU-CUIS',
  'Cuisine',
  0
)
ON CONFLICT (id) DO UPDATE SET
  nom          = EXCLUDED.nom,
  residence_id = EXCLUDED.residence_id;

-- 3. Équipement Armoire positive
INSERT INTO equipements (
  id,
  identifiant,
  designation,
  categorie,
  sous_categorie,
  marque,
  modele,
  numero_serie,
  etat,
  localisation_detail,
  date_mise_en_service,
  garantie_fin,
  batiment_id,
  residence_id,
  site_id
)
VALUES (
  'c3000001-0000-0000-0000-000000000001',
  'EQ-MANU-CUIS-001',
  'Armoire positive 5°C ± 2°C 1361 L',
  'Électroménager',
  'Réfrigération professionnelle',
  'Liebherr',
  'GKPV 1470',
  'LH-GKPV1470-2022-00341',
  'Bon',
  'Cuisine — Niv. -1 — R.U Manufacture des Tabacs',
  '2022-09-15',
  '2027-09-15',
  'b2000002-0000-0000-0000-000000000001',
  'b2000001-0000-0000-0000-000000000001',
  'a1000001-0000-0000-0000-000000000004'
)
ON CONFLICT (id) DO UPDATE SET
  designation = EXCLUDED.designation,
  marque      = EXCLUDED.marque,
  modele      = EXCLUDED.modele;
