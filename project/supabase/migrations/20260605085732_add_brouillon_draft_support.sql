-- Add draft_step column to track which wizard step the draft was saved at
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS draft_step integer DEFAULT NULL;

-- Extend statut_demande check constraint to allow 'brouillon'
-- First drop existing constraint if any, then recreate
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'interventions'
      AND constraint_name = 'interventions_statut_demande_check'
  ) THEN
    ALTER TABLE interventions DROP CONSTRAINT interventions_statut_demande_check;
  END IF;
END $$;

ALTER TABLE interventions
  ADD CONSTRAINT interventions_statut_demande_check
  CHECK (statut_demande IN (
    'brouillon', 'nouveau', 'a_qualifier', 'qualifie', 'affecte',
    'en_intervention', 'en_attente_validation', 'resolu', 'cloture', 'rejete'
  ));
