ALTER TABLE interventions ADD COLUMN IF NOT EXISTS draft_step integer DEFAULT NULL;

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

ALTER TABLE interventions ADD COLUMN IF NOT EXISTS demandeur_telephone TEXT;
