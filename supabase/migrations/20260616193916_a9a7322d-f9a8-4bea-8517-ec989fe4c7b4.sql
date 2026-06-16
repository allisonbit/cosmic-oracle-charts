
-- Tighten profiles: remove broad authenticated-read policy
DROP POLICY IF EXISTS "Authenticated users can read public profiles" ON public.profiles;

-- Fix predictions_cache: scope manage policy to service_role only
DROP POLICY IF EXISTS "Service role can manage predictions cache" ON public.predictions_cache;
CREATE POLICY "Service role can manage predictions cache"
  ON public.predictions_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Remove user_predictions from realtime broadcast (RLS does not guard realtime topics)
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_predictions;

-- Restrict SECURITY DEFINER has_role to authenticated callers (RLS uses it)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
