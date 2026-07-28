/*
  # Tables Événements, Renouvellement (scoring) et Campagnes PPI

  1. Table `evenements`
     Centralise tous les événements liés à un équipement ou site générant
     une indisponibilité ou une panne (binaire ou partielle).
     - type_evenement : panne | maintenance_preventive | maintenance_corrective | incident | inspection
     - est_panne : boolean
     - rend_indisponible : boolean
     - taux_indisponibilite : 0–100 % (décimal)
     - duree_heures calculée côté JS à partir des dates

  2. Table `scores_renouvellement`
     Score calculé côté serveur ou JS, stocké pour historisation.
     - score_patrimonial, score_exploitation, score_risque, score_global (0–100)

  3. Table `campagnes_renouvellement`
     Chaque campagne représente une opération pluriannuelle PPI.
     - statuts : besoin | etude | arbitrage | planifie | consultation | travaux | reception | cloture | reporte | annule
     - criticite : critique | fort | moyen | faible
     - impact_energie, impact_exploitation, impact_conformite : texte libre

  4. Table `campagne_equipements`
     Lien N-N entre campagnes et équipements.

  5. Sécurité : RLS activé sur toutes les tables.
*/

-- ─── Table événements ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evenements (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipement_id         uuid        REFERENCES equipements(id) ON DELETE CASCADE,
  site_id               uuid        REFERENCES sites(id) ON DELETE CASCADE,
  residence_id          uuid        REFERENCES residences(id) ON DELETE CASCADE,
  type_evenement        text        NOT NULL DEFAULT 'panne',
  libelle               text        NOT NULL DEFAULT '',
  description           text        DEFAULT '',
  est_panne             boolean     NOT NULL DEFAULT false,
  rend_indisponible     boolean     NOT NULL DEFAULT false,
  taux_indisponibilite  numeric(5,2) NOT NULL DEFAULT 100 CHECK (taux_indisponibilite BETWEEN 0 AND 100),
  date_debut_prevu      timestamptz,
  date_fin_prevu        timestamptz,
  date_debut_reel       timestamptz,
  date_fin_reel         timestamptz,
  statut                text        NOT NULL DEFAULT 'termine',
  responsable           text        DEFAULT '',
  prestataire           text        DEFAULT '',
  cout_intervention     numeric(12,2),
  gravite               text        NOT NULL DEFAULT 'mineure',
  impact_service        text        NOT NULL DEFAULT 'faible',
  observations          text        DEFAULT '',
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read evenements"
  ON evenements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert evenements"
  ON evenements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update evenements"
  ON evenements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete evenements"
  ON evenements FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_evenements_equipement ON evenements(equipement_id);
CREATE INDEX IF NOT EXISTS idx_evenements_residence  ON evenements(residence_id);
CREATE INDEX IF NOT EXISTS idx_evenements_date_debut ON evenements(date_debut_reel);
CREATE INDEX IF NOT EXISTS idx_evenements_est_panne  ON evenements(est_panne);

-- ─── Table scores_renouvellement ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores_renouvellement (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipement_id       uuid        UNIQUE REFERENCES equipements(id) ON DELETE CASCADE,
  score_patrimonial   numeric(5,1) NOT NULL DEFAULT 0,
  score_exploitation  numeric(5,1) NOT NULL DEFAULT 0,
  score_risque        numeric(5,1) NOT NULL DEFAULT 0,
  score_global        numeric(5,1) NOT NULL DEFAULT 0,
  niveau              text        NOT NULL DEFAULT 'surveillance',
  duree_vie_theorique integer     DEFAULT 15,
  annee_previsionnelle integer,
  capex_estime        numeric(12,2),
  notes               text        DEFAULT '',
  calculated_at       timestamptz DEFAULT now()
);

ALTER TABLE scores_renouvellement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read scores"
  ON scores_renouvellement FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert scores"
  ON scores_renouvellement FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update scores"
  ON scores_renouvellement FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ─── Table campagnes_renouvellement ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campagnes_renouvellement (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           text        NOT NULL DEFAULT '',
  nom                 text        NOT NULL,
  type_operation      text        NOT NULL DEFAULT 'remplacement',
  statut              text        NOT NULL DEFAULT 'besoin',
  criticite           text        NOT NULL DEFAULT 'moyen',
  score_risque        integer     DEFAULT 0,
  annee_ppi           integer,
  trimestre_debut     text        DEFAULT '',
  trimestre_fin       text        DEFAULT '',
  residence_id        uuid        REFERENCES residences(id),
  site_id             uuid        REFERENCES sites(id),
  perimetre_libelle   text        DEFAULT '',
  nb_equipements      integer     DEFAULT 0,
  vetuste_moyenne     numeric(5,1) DEFAULT 0,
  capex_estime        numeric(14,2) DEFAULT 0,
  budget_consomme_pct numeric(5,1) DEFAULT 0,
  roi_ans             numeric(5,1),
  impact_energie      text        DEFAULT '',
  impact_exploitation text        DEFAULT '',
  impact_conformite   text        DEFAULT '',
  impact_confort      text        DEFAULT '',
  avancement_pct      integer     DEFAULT 0,
  notes               text        DEFAULT '',
  responsable         text        DEFAULT '',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE campagnes_renouvellement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read campagnes"
  ON campagnes_renouvellement FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert campagnes"
  ON campagnes_renouvellement FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update campagnes"
  ON campagnes_renouvellement FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete campagnes"
  ON campagnes_renouvellement FOR DELETE TO authenticated USING (true);

-- ─── Table campagne_equipements ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campagne_equipements (
  campagne_id   uuid REFERENCES campagnes_renouvellement(id) ON DELETE CASCADE,
  equipement_id uuid REFERENCES equipements(id) ON DELETE CASCADE,
  PRIMARY KEY (campagne_id, equipement_id)
);

ALTER TABLE campagne_equipements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read campagne_equipements"
  ON campagne_equipements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert campagne_equipements"
  ON campagne_equipements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated delete campagne_equipements"
  ON campagne_equipements FOR DELETE TO authenticated USING (true);
