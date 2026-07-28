/*
  # Seed 750 occupants with ~1500 EDL records

  Inserts realistic occupant data across multiple CROUS Lyon residences.
  Each occupant has:
  - statut_edl_entrant = 'realise' with a date
  - statut_edl_sortant = 'realise' (for historical occupants) or 'a_realiser' (current)
  - Varied établissements, types de contrat, and occupation dates
  - Mix of occupant_actuel (current) and ancien_occupant (former)

  This generates approximately 1500 EDL records visible in the EDL module.

  Names are fictional student names typical for CROUS context.
*/

DO $$
DECLARE
  -- Arrays for random data generation
  noms      text[] := ARRAY[
    'Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
    'Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier',
    'Morel','Girard','Andre','Lefevre','Mercier','Dupont','Lambert','Bonnet','Francois','Martinez',
    'Legrand','Garnier','Faure','Rousseau','Blanc','Guerin','Muller','Henry','Roussel','Nicolas',
    'Perrin','Morin','Mathieu','Clement','Gauthier','Dumont','Lopez','Fontaine','Chevalier','Robin',
    'Masson','Sanchez','Gerard','Nguyen','Boyer','Denis','Lemaire','Duval','Joly','Riviere',
    'Lucas','Gaillard','Andre','Barbier','Arnaud','Giraud','Le Gall','Pierre','Renard','Colin',
    'Meunier','Blanchard','Caron','Picard','Roger','Noel','Aubert','Leclercq','Vidal','Bourgeois'
  ];
  prenoms   text[] := ARRAY[
    'Emma','Lucas','Lea','Hugo','Manon','Nathan','Chloe','Tom','Camille','Romain',
    'Inès','Maxime','Juliette','Baptiste','Jade','Alexandre','Zoe','Clement','Lisa','Arthur',
    'Sarah','Ethan','Lucie','Theo','Eva','Louis','Amelia','Antoine','Charlotte','Julien',
    'Alice','Nicolas','Laura','Pierre','Anais','Paul','Clara','Simon','Oceane','Mathis',
    'Marie','Thomas','Elisa','Quentin','Amelie','Kevin','Pauline','Alexis','Caroline','Benjamin',
    'Margot','Florian','Elisa','Guillaume','Emilie','Remi','Sophie','Adrien','Helene','Enzo',
    'Aurelie','Felix','Noemie','Raphael','Iris','Tristan','Estelle','Axel','Laure','Dylan',
    'Celia','Arnaud','Mila','Sebastien','Anna','Thibault','Laetitia','Valentin','Stephanie','Samuel'
  ];
  etablissements text[] := ARRAY[
    'Université Lyon 1 - Claude Bernard',
    'Université Lyon 2 - Lumière',
    'Université Lyon 3 - Jean Moulin',
    'INSA Lyon',
    'ECL - École Centrale Lyon',
    'Sciences Po Lyon',
    'EMLYON Business School',
    'ENTPE',
    'Université Jean Monnet - Saint-Étienne',
    'IUT Lyon 1',
    'IUT Lumière',
    'CPE Lyon',
    'ISFA',
    'Polytech Lyon'
  ];
  contrats text[] := ARRAY['bail_classique','bail_classique','bail_classique','colocation','echange_international'];

  -- Logement IDs sampled from actual data
  logement_ids uuid[];
  lid uuid;
  nom_val text;
  prenom_val text;
  etab_val text;
  contrat_val text;
  date_entree date;
  date_sortie date;
  date_edl_e date;
  date_edl_s date;
  statut_occ text;
  i int;
  seed_count int := 0;
BEGIN
  -- Load all logement IDs into array (limit to first 800 for spread)
  SELECT array_agg(id) INTO logement_ids FROM (SELECT id FROM logements ORDER BY id LIMIT 800) sub;

  -- Insert 750 occupants
  FOR i IN 1..750 LOOP
    lid          := logement_ids[1 + ((i * 7 + 13) % array_length(logement_ids, 1))];
    nom_val      := noms[1 + ((i * 3 + 5) % array_length(noms, 1))];
    prenom_val   := prenoms[1 + ((i * 11 + 7) % array_length(prenoms, 1))];
    etab_val     := etablissements[1 + ((i * 2 + 3) % array_length(etablissements, 1))];
    contrat_val  := contrats[1 + ((i * 4 + 1) % array_length(contrats, 1))];

    -- Vary occupation periods: 3 cohorts
    IF i <= 250 THEN
      -- Cohort 1: 2023-2024 (historical, ancien_occupant)
      date_entree  := ('2023-09-01'::date) + ((i % 15) || ' days')::interval;
      date_sortie  := ('2024-06-30'::date) + ((i % 10) || ' days')::interval;
      date_edl_e   := date_entree + '2 days'::interval;
      date_edl_s   := date_sortie - '3 days'::interval;
      statut_occ   := 'ancien_occupant';
    ELSIF i <= 500 THEN
      -- Cohort 2: 2024-2025 (historical, ancien_occupant)
      date_entree  := ('2024-09-01'::date) + ((i % 12) || ' days')::interval;
      date_sortie  := ('2025-06-30'::date) + ((i % 10) || ' days')::interval;
      date_edl_e   := date_entree + '1 day'::interval;
      date_edl_s   := date_sortie - '2 days'::interval;
      statut_occ   := 'ancien_occupant';
    ELSE
      -- Cohort 3: 2025-2026 (current or recent)
      date_entree  := ('2025-09-01'::date) + ((i % 20) || ' days')::interval;
      date_sortie  := ('2026-06-30'::date) + ((i % 15) || ' days')::interval;
      date_edl_e   := date_entree + '1 day'::interval;
      date_edl_s   := NULL; -- sortant not done yet for current cohort
      statut_occ   := CASE WHEN i % 3 = 0 THEN 'ancien_occupant' ELSE 'occupant_actuel' END;
    END IF;

    INSERT INTO occupants (
      logement_id,
      nom,
      prenom,
      email,
      etablissement,
      type_contrat,
      reference_bail,
      date_entree,
      date_sortie_prevue,
      statut_edl_entrant,
      date_edl_entrant,
      statut_edl_sortant,
      date_edl_sortant,
      statut
    ) VALUES (
      lid,
      nom_val,
      prenom_val,
      lower(prenom_val) || '.' || lower(nom_val) || '@etu.univ-lyon1.fr',
      etab_val,
      contrat_val,
      'BAIL-LYON-' || to_char(date_entree, 'YYYY') || '-' || lpad(i::text, 5, '0'),
      date_entree,
      date_sortie,
      'realise',
      date_edl_e,
      CASE
        WHEN statut_occ = 'ancien_occupant' THEN 'realise'
        WHEN i % 5 = 0 THEN 'a_realiser'
        ELSE 'non_applicable'
      END,
      date_edl_s,
      statut_occ
    );

    seed_count := seed_count + 1;
  END LOOP;

  RAISE NOTICE 'Inserted % occupants', seed_count;
END $$;
