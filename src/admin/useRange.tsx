import { useState } from "react";

export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "custom";

export function useRange(initial: RangeKey = "30d") {
  const [key, setKey] = useState<RangeKey>(initial);
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const { from, to } = resolve(key, customFrom, customTo);
  return { key, setKey, from, to, customFrom, customTo, setCustomFrom, setCustomTo };
}

function resolve(k: RangeKey, cf: string, ct: string): { from: string; to: string } {
  const now = new Date();
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  if (k === "today") return { from: start.toISOString(), to: end.toISOString() };
  if (k === "yesterday") {
    const s = new Date(start); s.setDate(s.getDate() - 1);
    const e = new Date(end); e.setDate(e.getDate() - 1);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  if (k === "7d") { const s = new Date(start); s.setDate(s.getDate() - 6); return { from: s.toISOString(), to: end.toISOString() }; }
  if (k === "30d") { const s = new Date(start); s.setDate(s.getDate() - 29); return { from: s.toISOString(), to: end.toISOString() }; }
  return { from: cf ? new Date(cf).toISOString() : start.toISOString(), to: ct ? new Date(ct).toISOString() : end.toISOString() };
}

export function RangeSelector(p: ReturnType<typeof useRange>) {
  const btn = (k: RangeKey, label: string) => (
    <button
      key={k}
      onClick={() => p.setKey(k)}
      className={`px-3 py-1 text-[10px] uppercase tracking-[0.25em] border ${p.key === k ? "border-gold text-gold" : "border-border/40 text-foreground/60 hover:text-foreground"}`}
    >{label}</button>
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      {btn("today", "Today")}
      {btn("yesterday", "Yesterday")}
      {btn("7d", "7 days")}
      {btn("30d", "30 days")}
      {btn("custom", "Custom")}
      {p.key === "custom" && (
        <>
          <input type="date" value={p.customFrom} onChange={e => p.setCustomFrom(e.target.value)}
            className="bg-noir-900 border border-border/40 px-2 py-1 text-xs" />
          <input type="date" value={p.customTo} onChange={e => p.setCustomTo(e.target.value)}
            className="bg-noir-900 border border-border/40 px-2 py-1 text-xs" />
        </>
      )}
    </div>
  );
}
