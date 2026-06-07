-- ════════════════════════════════════════════════════════════════════════════
-- Prediction engine cron — the autonomous "one setup after another" loop.
--
--   setup-monitor       (every 3 min)  → resolves each ACTIVE setup against live
--                                          price: first TP = WIN, stop = LOSS,
--                                          expiry = closed. On resolve it forces
--                                          the next setup to be scanned.
--   prediction-prewarm  (every 10 min) → keeps the top-100 daily predictions and
--                                          their monitored setups fresh/accurate
--                                          (uses the real price-prediction engine).
--
-- The project ref and anon key are environment-specific and MUST NOT be committed.
-- Replace the two placeholders below, then run this in the Supabase SQL editor
-- (or via `supabase db push` after substituting the values locally).
-- ════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ── setup-monitor: resolve active setups every 3 minutes ─────────────────────
DO $$ BEGIN PERFORM cron.unschedule('setup-monitor-3min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

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

-- ── prediction-prewarm: keep predictions + setups warm every 10 minutes ──────
DO $$ BEGIN PERFORM cron.unschedule('prediction-prewarm-10min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'prediction-prewarm-10min',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/prediction-prewarm',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verify:  SELECT jobname, schedule, active FROM cron.job;
