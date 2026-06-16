-- =============================================================================
-- P0 SECURITY + SCALE HARDENING  (audit 2026-06-16)
-- Safe/additive. Closes: predictions_cache anon write, is_premium self-grant,
-- missing user_id indexes, check-alerts full scan, blog_articles index/lastmod,
-- self-follow, unbounded text, missing retention/cron schedules.
-- NOTE: indexes are created non-CONCURRENTLY (migrations run in a tx). On a very
-- large LIVE table, instead run the CREATE INDEX statements manually with
-- CONCURRENTLY outside a transaction.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) predictions_cache: the cleanup batch missed this one. The "manage" policy
--    was FOR ALL USING(true) WITH CHECK(true) with NO role scope => anon (the
--    browser publishable key) could INSERT/UPDATE/DELETE AI predictions shown to
--    every user. Re-scope writes to service_role; keep public read.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can manage predictions cache" ON public.predictions_cache;
DROP POLICY IF EXISTS "Service role manages predictions cache"    ON public.predictions_cache;

CREATE POLICY "Service role manages predictions cache"
  ON public.predictions_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
-- public SELECT policy ("Anyone can read predictions cache") is intentionally kept.

-- -----------------------------------------------------------------------------
-- 2) profiles.is_premium self-grant: the profiles UPDATE policy is row-scoped
--    (auth.uid() = id) but has no column guard, so any logged-in user could
--    update({ is_premium: true }). Block changes to is_premium unless the caller
--    is the service_role (edge functions) or a privileged DB role (admin SQL).
--    A trigger is used (RLS WITH CHECK cannot express column immutability).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_premium_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    IF COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::json ->> 'role', '') <> 'service_role'
       AND current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
      RAISE EXCEPTION 'is_premium can only be set by the server (service role)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_premium ON public.profiles;
CREATE TRIGGER trg_protect_premium
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_premium_column();

-- -----------------------------------------------------------------------------
-- 3) Indexes on every user-owned FK column (+ sort composites). Postgres does
--    NOT auto-index FK columns. Every "My" page runs
--    .eq('user_id', uid).order('created_at'|'entered_at', desc) => seq scan
--    without these. CRITICAL for any scale.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_created      ON public.user_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created    ON public.chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user       ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user         ON public.user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower         ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following        ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_trade_journal_user_entered    ON public.trade_journal(user_id, entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_dca_plans_user                ON public.dca_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_entries_plan              ON public.dca_entries(plan_id);
CREATE INDEX IF NOT EXISTS idx_dca_entries_user              ON public.dca_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user               ON public.user_roles(user_id);

-- -----------------------------------------------------------------------------
-- 4) check-alerts cron full-scans user_alerts WHERE is_triggered = false on every
--    run. Tiny partial index keeps the scan to only active alerts.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_alerts_untriggered
  ON public.user_alerts(user_id)
  WHERE is_triggered = false;

-- -----------------------------------------------------------------------------
-- 5) blog_articles: list pages/sitemap query WHERE source = ? ORDER BY
--    published_at DESC but only single-column indexes exist; add the composite.
--    Add updated_at (+ trigger) so sitemap <lastmod> is accurate. Index word_count
--    for the autonomous-agent "optimize" cycle.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blog_articles_source_published
  ON public.blog_articles(source, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_word_count
  ON public.blog_articles(word_count);

ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_blog_articles_updated_at ON public.blog_articles;
CREATE TRIGGER trg_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- NOTE: a UNIQUE index on slug is desirable but may fail if dupes exist. Run after
-- de-duping:  CREATE UNIQUE INDEX CONCURRENTLY idx_blog_articles_slug_unique ON public.blog_articles(slug);

-- -----------------------------------------------------------------------------
-- 6) user_follows self-follow + unbounded free-text growth guards.
-- -----------------------------------------------------------------------------
DELETE FROM public.user_follows WHERE follower_id = following_id;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_follows_no_self') THEN
    ALTER TABLE public.user_follows
      ADD CONSTRAINT chk_user_follows_no_self CHECK (follower_id <> following_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_chat_messages_len') THEN
    ALTER TABLE public.chat_messages
      ADD CONSTRAINT chk_chat_messages_len CHECK (char_length(content) <= 16000);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 7) Retention + scheduling: pg_cron is enabled in 4 migrations but NOTHING was
--    ever scheduled, so cleanup_expired_predictions only ran opportunistically and
--    the append-only log/chat tables have no retention. Wrapped so a missing
--    pg_cron does not fail the migration.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-expired-predictions', '*/15 * * * *',
      $cron$ SELECT public.cleanup_expired_predictions(); $cron$
    );
    PERFORM cron.schedule(
      'retention-automation-logs', '17 3 * * *',
      $cron$ DELETE FROM public.automation_logs WHERE created_at < now() - interval '30 days'; $cron$
    );
    PERFORM cron.schedule(
      'retention-chat-messages', '23 3 * * *',
      $cron$ DELETE FROM public.chat_messages WHERE created_at < now() - interval '90 days'; $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron scheduling skipped: %', SQLERRM;
END $$;
