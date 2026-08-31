import { createClient } from '@supabase/supabase-js';
import type { Opportunity, Signal } from './dominion';

export function getAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) throw new Error('Supabase server configuration is incomplete');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function persistOpportunity(opportunity: Opportunity) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('content_opportunities')
    .insert({
      platform: opportunity.evidence[0]?.source ?? 'internal',
      intent: opportunity.kind,
      topic: opportunity.topic,
      search_gap: opportunity.gap,
      hook: opportunity.evidence[0]?.query ?? opportunity.topic,
      pov: 'solution-oriented',
      cta: 'Get the verified ResoFit solution',
      status: opportunity.status === 'qualified' ? 'draft' : opportunity.status,
      performance_score: opportunity.score,
    })
    .select('id, topic, status, performance_score')
    .single();
  if (error) throw new Error(`Opportunity persistence failed: ${error.message}`);
  return data;
}

export async function readCanonicalCatalog(limit = 100) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('id,handle,title,sku,variant_price,variant_inventory_qty,published,image_src')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 250));
  if (error) throw new Error(`Catalog read failed: ${error.message}`);
  return data ?? [];
}

export async function emitEvent(eventName: string, payload: Record<string, unknown>, idempotencyKey: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('resofit_events')
    .upsert({
      event_name: eventName,
      contract_version: '1.0',
      source_system: 'dominion',
      idempotency_key: idempotencyKey,
      payload,
    }, { onConflict: 'idempotency_key' })
    .select('id,event_name,idempotency_key')
    .single();
  if (error) throw new Error(`Event persistence failed: ${error.message}`);
  return data;
}

export function signalFromInput(input: Partial<Signal> & { topic: string }): Signal {
  return {
    source: input.source ?? 'internal',
    topic: input.topic,
    query: input.query,
    url: input.url,
    geography: input.geography,
    demandScore: input.demandScore,
    freshnessScore: input.freshnessScore,
    engagementScore: input.engagementScore,
    authorized: input.authorized ?? input.source === 'internal',
    metadata: input.metadata,
  };
}
