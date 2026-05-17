const items = [
  { icon: "fa-shield-halved", title: "2-Year Warranty", desc: "Full coverage on motor, frame and electronics." },
  { icon: "fa-plug-circle-bolt", title: "PowerSaver Technology", desc: "Optimized for unstable Nigerian grid voltage." },
  { icon: "fa-truck-fast", title: "Nationwide Insured Delivery", desc: "Door-step installation across all 36 states." },
];

export const TrustBadges = () => (
  <section className="container -mt-10 mb-20">
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((i) => (
        <div key={i.title} className="glass-panel rounded-2xl p-6 transition hover:border-gold/60 hover:-translate-y-1">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-gold text-noir-900 shadow-gold">
              <i className={`fa-solid ${i.icon} text-lg`} />
            </span>
            <div>
              <div className="font-display text-lg font-semibold">{i.title}</div>
              <div className="mt-1 text-sm text-foreground/65">{i.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
