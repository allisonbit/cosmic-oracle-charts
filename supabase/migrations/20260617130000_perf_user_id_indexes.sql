-- ════════════════════════════════════════════════════════════════════════════
-- Batch C — performance: index the user_id / FK columns that every RLS policy
-- and hot social query filters on (auth.uid() = user_id). Without these, each
-- per-user read is a sequential scan; at scale that is the difference between
-- index lookups and full-table scans on every dashboard/social request.
--
-- Plain (non-CONCURRENT) CREATE INDEX so it runs inside the migration
-- transaction; these tables are young/small so the brief lock is negligible.
-- IF NOT EXISTS makes it idempotent. The two tables not directly verified from
-- their CREATE TABLE (user_alerts, chat_messages) are wrapped so a schema drift
-- cannot fail the whole migration.
-- ════════════════════════════════════════════════════════════════════════════

-- Verified columns (from their CREATE TABLE migrations):
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id   ON public.user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_journal_user_id      ON public.trade_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_plans_user_id          ON public.dca_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_entries_user_id        ON public.dca_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_entries_plan_id        ON public.dca_entries(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id   ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id  ON public.user_follows(following_id);

-- Less-certain tables: create best-effort so schema drift can't abort the batch.
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON public.user_alerts(user_id);
EXCEPTION WHEN undefined_table OR undefined_column THEN
  RAISE NOTICE 'Skipped idx_user_alerts_user_id: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
EXCEPTION WHEN undefined_table OR undefined_column THEN
  RAISE NOTICE 'Skipped idx_chat_messages_user_id: %', SQLERRM;
END $$;
