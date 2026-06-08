ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS source_name  TEXT,
  ADD COLUMN IF NOT EXISTS source_icon  TEXT,
  ADD COLUMN IF NOT EXISTS sentiment    TEXT,
  ADD COLUMN IF NOT EXISTS coins        JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_blog_articles_source_published
  ON public.blog_articles (source, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_articles_title_lower
  ON public.blog_articles (lower(title));

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$ BEGIN PERFORM cron.unschedule('news-aggregator-30min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'news-aggregator-30min',
  '*/30 * * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://qynszkirmcrldqmiplwh.supabase.co/functions/v1/news-aggregator',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bnN6a2lybWNybGRxbWlwbHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzU2NTQsImV4cCI6MjA4MDc1MTY1NH0.8Jr8lpfAifN-ozIQmA9_wU5YqYjZVlq3Q35KccSI-g0'
    ),
    body := '{"trigger":"cron"}'::jsonb
  );
  $cron$
);