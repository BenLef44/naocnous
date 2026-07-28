/*
  # Module Coûts & Finances — Tables principales

  ## Nouvelles tables
  1. `annexe4_regles` — 222 règles extraites du PDF Annexe 4 (répartition Propriétaire/Gestionnaire)
  2. `charges` — Charges déclarées par bâtiment ou équipement
  3. `budgets` — Budgets annuels par résidence/CROUS
  4. `factures` — Factures prestataires liées aux charges ou contrats
  5. `consommations_fluides` — Suivi énergie/eau (source: OPERAT/OSFI simulée)

  ## Sécurité
  - RLS activé sur toutes les tables
  - Accès SELECT pour rôle `anon` (app sans auth)
  - Accès INSERT/UPDATE/DELETE pour `anon` (app de démo)
*/

-- ─── annexe4_regles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS annexe4_regles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_section      text NOT NULL,          -- ex: '01-A', '02-C', '05'
  section_label    text NOT NULL,          -- ex: 'Clos, Couvert Distribution'
  sous_section     text,                   -- ex: 'Gros-oeuvre et structure'
  nature_ouvrage   text NOT NULL,          -- ex: 'Façades (revêtements)'
  sous_ref         text,                   -- ex: 'a', 'b', 'c'
  type_intervention text NOT NULL,         -- ex: 'Réparation ponctuelle'
  responsable      text NOT NULL           -- 'Propriétaire' | 'Gestionnaire' | 'Partagé'
);

ALTER TABLE annexe4_regles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read annexe4_regles"
  ON annexe4_regles FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert annexe4_regles"
  ON annexe4_regles FOR INSERT TO anon WITH CHECK (true);

-- Index pour recherche par nature/type
CREATE INDEX IF NOT EXISTS idx_annexe4_ref ON annexe4_regles(ref_section);
CREATE INDEX IF NOT EXISTS idx_annexe4_nature ON annexe4_regles(nature_ouvrage);

-- ─── charges ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charges (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference            text UNIQUE NOT NULL,       -- ex: 'CH-2026-001'
  batiment_id          uuid REFERENCES batiments(id) ON DELETE SET NULL,
  equipement_id        uuid REFERENCES equipements(id) ON DELETE SET NULL,
  residence_id         uuid REFERENCES residences(id) ON DELETE SET NULL,
  annexe4_regle_id     uuid REFERENCES annexe4_regles(id) ON DELETE SET NULL,
  type_charge          text NOT NULL DEFAULT '',   -- ex: 'Menuiseries extérieures'
  type_intervention    text NOT NULL DEFAULT '',   -- ex: 'Réparation ponctuelle'
  responsable          text NOT NULL DEFAULT 'Gestionnaire', -- 'Propriétaire' | 'Gestionnaire' | 'Partagé'
  cout_estime          numeric DEFAULT 0,
  cout_reel            numeric,
  statut               text NOT NULL DEFAULT 'en_attente', -- en_attente|planifie|en_cours|valide|litige|annule|clos
  date_declaration     date NOT NULL DEFAULT CURRENT_DATE,
  date_intervention    date,
  contrat_id           uuid REFERENCES contrats(id) ON DELETE SET NULL,
  source_systeme       text DEFAULT 'Manuel',      -- 'Manuel' | 'BNS' | 'SI Logement' | 'Epona'
  commentaire          text,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read charges"
  ON charges FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert charges"
  ON charges FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update charges"
  ON charges FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_charges_batiment ON charges(batiment_id);
CREATE INDEX IF NOT EXISTS idx_charges_equipement ON charges(equipement_id);
CREATE INDEX IF NOT EXISTS idx_charges_statut ON charges(statut);
CREATE INDEX IF NOT EXISTS idx_charges_responsable ON charges(responsable);

-- ─── budgets ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id    uuid REFERENCES residences(id) ON DELETE CASCADE,
  annee           int NOT NULL,
  type_budget     text NOT NULL DEFAULT 'maintenance',  -- 'maintenance' | 'energie' | 'travaux' | 'total'
  montant_initial numeric NOT NULL DEFAULT 0,
  montant_consomme numeric DEFAULT 0,
  montant_engage   numeric DEFAULT 0,
  statut_budget    text DEFAULT 'dans_les_clous',       -- 'dans_les_clous' | 'avertissement' | 'depasse' | 'gele'
  source_systeme  text DEFAULT 'BNS',
  created_at      timestamptz DEFAULT now(),
  UNIQUE(residence_id, annee, type_budget)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read budgets"
  ON budgets FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert budgets"
  ON budgets FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update budgets"
  ON budgets FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── factures ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS factures (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       text UNIQUE NOT NULL,              -- ex: 'FAC-2026-0042'
  charge_id       uuid REFERENCES charges(id) ON DELETE SET NULL,
  contrat_id      uuid REFERENCES contrats(id) ON DELETE SET NULL,
  prestataire_id  uuid REFERENCES prestataires(id) ON DELETE SET NULL,
  montant_ht      numeric NOT NULL DEFAULT 0,
  montant_tva     numeric DEFAULT 0,
  montant_ttc     numeric GENERATED ALWAYS AS (montant_ht + COALESCE(montant_tva, 0)) STORED,
  date_emission   date NOT NULL DEFAULT CURRENT_DATE,
  date_echeance   date,
  date_paiement   date,
  statut          text NOT NULL DEFAULT 'non_facture', -- 'non_facture'|'facture'|'paye'|'impaye'|'annule'
  source_systeme  text DEFAULT 'Epona',
  notes           text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read factures"
  ON factures FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert factures"
  ON factures FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update factures"
  ON factures FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── consommations_fluides ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consommations_fluides (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id    uuid REFERENCES residences(id) ON DELETE CASCADE,
  annee           int NOT NULL,
  mois            int NOT NULL CHECK (mois BETWEEN 1 AND 12),
  type_fluide     text NOT NULL,    -- 'electricite' | 'gaz' | 'eau' | 'chaleur'
  valeur_kwh      numeric,
  valeur_m3       numeric,
  cout_euros      numeric,
  indice_base100  numeric,          -- 100 = référence année N-1
  alerte_seuil    boolean DEFAULT false,
  source_systeme  text DEFAULT 'OPERAT/OSFI',
  created_at      timestamptz DEFAULT now(),
  UNIQUE(residence_id, annee, mois, type_fluide)
);

ALTER TABLE consommations_fluides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read consommations_fluides"
  ON consommations_fluides FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert consommations_fluides"
  ON consommations_fluides FOR INSERT TO anon WITH CHECK (true);

-- ─── Trigger updated_at sur charges ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_charges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_charges_updated_at
  BEFORE UPDATE ON charges
  FOR EACH ROW EXECUTE FUNCTION update_charges_updated_at();
