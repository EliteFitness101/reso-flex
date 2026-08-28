# ResoFit Production Revenue Runbook — `resofit.fit` → `shop.resofit.fit`

## Primary production path
`resofit.fit` → `shop.resofit.fit` → canonical catalog/SKU → dynamic product route → ImageKit → Paystack → Supabase order/payment/fulfillment ledger.

## Source and deployment
- GitHub source: `EliteFitness101/reso-flex`, `main`
- Vercel project: `reso-flex`
- Primary storefront: `shop.resofit.fit`
- Main ecosystem: `resofit.fit`
- Payment provider: Paystack
- Catalog/order/payment ledger: canonical Supabase project
- Image delivery: ImageKit

## Routing rules
1. Product pages use `/product/:slug` or `/products/:slug` dynamically.
2. The identifier resolver accepts canonical handle/slug, product ID, or SKU.
3. No product-specific hardcoded routes are permitted.
4. No Reset-specific route, price, or payment exception is permitted.
5. Unknown identifiers render the normal product-not-found experience.

## Commerce rules
1. Paystack is the primary customer payment destination.
2. Checkout pricing is resolved from the canonical product identity/server-side payment initialization.
3. Signed Paystack webhook/ledger state is authoritative for paid/fulfilled status.
4. Shopify is secondary/fallback only and is not part of the primary ResoFit revenue path.
5. No Shopify dependency is required for product discovery, routing, or primary checkout.

## Production gates
1. Dynamic product route resolves by slug and SKU.
2. ImageKit verified assets load.
3. Paystack destination resolves without legacy `/pay/...` guessing.
4. Pending order is created before payment initialization.
5. Paystack verification/webhook updates the payment ledger exactly once.
6. Fulfillment/status/notification paths persist after successful payment.
