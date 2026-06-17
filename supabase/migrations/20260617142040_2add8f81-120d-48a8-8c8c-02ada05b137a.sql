-- Defense-in-depth: make the profile UPDATE policy itself reject any change to
-- is_premium when the caller is the user (authenticated/anon). The existing
-- enforce_premium_server_only trigger still runs as a second layer.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_premium = (SELECT p.is_premium FROM public.profiles p WHERE p.id = auth.uid())
);