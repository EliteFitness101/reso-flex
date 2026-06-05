import { track } from "@/lib/track";

const WA_URL =
  "https://wa.me/2348132255842?text=" +
  encodeURIComponent("Hi, I want help choosing my ResoFlex plan or equipment");

const openChat = () => {
  track("chatb2k_open", { source: "footer" });
  window.dispatchEvent(new Event("open-chatb2k"));
};

const trackWA = (src: string) => () => track("whatsapp_click", { source: src });
const trackAssess = (src: string) => () => track("assessment_click", { source: src });

const TESTIMONIALS = [
  {
    quote:
      "Lost 14kg in 90 days with B2K Elite. The ResoFlex treadmill survived 3 PHCN surges — best investment of my year.",
    name: "Adaeze N.",
    role: "Lagos · B2K Elite Client",
  },
  {
    quote:
      "Set up my home gym for under ₦300k. Insured delivery to Abuja in 4 days. White-glove install. Premium experience.",
    name: "Tunde O.",
    role: "Abuja · Walking Pad Owner",
  },
  {
    quote:
      "B2K Core changed my curves naturally. Real coach response on WhatsApp, no auto-replies. Worth every naira.",
    name: "Ifeoma C.",
    role: "Port Harcourt · B2K Core",
  },
];

const STATS = [
  { v: "12,400+", l: "Units delivered" },
  { v: "36", l: "States covered" },
  { v: "4.9★", l: "Avg. rating" },
  { v: "98%", l: "On-time delivery" },
];

const SECURITY = [
  { i: "fa-shield-halved", t: "Paystack Secure" },
  { i: "fa-lock", t: "SSL Encrypted" },
  { i: "fa-hand-holding-dollar", t: "Escrow Protected" },
  { i: "fa-truck-fast", t: "Pay on Delivery" },
];

export const Footer = () => (
  <footer className="relative border-t border-gold/20 bg-noir-950">
    <div className="container py-16">
      {/* SOCIAL PROOF — Stats */}
      <div className="grid grid-cols-2 gap-3 border border-gold/20 bg-noir-900/60 p-5 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.l} className="text-center">
            <div className="font-display text-2xl font-bold text-gold">{s.v}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/55">{s.l}</div>
          </div>
        ))}
      </div>

      {/* SOCIAL PROOF — Testimonials */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col justify-between border border-gold/15 bg-noir-900/50 p-5 text-sm"
          >
            <div className="text-gold">
              {"★★★★★".split("").map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
            <blockquote className="mt-2 text-foreground/80 leading-relaxed">"{t.quote}"</blockquote>
            <figcaption className="mt-3 text-xs">
              <div className="font-semibold text-foreground">{t.name}</div>
              <div className="text-foreground/55">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Trust block */}
      <div className="mt-8 grid gap-4 border border-gold/20 bg-noir-900/60 p-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Security badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {SECURITY.map((s) => (
          <span
            key={s.t}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-noir-900/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/90"
          >
            <i className={`fa-solid ${s.i}`} /> {s.t}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <a
          href="https://reso-fit.lovable.app"
          target="_blank"
          rel="noreferrer"
          onClick={trackAssess("footer")}
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
              onClick={trackWA("footer_phone")}
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

        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Follow</div>
          <ul className="mt-4 space-y-2 text-sm text-foreground/65">
            <li>
              <a href="https://instagram.com/resonancefitness101" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
                <i className="fa-brands fa-instagram" /> @resonancefitness101
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@resonancefitness" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
                <i className="fa-brands fa-tiktok" /> @resonancefitness
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@resofit.fit" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
                <i className="fa-brands fa-tiktok" /> @resofit.fit
              </a>
            </li>
          </ul>
        </div>

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
