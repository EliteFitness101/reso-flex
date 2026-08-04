import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Card, Skeleton } from "@/admin/ui";

type Asset = {
  id: string;
  product_sku: string;
  variant_sku: string | null;
  asset_type: string;
  url: string;
  cdn_url: string | null;
  alt_text: string | null;
  seo_title: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  file_size_kb: number | null;
  is_hero: boolean;
  is_public: boolean;
};

export default function MediaAdmin() {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("product_assets")
      .select("id, product_sku, variant_sku, asset_type, url, cdn_url, alt_text, seo_title, format, width, height, file_size_kb, is_hero, is_public")
      .order("product_sku")
      .limit(400);
    setAssets((data ?? []) as unknown as Asset[]);
  };

  useEffect(() => { load(); }, []);

  const patch = async (id: string, patchData: Partial<Asset>) => {
    setSaving(id);
    await supabase.from("product_assets").update(patchData as never).eq("id", id);
    setAssets((prev) => prev?.map((a) => (a.id === id ? { ...a, ...patchData } : a)) ?? null);
    setSaving(null);
  };

  const webp = (assets ?? []).filter((a) => (a.format ?? "").toLowerCase() === "webp").length;
  const missingAlt = (assets ?? []).filter((a) => !a.alt_text).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl uppercase tracking-[0.25em] text-gold">Asset Pipeline</h1>
        <p className="mt-1 text-xs text-foreground/50">
          WebP-first delivery, lazy loading, SEO alt text. Target LCP &lt; 2.5s on mobile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Assets" value={assets?.length ?? "—"} />
        <Card label="WebP" value={assets ? `${webp}/${assets.length}` : "—"} />
        <Card label="Missing alt text" value={missingAlt} sub={missingAlt ? "SEO risk" : "All good"} />
      </div>

      {!assets ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <div key={a.id} className="border border-border/40 bg-noir-900/60">
              <div className="aspect-video overflow-hidden bg-noir-950">
                <img
                  src={a.cdn_url ?? a.url}
                  alt={a.alt_text ?? a.product_sku}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 p-3 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-gold">{a.product_sku}</span>
                  {a.is_hero && <Badge tone="amber">hero</Badge>}
                  <Badge tone={a.is_public ? "green" : "red"}>{a.is_public ? "public" : "private"}</Badge>
                  {a.format && <Badge>{a.format}</Badge>}
                </div>
                <div className="text-foreground/50">
                  {a.width ?? "?"}×{a.height ?? "?"} · {a.file_size_kb ?? "?"} KB
                </div>
                <input
                  defaultValue={a.alt_text ?? ""}
                  onBlur={(e) => e.target.value !== (a.alt_text ?? "") && patch(a.id, { alt_text: e.target.value })}
                  placeholder="Alt text (SEO)"
                  className="w-full border border-border/50 bg-noir-950 px-2 py-1.5 text-foreground placeholder:text-foreground/40"
                />
                <input
                  defaultValue={a.seo_title ?? ""}
                  onBlur={(e) => e.target.value !== (a.seo_title ?? "") && patch(a.id, { seo_title: e.target.value })}
                  placeholder="SEO title"
                  className="w-full border border-border/50 bg-noir-950 px-2 py-1.5 text-foreground placeholder:text-foreground/40"
                />
                <div className="flex items-center gap-3 text-foreground/60">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={a.is_hero} onChange={(e) => patch(a.id, { is_hero: e.target.checked })} />
                    Hero
                  </label>
                  {saving === a.id && <span className="text-gold">saving…</span>}
                </div>
              </div>
            </div>
          ))}
          {!assets.length && (
            <div className="col-span-full border border-border/40 p-6 text-center text-xs text-foreground/40">
              No assets yet — import 05_product_assets_manifest.csv from Catalog.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
