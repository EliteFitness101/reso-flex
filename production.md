# P4 Production Runbook — `shop.resofit.fit`

## Current deployment source
Vercel project `reso-flex` is currently connected to the GitLab repository `resonancefitness101/reso-flex`, main branch. This is a critical deployment-topology fact and must be reconciled before GitHub-only changes can be called production.

## Gates
1. Canonical catalog lookup works.
2. Exact ChatB2K recommendation reaches an active product route.
3. Country/currency context is canonical.
4. Checkout amount is server-resolved.
5. Paystack reference/amount/currency verify.
6. Webhook updates ledger and triggers fulfillment once.
7. Member/status and notification paths persist.
8. `shop.resofit.fit` remains separate from `store.resofit.fit`.

## Do not do
Do not switch the Vercel Git source, DNS, domains, or Lovable workflow as part of this parity PR.
