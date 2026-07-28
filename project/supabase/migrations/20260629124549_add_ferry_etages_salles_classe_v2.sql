
-- ─── Étages du Bâtiment Principal (Jules Ferry) ────────────────────────────
INSERT INTO etages (id, batiment_id, numero, nom) VALUES
  ('f1000001-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000001', 0, 'Rez-de-chaussée'),
  ('f1000001-0000-0000-0000-000000000002', 'f0000003-0000-0000-0000-000000000001', 1, '1er étage'),
  ('f1000001-0000-0000-0000-000000000003', 'f0000003-0000-0000-0000-000000000001', 2, '2ème étage')
ON CONFLICT (id) DO NOTHING;

-- ─── Étage du Restaurant Scolaire ──────────────────────────────────────────
INSERT INTO etages (id, batiment_id, numero, nom) VALUES
  ('f1000002-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000002', 0, 'Rez-de-chaussée')
ON CONFLICT (id) DO NOTHING;

-- ─── Salles — Bâtiment Principal, RDC ──────────────────────────────────────
INSERT INTO logements (id, etage_id, numero, type_logement, statut) VALUES
  ('f2000001-0000-0000-0000-000000000001', 'f1000001-0000-0000-0000-000000000001', 'Classe PS',        'local', 'disponible'),
  ('f2000001-0000-0000-0000-000000000002', 'f1000001-0000-0000-0000-000000000001', 'Classe MS',        'local', 'disponible'),
  ('f2000001-0000-0000-0000-000000000003', 'f1000001-0000-0000-0000-000000000001', 'Classe GS',        'local', 'disponible'),
  ('f2000001-0000-0000-0000-000000000004', 'f1000001-0000-0000-0000-000000000001', 'Hall d''entrée',   'local', 'disponible'),
  ('f2000001-0000-0000-0000-000000000005', 'f1000001-0000-0000-0000-000000000001', 'Salle des maîtres','local', 'disponible')
ON CONFLICT (id) DO NOTHING;

-- ─── Salles — Bâtiment Principal, 1er étage ────────────────────────────────
INSERT INTO logements (id, etage_id, numero, type_logement, statut) VALUES
  ('f2000002-0000-0000-0000-000000000001', 'f1000001-0000-0000-0000-000000000002', 'Classe CP',        'local', 'disponible'),
  ('f2000002-0000-0000-0000-000000000002', 'f1000001-0000-0000-0000-000000000002', 'Classe CE1',       'local', 'disponible'),
  ('f2000002-0000-0000-0000-000000000003', 'f1000001-0000-0000-0000-000000000002', 'Classe CE2',       'local', 'disponible'),
  ('f2000002-0000-0000-0000-000000000004', 'f1000001-0000-0000-0000-000000000002', 'Couloir 1er étage','local', 'disponible')
ON CONFLICT (id) DO NOTHING;

-- ─── Salles — Bâtiment Principal, 2ème étage (CM1, CM2, Bibliothèque) ──────
INSERT INTO logements (id, etage_id, numero, type_logement, statut) VALUES
  ('f2000003-0000-0000-0000-000000000001', 'f1000001-0000-0000-0000-000000000003', 'Classe CM1',         'local', 'disponible'),
  ('f2000003-0000-0000-0000-000000000002', 'f1000001-0000-0000-0000-000000000003', 'Classe CM2',         'local', 'disponible'),
  ('f2000003-0000-0000-0000-000000000003', 'f1000001-0000-0000-0000-000000000003', 'Bibliothèque',       'local', 'disponible'),
  ('f2000003-0000-0000-0000-000000000004', 'f1000001-0000-0000-0000-000000000003', 'Couloir 2ème étage', 'local', 'disponible')
ON CONFLICT (id) DO NOTHING;

-- ─── Salles — Restaurant Scolaire, RDC ─────────────────────────────────────
INSERT INTO logements (id, etage_id, numero, type_logement, statut) VALUES
  ('f2000004-0000-0000-0000-000000000001', 'f1000002-0000-0000-0000-000000000001', 'Salle de restauration','local', 'disponible'),
  ('f2000004-0000-0000-0000-000000000002', 'f1000002-0000-0000-0000-000000000001', 'Office / Cuisine',     'local', 'disponible')
ON CONFLICT (id) DO NOTHING;
