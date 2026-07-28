/*
  # Create Registre de Sécurité module tables

  ## Summary
  Creates all tables needed for the digital Security Register (Registre de Sécurité)
  for Establishments Receiving the Public (ERP - Établissements Recevant du Public).

  ## New Tables

  ### `erp` (Établissements Recevant du Public)
  - Core ERP identity: name, category (1-5), type (J/R/M/etc.), capacity, address
  - Linked to residence and site via FK
  - Responsable sécurité (free text for now)
  - Emergency contacts, commissioning date, controlling organism

  ### `controles_erp`
  - Periodic safety checks linked to an ERP
  - type_controle: SSI, extincteurs, portes coupe-feu, etc.
  - periodicite: mensuelle/annuelle/semestrielle/trimestrielle/quinquennale
  - statut: conforme / en_retard / a_venir / non_realise / non_conforme
  - Links to prestataire and document PDF

  ### `incidents_erp`
  - Safety incidents linked to an ERP
  - type_incident: ssi_intempestif, panne_extincteur, panne_eclairage, etc.
  - Lieu, description, personnes impliquées, dégâts, actions immédiates
  - statut: ouvert / en_cours / cloture

  ### `actions_correctives_erp`
  - Corrective actions linked to an incident or a controle_erp
  - Description, responsable, date_limite, statut, priorite

  ## Security
  - RLS enabled on all tables
  - anon SELECT and INSERT allowed for demo purposes
  - anon UPDATE allowed on controles_erp, incidents_erp, actions_correctives_erp
*/

-- ─── ERP ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS erp (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom                   text NOT NULL,
  categorie_erp         text NOT NULL DEFAULT '5eme',   -- 1ere, 2eme, 3eme, 4eme, 5eme
  type_erp              text NOT NULL DEFAULT 'R',       -- J, R, M, N, O, P, S, T, U, V, W, X, Y
  capacite              integer NOT NULL DEFAULT 0,
  adresse               text,
  responsable_securite  text,
  email_responsable     text,
  coordonnees_secours   text DEFAULT 'Pompiers : 18 | SAMU : 15 | Police : 17',
  date_mise_en_service  date,
  organisme_controle    text,
  contrat_controle_ref  text,
  residence_id          uuid REFERENCES residences(id) ON DELETE SET NULL,
  site_id               uuid REFERENCES sites(id) ON DELETE SET NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE erp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read erp"
  ON erp FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert erp"
  ON erp FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update erp"
  ON erp FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── Contrôles ERP ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS controles_erp (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id                 uuid NOT NULL REFERENCES erp(id) ON DELETE CASCADE,
  type_controle          text NOT NULL,  -- SSI, extincteurs, portes_coupe_feu, etc.
  categorie              text NOT NULL DEFAULT 'Sécurité incendie',
  periodicite            text NOT NULL DEFAULT 'annuelle', -- mensuelle, trimestrielle, semestrielle, annuelle, quinquennale
  date_dernier_controle  date,
  date_prochain_controle date,
  statut                 text NOT NULL DEFAULT 'a_venir', -- conforme, en_retard, a_venir, non_realise, non_conforme
  prestataire            text,
  conformite_pct         integer,  -- 0-100
  rapport_url            text,
  commentaire            text,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

ALTER TABLE controles_erp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read controles_erp"
  ON controles_erp FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert controles_erp"
  ON controles_erp FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update controles_erp"
  ON controles_erp FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── Incidents ERP ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS incidents_erp (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id                  uuid NOT NULL REFERENCES erp(id) ON DELETE CASCADE,
  reference               text UNIQUE NOT NULL,  -- INC-001, INC-002, ...
  type_incident           text NOT NULL,  -- ssi_intempestif, panne_extincteur, panne_eclairage, porte_coupe_feu, fuite_gaz, exercice_evacuation, degradation_amiante, autre
  date_incident           timestamptz NOT NULL DEFAULT now(),
  lieu                    text,
  description             text,
  personnes_impliquees    text,
  degats_materiels        boolean DEFAULT false,
  degats_description      text,
  actions_immediates      text,
  statut                  text NOT NULL DEFAULT 'ouvert',  -- ouvert, en_cours, cloture
  responsable             text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE incidents_erp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read incidents_erp"
  ON incidents_erp FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert incidents_erp"
  ON incidents_erp FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update incidents_erp"
  ON incidents_erp FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── Actions correctives ERP ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS actions_correctives_erp (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id          uuid NOT NULL REFERENCES erp(id) ON DELETE CASCADE,
  reference       text UNIQUE NOT NULL,  -- AC-001, AC-002, ...
  incident_id     uuid REFERENCES incidents_erp(id) ON DELETE SET NULL,
  controle_id     uuid REFERENCES controles_erp(id) ON DELETE SET NULL,
  description     text NOT NULL,
  responsable     text,
  date_limite     date,
  statut          text NOT NULL DEFAULT 'ouvert',  -- ouvert, en_cours, termine, annule
  priorite        integer NOT NULL DEFAULT 2,  -- 1=basse, 2=moyenne, 3=haute, 4=critique
  commentaire     text,
  ot_gmao_ref     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE actions_correctives_erp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read actions_correctives_erp"
  ON actions_correctives_erp FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert actions_correctives_erp"
  ON actions_correctives_erp FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update actions_correctives_erp"
  ON actions_correctives_erp FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── updated_at triggers ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_erp_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_erp_updated_at') THEN
    CREATE TRIGGER trg_erp_updated_at BEFORE UPDATE ON erp FOR EACH ROW EXECUTE FUNCTION update_erp_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_controles_erp_updated_at') THEN
    CREATE TRIGGER trg_controles_erp_updated_at BEFORE UPDATE ON controles_erp FOR EACH ROW EXECUTE FUNCTION update_erp_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_incidents_erp_updated_at') THEN
    CREATE TRIGGER trg_incidents_erp_updated_at BEFORE UPDATE ON incidents_erp FOR EACH ROW EXECUTE FUNCTION update_erp_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_actions_correctives_erp_updated_at') THEN
    CREATE TRIGGER trg_actions_correctives_erp_updated_at BEFORE UPDATE ON actions_correctives_erp FOR EACH ROW EXECUTE FUNCTION update_erp_updated_at();
  END IF;
END $$;
