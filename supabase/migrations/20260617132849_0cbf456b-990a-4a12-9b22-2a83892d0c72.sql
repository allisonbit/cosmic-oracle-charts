-- Tighten user_predictions SELECT to owner-only
DROP POLICY IF EXISTS "Anyone can read predictions" ON public.user_predictions;
CREATE POLICY "Users can read own predictions"
  ON public.user_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Tighten user_follows SELECT to participants only
DROP POLICY IF EXISTS "Anyone can read follows" ON public.user_follows;
CREATE POLICY "Users can read own follow relationships"
  ON public.user_follows FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);