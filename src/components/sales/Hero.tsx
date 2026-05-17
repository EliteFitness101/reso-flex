export const Hero = () => (
  <section id="top" className="relative overflow-hidden pt-6 pb-24 md:pt-12 md:pb-32">
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-radial-gold" />
      <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
    </div>
    <div className="container">
      <div className="mx-auto max-w-4xl text-center animate-fade-up">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-noir-800/50 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-gold backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          Sovereign Fitness Infrastructure
        </div>
        <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl">
          Own Your <span className="gold-text text-glow-gold">Health.</span>
          <br />
          Command Your <span className="gold-text text-glow-gold">Day.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-base text-foreground/70 md:text-lg">
          Industrial-luxe treadmills, walking pads and spin bikes engineered for Nigerian power realities.
          PowerSaver inverter technology. 2-year warranty. Nationwide insured delivery.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#products" className="luxury-button inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm shimmer">
            <i className="fa-solid fa-cart-shopping" /> Shop the Collection
          </a>
          <a
            href="https://wa.me/2348000000000?text=I'd%20like%20a%20ResoFlex%20advisor"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-noir-800/60 px-8 py-4 text-sm font-semibold text-gold backdrop-blur transition hover:bg-noir-700"
          >
            <i className="fa-brands fa-whatsapp text-lg" /> WhatsApp Advisor
          </a>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-foreground/55">
          <span className="flex items-center gap-2"><i className="fa-solid fa-shield-halved text-gold" /> 2-Year Warranty</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-plug-circle-bolt text-gold" /> NEPA-Safe PowerSaver</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-truck-fast text-gold" /> Insured Delivery</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-lock text-gold" /> Secure Paystack Checkout</span>
        </div>
      </div>
    </div>
  </section>
);
