-- ════════════════════════════════════════════════════════════════════════════
-- Schedule setup-monitor to resolve active trade setups against live prices.
--
-- This runs every 3 minutes and pings the setup-monitor edge function. Because
-- the project ref and anon key are environment-specific (and must NOT be hard-
-- committed), replace the two placeholders below before running, OR run the
-- equivalent cron.schedule() from the Supabase SQL editor where the values are
-- available. See the deploy notes handed off with this change.
-- ════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove any prior schedule with this name (idempotent re-runs).
DO $$
BEGIN
  PERFORM cron.unschedule('setup-monitor-3min');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'setup-monitor-3min',
  '*/3 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/setup-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);
