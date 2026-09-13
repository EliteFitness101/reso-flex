import { useEffect, useRef, useState } from "react";
import { ikLqip, ikSrcSet, ikUrl } from "@/lib/imagekit";
import { blobAssetUrl, blobVideoUrl } from "@/lib/blobMedia";
import { getVerifiedMedia, type AssetRole, type VerifiedAsset } from "@/core/media/imagekit.media";
import { track } from "@/lib/track";
import ProductVisualFallback from "@/components/product/ProductVisualFallback";

const ROLE_LABEL: Record<AssetRole, string> = { hero: "", gallery_01: "alternate view", gallery_02: "alternate view", gallery_03: "alternate view", lifestyle: "in use", detail: "detail view" };
const FILE_NAME: Record<AssetRole, string> = { hero: "hero.png", gallery_01: "gallery-01.png", gallery_02: "gallery-02.png", gallery_03: "gallery-03.png", lifestyle: "lifestyle.png", detail: "details.png" };
const ORDER: AssetRole[] = ["hero", "gallery_01", "gallery_02", "gallery_03", "lifestyle", "detail"];
const MEDIA_TIMEOUT_MS = 8000;

type ImgProps = { asset: VerifiedAsset; folder: string; role: AssetRole; alt: string; sizes: string; eager?: boolean; className?: string; onLoad?: () => void };

const IkImage = ({ asset, folder, role, alt, sizes, eager, className, onLoad }: ImgProps) => {
  const [failed, setFailed] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const blobUrl = blobAssetUrl(folder, FILE_NAME[role]);
  useEffect(() => { setFailed(false); setUseFallback(false); const timer = window.setTimeout(() => setFailed(true), MEDIA_TIMEOUT_MS); return () => window.clearTimeout(timer); }, [asset.path, blobUrl]);
  if (failed) return <ProductVisualFallback name={alt.replace(/ — (alternate view|in use|detail view)$/, "")} role="hero" className={className} />;
  const src = useFallback || !blobUrl ? ikUrl(asset.path, { w: 1200 }) : blobUrl;
  const srcSet = useFallback || !blobUrl ? ikSrcSet(asset.path) : undefined;
  return <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} width={asset.width} height={asset.height} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} style={{ backgroundImage: `url(${ikLqip(asset.path)})`, backgroundSize: "cover" }} className={className ?? "h-full w-full object-cover"} onLoad={onLoad} onError={() => { if (!useFallback && blobUrl) setUseFallback(true); else setFailed(true); }} />;
};

const ProductBackgroundVideo = ({ folder, poster }: { folder: string; poster: string }) => {
  const [failed, setFailed] = useState(false);
  const src = blobVideoUrl(folder);
  if (!src || failed) return null;
  return <video className="absolute inset-0 h-full w-full object-cover opacity-70" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-hidden="true" onError={() => setFailed(true)}><source src={src} type="video/mp4" /></video>;
};

export const ProductHeroImage = ({ sku, name, eager, className }: { sku: string; name: string; eager?: boolean; className?: string }) => {
  const media = getVerifiedMedia(sku); const hero = media?.assets.hero; const startedAt = useRef(performance.now());
  if (!hero || !media) return <ProductVisualFallback name={name} role="hero" className={className} />;
  return <div className={`relative aspect-[4/3] overflow-hidden bg-noir-900 ${className ?? ""}`}><ProductBackgroundVideo folder={media.folder} poster={ikUrl(hero.path, { w: 1200 })} /><div className="relative z-10 h-full w-full"><IkImage asset={hero} folder={media.folder} role="hero" alt={name} sizes="(max-width: 640px) 100vw, 640px" eager={eager} className="h-full w-full object-cover" onLoad={() => track("product_image_load", { sku, role: "hero", load_ms: Math.round(performance.now() - startedAt.current) })} /></div></div>;
};

/** Full verified product media surface. Blob is the dynamic primary source; ImageKit remains a verified fallback. */
export default function ProductImageGrid({ sku, name }: { sku: string; name: string }) {
  const media = getVerifiedMedia(sku); const [active, setActive] = useState<AssetRole>("hero"); const imageStartedAt = useRef(performance.now()); const touchStartX = useRef<number | null>(null);
  useEffect(() => { imageStartedAt.current = performance.now(); }, [active]);
  if (!media) return <ProductVisualFallback name={name} role="hero" />;
  const roles = ORDER.filter((r) => media.assets[r]); if (!roles.length) return <ProductVisualFallback name={name} role="hero" />;
  const current = media.assets[active] ?? media.assets[roles[0]]!; const activeIndex = Math.max(0, roles.indexOf(active));
  const selectRole = (role: AssetRole, method: "thumbnail" | "swipe") => { setActive(role); track(method === "thumbnail" ? "product_gallery_thumbnail_click" : "product_gallery_swipe", { sku, role, index: roles.indexOf(role), gallery_size: roles.length }); };
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => { if (event.pointerType === "touch") touchStartX.current = event.clientX; };
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => { if (event.pointerType !== "touch" || touchStartX.current === null || roles.length < 2) return; const delta = event.clientX - touchStartX.current; touchStartX.current = null; if (Math.abs(delta) < 40) return; const nextIndex = delta < 0 ? Math.min(activeIndex + 1, roles.length - 1) : Math.max(activeIndex - 1, 0); if (nextIndex !== activeIndex) selectRole(roles[nextIndex], "swipe"); };
  return <div className="space-y-4"><div className="relative aspect-[4/3] overflow-hidden border border-gold/20 bg-noir-900 touch-pan-y" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}><ProductBackgroundVideo folder={media.folder} poster={ikUrl((media.assets.hero ?? current).path, { w: 1200 })} /><div className="relative z-10 h-full w-full"><IkImage asset={current} folder={media.folder} role={active} alt={`${name}${ROLE_LABEL[active] ? ` — ${ROLE_LABEL[active]}` : ""}`} sizes="(max-width: 768px) 100vw, 640px" eager className="h-full w-full object-cover" onLoad={() => track("product_image_load", { sku, role: active, load_ms: Math.round(performance.now() - imageStartedAt.current) })} /></div></div>{roles.length > 1 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{roles.map((role, index) => { const a = media.assets[role]!; return <button key={role} type="button" onClick={() => selectRole(role, "thumbnail")} aria-label={`${name} ${ROLE_LABEL[role] || "main image"}`} aria-pressed={active === role} className={`group relative aspect-[4/3] overflow-hidden border transition ${active === role ? "border-gold" : "border-border/40 hover:border-gold/50"}`}><IkImage asset={a} folder={media.folder} role={role} alt="" sizes="(max-width: 640px) 50vw, 33vw" eager={index < 3} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /><span className="absolute inset-x-0 bottom-0 bg-black/65 px-2 py-1 text-left text-[10px] uppercase tracking-[0.18em] text-white/80">{role === "hero" ? "Hero" : role === "gallery_01" ? "Gallery 01" : role === "gallery_02" ? "Gallery 02" : role === "gallery_03" ? "Gallery 03" : role === "lifestyle" ? "Lifestyle" : "Details"}</span></button>; })}</div>}</div>;
}
