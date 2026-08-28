# ResoFit Production Integration Contract — `resofit.fit` → `shop.resofit.fit`

## Primary dependencies
- `resofit.fit` — main ecosystem entry
- `shop.resofit.fit` — primary commerce storefront
- canonical Supabase — product/order/payment/fulfillment ledger
- ImageKit — canonical product media delivery
- Paystack — primary Nigeria payment provider
- ChatB2K — recommendation/intention layer

## Product identity
Every recommendation and product page resolves to the same canonical SKU/handle. Product URLs are dynamic; no product-specific hardcoded routes are permitted.

## Primary payment path
Customer → dynamic ResoFit product page → Paystack → Supabase order/payment ledger → webhook verification → fulfillment/status.

## Shopify
Shopify remains a secondary/fallback commerce integration only. It must not be required for primary catalog discovery, product routing, checkout, payment, or fulfillment.

## Tracking
Paystack ResoFlex destinations preserve the production attribution parameters:
`rsid=08c53b223ff148b19a9d`
`referrer=https%3A%2F%2Fshop.resofit.fit%2F`

Never fabricate Paystack product handles from product names.
