
/*
  # Ecole Jules Ferry — patrimoine hierarchy + ERP update
  
  sites cols: id, nom, code, adresse, ville, code_postal, statut
  residences cols: id, site_id, nom, code, adresse, statut
  batiments cols: id, residence_id, nom, code, annee_construction, surface_m2, statut
*/

-- ─── 1. Site ──────────────────────────────────────────────────────────────────

INSERT INTO sites (id, nom, code, statut, adresse, ville, code_postal)
VALUES (
  'f0000001-0000-0000-0000-000000000001',
  'Ecole Jules Ferry',
  'SITE-FERRY-LYO',
  'en_service',
  '7 Rue Jules Ferry',
  'Lyon 7ème',
  '69007'
)
ON CONFLICT (id) DO UPDATE SET
  nom    = EXCLUDED.nom,
  code   = EXCLUDED.code,
  statut = EXCLUDED.statut,
  adresse = EXCLUDED.adresse,
  ville  = EXCLUDED.ville;

-- ─── 2. Résidence ─────────────────────────────────────────────────────────────

INSERT INTO residences (id, site_id, code, nom, adresse, statut)
VALUES (
  'f0000002-0000-0000-0000-000000000001',
  'f0000001-0000-0000-0000-000000000001',
  'RES-FERRY-LYO',
  'Ecole Jules Ferry',
  '7 Rue Jules Ferry, 69007 Lyon',
  'en_service'
)
ON CONFLICT (id) DO UPDATE SET
  nom     = EXCLUDED.nom,
  site_id = EXCLUDED.site_id,
  adresse = EXCLUDED.adresse;

-- ─── 3. Bâtiments ─────────────────────────────────────────────────────────────

INSERT INTO batiments (id, residence_id, nom, code, statut, annee_construction)
VALUES
  (
    'f0000003-0000-0000-0000-000000000001',
    'f0000002-0000-0000-0000-000000000001',
    'Bâtiment Principal',
    'BAT-FERRY-MAIN',
    'en_service',
    1975
  ),
  (
    'f0000003-0000-0000-0000-000000000002',
    'f0000002-0000-0000-0000-000000000001',
    'Restaurant Scolaire',
    'BAT-FERRY-REST',
    'en_service',
    1982
  )
ON CONFLICT (id) DO UPDATE SET
  nom          = EXCLUDED.nom,
  residence_id = EXCLUDED.residence_id,
  statut       = EXCLUDED.statut;

-- ─── 4. Update existing ERP "Ferry Jules" → "Ecole Jules Ferry" (type J) ──────

UPDATE erp SET
  nom          = 'Ecole Jules Ferry',
  type_erp     = 'J',
  site_id      = 'f0000001-0000-0000-0000-000000000001',
  residence_id = 'f0000002-0000-0000-0000-000000000001'
WHERE id = '56b4fd93-a9e7-466e-9f88-cf175b96fc23';

-- ─── 5. Add ERP "Cantine Jules Ferry" (type R — Restauration) ─────────────────

INSERT INTO erp (
  nom, categorie_erp, type_erp, capacite, adresse,
  responsable_securite, email_responsable, coordonnees_secours,
  date_mise_en_service, organisme_controle, contrat_controle_ref,
  site_id, residence_id
) VALUES (
  'Cantine Jules Ferry',
  '5eme', 'R', 280,
  '7 Rue Jules Ferry, 69007 Lyon',
  'Bernard François', 'francois.bernard@crous-lyon.fr',
  'Pompiers : 18 | SAMU : 15 | Police : 17 | Directeur : 04 72 00 00 10',
  '1982-09-01', 'DEKRA Industrial', 'DEKRA-2026-0079',
  'f0000001-0000-0000-0000-000000000001',
  'f0000002-0000-0000-0000-000000000001'
)
ON CONFLICT DO NOTHING;
