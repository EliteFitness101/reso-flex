
-- =========================================
-- ORDERS
-- =========================================
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','refunded')),
  amount BIGINT NOT NULL DEFAULT 0,          -- kobo
  currency TEXT NOT NULL DEFAULT 'NGN',
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  attribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  fulfillment_status TEXT NOT NULL DEFAULT 'awaiting_payment',
  next_steps TEXT,
  download_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  coach_contact TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX orders_created_at_idx ON public.orders(created_at DESC);

GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (edge functions) reaches this table.

-- =========================================
-- PAYMENTS (audit trail of paystack activity)
-- =========================================
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  paystack_reference TEXT NOT NULL,
  paystack_event_id TEXT,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON public.payments(order_id);

GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =========================================
-- WEBHOOK EVENTS (idempotency ledger)
-- =========================================
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'paystack',
  event_id TEXT NOT NULL,       -- paystack event id OR deterministic hash
  event_type TEXT NOT NULL,
  reference TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);
CREATE INDEX webhook_events_ref_idx ON public.webhook_events(reference);

GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- =========================================
-- FUNNEL EVENTS (whatsapp + conversion journey)
-- =========================================
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,     -- whatsapp_click, assessment_started, checkout_started, payment_success, product_view, bundle_view
  session_id TEXT,
  rsid TEXT,
  funnel_origin TEXT,
  campaign TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  order_reference TEXT,
  amount BIGINT,
  currency TEXT,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX funnel_events_type_idx ON public.funnel_events(event_type);
CREATE INDEX funnel_events_created_at_idx ON public.funnel_events(created_at DESC);
CREATE INDEX funnel_events_session_idx ON public.funnel_events(session_id);
CREATE INDEX funnel_events_rsid_idx ON public.funnel_events(rsid);

GRANT ALL ON public.funnel_events TO service_role;
-- Allow anonymous inserts (client-side journey tracking); no reads.
GRANT INSERT ON public.funnel_events TO anon, authenticated;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert funnel events"
  ON public.funnel_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =========================================
-- updated_at trigger for orders
-- =========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
