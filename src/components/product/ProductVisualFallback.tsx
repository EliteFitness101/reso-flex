type ProductVisualFallbackProps = {
  name: string;
  role?: "hero" | "lifestyle" | "detail";
  className?: string;
};

const roleLabel = {
  hero: "RESOFLEX / SIGNATURE HERO",
  lifestyle: "RESOFLEX / LIFESTYLE",
  detail: "RESOFLEX / DETAIL",
};

export default function ProductVisualFallback({
  name,
  role = "hero",
  className = "",
}: ProductVisualFallbackProps) {
  const initials = name
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "RF";

  return (
    <div
      role="img"
      aria-label={`${name} ${role} visual`}
      className={`relative flex min-h-[240px] w-full items-end overflow-hidden border border-gold/20 bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.24),transparent_32%),linear-gradient(135deg,#090909_0%,#17130d_52%,#050505_100%)] p-6 ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-gold/20" />
      <div className="pointer-events-none absolute -right-6 top-6 h-32 w-32 rounded-full border border-gold/10" />
      <div className="relative z-10 w-full">
        <div className="mb-5 flex h-20 w-20 items-center justify-center border border-gold/40 bg-black/40 text-2xl font-semibold tracking-[0.2em] text-gold shadow-2xl backdrop-blur">
          {initials}
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold/70">
          {roleLabel[role]}
        </p>
        <h2 className="mt-2 max-w-xl text-xl font-semibold leading-tight text-white md:text-2xl">
          {name}
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">
          Premium visual fallback · verified media unavailable
        </p>
      </div>
    </div>
  );
}
