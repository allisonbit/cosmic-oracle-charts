ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true;

ALTER TABLE public.user_alerts
ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false;