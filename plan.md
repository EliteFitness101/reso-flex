# ResoFit OS™ Production Ecosystem Plan

## Role
This repository is the production application core for the ResoFit ecosystem and Dominion Engine. `ecosystem.md` is the strategic intelligence contract; `Dominion.md` is the execution architecture. Canonical business state remains in ResoFit/Supabase.

## Current production ownership
- Primary application core: `EliteFitness101/reso-flex`, branch `main`.
- Administrative/member/partner dashboard: `EliteFitness101/reso-dash` (separate surface; not the canonical commerce/intelligence source of truth).
- Canonical Supabase project: `resonance-fitness` (`vbqjvmnhdtdhmeeudqnn`, eu-west-1).
- Active canonical Paystack webhook: `https://vbqjvmnhdtdhmeeudqnn.supabase.co/functions/v1/paystack-webhook`.
- Dashboard callback contract: `https://dashboard.resofit.fit/payment/callback`.

## Media delivery contract
Cloudinary is the visual/publishing delivery layer. Publishing videos use `resofit/buffer/videos/`; no `/blob/` subfolder. Originals remain immutable. Delivery transformations are dynamic and responsive.

The primary ResoFit hero now consumes the supplied Cloudinary brand-film public ID through a dynamic `f_auto,q_auto` delivery URL with a generated poster. This is intentionally separate from the 270 ImageKit product assets and 38 Paystack products.

## Catalog search contract
The global navigation now exposes a mobile-first catalog search control. Search events are dispatched through the application and consumed by the canonical product grid, matching product name, tagline, SKU, handle and feature text without creating a second catalog source.

## Verified Paystack webhook contract
The live Supabase Edge Function `paystack-webhook` is ACTIVE at version 27 with JWT verification disabled because Paystack signs webhook requests rather than sending a user JWT. The deployed function verifies `x-paystack-signature` using HMAC-SHA-512 over the raw request body and performs constant-time comparison.

After signature verification it:
1. Parses the Paystack event and extracts `data.reference`.
2. Uses `public.payment_events` keyed by `paystack_ref` for idempotent processing.
3. Handles `charge.success` only when the subscriber exists, Paystack status is `success`, currency is NGN, and the received kobo amount exactly matches the expected whole-NGN amount.
4. Updates `public.resoflex_subscribers` payment state.
5. Upserts `public.payments`.
6. Upserts `public.revenue_events`.
7. Emits canonical `payment.succeeded` into `public.resofit_events` with an idempotency key and attribution fields.
8. Handles the existing upsell path when Paystack metadata identifies an upsell.
9. Marks the payment event processed.

The webhook explicitly does **not** forward canonical payment processing to Make.com or n8n. External automation remains an optional adapter.

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
- Payments: `public.payments`, `public.payment_events`, payment/webhook/settlement ledgers
- Fulfillment: `public.resofit_fulfillment_*`
- Geo: `public.resofit_wellness_states`, cities, hubs, services, availability
- Members: `public.resofit_member_states`, dashboard entitlements, preferences, chat memory/sessions

## Production gates
Build → typecheck/lint → API smoke → database health → catalog integrity → content opportunity generation → canonical registration dry-run → payment/webhook verification → callback-route verification → fulfillment verification → security/advisory audit → deployment runtime audit → visual CDN verification → global search verification.

## Non-negotiable invariants
Server-side prices only. Secrets server-side only. Signed payment events. Idempotent events. RLS on exposed data. Authorized source acquisition only. Provider failures cannot overwrite canonical business state. Unknown identifiers fail closed. Make/n8n cannot become the canonical payment or business-state processor. Cloudinary originals are never destructively transformed.

## Evidence rule
Architecture claims may describe intended design; production certification must be supported by current live evidence. A configured URL is not equivalent to a verified route, and an implementation is not equivalent to a verified deployment.
