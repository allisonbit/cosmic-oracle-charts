DROP POLICY IF EXISTS "Users can insert own follows" ON public.user_follows;
CREATE POLICY "Users can insert own follows" ON public.user_follows
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);