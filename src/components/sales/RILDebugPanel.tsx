import { useEffect, useState } from "react";
import { getFunnelState, subscribeFunnel, type FunnelState } from "@/lib/funnelLock";
import { selectedBranch } from "@/lib/waScript";

// Hidden by default. Enable with ?debug=1 or localStorage.ril_debug = "1".
const isEnabled = () => {
  try {
    if (typeof window === "undefined") return false;
    if (new URLSearchParams(window.location.search).get("debug") === "1") return true;
    return localStorage.getItem("ril_debug") === "1";
  } catch { return false; }
};

export const RILDebugPanel = () => {
  const [enabled] = useState(isEnabled);
  const [s, setS] = useState<FunnelState>(getFunnelState());
  useEffect(() => {
    if (!enabled) return;
    const unsub = subscribeFunnel(setS);
    return () => { unsub(); };
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div className="fixed bottom-2 left-2 z-[100] max-w-[280px] rounded border border-gold/40 bg-noir-900/90 p-3 font-mono text-[10px] text-gold/90 shadow-gold backdrop-blur">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">RIL Debug</div>
      <div>intent: {s.intent_score}</div>
      <div>stage: {s.conversation_stage}</div>
      <div>path: {s.active_path ?? "—"} {s.locked && `(${s.lock_strength})`}</div>
      <div>lock_src: {s.lock_source ?? "—"}</div>
      <div>wa_branch: {selectedBranch()}</div>
      <div>hesitation: {s.hesitation_flag ? "yes" : "no"}</div>
      <div>last_product: {s.last_product_viewed ?? "—"}</div>
      <div>last_trigger: {s.last_trigger_source ?? "—"}</div>
    </div>
  );
};
