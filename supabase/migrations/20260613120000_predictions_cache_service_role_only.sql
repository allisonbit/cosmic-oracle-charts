-- Fix: predictions_cache had a "FOR ALL USING(true) WITH CHECK(true)" policy with
-- NO `TO service_role` clause, so it applied to PUBLIC (anon + authenticated).
-- Because the client ships the public anon key, ANY user could INSERT/UPDATE/DELETE
-- rows in predictions_cache — poisoning or wiping the AI predictions shown to every
-- other user. This mirrors the hardening already applied to content_drafts /
-- blog_articles / automation_logs in earlier migrations, which this table missed.
--
-- After this migration:
--   * public (anon + authenticated) keep SELECT-only access (predictions are public data)
--   * only service_role (used by the backend/cron edge functions) can write
--     (service_role also bypasses RLS, so writes from edge functions keep working)

DROP POLICY IF EXISTS "Service role can manage predictions cache" ON public.predictions_cache;

CREATE POLICY "Service role manages predictions cache"
ON public.predictions_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- (The existing "Anyone can read predictions cache" FOR SELECT USING(true) policy
--  is intentionally left in place — public read access is desired.)
