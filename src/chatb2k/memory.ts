// ============================================================
// CHATB2K COMMERCE MEMORY — extends the existing engine.
// Persists assessment / journey events and recommendation
// results. Never blocks the UI, never throws.
// ============================================================

import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";

export type ChatB2KEvent =
  | "assessment_started"
  | "assessment_completed"
  | "recommendation_generated"
  | "product_viewed"
  | "checkout_started"
  | "purchase_completed"
  | "follow_up_triggered";

const MEMORY_KEY = "rf_chatb2k_memory_v1";

export function chatSessionId(): string {
  if (typeof window === "undefined") return "server";
  const w = window as any;
  if (!w.__rf_session_id) {
    w.__rf_session_id =
      crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2);
  }
  return w.__rf_session_id;
}

export type ChatMemory = {
  goal?: string;
  answers?: Record<string, unknown>;
  lastRecommendation?: string[];
  updatedAt?: string;
};

export function readMemory(): ChatMemory {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeMemory(patch: ChatMemory) {
  try {
    const next = { ...readMemory(), ...patch, updatedAt: new Date().toISOString() };
    localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
  } catch {}
}

export function logChatEvent(event: ChatB2KEvent, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const attr = getAttribution();
  supabase
    .from("chatb2k_events")
    .insert({
      session_id: chatSessionId(),
      event_type: event,
      rsid: attr.rsid ?? null,
      campaign: attr.utm_campaign ?? null,
      funnel_origin: (attr.landing_page as string) ?? null,
      order_reference: (props.reference as string) ?? null,
      props: { ...props, ts: new Date().toISOString() } as never,
    })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.debug("[chatb2k_events]", error.message);
    });
}

export type RecommendationPayload = {
  goal?: string;
  answers?: Record<string, unknown>;
  products: Array<{ sku: string; name?: string; score?: number }>;
  confidence: number;
  upsell: number;
  engineVersion?: string;
};

/** Persists a recommendation and emits the matching journey event. */
export async function persistRecommendation(rec: RecommendationPayload) {
  if (typeof window === "undefined") return;
  writeMemory({
    goal: rec.goal,
    answers: rec.answers,
    lastRecommendation: rec.products.map((p) => p.sku),
  });

  const { data: sess } = await supabase.auth.getSession();

  supabase
    .from("recommendation_results")
    .insert({
      session_id: chatSessionId(),
      user_id: sess.session?.user.id ?? null,
      goal: rec.goal ?? null,
      answers: (rec.answers ?? {}) as never,
      recommended_products: rec.products as never,
      confidence_score: rec.confidence,
      upsell_score: rec.upsell,
      engine_version: rec.engineVersion ?? "chatb2k-v3",
    })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.debug("[recommendation_results]", error.message);
    });

  logChatEvent("recommendation_generated", {
    goal: rec.goal,
    skus: rec.products.map((p) => p.sku),
    confidence: rec.confidence,
    upsell: rec.upsell,
  });
}
