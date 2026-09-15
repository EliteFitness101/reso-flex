/**
 * Public Vercel Blob delivery layer for shared assets.
 * The public base is verified from the live ResoFit production OG asset URL;
 * the env value remains the override so deployments can rotate the store.
 */
const BLOB_BASE = (import.meta.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL ?? "https://ab2ttlkn9no0tuoa.public.blob.vercel-storage.com").replace(/\/$/, "");

export const hasBlobMedia = Boolean(BLOB_BASE);

export function blobAssetUrl(pathname: string, filename?: string): string | null {
  if (!BLOB_BASE) return null;
  const raw = filename ? `${pathname}/${filename}` : pathname;
  const normalized = raw.replace(/^\/+/, "");
  const canonical = normalized.startsWith("imagekit/") ? normalized : normalized.startsWith("assets/") ? `imagekit/${normalized}` : `imagekit/assets/${normalized}`;
  return `${BLOB_BASE}/${canonical.split("/").map(encodeURIComponent).join("/")}`;
}

export function blobVideoUrl(folder: string): string | null {
  return blobAssetUrl(`assets/products/${folder}`, "bg-hero.mp4");
}
