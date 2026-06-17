
CREATE TABLE IF NOT EXISTS public.trade_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global','user')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  contract_address TEXT,
  chain TEXT,
  image TEXT,
  timeframe TEXT NOT NULL,
  bias TEXT NOT NULL CHECK (bias IN ('bullish','bearish','neutral')),
  confidence NUMERIC NOT NULL DEFAULT 0,
  entry_price NUMERIC NOT NULL DEFAULT 0,
  entry_low NUMERIC NOT NULL DEFAULT 0,
  entry_high NUMERIC NOT NULL DEFAULT 0,
  stop_loss NUMERIC NOT NULL DEFAULT 0,
  take_profit_1 NUMERIC NOT NULL DEFAULT 0,
  take_profit_2 NUMERIC NOT NULL DEFAULT 0,
  take_profit_3 NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hit_tp1','hit_tp2','hit_tp3','stopped','invalidated','expired')),
  last_price NUMERIC NOT NULL DEFAULT 0,
  peak_price NUMERIC NOT NULL DEFAULT 0,
  pnl_percent NUMERIC NOT NULL DEFAULT 0,
  hit_targets INTEGER NOT NULL DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  write_up TEXT,
  seo_slug TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trade_setups_active_idx
  ON public.trade_setups (coin_id, timeframe, scope, status, generated_at DESC);
CREATE INDEX IF NOT EXISTS trade_setups_user_idx
  ON public.trade_setups (user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS trade_setups_history_idx
  ON public.trade_setups (coin_id, resolved_at DESC);

GRANT SELECT ON public.trade_setups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trade_setups TO authenticated;
GRANT ALL ON public.trade_setups TO service_role;

ALTER TABLE public.trade_setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global setups"
  ON public.trade_setups FOR SELECT
  USING (scope = 'global');

CREATE POLICY "Users can read their own setups"
  ON public.trade_setups FOR SELECT
  TO authenticated
  USING (scope = 'user' AND auth.uid() = user_id);

CREATE POLICY "Users can insert their own setups"
  ON public.trade_setups FOR INSERT
  TO authenticated
  WITH CHECK (scope = 'user' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own setups"
  ON public.trade_setups FOR UPDATE
  TO authenticated
  USING (scope = 'user' AND auth.uid() = user_id)
  WITH CHECK (scope = 'user' AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own setups"
  ON public.trade_setups FOR DELETE
  TO authenticated
  USING (scope = 'user' AND auth.uid() = user_id);

CREATE TRIGGER trade_setups_set_updated_at
  BEFORE UPDATE ON public.trade_setups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
