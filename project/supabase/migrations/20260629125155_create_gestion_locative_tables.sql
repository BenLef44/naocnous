
-- ─── Table locataires ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locataires (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         TEXT NOT NULL,
  prenom      TEXT NOT NULL,
  email       TEXT,
  telephone   TEXT,
  date_naissance DATE,
  adresse_actuelle TEXT,
  situation   TEXT DEFAULT 'etudiant',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE locataires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_locataires" ON locataires FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_locataires" ON locataires FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_locataires" ON locataires FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_locataires" ON locataires FOR DELETE TO anon, authenticated USING (true);

-- ─── Table baux ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS baux (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference            TEXT NOT NULL UNIQUE,
  type_bail            TEXT NOT NULL DEFAULT 'location',
  statut               TEXT NOT NULL DEFAULT 'en_preparation',
  logement_id          UUID REFERENCES logements(id) ON DELETE SET NULL,
  residence_id         UUID REFERENCES residences(id) ON DELETE SET NULL,
  locataire_id         UUID REFERENCES locataires(id) ON DELETE SET NULL,
  locataire_nom        TEXT,
  loyer_mensuel        NUMERIC(10,2) DEFAULT 0,
  charges              NUMERIC(10,2) DEFAULT 0,
  depot_garantie       NUMERIC(10,2) DEFAULT 0,
  apl                  NUMERIC(10,2) DEFAULT 0,
  date_debut           DATE,
  date_fin             DATE,
  tacite_reconduction  BOOLEAN DEFAULT true,
  preavis_mois         INT DEFAULT 1,
  periodicite          TEXT DEFAULT 'mensuel',
  indexation           TEXT DEFAULT 'irl',
  gestionnaire         TEXT,
  commentaires         TEXT,
  conditions_particulieres TEXT,
  notes_internes       TEXT,
  tags                 TEXT[],
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE baux ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_baux" ON baux FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_baux" ON baux FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_baux" ON baux FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_baux" ON baux FOR DELETE TO anon, authenticated USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_baux_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_baux_updated_at BEFORE UPDATE ON baux
FOR EACH ROW EXECUTE FUNCTION update_baux_updated_at();

-- ─── Seed locataires ──────────────────────────────────────────────────────────
INSERT INTO locataires (id, nom, prenom, email, telephone, date_naissance, situation) VALUES
  ('ba000001-0000-0000-0000-000000000001', 'Dupont',    'Marie',      'marie.dupont@univ-lyon1.fr',     '06 12 34 56 78', '2001-03-15', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000002', 'Martin',    'Thomas',     'thomas.martin@etu.lyon2.fr',     '06 23 45 67 89', '2000-07-22', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000003', 'Bernard',   'Sophie',     'sophie.bernard@gmail.com',       '07 34 56 78 90', '1998-11-08', 'stagiaire'),
  ('ba000001-0000-0000-0000-000000000004', 'Leroy',     'Antoine',    'antoine.leroy@univ-lyon1.fr',    '06 45 67 89 01', '2002-01-30', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000005', 'Moreau',    'Camille',    'camille.moreau@etu.lyon3.fr',    '07 56 78 90 12', '2001-09-14', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000006', 'Simon',     'Lucas',      'lucas.simon@gmail.com',          '06 67 89 01 23', '1999-04-25', 'stagiaire'),
  ('ba000001-0000-0000-0000-000000000007', 'Laurent',   'Emma',       'emma.laurent@univ-lyon2.fr',     '07 78 90 12 34', '2003-06-18', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000008', 'Michel',    'Paul',       'paul.michel@etu.ec-lyon.fr',     '06 89 01 23 45', '2000-12-03', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000009', 'Petit',     'Clara',      'clara.petit@gmail.com',          '07 90 12 34 56', '2002-08-27', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000010', 'Robert',    'Maxime',     'maxime.robert@univ-lyon1.fr',    '06 01 23 45 67', '2001-02-14', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000011', 'Richard',   'Julie',      'julie.richard@etu.lyon2.fr',     '07 12 34 56 78', '2003-10-05', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000012', 'Durand',    'Nicolas',    'nicolas.durand@gmail.com',       '06 23 45 67 89', '1997-05-20', 'salarie'),
  ('ba000001-0000-0000-0000-000000000013', 'Girard',    'Alice',      'alice.girard@univ-lyon3.fr',     '07 34 56 78 90', '2002-03-11', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000014', 'Bonnet',    'Hugo',       'hugo.bonnet@etu.ec-lyon.fr',     '06 45 67 89 01', '2001-07-29', 'etudiant'),
  ('ba000001-0000-0000-0000-000000000015', 'Lambert',   'Lea',        'lea.lambert@gmail.com',          '07 56 78 90 12', '2000-11-16', 'etudiant')
ON CONFLICT (id) DO NOTHING;

-- ─── Seed baux ────────────────────────────────────────────────────────────────
INSERT INTO baux (id, reference, type_bail, statut, locataire_id, locataire_nom, loyer_mensuel, charges, depot_garantie, apl, date_debut, date_fin, gestionnaire, residence_id) VALUES
  ('bb000001-0000-0000-0000-000000000001','BAIL-2024-0001','location','actif',       'ba000001-0000-0000-0000-000000000001','Dupont Marie',    420,55,420,195,'2024-09-01','2025-06-30','Moreau F.',  NULL),
  ('bb000001-0000-0000-0000-000000000002','BAIL-2024-0002','location','actif',       'ba000001-0000-0000-0000-000000000002','Martin Thomas',   385,55,385,195,'2024-09-15','2025-06-30','Martin D.',  NULL),
  ('bb000001-0000-0000-0000-000000000003','BAIL-2024-0003','location','actif',       'ba000001-0000-0000-0000-000000000003','Bernard Sophie',  420,55,420,195,'2024-10-01','2025-08-31','Moreau F.',  NULL),
  ('bb000001-0000-0000-0000-000000000004','BAIL-2024-0004','location','expire_bientot','ba000001-0000-0000-0000-000000000004','Leroy Antoine',  420,55,420,195,'2024-09-01','2026-07-15','Martin D.',  NULL),
  ('bb000001-0000-0000-0000-000000000005','BAIL-2024-0005','location','actif',       'ba000001-0000-0000-0000-000000000005','Moreau Camille',  385,55,385,195,'2024-09-01','2025-06-30','Leroy P.',   NULL),
  ('bb000001-0000-0000-0000-000000000006','BAIL-2024-0006','location','actif',       'ba000001-0000-0000-0000-000000000006','Simon Lucas',     420,55,420,195,'2024-09-15','2025-08-31','Leroy P.',   NULL),
  ('bb000001-0000-0000-0000-000000000007','BAIL-2024-0007','convention','actif',     'ba000001-0000-0000-0000-000000000007','Laurent Emma',    195,30,195,0,  '2025-01-15','2025-12-31','Simon B.',   NULL),
  ('bb000001-0000-0000-0000-000000000008','BAIL-2024-0008','location','actif',       'ba000001-0000-0000-0000-000000000008','Michel Paul',     420,55,420,195,'2024-10-01','2025-06-30','Moreau F.',  NULL),
  ('bb000001-0000-0000-0000-000000000009','BAIL-2024-0009','location','actif',       'ba000001-0000-0000-0000-000000000009','Petit Clara',     385,55,385,195,'2025-02-01','2026-01-31','Martin D.',  NULL),
  ('bb000001-0000-0000-0000-000000000010','BAIL-2024-0010','location','en_signature','ba000001-0000-0000-0000-000000000010','Robert Maxime',   420,55,420,195,'2026-07-01','2027-06-30','Leroy P.',   NULL),
  ('bb000001-0000-0000-0000-000000000011','BAIL-2025-0001','location','actif',       'ba000001-0000-0000-0000-000000000011','Richard Julie',   420,55,420,195,'2025-09-01','2026-06-30','Simon B.',   NULL),
  ('bb000001-0000-0000-0000-000000000012','BAIL-2025-0002','location','resilie',     'ba000001-0000-0000-0000-000000000012','Durand Nicolas',  385,55,385,0,  '2025-01-01','2025-12-31','Moreau F.',  NULL),
  ('bb000001-0000-0000-0000-000000000013','BAIL-2025-0003','location','actif',       'ba000001-0000-0000-0000-000000000013','Girard Alice',    420,55,420,195,'2025-09-01','2026-06-30','Martin D.',  NULL),
  ('bb000001-0000-0000-0000-000000000014','BAIL-2025-0004','location','expire_bientot','ba000001-0000-0000-0000-000000000014','Bonnet Hugo',   420,55,420,195,'2025-09-01','2026-07-08','Leroy P.',   NULL),
  ('bb000001-0000-0000-0000-000000000015','BAIL-2025-0005','convention','actif',     'ba000001-0000-0000-0000-000000000015','Lambert Lea',     195,30,195,0,  '2025-10-01','2026-09-30','Simon B.',   NULL),
  ('bb000001-0000-0000-0000-000000000016','BAIL-2026-0001','location','actif',       NULL,                                  'Fontaine Romain', 420,55,420,195,'2026-01-15','2027-01-14','Moreau F.',  NULL),
  ('bb000001-0000-0000-0000-000000000017','BAIL-2026-0002','location','actif',       NULL,                                  'Chevalier Ines',  385,55,385,195,'2026-02-01','2027-01-31','Martin D.',  NULL),
  ('bb000001-0000-0000-0000-000000000018','BAIL-2026-0003','location','expire',      NULL,                                  'Rousseau Baptiste',420,55,420,195,'2024-01-01','2025-12-31','Leroy P.',  NULL)
ON CONFLICT (id) DO NOTHING;
