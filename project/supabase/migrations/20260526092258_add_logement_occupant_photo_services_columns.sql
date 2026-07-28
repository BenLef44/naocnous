/*
  # Ajout colonnes photo occupant, date entrée et services pour logements

  ## Nouvelles colonnes sur la table logements
  - `photo_occupant_url` (text) — URL photo de l'occupant (Pexels ou autre)
  - `date_entree_occupant` (date) — Date d'entrée de l'occupant dans le logement
  - `services` (jsonb) — Liste des services disponibles dans le logement (PMR, ascenseur, etc.)
  - `adresse_complete` (text) — Adresse postale complète (ex : "8 Rue Jeanne Koehler, 69003 Lyon")

  ## Seed spécifique Logement 108 (Résidence Jacques Cavalier)
  - Photo occupant : étudiante Pexels
  - Date d'entrée : septembre 2025
  - Services : liste complète des 8 services
  - Adresse complète renseignée
*/

-- Nouvelles colonnes logements
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='photo_occupant_url') THEN
    ALTER TABLE logements ADD COLUMN photo_occupant_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='date_entree_occupant') THEN
    ALTER TABLE logements ADD COLUMN date_entree_occupant date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='services') THEN
    ALTER TABLE logements ADD COLUMN services jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logements' AND column_name='adresse_complete') THEN
    ALTER TABLE logements ADD COLUMN adresse_complete text;
  END IF;
END $$;

-- Seed Logement 108 : photo occupant + date entrée + services + adresse
-- On cible le logement numéro '108' dans la résidence Jacques Cavalier
UPDATE logements
SET
  nom_occupant         = 'MARTIN',
  prenom_occupant      = 'Camille',
  email_occupant       = 'camille.martin@etudiant.univ-lyon1.fr',
  telephone_occupant   = '06 78 45 12 90',
  statut_occupation    = 'occupé',
  photo_occupant_url   = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  date_entree_occupant = '2025-09-01',
  adresse_complete     = '8 Rue Jeanne Koehler, 69003 Lyon',
  services             = '[
    {"id": "pmr",            "label": "Accessible PMR",                     "actif": true},
    {"id": "ascenseur",      "label": "Ascenseur",                          "actif": true},
    {"id": "protections",    "label": "Distribution protections périodiques","actif": true},
    {"id": "velos",          "label": "Garage à vélos",                     "actif": true},
    {"id": "wifi",           "label": "Internet / Wifi",                    "actif": true},
    {"id": "laverie",        "label": "Laverie",                            "actif": true},
    {"id": "salle_travail",  "label": "Salle de travail",                   "actif": true},
    {"id": "salle_tv",       "label": "Salle TV",                           "actif": false}
  ]'::jsonb
WHERE numero = '108'
  AND etage_id IN (
    SELECT e.id FROM etages e
    JOIN batiments b ON b.id = e.batiment_id
    JOIN residences r ON r.id = b.residence_id
    WHERE r.nom ILIKE '%cavalier%'
    LIMIT 1
  );
