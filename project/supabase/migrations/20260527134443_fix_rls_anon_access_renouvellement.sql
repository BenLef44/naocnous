/*
  # Fix RLS — accès anon sur tables renouvellement

  L'application utilise la clé anon (sans authentification).
  Les politiques précédentes étaient restreintes à `authenticated` ce qui
  bloquait silencieusement toutes les lectures.
  On ajoute des politiques pour le rôle `anon` en lecture.
*/

-- evenements
DROP POLICY IF EXISTS "Authenticated read evenements" ON evenements;
CREATE POLICY "Read evenements"
  ON evenements FOR SELECT
  TO authenticated, anon
  USING (true);

-- campagnes_renouvellement
DROP POLICY IF EXISTS "Authenticated read campagnes" ON campagnes_renouvellement;
CREATE POLICY "Read campagnes"
  ON campagnes_renouvellement FOR SELECT
  TO authenticated, anon
  USING (true);

-- scores_renouvellement
DROP POLICY IF EXISTS "Authenticated read scores" ON scores_renouvellement;
CREATE POLICY "Read scores"
  ON scores_renouvellement FOR SELECT
  TO authenticated, anon
  USING (true);
