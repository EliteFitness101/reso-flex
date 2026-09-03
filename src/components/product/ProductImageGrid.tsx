import { useEffect, useRef, useState } from "react";
import { ikLqip, ikSrcSet, ikUrl } from "@/lib/imagekit";
import { getVerifiedMedia, type AssetRole, type VerifiedAsset } from "@/core/media/imagekit.media";
import { track } from "@/lib/track";
import ProductVisualFallback from "@/components/product/ProductVisualFallback";

const ROLE_LABEL: Record<AssetRole, string> = {
  hero: "",
  gallery_01: "alternate view",
  gallery_02: "alternate view",
  gallery_03: "alternate view",
  lifestyle: "in use",
  detail: "detail view",
};

const ORDER: AssetRole[] = ["hero", "gallery_01", "gallery_02", "gallery_03", "lifestyle", "detail"];

type ImgProps = {
  asset: VerifiedAsset;
  alt: string;
  sizes: string;
  eager?: boolean;
  className?: string;
  onLoad?: () => void;
};

const IkImage = ({ asset, alt, sizes, eager, className, onLoad }: ImgProps) => (
  <img
    src={ikUrl(asset.path, { w: 960 })}
    srcSet={ikSrcSet(asset.path)}
    sizes={sizes}
    alt={alt}
    width={asset.width}
    height={asset.height}
    loading={eager ? "eager" : "lazy"}
    decoding="async"
    fetchPriority={eager ? "high" : "auto"}
    style={{ backgroundImage: `url(${ikLqip(asset.path)})`, backgroundSize: "cover" }}
    className={className ?? "h-full w-full object-cover"}
    onLoad={onLoad}
  />
);

export const ProductHeroImage = ({
  sku,
  name,
  eager,
  className,
}: {
  sku: string;
  name: string;
  eager?: boolean;
  className?: string;
}) => {
  const media = getVerifiedMedia(sku);
  const hero = media?.assets.hero;
  const startedAt = useRef(performance.now());
  if (!hero) return <ProductVisualFallback name={name} role="hero" className={className} />;
  return (
    <div className={`relative aspect-[4/3] overflow-hidden bg-noir-900 ${className ?? ""}`}>
      <IkImage
        asset={hero}
        alt={name}
        sizes="(max-width: 640px) 50vw, 320px"
        eager={eager}
        onLoad={() => track("product_image_load", { sku, role: "hero", load_ms: Math.round(performance.now() - startedAt.current) })}
      />
    </div>
  );
};

/** Full verified image grid. Missing roles are skipped; missing media gets a premium fallback. */
export default function ProductImageGrid({ sku, name }: { sku: string; name: string }) {
  const media = getVerifiedMedia(sku);
  const [active, setActive] = useState<AssetRole>("hero");
  const imageStartedAt = useRef(performance.now());
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    imageStartedAt.current = performance.now();
  }, [active]);

  if (!media) return <ProductVisualFallback name={name} role="hero" />;

  const roles = ORDER.filter((r) => media.assets[r]);
  if (!roles.length) return <ProductVisualFallback name={name} role="hero" />;

  const current = media.assets[active] ?? media.assets[roles[0]]!;
  const activeIndex = Math.max(0, roles.indexOf(active));

  const selectRole = (role: AssetRole, method: "thumbnail" | "swipe") => {
    setActive(role);
    track(method === "thumbnail" ? "product_gallery_thumbnail_click" : "product_gallery_swipe", {
      sku,
      role,
      index: roles.indexOf(role),
      gallery_size: roles.length,
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") touchStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || touchStartX.current === null || roles.length < 2) return;
    const delta = event.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    const nextIndex = delta < 0 ? Math.min(activeIndex + 1, roles.length - 1) : Math.max(activeIndex - 1, 0);
    if (nextIndex !== activeIndex) selectRole(roles[nextIndex], "swipe");
  };

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/3] overflow-hidden border border-gold/20 bg-noir-900 touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <IkImage
          asset={current}
          alt={`${name}${ROLE_LABEL[active] ? ` — ${ROLE_LABEL[active]}` : ""}`}
          sizes="(max-width: 768px) 100vw, 640px"
          eager
          onLoad={() =>
            track("product_image_load", {
              sku,
              role: active,
              load_ms: Math.round(performance.now() - imageStartedAt.current),
            })
          }
        />
      </div>

      {roles.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {roles.map((role) => {
            const a = media.assets[role]!;
            return (
              <button
                key={role}
                type="button"
                onClick={() => selectRole(role, "thumbnail")}
                aria-label={`${name} ${ROLE_LABEL[role] || "main image"}`}
                aria-pressed={active === role}
                className={`relative aspect-square overflow-hidden border transition ${
                  active === role ? "border-gold" : "border-border/40 hover:border-gold/50"
                }`}
              >
                <img
                  src={ikUrl(a.path, { w: 160 })}
                  alt=""
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.parentElement?.classList.add("bg-noir-900");
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
