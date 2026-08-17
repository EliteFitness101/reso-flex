# P4 Advanced Plan — `shop.resofit.fit`

## Role
This repository represents the primary ResoFlex shop experience. Production currently runs from a separate GitLab `reso-flex` source in Vercel project `reso-flex`; this GitHub repository is therefore a parity/source artifact until the deployment source is explicitly reconciled.

## Canonical source
`catalog.resofit.fit` is authoritative for SKU, handle, price, inventory, lifecycle, delivery type, bundles, collections, assets and recommendations. The local `src/data/products.ts` is legacy presentation data and must not be treated as production truth.

## Commerce graph
ResoFit → ChatB2K → exact canonical SKU/offer → commerce context → checkout → Paystack → verified webhook → fulfillment → member/status → Resend/WhatsApp → upsell/cross-sell.

## Security
Never trust a browser amount. Resolve SKU and amount server-side. Persist pending order before checkout. Verify reference/amount/currency server-side. Fulfillment is webhook/ledger driven.

## Currency
Use canonical country routing. Nigeria defaults to NGN/Paystack/Lagos. Unsupported routes fail closed rather than silently changing customer price.

## Domain invariant
`shop.resofit.fit` and `store.resofit.fit` remain separate. No DNS or Vercel source switch is included in this plan.
