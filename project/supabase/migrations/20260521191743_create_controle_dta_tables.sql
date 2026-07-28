/*
  # Création des tables pour les contrôles Amiante / DTA

  ## Nouvelles tables

  ### `controles_dta`
  Stocke les données du formulaire Contrôle (étape 2, section 1) pour le type Amiante/DTA.
  - `id` : UUID PK
  - `periodicite` : périodicité du contrôle
  - `site` : nom du site
  - `residence` : nom de la résidence
  - `organisme` : organisme de contrôle
  - `date_controle` : date du dernier contrôle (anciennement "dernier contrôle")
  - `date_prochain_controle` : date du prochain contrôle
  - `statut` : statut du contrôle (manquant / en_retard / a_venir / realise)
  - `pdf_path` : chemin du PDF dans Supabase Storage
  - `pdf_nom` : nom original du fichier PDF
  - `created_at`, `updated_at`

  ### `points_controle_dta`
  Stocke les points de contrôle liés à un contrôle DTA.
  - `id` : UUID PK
  - `controle_dta_id` : FK vers controles_dta
  - `libelle` : libellé du point de contrôle
  - `conforme` : booléen
  - `criticite` : Critique / Majeure / Mineure
  - `created_at`

  ### `actions_correctives_dta`
  Stocke les actions correctives liées à un contrôle DTA.
  - `id` : UUID PK
  - `controle_dta_id` : FK vers controles_dta
  - `libelle_type` : libellé de l'action (issu de la liste prédéfinie)
  - `assigne_type` : 'interne' ou 'organisme'
  - `assigne_nom` : nom de l'agent ou de l'organisme
  - `date_prevue` : date prévue de l'action
  - `created_at`

  ## Sécurité
  - RLS activé sur toutes les tables
  - Accès SELECT/INSERT/UPDATE/DELETE pour les utilisateurs authentifiés uniquement
*/

-- ─── controles_dta ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS controles_dta (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodicite           text NOT NULL DEFAULT '',
  site                  text NOT NULL DEFAULT '',
  residence             text NOT NULL DEFAULT '',
  organisme             text NOT NULL DEFAULT '',
  date_controle         date,
  date_prochain_controle date,
  statut                text NOT NULL DEFAULT 'realise',
  pdf_path              text,
  pdf_nom               text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE controles_dta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select controles_dta"
  ON controles_dta FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert controles_dta"
  ON controles_dta FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update controles_dta"
  ON controles_dta FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── points_controle_dta ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS points_controle_dta (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  controle_dta_id   uuid NOT NULL REFERENCES controles_dta(id) ON DELETE CASCADE,
  libelle           text NOT NULL DEFAULT '',
  conforme          boolean NOT NULL DEFAULT true,
  criticite         text NOT NULL DEFAULT 'Mineure',
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE points_controle_dta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select points_controle_dta"
  ON points_controle_dta FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert points_controle_dta"
  ON points_controle_dta FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update points_controle_dta"
  ON points_controle_dta FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete points_controle_dta"
  ON points_controle_dta FOR DELETE
  TO authenticated
  USING (true);

-- ─── actions_correctives_dta ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS actions_correctives_dta (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  controle_dta_id   uuid NOT NULL REFERENCES controles_dta(id) ON DELETE CASCADE,
  libelle_type      text NOT NULL DEFAULT '',
  assigne_type      text NOT NULL DEFAULT 'interne',
  assigne_nom       text NOT NULL DEFAULT '',
  date_prevue       date,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE actions_correctives_dta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select actions_correctives_dta"
  ON actions_correctives_dta FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert actions_correctives_dta"
  ON actions_correctives_dta FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update actions_correctives_dta"
  ON actions_correctives_dta FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete actions_correctives_dta"
  ON actions_correctives_dta FOR DELETE
  TO authenticated
  USING (true);

-- ─── trigger updated_at ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_controles_dta_updated_at'
  ) THEN
    CREATE TRIGGER set_controles_dta_updated_at
      BEFORE UPDATE ON controles_dta
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ─── Storage bucket pour les PDFs DTA ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('dta-documents', 'dta-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload DTA documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dta-documents');

CREATE POLICY "Authenticated users can read DTA documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'dta-documents');
