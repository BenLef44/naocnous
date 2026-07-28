/*
# École élémentaire publique Angèle Vannier — Saint-Malo

## Summary
Adds a new school site ("École élémentaire publique Angèle Vannier") to the
patrimonial referential under the "Enseignement" domain, located at
2 Rue du Bosquet aux Pommes, 35400 Saint-Malo.

## Hierarchy created
- 1 Site  (SITE-AV-SM)
- 1 Residence (RES-AV-SM) — "École Angèle Vannier"
- 3 Bâtiments:
    • Bâtiment A — Maternelle  (BAT-AV-A)
    • Bâtiment B — Élémentaire (BAT-AV-B)
    • Bâtiment C — Restauration / Activités (BAT-AV-C)
- 6 Étages (RDC + 1er étage per bâtiment)
- 22 Logements (classrooms / functional rooms) covering Maternelle (PS, MS, GS)
  and Primaire (CP, CE1, CE2, CM1, CM2) plus common areas.

## Equipment
12 equipements across the 3 bâtiments (chaudière, tableau électrique, VMC,
alarme incendie, ascenseur, ECS, etc.).

## Interventions (historique de maintenance)
6 interventions (mix of curative, preventive, and contrôle réglementaire).

## Contrôles réglementaires (historique de contrôle)
4 types_controle seeded + 4 controles_reglementaires referencing them
(Électricité, Sécurité incendie, Gaz, Ascenseur).

## Security
- Uses existing tables with RLS already enabled.
- No new tables created; no policy changes needed.
- All inserts are ON CONFLICT DO NOTHING / DO UPDATE for idempotency.
*/

-- ════════════════════════════════════════════════════════════════════════════
-- 0. TYPES DE CONTRÔLE (seed if missing)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO types_controle (id, code, nom, categorie, description, icone, couleur, periodicite_mois, periodicite_label, reference_reglementaire)
VALUES
  ('a4000030-0000-0000-0000-000000000001', 'ELEC', 'Vérification électrique', 'Électricité', 'Contrôle périodique des installations électriques', 'Zap', '#3b82f6', 12, 'Annuelle', 'Arrêté du 10/10/1985'),
  ('a4000030-0000-0000-0000-000000000002', 'INC',  'Sécurité incendie', 'Sécurité', 'Vérification du SSI et des moyens d''extinction', 'Flame', '#ef4444', 12, 'Annuelle', 'Code de la construction et de l''habitation'),
  ('a4000030-0000-0000-0000-000000000003', 'GAZ',  'Contrôle gaz', 'Gaz', 'Vérification des installations gaz', 'Flame', '#f59e0b', 12, 'Annuelle', 'Arrêté du 08/07/2013'),
  ('a4000030-0000-0000-0000-000000000004', 'ASC',  'Vérification ascenseur', 'Ascenseurs', 'Contrôle périodique des ascenseurs', 'ArrowUpDown', '#8b5cf6', 6, 'Semestrielle', 'Arrêté du 01/08/2013')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 1. SITE
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sites (id, nom, code, statut, adresse, ville, code_postal)
VALUES (
  'a0000010-0000-0000-0000-000000000001',
  'École élémentaire publique Angèle Vannier',
  'SITE-AV-SM',
  'en_service',
  '2 Rue du Bosquet aux Pommes',
  'Saint-Malo',
  '35400'
)
ON CONFLICT (id) DO UPDATE SET
  nom         = EXCLUDED.nom,
  code        = EXCLUDED.code,
  statut      = EXCLUDED.statut,
  adresse     = EXCLUDED.adresse,
  ville       = EXCLUDED.ville,
  code_postal = EXCLUDED.code_postal;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. RÉSIDENCE
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO residences (id, site_id, code, nom, adresse, statut)
VALUES (
  'a0000020-0000-0000-0000-000000000001',
  'a0000010-0000-0000-0000-000000000001',
  'RES-AV-SM',
  'École Angèle Vannier',
  '2 Rue du Bosquet aux Pommes, 35400 Saint-Malo',
  'en_service'
)
ON CONFLICT (id) DO UPDATE SET
  nom      = EXCLUDED.nom,
  site_id  = EXCLUDED.site_id,
  adresse  = EXCLUDED.adresse;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. BÂTIMENTS (3)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO batiments (id, residence_id, nom, code, statut, annee_construction, surface_m2, nb_logements)
