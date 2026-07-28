
-- Task execution records: stores checklist completion state per occurrence
CREATE TABLE maintenance_task_executions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id        TEXT NOT NULL,           -- references PlanRow.id (P1, P2, …)
  date_planifiee DATE NOT NULL,
  checklist      JSONB NOT NULL DEFAULT '[]', -- [{ label, done }]
  etat_equipement TEXT,
  statut         TEXT NOT NULL DEFAULT 'réalisée',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, date_planifiee)
);

-- Attachment metadata (files stored client-side as object URLs; name/size persisted here)
CREATE TABLE maintenance_attachments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id   UUID REFERENCES maintenance_task_executions(id) ON DELETE CASCADE,
  plan_id        TEXT NOT NULL,
  date_planifiee DATE NOT NULL,
  file_name      TEXT NOT NULL,
  file_size      TEXT,
  file_type      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mte_plan_date  ON maintenance_task_executions(plan_id, date_planifiee);
CREATE INDEX idx_mta_exec_id    ON maintenance_attachments(execution_id);

CREATE OR REPLACE FUNCTION update_mte_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mte_updated
  BEFORE UPDATE ON maintenance_task_executions
  FOR EACH ROW EXECUTE FUNCTION update_mte_updated_at();

ALTER TABLE maintenance_task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_attachments     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_executions"   ON maintenance_task_executions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_attachments"  ON maintenance_attachments     FOR ALL TO anon USING (true) WITH CHECK (true);
