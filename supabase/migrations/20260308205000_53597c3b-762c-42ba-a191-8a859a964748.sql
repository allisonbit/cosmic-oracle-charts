-- Fix content_drafts: restrict to service_role only
DROP POLICY IF EXISTS "Public read drafts" ON public.content_drafts;
DROP POLICY IF EXISTS "Service manage drafts" ON public.content_drafts;

CREATE POLICY "Service role manages drafts"
  ON public.content_drafts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Fix blog_articles write policy (same open pattern)
DROP POLICY IF EXISTS "Service role can manage articles" ON public.blog_articles;

CREATE POLICY "Service role manages articles"
  ON public.blog_articles FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);