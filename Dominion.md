# ResoFlex Dominion Engine™

**Host:** Vercel  
**Model layer:** Gemini / OpenAI / other approved model adapters  
**Business state:** ResoFit canonical services and Supabase

## Domains
`/api/dominion` · `/api/intelligence` · `/api/content` · `/api/media` · `/api/commerce` · `/api/external` · `/api/payments` · `/api/fulfillment` · `/api/geo` · `/api/communications` · `/api/members` · `/api/growth`

## Current implemented control points
- `api/dominion/health.ts`
- `api/intelligence/opportunities.ts`
- `api/content/ingest.ts`
- `api/content/generate.ts`
- `api/commerce/resolve.ts`
- `api/external/registry.ts`
- `src/lib/dominion.ts`
- `src/lib/dominionServer.ts`
- `scripts/register.ts`

## Canonical payment ingress
The current live Paystack webhook is the Supabase Edge Function:
`https://vbqjvmnhdtdhmeeudqnn.supabase.co/functions/v1/paystack-webhook`

The deployed function is active at version 27. It is intentionally configured without JWT verification and authenticates Paystack using the raw request body plus `x-paystack-signature` HMAC-SHA-512. It uses `public.payment_events` keyed by `paystack_ref` for idempotency and writes canonical payment/revenue/event state to Supabase.

For successful charges, the function requires a matching registered `resoflex_subscribers` record, `data.status = success`, `data.currency = NGN`, and an exact kobo-to-NGN amount match before updating subscriber/payment/revenue state. It emits `payment.succeeded` to `public.resofit_events` with correlation and attribution data. The canonical payment path contains no Make.com or n8n forwarding.

## Payment callback contract
`https://dashboard.resofit.fit/payment/callback` is the recorded customer return/callback URL. It is distinct from the Paystack webhook. The webhook is independently verified at the Supabase Edge Function; the dashboard callback route requires frontend/deployment route verification before being certified as implemented.

## Provider boundary
Source acquisition, media, publishing, payments, communication and external commerce providers are adapters. They do not own canonical business state.

## Authorized acquisition
Source adapters accept public metadata or content the account/operator is authorized to process. Replay/highlight/moment extraction operates on owned or authorized media and provider-supported VOD/media URLs.

## Autonomous loop
Signal → opportunity → solution hierarchy → content/product/service generation → verification → canonical registration → publication/checkout → fulfillment → measurement → optimization.

## Production controls
- server-side credentials only
- no browser-trusted prices
- no provider credentials in content payloads
- idempotent canonical events
- RLS-protected canonical tables
- generated output defaults to draft until verified
- provider failure must not corrupt canonical business state
- external automation adapters cannot become the canonical state machine
