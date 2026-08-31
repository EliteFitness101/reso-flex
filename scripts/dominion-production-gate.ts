const base = process.env.PRODUCTION_BASE_URL ?? 'https://shop.resofit.fit';

const checks = [
  ['dominion-health', '/api/dominion/health'],
  ['external-registry', '/api/external/registry'],
];

async function check(name: string, path: string) {
  const started = Date.now();
  const response = await fetch(`${base}${path}`, { headers: { Accept: 'application/json' } });
  const text = await response.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch {}
  return { name, path, status: response.status, ok: response.ok, latencyMs: Date.now() - started, body };
}

async function main() {
  const results = [];
  for (const [name, path] of checks) {
    try { results.push(await check(name, path)); }
    catch (error) { results.push({ name, path, status: 0, ok: false, latencyMs: 0, error: error instanceof Error ? error.message : String(error) }); }
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
