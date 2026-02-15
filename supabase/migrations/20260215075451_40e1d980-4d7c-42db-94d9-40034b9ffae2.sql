
-- Content drafts table for staging content before publishing
CREATE TABLE public.content_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  category TEXT NOT NULL DEFAULT 'insights',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  agent_type TEXT NOT NULL DEFAULT 'content',
  ai_model TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read drafts" ON public.content_drafts FOR SELECT USING (true);
CREATE POLICY "Service manage drafts" ON public.content_drafts FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_content_drafts_updated_at
  BEFORE UPDATE ON public.content_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Automation logs table
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read logs" ON public.automation_logs FOR SELECT USING (true);
CREATE POLICY "Service manage logs" ON public.automation_logs FOR ALL USING (true) WITH CHECK (true);

-- Performance metrics table
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2),
  avg_time_on_page INTEGER,
  source TEXT DEFAULT 'analytics',
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_path, recorded_at)
);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read metrics" ON public.performance_metrics FOR SELECT USING (true);
CREATE POLICY "Service manage metrics" ON public.performance_metrics FOR ALL USING (true) WITH CHECK (true);

-- Index for performance queries
CREATE INDEX idx_automation_logs_created ON public.automation_logs(created_at DESC);
CREATE INDEX idx_automation_logs_agent ON public.automation_logs(agent_type);
CREATE INDEX idx_content_drafts_status ON public.content_drafts(status);
CREATE INDEX idx_performance_metrics_path ON public.performance_metrics(page_path, recorded_at DESC);
