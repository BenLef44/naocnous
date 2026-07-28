/*
  # Restaurant Scolaire Ferry Jules — Résidence + Armoire positive

  1. Résidence "Restaurant Scolaire Ferry Jules" (id fixe pour appariement avec nœud limogesData)
  2. Équipement "Armoire positive 5°C ± 2°C 1361 L" dupliquée depuis la Manufacture des Tabacs
*/

-- 1. Résidence
INSERT INTO residences (id, site_id, code, nom, adresse, statut)
VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000001',
  'REST-FERRY',
  'Restaurant Scolaire Ferry Jules',
  '2 Rue Jules Ferry, 87000 Limoges',
  'disponible'
)
ON CONFLICT (id) DO UPDATE SET
  nom     = EXCLUDED.nom,
  site_id = EXCLUDED.site_id;

-- 2. Équipement Armoire positive (mêmes specs que Manufacture des Tabacs)
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
  caracteristiques,
  residence_id,
  site_id
)
VALUES (
  'c0000003-0000-0000-0000-000000000001',
  'EQ-FERRY-CUIS-001',
  'Armoire positive 5°C ± 2°C 1361 L',
  'Électroménager',
  'Réfrigération professionnelle',
  'Liebherr',
  'GKPV 1470',
  'LH-GKPV1470-2018-00127',
  'Bon',
  'Cuisine — Restaurant Scolaire Ferry Jules',
  '2018-04-03',
  jsonb_build_object(
    'volume_brut_L',               1361,
    'volume_utile_L',              1230,
    'temperature',                 '+2°C à +16°C',
    'reglage_temperature',         'Au 1/10°',
    'double_ventilation_axiale',   true,
    'grilles_plastifiees',         8,
    'passage_de_cuve_mm',         15,
    'date_fin_garantie',           '2028-04-02',
    'duree_garantie_ans',         10,
    'statut',                      'en_service'
  ),
  'c0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO UPDATE SET
  designation    = EXCLUDED.designation,
  marque         = EXCLUDED.marque,
  modele         = EXCLUDED.modele,
  caracteristiques = EXCLUDED.caracteristiques;
