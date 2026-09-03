import { useEffect, useRef, useState } from "react";
import slide1 from "@/assets/products/reso-4hp.jpg";
import slide2 from "@/assets/trust/gym-install.jpg";
import slide3 from "@/assets/products/spin-bike.jpg";
import slide4 from "@/assets/trust/home-install.jpg";
import slide5 from "@/assets/products/walking-pad.jpg";
import { track } from "@/lib/track";

const HERO_VIDEO = "https://res.cloudinary.com/ihlmr2hd/video/upload/f_auto,q_auto,resofit-coach-buchi-ceo-brand-film-web.mp4";
const BG_HERO = "https://res.cloudinary.com/ihlmr2hd/video/upload/so_0,f_auto,q_auto/resofit-coach-buchi-ceo-brand-film-web.jpg";
const SLIDES = [
  { src: slide1, alt: "ResoFlex 4.0HP elite treadmill" },
  { src: slide2, alt: "ResoFlex installed in a boutique gym" },
  { src: slide3, alt: "ResoFlex elite spin bike" },
  { src: slide4, alt: "ResoFlex home installation" },
  { src: slide5, alt: "ResoFlex slim walking pad" },
];
const LQIP = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'><rect width='8' height='6' fill='%23060607'/></svg>`);

export const HeroCarousel = () => {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({ 0: false });
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { const id = setInterval(() => setActive(i => (i + 1) % SLIDES.length), 5500); return () => clearInterval(id); }, []);
  useEffect(() => { const id = setInterval(() => { const t = videoRef.current?.currentTime ?? 0; setPhase(t < 3 ? 0 : t < 6 ? 1 : 2); }, 250); return () => clearInterval(id); }, []);
  const cta = (cta: string) => track("cta_click", { cta, source: "hero_video" });
  return <section id="top" className="relative overflow-hidden pt-4 pb-16 md:pt-10 md:pb-24" aria-label="ResoFlex shop hero">
    <div className="absolute inset-0 -z-10 bg-noir-950"><img src={BG_HERO} alt="" aria-hidden width={1920} height={1080} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="absolute inset-0 bg-gradient-to-b from-noir-950/45 via-noir-950/75 to-noir-950" /></div>
    <div className="container">
      <div className="mx-auto max-w-4xl text-center"><div className="mx-auto mb-5 inline-flex rounded-full border border-gold/40 bg-noir-900/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-gold backdrop-blur">ResoFlex Fitness Commerce</div><h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">Train Better. <span className="gold-text text-glow-gold">Live Stronger.</span></h1><p className="mx-auto mt-4 max-w-2xl text-sm text-foreground/70 md:text-lg">Premium equipment, apparel and wellness programs — delivered across Nigeria, guided by ChatB2K™.</p></div>
      <div className="relative mx-auto mt-7 aspect-[16/10] max-w-6xl overflow-hidden border border-gold/30 bg-noir-900 shadow-[var(--shadow-elevated)] sm:aspect-[16/8]">
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={BG_HERO} aria-label="ResoFlex brand film"><source src={HERO_VIDEO} type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-noir-950/10" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          {phase === 0 && <div className="max-w-xl"><div className="text-[10px] uppercase tracking-[0.3em] text-gold">0–3 sec · Discover</div><div className="mt-1 font-display text-2xl font-bold sm:text-4xl">Everything to train, move and transform.</div></div>}
          {phase === 1 && <div className="max-w-xl"><div className="text-[10px] uppercase tracking-[0.3em] text-gold">3–6 sec · Choose</div><div className="mt-1 font-display text-2xl font-bold sm:text-4xl">Find your next upgrade.</div><div className="mt-4 flex gap-2"><a href="#products" onClick={() => cta("hero_shop")} className="luxury-button rounded-full px-5 py-3 text-xs font-bold">Shop now</a><a href="#featured" onClick={() => cta("hero_featured")} className="rounded-full border border-gold/50 bg-noir-900/70 px-5 py-3 text-xs font-bold text-gold">Featured</a></div></div>}
          {phase === 2 && <div className="max-w-xl"><div className="text-[10px] uppercase tracking-[0.3em] text-gold">6–8 sec · Belong</div><div className="mt-1 font-display text-2xl font-bold sm:text-4xl">Buy. Refer. Earn. Belong.</div><p className="mt-2 text-sm text-foreground/70">Secure checkout, verified media, community and a reseller path.</p></div>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 text-center text-[9px] uppercase tracking-[0.16em] text-foreground/45"><span className={phase === 0 ? "text-gold" : ""}>Discover</span><span className={phase === 1 ? "text-gold" : ""}>Shop</span><span className={phase === 2 ? "text-gold" : ""}>Refer & earn</span></div>
      <div className="relative mx-auto mt-6 aspect-[16/10] max-w-6xl overflow-hidden border border-gold/20 bg-noir-900 sm:aspect-[16/8]"><div className="absolute inset-0 flex h-full transition-transform duration-700 ease-out" style={{ width: `${SLIDES.length * 100}%`, transform: `translateX(-${active * (100 / SLIDES.length)}%)` }}>{SLIDES.map((s, i) => <div key={s.src} className="relative h-full" style={{ width: `${100 / SLIDES.length}%`, backgroundImage: `url(${LQIP})`, backgroundSize: "cover" }}><img src={i === 0 || i === active || loaded[i] ? s.src : undefined} alt={s.alt} width={1600} height={1000} loading={i === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={i === 0 ? "high" : "low"} onLoad={() => setLoaded(m => ({ ...m, [i]: true }))} className={`h-full w-full object-cover transition-opacity duration-700 ${loaded[i] ? "opacity-100" : "opacity-0"}`} /><div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-noir-900/20 to-transparent" /></div>)}</div><div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">{SLIDES.map((_, i) => <button key={i} onClick={() => setActive(i)} aria-label={`Show slide ${i + 1}`} className={`h-1.5 transition-all ${i === active ? "w-8 bg-gold" : "w-4 bg-foreground/30"}`} />)}</div></div>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href="#products" onClick={() => cta("shop_checkout")} className="luxury-button inline-flex rounded-full px-8 py-4 text-sm">Shop & Checkout</a><a href="#reseller" onClick={() => cta("refer_earn")} className="inline-flex rounded-full border border-gold/50 px-8 py-4 text-sm font-semibold text-gold">Refer & Earn</a><a href="/chatb2k" onClick={() => cta("chatb2k")} className="inline-flex rounded-full border border-foreground/20 px-8 py-4 text-sm font-semibold">Ask ChatB2K™</a></div>
      <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[10px] text-foreground/55"><span>✓ Secure Paystack</span><span>✓ Verified media</span><span>✓ Delivery + support</span><span>✓ Reseller path</span></div>
    </div>
  </section>;
};
