import { useEffect } from "react";
import { suggestBundlesFor, type Bundle } from "@/data/bundles";
import { withAttribution } from "@/lib/attribution";
import { verifyCheckoutUrl } from "@/lib/verifyCheckoutUrl";
import { track } from "@/lib/track";

type Props = {
  productSku: string;
  productName: string;
  onClose: () => void;
};

export const UpsellPrompt = ({ productSku, productName, onClose }: Props) => {
  const suggestions: Bundle[] = suggestBundlesFor(productSku).slice(0, 3);

  useEffect(() => {
    track("upsell_view", { source_sku: productSku, count: suggestions.length });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [productSku, suggestions.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-noir-950/85 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg border-gold/60 p-6 shadow-elevated animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Complete the Stack</div>
            <h3 className="mt-2 font-display text-base font-bold leading-tight">
              Recommended with {productName}
            </h3>
          </div>
          <button onClick={onClose} className="text-foreground/50 hover:text-gold">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {suggestions.map((s) => (
            <a
              key={s.id}
              href={withAttribution(s.paystackUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("checkout_start", {
                  sku: s.sku,
                  name: s.name,
                  category: s.category,
                  price: s.now,
                  source: "upsell",
                  from_sku: productSku,
                })
              }
              className="flex items-center gap-3 border border-border/70 bg-noir-900/70 p-3 transition hover:border-gold/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/40 bg-noir-950 text-gold">
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-xs font-bold leading-tight">{s.name}</div>
                <div className="mt-0.5 truncate text-[10px] text-foreground/55">{s.tagline}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-sm font-bold gold-text">{s.priceLabel}</div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/45">Add</div>
              </div>
            </a>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full border border-border/70 py-3 text-[10px] uppercase tracking-[0.3em] text-foreground/60 hover:text-gold"
        >
          Skip — proceed to checkout
        </button>
      </div>
    </div>
  );
};
