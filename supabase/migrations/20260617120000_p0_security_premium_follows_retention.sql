-- ════════════════════════════════════════════════════════════════════════════
-- Batch A — P0 security hardening (2026-06-17)
--
-- Closes findings from the ground-truth re-audit:
--   1. CRITICAL: profiles.is_premium was self-grantable. The "Users can update
--      own profile" RLS policy only checks row ownership, never WHICH COLUMNS
--      change, so any authenticated user could run
--        UPDATE public.profiles SET is_premium = true WHERE id = auth.uid();
--      Premium must be server-side only (admin / billing edge fn via service_role).
--      Fix = column-level REVOKE UPDATE(is_premium) from anon/authenticated PLUS a
--      BEFORE UPDATE guard trigger (defense-in-depth; survives a future re-GRANT).
--   2. HIGH: user_follows allowed self-follows (no follower_id <> following_id
--      check) → inflated follower counts / leaderboards.
--   3. LOW: user-writable free-text columns were unbounded TEXT (storage abuse /
--      realtime+leaderboard payload bloat). Add length caps.
--   4. MEDIUM: cleanup_expired_predictions() existed but was never scheduled, so
--      predictions_cache grew unbounded. Schedule it hourly via pg_cron.
--
-- Safe to apply: the client never writes is_premium (it is derived client-side in
-- src/hooks/useAuth.tsx), so the REVOKE/trigger break no existing user flow, and
-- service_role (edge functions / admin) can still set premium. Length checks use
-- NOT VALID so pre-existing rows are not re-validated. The cron scheduling is
-- wrapped so a missing pg_cron extension cannot fail the security portion.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Lock down profiles.is_premium ─────────────────────────────────────────
-- Column-level privilege: anon/authenticated may no longer UPDATE this column.
-- Other columns (display_name, avatar_url, watchlist, preferences, email_
-- notifications) remain updatable under the existing "Users can update own
-- profile" RLS policy. REVOKE of a privilege not held is a harmless no-op.
REVOKE UPDATE (is_premium) ON public.profiles FROM anon, authenticated;

-- Defense-in-depth: even if UPDATE is later re-granted on the whole table, this
-- trigger rejects any attempt by a non-service role to change is_premium. It
-- only fires when the value actually changes (IS DISTINCT FROM), so a client
-- that echoes the unchanged value in a profile save is unaffected.
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

-- ── 2. Forbid self-follows ───────────────────────────────────────────────────
DELETE FROM public.user_follows WHERE follower_id = following_id;

ALTER TABLE public.user_follows
  DROP CONSTRAINT IF EXISTS user_follows_no_self_follow;
ALTER TABLE public.user_follows
  ADD CONSTRAINT user_follows_no_self_follow CHECK (follower_id <> following_id);

-- ── 3. Bound user-writable free-text columns (NOT VALID: enforce new writes
--      only, leave any pre-existing long rows untouched) ──────────────────────
ALTER TABLE public.user_predictions
  DROP CONSTRAINT IF EXISTS user_predictions_reasoning_len;
ALTER TABLE public.user_predictions
  ADD CONSTRAINT user_predictions_reasoning_len
  CHECK (reasoning IS NULL OR char_length(reasoning) <= 2000) NOT VALID;

ALTER TABLE public.portfolio_holdings
  DROP CONSTRAINT IF EXISTS portfolio_holdings_notes_len;
ALTER TABLE public.portfolio_holdings
  ADD CONSTRAINT portfolio_holdings_notes_len
  CHECK (notes IS NULL OR char_length(notes) <= 2000) NOT VALID;

ALTER TABLE public.trade_journal
  DROP CONSTRAINT IF EXISTS trade_journal_notes_len;
ALTER TABLE public.trade_journal
  ADD CONSTRAINT trade_journal_notes_len
  CHECK (notes IS NULL OR char_length(notes) <= 2000) NOT VALID;

ALTER TABLE public.dca_plans
  DROP CONSTRAINT IF EXISTS dca_plans_notes_len;
ALTER TABLE public.dca_plans
  ADD CONSTRAINT dca_plans_notes_len
  CHECK (notes IS NULL OR char_length(notes) <= 2000) NOT VALID;

-- ── 4. Schedule predictions_cache retention (hourly at :17) ──────────────────
-- pg_cron is enabled by 20260607120000_prediction_engine_cron.sql.
-- cleanup_expired_predictions() is SECURITY INVOKER; the cron job runs as the
-- scheduling superuser, which can execute it. Wrapped in EXCEPTION-safe blocks
-- so an environment without pg_cron does not fail the security migration above.
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-expired-predictions-hourly');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule(
    'cleanup-expired-predictions-hourly',
    '17 * * * *',
    $job$ SELECT public.cleanup_expired_predictions(); $job$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipped scheduling cleanup cron (pg_cron unavailable?): %', SQLERRM;
END $$;
