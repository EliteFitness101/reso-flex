const base = process.env.PRODUCTION_BASE_URL ?? 'https://shop.resofit.fit';

type Check = { name: string; path: string; method?: 'GET' | 'POST'; body?: unknown };

const checks: Check[] = [
  ['dominion-health', '/api/dominion/health'],
  ['external-registry', '/api/external/registry'],
  ['imagekit-inventory', '/api/imagekit/inventory?path=%2Fresofit&limit=1'],
  ['cloudinary-verify', '/api/cloudinary/verify?folder=resofit'],
  ['commerce-resolve', '/api/commerce/resolve?q=fitness'],
].map(([name, path]) => ({ name, path }));

async function check(item: Check) {
  const started = Date.now();
  const response = await fetch(`${base}${item.path}`, {
    method: item.method ?? 'GET',
    headers: { Accept: 'application/json', ...(item.body ? { 'Content-Type': 'application/json' } : {}) },
    ...(item.body ? { body: JSON.stringify(item.body) } : {}),
  });
  const text = await response.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch {}
  return {
    name: item.name,
    path: item.path,
    status: response.status,
    ok: response.ok,
    latencyMs: Date.now() - started,
    body,
  };
}

async function main() {
  const results = [];
  for (const item of checks) {
    try { results.push(await check(item)); }
    catch (error) {
      results.push({
        name: item.name,
        path: item.path,
        status: 0,
        ok: false,
        latencyMs: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  const report = {
    engine: 'ResoFit Dominion Engine',
    base,
    generatedAt: new Date().toISOString(),
    checks: results,
    status: results.every((result) => result.ok) ? 'PASS' : 'FAIL',
  };
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'PASS') process.exit(1);
}

main().catch((error) => { console.error(error); process.exit(1); });
