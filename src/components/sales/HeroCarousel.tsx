import { useEffect, useState } from "react";
import slide1 from "@/assets/products/reso-4hp.jpg";
import slide2 from "@/assets/trust/gym-install.jpg";
import slide3 from "@/assets/products/spin-bike.jpg";
import slide4 from "@/assets/trust/home-install.jpg";
import slide5 from "@/assets/products/walking-pad.jpg";

const SLIDES = [
  { src: slide1, alt: "ResoFlex 4.0HP elite treadmill" },
  { src: slide2, alt: "ResoFlex installed in a boutique Lagos gym" },
  { src: slide3, alt: "ResoFlex elite spin bike" },
  { src: slide4, alt: "ResoFlex home installation, Abuja residence" },
  { src: slide5, alt: "ResoFlex slim walking pad" },
];

// Tiny dark base64 LQIP (1x1 noir) for blur-up placeholder.
const LQIP =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'><rect width='8' height='6' fill='%23060607'/></svg>`,
  );

export const HeroCarousel = () => {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({ 0: false });

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-6 pb-20 md:pt-12 md:pb-28"
      aria-label="ResoFlex hero showcase"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-radial-gold" />
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
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
          <p className="mx-auto mt-6 max-w-2xl text-base text-foreground/70 md:text-lg">
            Industrial-luxe fitness infrastructure engineered for Nigerian power realities.
            PowerSaver inverter tech. 2-year warranty. Nationwide insured delivery.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mx-auto mt-10 aspect-[16/10] w-full max-w-5xl overflow-hidden border border-gold/30 bg-noir-900 shadow-[var(--shadow-elevated)] sm:aspect-[16/8]">
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out flex h-full"
            style={{ width: `${SLIDES.length * 100}%`, transform: `translateX(-${active * (100 / SLIDES.length)}%)` }}
          >
            {SLIDES.map((s, i) => (
              <div
                key={s.src}
                className="relative h-full"
                style={{ width: `${100 / SLIDES.length}%`, backgroundImage: `url(${LQIP})`, backgroundSize: "cover" }}
              >
                <img
                  src={i === 0 || i === active || loaded[i] ? s.src : undefined}
                  data-src={s.src}
                  alt={s.alt}
                  width={1600}
                  height={1000}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding={i === 0 ? "sync" : "async"}
                  fetchPriority={i === 0 ? "high" : "low"}
                  onLoad={() => setLoaded((m) => ({ ...m, [i]: true }))}
                  className={`h-full w-full object-cover transition-opacity duration-700 ${
                    loaded[i] ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-noir-900/30 to-transparent" />
              </div>
            ))}
          </div>

          {/* Slide dots */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-1.5 transition-all ${
                  i === active ? "w-8 bg-gold" : "w-4 bg-foreground/30 hover:bg-foreground/60"
                }`}
              />
            ))}
          </div>
        </div>

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

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-foreground/55">
          <span className="flex items-center gap-2"><i className="fa-solid fa-shield-halved text-gold" /> 2-Year Warranty</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-plug-circle-bolt text-gold" /> NEPA-Safe PowerSaver</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-truck-fast text-gold" /> Insured Delivery</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-lock text-gold" /> Secure Paystack Checkout</span>
        </div>
      </div>
    </section>
  );
};
