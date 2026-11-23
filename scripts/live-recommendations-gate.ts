const SUPABASE_URL = "https://vbqjvmnhdtdhmeeudqnn.supabase.co";
const SUPABASE_KEY = "sb_publishable_fu_Y3KQipfuomFQyd3zNtA_rG9XpOfG";
const expected = [
  { handle: "25-steel-boned-latex-waist-shaper", fulfillment: "physical" },
  { handle: "res-dig-reset", fulfillment: "digital" },
  { handle: "fitness-evolution", fulfillment: "digital" },
];

const query = new URLSearchParams({
  select: "handle,sku,title,variant_price,variant_inventory_qty,fulfillment_mode,published,image_src",
  published: "eq.true",
  handle: `in.(${expected.map((p) => p.handle).join(",")})`,
});
const response = await fetch(`${SUPABASE_URL}/rest/v1/products?${query}`, {
  headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
});
if (!response.ok) throw new Error(`Live catalog request failed: ${response.status}`);
const rows = await response.json();
const byHandle = new Map(rows.map((row) => [row.handle, row]));

for (const item of expected) {
  const product = byHandle.get(item.handle);
  if (!product) throw new Error(`Missing published recommendation: ${item.handle}`);
  if (product.fulfillment_mode !== item.fulfillment) {
    throw new Error(`Unexpected fulfillment mode for ${item.handle}: ${product.fulfillment_mode}`);
  }
  if (!Number.isFinite(Number(product.variant_price)) || Number(product.variant_price) <= 0) {
    throw new Error(`Invalid live price for ${item.handle}`);
  }
  if (!String(product.image_src || "").startsWith("https://")) {
    throw new Error(`Missing production image for ${item.handle}`);
  }
  if (item.fulfillment === "physical" && Number(product.variant_inventory_qty) <= 0) {
    throw new Error(`No catalog inventory quantity for physical product ${item.handle}`);
  }
}

console.log("Live recommendation contract passed:");
for (const item of expected) {
  const product = byHandle.get(item.handle);
  console.log(`- ${product.title} | ${product.sku} | NGN ${Number(product.variant_price).toLocaleString("en-NG")}`);
}
