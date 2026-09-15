const IMAGEKIT_MANIFEST = 'https://raw.githubusercontent.com/EliteFitness101/reso-flex/main/public/resoflex_imagekit_verified_manifest.json';
const STOREFRONT_PRODUCTS = 'https://vbqjvmnhdtdhmeeudqnn.supabase.co/functions/v1/storefront-products?limit=200';
const BLOB_BASE = (process.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL || process.env.RESOFLEX_BLOB_PUBLIC_BASE_URL || 'https://ab2ttlkn9no0tuoa.public.blob.vercel-storage.com').replace(/\/$/, '');
const FILES = { hero:'hero.png', gallery_01:'gallery-01.png', gallery_02:'gallery-02.png', gallery_03:'gallery-03.png', lifestyle:'lifestyle.png', detail:'detail.png' };
function blobUrl(folder, filename) { return `${BLOB_BASE}/imagekit/assets/products/${folder}/${filename}`; }
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const [manifestResponse, productsResponse] = await Promise.all([fetch(IMAGEKIT_MANIFEST), fetch(STOREFRONT_PRODUCTS)]);
    if (!manifestResponse.ok || !productsResponse.ok) throw new Error(`Canonical sources unavailable: imagekit=${manifestResponse.status} storefront=${productsResponse.status}`);
    const manifestPayload = await manifestResponse.json();
    const manifest = Array.isArray(manifestPayload) ? manifestPayload : JSON.parse(manifestPayload.content || '[]');
    const grouped = {};
    for (const item of manifest) {
      if (item.status !== 'verified' || !item.sku) continue;
      const entry = grouped[item.sku] ||= { sku: item.sku, slug: item.slug, name: item.product_name, folder: item.folder, assets: {}, background: { image: null, video: null } };
      const path = item.url || `https://ik.imagekit.io/resofit808/assets/products/${item.folder}/${item.file_name}`;
      entry.assets[item.role] = { role: item.role, path, imagekitUrl: path, blobUrl: blobUrl(item.folder, FILES[item.role] || item.file_name) };
    }
    for (const entry of Object.values(grouped)) { entry.background.image = blobUrl(entry.folder, 'bg-hero.png'); entry.background.video = blobUrl(entry.folder, 'bg-hero.mp4'); }
    const payload = await productsResponse.json();
    const products = payload.products || payload.data || [];
    const paystack = (Array.isArray(products) ? products : []).filter((item) => String(item.sku || '').startsWith('PAYSTACK-')).map((item) => ({ title: item.title, priceNgn: Number(item.variant_price || 0), images: item.image_src ? [item.image_src] : [], source: 'https://paystack.shop/resoflex', sku: item.sku, handle: item.handle }));
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ source: 'ResoFlex canonical media bridge', generatedAt: new Date().toISOString(), imagekit: { verified: grouped, count: Object.keys(grouped).length }, paystack: { products: paystack, count: paystack.length }, blob: { configured: true, base: BLOB_BASE } });
  } catch (error) { return res.status(502).json({ error: 'Canonical media bridge unavailable', message: error instanceof Error ? error.message : 'Unknown error' }); }
}
