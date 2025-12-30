-- Ensure predictions_cache table has proper indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_predictions_cache_lookup ON public.predictions_cache(coin_id, timeframe);
CREATE INDEX IF NOT EXISTS idx_predictions_cache_expires ON public.predictions_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_predictions_cache_bias ON public.predictions_cache(bias);

-- Add function to clean up expired predictions
CREATE OR REPLACE FUNCTION public.cleanup_expired_predictions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.predictions_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;