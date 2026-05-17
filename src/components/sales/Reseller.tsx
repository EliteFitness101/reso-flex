import { useState } from "react";

export const Reseller = () => {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // Honeypot anti-spam
    if (data.get("company_website")) return;
    // TODO: POST to /api/reseller-leads (rate-limited, bot-protected)
    setSent(true);
  };

  return (
    <section id="reseller" className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-radial-gold opacity-50" />
      <div className="container">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-gold">Elite Partner Program</div>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
              High-Yield <span className="gold-text">Reseller & Middleman</span> Commissions
            </h2>
            <p className="mt-5 text-foreground/70">
              Built for personal trainers, procurement officers, gym consultants, interior designers,
              and corporate wellness brokers. Move ResoFlex inventory — earn elite margins.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { t: "Tier 1", c: "8%", d: "1–4 units / month" },
                { t: "Tier 2", c: "12%", d: "5–14 units / month" },
                { t: "Elite", c: "18%", d: "15+ units / month" },
              ].map((tier) => (
                <div key={tier.t} className="glass-panel rounded-xl p-5 text-center">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gold">{tier.t}</div>
                  <div className="mt-2 font-display text-4xl font-bold gold-text">{tier.c}</div>
                  <div className="mt-1 text-xs text-foreground/60">{tier.d}</div>
                </div>
              ))}
            </div>
            <ul className="mt-8 space-y-2.5 text-sm text-foreground/75">
              {["Private deal-room access", "Dedicated reseller advisor", "Pre-stocked Lagos warehouse priority", "Branded marketing assets included"].map((x) => (
                <li key={x} className="flex items-center gap-2.5">
                  <i className="fa-solid fa-circle-check text-gold" /> {x}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={onSubmit} className="glass-panel rounded-2xl p-7">
            {sent ? (
              <div className="py-10 text-center">
                <i className="fa-solid fa-circle-check text-5xl text-gold" />
                <h3 className="mt-5 font-display text-2xl font-bold">Application Received</h3>
                <p className="mt-2 text-sm text-foreground/65">An advisor will contact you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-bold">Apply to the Program</h3>
                <p className="mt-1 text-sm text-foreground/60">Verified partners only. Limited cohort.</p>
                {/* Honeypot */}
                <input type="text" name="company_website" tabIndex={-1} autoComplete="off"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <div className="mt-6 space-y-4">
                  {[
                    { n: "name", p: "Full name", i: "fa-user" },
                    { n: "phone", p: "WhatsApp / phone", i: "fa-phone" },
                    { n: "city", p: "City of operation", i: "fa-location-dot" },
                  ].map((f) => (
                    <div key={f.n} className="relative">
                      <i className={`fa-solid ${f.i} pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40`} />
                      <input
                        required name={f.n} placeholder={f.p} maxLength={120}
                        className="w-full rounded-xl border border-border bg-noir-900/60 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-gold/60"
                      />
                    </div>
                  ))}
                  <select name="role" required className="w-full rounded-xl border border-border bg-noir-900/60 px-4 py-3.5 text-sm outline-none focus:border-gold/60">
                    <option value="">I am a…</option>
                    <option>Personal trainer</option>
                    <option>Procurement agent</option>
                    <option>Gym consultant</option>
                    <option>Corporate wellness broker</option>
                    <option>Other</option>
                  </select>
                </div>
                <button type="submit" className="luxury-button mt-6 w-full rounded-xl py-3.5 text-sm">
                  Submit Application <i className="fa-solid fa-arrow-right ml-2" />
                </button>
                <p className="mt-3 text-[11px] text-foreground/45">Protected by anti-spam & rate-limiting.</p>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
