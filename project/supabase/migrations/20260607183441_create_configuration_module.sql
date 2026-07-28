
-- ── Config profils (rôles métiers) ──────────────────────────────────────────
CREATE TABLE config_profils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '?',
  actif BOOLEAN DEFAULT true,
  dashboard_defaut TEXT DEFAULT 'maintenance',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE config_profils ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_config_profils" ON config_profils FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_config_profils" ON config_profils FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_config_profils" ON config_profils FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_config_profils" ON config_profils FOR DELETE TO anon, authenticated USING (true);

-- ── Config profil modules ────────────────────────────────────────────────────
CREATE TABLE config_profil_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profil_id UUID REFERENCES config_profils(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  peut_voir BOOLEAN DEFAULT true,
  peut_creer BOOLEAN DEFAULT false,
  peut_modifier BOOLEAN DEFAULT false,
  peut_supprimer BOOLEAN DEFAULT false,
  peut_exporter BOOLEAN DEFAULT false,
  peut_administrer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profil_id, module_id)
);

ALTER TABLE config_profil_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_config_profil_modules" ON config_profil_modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_config_profil_modules" ON config_profil_modules FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_config_profil_modules" ON config_profil_modules FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_config_profil_modules" ON config_profil_modules FOR DELETE TO anon, authenticated USING (true);

-- ── Config utilisateurs ──────────────────────────────────────────────────────
CREATE TABLE config_utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  profil_id UUID REFERENCES config_profils(id),
  actif BOOLEAN DEFAULT true,
  perimetre TEXT,
  service TEXT,
  telephone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE config_utilisateurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_config_utilisateurs" ON config_utilisateurs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_config_utilisateurs" ON config_utilisateurs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_config_utilisateurs" ON config_utilisateurs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_config_utilisateurs" ON config_utilisateurs FOR DELETE TO anon, authenticated USING (true);

-- ── Config perimètres ────────────────────────────────────────────────────────
CREATE TABLE config_perimetres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES config_perimetres(id),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE config_perimetres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_config_perimetres" ON config_perimetres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_config_perimetres" ON config_perimetres FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_config_perimetres" ON config_perimetres FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_config_perimetres" ON config_perimetres FOR DELETE TO anon, authenticated USING (true);

-- ── Journal d'administration ─────────────────────────────────────────────────
CREATE TABLE config_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_action TIMESTAMPTZ DEFAULT NOW(),
  utilisateur_nom TEXT NOT NULL DEFAULT 'Administrateur',
  type_action TEXT NOT NULL,
  objet_type TEXT NOT NULL,
  objet_nom TEXT NOT NULL,
  ancienne_valeur TEXT,
  nouvelle_valeur TEXT,
  details TEXT
);

ALTER TABLE config_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_config_journal" ON config_journal FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_config_journal" ON config_journal FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Seed: profils ────────────────────────────────────────────────────────────
INSERT INTO config_profils (nom, description, emoji, dashboard_defaut) VALUES
  ('Agent maintenance',              'Interventions, équipements et maintenance préventive',        'AP',  'maintenance'),
  ('Responsable maintenance',        'Interventions, maintenance, approvisionnements, équipements', 'RM',  'maintenance'),
  ('Responsable reglementaire',      'Réglementaire, équipements et contrôles',                    'RR',  'reglementaire'),
  ('Gestionnaire approvisionnements','Stocks, achats et fournisseurs',                              'GA',  'approvisionnements'),
  ('Gestionnaire patrimoine',        'Accès à tous les modules',                                   'GP',  'direction'),
  ('Direction',                      'Dashboards, reporting, budgets et contrats',                 'DIR', 'direction'),
  ('Prestataire',                    'Ses interventions, contrats et documents uniquement',        'PRE', 'maintenance');

-- ── Seed: modules par profil ─────────────────────────────────────────────────
INSERT INTO config_profil_modules (profil_id, module_id, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter)
SELECT id, m, true, true, true, false, false
FROM config_profils, unnest(ARRAY['interventions','equipements','maintenance']) AS m
WHERE nom = 'Agent maintenance';

INSERT INTO config_profil_modules (profil_id, module_id, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter)
SELECT id, m, true, true, true, true, true
FROM config_profils, unnest(ARRAY['interventions','maintenance','approvisionnements','equipements']) AS m
WHERE nom = 'Responsable maintenance';

INSERT INTO config_profil_modules (profil_id, module_id, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter)
SELECT id, m, true, true, true, false, true
FROM config_profils, unnest(ARRAY['reglementaire','equipements','contrats']) AS m
WHERE nom = 'Responsable reglementaire';

INSERT INTO config_profil_modules (profil_id, module_id, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter)
SELECT id, m, true, true, true, true, true
FROM config_profils, unnest(ARRAY['approvisionnements','finance','contrats']) AS m
WHERE nom = 'Gestionnaire approvisionnements';

