// WhatsApp AI Sales Script Engine v1 — generates intent-adaptive prefilled
// WhatsApp messages without altering URL structure.

import { getFunnelState, type FunnelState } from "./funnelLock";

export type ScriptBranch = "awareness" | "guidance" | "persuasion" | "closing";

const PHONE_DEFAULT = "2348132255842";

const branchFor = (score: number): ScriptBranch =>
  score >= 80 ? "closing" : score >= 55 ? "persuasion" : score >= 25 ? "guidance" : "awareness";

const userStage = (score: number) =>
  score >= 80 ? "very_high" : score >= 55 ? "high" : score >= 25 ? "medium" : "low";

export const generateWhatsAppScript = (
  intent_score: number,
  ctx: Partial<FunnelState> = {},
): string => {
  const branch = branchFor(intent_score);
  const product = ctx.last_product_viewed ? ` (${ctx.last_product_viewed})` : "";
  const lines: Record<ScriptBranch, string> = {
    awareness:
      `Hi ResoFlex 👋 I'm exploring your equipment${product}. Can you share what fits my space and budget?`,
    guidance:
      `Hi ResoFlex — I'm comparing options${product}. I'd like guidance on the right plan + delivery to my city.`,
    persuasion:
      `Hi ResoFlex — I'm seriously considering ordering${product}. Please confirm stock, warranty, and the RESO22 discount.`,
    closing:
      `Hi ResoFlex — I'm ready to order${product} today. Please send the Paystack secure link and insured delivery ETA.`,
  };
  return lines[branch];
};

export const waUrl = (opts?: {
  phone?: string;
  override?: string;
  source?: string;
}): string => {
  const s = getFunnelState();
  const message = opts?.override ?? generateWhatsAppScript(s.intent_score, s);
  const meta = [
    `[stage:${userStage(s.intent_score)}`,
    `score:${s.intent_score}`,
    `funnel:${s.active_path ?? "open"}`,
    s.hesitation_flag ? "hesitation:1" : "",
    opts?.source ? `src:${opts.source}` : "",
    `]`,
  ].filter(Boolean).join(" ");
  const text = encodeURIComponent(`${message}\n\n${meta}`);
  return `https://wa.me/${opts?.phone ?? PHONE_DEFAULT}?text=${text}`;
};

export const selectedBranch = (): ScriptBranch =>
  branchFor(getFunnelState().intent_score);
