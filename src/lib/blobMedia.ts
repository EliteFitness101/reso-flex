/**
 * Public Vercel Blob delivery layer for product media.
 *
 * Set VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL to the public Blob store base URL,
 * e.g. https://<public-blob-host>. Do not put a Blob read/write token in VITE_*.
 * The product folder is already verified by the existing media manifest.
 */
const BLOB_BASE = (import.meta.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

export const hasBlobMedia = Boolean(BLOB_BASE);

export function blobAssetUrl(folder: string, filename: string): string | null {
  if (!BLOB_BASE) return null;
  return `${BLOB_BASE}/products/${encodeURIComponent(folder)}/${filename}`;
}

export function blobVideoUrl(folder: string): string | null {
  return blobAssetUrl(folder, "bg-hero.mp4");
}
