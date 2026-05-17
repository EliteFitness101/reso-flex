const testimonials = [
  { n: "Adaeze O.", r: "Surgeon · Lekki", q: "I've owned three treadmills. The ResoFlex 2.5HP is the first one that survived a full year on inverter power." },
  { n: "Chukwuemeka A.", r: "Tech Founder · VI", q: "The under-desk walking pad is silent. I take Zoom calls while clocking 8km. Productivity unlocked." },
  { n: "Hauwa B.", r: "Personal Trainer · Abuja", q: "I now resell ResoFlex to all my private clients. The commission tier alone covers my studio rent." },
];

export const SocialProof = () => (
  <section className="relative py-24">
    <div className="container">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.35em] text-gold">Elite Voices</div>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Trusted by <span className="gold-text">Nigeria's Top 1%</span>
        </h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.n} className="glass-panel rounded-2xl p-7">
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, i) => <i key={i} className="fa-solid fa-star text-xs" />)}
            </div>
            <blockquote className="mt-4 font-display text-lg leading-snug text-foreground/90">"{t.q}"</blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold font-bold text-noir-900">
                {t.n[0]}
              </span>
              <div>
                <div className="text-sm font-semibold">{t.n}</div>
                <div className="text-xs text-foreground/55">{t.r}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-14 overflow-hidden border-y border-border/40 py-5">
        <div className="flex animate-marquee gap-12 whitespace-nowrap text-sm uppercase tracking-[0.3em] text-foreground/40">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12">
              <span><i className="fa-solid fa-circle-check text-gold mr-2" /> 12,000+ Units Shipped</span>
              <span><i className="fa-solid fa-circle-check text-gold mr-2" /> 4.9★ Average Rating</span>
              <span><i className="fa-solid fa-circle-check text-gold mr-2" /> 36 States Delivery</span>
              <span><i className="fa-solid fa-circle-check text-gold mr-2" /> 2-Year Warranty</span>
              <span><i className="fa-solid fa-circle-check text-gold mr-2" /> NEPA-Safe Engineering</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
