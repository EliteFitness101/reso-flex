// ResoFlex Store Upsells — canonical 38-product Paystack storefront metadata.
// Source: https://paystack.shop/resoflex
// The storefront metadata is the source of truth for titles and prices.
// Checkout URLs preserve the requested rsid + referrer format.

import { PAYSTACK_RESOFLEX_SOURCE } from "@/data/paystack-resoflex-source";

export type BundleCategory = "meal" | "supplement" | "training";

export type Bundle = {
  id: string;
  sku: string;
  category: BundleCategory;
  name: string;
  tagline: string;
  now: number;
  was?: number;
  priceLabel: string;
  features: string[];
  paystackUrl: string;
  popular?: boolean;
  icon: string;
};

const NGN = (n: number) =>
  "NGN " + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/™/g, "")
    .replace(/₦/g, "ngn-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const checkoutUrl = (slug: string) =>
  `https://paystack.shop/pay/${slug}?rsid=08c53b223ff148b19a9d&referrer=https%3A%2F%2Fshop.resofit.fit%2F`;

export const BUNDLES: Bundle[] = PAYSTACK_RESOFLEX_SOURCE.products.map(([title, priceNgn]) => {
  const slug = slugify(title);
  return {
    id: slug,
    sku: `PAYSTACK-${slug.toUpperCase().replace(/-/g, "_")}`,
    category: "training",
    name: title,
    tagline: "ResoFlex™ Paystack storefront offer.",
    now: priceNgn,
    priceLabel: NGN(priceNgn),
    features: ["Live ResoFlex storefront product", "Paystack checkout", "NGN pricing"],
    paystackUrl: checkoutUrl(slug),
    icon: "fa-dumbbell",
  };
});

export const getBundlesByCategory = (cat: BundleCategory) =>
  BUNDLES.filter((b) => b.category === cat);

export const suggestBundlesFor = (_productSku: string): Bundle[] => BUNDLES;
