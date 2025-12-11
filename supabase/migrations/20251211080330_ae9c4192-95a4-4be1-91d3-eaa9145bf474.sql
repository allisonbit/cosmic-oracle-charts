-- Expand alerts table to support more alert types
ALTER TABLE public.telegram_alerts 
DROP CONSTRAINT IF EXISTS telegram_alerts_alert_type_check;

ALTER TABLE public.telegram_alerts 
ADD CONSTRAINT telegram_alerts_alert_type_check 
CHECK (alert_type IN ('price_above', 'price_below', 'gas', 'whale', 'sentiment_fear', 'sentiment_greed', 'volume_spike', 'trending', 'news', 'custom'));

-- Add metadata column for flexible alert configs
ALTER TABLE public.telegram_alerts 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create conversation memory table for learning
CREATE TABLE public.telegram_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  user_id BIGINT,
  username TEXT,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'message',
  sentiment TEXT,
  topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_conversations_chat ON public.telegram_conversations(chat_id);
CREATE INDEX idx_telegram_conversations_topics ON public.telegram_conversations USING GIN(topics);

ALTER TABLE public.telegram_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on telegram_conversations" 
ON public.telegram_conversations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create polls table
CREATE TABLE public.telegram_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  votes JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_polls_chat ON public.telegram_polls(chat_id, is_active);

ALTER TABLE public.telegram_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on telegram_polls" 
ON public.telegram_polls 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create pinned insights table
CREATE TABLE public.telegram_pinned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_pinned_chat ON public.telegram_pinned(chat_id, is_active);

ALTER TABLE public.telegram_pinned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on telegram_pinned" 
ON public.telegram_pinned 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add learning preferences to groups
ALTER TABLE public.telegram_groups
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"learn_topics": true, "auto_respond": true, "digest_interval": 10}',
ADD COLUMN IF NOT EXISTS learned_topics TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS community_sentiment TEXT DEFAULT 'neutral';