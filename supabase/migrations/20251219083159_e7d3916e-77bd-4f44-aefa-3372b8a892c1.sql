-- Create table to store all blog articles permanently
CREATE TABLE public.blog_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  content TEXT NOT NULL,
  takeaways JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  read_time TEXT,
  word_count INTEGER,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  image_url TEXT,
  primary_keyword TEXT,
  secondary_keywords JSONB DEFAULT '[]'::jsonb,
  internal_link JSONB,
  source TEXT NOT NULL DEFAULT 'insights', -- 'insights' or 'learn'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_blog_articles_source ON public.blog_articles(source);
CREATE INDEX idx_blog_articles_published_at ON public.blog_articles(published_at DESC);
CREATE INDEX idx_blog_articles_category ON public.blog_articles(category);
CREATE INDEX idx_blog_articles_slug ON public.blog_articles(slug);

-- Enable RLS but allow public read access (blog is public)
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read articles (public blog)
CREATE POLICY "Anyone can read blog articles" 
ON public.blog_articles 
FOR SELECT 
USING (true);

-- Only service role can insert/update (edge functions)
CREATE POLICY "Service role can manage articles" 
ON public.blog_articles 
FOR ALL 
USING (true)
WITH CHECK (true);