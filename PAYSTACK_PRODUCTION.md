# ResoFit™ Paystack Production Verification

**Verification basis:** live Supabase project metadata + deployed Edge Function source + `reso-flex` main-branch architecture documents.

## Canonical backend

Supabase project: `resonance-fitness`  
Project ref: `vbqjvmnhdtdhmeeudqnn`  
Region: `eu-west-1`  
Status: `ACTIVE_HEALTHY`

## Canonical webhook

`POST https://vbqjvmnhdtdhmeeudqnn.supabase.co/functions/v1/paystack-webhook`

Live function:
- slug: `paystack-webhook`
- status: `ACTIVE`
- version: `27`
- JWT verification: disabled intentionally for Paystack webhook ingress

### Verified source behavior

1. Reads the raw request body.
2. Reads `x-paystack-signature`.
3. Computes HMAC-SHA-512 using the server-side `PAYSTACK_SECRET_KEY`.
4. Uses constant-time signature comparison.
5. Parses the Paystack event only after signature validation.
6. Extracts `data.reference` as the payment idempotency identifier.
7. Checks `public.payment_events` by `paystack_ref`.
8. Upserts the event with `signature_verified = true`.
9. For `charge.success`, verifies the subscriber, success status, NGN currency, and exact amount match.
10. Updates `public.resoflex_subscribers` payment state.
11. Upserts `public.payments`.
12. Upserts `public.revenue_events`.
13. Emits canonical `payment.succeeded` into `public.resofit_events` with idempotency, correlation, RSID, funnel and UTM information.
14. Processes the existing upsell metadata path.
15. Marks the payment event processed.
16. Does not forward canonical payment processing to Make.com or n8n.

## Supporting live database evidence

The production Supabase schema currently contains the state required by the webhook and downstream architecture, including:

- `public.payment_events`
- `public.payments`
- `public.revenue_events`
- `public.resoflex_subscribers`
- `public.resofit_events`
- `public.payment_logs`
- `public.payment_event_processing`
- `public.payment_webhook_logs`
- `public.payment_event_queue`
- `public.resofit_fulfillment_orders`
- `public.resofit_fulfillment_items`
- `public.resofit_fulfillment_events`
- `public.resofit_dashboard_entitlements`
- `public.resofit_member_states`

These tables are RLS-enabled in the current production schema.

## Paystack initialization

The same production Supabase project has an ACTIVE `paystack-init` Edge Function at version 24. The initialization function and webhook are therefore co-located in the canonical `resonance-fitness` project.

## Dashboard callback

Recorded customer return URL:

`https://dashboard.resofit.fit/payment/callback`

This is a **callback/return surface**, not the Paystack webhook. The live webhook is independently verified above. The callback URL has not been marked as code-verified in this document because the current `reso-flex` repository route search did not establish a matching route implementation.

## Repository relationship

`EliteFitness101/reso-flex` is the current production application/core repository and branch `main` is its default branch. Its canonical planning documents explicitly place payment, fulfillment, intelligence and external providers behind the ResoFit/Supabase business-state boundary.

`EliteFitness101/reso-dash` remains the separate dashboard surface. It must consume canonical entitlement/payment state rather than becoming a second payment source of truth.

## Dependency policy

Make.com and n8n may remain connected as replaceable adapters for automation/publishing. They are not part of the canonical Paystack payment state machine and must not be required for payment verification, revenue recording, order state or member entitlement.

## Certification

**PAYSTACK WEBHOOK BACKEND: VERIFIED LIVE**  
**PAYSTACK INITIALIZATION FUNCTION: VERIFIED LIVE**  
**SUPABASE PAYMENT/REVENUE STATE: VERIFIED LIVE**  
**DASHBOARD CALLBACK URL: RECORDED / FRONTEND ROUTE VERIFICATION REQUIRED**  
**REAL-MONEY END-TO-END TRANSACTION: NOT CLAIMED FROM THIS DOCUMENT ALONE**

## Evidence rule
A deployed function is not the same as a completed real-money transaction. Final transaction certification requires a controlled live/test transaction and correlation across Paystack reference → webhook event → payment → revenue → order/fulfillment → dashboard entitlement/value delivery.