VALUES
  (
    'a0000030-0000-0000-0000-000000000001',
    'a0000020-0000-0000-0000-000000000001',
    'Bâtiment A — Maternelle',
    'BAT-AV-A',
    'en_service',
    1998,
    850,
    8
  ),
  (
    'a0000030-0000-0000-0000-000000000002',
    'a0000020-0000-0000-0000-000000000001',
    'Bâtiment B — Élémentaire',
    'BAT-AV-B',
    'en_service',
    1998,
    1100,
    10
  ),
  (
    'a0000030-0000-0000-0000-000000000003',
    'a0000020-0000-0000-0000-000000000001',
    'Bâtiment C — Restauration / Activités',
    'BAT-AV-C',
    'en_service',
    2005,
    600,
    6
  )
ON CONFLICT (id) DO UPDATE SET
  nom          = EXCLUDED.nom,
  residence_id = EXCLUDED.residence_id,
  statut       = EXCLUDED.statut;

-- ════════════════════════════════════════════════════════════════════════════
-- 4. ÉTAGES (RDC + 1er étage per bâtiment = 6 étages)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO etages (id, batiment_id, numero, nom) VALUES
  -- Bâtiment A — Maternelle
  ('a1000030-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001', 0, 'Rez-de-chaussée'),
  ('a1000030-0000-0000-0000-000000000002', 'a0000030-0000-0000-0000-000000000001', 1, '1er étage'),
  -- Bâtiment B — Élémentaire
  ('a1000030-0000-0000-0000-000000000003', 'a0000030-0000-0000-0000-000000000002', 0, 'Rez-de-chaussée'),
  ('a1000030-0000-0000-0000-000000000004', 'a0000030-0000-0000-0000-000000000002', 1, '1er étage'),
  -- Bâtiment C — Restauration / Activités
  ('a1000030-0000-0000-0000-000000000005', 'a0000030-0000-0000-0000-000000000003', 0, 'Rez-de-chaussée'),
  ('a1000030-0000-0000-0000-000000000006', 'a0000030-0000-0000-0000-000000000003', 1, '1er étage')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 5. LOGEMENTS (salles / locaux)
