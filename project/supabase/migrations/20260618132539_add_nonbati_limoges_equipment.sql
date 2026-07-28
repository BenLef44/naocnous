-- ── Site Non-bâti Ville de Limoges ──────────────────────────────────────────
INSERT INTO sites (id, nom, code, statut, adresse, ville, code_postal)
VALUES ('a0000001-0000-0000-0000-000000000001', 'Non-bâti – Ville de Limoges', 'LIM-NB', 'disponible', 'Ville de Limoges', 'Limoges', '87000')
ON CONFLICT (id) DO NOTHING;

-- ── Residences = sous-catégories Non-bâti ────────────────────────────────────
INSERT INTO residences (id, site_id, nom, code, statut)
VALUES
  ('a0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Parcs et jardins',           'LIM-NB-PAR', 'disponible'),
  ('a0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Places publiques',           'LIM-NB-PLA', 'disponible'),
  ('a0000002-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Voirie',                     'LIM-NB-VOI', 'disponible'),
  ('a0000002-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Sites sportifs extérieurs',  'LIM-NB-SPO', 'disponible')
ON CONFLICT (id) DO NOTHING;

-- ── Équipements — Parcs et jardins ───────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, etat, residence_id, localisation_detail) VALUES
  ('NB-PAR-001', 'Banc public',                        'Mobilier urbain',    'Bancs',             'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc Victor-Thuillat'),
  ('NB-PAR-002', 'Banc public',                        'Mobilier urbain',    'Bancs',             'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc de l''Aurence'),
  ('NB-PAR-003', 'Banc public',                        'Mobilier urbain',    'Bancs',             'en_maintenance', 'a0000002-0000-0000-0000-000000000001', 'Parc du Mas-Rome'),
  ('NB-PAR-004', 'Jeux pour enfants – module mixte',   'Mobilier urbain',    'Jeux enfants',      'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc Victor-Thuillat'),
  ('NB-PAR-005', 'Jeux pour enfants – toboggan',       'Mobilier urbain',    'Jeux enfants',      'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc de l''Aurence'),
  ('NB-PAR-006', 'Fontaine décorative',                'Fontainerie',        'Fontaines',         'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Jardin d''Orsay'),
  ('NB-PAR-007', 'Fontaine Wallace',                   'Fontainerie',        'Fontaines',         'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Jardin du Champ de Juillet'),
  ('NB-PAR-008', 'Arrosage automatique – secteur A',   'Espaces verts',      'Arrosage',          'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc de l''Auzette'),
  ('NB-PAR-009', 'Arrosage automatique – secteur B',   'Espaces verts',      'Arrosage',          'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc de la Borie'),
  ('NB-PAR-010', 'Caméra de surveillance PTZ',         'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc Victor-Thuillat – entrée'),
  ('NB-PAR-011', 'Caméra de surveillance fixe',        'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Parc de l''Aurence – entrée'),
  ('NB-PAR-012', 'Corbeille de propreté',              'Mobilier urbain',    'Mobilier divers',   'fonctionnel',    'a0000002-0000-0000-0000-000000000001', 'Jardins de l''Évêché')
ON CONFLICT (identifiant) DO NOTHING;

-- ── Équipements — Places publiques ───────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, etat, residence_id, localisation_detail) VALUES
  ('NB-PLA-001', 'Borne escamotable',                  'Sécurité / Accès',   'Bornes',            'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place de la République'),
  ('NB-PLA-002', 'Borne escamotable',                  'Sécurité / Accès',   'Bornes',            'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place de la Motte'),
  ('NB-PLA-003', 'Borne escamotable',                  'Sécurité / Accès',   'Bornes',            'hors_service',   'a0000002-0000-0000-0000-000000000002', 'Place Denis-Dussoubs'),
  ('NB-PLA-004', 'Candélabre – ambiance',              'Éclairage public',   'Candélabres',       'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place de la République'),
  ('NB-PLA-005', 'Candélabre – ambiance',              'Éclairage public',   'Candélabres',       'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place Carnot'),
  ('NB-PLA-006', 'Candélabre – mât haut',              'Éclairage public',   'Candélabres',       'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place Jourdan'),
  ('NB-PLA-007', 'Fontaine Wallace',                   'Fontainerie',        'Fontaines',         'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place des Bancs'),
  ('NB-PLA-008', 'Fontaine monumentale',               'Fontainerie',        'Fontaines',         'en_maintenance', 'a0000002-0000-0000-0000-000000000002', 'Place Léon-Betoulle'),
  ('NB-PLA-009', 'Banc public',                        'Mobilier urbain',    'Bancs',             'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place de la République'),
  ('NB-PLA-010', 'Banc public',                        'Mobilier urbain',    'Bancs',             'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place d''Aine'),
  ('NB-PLA-011', 'Caméra PTZ',                         'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place de la République'),
  ('NB-PLA-012', 'Caméra fixe',                        'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place de la Motte'),
  ('NB-PLA-013', 'Panneau d''information',             'Mobilier urbain',    'Mobilier divers',   'fonctionnel',    'a0000002-0000-0000-0000-000000000002', 'Place Winston-Churchill')
