import { createClient } from '@supabase/supabase-js';
import { slugify } from '../src/lib/dominion';

type Registration = {
  entityType: 'product' | 'service' | 'bundle' | 'program' | 'journey' | 'offer';
  canonicalKey?: string;
  name: string;
  description?: string;
  productId?: string;
  status?: 'active' | 'inactive' | 'draft';
  metadata?: Record<string, unknown>;
};

function client() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function registerCanonical(input: Registration) {
  const supabase = client();
  const canonicalKey = input.canonicalKey ?? `${input.entityType}:${slugify(input.name)}`;
  const { data, error } = await supabase
    .from('resofit_canonical_entities')
    .upsert({
      entity_type: input.entityType,
      canonical_key: canonicalKey,
      name: input.name,
      description: input.description ?? null,
      product_id: input.productId ?? null,
      status: input.status ?? 'draft',
      metadata: input.metadata ?? {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'canonical_key' })
    .select('id,entity_type,canonical_key,name,status')
    .single();
  if (error) throw new Error(`Canonical registration failed: ${error.message}`);
  return data;
}

async function main() {
  const raw = process.argv[2];
  if (!raw) throw new Error('Usage: tsx scripts/register.ts \'{"entityType":"product","name":"..."}\'');
  const registration = JSON.parse(raw) as Registration;
  console.log(JSON.stringify(await registerCanonical(registration), null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
}
