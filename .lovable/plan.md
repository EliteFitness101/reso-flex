
# ResoFlex Revenue OS — Patch vNext

Extends the existing implementation. No changes to checkout UI, routes, Paystack integration, RLS model, or attribution model beyond what is listed.

---

## 1. Admin bootstrap (migration)

New migration adds:

- `public.bootstrap_first_admin()` — `SECURITY DEFINER`, fixed `search_path = public`, `LANGUAGE plpgsql`.
  - Requires `auth.uid() IS NOT NULL` (else raises).
  - Locks `user_roles` and returns early if any row with `role = 'admin'` exists (idempotent — returns `{status:'exists'}`).
  - Otherwise inserts `(auth.uid(), 'admin')` and writes an `audit_logs` row with `action='admin.bootstrap'`.
  - Returns `jsonb { status, user_id }`.
- `REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC;`
- `GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;`

Documented revocation (README section + comment on function): after first admin, run
`REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM authenticated;` or `DROP FUNCTION public.bootstrap_first_admin();`.

Frontend: extend existing `src/admin/AdminLogin.tsx` (or add a small "Claim admin" button on the denied state of `AdminGate`) that calls `supabase.rpc('bootstrap_first_admin')` and refreshes the gate. No public/unauthenticated surface.

---

## 2. Attribution QA harness (dev-only)

New file `src/dev/qa/AttributionQA.tsx` mounted only when `import.meta.env.DEV` AND URL has `?qa=1`. Route added conditionally in `App.tsx` at `/__qa/attribution` behind the same `DEV && ?qa=1` guard.

Runs checks against:
- `localStorage`/`sessionStorage` for RSID persistence.
- In-memory event log (subscribes to `logFunnel` via a small dev hook in `src/lib/funnelLog.ts` — behind `if (import.meta.env.DEV)`).
- Queries `funnel_events` for current `session_id` and validates:
  - required fields present per row,
  - canonical order of the 10 events (allows missing tail events, flags out-of-order),
  - duplicates by `(event_type, session_id)` for one-shot events.

Renders a passed/failed/duplicates/missing-fields/ordering report. Zero footprint in production bundle: file lazy-loaded only inside a `import.meta.env.DEV` guard.

---

## 3. Order Status timeline

Extend `verify-order` edge function response with a `timeline` array derived from verified DB state only:

```
[{ key, label, at }]
```

Keys emitted in this order when their evidence exists:
- `order_created` ← `orders.created_at`
- `checkout_started` ← latest `funnel_events` `checkout_started` for order
- `payment_submitted` ← latest `funnel_events` `payment_pending`
- `webhook_received` ← earliest `webhook_events.received_at` matching reference
- `signature_verified` ← `webhook_events.signature_valid = true`
- `payment_verified` ← `payments.status = 'success'`
- `order_marked_paid` ← `orders.paid_at`
- `referral_processed` ← `orders.referral_processed_at`
- `welcome_completed` ← `orders.welcome_sent_at`
- `ready_for_fulfillment` ← `orders.fulfillment_status = 'processing'`
- `fulfilled` ← `orders.fulfillment_status = 'fulfilled'`

`OrderStatusV2.tsx` renders a vertical timeline below existing rows using existing tokens/skeletons. Polling logic unchanged. Steps only show when `at` is present.

---

## 4. Native XLSX export

Add `xlsx` (SheetJS) dependency.

Rewrite `src/admin/exports.ts`:
- Keep `exportCsv` unchanged.
- Rewrite `exportXlsx(filename, rows, opts)` to build a real `.xlsx`:
  - Column config per sheet type (Orders, Payments, Resellers) — currency (`"₦"#,##0.00`), dates (`yyyy-mm-dd hh:mm`), auto-filter over header, frozen top row, auto-sized columns from max cell width.
  - Workbook props: `Title`, `Author = "ResoFlex Revenue OS"`, `CreatedDate`.
- Update `OrdersAdmin`, `PaymentsAdmin`, `ResellersAdmin` to expose both "CSV" and "XLSX" buttons using typed column configs.

---

## 5. Security validation

Audit script + short report (no code shipped, findings addressed in the same migration where needed):
- Run `supabase--linter` and `security--get_scan_results`.
- Confirm RLS enabled on every public table with sensitive data (fix if not).
- Ensure `process_paystack_success` is `REVOKE ALL ... FROM PUBLIC` + `GRANT EXECUTE ... TO service_role` only (add revoke/grant in migration if missing).
- Confirm `has_role` remains `SECURITY DEFINER` with fixed search_path (already the case).
- Confirm no `UPDATE`/`DELETE` policy exists on `audit_logs`.

Report included in final message.

---

## 6. Final validation

- `tsgo` typecheck.
- Production build via existing pipeline.
- Manual smoke: /order-status timeline renders, QA route 404s in prod build, XLSX downloads open in Excel.

---

## Deliverables

- 1 migration (bootstrap fn + any security revokes)
- Modified: `src/admin/exports.ts`, `src/pages/OrderStatusV2.tsx`, `supabase/functions/verify-order/index.ts`, `src/pages/admin/{OrdersAdmin,PaymentsAdmin,ResellersAdmin}.tsx`, `src/admin/AdminGate.tsx` (bootstrap CTA), `src/App.tsx` (dev-only QA route), `src/lib/funnelLog.ts` (dev subscriber), `package.json` (+ xlsx)
- Created: `src/dev/qa/AttributionQA.tsx`, `src/admin/exportColumns.ts`
- No changes to checkout, existing routes, Paystack webhook logic, or attribution capture.

Approve to proceed.
