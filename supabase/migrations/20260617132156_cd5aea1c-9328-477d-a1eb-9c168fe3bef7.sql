-- 1. Lock down profiles.is_premium (stop authenticated users self-granting premium)
REVOKE UPDATE (is_premium) ON public.profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_premium_server_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
     AND current_user IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'is_premium can only be changed server-side (service_role)'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_premium_server_only ON public.profiles;
CREATE TRIGGER trg_enforce_premium_server_only
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_premium_server_only();

-- 2. Forbid self-follows
DELETE FROM public.user_follows WHERE follower_id = following_id;
ALTER TABLE public.user_follows DROP CONSTRAINT IF EXISTS user_follows_no_self_follow;
ALTER TABLE public.user_follows ADD CONSTRAINT user_follows_no_self_follow CHECK (follower_id <> following_id);

-- 3. Bound user-writable free-text columns (enforce new writes only)
ALTER TABLE public.user_predictions DROP CONSTRAINT IF EXISTS user_predictions_reasoning_len;
ALTER TABLE public.user_predictions ADD CONSTRAINT user_predictions_reasoning_len CHECK (reasoning IS NULL OR char_length(reasoning) <= 2000) NOT VALID;

ALTER TABLE public.portfolio_holdings DROP CONSTRAINT IF EXISTS portfolio_holdings_notes_len;
ALTER TABLE public.portfolio_holdings ADD CONSTRAINT portfolio_holdings_notes_len CHECK (notes IS NULL OR char_length(notes) <= 2000) NOT VALID;

ALTER TABLE public.trade_journal DROP CONSTRAINT IF EXISTS trade_journal_notes_len;
ALTER TABLE public.trade_journal ADD CONSTRAINT trade_journal_notes_len CHECK (notes IS NULL OR char_length(notes) <= 2000) NOT VALID;

ALTER TABLE public.dca_plans DROP CONSTRAINT IF EXISTS dca_plans_notes_len;
ALTER TABLE public.dca_plans ADD CONSTRAINT dca_plans_notes_len CHECK (notes IS NULL OR char_length(notes) <= 2000) NOT VALID;

-- 4. Schedule predictions_cache retention hourly (safe if pg_cron is enabled)
DO $$ BEGIN PERFORM cron.unschedule('cleanup-expired-predictions-hourly'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM cron.schedule('cleanup-expired-predictions-hourly', '17 * * * *', $job$ SELECT public.cleanup_expired_predictions(); $job$);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipped cleanup cron (pg_cron unavailable?): %', SQLERRM;
END $$;

-- 5. Performance: index user_id / FK columns that every RLS policy filters on
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id   ON public.user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_journal_user_id      ON public.trade_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_plans_user_id          ON public.dca_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_entries_user_id        ON public.dca_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_entries_plan_id        ON public.dca_entries(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id   ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id  ON public.user_follows(following_id);
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON public.user_alerts(user_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END $$;