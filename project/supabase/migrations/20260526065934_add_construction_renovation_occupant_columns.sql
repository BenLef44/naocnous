/*
  # Ajout colonnes construction, rénovation et occupant

  ## Nouvelles colonnes

  ### Tables sites, residences, batiments, etages, logements
  - `annee_construction` (integer) — Année de construction du bien
  - `annee_derniere_renovation` (integer) — Année de la dernière rénovation majeure

  ### Table logements uniquement
  - `nom_occupant` (text) — Identité de l'occupant (étudiant)
  - `prenom_occupant` (text) — Prénom de l'occupant
  - `email_occupant` (text) — Email de l'occupant
  - `telephone_occupant` (text) — Téléphone de l'occupant
  - `statut_occupation` (text) — Ex : occupé, vacant, réservé

  ## Notes
  - Toutes les colonnes sont nullable (pas de rupture sur les données existantes)
  - Pas de suppression ni modification de colonnes existantes
*/

-- Sites
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='annee_construction') THEN
    ALTER TABLE sites ADD COLUMN annee_construction integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='annee_derniere_renovation') THEN
    ALTER TABLE sites ADD COLUMN annee_derniere_renovation integer;
  END IF;
END $$;

-- Residences
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residences' AND column_name='annee_construction') THEN
    ALTER TABLE residences ADD COLUMN annee_construction integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='residences' AND column_name='annee_derniere_renovation') THEN
    ALTER TABLE residences ADD COLUMN annee_derniere_renovation integer;
  END IF;
END $$;

-- Batiments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='batiments' AND column_name='annee_construction') THEN
    ALTER TABLE batiments ADD COLUMN annee_construction integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='batiments' AND column_name='annee_derniere_renovation') THEN
    ALTER TABLE batiments ADD COLUMN annee_derniere_renovation integer;
  END IF;
END $$;

-- Etages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='etages' AND column_name='annee_construction') THEN
    ALTER TABLE etages ADD COLUMN annee_construction integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='etages' AND column_name='annee_derniere_renovation') THEN
    ALTER TABLE etages ADD COLUMN annee_derniere_renovation integer;
  END IF;
END $$;

-- Logements
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='annee_construction') THEN
    ALTER TABLE logements ADD COLUMN annee_construction integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='annee_derniere_renovation') THEN
    ALTER TABLE logements ADD COLUMN annee_derniere_renovation integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='nom_occupant') THEN
    ALTER TABLE logements ADD COLUMN nom_occupant text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='prenom_occupant') THEN
    ALTER TABLE logements ADD COLUMN prenom_occupant text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='email_occupant') THEN
    ALTER TABLE logements ADD COLUMN email_occupant text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='telephone_occupant') THEN
    ALTER TABLE logements ADD COLUMN telephone_occupant text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='statut_occupation') THEN
    ALTER TABLE logements ADD COLUMN statut_occupation text DEFAULT 'vacant';
  END IF;
END $$;

-- Seed quelques valeurs réalistes pour la démo
UPDATE sites      SET annee_construction = 1975, annee_derniere_renovation = 2018 WHERE annee_construction IS NULL;
UPDATE residences SET annee_construction = 1982, annee_derniere_renovation = 2020 WHERE annee_construction IS NULL;
UPDATE batiments  SET annee_construction = 1984, annee_derniere_renovation = 2019 WHERE annee_construction IS NULL;
UPDATE etages     SET annee_construction = 1984, annee_derniere_renovation = 2019 WHERE annee_construction IS NULL;
UPDATE logements  SET annee_construction = 1984, annee_derniere_renovation = 2019, statut_occupation = 'occupé' WHERE annee_construction IS NULL;

-- Seed quelques occupants de démonstration sur les premiers logements
UPDATE logements
SET
  nom_occupant      = 'Dupont',
  prenom_occupant   = 'Alice',
  email_occupant    = 'alice.dupont@etudiant.univ-lyon1.fr',
  telephone_occupant = '06 12 34 56 78',
  statut_occupation = 'occupé'
WHERE id IN (SELECT id FROM logements ORDER BY numero LIMIT 15);

UPDATE logements
SET statut_occupation = 'vacant'
WHERE nom_occupant IS NULL;
