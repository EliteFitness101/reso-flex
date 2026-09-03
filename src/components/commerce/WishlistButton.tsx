import { useEffect, useState } from "react";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";

type Props = { sku: string; handle: string; name: string; image?: string; price?: number; className?: string };

export default function WishlistButton({ sku, handle, name, image, price, className = "" }: Props) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(isWishlisted(sku));
    sync();
    window.addEventListener("resoflex:commerce-state", sync);
    return () => window.removeEventListener("resoflex:commerce-state", sync);
  }, [sku]);
  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      aria-pressed={saved}
      title={saved ? "Saved to wishlist" : "Add to wishlist"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(toggleWishlist({ sku, handle, name, image, price })); }}
      className={`grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-noir-950/80 text-[11px] text-gold shadow-lg backdrop-blur transition hover:scale-105 hover:border-gold/70 ${saved ? "bg-gold text-noir-950" : ""} ${className}`}
    >
      <i className={saved ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
    </button>
  );
}
