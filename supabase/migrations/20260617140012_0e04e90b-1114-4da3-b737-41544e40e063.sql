-- Trigger-only SECURITY DEFINER functions should not be callable from the
-- Data API. Triggers invoke them via the table owner regardless of caller
-- EXECUTE rights, so revoking these is safe.
REVOKE EXECUTE ON FUNCTION public.enforce_premium_server_only() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()     FROM PUBLIC, anon, authenticated;

-- has_role() is intentionally callable by authenticated users because RLS
-- policies invoke it from the caller's session. Restrict anon and PUBLIC.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- cleanup_expired_predictions() is a cron/maintenance helper. Restrict it.
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_predictions() FROM PUBLIC, anon, authenticated;
