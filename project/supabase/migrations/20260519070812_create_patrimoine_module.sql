/*
  # Module 1 - Référentiel du Patrimoine et des Équipements

  ## Tables créées
  1. `sites` - Sites patrimoniaux (niveau 1)
  2. `residences` - Résidences au sein d'un site (niveau 2)
  3. `batiments` - Bâtiments d'une résidence (niveau 3)
  4. `etages` - Étages d'un bâtiment (niveau 4)
  5. `logements` - Logements d'un étage (niveau 5)
  6. `equipements` - Équipements liés à un échelon
  7. `interventions` - Historique des interventions
  8. `contrats` - Contrats de maintenance
  9. `documents` - GED documents liés au patrimoine/équipements
  10. `alertes` - Alertes et notifications

  ## Sécurité
  - RLS activé sur toutes les tables
  - Accès anon pour démo publique
*/

-- Sites
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  code text UNIQUE NOT NULL,
  adresse text,
  ville text,
  code_postal text,
  statut text NOT NULL DEFAULT 'disponible',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Résidences
CREATE TABLE IF NOT EXISTS residences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  nom text NOT NULL,
  code text NOT NULL,
  adresse text,
  statut text NOT NULL DEFAULT 'disponible',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bâtiments
CREATE TABLE IF NOT EXISTS batiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id uuid NOT NULL REFERENCES residences(id),
  nom text NOT NULL,
  code text NOT NULL,
  annee_construction integer,
  surface_m2 numeric,
  nb_logements integer DEFAULT 0,
  statut text NOT NULL DEFAULT 'disponible',
  raison_indisponibilite text,
  date_fin_indisponibilite date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Étages
CREATE TABLE IF NOT EXISTS etages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batiment_id uuid NOT NULL REFERENCES batiments(id),
  numero integer NOT NULL,
  nom text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Logements
CREATE TABLE IF NOT EXISTS logements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etage_id uuid NOT NULL REFERENCES etages(id),
  numero text NOT NULL,
  surface_m2 numeric,
  type_logement text DEFAULT 'studio',
  statut text NOT NULL DEFAULT 'disponible',
  occupant text,
  raison_indisponibilite text,
  date_fin_indisponibilite date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Équipements
CREATE TABLE IF NOT EXISTS equipements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifiant text UNIQUE NOT NULL,
  designation text NOT NULL,
  categorie text NOT NULL,
  sous_categorie text,
  site_id uuid REFERENCES sites(id),
  batiment_id uuid REFERENCES batiments(id),
  etage_id uuid REFERENCES etages(id),
  logement_id uuid REFERENCES logements(id),
  localisation_detail text,
  etat text NOT NULL DEFAULT 'fonctionnel',
  date_mise_en_service date,
  marque text,
  modele text,
  numero_serie text,
  caracteristiques jsonb DEFAULT '{}',
  cout_acquisition numeric,
  prochaine_echeance date,
  frequence_controle text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Interventions
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  type_intervention text NOT NULL DEFAULT 'maintenance',
  priorite text NOT NULL DEFAULT 'normale',
  statut text NOT NULL DEFAULT 'planifiee',
  site_id uuid REFERENCES sites(id),
  batiment_id uuid REFERENCES batiments(id),
  equipement_id uuid REFERENCES equipements(id),
  logement_id uuid REFERENCES logements(id),
  agent_nom text,
  prestataire text,
  date_planifiee date,
  date_realisation date,
  cout numeric,
  compte_rendu text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contrats
CREATE TABLE IF NOT EXISTS contrats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text,
  prestataire text NOT NULL,
  type_contrat text NOT NULL DEFAULT 'maintenance',
  statut text NOT NULL DEFAULT 'actif',
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  cout_annuel numeric,
  type_reconduction text DEFAULT 'annuelle',
  marche_associe text,
  site_id uuid REFERENCES sites(id),
  batiment_id uuid REFERENCES batiments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents GED
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type_document text NOT NULL DEFAULT 'autre',
  tags text[] DEFAULT '{}',
  taille_ko integer,
  url text,
  mime_type text,
  site_id uuid REFERENCES sites(id),
  batiment_id uuid REFERENCES batiments(id),
  equipement_id uuid REFERENCES equipements(id),
  contrat_id uuid REFERENCES contrats(id),
  uploaded_by text DEFAULT 'Administrateur',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alertes
CREATE TABLE IF NOT EXISTS alertes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_alerte text NOT NULL,
  message text NOT NULL,
  contrat_id uuid REFERENCES contrats(id),
  equipement_id uuid REFERENCES equipements(id),
  date_echeance date,
  statut text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sites_updated_at') THEN
    CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_residences_updated_at') THEN
    CREATE TRIGGER update_residences_updated_at BEFORE UPDATE ON residences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_batiments_updated_at') THEN
    CREATE TRIGGER update_batiments_updated_at BEFORE UPDATE ON batiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_logements_updated_at') THEN
    CREATE TRIGGER update_logements_updated_at BEFORE UPDATE ON logements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_equipements_updated_at') THEN
    CREATE TRIGGER update_equipements_updated_at BEFORE UPDATE ON equipements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_interventions_updated_at') THEN
    CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_documents_updated_at') THEN
    CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contrats_updated_at') THEN
    CREATE TRIGGER update_contrats_updated_at BEFORE UPDATE ON contrats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE batiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE etages ENABLE ROW LEVEL SECURITY;
ALTER TABLE logements ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipements ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contrats ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow anon read sites" ON sites FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert sites" ON sites FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update sites" ON sites FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read residences" ON residences FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert residences" ON residences FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update residences" ON residences FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read batiments" ON batiments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert batiments" ON batiments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update batiments" ON batiments FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read etages" ON etages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert etages" ON etages FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon read logements" ON logements FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert logements" ON logements FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update logements" ON logements FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read equipements" ON equipements FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert equipements" ON equipements FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update equipements" ON equipements FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete equipements" ON equipements FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read interventions" ON interventions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert interventions" ON interventions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update interventions" ON interventions FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read documents" ON documents FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert documents" ON documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update documents" ON documents FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete documents" ON documents FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read contrats" ON contrats FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert contrats" ON contrats FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update contrats" ON contrats FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete contrats" ON contrats FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read alertes" ON alertes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert alertes" ON alertes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update alertes" ON alertes FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_residences_site_id ON residences(site_id);
CREATE INDEX IF NOT EXISTS idx_batiments_residence_id ON batiments(residence_id);
CREATE INDEX IF NOT EXISTS idx_etages_batiment_id ON etages(batiment_id);
CREATE INDEX IF NOT EXISTS idx_logements_etage_id ON logements(etage_id);
CREATE INDEX IF NOT EXISTS idx_equipements_batiment_id ON equipements(batiment_id);
CREATE INDEX IF NOT EXISTS idx_equipements_categorie ON equipements(categorie);
CREATE INDEX IF NOT EXISTS idx_interventions_batiment_id ON interventions(batiment_id);
CREATE INDEX IF NOT EXISTS idx_interventions_equipement_id ON interventions(equipement_id);
CREATE INDEX IF NOT EXISTS idx_documents_batiment_id ON documents(batiment_id);
CREATE INDEX IF NOT EXISTS idx_documents_equipement_id ON documents(equipement_id);
CREATE INDEX IF NOT EXISTS idx_contrats_site_id ON contrats(site_id);
CREATE INDEX IF NOT EXISTS idx_alertes_contrat_id ON alertes(contrat_id);
