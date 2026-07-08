
-- Bootstrap first admin: idempotent, safe, requires auth
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  -- Lock the table so concurrent calls can't both succeed
  LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;

  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO v_exists;

  IF v_exists THEN
    -- If caller is already admin, idempotent success
    IF EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = v_uid) THEN
      RETURN jsonb_build_object('status','already_admin','user_id', v_uid);
    END IF;
    RETURN jsonb_build_object('status','admin_exists','user_id', v_uid);
  END IF;

  INSERT INTO public.user_roles(user_id, role) VALUES (v_uid, 'admin')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.audit_logs(actor_id, action, resource_type, resource_id, result, meta)
  VALUES (v_uid, 'admin.bootstrap', 'user_roles', v_uid::text, 'ok',
          jsonb_build_object('bootstrap', true));

  RETURN jsonb_build_object('status','bootstrapped','user_id', v_uid);
END;
$$;

COMMENT ON FUNCTION public.bootstrap_first_admin() IS
'One-time bootstrap. After first admin is created, revoke with:
 REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM authenticated;
 or DROP FUNCTION public.bootstrap_first_admin();';

REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

-- Security hardening: ensure process_paystack_success is service_role only
REVOKE ALL ON FUNCTION public.process_paystack_success(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_paystack_success(jsonb) FROM authenticated;
REVOKE ALL ON FUNCTION public.process_paystack_success(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_paystack_success(jsonb) TO service_role;
