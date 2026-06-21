-- =============================================================================
-- profiles.email PII lockdown  (audit P0/high)
-- The social SELECT policy was USING(true), so any authenticated user could
-- `select email from profiles` for the ENTIRE user base (email-harvest / phishing
-- list). Restrict the base table to own-row reads and expose ONLY non-PII columns
-- (id, display_name, avatar_url) for social/leaderboard via a view.
-- check-alerts reads email server-side with the service_role key (bypasses RLS),
-- so alert emails keep working.
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can read profiles for social"        ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read public profiles" ON public.profiles;

-- Own-row read only.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Non-PII projection for social reads. The view runs with its owner's rights
-- (NOT security_invoker), so it can read all rows but only ever exposes these three
-- safe columns — email is never reachable through it.
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, display_name, avatar_url
  FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;
