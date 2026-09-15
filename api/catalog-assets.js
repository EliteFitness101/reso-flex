const IMAGEKIT_MANIFEST = 'https://raw.githubusercontent.com/EliteFitness101/reso-flex/main/public/resoflex_imagekit_verified_manifest.json';
const PAYSTACK_SOURCE = 'https://raw.githubusercontent.com/EliteFitness101/reso-flex/main/src/data/paystack-resoflex-catalog.ts';
const BLOB_BASE = (process.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL || process.env.RESOFLEX_BLOB_PUBLIC_BASE_URL || 'https://ab2ttlkn9no0tuoa.public.blob.vercel-storage.com').replace(/\/$/, '');
const FILES = { hero:'hero.png', gallery_01:'gallery-01.png', gallery_02:'gallery-02.png', gallery_03:'gallery-03.png', lifestyle:'lifestyle.png', detail:'detail.png' };
function blobUrl(folder, filename) { return BLOB_BASE ? `${BLOB_BASE}/imagekit/assets/products/${folder}/${filename}` : null; }
function parsePaystack(source) { const match = source.match(/export const PAYSTACK_RESOFLEX_CATALOG[\s\S]*?= (\[[\s\S]*?\]);/); if (!match) throw new Error('Paystack catalog export not found'); return Function(`return (${match[1]})`)(); }
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const [manifestResponse, paystackResponse] = await Promise.all([fetch(IMAGEKIT_MANIFEST), fetch(PAYSTACK_SOURCE)]);
    if (!manifestResponse.ok || !paystackResponse.ok) throw new Error(`Canonical sources unavailable: imagekit=${manifestResponse.status} paystack=${paystackResponse.status}`);
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
    const paystack = parsePaystack(await paystackResponse.text()).map((item) => ({ ...item, source: 'https://paystack.shop/resoflex' }));
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ source: 'ResoFlex canonical media bridge', generatedAt: new Date().toISOString(), imagekit: { verified: grouped, count: Object.keys(grouped).length }, paystack: { products: paystack, count: paystack.length }, blob: { configured: true, base: BLOB_BASE } });
  } catch (error) { return res.status(502).json({ error: 'Canonical media bridge unavailable', message: error instanceof Error ? error.message : 'Unknown error' }); }
}
