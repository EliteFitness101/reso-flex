const WA_URL =
  "https://wa.me/2348132255842?text=" +
  encodeURIComponent("Hi, I want help choosing my ResoFlex plan or equipment");

const openChat = () => window.dispatchEvent(new Event("open-chatb2k"));

export const Footer = () => (
  <footer className="relative border-t border-gold/20 bg-noir-950">
    <div className="container py-16">
      {/* Trust block */}
      <div className="grid gap-4 border border-gold/20 bg-noir-900/60 p-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { i: "fa-truck-fast", t: "Nationwide Delivery", d: "Insured to all 36 states" },
          { i: "fa-lock", t: "Secure Paystack Checkout", d: "Escrow & Pay-on-Delivery" },
          { i: "fa-medal", t: "Transformation Guarantee", d: "Or your money back" },
          { i: "fa-robot", t: "AI Coaching Support", d: "ChatB2K + WhatsApp 24/7" },
        ].map((b) => (
          <div key={b.t} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center bg-gradient-gold text-noir-900 shadow-gold">
              <i className={`fa-solid ${b.i}`} />
            </span>
            <div>
              <div className="font-display text-sm font-semibold text-foreground">{b.t}</div>
              <div className="text-xs text-foreground/60">{b.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <a
          href="https://reso-fit.lovable.app"
          target="_blank"
          rel="noreferrer"
          className="luxury-button inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm shimmer"
        >
          <i className="fa-solid fa-clipboard-check" /> Start Free Assessment
        </a>
        <a
          href="https://joy-funnel-ai.lovable.app"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-noir-800/60 px-7 py-3.5 text-sm font-semibold text-gold backdrop-blur transition hover:bg-noir-700"
        >
          <i className="fa-solid fa-dumbbell" /> Explore Programs
        </a>
        <button
          onClick={openChat}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-noir-800/40 px-7 py-3.5 text-sm font-semibold text-foreground/85 transition hover:border-gold/40 hover:text-gold"
        >
          <i className="fa-solid fa-comments" /> Chat With Advisor
        </button>
      </div>

      <div className="luxury-divider my-12" />

      <div className="grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center bg-gradient-gold text-noir-900 shadow-gold">
              <i className="fa-solid fa-infinity text-sm" />
            </span>
            <div>
              <div className="font-display text-lg font-bold">ResoFlex Elite</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Sovereign OS</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-foreground/60">
            Sovereign fitness infrastructure for Nigeria. Industrial-grade engineering, elite
            after-sales, AI-powered coaching.
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <a
              href={WA_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-foreground/80 hover:text-gold"
            >
              <i className="fa-brands fa-whatsapp text-gold" /> +234 813 225 5842 — WhatsApp Advisor
            </a>
            <a href="mailto:sales@resofit.fit" className="flex items-center gap-2 text-foreground/70 hover:text-gold">
              <i className="fa-solid fa-envelope text-gold" /> sales@resofit.fit
            </a>
            <a href="mailto:support@resofit.fit" className="flex items-center gap-2 text-foreground/70 hover:text-gold">
              <i className="fa-solid fa-headset text-gold" /> support@resofit.fit
            </a>
            <a href="mailto:payment@resofit.fit" className="flex items-center gap-2 text-foreground/70 hover:text-gold">
              <i className="fa-solid fa-credit-card text-gold" /> payment@resofit.fit
            </a>
          </div>
        </div>

        {/* Social */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Follow</div>
          <ul className="mt-4 space-y-2 text-sm text-foreground/65">
            <li>
              <a
                href="https://instagram.com/resonancefitness101"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <i className="fa-brands fa-instagram" /> @resonancefitness101
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@resonancefitness"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <i className="fa-brands fa-tiktok" /> @resonancefitness
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@resofit.fit"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <i className="fa-brands fa-tiktok" /> @resofit.fit
              </a>
            </li>
          </ul>
        </div>

        {/* Shop */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Shop</div>
          <ul className="mt-4 space-y-2 text-sm text-foreground/65">
            <li><a href="#products" className="hover:text-gold">Treadmills</a></li>
            <li><a href="#products" className="hover:text-gold">Walking Pads</a></li>
            <li><a href="#products" className="hover:text-gold">Spin Bikes</a></li>
            <li><a href="#products" className="hover:text-gold">B2K Coaching</a></li>
            <li><a href="#faq" className="hover:text-gold">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="luxury-divider my-10" />
      <div className="flex flex-col items-center justify-between gap-4 text-xs text-foreground/45 sm:flex-row">
        <span>© {new Date().getFullYear()} ResoFlex Elite · ResoFit.fit. All rights reserved.</span>
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