ON CONFLICT (identifiant) DO NOTHING;

-- ── Équipements — Voirie ─────────────────────────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, etat, residence_id, localisation_detail) VALUES
  ('NB-VOI-001', 'Candélabre LED – avenue',            'Éclairage public',   'Candélabres',       'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Avenue Garibaldi'),
  ('NB-VOI-002', 'Candélabre LED – avenue',            'Éclairage public',   'Candélabres',       'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Avenue du Général-Leclerc'),
  ('NB-VOI-003', 'Candélabre LED – boulevard',         'Éclairage public',   'Candélabres',       'en_maintenance', 'a0000002-0000-0000-0000-000000000003', 'Boulevard de Vanteaux'),
  ('NB-VOI-004', 'Candélabre LED – boulevard',         'Éclairage public',   'Candélabres',       'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Boulevard Bel-Air'),
  ('NB-VOI-005', 'Feu tricolore – carrefour',          'Signalisation',      'Feux',              'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Av. Garibaldi × Rue Chénieux'),
  ('NB-VOI-006', 'Feu tricolore – carrefour',          'Signalisation',      'Feux',              'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Av. Labussière × Bd Bel-Air'),
  ('NB-VOI-007', 'Feu tricolore – piéton',             'Signalisation',      'Feux',              'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Rue François-Chénieux'),
  ('NB-VOI-008', 'Panneau B1 – sens interdit',         'Signalisation',      'Panneaux',          'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Boulevard de la Corderie'),
  ('NB-VOI-009', 'Panneau B2 – cédez le passage',      'Signalisation',      'Panneaux',          'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Rue Théodore-Bac'),
  ('NB-VOI-010', 'Borne escamotable',                  'Sécurité / Accès',   'Bornes',            'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Berges de Vienne – Font Pinot'),
  ('NB-VOI-011', 'Caméra surveillance axiale',         'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Avenue du Général-Leclerc'),
  ('NB-VOI-012', 'Caméra surveillance axiale',         'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000003', 'Coulée verte de l''Auzette')
ON CONFLICT (identifiant) DO NOTHING;

-- ── Équipements — Sites sportifs extérieurs ───────────────────────────────────
INSERT INTO equipements (identifiant, designation, categorie, sous_categorie, etat, residence_id, localisation_detail) VALUES
  ('NB-SPO-001', 'Terrain synthétique football 11',    'Équipements sportifs','Terrains',         'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade de Beaublanc'),
  ('NB-SPO-002', 'Terrain synthétique football 7',     'Équipements sportifs','Terrains',         'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Terrain Beaubreuil'),
  ('NB-SPO-003', 'Terrain synthétique rugby',          'Équipements sportifs','Terrains',         'en_maintenance', 'a0000002-0000-0000-0000-000000000004', 'Terrain rugby Beaublanc'),
  ('NB-SPO-004', 'Piste d''athlétisme tartan',         'Équipements sportifs','Terrains',         'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade de Beaublanc'),
  ('NB-SPO-005', 'Tribune – gradins fixes',            'Équipements sportifs','Tribunes',         'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade de Beaublanc'),
  ('NB-SPO-006', 'Tribune visiteurs – gradins mobiles','Équipements sportifs','Tribunes',         'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade Landouge'),
  ('NB-SPO-007', 'Portail d''accès principal',         'Sécurité / Accès',   'Portails',          'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade de Beaublanc'),
  ('NB-SPO-008', 'Portail d''accès secondaire',        'Sécurité / Accès',   'Portails',          'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Complexe de la Borie'),
  ('NB-SPO-009', 'Clôture grillagée périmétrique',     'Sécurité / Accès',   'Clôtures',          'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade Saint-Lazare'),
  ('NB-SPO-010', 'Clôture anti-intrusion',             'Sécurité / Accès',   'Clôtures',          'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade des Casseaux'),
  ('NB-SPO-011', 'Caméra dôme – entrée',               'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Stade de Beaublanc – entrée'),
  ('NB-SPO-012', 'Caméra dôme – terrain',              'Vidéosurveillance',  'Caméras',           'fonctionnel',    'a0000002-0000-0000-0000-000000000004', 'Terrain Beaubreuil – accès')
ON CONFLICT (identifiant) DO NOTHING;
