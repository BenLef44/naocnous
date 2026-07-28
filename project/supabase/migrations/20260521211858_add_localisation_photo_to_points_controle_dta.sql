/*
  # Add localisation and photo_data to points_controle_dta

  1. Modified tables
    - `points_controle_dta`
      - `localisation` (text, nullable) — free-text location for repérage points
      - `photo_data` (text, nullable) — base64 PNG dataURL cropped from PDF page

  2. Notes
    - Both columns are nullable: only repérage points use them
    - photo_data stores a base64 PNG (dataURL) so no storage bucket is needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'points_controle_dta' AND column_name = 'localisation'
  ) THEN
    ALTER TABLE points_controle_dta ADD COLUMN localisation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'points_controle_dta' AND column_name = 'photo_data'
  ) THEN
    ALTER TABLE points_controle_dta ADD COLUMN photo_data text;
  END IF;
END $$;
