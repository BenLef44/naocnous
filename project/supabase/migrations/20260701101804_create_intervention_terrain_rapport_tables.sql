
-- ── Rapport d'intervention ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intervention_rapport (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id  UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
  travaux_realises TEXT NOT NULL DEFAULT '',
  conclusion       TEXT,
  commentaire_conclusion TEXT NOT NULL DEFAULT '',
  signature_technicien   BOOLEAN NOT NULL DEFAULT FALSE,
  signature_occupant     BOOLEAN NOT NULL DEFAULT FALSE,
  signature_demandeur    BOOLEAN NOT NULL DEFAULT FALSE,
  date_rapport     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (intervention_id)
);

ALTER TABLE public.intervention_rapport ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_intervention_rapport" ON public.intervention_rapport
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_intervention_rapport" ON public.intervention_rapport
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_update_intervention_rapport" ON public.intervention_rapport
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_delete_intervention_rapport" ON public.intervention_rapport
  FOR DELETE TO anon USING (current_role = 'anon');

CREATE TRIGGER update_intervention_rapport_updated_at
  BEFORE UPDATE ON public.intervention_rapport
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Temps passés ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intervention_temps (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id  UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('deplacement','preparation','intervention','attente','administratif')),
  debut            TIMESTAMPTZ NOT NULL,
  fin              TIMESTAMPTZ,
  duree_min        INTEGER NOT NULL,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.intervention_temps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_intervention_temps" ON public.intervention_temps
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_intervention_temps" ON public.intervention_temps
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_update_intervention_temps" ON public.intervention_temps
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_delete_intervention_temps" ON public.intervention_temps
  FOR DELETE TO anon USING (current_role = 'anon');

-- ── Consommables utilisés ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intervention_consommables (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id  UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
  reference        TEXT NOT NULL,
  designation      TEXT NOT NULL,
  quantite         NUMERIC NOT NULL DEFAULT 1,
  unite            TEXT NOT NULL DEFAULT 'pièce',
  stock_restant    INTEGER NOT NULL DEFAULT 0,
  prix_unitaire    NUMERIC NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.intervention_consommables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_intervention_consommables" ON public.intervention_consommables
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_intervention_consommables" ON public.intervention_consommables
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_update_intervention_consommables" ON public.intervention_consommables
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_delete_intervention_consommables" ON public.intervention_consommables
  FOR DELETE TO anon USING (current_role = 'anon');

-- ── Photos terrain ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intervention_photos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id  UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
  categorie        TEXT NOT NULL CHECK (categorie IN ('avant','pendant','apres','document')),
  url              TEXT NOT NULL,
  caption          TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.intervention_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_intervention_photos" ON public.intervention_photos
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_intervention_photos" ON public.intervention_photos
  FOR INSERT TO anon WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_update_intervention_photos" ON public.intervention_photos
  FOR UPDATE TO anon
  USING (current_role = 'anon') WITH CHECK (current_role = 'anon');
CREATE POLICY "anon_delete_intervention_photos" ON public.intervention_photos
  FOR DELETE TO anon USING (current_role = 'anon');
