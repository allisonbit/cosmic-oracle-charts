-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create unique constraint on predictions_cache if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'predictions_cache_coin_timeframe_unique'
  ) THEN
    ALTER TABLE public.predictions_cache 
    ADD CONSTRAINT predictions_cache_coin_timeframe_unique 
    UNIQUE (coin_id, timeframe);
  END IF;
END $$;