/*
  # Module Conso. Fluides — Tables complémentaires

  ## Objectif
  Étendre le module fluides existant (consommations_fluides) avec trois nouvelles tables :
  - compteurs_fluides : référentiel des compteurs physiques par résidence/bâtiment
  - alertes_fluides : anomalies et dérives énergétiques détectées
  - factures_fluides : factures fournisseurs énergie

  ## Nouvelles tables

  ### 1. compteurs_fluides
  Référentiel des compteurs avec état de communication, niveau batterie, qualité données.

  ### 2. alertes_fluides
  Alertes générées automatiquement ou manuellement sur les dérives de consommation.
  Workflow : nouvelle → en_analyse → intervention_creee → resolue | ignoree

  ### 3. factures_fluides
  Factures fournisseurs énergie pour rapprochement avec consommations réelles.

  ## Sécurité
  RLS activé sur toutes les tables — lecture publique pour les anon (données patrimoniales).
*/

-- ─── 1. compteurs_fluides ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compteurs_fluides (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id        uuid REFERENCES residences(id) ON DELETE SET NULL,
  batiment_id         uuid REFERENCES batiments(id) ON DELETE SET NULL,
  reference           text NOT NULL,
  type_fluide         text NOT NULL CHECK (type_fluide IN ('electricite','gaz','eau','chaleur','solaire','biomasse')),
  localisation        text,
  type_compteur       text NOT NULL DEFAULT 'principal' CHECK (type_compteur IN ('principal','sous_compteur','sous_sous_compteur')),
  parent_compteur_id  uuid REFERENCES compteurs_fluides(id) ON DELETE SET NULL,
  marque              text,
  modele              text,
  numero_serie        text,
  date_installation   date,
  date_derniere_releve date,
  statut_communication text NOT NULL DEFAULT 'connecte' CHECK (statut_communication IN ('connecte','hors_ligne','batterie_faible','anomalie','non_communicant')),
  niveau_batterie_pct  integer CHECK (niveau_batterie_pct BETWEEN 0 AND 100),
  score_qualite_donnee integer NOT NULL DEFAULT 100 CHECK (score_qualite_donnee BETWEEN 0 AND 100),
  donnees_manquantes_j integer NOT NULL DEFAULT 0,
  protocole            text DEFAULT 'Manuel' CHECK (protocole IN ('Manuel','MQTT','Modbus','BACnet','API','Pulse','Télérelevé')),
  actif                boolean NOT NULL DEFAULT true,
  notes                text,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE compteurs_fluides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read compteurs_fluides"
  ON compteurs_fluides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated insert compteurs_fluides"
  ON compteurs_fluides FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update compteurs_fluides"
  ON compteurs_fluides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── 2. alertes_fluides ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alertes_fluides (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id        uuid REFERENCES residences(id) ON DELETE SET NULL,
  batiment_id         uuid REFERENCES batiments(id) ON DELETE SET NULL,
  compteur_id         uuid REFERENCES compteurs_fluides(id) ON DELETE SET NULL,
  type_fluide         text NOT NULL CHECK (type_fluide IN ('electricite','gaz','eau','chaleur','solaire','biomasse')),
  type_anomalie       text NOT NULL CHECK (type_anomalie IN ('surconsommation','fuite_probable','derive_nocturne','donnee_manquante','compteur_hs','pic_anormal','derive_saisonniere')),
  criticite           text NOT NULL DEFAULT 'normale' CHECK (criticite IN ('info','normale','haute','critique')),
  statut              text NOT NULL DEFAULT 'nouvelle' CHECK (statut IN ('nouvelle','en_analyse','intervention_creee','resolue','ignoree')),
  titre               text NOT NULL,
  description         text,
  ecart_pct           numeric,
  impact_euros_mois   numeric,
  date_detection      timestamptz NOT NULL DEFAULT now(),
  date_resolution     timestamptz,
  intervention_id     uuid,
  action_suggeree     text,
  source              text DEFAULT 'automatique' CHECK (source IN ('automatique','manuel','ia')),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE alertes_fluides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read alertes_fluides"
  ON alertes_fluides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated insert alertes_fluides"
  ON alertes_fluides FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update alertes_fluides"
  ON alertes_fluides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── 3. factures_fluides ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS factures_fluides (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id        uuid REFERENCES residences(id) ON DELETE SET NULL,
  type_fluide         text NOT NULL CHECK (type_fluide IN ('electricite','gaz','eau','chaleur','solaire','biomasse')),
  fournisseur         text NOT NULL,
  reference_facture   text,
  periode_debut       date NOT NULL,
  periode_fin         date NOT NULL,
  consommation_valeur numeric,
  consommation_unite  text CHECK (consommation_unite IN ('kWh','m3','MWh')),
  montant_ht          numeric NOT NULL DEFAULT 0,
  montant_ttc         numeric NOT NULL DEFAULT 0,
  date_emission       date,
  date_echeance       date,
  date_paiement       date,
  statut_paiement     text NOT NULL DEFAULT 'en_attente' CHECK (statut_paiement IN ('en_attente','paye','impaye','litige')),
  ecart_compteur_pct  numeric,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE factures_fluides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read factures_fluides"
  ON factures_fluides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated insert factures_fluides"
  ON factures_fluides FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update factures_fluides"
  ON factures_fluides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── Triggers updated_at ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_compteurs_fluides_updated_at') THEN
    CREATE TRIGGER trg_compteurs_fluides_updated_at BEFORE UPDATE ON compteurs_fluides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_alertes_fluides_updated_at') THEN
    CREATE TRIGGER trg_alertes_fluides_updated_at BEFORE UPDATE ON alertes_fluides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_factures_fluides_updated_at') THEN
    CREATE TRIGGER trg_factures_fluides_updated_at BEFORE UPDATE ON factures_fluides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
