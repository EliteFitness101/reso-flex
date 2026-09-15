const IMAGEKIT_MANIFEST = 'https://raw.githubusercontent.com/EliteFitness101/reso-flex/main/public/resoflex_imagekit_verified_manifest.json';
const PAYSTACK_SOURCE = 'https://raw.githubusercontent.com/EliteFitness101/reso-flex/main/src/data/paystack-resoflex-catalog.ts';
const BLOB_BASE = (process.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL || process.env.RESOFLEX_BLOB_PUBLIC_BASE_URL || '').replace(/\/$/, '');

function blobUrl(folder, filename) {
  return BLOB_BASE ? `${BLOB_BASE}/imagekit/assets/products/${folder}/${filename}` : null;
}

function parsePaystack(source) {
  const match = source.match(/export const PAYSTACK_RESOFLEX_CATALOG[\\s\\S]*?= (\\[[\\s\\S]*?\\]);/);
  if (!match) throw new Error('Paystack catalog export not found');
  return Function(`return (${match[1]})`)();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const [manifestResponse, paystackResponse] = await Promise.all([fetch(IMAGEKIT_MANIFEST), fetch(PAYSTACK_SOURCE)]);
    if (!manifestResponse.ok || !paystackResponse.ok) throw new Error(`Canonical sources unavailable: imagekit=${manifestResponse.status} paystack=${paystackResponse.status}`);
    const manifest = await manifestResponse.json();
    const paystack = parsePaystack(await paystackResponse.text()).map((item) => ({ ...item, source: 'https://paystack.shop/resoflex' }));
    const imagekit = Object.fromEntries(manifest.map((item) => {
      const folder = item.folder || item.folder_name || item.slug;
      const rawAssets = item.assets || item.files || {};
      const assets = Object.fromEntries(Object.entries(rawAssets).map(([role, asset]) => {
        if (!asset) return [role, asset];
        const path = typeof asset === 'string' ? asset : asset.path || asset.url;
        return [role, { ...(typeof asset === 'object' ? asset : {}), path, imagekitUrl: path?.startsWith('http') ? path : `https://ik.imagekit.io/resofit808${path}`, blobUrl: blobUrl(folder, ({ hero:'hero.png', gallery_01:'gallery-01.png', gallery_02:'gallery-02.png', gallery_03:'gallery-03.png', lifestyle:'lifestyle.png', detail:'detail.png' })[role] || `${role}.png`) }];
      }));
      return [item.sku, { sku: item.sku, slug: item.slug, name: item.product_name || item.name, folder, assets, background: { image: blobUrl(folder, 'bg-hero.png'), video: blobUrl(folder, 'bg-hero.mp4') } }];
    }));
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ source: 'ResoFlex canonical media bridge', generatedAt: new Date().toISOString(), imagekit: { verified: imagekit, count: Object.keys(imagekit).length }, paystack: { products: paystack, count: paystack.length }, blob: { configured: Boolean(BLOB_BASE) } });
  } catch (error) {
    return res.status(502).json({ error: 'Canonical media bridge unavailable', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