INSERT INTO config_profil_modules (profil_id, module_id, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter, peut_administrer)
SELECT id, m, true, true, true, true, true, true
FROM config_profils, unnest(ARRAY['interventions','arborescence','equipements','documents','contrats','reglementaire','edl','ppi','finance','fluides','predictif','approvisionnements','communication','configuration']) AS m
WHERE nom = 'Gestionnaire patrimoine';

INSERT INTO config_profil_modules (profil_id, module_id, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter)
SELECT id, m, true, false, false, false, true
FROM config_profils, unnest(ARRAY['finance','contrats','ppi','fluides','reglementaire']) AS m
WHERE nom = 'Direction';

INSERT INTO config_profil_modules (profil_id, module_id, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter)
SELECT id, m, true, false, false, false, false
FROM config_profils, unnest(ARRAY['interventions','contrats','documents']) AS m
WHERE nom = 'Prestataire';

-- ── Seed: périmètres ──────────────────────────────────────────────────────────
INSERT INTO config_perimetres (type, nom, description) VALUES
  ('CROUS',     'CROUS de Lyon',                 'Établissement principal'),
  ('Campus',    'Campus Centre Lyon 6',           'Campus principal centre-ville'),
  ('Campus',    'Campus Manufacture des Tabacs',  'Campus historique manufactures'),
  ('Campus',    'Campus Rockefeller',             'Campus médical'),
  ('Campus',    'Campus Nord',                    'Campus nord Villeurbanne'),
  ('Service',   'Maintenance',                    'Service technique maintenance'),
  ('Service',   'Réglementaire',                  'Service sécurité et réglementaire'),
  ('Service',   'Direction',                      'Direction générale'),
  ('Patrimoine','Patrimoine complet',              'Accès complet au patrimoine CROUS');

-- ── Seed: utilisateurs ────────────────────────────────────────────────────────
INSERT INTO config_utilisateurs (nom, prenom, email, profil_id, service, perimetre, actif)
SELECT 'Administrateur', 'Système', 'admin@crous-lyon.fr', id, 'Direction', 'Patrimoine complet', true
FROM config_profils WHERE nom = 'Gestionnaire patrimoine' LIMIT 1;

INSERT INTO config_utilisateurs (nom, prenom, email, profil_id, service, perimetre, actif)
SELECT 'Dupont', 'Martin', 'martin.dupont@crous-lyon.fr', id, 'Maintenance', 'Campus Centre Lyon 6', true
FROM config_profils WHERE nom = 'Agent maintenance' LIMIT 1;

INSERT INTO config_utilisateurs (nom, prenom, email, profil_id, service, perimetre, actif)
SELECT 'Leroy', 'Sophie', 'sophie.leroy@crous-lyon.fr', id, 'Maintenance', 'Campus Manufacture des Tabacs', true
FROM config_profils WHERE nom = 'Responsable maintenance' LIMIT 1;

INSERT INTO config_utilisateurs (nom, prenom, email, profil_id, service, perimetre, actif)
SELECT 'Bernard', 'Claire', 'claire.bernard@crous-lyon.fr', id, 'Réglementaire', 'Patrimoine complet', true
FROM config_profils WHERE nom = 'Responsable reglementaire' LIMIT 1;

INSERT INTO config_utilisateurs (nom, prenom, email, profil_id, service, perimetre, actif)
SELECT 'Laurent', 'Emmanuel', 'emmanuel.laurent@crous-lyon.fr', id, 'Direction', 'Patrimoine complet', true
FROM config_profils WHERE nom = 'Direction' LIMIT 1;

-- ── Seed: journal ────────────────────────────────────────────────────────────
INSERT INTO config_journal (date_action, utilisateur_nom, type_action, objet_type, objet_nom, details) VALUES
  (NOW() - INTERVAL '2 days', 'Administrateur', 'Création',     'Profil',      'Agent maintenance',       'Profil créé avec 3 modules accessibles'),
  (NOW() - INTERVAL '2 days', 'Administrateur', 'Création',     'Profil',      'Responsable maintenance',  'Profil créé avec 4 modules accessibles'),
  (NOW() - INTERVAL '1 day',  'Administrateur', 'Création',     'Utilisateur', 'Martin Dupont',            'Profil : Agent maintenance — Périmètre : Campus Centre'),
  (NOW() - INTERVAL '1 day',  'Administrateur', 'Modification', 'Profil',      'Direction',                'Ajout du module Fluides au profil Direction'),
  (NOW() - INTERVAL '5 hours','Administrateur', 'Création',     'Périmètre',   'Campus Nord',              'Nouveau périmètre campus ajouté'),
  (NOW() - INTERVAL '1 hour', 'Administrateur', 'Modification', 'Utilisateur', 'Sophie Leroy',             'Périmètre étendu à Campus Manufacture');
