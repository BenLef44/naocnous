-- Add ERP/patrimoine columns to etages and logements for all-level edit modal
ALTER TABLE etages
  ADD COLUMN IF NOT EXISTS type_erp TEXT,
  ADD COLUMN IF NOT EXISTS capacite_accueil INTEGER,
  ADD COLUMN IF NOT EXISTS valeur_amortissement NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS annee_construction INTEGER;

ALTER TABLE logements
  ADD COLUMN IF NOT EXISTS type_erp TEXT,
  ADD COLUMN IF NOT EXISTS capacite_accueil INTEGER,
  ADD COLUMN IF NOT EXISTS valeur_amortissement NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS annee_construction INTEGER;

-- Seed data for Bâtiment A — Maternelle (École Angèle Vannier)
UPDATE batiments
SET type_erp = 'R',
    capacite_accueil = 120,
    valeur_amortissement = 850000,
    annee_construction = 1998,
    surface_m2 = 850
WHERE id = 'a0000030-0000-0000-0000-000000000001';

-- Add surface_m2 to logements (classrooms) of Bâtiment A — Maternelle
UPDATE logements SET surface_m2 = 55 WHERE id = 'a2000030-0000-0000-0000-000000000001'; -- Classe PS
UPDATE logements SET surface_m2 = 55 WHERE id = 'a2000030-0000-0000-0000-000000000002'; -- Classe MS
UPDATE logements SET surface_m2 = 60 WHERE id = 'a2000030-0000-0000-0000-000000000003'; -- Classe GS
UPDATE logements SET surface_m2 = 40 WHERE id = 'a2000030-0000-0000-0000-000000000004'; -- Hall d'accueil
UPDATE logements SET surface_m2 = 80 WHERE id = 'a2000030-0000-0000-0000-000000000005'; -- Salle de motricité
UPDATE logements SET surface_m2 = 25 WHERE id = 'a2000030-0000-0000-0000-000000000006'; -- Salle des maîtres
UPDATE logements SET surface_m2 = 35 WHERE id = 'a2000030-0000-0000-0000-000000000007'; -- Bibliothèque maternelle
UPDATE logements SET surface_m2 = 30 WHERE id = 'a2000030-0000-0000-0000-000000000008'; -- Couloir 1er étage

-- Add a few more interventions with costs over the last 3 years for maintenance cost calculation
INSERT INTO interventions (id, titre, type_intervention, priorite, statut, batiment_id, residence_id, site_id, cout, date_planifiee, date_realisation, categorie, canal_source, demandeur_nom)
SELECT
  gen_random_uuid(),
  'Remplacement tableau électrique Bâtiment A',
  'curative', 'haute', 'terminee',
  'a0000030-0000-0000-0000-000000000001',
  (SELECT id FROM residences WHERE nom = 'École Angèle Vannier'),
  (SELECT site_id FROM residences WHERE nom = 'École Angèle Vannier'),
  2800,
  '2024-06-12', '2024-06-15',
  'electricite', 'telephone', 'Agent technique'
WHERE NOT EXISTS (
  SELECT 1 FROM interventions WHERE titre = 'Remplacement tableau électrique Bâtiment A' AND batiment_id = 'a0000030-0000-0000-0000-000000000001'
);

INSERT INTO interventions (id, titre, type_intervention, priorite, statut, batiment_id, residence_id, site_id, cout, date_planifiee, date_realisation, categorie, canal_source, demandeur_nom)
SELECT
  gen_random_uuid(),
  'Réparation fuite toiture Bâtiment A',
  'curative', 'urgente', 'terminee',
  'a0000030-0000-0000-0000-000000000001',
  (SELECT id FROM residences WHERE nom = 'École Angèle Vannier'),
  (SELECT site_id FROM residences WHERE nom = 'École Angèle Vannier'),
  1500,
  '2025-01-20', '2025-01-25',
  'etancheite', 'email', 'Directeur école'
WHERE NOT EXISTS (
  SELECT 1 FROM interventions WHERE titre = 'Réparation fuite toiture Bâtiment A' AND batiment_id = 'a0000030-0000-0000-0000-000000000001'
);