--    Bâtiment A — Maternelle : PS, MS, GS + communs
--    Bâtiment B — Élémentaire : CP, CE1, CE2, CM1, CM2 + communs
--    Bâtiment C — Restauration / Activités
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO logements (id, etage_id, numero, type_logement, statut) VALUES
  -- ── Bâtiment A RDC (Maternelle) ──
  ('a2000030-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Classe PS',         'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000002', 'a1000030-0000-0000-0000-000000000001', 'Classe MS',         'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000003', 'a1000030-0000-0000-0000-000000000001', 'Classe GS',         'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000004', 'a1000030-0000-0000-0000-000000000001', 'Hall d''accueil',   'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000005', 'a1000030-0000-0000-0000-000000000001', 'Salle de motricité','local', 'disponible'),

  -- ── Bâtiment A 1er étage ──
  ('a2000030-0000-0000-0000-000000000006', 'a1000030-0000-0000-0000-000000000002', 'Salle des maîtres', 'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000007', 'a1000030-0000-0000-0000-000000000002', 'Bibliothèque maternelle', 'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000008', 'a1000030-0000-0000-0000-000000000002', 'Couloir 1er étage', 'local', 'disponible'),

  -- ── Bâtiment B RDC (Élémentaire) ──
  ('a2000030-0000-0000-0000-000000000009', 'a1000030-0000-0000-0000-000000000003', 'Classe CP',         'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000010', 'a1000030-0000-0000-0000-000000000003', 'Classe CE1',        'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000011', 'a1000030-0000-0000-0000-000000000003', 'Classe CE2',        'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000012', 'a1000030-0000-0000-0000-000000000003', 'Hall d''entrée',    'local', 'disponible'),

  -- ── Bâtiment B 1er étage ──
  ('a2000030-0000-0000-0000-000000000013', 'a1000030-0000-0000-0000-000000000004', 'Classe CM1',        'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000014', 'a1000030-0000-0000-0000-000000000004', 'Classe CM2',        'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000015', 'a1000030-0000-0000-0000-000000000004', 'Bibliothèque',      'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000016', 'a1000030-0000-0000-0000-000000000004', 'Salle informatique', 'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000017', 'a1000030-0000-0000-0000-000000000004', 'Couloir 1er étage', 'local', 'disponible'),

  -- ── Bâtiment C RDC (Restauration / Activités) ──
  ('a2000030-0000-0000-0000-000000000018', 'a1000030-0000-0000-0000-000000000005', 'Salle de restauration', 'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000019', 'a1000030-0000-0000-0000-000000000005', 'Office / Cuisine',      'local', 'disponible'),

  -- ── Bâtiment C 1er étage ──
  ('a2000030-0000-0000-0000-000000000020', 'a1000030-0000-0000-0000-000000000006', 'Salle polyvalente',     'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000021', 'a1000030-0000-0000-0000-000000000006', 'Salle de musique',      'local', 'disponible'),
  ('a2000030-0000-0000-0000-000000000022', 'a1000030-0000-0000-0000-000000000006', 'Local associations',   'local', 'disponible')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 6. ÉQUIPEMENTS (12)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO equipements (id, identifiant, designation, categorie, sous_categorie, site_id, batiment_id, etage_id, logement_id, etat, marque, modele, date_mise_en_service, cout_acquisition, frequence_controle, prochaine_echeance, caracteristiques)
