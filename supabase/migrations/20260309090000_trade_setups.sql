-- ════════════════════════════════════════════════════════════════════════════
-- trade_setups — persistent, monitored trade setups
--
-- A setup is generated ONCE per (coin_id, timeframe) for the global board (and
-- optionally saved per-user), then a scheduled monitor resolves it against live
-- prices (hit TP / hit SL / invalidated) instead of regenerating every refresh.
-- This is what gives the prediction page an honest, persistent track record.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.trade_setups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 'global' = public board row (one active per coin/timeframe);
  -- 'user'   = a user-saved/followed copy.
  scope text NOT NULL DEFAULT 'global',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Coin identity (works for CoinGecko coins AND on-chain contract tokens)
  coin_id text NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL DEFAULT '',
  contract_address text,
  chain text,
  image text,

  timeframe text NOT NULL DEFAULT 'daily',  -- daily | weekly | monthly
  bias text NOT NULL DEFAULT 'neutral',     -- bullish | bearish | neutral
  confidence integer NOT NULL DEFAULT 50,

  -- The setup levels (snapshot at generation — these never change once set)
  entry_price numeric NOT NULL DEFAULT 0,
  entry_low numeric NOT NULL DEFAULT 0,
  entry_high numeric NOT NULL DEFAULT 0,
  stop_loss numeric NOT NULL DEFAULT 0,
  take_profit_1 numeric NOT NULL DEFAULT 0,
  take_profit_2 numeric NOT NULL DEFAULT 0,
  take_profit_3 numeric NOT NULL DEFAULT 0,

  -- Lifecycle / outcome (updated by the monitor)
  status text NOT NULL DEFAULT 'active',    -- active | hit_tp1 | hit_tp2 | hit_tp3 | stopped | invalidated | expired
  last_price numeric NOT NULL DEFAULT 0,
  peak_price numeric NOT NULL DEFAULT 0,
  pnl_percent numeric NOT NULL DEFAULT 0,
  hit_targets integer NOT NULL DEFAULT 0,   -- how many TPs reached (0-3)
  resolved_at timestamp with time zone,
  expires_at timestamp with time zone,

  -- Editorial / SEO
  write_up text,
  seo_slug text,

  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_setups ENABLE ROW LEVEL SECURITY;

-- Only ONE active global setup per coin/timeframe (generate-once guarantee).
CREATE UNIQUE INDEX trade_setups_active_global_uidx
  ON public.trade_setups (coin_id, timeframe)
  WHERE scope = 'global' AND status = 'active';

CREATE INDEX trade_setups_lookup_idx ON public.trade_setups (coin_id, timeframe, status);
CREATE INDEX trade_setups_user_idx ON public.trade_setups (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX trade_setups_active_idx ON public.trade_setups (status) WHERE status = 'active';

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Global setups are a public track record: readable by everyone (incl. anon).
CREATE POLICY "Anyone can read global setups"
  ON public.trade_setups FOR SELECT
  TO anon, authenticated
  USING (scope = 'global');

-- Users can read their own saved setups.
CREATE POLICY "Users can read own setups"
  ON public.trade_setups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can save/follow setups to their own account.
CREATE POLICY "Users can insert own setups"
  ON public.trade_setups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND scope = 'user');

CREATE POLICY "Users can update own setups"
  ON public.trade_setups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own setups"
  ON public.trade_setups FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- The edge functions (price-prediction generator + setup-monitor) run as
-- service_role and manage the global board.
CREATE POLICY "Service role manages setups"
  ON public.trade_setups FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Live updates so the UI reflects status transitions immediately.
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_setups;
