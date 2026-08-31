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
