/*
  # Ajouter residence_id à equipements et créer données équipements par résidence

  ## Changements
  1. Ajoute la colonne `residence_id` sur la table `equipements` pour permettre
     le rattachement d'un équipement directement à une résidence (niveau intermédiaire
     entre site et bâtiment dans l'arborescence patrimoniale).
  2. Ajoute un index sur `residence_id` pour les requêtes de filtrage.
  3. Met à jour les politiques RLS existantes (rien à changer, déjà ouvertes en anon).

  ## Colonnes modifiées
  - `equipements.residence_id` (uuid, nullable, FK → residences.id) — nouveau
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipements' AND column_name = 'residence_id'
  ) THEN
    ALTER TABLE equipements
      ADD COLUMN residence_id uuid REFERENCES residences(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_equipements_residence_id ON equipements(residence_id);
