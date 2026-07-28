/*
  # Création de la table agents_internes

  1. Nouvelle table
    - `agents_internes` : agents internes CROUS Lyon
      - `id` (uuid, PK)
      - `nom` (text)
      - `prenom` (text)
      - `email` (text)
      - `poste` (text) : intitulé du poste
      - `service` (text) : service / direction
      - `actif` (boolean, default true)
      - `created_at`

  2. Sécurité
    - RLS activé, lecture pour tous les authentifiés

  3. Seed
    - ~20 agents fictifs CROUS Lyon couvrant les services patrimoine, technique, logistique
*/

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

CREATE POLICY "Authenticated users can read agents_internes"
  ON agents_internes FOR SELECT
  TO authenticated
  USING (true);

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
