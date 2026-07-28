
-- Allow anonymous (unauthenticated) reads on occupants so the EDL module works without auth
CREATE POLICY "Allow anon read occupants"
  ON occupants FOR SELECT
  TO anon
  USING (true);
