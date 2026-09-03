import type { Product } from "@/data/products";
import { searchLiveProducts } from "@/lib/liveCatalog";

export type CommerceIntent =
  | "discover"
  | "compare"
  | "buy"
  | "digital"
  | "physical"
  | "bundle"
  | "student"
  | "corporate"
  | "membership"
  | "refill"
  | "delivery"
  | "support";

export type CommerceContext = {
  query: string;
  countryCode?: string;
  city?: string;
  budget?: number;
  fulfillment?: "digital" | "physical" | "hybrid";
  audience?: "women" | "men" | "unisex" | "students" | "corporate";
};

export type CommerceOffer = {
  product: Product;
  source: "resoflex-first-party";
  sourceAuthority: "first_party";
  checkout: "paystack-or-product-route";
  proximity: number;
  intentScore: number;
  verified: boolean;
};

const rules: Array<[CommerceIntent, RegExp]> = [
  ["membership", /member|subscription|join|priv[eé]|club/i],
  ["delivery", /deliver|shipping|track|where is my|order status/i],
  ["refill", /refill|reorder|again|restock|replenish/i],
  ["corporate", /corporate|office|employee|workplace|company|enterprise|team/i],
  ["student", /student|campus|school|university|young professional/i],
  ["bundle", /bundle|kit|package|duo|complete system/i],
  ["digital", /digital|ebook|course|program|download|meal plan|coaching/i],
  ["physical", /apparel|equipment|supplement|product|machine|wear|physical/i],
  ["compare", /compare|versus|vs\.?|difference|better|cheaper/i],
  ["buy", /buy|purchase|order|get|pay|checkout|need/i],
  ["support", /help|problem|issue|refund|return|cancel/i],
];

export function classifyCommerceIntent(query: string): CommerceIntent {
  for (const [intent, pattern] of rules) if (pattern.test(query)) return intent;
  return "discover";
}

function text(p: Product) { return `${p.name} ${p.tagline} ${p.sku}`.toLowerCase(); }

function score(p: Product, ctx: CommerceContext, intent: CommerceIntent) {
  const haystack = text(p);
  let value = 0;
  if (ctx.budget && p.now <= ctx.budget) value += 20;
  if (ctx.fulfillment === "digital" && /digital|program|course|ebook|download|coaching/i.test(haystack)) value += 30;
  if (ctx.fulfillment === "physical" && !/digital|program|course|ebook|download|coaching/i.test(haystack)) value += 20;
  if (ctx.audience === "men" && /men|male|him/i.test(haystack)) value += 25;
  if (ctx.audience === "women" && /women|woman|female|her|curvy/i.test(haystack)) value += 25;
  if (ctx.audience === "students" && /student|campus|starter/i.test(haystack)) value += 25;
  if (ctx.audience === "corporate" && /corporate|office|employee|team|enterprise/i.test(haystack)) value += 25;
  if (intent === "bundle" && /bundle|kit|package|duo|complete/i.test(haystack)) value += 30;
  if (intent === "digital" && /digital|program|course|ebook|download|coaching/i.test(haystack)) value += 30;
  if (intent === "physical" && !/digital|program|course|ebook|download|coaching/i.test(haystack)) value += 15;
  if (intent === "membership" && /membership|club|priv/i.test(haystack)) value += 30;
  return value;
}

export async function resolveCommerceOffers(ctx: CommerceContext): Promise<CommerceOffer[]> {
  const intent = classifyCommerceIntent(ctx.query);
  const products = await searchLiveProducts(ctx.query, 100);
  return products
    .map(product => ({
      product,
      source: "resoflex-first-party" as const,
      sourceAuthority: "first_party" as const,
      checkout: "paystack-or-product-route" as const,
      proximity: ctx.countryCode?.toUpperCase() === "NG" ? 100 : 50,
      intentScore: score(product, ctx, intent),
      verified: true,
    }))
    .sort((a, b) => (b.proximity + b.intentScore) - (a.proximity + a.intentScore))
    .slice(0, 12);
}

export async function buildCommerceAnswer(ctx: CommerceContext) {
  const intent = classifyCommerceIntent(ctx.query);
  const offers = await resolveCommerceOffers(ctx);
  return { intent, offers, sourcePolicy: "Only verified first-party offers are eligible until an external source adapter is explicitly connected and verified." };
}
