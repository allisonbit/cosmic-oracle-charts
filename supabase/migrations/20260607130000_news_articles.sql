-- ════════════════════════════════════════════════════════════════════════════
-- News aggregation — persist real, searchable, crawlable crypto news.
--
-- The news feed previously lived only in the browser (fetched client-side and
-- handed between pages via router state). That meant a direct visit OR a Google
-- crawl of /news/<slug> rendered "Article not found": zero indexable content,
-- nothing searchable, nothing saved.
--
-- News now lives in the SAME `blog_articles` table the Learn/Insights pipeline
-- already uses (source = 'news'), so the existing public-read RLS policy,
-- sitemap generator and slug routing all apply for free. These columns are the
-- news-only extras (nullable so existing 'learn'/'insights' rows are untouched).
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS external_url TEXT,            -- backlink to the original source article
  ADD COLUMN IF NOT EXISTS source_name  TEXT,            -- e.g. "CoinDesk", "Cointelegraph"
  ADD COLUMN IF NOT EXISTS source_icon  TEXT,            -- source favicon/logo url
  ADD COLUMN IF NOT EXISTS sentiment    TEXT,            -- 'bullish' | 'bearish' | 'neutral'
  ADD COLUMN IF NOT EXISTS coins        JSONB DEFAULT '[]'::jsonb;  -- [{ id, name, symbol }]

-- News is queried by recency within the 'news' source, and searched by title.
CREATE INDEX IF NOT EXISTS idx_blog_articles_source_published
  ON public.blog_articles (source, published_at DESC);

-- Case-insensitive title search for the on-site news search box.
CREATE INDEX IF NOT EXISTS idx_blog_articles_title_lower
  ON public.blog_articles (lower(title));

-- Verify:  SELECT source, count(*) FROM public.blog_articles GROUP BY source;
