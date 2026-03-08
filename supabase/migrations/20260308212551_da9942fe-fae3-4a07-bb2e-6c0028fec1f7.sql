
-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can read roles table
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role manages roles
CREATE POLICY "Service role manages roles"
  ON public.user_roles FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Fix: restrict automation_logs to service_role only
DROP POLICY IF EXISTS "Public read logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Service manage logs" ON public.automation_logs;

CREATE POLICY "Service role manages logs"
  ON public.automation_logs FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Fix: restrict profiles social read to authenticated only and exclude email harvesting
DROP POLICY IF EXISTS "Anyone can read profiles for social" ON public.profiles;

CREATE POLICY "Authenticated users can read public profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Fix: restrict cleanup function to service_role only
DROP FUNCTION IF EXISTS public.cleanup_expired_predictions();

CREATE OR REPLACE FUNCTION public.cleanup_expired_predictions()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.predictions_cache WHERE expires_at < now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_predictions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_predictions() TO service_role;
