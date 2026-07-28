/*
  # Ajout surface_m2 et capacite_accueil sur la table logements

  ## Modifications
  - `logements.surface_m2` (numeric) : surface du logement en m²
  - `logements.capacite_accueil` (integer) : nombre de lits / places

  Ces colonnes remplacent l'ancienne colonne `surface` si elle existait,
  mais sont ajoutées de façon non-destructive.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logements' AND column_name = 'surface_m2'
  ) THEN
    ALTER TABLE logements ADD COLUMN surface_m2 numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logements' AND column_name = 'capacite_accueil'
  ) THEN
    ALTER TABLE logements ADD COLUMN capacite_accueil integer;
  END IF;
END $$;
