
-- ============ REFERENCE / GEO ============
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  fulfillment_hub text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.regions TO anon, authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regions public read" ON public.regions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "regions admin write" ON public.regions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 text NOT NULL UNIQUE,
  name text NOT NULL,
  region_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
  default_currency text NOT NULL DEFAULT 'NGN',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.countries TO anon, authenticated;
GRANT ALL ON public.countries TO service_role;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "countries public read" ON public.countries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "countries admin write" ON public.countries FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  supports_currencies text[] NOT NULL DEFAULT '{}',
  priority int NOT NULL DEFAULT 100,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_gateways TO anon, authenticated;
GRANT ALL ON public.payment_gateways TO service_role;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gateways public read active" ON public.payment_gateways FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "gateways admin write" ON public.payment_gateways FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.currency_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_iso2 text NOT NULL UNIQUE,
  region_code text,
  currency text NOT NULL,
  gateway_code text NOT NULL,
  fulfillment_hub text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.currency_routes TO anon, authenticated;
GRANT ALL ON public.currency_routes TO service_role;
ALTER TABLE public.currency_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "currency routes public read" ON public.currency_routes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "currency routes admin write" ON public.currency_routes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PAYMENT LEDGER ============
CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_code text NOT NULL,
  event_type text NOT NULL,
  external_event_id text,
  reference text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount bigint,
  currency text DEFAULT 'NGN',
  signature_valid boolean,
  status text NOT NULL DEFAULT 'received',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_events TO service_role;
GRANT SELECT ON public.payment_events TO authenticated;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment events admin read" ON public.payment_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.payment_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  gateway_code text NOT NULL,
  reference text,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_idempotency TO service_role;
ALTER TABLE public.payment_idempotency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "idempotency admin read" ON public.payment_idempotency FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  amount bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'issued',
  issued_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.invoices TO service_role;
GRANT SELECT ON public.invoices TO authenticated;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices admin read" ON public.invoices FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ RBAC PERMISSIONS ============
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions read" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "permissions admin write" ON public.permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_code text NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission_code)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role permissions read" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "role permissions admin write" ON public.role_permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission_code = _permission
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon;

-- ============ CATALOG EXTENSION ============
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  seo_title text,
  meta_description text,
  og_image text,
  sort_order int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections public read" ON public.collections FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "collections admin write" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_sku text NOT NULL,
  variant_sku text NOT NULL UNIQUE,
  title text NOT NULL,
  price bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  inventory_qty int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants public read" ON public.product_variants FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "variants admin write" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.product_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_sku text NOT NULL,
  variant_sku text,
  asset_type text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  alt_text text,
  sort_order int NOT NULL DEFAULT 100,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_assets TO anon, authenticated;
GRANT ALL ON public.product_assets TO service_role;
ALTER TABLE public.product_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets public read" ON public.product_assets FOR SELECT TO anon, authenticated USING (is_public);
CREATE POLICY "assets admin all" ON public.product_assets FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.inventory_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_sku text NOT NULL,
  change_qty int NOT NULL,
  reason text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.inventory_ledger TO authenticated;
GRANT ALL ON public.inventory_ledger TO service_role;
ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory admin read" ON public.inventory_ledger FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "inventory admin write" ON public.inventory_ledger FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CHATB2K ============
CREATE TABLE public.chatb2k_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  rsid text,
  campaign text,
  funnel_origin text,
  order_reference text,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.chatb2k_events TO anon, authenticated;
GRANT SELECT ON public.chatb2k_events TO authenticated;
GRANT ALL ON public.chatb2k_events TO service_role;
ALTER TABLE public.chatb2k_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chatb2k insert" ON public.chatb2k_events FOR INSERT TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND length(session_id) BETWEEN 6 AND 128);
CREATE POLICY "chatb2k admin read" ON public.chatb2k_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.recommendation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  goal text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_products jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence_score numeric NOT NULL DEFAULT 0,
  upsell_score numeric NOT NULL DEFAULT 0,
  engine_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.recommendation_results TO anon, authenticated;
GRANT SELECT ON public.recommendation_results TO authenticated;
GRANT ALL ON public.recommendation_results TO service_role;
ALTER TABLE public.recommendation_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reco insert" ON public.recommendation_results FOR INSERT TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND length(session_id) BETWEEN 6 AND 128
    AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "reco read own or admin" ON public.recommendation_results FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============ TRIGGERS ============
CREATE TRIGGER trg_regions_updated BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_countries_updated BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_gateways_updated BEFORE UPDATE ON public.payment_gateways FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_routes_updated BEFORE UPDATE ON public.currency_routes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_collections_updated BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_passets_updated BEFORE UPDATE ON public.product_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SEED ============
INSERT INTO public.permissions(code, description) VALUES
  ('catalog.manage','Create and edit products, variants, collections'),
  ('inventory.manage','Adjust stock and inventory ledger'),
  ('payments.read','Read payment ledger and gateway events'),
  ('orders.manage','View and update orders'),
  ('fulfillment.manage','Update fulfillment status'),
  ('customers.read','Read customer profiles and leads'),
  ('audit.read','Read audit logs and compliance surfaces')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.role_permissions(role, permission_code)
SELECT 'admin'::public.app_role, code FROM public.permissions
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions(role, permission_code) VALUES
  ('staff','orders.manage'),('staff','fulfillment.manage'),
  ('staff','customers.read'),('staff','inventory.manage')
ON CONFLICT DO NOTHING;

INSERT INTO public.regions(code, name, fulfillment_hub) VALUES
  ('WAF','West Africa','Lagos'),
  ('NAM','North America','Toronto'),
  ('UKI','United Kingdom & Ireland','London'),
  ('EUR','European Union','Amsterdam')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.countries(iso2, name, region_id, default_currency)
SELECT v.iso2, v.name, r.id, v.cur FROM (VALUES
  ('NG','Nigeria','WAF','NGN'),
  ('US','United States','NAM','USD'),
  ('CA','Canada','NAM','CAD'),
  ('GB','United Kingdom','UKI','GBP'),
  ('IE','Ireland','EUR','EUR'),
  ('DE','Germany','EUR','EUR'),
  ('FR','France','EUR','EUR')
) AS v(iso2,name,rcode,cur)
LEFT JOIN public.regions r ON r.code = v.rcode
ON CONFLICT (iso2) DO NOTHING;

INSERT INTO public.payment_gateways(code, display_name, is_active, supports_currencies, priority) VALUES
  ('paystack','Paystack', true, ARRAY['NGN','GHS','ZAR','USD'], 10),
  ('flutterwave','Flutterwave', false, ARRAY['NGN','USD','GBP','EUR'], 20),
  ('stripe','Stripe', false, ARRAY['USD','CAD','GBP','EUR'], 30),
  ('paypal','PayPal', false, ARRAY['USD','GBP','EUR','CAD'], 40),
  ('crypto','Crypto', false, ARRAY['USDT','USDC'], 90)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.currency_routes(country_iso2, region_code, currency, gateway_code, fulfillment_hub) VALUES
  ('NG','WAF','NGN','paystack','Lagos'),
  ('US','NAM','USD','stripe','Toronto'),
  ('CA','NAM','CAD','stripe','Toronto'),
  ('GB','UKI','GBP','stripe','London'),
  ('IE','EUR','EUR','stripe','Amsterdam'),
  ('DE','EUR','EUR','stripe','Amsterdam'),
  ('FR','EUR','EUR','stripe','Amsterdam')
ON CONFLICT (country_iso2) DO NOTHING;
