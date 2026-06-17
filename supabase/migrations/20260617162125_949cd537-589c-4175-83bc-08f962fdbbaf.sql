CREATE TABLE IF NOT EXISTS public.prediction_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  bias TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 0,
  entry_price NUMERIC NOT NULL,
  target_low NUMERIC,
  target_high NUMERIC,
  actual_price NUMERIC NOT NULL,
  hit BOOLEAN NOT NULL,
  predicted_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS prediction_outcomes_prediction_id_key
  ON public.prediction_outcomes(prediction_id);
CREATE INDEX IF NOT EXISTS prediction_outcomes_coin_idx
  ON public.prediction_outcomes(coin_id, resolved_at DESC);

GRANT SELECT ON public.prediction_outcomes TO anon, authenticated;
GRANT ALL ON public.prediction_outcomes TO service_role;

ALTER TABLE public.prediction_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read prediction outcomes"
  ON public.prediction_outcomes
  FOR SELECT
  USING (true);

CREATE POLICY "Service role manages outcomes"
  ON public.prediction_outcomes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);