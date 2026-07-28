-- ─── agents_internes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents_internes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        text NOT NULL,
  prenom     text NOT NULL,
  email      text DEFAULT '',
  poste      text DEFAULT '',
  service    text DEFAULT '',
  actif      boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agents_internes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agents_internes' AND policyname='anon can read agents_internes') THEN
    CREATE POLICY "anon can read agents_internes" ON agents_internes FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

INSERT INTO agents_internes (nom, prenom, email, poste, service) VALUES
  ('Dubois',    'Marc',      'marc.dubois@crous-lyon.fr',      'Responsable patrimoine',              'Direction du Patrimoine'),
  ('Lemaire',   'Sophie',    'sophie.lemaire@crous-lyon.fr',   'Responsable technique',               'Direction du Patrimoine'),
  ('Fontaine',  'Pierre',    'pierre.fontaine@crous-lyon.fr',  'Chargé de maintenance',               'Direction du Patrimoine'),
  ('Rousseau',  'Isabelle',  'isabelle.rousseau@crous-lyon.fr','Responsable logement',                'Direction des Résidences'),
  ('Garnier',   'Thomas',    'thomas.garnier@crous-lyon.fr',   'Gestionnaire de résidence',           'Direction des Résidences'),
  ('Moreau',    'Julie',     'julie.moreau@crous-lyon.fr',     'Technicien(ne) bâtiment',             'Direction du Patrimoine'),
  ('Bernard',   'Frédéric',  'frederic.bernard@crous-lyon.fr', 'Responsable sécurité',                'Direction du Patrimoine'),
  ('Laurent',   'Nathalie',  'nathalie.laurent@crous-lyon.fr', 'Assistante administrative',           'Direction du Patrimoine'),
  ('Simon',     'Alexandre', 'alexandre.simon@crous-lyon.fr',  'Chargé d''énergie et fluides',       'Direction du Patrimoine'),
  ('Martin',    'Claire',    'claire.martin@crous-lyon.fr',    'Référente réglementaire',             'Direction du Patrimoine'),
  ('Petit',     'Jean-Luc',  'jeanluc.petit@crous-lyon.fr',    'Responsable marchés publics',         'Direction des Achats'),
  ('Richard',   'Valérie',   'valerie.richard@crous-lyon.fr',  'Juriste marchés',                     'Direction des Achats'),
  ('Durand',    'Christophe','christophe.durand@crous-lyon.fr','Directeur adjoint',                   'Direction Générale'),
  ('Leroy',     'Aurélie',   'aurelie.leroy@crous-lyon.fr',    'Responsable restauration',            'Direction de la Restauration'),
  ('Morel',     'Sébastien', 'sebastien.morel@crous-lyon.fr',  'Technicien cuisine',                  'Direction de la Restauration'),
  ('Girard',    'Émilie',    'emilie.girard@crous-lyon.fr',    'Chargée qualité',                     'Direction Générale'),
  ('Roux',      'Patrick',   'patrick.roux@crous-lyon.fr',     'Agent de maintenance polyvalent',     'Direction du Patrimoine'),
  ('Bonnet',    'Sandrine',  'sandrine.bonnet@crous-lyon.fr',  'Responsable informatique et SI',      'Direction du SI'),
  ('Fournier',  'Nicolas',   'nicolas.fournier@crous-lyon.fr', 'Contrôleur de gestion',               'Direction Financière'),
  ('Mercier',   'Hélène',    'helene.mercier@crous-lyon.fr',   'Directrice financière',               'Direction Financière')
ON CONFLICT DO NOTHING;

-- ─── prestataires ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prestataires (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom          text NOT NULL,
  siret        text DEFAULT '',
  categorie    text DEFAULT '',
  email        text DEFAULT '',
  telephone    text DEFAULT '',
  adresse      text DEFAULT '',
  referent_nom   text DEFAULT '',
  referent_email text DEFAULT '',
  actif        boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE prestataires ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='prestataires' AND policyname='anon can read prestataires') THEN
    CREATE POLICY "anon can read prestataires" ON prestataires FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='prestataires' AND policyname='anon can insert prestataires') THEN
    CREATE POLICY "anon can insert prestataires" ON prestataires FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='prestataires' AND policyname='anon can update prestataires') THEN
    CREATE POLICY "anon can update prestataires" ON prestataires FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO prestataires (nom, categorie, referent_nom) VALUES
  ('DEKRA Industrial',        'Contrôle réglementaire', 'Remy Crebouw'),
  ('APAVE',                   'Contrôle réglementaire', ''),
  ('Bureau Veritas',          'Contrôle réglementaire', ''),
  ('SOCOTEC',                 'Contrôle réglementaire', ''),
  ('Alpes Contrôles',         'Contrôle réglementaire', ''),
  ('Qualiconsult',            'Contrôle réglementaire', ''),
  ('SGS France',              'Contrôle réglementaire', ''),
  ('Schindler France',        'Ascenseurs / levage',    ''),
  ('Otis France',             'Ascenseurs / levage',    ''),
  ('Kone France',             'Ascenseurs / levage',    ''),
  ('ThyssenKrupp Elevator',   'Ascenseurs / levage',    ''),
  ('Engie Solutions',         'CVC / Chauffage',        ''),
  ('Dalkia',                  'CVC / Chauffage',        ''),
  ('Idex Energies',           'CVC / Chauffage',        ''),
  ('Veolia Énergie',          'CVC / Chauffage',        ''),
  ('Cofely Services',         'CVC / Chauffage',        ''),
  ('Elior Services',          'Nettoyage',              ''),
  ('ISS Facility Services',   'Nettoyage',              ''),
  ('Atalian',                 'Nettoyage / Gardiennage',''),
  ('Securitas',               'Gardiennage',            ''),
  ('Prosécurité',             'Sécurité incendie',      ''),
  ('FORCLUM',                 'Électricité',            ''),
  ('Eiffage Énergie',         'Électricité',            ''),
  ('Spie',                    'Électricité / CVC',      ''),
  ('GrDF',                    'Gaz',                    ''),
  ('Engie Particuliers',      'Gaz / Énergie',          '')
ON CONFLICT DO NOTHING;
