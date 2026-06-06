// RIL Funnel Lock v3 — single-path conversion enforcement (client-only).
// First strong CTA interaction locks the path; subsequent paths are demoted.

import { track } from "./track";

export type FunnelPath = "assessment" | "offer" | "chatb2k" | "whatsapp";
export type LockStrength = "soft" | "medium" | "hard";

export type FunnelState = {
  active_path: FunnelPath | null;
  locked: boolean;
  lock_source: string | null;
  lock_strength: LockStrength | null;
  timestamp: number | null;
  intent_score: number;
  conversation_stage: "awareness" | "guidance" | "persuasion" | "closing";
  hesitation_flag: boolean;
  last_product_viewed: string | null;
  last_trigger_source: string | null;
};

const KEY = "ril_funnel_state_v3";

const initial: FunnelState = {
  active_path: null,
  locked: false,
  lock_source: null,
  lock_strength: null,
  timestamp: null,
  intent_score: 0,
  conversation_stage: "awareness",
  hesitation_flag: false,
  last_product_viewed: null,
  last_trigger_source: null,
};

const load = (): FunnelState => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : { ...initial };
  } catch {
    return { ...initial };
  }
};

let state: FunnelState = typeof window !== "undefined" ? load() : { ...initial };
const subs = new Set<(s: FunnelState) => void>();

const persist = () => {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ }
  subs.forEach((fn) => fn(state));
};

export const getFunnelState = (): FunnelState => state;

export const subscribeFunnel = (fn: (s: FunnelState) => void) => {
  subs.add(fn); fn(state); return () => subs.delete(fn);
};

export const bumpIntent = (delta: number, source?: string) => {
  state.intent_score = Math.max(0, Math.min(100, state.intent_score + delta));
  if (source) state.last_trigger_source = source;
  state.conversation_stage =
    state.intent_score >= 80 ? "closing" :
    state.intent_score >= 55 ? "persuasion" :
    state.intent_score >= 25 ? "guidance" : "awareness";
  persist();
};

export const setHesitation = (v: boolean) => {
  if (state.hesitation_flag !== v) { state.hesitation_flag = v; persist(); }
};

export const setLastProduct = (sku: string | null) => {
  state.last_product_viewed = sku; persist();
};

export const lockFunnel = (path: FunnelPath, source: string, strength: LockStrength = "medium") => {
  // Respect existing hard lock; medium can be upgraded by hard; soft replaced by anything.
  if (state.locked) {
    const order: Record<LockStrength, number> = { soft: 1, medium: 2, hard: 3 };
    if (order[strength] <= order[state.lock_strength ?? "soft"] && state.active_path !== path) return;
  }
  state.active_path = path;
  state.locked = true;
  state.lock_source = source;
  state.lock_strength = strength;
  state.timestamp = Date.now();
  persist();
  track("funnel_lock", { path, source, strength });
};

// Reset on SPA route change — preserve UTM/identity, reset behavioral baseline.
export const resetFunnelForNavigation = () => {
  state.intent_score = 0;
  state.conversation_stage = "awareness";
  state.hesitation_flag = false;
  // Keep active_path/lock — once locked in a session, stay locked.
  persist();
};

// CTA visibility helper — hide competing CTAs once locked (hard only).
export const shouldSuppressCTA = (path: FunnelPath): boolean => {
  if (!state.locked || !state.active_path) return false;
  if (state.lock_strength !== "hard") return false;
  return state.active_path !== path;
};
