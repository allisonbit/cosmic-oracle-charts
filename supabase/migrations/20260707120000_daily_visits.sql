-- Daily visit counter table
CREATE TABLE IF NOT EXISTS public.daily_visits (
  visit_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.daily_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read counts
CREATE POLICY "Anyone can read daily visits"
  ON public.daily_visits FOR SELECT
  USING (true);

-- Function to increment today's visit count
CREATE OR REPLACE FUNCTION public.increment_daily_visits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_visits (visit_date, count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (visit_date)
  DO UPDATE SET count = daily_visits.count + 1;
END;
$$;
