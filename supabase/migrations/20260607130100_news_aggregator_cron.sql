-- ════════════════════════════════════════════════════════════════════════════
-- News aggregator cron — pulls fresh crypto news every 30 minutes.
--
--   news-aggregator  (every 30 min) → fetches the latest stories from 50+ crypto
--                                       publications (CoinDesk, Cointelegraph,
--                                       Decrypt, CryptoSlate, The Block, …) via the
--                                       CryptoCompare aggregated feed, writes an
--                                       original AI summary + sentiment + FAQs for
--                                       each, saves them to `blog_articles`
--                                       (source = 'news') and pings IndexNow so the
--                                       new /news/<slug> URLs hit search engines.
--
-- The project ref and anon key are environment-specific and MUST NOT be committed.
-- Replace the two placeholders below, then run this in the Supabase SQL editor
-- (or via `supabase db push` after substituting the values locally).
-- ════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ── news-aggregator: refresh persisted news every 30 minutes ─────────────────
DO $$ BEGIN PERFORM cron.unschedule('news-aggregator-30min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'news-aggregator-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/news-aggregator',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);

-- Verify:  SELECT jobname, schedule, active FROM cron.job;
