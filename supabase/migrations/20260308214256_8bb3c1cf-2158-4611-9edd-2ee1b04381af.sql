
DROP POLICY IF EXISTS "Service manage metrics" ON public.performance_metrics;

CREATE POLICY "Service role manages metrics"
  ON public.performance_metrics FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
