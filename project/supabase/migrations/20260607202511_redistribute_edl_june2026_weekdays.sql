
-- Redistribute EDL sortants and entrants across weekdays of June 8-26, 2026
-- ~7 per day Mon-Fri = 35/week × 3 weeks = 105 total each

DO $$
DECLARE
  -- 15 working days: June 8-12, 15-19, 22-26
  weekdays date[] := ARRAY[
    '2026-06-08'::date, '2026-06-09'::date, '2026-06-10'::date, '2026-06-11'::date, '2026-06-12'::date,
    '2026-06-15'::date, '2026-06-16'::date, '2026-06-17'::date, '2026-06-18'::date, '2026-06-19'::date,
    '2026-06-22'::date, '2026-06-23'::date, '2026-06-24'::date, '2026-06-25'::date, '2026-06-26'::date
  ];
  rec record;
  i int := 0;
  target_date date;
BEGIN

  -- ── Step 1: Reset all existing June 2026 sortants to NULL so we can re-assign
  UPDATE occupants
  SET date_sortie_prevue = NULL, date_edl_sortant = NULL, statut_edl_sortant = 'non_applicable'
  WHERE statut_edl_sortant = 'a_realiser'
    AND date_sortie_prevue BETWEEN '2026-06-01' AND '2026-06-30';

  -- ── Step 2: Assign 105 sortants from occupant_actuel pool, round-robin across weekdays
  i := 0;
  FOR rec IN
    SELECT id FROM occupants
    WHERE statut IN ('actif', 'occupant_actuel')
    AND (statut_edl_sortant IS NULL OR statut_edl_sortant = 'non_applicable')
    ORDER BY id
    LIMIT 105
  LOOP
    target_date := weekdays[(i % 15) + 1];
    UPDATE occupants
    SET
      statut_edl_sortant = 'a_realiser',
      date_sortie_prevue = target_date,
      date_edl_sortant   = NULL
    WHERE id = rec.id;
    i := i + 1;
  END LOOP;

  -- ── Step 3: Reset all existing entrants (Sept 2026) to NULL so we can re-assign to June
  UPDATE occupants
  SET date_entree = NULL, date_edl_entrant = NULL, statut_edl_entrant = 'non_applicable'
  WHERE statut_edl_entrant = 'a_realiser'
    AND (date_entree BETWEEN '2026-09-01' AND '2026-09-30'
         OR date_entree BETWEEN '2026-06-01' AND '2026-06-30');

  -- ── Step 4: Assign 105 entrants from a_venir / occupant_actuel pool, round-robin
  i := 0;
  FOR rec IN
    SELECT id FROM occupants
    WHERE statut IN ('a_venir', 'occupant_actuel', 'actif')
    AND (statut_edl_entrant IS NULL OR statut_edl_entrant = 'non_applicable' OR statut_edl_entrant = 'realise')
    ORDER BY id
    LIMIT 105
  LOOP
    target_date := weekdays[(i % 15) + 1];
    UPDATE occupants
    SET
      statut_edl_entrant = 'a_realiser',
      date_entree        = target_date,
      date_edl_entrant   = NULL
    WHERE id = rec.id;
    i := i + 1;
  END LOOP;

END $$;
