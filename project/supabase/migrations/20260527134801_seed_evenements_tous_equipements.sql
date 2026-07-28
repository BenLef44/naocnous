/*
  # Seed événements — tous les équipements (sauf ceux déjà seedés)
  Génère 2 à 4 événements cohérents par équipement :
  - 1 maintenance préventive annuelle récente
  - 1 ou 2 pannes selon age_pct
  - 1 maintenance corrective si age élevé
*/

DO $$
DECLARE
  rec RECORD;
  sc RECORD;
  age_ans numeric;
  age_pct numeric;
  duree_vie int;
  seed_val numeric;
  nb_pannes int;
  cout_maint numeric;
  cout_panne numeric;
  responsables text[] := ARRAY['Leroy P.','Moreau F.','Bernard C.','Roux P.','Dupont A.','Martin D.','Simon B.'];
  prestataires_elec text[] := ARRAY['APAVE','Bureau Veritas','SOCOTEC'];
  prestataires_asc  text[] := ARRAY['KONE Maintenance','OTIS','Schindler'];
  prestataires_cvc  text[] := ARRAY['ALDES Services','Carrier Services','Daikin SAV'];
  prestataires_gen  text[] := ARRAY['SOCOTEC','Dekra','Bureau Veritas','Alpes Controles'];
  prest text;
  resp text;
  y1 int; y2 int; y3 int;
  d1 int; d2 int; d3 int;
