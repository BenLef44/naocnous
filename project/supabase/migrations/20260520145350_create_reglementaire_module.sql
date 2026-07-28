/*
  # Module Suivi Réglementaire

  ## Nouvelles tables
  1. `types_controle` - Catalogue des types de contrôles réglementaires (Électricité, Incendie, Amiante...)
  2. `controles_reglementaires` - Instances de contrôles planifiés/réalisés liés à un bâtiment/équipement
  3. `points_controle` - Points individuels vérifiés lors d'un contrôle (conformes / non conformes)
  4. `actions_correctives` - Actions correctives suite à un point non conforme

  ## Sécurité
  - RLS activé sur toutes les tables
  - Accès anon pour démo
*/

-- Types de contrôle (catalogue)
CREATE TABLE IF NOT EXISTS types_controle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  nom text NOT NULL,
  categorie text NOT NULL,
  description text,
  icone text,
  couleur text DEFAULT '#3b82f6',
  periodicite_mois integer,
  periodicite_label text,
  reference_reglementaire text,
  type_batiment text[],
  created_at timestamptz DEFAULT now()
);

-- Contrôles réglementaires
CREATE TABLE IF NOT EXISTS controles_reglementaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_controle_id uuid NOT NULL REFERENCES types_controle(id),
  -- localisation
  site_id uuid REFERENCES sites(id),
  batiment_id uuid REFERENCES batiments(id),
  etage_id uuid REFERENCES etages(id),
  logement_id uuid REFERENCES logements(id),
  equipement_id uuid REFERENCES equipements(id),
  localisation_detail text,
  -- acteurs
  organisme text,
  technicien text,
  -- dates
  date_dernier_controle date,
  date_prochain_controle date,
  -- résultat
  statut text NOT NULL DEFAULT 'manquant',
  nb_conformes integer DEFAULT 0,
  nb_non_conformes integer DEFAULT 0,
  observations text,
  rapport_url text,
  -- meta
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Points de contrôle
CREATE TABLE IF NOT EXISTS points_controle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  controle_id uuid NOT NULL REFERENCES controles_reglementaires(id) ON DELETE CASCADE,
  libelle text NOT NULL,
  statut text NOT NULL DEFAULT 'conforme',
  observation text,
  created_at timestamptz DEFAULT now()
);

-- Actions correctives
CREATE TABLE IF NOT EXISTS actions_correctives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  point_controle_id uuid NOT NULL REFERENCES points_controle(id) ON DELETE CASCADE,
  controle_id uuid NOT NULL REFERENCES controles_reglementaires(id) ON DELETE CASCADE,
  description text NOT NULL,
  statut text NOT NULL DEFAULT 'en_attente',
  priorite text NOT NULL DEFAULT 'normale',
  responsable text,
  date_echeance date,
  date_realisation date,
  cout_estime numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_controles_updated_at') THEN
    CREATE TRIGGER update_controles_updated_at BEFORE UPDATE ON controles_reglementaires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_actions_updated_at') THEN
    CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON actions_correctives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS
ALTER TABLE types_controle ENABLE ROW LEVEL SECURITY;
ALTER TABLE controles_reglementaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_controle ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions_correctives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read types_controle" ON types_controle FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert types_controle" ON types_controle FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon read controles" ON controles_reglementaires FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert controles" ON controles_reglementaires FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update controles" ON controles_reglementaires FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete controles" ON controles_reglementaires FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read points_controle" ON points_controle FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert points_controle" ON points_controle FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update points_controle" ON points_controle FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete points_controle" ON points_controle FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read actions_correctives" ON actions_correctives FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert actions_correctives" ON actions_correctives FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update actions_correctives" ON actions_correctives FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete actions_correctives" ON actions_correctives FOR DELETE TO anon USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_controles_type_id ON controles_reglementaires(type_controle_id);
CREATE INDEX IF NOT EXISTS idx_controles_batiment_id ON controles_reglementaires(batiment_id);
CREATE INDEX IF NOT EXISTS idx_controles_site_id ON controles_reglementaires(site_id);
CREATE INDEX IF NOT EXISTS idx_controles_statut ON controles_reglementaires(statut);
CREATE INDEX IF NOT EXISTS idx_controles_date_prochain ON controles_reglementaires(date_prochain_controle);
CREATE INDEX IF NOT EXISTS idx_points_controle_id ON points_controle(controle_id);
CREATE INDEX IF NOT EXISTS idx_actions_controle_id ON actions_correctives(controle_id);
CREATE INDEX IF NOT EXISTS idx_actions_statut ON actions_correctives(statut);
