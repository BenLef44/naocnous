
-- Maintenance plans table
CREATE TABLE maintenance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  equipement TEXT NOT NULL,
  equipement_ids UUID[] DEFAULT '{}',
  categorie TEXT,
  type TEXT NOT NULL DEFAULT 'Préventive',
  origine TEXT NOT NULL DEFAULT 'interne',
  responsable TEXT,
  frequence TEXT,
  mode TEXT NOT NULL DEFAULT 'calendaire',
  premiere_echeance DATE,
  recurrence_config JSONB DEFAULT '{}',
  statut TEXT NOT NULL DEFAULT 'planifiée',
  notif_responsable BOOLEAN DEFAULT TRUE,
  notif_gestionnaire BOOLEAN DEFAULT TRUE,
  notif_app BOOLEAN DEFAULT TRUE,
  notif_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance tasks table
CREATE TABLE maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES maintenance_plans(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  equipement TEXT,
  equipement_id UUID,
  duree TEXT DEFAULT '1 h',
  date_planifiee DATE NOT NULL,
  assignee TEXT,
  assignee_mode TEXT DEFAULT 'agent',
  checklist JSONB DEFAULT '[]',
  statut TEXT NOT NULL DEFAULT 'planifiée',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_maintenance_plans_statut   ON maintenance_plans(statut);
CREATE INDEX idx_maintenance_plans_equip    ON maintenance_plans(equipement);
CREATE INDEX idx_maintenance_tasks_plan_id  ON maintenance_tasks(plan_id);
CREATE INDEX idx_maintenance_tasks_date     ON maintenance_tasks(date_planifiee);
CREATE INDEX idx_maintenance_tasks_equipid  ON maintenance_tasks(equipement_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintenance_plans_updated
  BEFORE UPDATE ON maintenance_plans
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_updated_at();

CREATE TRIGGER trg_maintenance_tasks_updated
  BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_updated_at();

-- Enable RLS
ALTER TABLE maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Public read/write (anon access as per project convention)
CREATE POLICY "anon_select_plans"  ON maintenance_plans FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_plans"  ON maintenance_plans FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_plans"  ON maintenance_plans FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_plans"  ON maintenance_plans FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_tasks"  ON maintenance_tasks FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_tasks"  ON maintenance_tasks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_tasks"  ON maintenance_tasks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_tasks"  ON maintenance_tasks FOR DELETE TO anon USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_tasks;
