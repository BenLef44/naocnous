-- ─── ERP tables (from prior migration that failed to apply) ───────────────────

CREATE TABLE IF NOT EXISTS erp (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom                   text NOT NULL,
  categorie_erp         text NOT NULL DEFAULT '5eme',
  type_erp              text NOT NULL DEFAULT 'R',
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='erp' AND policyname='anon can read erp') THEN
    CREATE POLICY "anon can read erp" ON erp FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='erp' AND policyname='anon can insert erp') THEN
    CREATE POLICY "anon can insert erp" ON erp FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='erp' AND policyname='anon can update erp') THEN
    CREATE POLICY "anon can update erp" ON erp FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS controles_erp (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id                 uuid NOT NULL REFERENCES erp(id) ON DELETE CASCADE,
  type_controle          text NOT NULL,
  categorie              text NOT NULL DEFAULT 'Sécurité incendie',
  periodicite            text NOT NULL DEFAULT 'annuelle',
  date_dernier_controle  date,
  date_prochain_controle date,
  statut                 text NOT NULL DEFAULT 'a_venir',
  prestataire            text,
  conformite_pct         integer,
  rapport_url            text,
  commentaire            text,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

ALTER TABLE controles_erp ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='controles_erp' AND policyname='anon can read controles_erp') THEN
    CREATE POLICY "anon can read controles_erp" ON controles_erp FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='controles_erp' AND policyname='anon can insert controles_erp') THEN
    CREATE POLICY "anon can insert controles_erp" ON controles_erp FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='controles_erp' AND policyname='anon can update controles_erp') THEN
    CREATE POLICY "anon can update controles_erp" ON controles_erp FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS incidents_erp (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id                  uuid NOT NULL REFERENCES erp(id) ON DELETE CASCADE,
  reference               text UNIQUE NOT NULL,
  type_incident           text NOT NULL,
  date_incident           timestamptz NOT NULL DEFAULT now(),
  lieu                    text,
  description             text,
  personnes_impliquees    text,
  degats_materiels        boolean DEFAULT false,
  degats_description      text,
  actions_immediates      text,
  statut                  text NOT NULL DEFAULT 'ouvert',
  responsable             text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE incidents_erp ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incidents_erp' AND policyname='anon can read incidents_erp') THEN
    CREATE POLICY "anon can read incidents_erp" ON incidents_erp FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incidents_erp' AND policyname='anon can insert incidents_erp') THEN
    CREATE POLICY "anon can insert incidents_erp" ON incidents_erp FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incidents_erp' AND policyname='anon can update incidents_erp') THEN
    CREATE POLICY "anon can update incidents_erp" ON incidents_erp FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS actions_correctives_erp (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id          uuid NOT NULL REFERENCES erp(id) ON DELETE CASCADE,
  reference       text UNIQUE NOT NULL,
  incident_id     uuid REFERENCES incidents_erp(id) ON DELETE SET NULL,
  controle_id     uuid REFERENCES controles_erp(id) ON DELETE SET NULL,
  description     text NOT NULL,
  responsable     text,
  date_limite     date,
  statut          text NOT NULL DEFAULT 'ouvert',
  priorite        integer NOT NULL DEFAULT 2,
  commentaire     text,
  ot_gmao_ref     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE actions_correctives_erp ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='actions_correctives_erp' AND policyname='anon can read actions_correctives_erp') THEN
    CREATE POLICY "anon can read actions_correctives_erp" ON actions_correctives_erp FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='actions_correctives_erp' AND policyname='anon can insert actions_correctives_erp') THEN
    CREATE POLICY "anon can insert actions_correctives_erp" ON actions_correctives_erp FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='actions_correctives_erp' AND policyname='anon can update actions_correctives_erp') THEN
    CREATE POLICY "anon can update actions_correctives_erp" ON actions_correctives_erp FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── Table registres_securite ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS registres_securite (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id                     uuid NOT NULL REFERENCES erp(id) ON DELETE CASCADE,

  reference                  text NOT NULL,
  annee                      int  NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  responsable_registre       text,
  date_ouverture             date,

  consignes_incendie         text,
  plan_evac_url              text,
  point_rassemblement        text,
  consignes_pmr              text,

  nb_extincteurs             int,
  derniere_verif_ssi         date,
  derniere_verif_extincteurs date,
  derniere_verif_eclairage   date,
  derniere_verif_desenfumage date,
  organisme_controle         text,

  nb_exercices_annee         int DEFAULT 0,
  date_dernier_exercice      date,
  nb_incidents_annee         int DEFAULT 0,
  observations               text,

  documents                  jsonb DEFAULT '[]'::jsonb,
  signatures                 jsonb DEFAULT '[]'::jsonb,

  statut                     text NOT NULL DEFAULT 'brouillon',
  completude_pct             int  NOT NULL DEFAULT 0,

  created_at                 timestamptz DEFAULT now(),
  updated_at                 timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registres_securite_erp_id ON registres_securite(erp_id);
CREATE INDEX IF NOT EXISTS idx_registres_securite_statut  ON registres_securite(statut);

ALTER TABLE registres_securite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read registres_securite"
  ON registres_securite FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon can insert registres_securite"
  ON registres_securite FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anon can update registres_securite"
  ON registres_securite FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon can delete registres_securite"
  ON registres_securite FOR DELETE TO anon, authenticated USING (true);

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_erp_module_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_erp_updated_at') THEN
    CREATE TRIGGER trg_erp_updated_at BEFORE UPDATE ON erp FOR EACH ROW EXECUTE FUNCTION update_erp_module_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_controles_erp_updated_at') THEN
    CREATE TRIGGER trg_controles_erp_updated_at BEFORE UPDATE ON controles_erp FOR EACH ROW EXECUTE FUNCTION update_erp_module_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_incidents_erp_updated_at') THEN
    CREATE TRIGGER trg_incidents_erp_updated_at BEFORE UPDATE ON incidents_erp FOR EACH ROW EXECUTE FUNCTION update_erp_module_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_actions_correctives_erp_updated_at') THEN
    CREATE TRIGGER trg_actions_correctives_erp_updated_at BEFORE UPDATE ON actions_correctives_erp FOR EACH ROW EXECUTE FUNCTION update_erp_module_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_registres_securite_updated_at') THEN
    CREATE TRIGGER trg_registres_securite_updated_at BEFORE UPDATE ON registres_securite FOR EACH ROW EXECUTE FUNCTION update_erp_module_updated_at();
  END IF;
END $$;
