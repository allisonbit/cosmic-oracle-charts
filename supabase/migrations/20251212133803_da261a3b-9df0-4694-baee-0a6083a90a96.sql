-- Fix RLS policies for all telegram tables to restrict to service role only

-- telegram_conversations
DROP POLICY IF EXISTS "Allow all operations on telegram_conversations" ON telegram_conversations;
CREATE POLICY "Service role only access" 
ON telegram_conversations 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- telegram_groups
DROP POLICY IF EXISTS "Allow all operations on telegram_groups" ON telegram_groups;
CREATE POLICY "Service role only access" 
ON telegram_groups 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- telegram_alerts
DROP POLICY IF EXISTS "Allow all operations on telegram_alerts" ON telegram_alerts;
CREATE POLICY "Service role only access" 
ON telegram_alerts 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- telegram_bot_usage
DROP POLICY IF EXISTS "Allow all operations on telegram_bot_usage" ON telegram_bot_usage;
CREATE POLICY "Service role only access" 
ON telegram_bot_usage 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- telegram_polls
DROP POLICY IF EXISTS "Allow all operations on telegram_polls" ON telegram_polls;
CREATE POLICY "Service role only access" 
ON telegram_polls 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- telegram_pinned
DROP POLICY IF EXISTS "Allow all operations on telegram_pinned" ON telegram_pinned;
CREATE POLICY "Service role only access" 
ON telegram_pinned 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);