const pains = [
  {
    icon: "fa-bolt-lightning",
    title: "Electricity Roulette",
    pain: "Cheap treadmills die in 90 days when NEPA surges fry their motor boards.",
    cure: "ResoFlex PowerSaver inverter motors are voltage-hardened from 140V to 260V — built for the Nigerian grid.",
  },
  {
    icon: "fa-person-falling-burst",
    title: "Joint Destruction",
    pain: "Concrete-hard belts shred your knees, ankles and lower back after weeks of use.",
    cure: "Multi-layer EVA shock-dampening reduces joint impact by up to 40% on every stride.",
  },
  {
    icon: "fa-ghost",
    title: "Ghost Importer Brands",
    pain: "Lagos warehouse vanishes the moment your treadmill needs a spare part or repair.",
    cure: "ResoFlex is a registered service infrastructure with technicians, parts and SLA-backed after-sales — for life.",
  },
];

export const PainMatrix = () => (
  <section id="why" className="relative py-24">
    <div className="container">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.35em] text-gold">The Honest Truth</div>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Why <span className="gold-text">90% of Nigerian Treadmills</span> Die in One Year
        </h2>
        <p className="mt-4 text-foreground/65">Three silent killers we engineered ResoFlex to defeat.</p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {pains.map((p) => (
          <div key={p.title} className="glass-panel group rounded-2xl p-7 transition hover:border-gold/60">
            <span className="grid h-14 w-14 place-items-center rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
              <i className={`fa-solid ${p.icon} text-xl`} />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold">{p.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">{p.pain}</p>
            <div className="luxury-divider my-5" />
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-shield-halved mt-1 text-gold" />
              <p className="text-sm leading-relaxed text-foreground/85">{p.cure}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
