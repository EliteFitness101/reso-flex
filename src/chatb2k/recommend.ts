// ============================================================
// CHATB2K™ PRODUCT PERSONALIZATION
// Scores the full catalog against goal + experience + collection
// signals and returns explainable recommendations.
// ============================================================

import {
  getCatalog,
  getCollectionSkus,
  type CatalogProduct,
} from "@/core/commerce/catalog.engine";

export type Goal = "fat_loss" | "muscle_building" | "strength" | "mobility" | "longevity";
export type Experience = "beginner" | "intermediate" | "advanced";

export type Recommendation = {
  product: CatalogProduct;
  reason: string;
  goalMatch: boolean;
  collectionMatch: boolean;
  score: number;
};

/** Keyword heuristics used when a product has no explicit goal tags. */
const GOAL_KEYWORDS: Record<Goal, RegExp> = {
  fat_loss: /(treadmill|walking pad|cardio|hiit|spin|fat|slim|burn|meal)/i,
  muscle_building: /(glute|curve|sculpt|hypertroph|muscle|band|dumbbell|protein)/i,
  strength: /(strength|power|rack|barbell|weight|kettlebell|elite)/i,
  mobility: /(mobility|stretch|yoga|recovery|roller|flex)/i,
  longevity: /(wellness|longevity|health|walk|daily|coach|membership)/i,
};

const EXPERIENCE_KEYWORDS: Record<Experience, RegExp> = {
  beginner: /(starter|core|beginner|entry|essential)/i,
  intermediate: /(pro|intermediate|core)/i,
  advanced: /(elite|advanced|flagship|signature|vip|commercial)/i,
};

const GOAL_COLLECTIONS: Record<Goal, string[]> = {
  fat_loss: ["HOME_GYM_ESSENTIALS", "MEAL_PLANS", "DIGITAL_PROGRAMS"],
  muscle_building: ["CURVY_COLLECTION", "COACH_BUCHI_SIGNATURE", "GYM_ACCESSORIES"],
  strength: ["COMMERCIAL_LUXE", "COMBAT_TRAINING", "PERFORMANCE_ACTIVEWEAR"],
  mobility: ["PERFORMANCE_ACTIVEWEAR", "GYM_ACCESSORIES"],
  longevity: ["MEMBERSHIPS", "CORPORATE_WELLNESS", "DIGITAL_PROGRAMS"],
};

function textOf(p: CatalogProduct) {
  return [p.name, p.tagline, p.description, p.category, p.sku].filter(Boolean).join(" ");
}

export function scoreProduct(
  p: CatalogProduct,
  input: { goal?: Goal; experience?: Experience; collectionSkus?: Set<string> },
): Recommendation {
  const { goal, experience, collectionSkus } = input;
  const text = textOf(p);
  let score = 0;
  const reasons: string[] = [];

  const goalMatch = !!goal && (p.goals.includes(goal) || GOAL_KEYWORDS[goal].test(text));
  if (goalMatch) {
    score += p.goals.includes(goal!) ? 50 : 32;
    reasons.push(`matches your ${goal!.replace("_", " ")} goal`);
  }

  if (experience) {
    const tagged = p.experience_levels.includes(experience);
    if (tagged || EXPERIENCE_KEYWORDS[experience].test(text)) {
      score += tagged ? 25 : 15;
      reasons.push(`suited to ${experience} level`);
    }
  }

  const collectionMatch = !!collectionSkus?.has(p.sku);
  if (collectionMatch) {
    score += 20;
    reasons.push("part of a collection curated for this goal");
  }

  score += Math.min(p.recommendation_priority, 15);
  if (p.digital_product) score += 3; // instant delivery converts faster

  return {
    product: p,
    reason: reasons.length ? `Recommended because it ${reasons.join(", ")}.` : "Popular ResoFlex pick.",
    goalMatch,
    collectionMatch,
    score: Math.round(Math.min(score, 100)),
  };
}

export async function recommendProducts(input: {
  goal?: Goal;
  experience?: Experience;
  limit?: number;
}): Promise<Recommendation[]> {
  const { goal, experience, limit = 3 } = input;

  const [catalog, collectionSkuLists] = await Promise.all([
    getCatalog(),
    goal
      ? Promise.all(GOAL_COLLECTIONS[goal].map((c) => getCollectionSkus(c)))
      : Promise.resolve([] as string[][]),
  ]);

  const collectionSkus = new Set(collectionSkuLists.flat());

  return catalog
    .filter((p) => p.chatb2k_enabled && p.status === "published")
    .map((p) => scoreProduct(p, { goal, experience, collectionSkus }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
