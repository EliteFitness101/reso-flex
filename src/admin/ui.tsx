export function Card({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="border border-border/40 bg-noir-900/60 p-4">
      <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">{label}</div>
      <div className="mt-2 font-display text-2xl text-foreground">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-foreground/60">{sub}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-noir-900/80 ${className}`} />;
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "green" | "red" | "amber" }) {
  const map: Record<string, string> = {
    default: "border-border/40 text-foreground/70",
    green: "border-emerald-400/40 text-emerald-400",
    red: "border-red-400/40 text-red-400",
    amber: "border-amber-400/40 text-amber-400",
  };
  return <span className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${map[tone]}`}>{children}</span>;
}
