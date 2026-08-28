import { PAYSTACK_RESOFLEX_CATALOG } from './paystack-resoflex-catalog';

export type ResoFlexPaystackPage = {
  title: string;
  priceNgn: number;
  slug: string;
  source: string;
  currency: 'NGN';
  images: string[];
  checkoutUrl: string;
};

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/™/g, '')
    .replace(/₦/g, 'ngn-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const RESOFLEX_PAYSTACK_PAGES: ResoFlexPaystackPage[] = PAYSTACK_RESOFLEX_CATALOG.map(
  (item) => {
    const slug = slugify(item.title);
    return {
      ...item,
      slug,
      source: 'https://paystack.shop/resoflex',
      currency: 'NGN',
      images: item.images,
      checkoutUrl: `https://paystack.shop/resoflex?product=${encodeURIComponent(slug)}`,
    };
  },
);

export const getResoFlexPaystackPage = (slug: string) =>
  RESOFLEX_PAYSTACK_PAGES.find((item) => item.slug === slug);
