
-- Trade Journal table
CREATE TABLE public.trade_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  trade_type TEXT NOT NULL DEFAULT 'buy',
  entry_price NUMERIC NOT NULL DEFAULT 0,
  exit_price NUMERIC,
  quantity NUMERIC NOT NULL DEFAULT 0,
  fees NUMERIC DEFAULT 0,
  pnl NUMERIC,
  pnl_percent NUMERIC,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open',
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own trades" ON public.trade_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trade_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trade_journal FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trade_journal FOR DELETE USING (auth.uid() = user_id);

-- DCA Plans table
CREATE TABLE public.dca_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  amount_per_buy NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  total_invested NUMERIC NOT NULL DEFAULT 0,
  total_units NUMERIC NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC NOT NULL DEFAULT 0,
  next_buy_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dca_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own plans" ON public.dca_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.dca_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.dca_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.dca_plans FOR DELETE USING (auth.uid() = user_id);

-- DCA Entries table (individual buys within a plan)
CREATE TABLE public.dca_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.dca_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  price_at_buy NUMERIC NOT NULL DEFAULT 0,
  units_bought NUMERIC NOT NULL DEFAULT 0,
  bought_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dca_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entries" ON public.dca_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.dca_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.dca_entries FOR DELETE USING (auth.uid() = user_id);

-- Add profiles read policy for social features (allow reading other profiles)
CREATE POLICY "Anyone can read profiles for social" ON public.profiles FOR SELECT USING (true);
