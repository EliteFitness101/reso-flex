import { safeExternalUrl } from "@/lib/safeUrl";

export const NaijaFitRev = () => {
  const href = safeExternalUrl("https://nownowgym.lovable.app");
  return (
    <section id="naijafitrev" className="relative py-24">
      <div className="container">
        <div className="glass-panel mx-auto max-w-5xl p-8 md:p-14">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.4em] text-gold">// NaijaFitRev™</div>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
              90 DAY <span className="gold-text">FITNESS EVOLUTION</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-foreground/70 md:text-base">
              Africa's sovereign 90-day metabolic and strength protocol. Engineered for Nigerian
              schedules, pantries, and power realities — delivered through the NowNowGym
              operating system.
            </p>
          </div>

          <ul className="mx-auto mt-10 grid max-w-3xl gap-3 text-sm text-foreground/75 sm:grid-cols-3">
            {[
              "Phase 1 · Metabolic Ignition",
              "Phase 2 · Strength Architecture",
              "Phase 3 · Sovereign Conditioning",
            ].map((t) => (
              <li key={t} className="border border-gold/20 bg-noir-800/40 px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-foreground/80">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex justify-center">
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="luxury-button inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm shimmer"
            >
              <i className="fa-solid fa-bolt" /> Enter NaijaFitRev™
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