VALUES
  -- Bâtiment A — Maternelle
  (
    'a3000030-0000-0000-0000-000000000001',
    'EQ-AV-CHA-001', 'Chaudière gaz Bâtiment A', 'Chauffage', 'Chaudière gaz',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001', NULL, NULL,
    'fonctionnel', 'Viessmann', 'Vitodens 200', '2015-09-01', 18000,
    'annuelle', '2026-10-15',
    '{"puissance_kw": 35}'
  ),
  (
    'a3000030-0000-0000-0000-000000000002',
    'EQ-AV-ELC-001', 'Tableau électrique principal A', 'Électricité', 'Tableau TGBT',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001', NULL, NULL,
    'fonctionnel', 'Schneider', 'Acti9', '2015-09-01', 8500,
    'annuelle', '2026-10-15',
    '{"nb_departs": 24}'
  ),
  (
    'a3000030-0000-0000-0000-000000000003',
    'EQ-AV-VMC-001', 'VMC simple flux Bâtiment A', 'Ventilation', 'VMC simple flux',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001', NULL, NULL,
    'fonctionnel', 'Aldes', 'VME Ventilations', '2016-01-15', 4200,
    'semestrielle', '2026-09-01',
    '{"nb_extracteurs": 6}'
  ),
  (
    'a3000030-0000-0000-0000-000000000004',
    'EQ-AV-SEC-001', 'Système alarme incendie A', 'Sécurité', 'SSI Catégorie A',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001', NULL, NULL,
    'fonctionnel', 'Siemens', 'Cerberus PRO', '2017-09-01', 12000,
    'annuelle', '2026-09-15',
    '{"nb_detecteurs": 18}'
  ),

  -- Bâtiment B — Élémentaire
  (
    'a3000030-0000-0000-0000-000000000005',
    'EQ-AV-CHA-002', 'Chaudière gaz Bâtiment B', 'Chauffage', 'Chaudière gaz',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002', NULL, NULL,
    'fonctionnel', 'Viessmann', 'Vitodens 222', '2015-09-01', 22000,
    'annuelle', '2026-11-01',
    '{"puissance_kw": 45}'
  ),
  (
    'a3000030-0000-0000-0000-000000000006',
    'EQ-AV-ELC-002', 'Tableau électrique principal B', 'Électricité', 'Tableau TGBT',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002', NULL, NULL,
    'fonctionnel', 'Schneider', 'Acti9', '2015-09-01', 9500,
    'annuelle', '2026-11-01',
    '{"nb_departs": 32}'
  ),
  (
    'a3000030-0000-0000-0000-000000000007',
    'EQ-AV-ASC-001', 'Ascenseur Bâtiment B', 'Ascenseur', 'Ascenseur électrique',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002', NULL, NULL,
    'fonctionnel', 'Otis', 'GeN2', '2015-09-01', 35000,
    'semestrielle', '2026-08-01',
    '{"nb_etages": 2, "capacite_personnes": 6}'
  ),
  (
    'a3000030-0000-0000-0000-000000000008',
    'EQ-AV-SEC-002', 'Système alarme incendie B', 'Sécurité', 'SSI Catégorie A',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002', NULL, NULL,
    'fonctionnel', 'Siemens', 'Cerberus PRO', '2017-09-01', 14000,
    'annuelle', '2026-10-01',
    '{"nb_detecteurs": 24}'
  ),

  -- Bâtiment C — Restauration / Activités
  (
    'a3000030-0000-0000-0000-000000000009',
    'EQ-AV-CHA-003', 'Chaudière gaz Bâtiment C', 'Chauffage', 'Chaudière gaz',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000003', NULL, NULL,
    'fonctionnel', 'Viessmann', 'Vitodens 100', '2005-09-01', 15000,
    'annuelle', '2026-12-01',
    '{"puissance_kw": 28}'
  ),
  (
    'a3000030-0000-0000-0000-000000000010',
    'EQ-AV-ELC-003', 'Tableau électrique principal C', 'Électricité', 'Tableau TGBT',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000003', NULL, NULL,
    'a_remplacer', 'Schneider', 'Modicon', '2005-09-01', 6500,
    'annuelle', '2026-07-01',
    '{"nb_departs": 18}'
  ),
  (
    'a3000030-0000-0000-0000-000000000011',
    'EQ-AV-PLB-001', 'Production ECS Bâtiment C', 'Plomberie', 'ECS',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000003', NULL, NULL,
    'fonctionnel', 'Atlantic', 'Coralis S', '2018-01-15', 5500,
    'annuelle', '2027-01-15',
    '{"capacite_l": 300}'
  ),
  (
    'a3000030-0000-0000-0000-000000000012',
    'EQ-AV-SEC-003', 'Système alarme incendie C', 'Sécurité', 'SSI Catégorie A',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000003', NULL, NULL,
    'fonctionnel', 'Siemens', 'Cerberus PRO', '2018-09-01', 8000,
    'annuelle', '2026-09-01',
    '{"nb_detecteurs": 12}'
  )
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 7. INTERVENTIONS (historique de maintenance — 6)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO interventions (titre, description, type_intervention, priorite, statut, site_id, batiment_id, equipement_id, agent_nom, prestataire, date_planifiee, date_realisation, cout, compte_rendu)
VALUES
  (
    'Révision annuelle chaudière Bâtiment A',
    'Entretien préventif annuel de la chaudière gaz — nettoyage du brûleur, contrôle des émissions.',
    'maintenance_preventive', 'normale', 'terminee',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001', 'a3000030-0000-0000-0000-000000000001',
    'Jean Dupont', 'Thermo Services',
    '2025-10-15', '2025-10-15', 450,
    'Chaudière conforme, émissions dans les normes. Remplacement du joint d''étanchéité.'
  ),
  (
    'Remplacement tableau électrique Bâtiment C',
    'Le tableau TGBT du Bâtiment C date de 2005 et présente des signes de vétusté. Remplacement programmé.',
    'curative', 'haute', 'planifiee',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000003', 'a3000030-0000-0000-0000-000000000010',
    'Sophie Chen', 'Electro Pro',
    '2026-07-01', NULL, 8500,
    'Devis accepté, intervention programmée pendant les vacances d''été.'
  ),
  (
    'Réparation fuite ECS Bâtiment C',
    'Fuite détectée sur le ballon d''eau chaude sanitaire du Bâtiment C, intervention en urgence.',
    'curative', 'urgente', 'terminee',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000003', 'a3000030-0000-0000-0000-000000000011',
    'Paul Martin', 'Plomberie Express',
    '2026-03-08', '2026-03-08', 320,
    'Remplacement du joint du ballon ECS. Pas de dégât des eaux constaté.'
  ),
  (
    'Contrôle périodique ascenseur Bâtiment B',
    'Vérification semestrielle obligatoire de l''ascenseur — contrôle des freins, câbles et sécurité.',
    'controle_reglementaire', 'normale', 'planifiee',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002', 'a3000030-0000-0000-0000-000000000007',
    NULL, 'Otis Maintenance',
    '2026-08-01', NULL, NULL,
    'Contrôle semestriel obligatoire à planifier.'
  ),
  (
    'Remplacement moteurs VMC Bâtiment A',
    'La VMC simple flux du Bâtiment A présente une baisse d''efficacité. Nettoyage et remplacement des moteurs.',
    'maintenance_preventive', 'moyenne', 'en_cours',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001', 'a3000030-0000-0000-0000-000000000003',
    'Marie Leblanc', 'Aldes Ventilation',
    '2026-06-20', NULL, 1200,
    'Intervention en cours — remplacement des moteurs des extracteurs.'
  ),
  (
    'Test périodique SSI Bâtiment B',
    'Test semestriel du Système de Sécurité Incendie — déclencheurs, détecteurs, désenfumage.',
    'controle_reglementaire', 'normale', 'terminee',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002', 'a3000030-0000-0000-0000-000000000008',
    'Jean Dupont', 'Siemens Fire Safety',
    '2026-02-15', '2026-02-15', 600,
    'SSI conforme, tous les détecteurs testés et validés. Compte-rendu archivé.'
  )
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 8. CONTRÔLES RÉGLEMENTAIRES (historique de contrôle — 4)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO controles_reglementaires (type_controle_id, site_id, batiment_id, statut, organisme, technicien, date_dernier_controle, date_prochain_controle, nb_conformes, nb_non_conformes, observations, localisation_detail)
VALUES
  -- Électricité (Bâtiment B)
  (
    'a4000030-0000-0000-0000-000000000001',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002',
    'realise', 'Bureau Veritas', 'Marc Leroy',
    '2025-11-20', '2026-11-20',
    32, 0,
    'Installation électrique conforme. Aucune non-conformité. Rapport archivé.',
    'Électricité — Bâtiment B'
  ),
  -- Sécurité incendie (Bâtiment A)
  (
    'a4000030-0000-0000-0000-000000000002',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001',
    'realise', 'SOCOTEC', 'Julie Fournier',
    '2025-12-05', '2026-12-05',
    18, 1,
    '1 non-conformité mineure : extincteur à recharger dans le Hall d''accueil. Action corrective planifiée.',
    'Sécurité incendie — Bâtiment A'
  ),
  -- Gaz (Bâtiment C)
  (
    'a4000030-0000-0000-0000-000000000003',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000003',
    'a_venir', 'DEKRA Industrial', NULL,
    NULL, '2026-07-10',
    0, 0,
    'Contrôle gaz annuel à planifier pour la cuisine du Bâtiment C.',
    'Gaz — Bâtiment C (Cuisine)'
  ),
  -- Ascenseur (Bâtiment B)
  (
    'a4000030-0000-0000-0000-000000000004',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002',
    'realise', 'APAVE', 'Thomas Petit',
    '2026-01-15', '2026-07-15',
    12, 0,
    'Ascenseur conforme. Vérification des freins, câbles et système de secours. Rapport archivé.',
    'Ascenseur — Bâtiment B'
  )
ON CONFLICT DO NOTHING;
