/*
# Create site_meta table for site-level metadata (Responsabilité technique)

1. New Tables
- `site_meta` — key/value store for site-level metadata fields.
  - `id` (uuid, primary key)
  - `site_id` (uuid, foreign key to `sites.id`, ON DELETE CASCADE)
  - `key` (text, metadata key name, e.g. 'responsabilite_technique')
  - `value` (text, JSON-encoded value)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - Unique constraint on (site_id, key) to ensure one value per key per site.

2. Security
- Enable RLS on `site_meta`.
- This is a no-auth app (anon access), so policies allow `anon, authenticated` full CRUD.
- `USING (true)` is acceptable because the data is intentionally shared/public (single-tenant, no sign-in).

3. Notes
- The `responsabilite_technique` key stores a JSON array of selected direction/pôle names.
- The unique constraint on (site_id, key) enables `upsert` with `onConflict: 'site_id,key'`.
*/

CREATE TABLE IF NOT EXISTS site_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_meta_site_id_key_unique
  ON site_meta (site_id, key);

ALTER TABLE site_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_meta" ON site_meta;
CREATE POLICY "anon_select_site_meta" ON site_meta FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_site_meta" ON site_meta;
CREATE POLICY "anon_insert_site_meta" ON site_meta FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_site_meta" ON site_meta;
CREATE POLICY "anon_update_site_meta" ON site_meta FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_site_meta" ON site_meta;
CREATE POLICY "anon_delete_site_meta" ON site_meta FOR DELETE
  TO anon, authenticated USING (true);
