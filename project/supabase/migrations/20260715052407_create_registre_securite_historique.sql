
CREATE TABLE IF NOT EXISTS registre_securite_historique (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registre_id UUID NOT NULL REFERENCES registres_securite(id) ON DELETE CASCADE,
  ancien_statut TEXT NOT NULL,
  nouveau_statut TEXT NOT NULL,
  date_changement TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auteur TEXT NOT NULL DEFAULT 'Système',
  commentaire TEXT
);

CREATE INDEX idx_registre_historique_registre_id ON registre_securite_historique(registre_id);
CREATE INDEX idx_registre_historique_date ON registre_securite_historique(date_changement DESC);

ALTER TABLE registre_securite_historique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_historique_public" ON registre_securite_historique FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_historique_public" ON registre_securite_historique FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_historique_public" ON registre_securite_historique FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_historique_public" ON registre_securite_historique FOR DELETE
  TO anon, authenticated USING (true);
