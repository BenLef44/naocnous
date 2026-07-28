
-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Fix mutable search_path on trigger functions
--    Setting search_path = '' forces fully-qualified names, preventing
--    privilege escalation via a malicious search_path override.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_erp_module_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_baux_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Reference / patrimoine tables — drop unrestricted write policies
--    These tables are populated exclusively via server-side migrations.
--    The client (anon key) only needs SELECT.
-- ═══════════════════════════════════════════════════════════════════════════════

-- sites
DROP POLICY IF EXISTS "Allow anon insert sites"  ON public.sites;
DROP POLICY IF EXISTS "Allow anon update sites"  ON public.sites;
DROP POLICY IF EXISTS "Allow anon delete sites"  ON public.sites;

-- residences
DROP POLICY IF EXISTS "Allow anon insert residences" ON public.residences;
DROP POLICY IF EXISTS "Allow anon update residences" ON public.residences;
DROP POLICY IF EXISTS "Allow anon delete residences" ON public.residences;

-- batiments
DROP POLICY IF EXISTS "Allow anon insert batiments" ON public.batiments;
DROP POLICY IF EXISTS "Allow anon update batiments" ON public.batiments;
DROP POLICY IF EXISTS "Allow anon delete batiments" ON public.batiments;

-- etages
DROP POLICY IF EXISTS "Allow anon insert etages"    ON public.etages;
DROP POLICY IF EXISTS "Allow anon update etages"    ON public.etages;
DROP POLICY IF EXISTS "Allow anon delete etages"    ON public.etages;

-- logements
DROP POLICY IF EXISTS "Allow anon insert logements" ON public.logements;
DROP POLICY IF EXISTS "Allow anon update logements" ON public.logements;
DROP POLICY IF EXISTS "Allow anon delete logements" ON public.logements;

-- types_controle
DROP POLICY IF EXISTS "Allow anon insert types_controle" ON public.types_controle;
DROP POLICY IF EXISTS "Allow anon update types_controle" ON public.types_controle;
DROP POLICY IF EXISTS "Allow anon delete types_controle" ON public.types_controle;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Operational tables read from client but never written — drop write policies
-- ═══════════════════════════════════════════════════════════════════════════════

-- documents (seeded only; client reads via GED)
DROP POLICY IF EXISTS "Allow anon insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anon update documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anon delete documents" ON public.documents;

-- prestataires (client reads for selects; written only via migrations)
DROP POLICY IF EXISTS "anon can insert prestataires" ON public.prestataires;
DROP POLICY IF EXISTS "anon can update prestataires" ON public.prestataires;
DROP POLICY IF EXISTS "anon can delete prestataires" ON public.prestataires;

-- controles_erp / incidents_erp / actions_correctives_erp
-- Client only does SELECT on these tables
DROP POLICY IF EXISTS "anon can insert controles_erp"              ON public.controles_erp;
DROP POLICY IF EXISTS "anon can update controles_erp"              ON public.controles_erp;
DROP POLICY IF EXISTS "anon can delete controles_erp"              ON public.controles_erp;

DROP POLICY IF EXISTS "anon can insert incidents_erp"              ON public.incidents_erp;
DROP POLICY IF EXISTS "anon can update incidents_erp"              ON public.incidents_erp;
DROP POLICY IF EXISTS "anon can delete incidents_erp"              ON public.incidents_erp;

DROP POLICY IF EXISTS "anon can insert actions_correctives_erp"    ON public.actions_correctives_erp;
DROP POLICY IF EXISTS "anon can update actions_correctives_erp"    ON public.actions_correctives_erp;
DROP POLICY IF EXISTS "anon can delete actions_correctives_erp"    ON public.actions_correctives_erp;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. alertes — client only UPDATEs (dismissal); restrict INSERT/DELETE
-- ═══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Allow anon insert alertes" ON public.alertes;
DROP POLICY IF EXISTS "Allow anon delete alertes" ON public.alertes;
-- Keep update policy (client dismisses alerts via UPDATE)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Remaining "always true" policies on operational tables where the client
--    genuinely needs write access (interventions, controles_reglementaires,
--    points_controle, actions_correctives, equipements, contrats,
--    baux, locataires, registres_securite, erp).
--
--    For a no-auth application these USING (true) / WITH CHECK (true) policies
--    are intentional — the anon key IS the only principal.
--    We add an explicit comment but do not break the app by removing access.
--    The remaining warnings in the security advisor are expected and accepted
--    for a no-auth demo environment.
-- ═══════════════════════════════════════════════════════════════════════════════
COMMENT ON TABLE public.interventions IS
  'RLS: anon write policies intentional — no-auth app, anon key is sole principal';
COMMENT ON TABLE public.controles_reglementaires IS
  'RLS: anon write policies intentional — no-auth app, anon key is sole principal';
COMMENT ON TABLE public.equipements IS
  'RLS: anon write policies intentional — no-auth app, anon key is sole principal';
COMMENT ON TABLE public.baux IS
  'RLS: anon write policies intentional — no-auth app, anon key is sole principal';
COMMENT ON TABLE public.locataires IS
  'RLS: anon write policies intentional — no-auth app, anon key is sole principal';
