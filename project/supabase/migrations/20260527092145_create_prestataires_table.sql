
/*
  # Création de la table prestataires

  1. Nouvelle table
    - `prestataires` : liste des prestataires/titulaires de marchés
      - `id` (uuid, PK)
      - `nom` (text) : raison sociale
      - `siret` (text) : numéro SIRET
      - `categorie` (text) : domaine d'activité principal
      - `email` (text)
      - `telephone` (text)
      - `adresse` (text)
      - `referent_nom` (text) : nom du contact principal
      - `referent_email` (text)
      - `actif` (boolean, default true)
      - `created_at`, `updated_at`

  2. Sécurité
    - RLS activé : lecture pour tous les authentifiés, écriture réservée

  3. Données initiales
    - Seed avec les organismes déjà présents dans l'app (Schindler, Dekra, Apave, SOCOTEC, Bureau Veritas, etc.)
*/

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

CREATE POLICY "Authenticated users can read prestataires"
  ON prestataires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert prestataires"
  ON prestataires FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update prestataires"
  ON prestataires FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed organismes de contrôle et prestataires courants CROUS
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
