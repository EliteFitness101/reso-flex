export const TrustFloatBadge = () => (
  <div className="container relative z-30 -mb-4 mt-4 flex justify-center md:-mb-6 md:mt-6">
    <div className="group inline-flex max-w-full items-center gap-3 border border-gold/50 bg-noir-800/85 px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-foreground/90 shadow-[var(--shadow-gold)] backdrop-blur-xl sm:gap-4 sm:px-6 sm:py-3 sm:text-xs">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-gold text-noir-900 shadow-gold">
        <i className="fa-solid fa-shield-halved text-sm" />
      </span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="gold-text font-bold">Escrow Protected</span>
        <span className="hidden h-3 w-px bg-gold/40 sm:inline-block" />
        <span className="font-semibold">Pay On Delivery Available</span>
      </span>
      <span className="hidden h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-400 sm:inline-block" />
    </div>
  </div>
);
