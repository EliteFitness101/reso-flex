import type { Product } from "@/data/products";

const SUPABASE_URL = "https://vbqjvmnhdtdhmeeudqnn.supabase.co";
const SUPABASE_KEY = "sb_publishable_fu_Y3KQipfuomFQyd3zNtA_rG9XpOfG";

export type LiveProduct = {
  id: string;
  handle: string;
  sku: string;
  title: string;
  body_html: string | null;
  vendor: string | null;
  product_type: string | null;
  tags: string[] | null;
  published: boolean;
  variant_price: number;
  variant_inventory_qty: number;
  image_src: string | null;
};

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

function escape(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

function toProduct(p: LiveProduct): Product {
  const price = Number(p.variant_price || 0);
  const text = `${p.title} ${p.product_type || ""} ${(p.tags || []).join(" ")}`;
  const digital = /digital|program|course|coaching|ebook|download|blueprint|meal plan|membership/i.test(text);
  const tagline = (p.body_html || p.product_type || "ResoFlex premium wellness commerce").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  return {
    id: p.id,
    handle: p.handle,
    sku: p.sku,
    name: p.title,
    tagline,
    priceLabel: price === 0 ? "FREE" : `NGN ${price.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    was: price,
    now: price,
    features: [p.vendor ? `By ${p.vendor}` : "ResoFlex marketplace", p.product_type || "Wellness product", digital ? "Digital-first fulfillment" : "Physical fulfillment", p.variant_inventory_qty > 0 ? "Available now" : "Availability by enquiry"],
    popular: false,
    free: price === 0,
    icon: digital ? "fa-bolt" : "fa-cube",
    image: p.image_src || "/og-image.png",
  };
}

export async function getLiveProductBySlug(slug: string): Promise<Product | null> {
  const safe = escape(slug);
  if (!safe) return null;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,handle,sku,title,body_html,vendor,product_type,tags,published,variant_price,variant_inventory_qty,image_src&published=eq.true&handle=eq.${safe}&limit=1`, { headers });
  if (!response.ok) return null;
  const rows = (await response.json()) as LiveProduct[];
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function getLiveProducts(limit = 250): Promise<Product[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,handle,sku,title,body_html,vendor,product_type,tags,published,variant_price,variant_inventory_qty,image_src&published=eq.true&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 250)}`, { headers });
  if (!response.ok) return [];
  const rows = (await response.json()) as LiveProduct[];
  return rows.map(toProduct);
}

export async function searchLiveProducts(query: string, limit = 24): Promise<Product[]> {
  const q = query.trim().replace(/[%_,]/g, " ");
  if (!q) return getLiveProducts(limit);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,handle,sku,title,body_html,vendor,product_type,tags,published,variant_price,variant_inventory_qty,image_src&published=eq.true&or=(title.ilike.*${encodeURIComponent(q)}*,product_type.ilike.*${encodeURIComponent(q)}*,sku.ilike.*${encodeURIComponent(q)}*)&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 100)}`, { headers });
  if (!response.ok) return [];
  return ((await response.json()) as LiveProduct[]).map(toProduct);
}
