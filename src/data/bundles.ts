// ResoFlex Store Upsells — canonical Paystack storefront destinations.
// Exact product selectors supplied from the live ResoFlex Paystack storefront.
// Do not derive /pay slugs from product names.

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

const TRACKING = "&rsid=08c53b223ff148b19a9d&referrer=https%3A%2F%2Fshop.resofit.fit%2F";

const PAYSTACK_PRODUCT_URLS = [
  "https://paystack.shop/resoflex?product=2in1-arm-shaper-sweat-arm-band-plus-free-mealworkout--hfqkfe",
  "https://paystack.shop/resoflex?product=pouch-waist-bag-and-fitness-purse-bmurcp",
  "https://paystack.shop/resoflex?product=90-day-resofit",
  "https://paystack.shop/resoflex?product=pearlzie-gym-fitness-drinking-sport-water-bottle-kett-kkadxp",
  "https://paystack.shop/resoflex?product=ladies-fitness-long-casual-trousers---taupe-rjdvur",
  "https://paystack.shop/resoflex?product=resoflex-fitness-hand-grip-npxbqu",
  "https://paystack.shop/resoflex?product=25-steel-boned-latex-shaper-whtfvh",
  "https://paystack.shop/resoflex?product=the-resoflex-ascension-bundle-fgrcoy",
  "https://paystack.shop/resoflex?product=resoflex-lovers-platform-sovereign-flagship-allocatio-wsdunc",
  "https://paystack.shop/resoflex?product=premium-quality-military-knuckle-gym-gloves-plus-90-d-mgpjhu",
  "https://paystack.shop/resoflex?product=personalized",
  "https://paystack.shop/resoflex?product=heritage-meals-the-achua-system-zkaqtb",
  "https://paystack.shop/resoflex?product=naijafit-enhanced-wellness-blueprint",
  "https://paystack.shop/resoflex?product=naijafit_tier1",
  "https://paystack.shop/resoflex?product=tummy-trimmer-fitness-exerciser-yyhzqn",
  "https://paystack.shop/resoflex?product=resoflex-gym-station",
  "https://paystack.shop/resoflex?product=resistance-bands-set-100-lbs-tube-bands-11-piece-set-sfukve",
  "https://paystack.shop/resoflex?product=resoflex-creatine-gummies",
  "https://paystack.shop/resoflex?product=gym-half-finger-sports-fitness-wrist-glove---1-pair-mweamf",
  "https://paystack.shop/resoflex?product=resoflex-wellness-bottle",
  "https://paystack.shop/resoflex?product=sports-pressurized-elastic-knee-pads-support-fitness--gmltxp",
  "https://paystack.shop/resoflex?product=91ft-adjustable-jump-rope-fitness-skipping-rope-soft--kffukr",
  "https://paystack.shop/resoflex?product=6-pack-smart-fitness-mobile-gym---single-abdominal-re-nikfzr",
  "https://paystack.shop/resoflex?product=smart-fitness-foot-stimulator-massager-plus-free-anti-prkhpx",
  "https://paystack.shop/resoflex?product=fitness-exercise-sport-wrist-band-plus-free-meal-plan-mybigf",
  "https://paystack.shop/resoflex?product=fitness-exercise-sport-wrist-band---free-bodybuilding-ivhhnh",
  "https://paystack.shop/resoflex?product=unisex-fitness-belt",
  "https://paystack.shop/resoflex?product=full-whatsapp-marketing-takeover-unmrhh",
  "https://paystack.shop/resoflex?product=repost-on-partner-influencer-networks-sgtiyg",
  "https://paystack.shop/resoflex?product=broadcast-message--status-combo-blast-pblltb",
  "https://paystack.shop/resoflex?product=monthly-ads-package-klhcjt",
  "https://paystack.shop/resoflex?product=weekly-ads-package-lmfszt",
  "",
  "https://paystack.shop/resoflex?product=back-massager",
  "https://paystack.shop/resoflex?product=single-status-advert-cflbzk",
  "https://paystack.shop/resoflex?product=abdominal-wheeler",
  "https://paystack.shop/resoflex?product=abdominal-wheel4",
  "https://paystack.shop/resoflex?product=jump-rope",
] as const;

const checkoutUrl = (base: string) => (base ? `${base}${TRACKING}` : "");

export const BUNDLES: Bundle[] = PAYSTACK_RESOFLEX_SOURCE.products.map(([title, priceNgn], index) => {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    id,
    sku: `PAYSTACK-${id.toUpperCase().replace(/-/g, "_")}`,
    category: "training",
    name: title,
    tagline: "ResoFlex™ Paystack storefront offer.",
    now: priceNgn,
    priceLabel: NGN(priceNgn),
    features: ["Live ResoFlex storefront product", "Paystack checkout", "NGN pricing"],
    paystackUrl: checkoutUrl(PAYSTACK_PRODUCT_URLS[index] ?? ""),
    icon: "fa-dumbbell",
  };
});

export const getBundlesByCategory = (cat: BundleCategory) => BUNDLES.filter((b) => b.category === cat);
export const suggestBundlesFor = (_productSku: string): Bundle[] => BUNDLES;
