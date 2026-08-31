# ResoFit OS™ Ecosystem Intelligence Contract

## Purpose
`ecosystem.md` is the strategic contract for ChatB2K and the ResoFit Dominion Engine. It defines business capabilities, decision order and canonical ownership. Providers are adapters; ResoFit remains the business source of truth.

## Canonical production boundary
`EliteFitness101/reso-flex` is the primary application/core repository. `EliteFitness101/reso-dash` is a separate dashboard surface for member/partner/admin experience and telemetry. Neither surface replaces the canonical ResoFit/Supabase state layer.

The active production Supabase project is `resonance-fitness` (`vbqjvmnhdtdhmeeudqnn`). Its active `paystack-webhook` Edge Function is the canonical Paystack event ingress. The dashboard callback contract is `https://dashboard.resofit.fit/payment/callback`; route implementation must be verified separately from the webhook.

## Opportunity → Solution → Commerce → Fulfillment
NATIONAL/GLOBAL SIGNALS → SEARCH/CONTENT/PRODUCT/SERVICE GAPS → POPULAR REQUESTS → MARKET/COMPETITOR SIGNALS → CHATB2K INTELLIGENCE → OPPORTUNITY → SOLUTION → VERIFY → CANONICAL REGISTER → PAYMENT/BOOKING → ORDER → FULFILLMENT → DELIVERY/TRACKING → MEMBER EXPERIENCE → REPEAT/UPSELL/CROSS-SELL/REFERRAL → FEEDBACK.

## Paystack event authority
Paystack webhooks terminate at the canonical Supabase Edge Function `paystack-webhook`. The deployed function currently verifies the raw-body `x-paystack-signature` with HMAC-SHA-512, uses `public.payment_events` for idempotency, validates successful NGN charge amounts against the registered subscriber amount, updates payment/revenue state, and emits the canonical `payment.succeeded` event into `public.resofit_events`.

The canonical payment webhook does not depend on Make.com or n8n. Those systems remain replaceable external adapters for non-canonical automation and publishing tasks.

## Intelligence scope
- country → state → city → hub demand
- global trends and emerging problems
- search-demand and content gaps
- product/service/partner/API gaps
- competitor and market signals
- lead acquisition and conversion opportunities
- referral, repeat, retention, upsell and recommendation opportunities
- fulfillment and availability opportunities

## ChatB2K solution hierarchy
1. Exact existing ResoFit solution.
2. Existing canonical ecosystem product/service.
3. Verified partner or external API.
4. Generated solution that passes verification.
5. Externally sourced/fulfilled solution.
6. Best verified recommendation.
7. Payment/booking initialization when required.
8. Fulfillment and tracking.

Never invent availability, price, payment status, fulfillment status or provider capabilities.

## Content gap pipeline
SIGNAL → NORMALIZE → SCORE → OPPORTUNITY → BRIEF → GENERATE → BRAND/FACT CHECK → MEDIA VARIANTS → REGISTER → QUEUE → PUBLISH → MEASURE → OPTIMIZE.

## Source acquisition
Adapters may ingest public or explicitly authorized content and metadata from supported sources including web, TikTok, Twitch, BIGO, X and YouTube. Source-specific acquisition is isolated from canonical content. No adapter is allowed to bypass authentication, access controls or platform restrictions.

## Media
Cloudinary and ImageKit are replaceable media adapters. Semantic roles remain canonical: hero, details, gallery, thumbnail, OG, lifestyle and platform variants. The canonical visual root is dynamically resolved under `resofit/`.

## Commerce adapters
External commerce adapters expose normalized capabilities for product discovery, pricing, availability, checkout, order status, fulfillment and tracking. ChatB2K selects the solution; adapters execute.

## Model adapters
Gemini, OpenAI/ChatGPT and other approved providers are model adapters behind an Intelligence Router. Business state, canonical IDs, payments, orders and fulfillment remain in ResoFit/Supabase.

## Revenue lifecycle
VISITOR → LEAD → QUALIFIED → CUSTOMER → FIRST PURCHASE → FULFILLMENT → MEMBER → REPEAT → UPSELL → CROSS-SELL → REFERRAL → RETENTION.

## Canonical systems
- Catalog: `public.products` / canonical registry
- Content opportunities: `public.content_opportunities`
- Creative variants: `public.creative_variants`
- Events: `public.resofit_events`
- External adapter registry: `public.resofit_adapter_registry`
- Orders/fulfillment: `public.resofit_fulfillment_*`
- Payments: `public.payments`, `public.payment_events`, payment ledger tables
- Members: `public.resofit_member_states`, `public.resofit_dashboard_entitlements`
- Geo: `public.resofit_wellness_*`

## Production invariant
No generated content, product, service, route, payment or fulfillment state becomes customer-facing merely because an AI model produced it. Verification and canonical registration are mandatory before publication or transaction execution.
