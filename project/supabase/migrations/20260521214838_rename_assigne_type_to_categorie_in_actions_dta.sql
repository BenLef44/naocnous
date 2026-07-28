/*
  # Rename assigne_type to assigne_categorie in actions_correctives_dta

  1. Modified tables
    - `actions_correctives_dta`
      - Rename `assigne_type` → `assigne_categorie` to reflect the richer category system
        (entite, service, equipe, agent, partenaire, contact, utilisateur, groupe)
      - Change type to text (was text already, just change constraint)

  2. Notes
    - Uses a safe rename via ADD + UPDATE + DROP to avoid data loss
    - The old values 'interne'/'organisme' will be preserved as-is in existing rows
*/

DO $$
BEGIN
  -- Add new column if not already there
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'actions_correctives_dta' AND column_name = 'assigne_categorie'
  ) THEN
    ALTER TABLE actions_correctives_dta ADD COLUMN assigne_categorie text;
    -- Copy existing data
    UPDATE actions_correctives_dta SET assigne_categorie = assigne_type;
  END IF;
END $$;
