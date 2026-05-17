export const Nav = () => (
  <header className="container flex items-center justify-between py-5">
    <a href="#top" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-gold text-noir-900 shadow-gold">
        <i className="fa-solid fa-infinity text-sm" />
      </span>
      <div className="leading-tight">
        <div className="font-display text-lg font-bold tracking-tight">ResoFlex</div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Elite</div>
      </div>
    </a>
    <nav className="hidden gap-7 text-sm text-foreground/75 md:flex">
      <a href="#products" className="hover:text-gold transition-colors">Collection</a>
      <a href="#why" className="hover:text-gold transition-colors">Why ResoFlex</a>
      <a href="#reseller" className="hover:text-gold transition-colors">Resellers</a>
      <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
    </nav>
    <a
      href="https://wa.me/2348000000000"
      target="_blank" rel="noreferrer"
      className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gold/40 bg-noir-800/60 px-4 py-2 text-xs font-medium text-gold backdrop-blur hover:bg-noir-700"
    >
      <i className="fa-brands fa-whatsapp text-base" /> Advisor
    </a>
  </header>
);
