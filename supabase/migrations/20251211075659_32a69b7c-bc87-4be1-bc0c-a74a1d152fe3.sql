-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create table to store registered group chats for auto-updates
CREATE TABLE public.telegram_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL UNIQUE,
  chat_title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_digest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_groups_active ON public.telegram_groups(is_active, auto_digest);

ALTER TABLE public.telegram_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on telegram_groups" 
ON public.telegram_groups 
FOR ALL 
USING (true)
WITH CHECK (true);