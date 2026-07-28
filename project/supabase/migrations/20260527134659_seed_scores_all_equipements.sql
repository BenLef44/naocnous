/*
  # Seed scores renouvellement — tous les équipements
*/

DO $$
DECLARE
  rec RECORD;
  duree_vie int;
  age_ans numeric;
  age_pct numeric;
  sp int;
  se int;
  sr int;
  sg int;
  niv text;
  capex numeric;
  annee_prev int;
  seed_val numeric;
BEGIN
  FOR rec IN SELECT id, categorie, date_mise_en_service FROM equipements LOOP

    duree_vie := CASE rec.categorie
      WHEN 'Ascenseurs'         THEN 20
      WHEN 'Chauffage'          THEN 20
      WHEN 'Électricité'        THEN 25
      WHEN 'Sécurité incendie'  THEN 12
      WHEN 'Eau sanitaire'      THEN 15
      WHEN 'Ventilation'        THEN 15
      WHEN 'Gaz'                THEN 18
      WHEN 'Climatisation'      THEN 15
      WHEN 'Structure bâtiment' THEN 30
      ELSE 15
    END;

    IF rec.date_mise_en_service IS NOT NULL THEN
      age_ans := EXTRACT(EPOCH FROM (CURRENT_DATE::timestamp - rec.date_mise_en_service::timestamp)) / 31557600.0;
    ELSE
      age_ans := 7.0;
    END IF;

    age_pct := LEAST(1.5, age_ans / duree_vie::numeric);
    seed_val := (('x' || substr(rec.id::text, 1, 8))::bit(32)::bigint % 1000) / 1000.0;

    sp := LEAST(100, GREATEST(5, (ROUND(
      CASE
        WHEN age_pct >= 1.2 THEN 82 + seed_val * 15
        WHEN age_pct >= 1.0 THEN 68 + seed_val * 18
        WHEN age_pct >= 0.8 THEN 52 + seed_val * 18
        WHEN age_pct >= 0.6 THEN 36 + seed_val * 18
        WHEN age_pct >= 0.4 THEN 20 + seed_val * 18
        ELSE 6 + seed_val * 16
      END))::int));

    se := LEAST(100, GREATEST(5, (ROUND(
      CASE rec.categorie
        WHEN 'Ascenseurs'        THEN age_pct * 62 + seed_val * 30 + 6
        WHEN 'Eau sanitaire'     THEN age_pct * 58 + seed_val * 30 + 6
        WHEN 'Sécurité incendie' THEN age_pct * 55 + seed_val * 28 + 8
        WHEN 'Chauffage'         THEN age_pct * 48 + seed_val * 28 + 6
        WHEN 'Ventilation'       THEN age_pct * 44 + seed_val * 28 + 5
        WHEN 'Électricité'       THEN age_pct * 38 + seed_val * 25 + 5
        WHEN 'Gaz'               THEN age_pct * 50 + seed_val * 28 + 5
        ELSE age_pct * 35 + seed_val * 25 + 4
      END))::int));

    sr := LEAST(100, GREATEST(5, (ROUND(
      CASE rec.categorie
        WHEN 'Sécurité incendie' THEN age_pct * 68 + seed_val * 25 + 6
        WHEN 'Ascenseurs'        THEN age_pct * 62 + seed_val * 25 + 8
        WHEN 'Gaz'               THEN age_pct * 60 + seed_val * 25 + 6
        WHEN 'Eau sanitaire'     THEN age_pct * 56 + seed_val * 25 + 6
        WHEN 'Électricité'       THEN age_pct * 46 + seed_val * 25 + 5
        WHEN 'Chauffage'         THEN age_pct * 42 + seed_val * 22 + 5
        WHEN 'Ventilation'       THEN age_pct * 38 + seed_val * 22 + 4
        ELSE age_pct * 28 + seed_val * 20 + 3
      END))::int));

    sg := LEAST(100, GREATEST(5, (ROUND(0.25 * sp + 0.35 * se + 0.40 * sr))::int));

    niv := CASE
      WHEN sg >= 71 THEN 'remplacement_prioritaire'
      WHEN sg >= 51 THEN 'risque_eleve'
      WHEN sg >= 31 THEN 'surveillance'
      ELSE 'bon_etat'
    END;

    capex := ROUND((
      CASE rec.categorie
        WHEN 'Ascenseurs'         THEN 42000 + seed_val * 28000
        WHEN 'Chauffage'          THEN 32000 + seed_val * 22000
        WHEN 'Électricité'        THEN 22000 + seed_val * 38000
        WHEN 'Sécurité incendie'  THEN 16000 + seed_val * 18000
        WHEN 'Eau sanitaire'      THEN 10000 + seed_val * 16000
        WHEN 'Ventilation'        THEN  7000 + seed_val *  9000
        WHEN 'Gaz'                THEN 13000 + seed_val * 13000
        WHEN 'Climatisation'      THEN  9000 + seed_val * 11000
        WHEN 'Structure bâtiment' THEN 75000 + seed_val * 110000
        ELSE 4000 + seed_val * 7000
      END * (0.85 + age_pct * 0.35))::numeric, 2);

    annee_prev := GREATEST(2026, LEAST(2040,
      date_part('year', CURRENT_DATE)::int +
      GREATEST(0, ROUND(duree_vie::numeric * (1.0 - age_pct)))::int
    ));

    INSERT INTO scores_renouvellement
      (equipement_id, score_patrimonial, score_exploitation, score_risque,
       score_global, niveau, duree_vie_theorique, annee_previsionnelle, capex_estime, notes)
    VALUES
      (rec.id, sp, se, sr, sg, niv, duree_vie, annee_prev, capex,
       rec.categorie || ' - ' || ROUND(age_pct * 100)::text || '% duree de vie')
    ON CONFLICT (equipement_id) DO UPDATE SET
      score_patrimonial    = EXCLUDED.score_patrimonial,
      score_exploitation   = EXCLUDED.score_exploitation,
      score_risque         = EXCLUDED.score_risque,
      score_global         = EXCLUDED.score_global,
      niveau               = EXCLUDED.niveau,
      duree_vie_theorique  = EXCLUDED.duree_vie_theorique,
      annee_previsionnelle = EXCLUDED.annee_previsionnelle,
      capex_estime         = EXCLUDED.capex_estime,
      notes                = EXCLUDED.notes,
      calculated_at        = now();
  END LOOP;
END $$;
