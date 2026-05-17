export const Footer = () => (
  <footer className="relative border-t border-border/50 bg-noir-950">
    <div className="container py-16">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-gold text-noir-900 shadow-gold">
              <i className="fa-solid fa-infinity text-sm" />
            </span>
            <div>
              <div className="font-display text-lg font-bold">ResoFlex Elite</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Sales OS</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-foreground/55">
            Sovereign fitness infrastructure for Nigeria. Industrial-grade engineering, elite after-sales,
            unmatched warranty.
          </p>
          <div className="mt-5 flex gap-3">
            {["instagram", "x-twitter", "tiktok", "whatsapp", "youtube"].map((s) => (
              <a key={s} href="#" aria-label={s}
                className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 text-gold hover:bg-noir-700">
                <i className={`fa-brands fa-${s}`} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Shop</div>
          <ul className="mt-4 space-y-2 text-sm text-foreground/65">
            <li><a href="#products" className="hover:text-gold">Treadmills</a></li>
            <li><a href="#products" className="hover:text-gold">Walking Pads</a></li>
            <li><a href="#products" className="hover:text-gold">Spin Bikes</a></li>
            <li><a href="#products" className="hover:text-gold">Accessories</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Support</div>
          <ul className="mt-4 space-y-2 text-sm text-foreground/65">
            <li><a href="#faq" className="hover:text-gold">FAQ</a></li>
            <li><a href="#reseller" className="hover:text-gold">Reseller Program</a></li>
            <li><a href="https://wa.me/2348000000000" className="hover:text-gold">WhatsApp Advisor</a></li>
            <li><a href="#" className="hover:text-gold">Warranty Claims</a></li>
          </ul>
        </div>
      </div>
      <div className="luxury-divider my-10" />
      <div className="flex flex-col items-center justify-between gap-4 text-xs text-foreground/45 sm:flex-row">
        <span>© {new Date().getFullYear()} ResoFlex Elite. All rights reserved.</span>
        <div className="flex gap-5">
          <a href="#" className="hover:text-gold">Privacy</a>
          <a href="#" className="hover:text-gold">Terms</a>
          <a href="#" className="hover:text-gold">Shipping</a>
          <a href="#" className="hover:text-gold">Returns</a>
        </div>
      </div>
    </div>
  </footer>
);
