/*
  # Ajouter colonnes prochaine_echeance et frequence_controle à equipements

  ## Changements
  - `prochaine_echeance` (date) — date du prochain contrôle/maintenance obligatoire
  - `frequence_controle` (text) — périodicité du contrôle (annuelle, semestrielle, etc.)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipements' AND column_name = 'prochaine_echeance'
  ) THEN
    ALTER TABLE equipements ADD COLUMN prochaine_echeance date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipements' AND column_name = 'frequence_controle'
  ) THEN
    ALTER TABLE equipements ADD COLUMN frequence_controle text;
  END IF;
END $$;
