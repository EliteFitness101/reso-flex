import { useEffect, useState } from "react";

export const UrgencyStrip = () => {
  const [stock, setStock] = useState(47);
  useEffect(() => {
    const t = setInterval(() => {
      setStock((s) => (s > 7 ? s - (Math.random() > 0.7 ? 1 : 0) : s));
    }, 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="py-12">
      <div className="container">
        <div className="glass-panel relative overflow-hidden rounded-2xl border-gold/40 p-7 text-center">
          <div className="absolute inset-0 bg-gradient-radial-gold opacity-60" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/15 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-destructive">
              <i className="fa-solid fa-fire" /> Low Stock Warning
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold md:text-3xl">
              Only <span className="gold-text text-3xl md:text-4xl">{stock}</span> launch-priced units remaining
            </h3>
            <p className="mt-2 text-sm text-foreground/65">
              When the 1,000-unit launch cohort sells out, prices return to MSRP. No exceptions.
            </p>
            <a href="#products" className="luxury-button mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm">
              <i className="fa-solid fa-bolt" /> Claim Yours
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
