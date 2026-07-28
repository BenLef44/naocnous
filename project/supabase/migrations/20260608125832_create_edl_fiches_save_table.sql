-- Table for full EDL fiche persistence
CREATE TABLE IF NOT EXISTS edl_fiches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('entrant','sortant','pre_sortant')),
  occupant_id UUID,
  logement_id UUID,
  logement_numero TEXT,
  residence_nom TEXT,
  occupant_nom TEXT,
  occupant_prenom TEXT,
  occupant_email TEXT,
  occupant_tel TEXT,
  etablissement TEXT,
  date_edl DATE,
  date_entree DATE,
  date_sortie DATE,
  agent_nom TEXT,
  statut TEXT DEFAULT 'brouillon',
  observations JSONB DEFAULT '{}',
  nb JSONB DEFAULT '{}',
  notes JSONB DEFAULT '{}',
  couts JSONB DEFAULT '{}',
  reparations JSONB DEFAULT '{}',
  couts_valeurs JSONB DEFAULT '{}',
  observations_generales TEXT,
  signature_agent TEXT,
  signature_occupant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE edl_fiches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_edl_fiches" ON edl_fiches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_edl_fiches" ON edl_fiches FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_edl_fiches" ON edl_fiches FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_edl_fiches" ON edl_fiches FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_edl_fiches_occupant ON edl_fiches(occupant_id);
CREATE INDEX IF NOT EXISTS idx_edl_fiches_logement ON edl_fiches(logement_id);
CREATE INDEX IF NOT EXISTS idx_edl_fiches_type ON edl_fiches(type);

-- Table for Pre-EDL fiche persistence  
CREATE TABLE IF NOT EXISTS pre_edl_fiches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occupant_id UUID,
  logement_id UUID,
  logement_numero TEXT,
  residence_nom TEXT,
  occupant_nom TEXT,
  occupant_prenom TEXT,
  date_creation DATE DEFAULT CURRENT_DATE,
  date_inspection DATE,
  date_sortie_prevue DATE,
  statut TEXT DEFAULT 'cree',
  observations TEXT,
  couts JSONB DEFAULT '{}',
  reparations JSONB DEFAULT '{}',
  couts_valeurs JSONB DEFAULT '{}',
  checklist_obs JSONB DEFAULT '{}',
  signature_agent TEXT,
  signature_occupant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pre_edl_fiches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_pre_edl_fiches" ON pre_edl_fiches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_pre_edl_fiches" ON pre_edl_fiches FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_pre_edl_fiches" ON pre_edl_fiches FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_pre_edl_fiches" ON pre_edl_fiches FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pre_edl_fiches_occupant ON pre_edl_fiches(occupant_id);
