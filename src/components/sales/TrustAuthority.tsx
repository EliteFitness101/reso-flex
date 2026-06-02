import homeInstall from "@/assets/trust/home-install.jpg";
import gymInstall from "@/assets/trust/gym-install.jpg";
import deliveryProof from "@/assets/trust/delivery-proof.jpg";

const ITEMS = [
  {
    src: homeInstall,
    tag: "Home Install · Lagos",
    title: "Installed in elite Nigerian homes",
    caption: "Living-room ready. Set up by our white-glove team.",
  },
  {
    src: gymInstall,
    tag: "Boutique Gym · Abuja",
    title: "Trusted by boutique studios",
    caption: "Specified by trainers running 24/7 duty cycles.",
  },
  {
    src: deliveryProof,
    tag: "Insured Delivery · Nationwide",
    title: "Doorstep delivery across Nigeria",
    caption: "Tracked, insured, and unboxed by our logistics partners.",
  },
];

export const TrustAuthority = () => (
  <section id="trust-authority" className="relative py-20 md:py-28">
    <div className="container">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.35em] text-gold">Proof, Not Promises</div>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Real Installs. <span className="gold-text">Real Nigerians.</span>
        </h2>
        <p className="mt-4 text-foreground/65">
          From Lekki living rooms to Abuja boutique gyms — ResoFlex is already shaping elite routines nationwide.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {ITEMS.map((it) => (
          <figure
            key={it.tag}
            className="group relative overflow-hidden rounded-2xl border border-gold/25 bg-noir-800 shadow-elevated transition duration-500 hover:-translate-y-1 hover:border-gold/60"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={it.src}
                alt={it.title}
                width={1024}
                height={768}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5">
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold">{it.tag}</div>
              <div className="mt-1.5 font-display text-lg font-semibold text-foreground">{it.title}</div>
              <div className="mt-1 text-xs text-foreground/65">{it.caption}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);
