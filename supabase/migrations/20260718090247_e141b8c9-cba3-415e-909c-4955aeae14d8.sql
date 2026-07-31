
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  week_iso text NOT NULL,
  content jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.weekly_reports TO anon, authenticated;
GRANT ALL ON public.weekly_reports TO service_role;

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read weekly_reports" ON public.weekly_reports;
CREATE POLICY "Public read weekly_reports" ON public.weekly_reports FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS weekly_reports_published_idx ON public.weekly_reports (published_at DESC);

-- Schedule the weekly-report edge function every Monday 00:05 UTC
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-report-monday') THEN
    PERFORM cron.unschedule('weekly-report-monday');
  END IF;
  PERFORM cron.schedule(
    'weekly-report-monday',
    '5 0 * * 1',
    $c$
    SELECT net.http_post(
      url := 'https://qynszkirmcrldqmiplwh.supabase.co/functions/v1/weekly-report',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object('trigger','cron')
    );
    $c$
  );
END $$;
