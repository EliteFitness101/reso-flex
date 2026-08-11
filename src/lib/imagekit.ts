// ============================================================
// IMAGEKIT DELIVERY LAYER (public URLs only)
// Never import or reference IMAGEKIT_PRIVATE_KEY here — this
// module ships to the browser. Delivery-only transformations:
// the authentic product pixels are never regenerated.
// ============================================================

export const IMAGEKIT_ENDPOINT = "https://ik.imagekit.io/resofit808";

type Tr = {
  w?: number;
  h?: number;
  q?: number;
  /** crop behaviour — default keeps the whole product visible */
  crop?: "maintain_ratio" | "pad_resize" | "at_max";
  blur?: number;
};

/** Builds an optimized public delivery URL (auto WebP/AVIF via f-auto). */
export function ikUrl(path: string, tr: Tr = {}): string {
  const clean = path.startsWith("http")
    ? path.replace(IMAGEKIT_ENDPOINT, "")
    : path.startsWith("/")
      ? path
      : `/${path}`;

  const parts = ["f-auto", `q-${tr.q ?? 82}`];
  if (tr.w) parts.push(`w-${tr.w}`);
  if (tr.h) parts.push(`h-${tr.h}`);
  if (tr.crop) parts.push(`c-${tr.crop}`);
  if (tr.blur) parts.push(`bl-${tr.blur}`);

  return `${IMAGEKIT_ENDPOINT}/${clean.replace(/^\//, "")}?tr=${parts.join(",")}`;
}

/** Responsive srcset across the widths a mobile-first storefront needs. */
export function ikSrcSet(path: string, widths: number[] = [320, 480, 640, 960, 1280]): string {
  return widths.map((w) => `${ikUrl(path, { w })} ${w}w`).join(", ");
}

/** Low-quality placeholder used to avoid flashes while the real asset loads. */
export const ikLqip = (path: string) => ikUrl(path, { w: 24, q: 20, blur: 8 });

/** Social/OG rendition derived from the authentic hero asset. */
export const ikOg = (path: string) => ikUrl(path, { w: 1200, h: 630, crop: "pad_resize", q: 85 });
