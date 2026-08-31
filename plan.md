# ResoFit OS™ Production Ecosystem Plan

## Role
This repository is the production source for Vercel project `reso-flex`. `ecosystem.md` is the strategic intelligence contract; `Dominion.md` is the execution architecture. Canonical business state remains in ResoFit/Supabase.

## Core loop
NATIONAL → GLOBAL SIGNALS → SEARCH/CONTENT/PRODUCT/SERVICE GAPS → POPULAR REQUESTS → COMPETITOR/MARKET SIGNALS → CHATB2K INTELLIGENCE → OPPORTUNITY → SOLUTION → VERIFY → REGISTER → PAYMENT/ORDER/BOOKING → FULFILLMENT → DELIVERY/TRACKING → MEMBER EXPERIENCE → REFERRAL/REPEAT/UPSELL/CROSS-SELL → FEEDBACK.

## Solution hierarchy
1. Existing ResoFit solution
2. Existing canonical ecosystem solution
3. Verified partner/external API
4. Generated solution
5. External source/fulfillment
6. Best verified recommendation
7. Payment/booking initialization
8. Fulfillment/tracking

## Content Intelligence OS
`/api/content/ingest` normalizes authorized/public source content. `/api/intelligence/opportunities` scores demand signals and persists qualified opportunities. `/api/content/generate` creates platform variants from a normalized opportunity. All generated content defaults to draft until verification.

## Source adapters
TikTok, Twitch, BIGO, X, YouTube and web acquisition must be isolated adapters. They may use public metadata or authenticated/authorized account access. Owned/authorized livestream/VOD media can feed transcription, segmentation, highlights, moments, clips, captions and thumbnails. Provider-specific acquisition never becomes the canonical content source of truth.

## Commerce
`/api/commerce/resolve` searches the canonical product catalog and applies the solution hierarchy. External providers are represented through `/api/external/registry` and future normalized adapters for search, pricing, availability, checkout, orders, fulfillment and tracking.

## Canonical registration
`scripts/register.ts` performs idempotent registration against `public.resofit_canonical_entities`. No AI-generated entity becomes active customer-facing commerce merely because generation succeeded.

## Model layer
Gemini, OpenAI/ChatGPT and other approved providers are model adapters behind ChatB2K. No provider owns customer, product, payment, order or fulfillment state.

## Existing platform services
- Catalog: `public.products`, canonical entity/route registries
- Content: `public.content_opportunities`, `public.creative_variants`, `public.content_queue`, `public.content_logs`
- Events: `public.resofit_events`, adapter registry/outbox
- Commerce: products, canonical routes, economics
- Payments: payments, payment events, webhook/processing/settlement ledgers
- Fulfillment: `public.resofit_fulfillment_*`, hub inventory
- Geo: `public.resofit_wellness_states`, cities, hubs, services, availability
- Members: member states, preferences, chat memory/sessions

## Production gates
Build → typecheck/lint → API smoke → database health → catalog integrity → content opportunity generation → canonical registration dry-run → payment/webhook verification → fulfillment verification → security/advisory audit → deployment runtime audit.

## Non-negotiable invariants
Server-side prices only. Secrets server-side only. Signed payment events. Idempotent events. RLS on exposed data. Authorized source acquisition only. Provider failures cannot overwrite canonical business state. Unknown identifiers fail closed.
