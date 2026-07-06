
# ResoFlex Revenue OS Production Patch vNext

Extends the existing Supabase-backed architecture (orders, payments, webhook_events, funnel_events, paystack-webhook, verify-order, WhatsApp report). No UI redesign, no checkout-flow changes, no route removals. Existing `/order/:reference` stays; a new `/order-status/:orderId` route is added per spec and internally reuses the verified polling logic.

---

## 1. Database changes (single migration)

New tables (all with GRANTs + RLS + `has_role` gating via a new `user_roles` table):

- `app_role` enum: `admin`, `staff`, `user`
- `user_roles(user_id, role)` + `has_role(uuid, app_role)` security-definer fn
- `reseller_leads` — lead, campaign, recruiter, stage, status, commission_status, revenue_generated
- `referrals` — recruiter_id, order_id, commission_amount, status (unique on order_id → prevents duplicate commissions)
- `campaign_events` — normalized campaign/UTM rollup source
- `audit_logs` — actor, ip, action, resource_type, resource_id, result, meta (append-only, no UPDATE/DELETE policies)
- `profiles` — display_name, phone (linked to auth.users)

Order table extensions:
- `orders.processing_lock_at timestamptz` (advisory lock timestamp)
- `orders.welcome_sent_at`, `orders.referral_processed_at` (idempotency flags for side-effects)

All public tables: explicit `GRANT`s; `service_role` full access; `authenticated` scoped by `has_role` or ownership; `anon` denied except where already public (funnel_events insert stays).

## 2. RLS audit & fixes

Review every existing policy; replace any `USING (true)` / `WITH CHECK (true)` on mutating operations. Concretely:

- `funnel_events` — keep `anon INSERT` (tracking) but tighten to `check: session_id IS NOT NULL`; block anon SELECT/UPDATE/DELETE (already the case).
- `orders`, `payments`, `webhook_events` — no client policies; access only via edge functions using service_role.
- New tables — admin-only via `has_role(auth.uid(),'admin')`; user-owned reads where relevant.
- `audit_logs` — INSERT via service_role only; SELECT admin only; no UPDATE/DELETE policies.

Every changed policy documented inline in the migration description.

## 3. Edge functions

- `paystack-webhook` — refactored into a single Postgres RPC `process_paystack_success(payload jsonb)` that runs in one transaction: acquires row lock on `orders` by reference, upserts order, inserts payment, inserts referral (ON CONFLICT DO NOTHING), inserts audit log, flips `welcome_sent_at`. HMAC + Paystack verify stay in the function; RPC handles atomicity + idempotency. Duplicate event_id → 200 no-op.
- `verify-order` — extended to accept either `reference` or `orderId` (uuid). Backs the new page.
- `admin-metrics` (new) — JWT-gated (`has_role admin`); returns dashboard aggregates with a date range.
- `admin-export` (new) — CSV/XLSX export for orders, payments, campaigns.
- `retry-verification` (new) — admin action; re-verifies a reference against Paystack and re-runs the RPC.

## 4. Frontend routes & components

New routes (all lazy-loaded):

```text
/order-status/:orderId        → OrderStatusV2 (polling, skeletons, states)
/admin                        → AdminLayout (nav shell, role-gated)
  /admin (index)              → RevenueDashboard
  /admin/orders               → OrdersAdmin
  /admin/payments             → PaymentsAdmin
  /admin/resellers            → ResellersAdmin
  /admin/whatsapp             → existing WhatsAppReport (extended)
```

Shared:
- `src/admin/AdminGate.tsx` — checks `has_role('admin')` via RPC; redirects otherwise
- `src/admin/useRange.ts` — Today / Yesterday / 7d / 30d / custom
- `src/admin/cards/*` — Revenue, AOV, Conversion, etc.
- `src/admin/exports.ts` — CSV + XLSX (SheetJS) helpers

Attribution pipeline (extends `src/lib/track.ts` + `funnelLog.ts`):
- Enrich every event with device, browser, referrer, landing_page, all UTMs, RSID, order_id, sku, user_id, ts
- Add missing event names to the whitelist: `landing_page_view`, `assessment_completed`, `payment_pending`, `welcome_completed`, `upsell_accepted`, `referral_joined`
- Emit `landing_page_view` from `Index.tsx` mount

## 5. UI rules

- No changes to Hero, ProductGrid, BundleGrid, CheckoutModal, UpsellPrompt, WelcomeOnboarding
- All admin pages mobile-first, use existing tokens (`bg-noir-*`, `text-gold`, `border-border/*`)
- Skeletons for loading states
- Lazy-load every admin route via `React.lazy`

## 6. Validation

- `tsgo` typecheck clean
- Production build passes
- Manual smoke: `/order-status/:id` polls & terminal-states, admin gate blocks non-admin, funnel events land in DB

---

## Technical notes

- Idempotency guarantees:
  - Webhook: `webhook_events(provider,event_id)` unique + RPC row-lock on `orders.reference`
  - Referral: `referrals(order_id)` unique
  - Welcome: `orders.welcome_sent_at IS NULL` guard inside RPC
- Admin auth: existing `ADMIN_DASHBOARD_TOKEN` retained for the current WhatsApp report; new pages use Supabase auth + `has_role`. First admin bootstrapped via a seeded `user_roles` row (documented in migration).
- Export: `xlsx` (SheetJS) added as dep.
- No changes to `src/integrations/supabase/client.ts` or auto-generated types beyond what the migration produces.

## Deliverables checklist

Files created (~25), files modified (~8), 1 migration, 3 new edge functions, 5 new routes, RLS tightened on 6 tables, attribution enriched with 12 fields, 13 dashboard cards, CSV+XLSX export, audit log table.

Approve to proceed with implementation in this order: migration → edge functions → admin shell + gate → dashboard → orders/payments/resellers → WhatsApp extension → order-status v2 → attribution enrichment → typecheck/build.
