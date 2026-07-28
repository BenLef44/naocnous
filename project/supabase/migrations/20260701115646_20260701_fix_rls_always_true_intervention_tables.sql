-- Fix RLS policies with always-true predicates on intervention tables

-- historique_intervention — INSERT
DROP POLICY IF EXISTS "anon insert historique_intervention" ON public.historique_intervention;
CREATE POLICY "anon insert historique_intervention" ON public.historique_intervention
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

-- tickets_intervention — INSERT
DROP POLICY IF EXISTS "anon insert tickets_intervention" ON public.tickets_intervention;
CREATE POLICY "anon insert tickets_intervention" ON public.tickets_intervention
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');

-- tickets_intervention — UPDATE
DROP POLICY IF EXISTS "anon update tickets_intervention" ON public.tickets_intervention;
CREATE POLICY "anon update tickets_intervention" ON public.tickets_intervention
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');
