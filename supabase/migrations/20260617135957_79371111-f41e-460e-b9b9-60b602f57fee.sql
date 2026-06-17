-- 1) profiles: prevent privilege escalation at INSERT time.
-- Tighten the user-facing INSERT policy: a user may only insert their own
-- profile row, and only with is_premium = false (or null). The
-- enforce_premium_server_only trigger continues to block UPDATE escalation;
-- this WITH CHECK closes the INSERT path.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND (is_premium IS NULL OR is_premium = false)
  );

-- Also extend the SECURITY DEFINER trigger to fire on INSERT, so the
-- service_role bypass remains the only way to mint a premium profile even
-- if the RLS policy is later loosened. The handle_new_user() trigger runs
-- as SECURITY DEFINER (current_user = postgres), so seeded inserts pass.
DROP TRIGGER IF EXISTS enforce_premium_server_only_ins ON public.profiles;
CREATE TRIGGER enforce_premium_server_only_ins
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_premium_server_only();

-- Adjust the function so it handles INSERT (no OLD row) cleanly.
CREATE OR REPLACE FUNCTION public.enforce_premium_server_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.is_premium, false) = true
       AND current_user IN ('authenticated', 'anon') THEN
      RAISE EXCEPTION 'is_premium can only be set server-side (service_role)'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
       AND current_user IN ('authenticated', 'anon') THEN
      RAISE EXCEPTION 'is_premium can only be changed server-side (service_role)'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2) dca_entries: add the missing UPDATE policy so users can only mutate
-- their own rows (and cannot reassign a row to another user_id).
CREATE POLICY "Users can update own dca entries"
  ON public.dca_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
