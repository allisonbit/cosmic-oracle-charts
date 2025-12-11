-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for Telegram user alert preferences
CREATE TABLE public.telegram_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'whale', 'gas')),
  token_or_chain TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_telegram_alerts_user ON public.telegram_alerts(telegram_user_id);
CREATE INDEX idx_telegram_alerts_active ON public.telegram_alerts(is_active, alert_type);

-- Create table for tracking bot usage/analytics
CREATE TABLE public.telegram_bot_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  command TEXT NOT NULL,
  query_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_bot_usage_user ON public.telegram_bot_usage(telegram_user_id);

-- Enable RLS
ALTER TABLE public.telegram_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_usage ENABLE ROW LEVEL SECURITY;

-- Allow edge function access (public policies since edge functions run with anon key for webhooks)
CREATE POLICY "Allow all operations on telegram_alerts" 
ON public.telegram_alerts 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on telegram_bot_usage" 
ON public.telegram_bot_usage 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_telegram_alerts_updated_at
BEFORE UPDATE ON public.telegram_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();