// ============================================================
// SEO — dynamic head metadata + JSON-LD injection.
// Client-side; safe to call from any page component.
// ============================================================

const SITE = "https://reso-flex.lovable.app";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function setSeo(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  type?: string;
}) {
  const url = opts.path ? `${SITE}${opts.path}` : window.location.href;
  document.title = opts.title.slice(0, 60);
  upsertMeta('meta[name="description"]', { name: "description", content: opts.description.slice(0, 158) });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: opts.title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: opts.description });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: opts.type ?? "website" });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  if (opts.image) {
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: opts.image });
  }
  upsertLink("canonical", url);
}

/** Injects (or replaces) a JSON-LD block with a stable id. */
export function setJsonLd(id: string, data: unknown) {
  const elId = `jsonld-${id}`;
  document.getElementById(elId)?.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = elId;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  return () => document.getElementById(elId)?.remove();
}

export function productJsonLd(p: {
  sku: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  currency?: string;
  path: string;
  inStock?: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    sku: p.sku,
    name: p.name,
    description: p.description ?? p.name,
    image: p.image ? [p.image] : undefined,
    brand: { "@type": "Brand", name: "ResoFlex" },
    offers: {
      "@type": "Offer",
      url: `${SITE}${p.path}`,
      priceCurrency: p.currency ?? "NGN",
      price: p.price,
      availability: `https://schema.org/${p.inStock === false ? "OutOfStock" : "InStock"}`,
    },
  };
}

export function collectionJsonLd(c: {
  name: string;
  description?: string | null;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.name,
    description: c.description ?? c.name,
    url: `${SITE}${c.path}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: c.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: `${SITE}${it.path}`,
      })),
    },
  };
}
