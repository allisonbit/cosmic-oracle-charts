
CREATE TABLE public.digest_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_sent_at timestamptz
);

GRANT INSERT ON public.digest_subscribers TO anon, authenticated;
GRANT SELECT, UPDATE ON public.digest_subscribers TO authenticated;
GRANT ALL ON public.digest_subscribers TO service_role;

ALTER TABLE public.digest_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (INSERT), nobody can read the list from the client
CREATE POLICY "anyone can subscribe" ON public.digest_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only allow unsubscribe by knowing the token (public-facing edge fn handles it via service_role)
CREATE POLICY "no direct reads" ON public.digest_subscribers
  FOR SELECT TO authenticated
  USING (false);
