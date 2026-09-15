/**
 * Public Vercel Blob delivery layer for shared assets.
 *
 * BLOB_BASE is public-only. Never expose BLOB_READ_WRITE_TOKEN in VITE_*.
 * Paths are canonicalized from existing source/asset paths so the same Blob
 * objects can be consumed by ResoFlex, shop.resofit.fit, Shopify feeds,
 * ChatB2K and other connected experiences.
 */
const BLOB_BASE = (import.meta.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

export const hasBlobMedia = Boolean(BLOB_BASE);

export function blobAssetUrl(pathname: string, filename?: string): string | null {
  if (!BLOB_BASE) return null;

  const raw = filename ? `${pathname}/${filename}` : pathname;
  const normalized = raw.replace(/^\/+/, "");
  const canonical = normalized.startsWith("imagekit/")
    ? normalized
    : normalized.startsWith("assets/")
      ? `imagekit/${normalized}`
      : `imagekit/assets/${normalized}`;

  return `${BLOB_BASE}/${canonical.split("/").map(encodeURIComponent).join("/")}`;
}

export function blobVideoUrl(folder: string): string | null {
  return blobAssetUrl(`assets/products/${folder}`, "bg-hero.mp4");
}
