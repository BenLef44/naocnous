
/*
  # Remplacement complet des données par le vrai patrimoine CROUS de Lyon

  ## Résumé
  Supprime toutes les données existantes (logements, étages, bâtiments, résidences, sites)
  et insère le patrimoine officiel du CROUS de Lyon structuré en 4 niveaux :
  Campus → Résidence → Bâtiment → Étage → Logement

  ## Données insérées
  - 13 campus (sites)
  - 29 résidences
  - 1 bâtiment par résidence (architecture monobloc)
  - Étages répartis selon estimation, logements ventilés uniformément
  - Logements numérotés à la manière hôtelière : étage 1 → 101, 102…

  ## Notes
  - Résidences avec logements inconnus : estimation 60 logements
  - La suppression est effectuée dans l'ordre des dépendances FK
*/

-- ── 1. Nettoyage ─────────────────────────────────────────────────────────────

DELETE FROM actions_correctives;
DELETE FROM points_controle;
DELETE FROM controles_reglementaires;
DELETE FROM logements;
DELETE FROM etages;
DELETE FROM batiments;
DELETE FROM residences;
DELETE FROM sites;

-- ── 2. Sites (campus) ────────────────────────────────────────────────────────

INSERT INTO sites (id, code, nom, ville, region, statut) VALUES
  ('a1000001-0000-0000-0000-000000000001', 'LY-DOUA',     'Campus La Doua / Villeurbanne',                   'Villeurbanne',    'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000002', 'LY-ROCKE',    'Campus Rockefeller / Laënnec',                    'Lyon',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000003', 'LY-CENTRE6',  'Campus Centre / Lyon 6',                          'Lyon',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000004', 'LY-BERGES',   'Campus Berges du Rhône / Manufacture des Tabacs', 'Lyon',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000005', 'LY-BRON',     'Campus Porte des Alpes (Bron)',                   'Bron',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000006', 'LY-ENS',      'Campus ENS Lyon / Gerland',                       'Lyon',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000007', 'LY-STJUST',   'Campus Lyon 5 — Saint-Just',                      'Lyon',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000008', 'LY-PRESQUILE','Campus Lyon Centre / Presqu''île',                'Lyon',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000009', 'LY-CENTRE6B', 'Campus Lyon Centre / Lyon 6',                     'Lyon',            'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000010', 'LY-STPRIEST', 'Campus Saint-Priest',                             'Saint-Priest',    'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000011', 'LY-BOURG',    'Campus Bourg-en-Bresse',                          'Bourg-en-Bresse', 'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000012', 'LY-STETIENNE','Campus Saint-Étienne',                            'Saint-Étienne',   'Auvergne-Rhône-Alpes', 'disponible'),
  ('a1000001-0000-0000-0000-000000000013', 'LY-ROANNE',   'Campus Roanne',                                   'Roanne',          'Auvergne-Rhône-Alpes', 'disponible');

-- ── 3. Résidences ────────────────────────────────────────────────────────────

INSERT INTO residences (id, site_id, code, nom, nombre_logements, statut) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'JUSS',   'Résidence Jussieu',               717, 'disponible'),
  ('b1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 'ANTO',   'Résidence Les Antonins',          404, 'disponible'),
  ('b1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000001', 'PUVIS',  'Résidence Puvis de Chavannes',    271, 'disponible'),
  ('b1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000001', 'EINST',  'Résidence Einstein',              241, 'disponible'),
  ('b1000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000001', 'JSSTU',  'Résidence Jussieu Studios',       163, 'disponible'),
  ('b1000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000001', 'ARCH',   'Résidence Archimède',              60, 'disponible'),
  ('b1000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000001', 'ALTH',   'Résidence Althéa',                 60, 'disponible'),
  ('b1000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000002', 'PARA',   'Résidence Paradin',               300, 'disponible'),
  ('b1000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000002', 'CROIX',  'Résidence Croix du Sud',          193, 'disponible'),
  ('b1000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000002', 'MERM',   'Résidence Jean Mermoz',           593, 'disponible'),
  ('b1000001-0000-0000-0000-000000000011', 'a1000001-0000-0000-0000-000000000003', 'CAVA',   'Résidence Jacques Cavalier',      180, 'disponible'),
  ('b1000001-0000-0000-0000-000000000012', 'a1000001-0000-0000-0000-000000000003', 'VOLT',   'Résidence Voltaire',              108, 'disponible'),
  ('b1000001-0000-0000-0000-000000000013', 'a1000001-0000-0000-0000-000000000004', 'MADE',   'Résidence La Madeleine',          343, 'disponible'),
  ('b1000001-0000-0000-0000-000000000014', 'a1000001-0000-0000-0000-000000000004', 'QUAIS',  'Résidence Les Quais',             185, 'disponible'),
  ('b1000001-0000-0000-0000-000000000015', 'a1000001-0000-0000-0000-000000000004', 'GARI',   'Résidence Garibaldi',             192, 'disponible'),
  ('b1000001-0000-0000-0000-000000000016', 'a1000001-0000-0000-0000-000000000004', 'DELE',   'Résidence Benjamin Delessert',    162, 'disponible'),
  ('b1000001-0000-0000-0000-000000000017', 'a1000001-0000-0000-0000-000000000004', 'LIRO',   'Résidence André Lirondelle',      158, 'disponible'),
  ('b1000001-0000-0000-0000-000000000018', 'a1000001-0000-0000-0000-000000000005', 'ALICE',  'Résidence Alice Guy',             198, 'disponible'),
  ('b1000001-0000-0000-0000-000000000019', 'a1000001-0000-0000-0000-000000000006', 'GIRON',  'Résidence Les Girondins',         170, 'disponible'),
  ('b1000001-0000-0000-0000-000000000020', 'a1000001-0000-0000-0000-000000000007', 'ALLIX',  'Résidence André Allix',           425, 'disponible'),
  ('b1000001-0000-0000-0000-000000000021', 'a1000001-0000-0000-0000-000000000007', 'PHILO',  'Résidence Philomène Magnin',      171, 'disponible'),
  ('b1000001-0000-0000-0000-000000000022', 'a1000001-0000-0000-0000-000000000007', 'ARCHE',  'Résidence Arches d''Agrippa',      95, 'disponible'),
  ('b1000001-0000-0000-0000-000000000023', 'a1000001-0000-0000-0000-000000000007', 'MEYG',   'Résidence Jean Meygret',           74, 'disponible'),
  ('b1000001-0000-0000-0000-000000000024', 'a1000001-0000-0000-0000-000000000008', 'CONFL',  'Résidence Confluence',             89, 'disponible'),
  ('b1000001-0000-0000-0000-000000000025', 'a1000001-0000-0000-0000-000000000009', 'BUGE',   'Résidence Bugeaud',                61, 'disponible'),
  ('b1000001-0000-0000-0000-000000000026', 'a1000001-0000-0000-0000-000000000010', 'AIME',   'Résidence Aimé Césaire',           60, 'disponible'),
  ('b1000001-0000-0000-0000-000000000027', 'a1000001-0000-0000-0000-000000000011', 'BOURG1', 'Résidences CROUS Bourg-en-Bresse', 60, 'disponible'),
  ('b1000001-0000-0000-0000-000000000028', 'a1000001-0000-0000-0000-000000000012', 'STETN1', 'Résidences CROUS Saint-Étienne',   60, 'disponible'),
  ('b1000001-0000-0000-0000-000000000029', 'a1000001-0000-0000-0000-000000000013', 'ROAN1',  'Résidences CROUS Roanne',          60, 'disponible');

-- ── 4. Bâtiments ─────────────────────────────────────────────────────────────

INSERT INTO batiments (id, residence_id, code, nom, nombre_etages, statut, categorie) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000001', 'BAT-JUSS',  'Bâtiment principal', 18, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002', 'BAT-ANTO',  'Bâtiment principal', 12, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000003', 'BAT-PUVIS', 'Bâtiment principal',  9, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000004', 'BAT-EINST', 'Bâtiment principal',  8, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000005', 'BAT-JSSTU', 'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000006', 'b1000001-0000-0000-0000-000000000006', 'BAT-ARCH',  'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000007', 'b1000001-0000-0000-0000-000000000007', 'BAT-ALTH',  'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000008', 'b1000001-0000-0000-0000-000000000008', 'BAT-PARA',  'Bâtiment principal',  9, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000009', 'b1000001-0000-0000-0000-000000000009', 'BAT-CROIX', 'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000010', 'b1000001-0000-0000-0000-000000000010', 'BAT-MERM',  'Bâtiment principal', 16, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000011', 'b1000001-0000-0000-0000-000000000011', 'BAT-CAVA',  'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000012', 'b1000001-0000-0000-0000-000000000012', 'BAT-VOLT',  'Bâtiment principal',  4, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000013', 'b1000001-0000-0000-0000-000000000013', 'BAT-MADE',  'Bâtiment principal', 10, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000014', 'b1000001-0000-0000-0000-000000000014', 'BAT-QUAIS', 'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000015', 'b1000001-0000-0000-0000-000000000015', 'BAT-GARI',  'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000016', 'b1000001-0000-0000-0000-000000000016', 'BAT-DELE',  'Bâtiment principal',  5, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000017', 'b1000001-0000-0000-0000-000000000017', 'BAT-LIRO',  'Bâtiment principal',  5, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000018', 'b1000001-0000-0000-0000-000000000018', 'BAT-ALICE', 'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000019', 'b1000001-0000-0000-0000-000000000019', 'BAT-GIRON', 'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000020', 'b1000001-0000-0000-0000-000000000020', 'BAT-ALLIX', 'Bâtiment principal', 12, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000021', 'b1000001-0000-0000-0000-000000000021', 'BAT-PHILO', 'Bâtiment principal',  5, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000022', 'b1000001-0000-0000-0000-000000000022', 'BAT-ARCHE', 'Bâtiment principal',  4, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000023', 'b1000001-0000-0000-0000-000000000023', 'BAT-MEYG',  'Bâtiment principal',  3, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000024', 'b1000001-0000-0000-0000-000000000024', 'BAT-CONFL', 'Bâtiment principal',  4, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000025', 'b1000001-0000-0000-0000-000000000025', 'BAT-BUGE',  'Bâtiment principal',  3, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000026', 'b1000001-0000-0000-0000-000000000026', 'BAT-AIME',  'Bâtiment principal',  5, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000027', 'b1000001-0000-0000-0000-000000000027', 'BAT-BOURG', 'Bâtiment principal',  4, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000028', 'b1000001-0000-0000-0000-000000000028', 'BAT-STETN', 'Bâtiment principal',  6, 'disponible', 'Résidentiel'),
  ('c1000001-0000-0000-0000-000000000029', 'b1000001-0000-0000-0000-000000000029', 'BAT-ROAN',  'Bâtiment principal',  4, 'disponible', 'Résidentiel');

-- ── 5. Étages et logements via PL/pgSQL ──────────────────────────────────────

DO $$
DECLARE
  bat             RECORD;
  n_etages        INT;
  n_log_total     INT;
  n_log_per_floor INT;
  n_log_reste     INT;
  floor_num       INT;
  floor_nom       TEXT;
  floor_id        UUID;
  n_this_floor    INT;
  log_seq         INT;
  log_num_str     TEXT;
BEGIN
  FOR bat IN
    SELECT b.id AS bat_id,
           b.nombre_etages,
           r.nombre_logements
    FROM   batiments b
    JOIN   residences r ON r.id = b.residence_id
    WHERE  b.code LIKE 'BAT-%'
  LOOP
    n_etages        := GREATEST(bat.nombre_etages, 1);
    n_log_total     := GREATEST(bat.nombre_logements, 1);
    n_log_per_floor := FLOOR(n_log_total::numeric / n_etages)::INT;
    n_log_reste     := n_log_total - (n_log_per_floor * n_etages);

    FOR floor_num IN 1..n_etages LOOP
      floor_nom := CASE floor_num
                     WHEN 1 THEN '1er étage'
                     ELSE floor_num::TEXT || 'e étage'
                   END;

      n_this_floor := n_log_per_floor
                    + CASE WHEN floor_num = n_etages THEN n_log_reste ELSE 0 END;
      n_this_floor := GREATEST(n_this_floor, 1);

      floor_id := gen_random_uuid();

      INSERT INTO etages (id, batiment_id, numero, nom, nombre_logements)
      VALUES (floor_id, bat.bat_id, floor_num, floor_nom, n_this_floor);

      -- Numérotation hôtelière : étage N → N01, N02 … (ou NN01 si N >= 10)
      FOR log_seq IN 1..n_this_floor LOOP
        log_num_str := floor_num::TEXT || LPAD(log_seq::TEXT, 2, '0');

        INSERT INTO logements (id, etage_id, code, numero, type_logement, statut)
        VALUES (gen_random_uuid(), floor_id, log_num_str, log_num_str, 'Studio', 'disponible');
      END LOOP;

    END LOOP;
  END LOOP;
END $$;
