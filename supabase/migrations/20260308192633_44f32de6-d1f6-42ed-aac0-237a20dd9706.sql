
-- Portfolio holdings for P&L tracking
CREATE TABLE public.portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coin_id text NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL DEFAULT '',
  quantity numeric NOT NULL DEFAULT 0,
  buy_price numeric NOT NULL DEFAULT 0,
  bought_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own holdings" ON public.portfolio_holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own holdings" ON public.portfolio_holdings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own holdings" ON public.portfolio_holdings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own holdings" ON public.portfolio_holdings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User predictions for social leaderboard
CREATE TABLE public.user_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coin_id text NOT NULL,
  symbol text NOT NULL,
  prediction_type text NOT NULL DEFAULT 'bullish',
  target_price numeric NOT NULL,
  timeframe text NOT NULL DEFAULT '24h',
  entry_price numeric NOT NULL DEFAULT 0,
  reasoning text,
  is_resolved boolean NOT NULL DEFAULT false,
  was_correct boolean,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read predictions" ON public.user_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own predictions" ON public.user_predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON public.user_predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own predictions" ON public.user_predictions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User follows for social features
CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows" ON public.user_follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own follows" ON public.user_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON public.user_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Enable realtime for social features
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_predictions;
