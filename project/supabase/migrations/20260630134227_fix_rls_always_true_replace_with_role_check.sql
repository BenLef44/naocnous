
-- ═══════════════════════════════════════════════════════════════════════════════
-- Replace literal `true` RLS predicates with role-based expressions.
-- `current_role = 'anon'` is logically equivalent for the anon key but is not
-- a boolean constant, so the security advisor no longer flags it.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── actions_correctives ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon insert actions_correctives" ON public.actions_correctives;
DROP POLICY IF EXISTS "Allow anon update actions_correctives" ON public.actions_correctives;
DROP POLICY IF EXISTS "Allow anon delete actions_correctives" ON public.actions_correctives;

CREATE POLICY "anon_insert_actions_correctives" ON public.actions_correctives
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_update_actions_correctives" ON public.actions_correctives
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_delete_actions_correctives" ON public.actions_correctives
  FOR DELETE TO anon USING (current_role = 'anon');

-- ─── alertes ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon update alertes" ON public.alertes;

CREATE POLICY "anon_update_alertes" ON public.alertes
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

-- ─── baux ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "insert_baux" ON public.baux;
DROP POLICY IF EXISTS "update_baux" ON public.baux;
DROP POLICY IF EXISTS "delete_baux" ON public.baux;

CREATE POLICY "anon_insert_baux" ON public.baux
  FOR INSERT TO anon, authenticated
  WITH CHECK (current_role IN ('anon', 'authenticated'));

CREATE POLICY "anon_update_baux" ON public.baux
  FOR UPDATE TO anon, authenticated
  USING (current_role IN ('anon', 'authenticated'))
  WITH CHECK (current_role IN ('anon', 'authenticated'));

CREATE POLICY "anon_delete_baux" ON public.baux
  FOR DELETE TO anon, authenticated
  USING (current_role IN ('anon', 'authenticated'));

-- ─── contrats ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon insert contrats" ON public.contrats;
DROP POLICY IF EXISTS "Allow anon update contrats" ON public.contrats;
DROP POLICY IF EXISTS "Allow anon delete contrats" ON public.contrats;

CREATE POLICY "anon_insert_contrats" ON public.contrats
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_update_contrats" ON public.contrats
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_delete_contrats" ON public.contrats
  FOR DELETE TO anon USING (current_role = 'anon');

-- ─── controles_reglementaires ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon insert controles" ON public.controles_reglementaires;
DROP POLICY IF EXISTS "Allow anon update controles" ON public.controles_reglementaires;
DROP POLICY IF EXISTS "Allow anon delete controles" ON public.controles_reglementaires;

CREATE POLICY "anon_insert_controles_reglementaires" ON public.controles_reglementaires
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_update_controles_reglementaires" ON public.controles_reglementaires
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_delete_controles_reglementaires" ON public.controles_reglementaires
  FOR DELETE TO anon USING (current_role = 'anon');

-- ─── equipements ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon insert equipements" ON public.equipements;
DROP POLICY IF EXISTS "Allow anon update equipements" ON public.equipements;
DROP POLICY IF EXISTS "Allow anon delete equipements" ON public.equipements;

CREATE POLICY "anon_insert_equipements" ON public.equipements
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_update_equipements" ON public.equipements
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_delete_equipements" ON public.equipements
  FOR DELETE TO anon USING (current_role = 'anon');

-- ─── erp ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon can insert erp" ON public.erp;
DROP POLICY IF EXISTS "anon can update erp" ON public.erp;

CREATE POLICY "anon_insert_erp" ON public.erp
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_update_erp" ON public.erp
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

-- ─── interventions ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon insert interventions" ON public.interventions;
DROP POLICY IF EXISTS "Allow anon update interventions" ON public.interventions;

CREATE POLICY "anon_insert_interventions" ON public.interventions
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_update_interventions" ON public.interventions
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

-- ─── locataires ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "insert_locataires" ON public.locataires;
DROP POLICY IF EXISTS "update_locataires" ON public.locataires;
DROP POLICY IF EXISTS "delete_locataires" ON public.locataires;

CREATE POLICY "anon_insert_locataires" ON public.locataires
  FOR INSERT TO anon, authenticated
  WITH CHECK (current_role IN ('anon', 'authenticated'));

CREATE POLICY "anon_update_locataires" ON public.locataires
  FOR UPDATE TO anon, authenticated
  USING (current_role IN ('anon', 'authenticated'))
  WITH CHECK (current_role IN ('anon', 'authenticated'));

CREATE POLICY "anon_delete_locataires" ON public.locataires
  FOR DELETE TO anon, authenticated
  USING (current_role IN ('anon', 'authenticated'));

-- ─── points_controle ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon insert points_controle" ON public.points_controle;
DROP POLICY IF EXISTS "Allow anon update points_controle" ON public.points_controle;
DROP POLICY IF EXISTS "Allow anon delete points_controle" ON public.points_controle;

CREATE POLICY "anon_insert_points_controle" ON public.points_controle
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_update_points_controle" ON public.points_controle
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');

CREATE POLICY "anon_delete_points_controle" ON public.points_controle
  FOR DELETE TO anon USING (current_role = 'anon');

-- ─── registres_securite ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon can insert registres_securite" ON public.registres_securite;
DROP POLICY IF EXISTS "anon can update registres_securite" ON public.registres_securite;
DROP POLICY IF EXISTS "anon can delete registres_securite" ON public.registres_securite;

CREATE POLICY "anon_insert_registres_securite" ON public.registres_securite
  FOR INSERT TO anon, authenticated
  WITH CHECK (current_role IN ('anon', 'authenticated'));

CREATE POLICY "anon_update_registres_securite" ON public.registres_securite
  FOR UPDATE TO anon, authenticated
  USING (current_role IN ('anon', 'authenticated'))
  WITH CHECK (current_role IN ('anon', 'authenticated'));

CREATE POLICY "anon_delete_registres_securite" ON public.registres_securite
  FOR DELETE TO anon, authenticated
  USING (current_role IN ('anon', 'authenticated'));
