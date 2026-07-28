
ALTER TABLE interventions
  DROP CONSTRAINT IF EXISTS interventions_equipement_id_fkey;

ALTER TABLE interventions
  ADD CONSTRAINT interventions_equipement_id_fkey
  FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE SET NULL;
