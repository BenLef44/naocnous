
-- Step 1: Add agent columns
ALTER TABLE occupants ADD COLUMN IF NOT EXISTS agent_edl_entrant TEXT;
ALTER TABLE occupants ADD COLUMN IF NOT EXISTS agent_edl_sortant TEXT;

-- Step 2: Fix conflicts — keep sortant, clear entrant for occupants with both
UPDATE occupants
SET statut_edl_entrant = 'non_applicable', date_edl_entrant = NULL
WHERE statut_edl_sortant = 'a_realiser' AND statut_edl_entrant = 'a_realiser';

-- Step 3: Reassign all a_venir occupants to June weekday entrant dates (round-robin)
DO $$
DECLARE
  weekdays date[] := ARRAY[
    '2026-06-08'::date, '2026-06-09'::date, '2026-06-10'::date, '2026-06-11'::date, '2026-06-12'::date,
    '2026-06-15'::date, '2026-06-16'::date, '2026-06-17'::date, '2026-06-18'::date, '2026-06-19'::date,
    '2026-06-22'::date, '2026-06-23'::date, '2026-06-24'::date, '2026-06-25'::date, '2026-06-26'::date
  ];
  rec   record;
  i     int := 0;
  noms  text[] := ARRAY['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand',
                         'Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','David',
                         'Bertrand','Roux','Vincent','Fournier','Faure','Girard','Bonnet','Lambert',
                         'Fontaine','Rousseau','Blanc','Henry','Guerin','Boyer','Garnier','Chevalier',
                         'Andre','Mercier','Dupont','Robin','Renard','Morin','Clement','Gauthier',
                         'Perrin','Morel','Gaillard','Colin','Brunet','Rey','Leclerc','Leclercq',
                         'Picard','Moulin','Denis','Aubert','Barbe','Jacquet','Tessier','Fernandez',
                         'Meunier','Auger','Coste','Huet','Noel','Baron','Arnoux','Vidal'];
  prenoms text[] := ARRAY['Léa','Hugo','Chloé','Maxime','Emma','Lucas','Alice','Arthur','Manon',
                           'Baptiste','Camille','Théo','Louise','Raphaël','Jade','Mathieu','Sofia',
                           'Florian','Inès','Clément','Zoé','Sébastien','Ambre','Alexis','Juliette',
                           'Olivier','Pauline','Nicolas','Margot','Tom','Capucine','Robin','Constance',
                           'Gabriel','Romane','Maxence','Clara','Tristan','Elisa','Corentin','Charlotte',
                           'Simon','Juliette','Antoine','Maeva','Adrien','Axelle','Romain','Noemie',
                           'Quentin','Lucie','Erwan','Océane','Nathan','Sarah','Loïc','Eva',
                           'Mathis','Laura','Valentin','Clara','Julien','Anaïs','Guillaume','Victoria'];
  etablissements text[] := ARRAY['Université Lyon 1','Université Lyon 2','Université Lyon 3',
                                   'École Centrale Lyon','INSA Lyon'];
  log_id uuid;
BEGIN

  -- Reassign existing a_venir occupants (42 total) to June weekdays
  FOR rec IN
    SELECT id FROM occupants WHERE statut = 'a_venir' ORDER BY id
  LOOP
    UPDATE occupants
    SET statut_edl_entrant = 'a_realiser',
        date_entree        = weekdays[(i % 15) + 1],
        date_edl_entrant   = NULL
    WHERE id = rec.id;
    i := i + 1;
  END LOOP;

  -- Insert 63 new a_venir occupants using logements from sortant pool
  FOR rec IN
    SELECT DISTINCT logement_id
    FROM occupants
    WHERE statut_edl_sortant = 'a_realiser'
    ORDER BY logement_id
    LIMIT 63
  LOOP
    INSERT INTO occupants (
      logement_id, nom, prenom, statut,
      statut_edl_entrant, date_entree, date_edl_entrant,
      statut_edl_sortant, type_contrat, etablissement
    ) VALUES (
      rec.logement_id,
      noms[(i % array_length(noms, 1)) + 1],
      prenoms[(i % array_length(prenoms, 1)) + 1],
      'a_venir',
      'a_realiser',
      weekdays[(i % 15) + 1],
      NULL,
      'non_applicable',
      'Licence',
      etablissements[(i % 5) + 1]
    );
    i := i + 1;
  END LOOP;

END $$;

-- Step 4: Seed agent assignments for sortants (round-robin over 5 agents)
WITH numbered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY date_sortie_prevue, id) - 1) % 5 AS rn
  FROM occupants
  WHERE statut_edl_sortant = 'a_realiser'
)
UPDATE occupants o
SET agent_edl_sortant = (ARRAY['M. Leblanc', 'T. Bernard', 'S. Durand', 'P. Martin', 'I. Rossignol'])[n.rn + 1]
FROM numbered n
WHERE o.id = n.id;

-- Step 5: Seed agent assignments for entrants (round-robin over 5 agents)
WITH numbered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY date_entree, id) - 1) % 5 AS rn
  FROM occupants
  WHERE statut_edl_entrant = 'a_realiser'
)
UPDATE occupants o
SET agent_edl_entrant = (ARRAY['M. Leblanc', 'T. Bernard', 'S. Durand', 'P. Martin', 'I. Rossignol'])[n.rn + 1]
FROM numbered n
WHERE o.id = n.id;

-- Step 6: RLS policy for new columns (they're on the same row, existing policies cover it)
-- No changes needed — the existing anon SELECT policy covers all columns.
