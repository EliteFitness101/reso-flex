-- Security hardening: lock down SECURITY DEFINER functions to least privilege.

-- Payment processing: service_role only (called from paystack-webhook edge fn).
REVOKE ALL ON FUNCTION public.process_paystack_success(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_paystack_success(jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.process_paystack_success(jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_paystack_success(jsonb) TO service_role;

-- Trigger helper: only the trigger executor (table owner) needs it.
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM authenticated;

-- Admin bootstrap: keep callable by authenticated users so a signed-in admin
-- can claim the first role, but block anon. The function is internally
-- idempotent and no-ops once any admin exists.
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

-- has_role must stay callable by authenticated (referenced by RLS policies
-- executed under the caller's role). No change needed, asserted here.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;