/*
  # Module Interventions — Extension table + table demandes + tickets

  ## Résumé
  Ce module ajoute la gestion complète des demandes d'intervention (DI) et des tickets associés.

  ## Nouvelles colonnes sur la table `interventions` existante
  - `reference` : identifiant lisible (DI-2026-XXXXX)
  - `categorie` : catégorie métier (plomberie, électricité, chauffage…)
  - `sous_categorie` : sous-catégorie
  - `criticite` : niveau urgence (faible/moyenne/haute/critique)
  - `sla_heures` : délai cible en heures
  - `statut_demande` : workflow demande (nouveau/a_qualifier/qualifie/affecte/en_intervention/resolu/cloture/rejete)
  - `canal_source` : origine (interne/email/my_residence/telephone)
  - `demandeur_nom` : nom du demandeur
  - `demandeur_email` : email du demandeur
  - `demandeur_type` : interne/etudiant/externe
  - `etage_id` : lien vers étage (localisation fine)
  - `residence_id` : lien vers résidence
  - `localisation_detail` : description libre du lieu
  - `date_qualification` : horodatage qualification
  - `date_affectation` : horodatage affectation
  - `date_resolution` : horodatage résolution
  - `justification_critique` : texte obligatoire si criticité critique
  - `tickets_count` : nb tickets liés (dénormalisé)

  ## Nouvelle table `tickets_intervention`
  Sous-tickets créés à partir d'une demande.
  - FK vers interventions (demande parente)
  - Assignation, statut, coût, compte_rendu

  ## Nouvelle table `historique_intervention`
  Journal d'activité complet (timeline).

  ## Sécurité
  - RLS anon SELECT/INSERT/UPDATE sur toutes les tables
*/

-- ─── Extensions colonnes interventions ─────────────────────────────────────────

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

-- ─── Index sur reference ────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS interventions_reference_key ON interventions(reference) WHERE reference IS NOT NULL;

-- ─── Table tickets_intervention ────────────────────────────────────────────────
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

CREATE POLICY "anon select tickets_intervention"
  ON tickets_intervention FOR SELECT TO anon USING (true);

CREATE POLICY "anon insert tickets_intervention"
  ON tickets_intervention FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon update tickets_intervention"
  ON tickets_intervention FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── Table historique_intervention ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS historique_intervention (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  type_evenement text NOT NULL,
  description text NOT NULL,
  auteur text DEFAULT 'Système',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historique_intervention ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon select historique_intervention"
  ON historique_intervention FOR SELECT TO anon USING (true);

CREATE POLICY "anon insert historique_intervention"
  ON historique_intervention FOR INSERT TO anon WITH CHECK (true);
