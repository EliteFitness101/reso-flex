export type FunnelState =
  | "idle"
  | "viewed"
  | "started"
  | "paystack_open"
  | "pending_payment"
  | "paid"
  | "failed"
  | "fulfilled";

const KEY = "__rf_funnel_state";

export function setFunnelState(state: FunnelState, data?: any) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        state,
        data,
        ts: Date.now(),
      })
    );
  } catch {}
}

export function getFunnelState() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
