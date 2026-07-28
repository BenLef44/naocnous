/*
# École Angèle Vannier — ERP + Contrats de maintenance

## Summary
Extends the "École élémentaire publique Angèle Vannier" (Saint-Malo) site with:
1. ERP / Registre de sécurité entries (2 ERP: école type J + restauration type R)
2. Contrats de maintenance (6 contracts covering chauffage, ascenseur, SSI, VMC,
   nettoyage, espaces verts)

## ERP entries
- "École Angèle Vannier" — type J (Enseignement), 5ème catégorie, capacité 280
- "Restauration Angèle Vannier" — type R (Restauration), 5ème catégorie, capacité 150

## Contrats
- Maintenance chauffage (3 bâtiments) — Thermo Services
- Entretien ascenseur Bâtiment B — Otis Maintenance
- Maintenance SSI (3 bâtiments) — Siemens Fire Safety
- Entretien VMC Bâtiment A — Aldes Ventilation
- Nettoyage parties communes — ProNett Services
- Entretien espaces verts — Jardin Plus

## Security
- Uses existing tables with RLS already enabled.
- No new tables, no policy changes.
- Inserts are ON CONFLICT DO NOTHING for idempotency.
*/

-- ════════════════════════════════════════════════════════════════════════════
-- 1. ERP / REGISTRE DE SÉCURITÉ (2 entries)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO erp (
  id, nom, categorie_erp, type_erp, capacite, adresse,
  responsable_securite, email_responsable, coordonnees_secours,
  date_mise_en_service, organisme_controle, contrat_controle_ref,
  site_id, residence_id
) VALUES
  (
    'a5000030-0000-0000-0000-000000000001',
    'École Angèle Vannier',
    '5eme', 'J', 280,
    '2 Rue du Bosquet aux Pommes, 35400 Saint-Malo',
    'Catherine Morel', 'catherine.morel@ecole-vannier.fr',
    'Pompiers : 18 | SAMU : 15 | Police : 17 | Directrice : 02 99 40 00 00',
    '1998-09-01', 'SOCOTEC', 'SOCOTEC-2026-0145',
    'a0000010-0000-0000-0000-000000000001',
    'a0000020-0000-0000-0000-000000000001'
  ),
  (
    'a5000030-0000-0000-0000-000000000002',
    'Restauration Angèle Vannier',
    '5eme', 'R', 150,
    '2 Rue du Bosquet aux Pommes, 35400 Saint-Malo',
    'Catherine Morel', 'catherine.morel@ecole-vannier.fr',
    'Pompiers : 18 | SAMU : 15 | Police : 17 | Directrice : 02 99 40 00 00',
    '2005-09-01', 'DEKRA Industrial', 'DEKRA-2026-0210',
    'a0000010-0000-0000-0000-000000000001',
    'a0000020-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO UPDATE SET
  nom                  = EXCLUDED.nom,
  categorie_erp        = EXCLUDED.categorie_erp,
  type_erp             = EXCLUDED.type_erp,
  capacite             = EXCLUDED.capacite,
  adresse              = EXCLUDED.adresse,
  responsable_securite = EXCLUDED.responsable_securite,
  email_responsable    = EXCLUDED.email_responsable,
  coordonnees_secours  = EXCLUDED.coordonnees_secours,
  site_id              = EXCLUDED.site_id,
  residence_id         = EXCLUDED.residence_id;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. CONTRATS DE MAINTENANCE (6)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO contrats (
  id, nom, description, prestataire, type_contrat, statut,
  date_debut, date_fin, cout_annuel, type_reconduction,
  marche_associe, site_id, batiment_id
) VALUES
  -- 1. Maintenance chauffage (3 bâtiments)
  (
    'a6000030-0000-0000-0000-000000000001',
    'Maintenance chauffage tri-bâtiments 2026',
    'Contrat de maintenance préventive annuel couvrant les chaudières gaz des Bâtiments A, B et C. Inclut le contrôle annuel des émissions, le nettoyage des brûleurs et l''intervention en cas de panne.',
    'Thermo Services SARL', 'maintenance_preventive', 'actif',
    '2026-01-01', '2026-12-31', 4800, 'annuelle',
    'MRC-2026-AV-001',
    'a0000010-0000-0000-0000-000000000001', NULL
  ),
  -- 2. Entretien ascenseur Bâtiment B
  (
    'a6000030-0000-0000-0000-000000000002',
    'Entretien ascenseur Bâtiment B',
    'Contrat d''entretien semestriel obligatoire de l''ascenseur du Bâtiment B (Otis GeN2). Inclut les visites périodiques, interventions sous 24h et pièces de remplacement standard.',
    'Otis Maintenance', 'maintenance_preventive', 'actif',
    '2026-01-01', '2026-12-31', 3200, 'annuelle',
    'MRC-2026-AV-002',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000002'
  ),
  -- 3. Maintenance SSI (3 bâtiments)
  (
    'a6000030-0000-0000-0000-000000000003',
    'Maintenance SSI tri-bâtiments 2026',
    'Contrat de maintenance du Système de Sécurité Incendie pour les 3 bâtiments. Tests semestriels des détecteurs, déclencheurs et désenfumage. Interventions sous 4h en cas de défaut.',
    'Siemens Fire Safety', 'maintenance_preventive', 'actif',
    '2026-01-01', '2026-12-31', 3600, 'annuelle',
    'MRC-2026-AV-003',
    'a0000010-0000-0000-0000-000000000001', NULL
  ),
  -- 4. Entretien VMC Bâtiment A
  (
    'a6000030-0000-0000-0000-000000000004',
    'Entretien VMC Bâtiment A',
    'Contrat d''entretien semestriel de la VMC simple flux du Bâtiment A (maternelle). Nettoyage des extracteurs, remplacement des filtres et contrôle des débits.',
    'Aldes Ventilation', 'maintenance_preventive', 'actif',
    '2026-01-01', '2026-12-31', 1200, 'annuelle',
    'MRC-2026-AV-004',
    'a0000010-0000-0000-0000-000000000001', 'a0000030-0000-0000-0000-000000000001'
  ),
  -- 5. Nettoyage parties communes
  (
    'a6000030-0000-0000-0000-000000000005',
    'Nettoyage parties communes 2026',
    'Contrat de nettoyage des parties communes (halls, couloirs, sanitaires) pour les 3 bâtiments. Interventions quotidiennes pendant la période scolaire.',
    'ProNett Services', 'nettoyage', 'actif',
    '2026-01-01', '2026-12-31', 9600, 'annuelle',
    'MRC-2026-AV-005',
    'a0000010-0000-0000-0000-000000000001', NULL
  ),
  -- 6. Entretien espaces verts
  (
    'a6000030-0000-0000-0000-000000000006',
    'Entretien espaces verts 2026',
    'Contrat d''entretien des espaces verts de l''école (cour de récréation, pelouses, haies). Tonte, taille et nettoyage saisonniers.',
    'Jardin Plus', 'espaces_verts', 'actif',
    '2026-01-01', '2026-12-31', 2400, 'annuelle',
    'MRC-2026-AV-006',
    'a0000010-0000-0000-0000-000000000001', NULL
  )
ON CONFLICT (id) DO NOTHING;
