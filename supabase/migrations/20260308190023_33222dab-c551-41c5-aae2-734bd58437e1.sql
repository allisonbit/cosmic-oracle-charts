-- Enable pg_cron and pg_net for scheduled alert checking
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Allow the check-alerts function to join profiles for email
-- Need a service-role SELECT policy on user_alerts for the edge function
-- (already exists via service role)