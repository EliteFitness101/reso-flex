const ASSET_REGISTRY = 'https://vbqjvmnhdtdhmeeudqnn.supabase.co/functions/v1/catalog-public/assets?limit=1000';
const STOREFRONT_PRODUCTS = 'https://vbqjvmnhdtdhmeeudqnn.supabase.co/functions/v1/storefront-products?limit=200';
const BLOB_BASE = (process.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL || process.env.RESOFLEX_BLOB_PUBLIC_BASE_URL || 'https://ab2ttlkn9no0tuoa.public.blob.vercel-storage.com').replace(/\/$/, '');
const ROLE = { hero:'hero', 'gallery-01':'gallery_01', 'gallery-02':'gallery_02', 'gallery-03':'gallery_03', lifestyle:'lifestyle', detail:'detail' };
function blobUrl(folder, filename) { return `${BLOB_BASE}/imagekit/assets/products/${folder}/${filename}`; }
function imagekitUrl(fullPath) { return `https://ik.imagekit.io/resofit808/${String(fullPath || '').replace(/^\/+/, '')}`; }
function folderOf(fullPath) { const parts = String(fullPath || '').split('/'); return parts.length >= 3 ? parts.slice(2, -1).join('/') : ''; }
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const [assetsResponse, productsResponse] = await Promise.all([fetch(ASSET_REGISTRY), fetch(STOREFRONT_PRODUCTS)]);
    if (!assetsResponse.ok || !productsResponse.ok) throw new Error(`Canonical sources unavailable: assets=${assetsResponse.status} storefront=${productsResponse.status}`);
    const assetPayload = await assetsResponse.json();
    const grouped = {};
    for (const item of (assetPayload.data || [])) {
      if (!item.sku || !item.canonical_url) continue;
      const folder = folderOf(item.full_file_path);
      const role = ROLE[item.role] || item.role;
      const entry = grouped[item.sku] ||= { sku: item.sku, slug: item.handle, name: item.sku, folder, assets: {}, background: { image: blobUrl(folder, 'bg-hero.png'), video: blobUrl(folder, 'bg-hero.mp4') } };
      entry.assets[role] = { role, path: item.canonical_url, imagekitUrl: imagekitUrl(item.full_file_path), blobUrl: item.canonical_url };
    }
    const payload = await productsResponse.json();
    const products = payload.products || payload.data || [];
    const paystack = (Array.isArray(products) ? products : []).filter((item) => String(item.sku || '').startsWith('PAYSTACK-')).map((item) => ({ title: item.title, priceNgn: Number(item.variant_price || 0), images: item.image_src ? [item.image_src] : [], source: 'https://paystack.shop/resoflex', sku: item.sku, handle: item.handle }));
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ source: 'ResoFlex canonical media bridge', generatedAt: new Date().toISOString(), imagekit: { verified: grouped, count: Object.keys(grouped).length, assets: assetPayload.data?.length ?? 0 }, paystack: { products: paystack, count: paystack.length }, blob: { configured: true, base: BLOB_BASE } });
  } catch (error) { return res.status(502).json({ error: 'Canonical media bridge unavailable', message: error instanceof Error ? error.message : 'Unknown error' }); }
}
