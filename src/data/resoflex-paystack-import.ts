import { PAYSTACK_RESOFLEX_SOURCE } from './paystack-resoflex-source';

export const RESOFLEX_PAYSTACK_PRODUCT_PAGES = PAYSTACK_RESOFLEX_SOURCE.products.map(([title, priceNgn]) => ({
  title,
  priceNgn,
  slug: title.toLowerCase().replace(/™/g, '').replace(/₦/g, 'ngn-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  source: PAYSTACK_RESOFLEX_SOURCE.source,
  currency: 'NGN' as const,
  status: 'live-source' as const,
}));

export const RESOFLEX_PAYSTACK_PRODUCT_PAGE_COUNT = RESOFLEX_PAYSTACK_PRODUCT_PAGES.length;
