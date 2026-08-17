# P4 Integration Contract — `shop.resofit.fit`

## Canonical dependencies
- `catalog.resofit.fit` — product/SKU/value source of truth
- `resofit.fit` — main ecosystem and member entry
- `chatb2k.resofit.fit` — intent/recommendation intelligence
- canonical Supabase — identity/order/payment/fulfillment ledger
- Paystack — active Nigeria payment provider

## Persistence
Carry safe member/anonymous ID, attribution, funnel origin, intent, recommended SKU, return route and transaction reference across boundaries. Never carry service credentials or secrets in URLs.

## Product routing
A ChatB2K recommendation resolves to an exact canonical SKU/handle. Product page and checkout must use that same identity. Generic shop-home fallback is only for discovery when no exact recommendation exists.

## Payment
Client submits SKU/quantity/customer details. Server resolves price from catalog, creates pending order, initializes Paystack and verifies payment. Signed webhook/ledger is authoritative for paid and fulfilled state.

## Store separation
`shop.resofit.fit` and `store.resofit.fit` share infrastructure contracts but remain separate domains and deployments.
