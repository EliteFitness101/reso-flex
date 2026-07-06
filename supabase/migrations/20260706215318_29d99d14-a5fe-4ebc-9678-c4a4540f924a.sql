
-- ============ ROLES ============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','staff','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "profiles self write" ON public.profiles;
CREATE POLICY "profiles self write" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles self insert" ON public.profiles;
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============ ORDERS EXTENSIONS ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS processing_lock_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS referral_processed_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS orders_reference_uidx ON public.orders(reference);

-- ============ RESELLER LEADS ============
CREATE TABLE IF NOT EXISTS public.reseller_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_name text,
  lead_email text,
  lead_phone text,
  campaign text,
  recruiter_id uuid REFERENCES auth.users(id),
  funnel_stage text NOT NULL DEFAULT 'new',
  conversion_status text NOT NULL DEFAULT 'pending',
  commission_status text NOT NULL DEFAULT 'none',
  contact_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  revenue_generated bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reseller_leads TO authenticated;
GRANT ALL ON public.reseller_leads TO service_role;
ALTER TABLE public.reseller_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read reseller leads" ON public.reseller_leads;
CREATE POLICY "admins read reseller leads" ON public.reseller_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR recruiter_id = auth.uid());
DROP POLICY IF EXISTS "admins manage reseller leads" ON public.reseller_leads;
CREATE POLICY "admins manage reseller leads" ON public.reseller_leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ REFERRALS ============
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES auth.users(id),
  recruiter_code text,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  commission_amount bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "referrals admin read" ON public.referrals;
CREATE POLICY "referrals admin read" ON public.referrals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR recruiter_id = auth.uid());
DROP POLICY IF EXISTS "referrals admin write" ON public.referrals;
CREATE POLICY "referrals admin write" ON public.referrals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CAMPAIGN EVENTS ============
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign text,
  event_type text NOT NULL,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  order_reference text,
  amount bigint,
  currency text DEFAULT 'NGN',
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaign_events TO authenticated;
GRANT ALL ON public.campaign_events TO service_role;
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaign events admin read" ON public.campaign_events;
CREATE POLICY "campaign events admin read" ON public.campaign_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ============ AUDIT LOGS ============
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  ip text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  result text NOT NULL DEFAULT 'ok',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit admin read" ON public.audit_logs;
CREATE POLICY "audit admin read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
-- No INSERT/UPDATE/DELETE policies → append-only via service_role only.

-- ============ FUNNEL EVENTS TIGHTEN ============
DROP POLICY IF EXISTS "anyone can insert funnel events" ON public.funnel_events;
CREATE POLICY "anon insert funnel events" ON public.funnel_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND length(session_id) BETWEEN 6 AND 128);

-- ============ TIMESTAMP TRIGGERS ============
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_reseller_leads_updated ON public.reseller_leads;
CREATE TRIGGER trg_reseller_leads_updated BEFORE UPDATE ON public.reseller_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ATOMIC PAYSTACK RPC ============
CREATE OR REPLACE FUNCTION public.process_paystack_success(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ref text := payload->>'reference';
  v_event_id text := payload->>'event_id';
  v_amount bigint := (payload->>'amount')::bigint;
  v_currency text := COALESCE(payload->>'currency','NGN');
  v_email text := payload->>'email';
  v_name text := payload->>'name';
  v_phone text := payload->>'phone';
  v_sku text := payload->>'sku';
  v_paid_at timestamptz := COALESCE((payload->>'paid_at')::timestamptz, now());
  v_attribution jsonb := COALESCE(payload->'attribution','{}'::jsonb);
  v_raw jsonb := COALESCE(payload->'raw','{}'::jsonb);
  v_recruiter_code text := v_attribution->>'rsid';
  v_order public.orders%ROWTYPE;
  v_is_new boolean := false;
BEGIN
  IF v_ref IS NULL THEN RAISE EXCEPTION 'missing reference'; END IF;

  -- Lock existing order row if present
  SELECT * INTO v_order FROM public.orders WHERE reference = v_ref FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.orders(reference, status, amount, currency, customer_email,
      customer_name, customer_phone, items, attribution, fulfillment_status, paid_at,
      processing_lock_at)
    VALUES (v_ref, 'paid', v_amount, v_currency, v_email, v_name, v_phone,
      CASE WHEN v_sku IS NOT NULL THEN jsonb_build_array(jsonb_build_object('sku',v_sku,'amount',v_amount,'currency',v_currency)) ELSE '[]'::jsonb END,
      v_attribution, 'processing', v_paid_at, now())
    RETURNING * INTO v_order;
    v_is_new := true;
  ELSE
    UPDATE public.orders SET
      status = 'paid',
      amount = COALESCE(v_amount, amount),
      currency = COALESCE(v_currency, currency),
      customer_email = COALESCE(v_email, customer_email),
      customer_name = COALESCE(v_name, customer_name),
      customer_phone = COALESCE(v_phone, customer_phone),
      attribution = CASE WHEN v_attribution <> '{}'::jsonb THEN v_attribution ELSE attribution END,
      fulfillment_status = CASE WHEN fulfillment_status = 'awaiting_payment' THEN 'processing' ELSE fulfillment_status END,
      paid_at = COALESCE(paid_at, v_paid_at),
      processing_lock_at = now(),
      updated_at = now()
    WHERE id = v_order.id
    RETURNING * INTO v_order;
  END IF;

  -- Payment row (unique-ish via event id)
  INSERT INTO public.payments(order_id, paystack_reference, paystack_event_id, amount, currency, status, raw)
  VALUES (v_order.id, v_ref, v_event_id, v_amount, v_currency, 'success', v_raw)
  ON CONFLICT DO NOTHING;

  -- Referral (once per order)
  IF v_recruiter_code IS NOT NULL THEN
    INSERT INTO public.referrals(recruiter_code, order_id, commission_amount, status)
    VALUES (v_recruiter_code, v_order.id, GREATEST(0, (v_amount*10)/100), 'pending')
    ON CONFLICT (order_id) DO NOTHING;
    UPDATE public.orders SET referral_processed_at = COALESCE(referral_processed_at, now())
      WHERE id = v_order.id;
  END IF;

  -- Campaign event
  INSERT INTO public.campaign_events(campaign, event_type, utm_source, utm_medium, utm_campaign,
    utm_content, utm_term, order_reference, amount, currency, props)
  VALUES (v_attribution->>'campaign','payment_success',
    v_attribution->>'utm_source', v_attribution->>'utm_medium', v_attribution->>'utm_campaign',
    v_attribution->>'utm_content', v_attribution->>'utm_term', v_ref, v_amount, v_currency,
    jsonb_build_object('sku', v_sku));

  -- Audit
  INSERT INTO public.audit_logs(actor_id, action, resource_type, resource_id, result, meta)
  VALUES (NULL, 'paystack.charge.success', 'order', v_order.id::text, 'ok',
    jsonb_build_object('reference', v_ref, 'event_id', v_event_id, 'amount', v_amount, 'new', v_is_new));

  -- Welcome flag once
  UPDATE public.orders SET welcome_sent_at = COALESCE(welcome_sent_at, now())
    WHERE id = v_order.id AND welcome_sent_at IS NULL;

  RETURN jsonb_build_object(
    'order_id', v_order.id,
    'reference', v_order.reference,
    'access_token', v_order.access_token,
    'new', v_is_new
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_paystack_success(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_paystack_success(jsonb) TO service_role;
