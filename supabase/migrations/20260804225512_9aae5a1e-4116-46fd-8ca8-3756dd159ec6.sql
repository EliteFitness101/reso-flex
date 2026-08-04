-- 1. Extend role enum (new values usable only via text comparison in this txn)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'catalog_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operations_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_admin';

-- 2. Role helpers (text-based to stay transaction safe)
CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_catalog(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','super_admin','catalog_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_content(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','super_admin','catalog_admin','content_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_operations(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','super_admin','operations_admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role_text(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;

-- 3. PRODUCTS catalog table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  handle text,
  name text NOT NULL,
  tagline text,
  description text,
  category text,
  price_ngn bigint NOT NULL DEFAULT 0,
  bulk_price_ngn bigint,
  bulk_threshold integer,
  currency text NOT NULL DEFAULT 'NGN',
  hero_image_asset text,
  sub_assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  digital_product boolean NOT NULL DEFAULT false,
  requires_shipping boolean NOT NULL DEFAULT true,
  chatb2k_enabled boolean NOT NULL DEFAULT true,
  recommendation_priority integer NOT NULL DEFAULT 0,
  goals text[] NOT NULL DEFAULT '{}',
  experience_levels text[] NOT NULL DEFAULT '{}',
  seo_title text,
  meta_description text,
  open_graph_image text,
  checkout_url text,
  shopify_product_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published products are public"
  ON public.products FOR SELECT USING (status = 'published' OR public.can_manage_catalog(auth.uid()));
CREATE POLICY "Catalog admins insert products"
  ON public.products FOR INSERT TO authenticated WITH CHECK (public.can_manage_catalog(auth.uid()));
CREATE POLICY "Catalog and content admins update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE POLICY "Super admins delete products"
  ON public.products FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. COLLECTIONS extension
ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS collection_code text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS parent_collection text,
  ADD COLUMN IF NOT EXISTS hero_banner text,
  ADD COLUMN IF NOT EXISTS thumbnail_image text,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS shopify_collection_id text,
  ADD COLUMN IF NOT EXISTS chatb2k_priority integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured_products text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS landing_page_slug text;

UPDATE public.collections SET collection_code = upper(replace(slug,'-','_')) WHERE collection_code IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS collections_code_key ON public.collections(collection_code);

-- 5. VARIANTS extension
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS size text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS stock_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_key ON public.product_variants(variant_sku);

-- 6. ASSETS extension
ALTER TABLE public.product_assets
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS relative_path text,
  ADD COLUMN IF NOT EXISTS cdn_url text,
  ADD COLUMN IF NOT EXISTS width integer,
  ADD COLUMN IF NOT EXISTS height integer,
  ADD COLUMN IF NOT EXISTS format text,
  ADD COLUMN IF NOT EXISTS file_size_kb integer,
  ADD COLUMN IF NOT EXISTS is_hero boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS open_graph_asset boolean NOT NULL DEFAULT false;

-- 7. PRODUCT ↔ COLLECTION mapping
CREATE TABLE IF NOT EXISTS public.product_collection_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_sku text NOT NULL,
  collection_code text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_sku, collection_code)
);

GRANT SELECT ON public.product_collection_mappings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_collection_mappings TO authenticated;
GRANT ALL ON public.product_collection_mappings TO service_role;
ALTER TABLE public.product_collection_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mappings are public" ON public.product_collection_mappings FOR SELECT USING (true);
CREATE POLICY "Catalog admins manage mappings" ON public.product_collection_mappings FOR ALL TO authenticated
  USING (public.can_manage_catalog(auth.uid())) WITH CHECK (public.can_manage_catalog(auth.uid()));

-- 8. Catalog sync audit
CREATE TABLE IF NOT EXISTS public.catalog_sync_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  source text NOT NULL,
  entity text NOT NULL,
  action text NOT NULL,
  rows_processed integer NOT NULL DEFAULT 0,
  rows_failed integer NOT NULL DEFAULT 0,
  result text NOT NULL DEFAULT 'ok',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.catalog_sync_audit TO authenticated;
GRANT ALL ON public.catalog_sync_audit TO service_role;
ALTER TABLE public.catalog_sync_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read catalog audit" ON public.catalog_sync_audit FOR SELECT TO authenticated
  USING (public.can_manage_catalog(auth.uid()));
CREATE POLICY "Catalog admins write audit" ON public.catalog_sync_audit FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_catalog(auth.uid()));

-- 9. Operations role can manage inventory ledger
CREATE POLICY "Operations admins manage inventory ledger" ON public.inventory_ledger FOR ALL TO authenticated
  USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()));