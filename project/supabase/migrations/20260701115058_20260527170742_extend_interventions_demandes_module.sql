DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='reference') THEN
    ALTER TABLE interventions ADD COLUMN reference text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='categorie') THEN
    ALTER TABLE interventions ADD COLUMN categorie text DEFAULT 'autre';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='sous_categorie') THEN
    ALTER TABLE interventions ADD COLUMN sous_categorie text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='criticite') THEN
    ALTER TABLE interventions ADD COLUMN criticite text NOT NULL DEFAULT 'moyenne';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='sla_heures') THEN
    ALTER TABLE interventions ADD COLUMN sla_heures integer DEFAULT 48;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='statut_demande') THEN
    ALTER TABLE interventions ADD COLUMN statut_demande text NOT NULL DEFAULT 'nouveau';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='canal_source') THEN
    ALTER TABLE interventions ADD COLUMN canal_source text DEFAULT 'interne';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='demandeur_nom') THEN
    ALTER TABLE interventions ADD COLUMN demandeur_nom text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='demandeur_email') THEN
    ALTER TABLE interventions ADD COLUMN demandeur_email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='demandeur_type') THEN
    ALTER TABLE interventions ADD COLUMN demandeur_type text DEFAULT 'interne';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='residence_id') THEN
    ALTER TABLE interventions ADD COLUMN residence_id uuid REFERENCES residences(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='etage_id') THEN
    ALTER TABLE interventions ADD COLUMN etage_id uuid REFERENCES etages(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='localisation_detail') THEN
    ALTER TABLE interventions ADD COLUMN localisation_detail text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='date_qualification') THEN
    ALTER TABLE interventions ADD COLUMN date_qualification timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='date_affectation') THEN
    ALTER TABLE interventions ADD COLUMN date_affectation timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='date_resolution') THEN
    ALTER TABLE interventions ADD COLUMN date_resolution timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='justification_critique') THEN
    ALTER TABLE interventions ADD COLUMN justification_critique text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interventions' AND column_name='tickets_count') THEN
    ALTER TABLE interventions ADD COLUMN tickets_count integer DEFAULT 0;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS interventions_reference_key ON interventions(reference) WHERE reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS tickets_intervention (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  reference text UNIQUE NOT NULL,
  titre text NOT NULL,
  description text,
  categorie text DEFAULT 'autre',
  statut text NOT NULL DEFAULT 'ouvert',
  priorite text NOT NULL DEFAULT 'normale',
  assigne_a text,
  prestataire text,
  date_prevue date,
  date_realisation date,
  duree_estimee_min integer,
  duree_reelle_min integer,
  cout numeric,
  compte_rendu text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tickets_intervention ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tickets_intervention' AND policyname='anon select tickets_intervention') THEN
    CREATE POLICY "anon select tickets_intervention" ON tickets_intervention FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tickets_intervention' AND policyname='anon insert tickets_intervention') THEN
    CREATE POLICY "anon insert tickets_intervention" ON tickets_intervention FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tickets_intervention' AND policyname='anon update tickets_intervention') THEN
    CREATE POLICY "anon update tickets_intervention" ON tickets_intervention FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS historique_intervention (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  type_evenement text NOT NULL,
  description text NOT NULL,
  auteur text DEFAULT 'Système',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historique_intervention ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='historique_intervention' AND policyname='anon select historique_intervention') THEN
    CREATE POLICY "anon select historique_intervention" ON historique_intervention FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='historique_intervention' AND policyname='anon insert historique_intervention') THEN
    CREATE POLICY "anon insert historique_intervention" ON historique_intervention FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;