BEGIN
  FOR rec IN
    SELECT e.id, e.categorie, e.date_mise_en_service, e.residence_id
    FROM equipements e
    WHERE NOT EXISTS (SELECT 1 FROM evenements ev WHERE ev.equipement_id = e.id)
  LOOP
    IF rec.date_mise_en_service IS NOT NULL THEN
      age_ans := EXTRACT(EPOCH FROM (CURRENT_DATE::timestamp - rec.date_mise_en_service::timestamp)) / 31557600.0;
    ELSE
      age_ans := 7.0;
    END IF;

    duree_vie := CASE rec.categorie
      WHEN 'Ascenseurs'         THEN 20 WHEN 'Chauffage'          THEN 20
      WHEN 'Électricité'        THEN 25 WHEN 'Sécurité incendie'  THEN 12
      WHEN 'Eau sanitaire'      THEN 15 WHEN 'Ventilation'        THEN 15
      WHEN 'Gaz'                THEN 18 WHEN 'Climatisation'      THEN 15
      WHEN 'Structure bâtiment' THEN 30 ELSE 15
    END;

    age_pct := LEAST(1.5, age_ans / duree_vie::numeric);
    seed_val := (('x' || substr(rec.id::text, 1, 8))::bit(32)::bigint % 1000) / 1000.0;

    -- Nb pannes selon age_pct
    nb_pannes := CASE
      WHEN age_pct >= 1.0 THEN 3 + (seed_val * 2)::int
      WHEN age_pct >= 0.7 THEN 2 + (seed_val * 1)::int
      WHEN age_pct >= 0.4 THEN 1 + (seed_val * 1)::int
      ELSE 0 + (seed_val * 1)::int
    END;
    nb_pannes := LEAST(4, nb_pannes);

    -- Coûts selon catégorie
    cout_maint := CASE rec.categorie
      WHEN 'Ascenseurs'         THEN 500 + seed_val * 400
      WHEN 'Électricité'        THEN 800 + seed_val * 1200
      WHEN 'Sécurité incendie'  THEN 700 + seed_val * 800
      WHEN 'Chauffage'          THEN 400 + seed_val * 300
      WHEN 'Eau sanitaire'      THEN 200 + seed_val * 200
      WHEN 'Ventilation'        THEN 250 + seed_val * 200
      WHEN 'Gaz'                THEN 350 + seed_val * 250
      ELSE 150 + seed_val * 200
    END;
    cout_panne := cout_maint * (1.5 + seed_val * 1.5);

    -- Années pour les événements (les 4 dernières années)
    y1 := date_part('year', CURRENT_DATE)::int - 1;
    y2 := date_part('year', CURRENT_DATE)::int - 2;
    y3 := date_part('year', CURRENT_DATE)::int - 3;
    d1 := 30 + (seed_val * 300)::int;
    d2 := 30 + ((seed_val * 100 + 150)::int % 300);
    d3 := 30 + ((seed_val * 100 + 50)::int % 300);

    -- Prestataire selon catégorie
    prest := CASE rec.categorie
      WHEN 'Ascenseurs'   THEN prestataires_asc[1 + (seed_val * 3)::int % 3]
      WHEN 'Électricité'  THEN prestataires_elec[1 + (seed_val * 3)::int % 3]
      WHEN 'Ventilation'  THEN prestataires_cvc[1 + (seed_val * 3)::int % 3]
      WHEN 'Climatisation'THEN prestataires_cvc[1 + (seed_val * 3)::int % 3]
      ELSE prestataires_gen[1 + (seed_val * 4)::int % 4]
    END;
    resp := responsables[1 + (seed_val * 7)::int % 7];

    -- Maintenance préventive annuelle (toujours)
    INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne,
      rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel,
      statut, responsable, prestataire, cout_intervention, gravite, impact_service)
    VALUES (
      rec.id, rec.residence_id, 'maintenance_preventive',
      'Maintenance preventive annuelle',
      false, false, 0,
      (make_date(y1, 1, 1) + d1)::timestamptz,
      (make_date(y1, 1, 1) + d1 + interval '3 hours')::timestamptz,
      'termine', resp, prest,
      ROUND(cout_maint::numeric, 2),
      'mineure', 'faible'
    );

    -- Maintenance préventive 2 ans avant
    INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne,
      rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel,
      statut, responsable, prestataire, cout_intervention, gravite, impact_service)
    VALUES (
      rec.id, rec.residence_id, 'maintenance_preventive',
      'Maintenance preventive annuelle',
      false, false, 0,
      (make_date(y2, 1, 1) + d2)::timestamptz,
      (make_date(y2, 1, 1) + d2 + interval '3 hours')::timestamptz,
      'termine', resp, prest,
      ROUND(cout_maint::numeric, 2),
      'mineure', 'faible'
    );

    -- Panne 1 si nb_pannes >= 1
    IF nb_pannes >= 1 THEN
      INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne,
        rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel,
        statut, responsable, prestataire, cout_intervention, gravite, impact_service, observations)
      VALUES (
        rec.id, rec.residence_id, 'panne',
        CASE rec.categorie
          WHEN 'Ascenseurs'         THEN 'Arret ascenseur - defaut mecanique'
          WHEN 'Électricité'        THEN 'Coupure partielle - defaut disjoncteur'
          WHEN 'Sécurité incendie'  THEN 'Defaut centrale SSI - alarme intempestive'
          WHEN 'Chauffage'          THEN 'Panne regulation - absence chauffage'
          WHEN 'Eau sanitaire'      THEN 'Panne ballon ECS - eau froide'
          WHEN 'Ventilation'        THEN 'Arret extracteur VMC - courroie'
          WHEN 'Gaz'                THEN 'Defaut bruleur - arret chaufferie'
          ELSE 'Panne equipement - intervention requise'
        END,
        true, true,
        CASE WHEN age_pct >= 1.0 THEN 100 WHEN age_pct >= 0.7 THEN 80 ELSE 60 END,
        (make_date(y2, 1, 1) + d3)::timestamptz,
        (make_date(y2, 1, 1) + d3 + interval '6 hours')::timestamptz,
        'termine', resp, prest,
        ROUND(cout_panne::numeric, 2),
        CASE WHEN age_pct >= 1.0 THEN 'critique' WHEN age_pct >= 0.7 THEN 'majeure' ELSE 'mineure' END,
        CASE WHEN age_pct >= 1.0 THEN 'fort' WHEN age_pct >= 0.7 THEN 'moyen' ELSE 'faible' END,
        'Intervention corrective. Equipement ' || ROUND(age_pct * 100)::text || '% duree de vie.'
      );
    END IF;

    -- Panne 2 si nb_pannes >= 2
    IF nb_pannes >= 2 THEN
      INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne,
        rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel,
        statut, responsable, prestataire, cout_intervention, gravite, impact_service)
      VALUES (
        rec.id, rec.residence_id, 'panne',
        'Panne recurrente - usure composants',
        true, true,
        CASE WHEN age_pct >= 1.0 THEN 100 ELSE 60 END,
        (make_date(y1, 1, 1) + d2)::timestamptz,
        (make_date(y1, 1, 1) + d2 + interval '8 hours')::timestamptz,
        'termine', resp, prest,
        ROUND((cout_panne * 1.2)::numeric, 2),
        CASE WHEN age_pct >= 1.0 THEN 'critique' ELSE 'majeure' END,
        CASE WHEN age_pct >= 1.0 THEN 'critique' ELSE 'fort' END
      );
    END IF;

    -- Panne 3 si nb_pannes >= 3
    IF nb_pannes >= 3 THEN
      INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne,
        rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel,
        statut, responsable, prestataire, cout_intervention, gravite, impact_service)
      VALUES (
        rec.id, rec.residence_id, 'panne',
        'Troisieme panne - remplacement recommande',
        true, true, 100,
        (make_date(y3, 1, 1) + d1)::timestamptz,
        (make_date(y3, 1, 1) + d1 + interval '10 hours')::timestamptz,
        'termine', resp, prest,
        ROUND((cout_panne * 1.5)::numeric, 2),
        'critique', 'fort'
      );
    END IF;

    -- Maintenance corrective si age élevé
    IF age_pct >= 0.8 THEN
      INSERT INTO evenements (equipement_id, residence_id, type_evenement, libelle, est_panne,
        rend_indisponible, taux_indisponibilite, date_debut_reel, date_fin_reel,
        statut, responsable, prestataire, cout_intervention, gravite, impact_service)
      VALUES (
        rec.id, rec.residence_id, 'maintenance_corrective',
        'Remplacement piece usee - maintenance corrective',
        false, false, 0,
        (make_date(y1, 1, 1) + d3)::timestamptz,
        (make_date(y1, 1, 1) + d3 + interval '2 hours')::timestamptz,
        'termine', resp, prest,
        ROUND((cout_maint * 0.6)::numeric, 2),
        'mineure', 'faible'
      );
    END IF;

  END LOOP;
END $$;
