-- Create predictions_cache table for caching AI-generated predictions
CREATE TABLE public.predictions_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('daily', 'weekly', 'monthly')),
  prediction_data JSONB NOT NULL,
  current_price NUMERIC,
  bias TEXT CHECK (bias IN ('bullish', 'bearish', 'neutral')),
  confidence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(coin_id, timeframe)
);

-- Create index for fast lookups
CREATE INDEX idx_predictions_cache_lookup ON public.predictions_cache(coin_id, timeframe);
CREATE INDEX idx_predictions_cache_expires ON public.predictions_cache(expires_at);

-- Enable RLS
ALTER TABLE public.predictions_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read predictions (public data)
CREATE POLICY "Anyone can read predictions cache"
ON public.predictions_cache
FOR SELECT
USING (true);

-- Allow service role to manage cache
CREATE POLICY "Service role can manage predictions cache"
ON public.predictions_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.predictions_cache IS 'Caches AI-generated crypto price predictions to reduce API calls and improve response times';