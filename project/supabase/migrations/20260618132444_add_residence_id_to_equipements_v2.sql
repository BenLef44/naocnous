-- Ajoute residence_id à equipements (FK optionnelle)
ALTER TABLE equipements ADD COLUMN IF NOT EXISTS residence_id uuid REFERENCES residences(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_equipements_residence_id ON equipements(residence_id);