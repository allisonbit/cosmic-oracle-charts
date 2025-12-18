-- Drop all Telegram bot related tables
DROP TABLE IF EXISTS public.telegram_polls CASCADE;
DROP TABLE IF EXISTS public.telegram_pinned CASCADE;
DROP TABLE IF EXISTS public.telegram_conversations CASCADE;
DROP TABLE IF EXISTS public.telegram_groups CASCADE;
DROP TABLE IF EXISTS public.telegram_bot_usage CASCADE;
DROP TABLE IF EXISTS public.telegram_alerts CASCADE;

-- Remove any telegram-related cron jobs
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname LIKE '%telegram%';