import { waUrl } from "@/lib/waScript";
import { bumpIntent, lockFunnel } from "@/lib/funnelLock";
import { useEffect, useState } from "react";

export const Nav = () => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const emit = () => window.dispatchEvent(new CustomEvent("resofit:search", { detail: query.trim() }));
    emit();
  }, [query]);

  return (
    <header className="container flex flex-wrap items-center justify-between gap-4 py-5">
      <a href="#top" className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-gold text-noir-900 shadow-gold">
          <i className="fa-solid fa-infinity text-sm" />
        </span>
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight">ResoFlex</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Elite</div>
        </div>
      </a>
      <nav className="hidden gap-7 text-sm text-foreground/75 md:flex">
        <a href="#products" className="hover:text-gold transition-colors">Collection</a>
        <a href="#why" className="hover:text-gold transition-colors">Why ResoFlex</a>
        <a href="#reseller" className="hover:text-gold transition-colors">Resellers</a>
        <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
      </nav>
      <div className="order-3 flex w-full items-center gap-2 md:order-none md:w-auto">
        <label className="relative flex-1 md:w-64">
          <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gold/80" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
            placeholder="Search equipment, apparel, wellness…"
            aria-label="Search ResoFit products and services"
            className="w-full rounded-full border border-gold/25 bg-noir-900/70 py-2.5 pl-9 pr-4 text-xs text-foreground outline-none backdrop-blur placeholder:text-foreground/35 focus:border-gold/70"
          />
        </label>
        <a
          href={waUrl({ source: "nav" })}
          target="_blank" rel="noreferrer"
          onClick={() => { bumpIntent(2, "nav_wa"); lockFunnel("whatsapp", "nav", "soft"); }}
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gold/40 bg-noir-800/60 px-4 py-2 text-xs font-medium text-gold backdrop-blur hover:bg-noir-700"
        >
          <i className="fa-brands fa-whatsapp text-base" /> Advisor
        </a>
      </div>
    </header>
  );
};
