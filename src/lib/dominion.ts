export type Domain =
  | 'intelligence'
  | 'content'
  | 'media'
  | 'commerce'
  | 'payments'
  | 'fulfillment'
  | 'geo'
  | 'communications'
  | 'members'
  | 'growth';

export type OpportunityKind = 'content' | 'product' | 'service' | 'partner' | 'api';

export type SourcePlatform = 'web' | 'tiktok' | 'twitch' | 'bigo' | 'x' | 'youtube' | 'internal';

export interface Signal {
  source: SourcePlatform;
  topic: string;
  query?: string;
  url?: string;
  geography?: string;
  demandScore?: number;
  freshnessScore?: number;
  engagementScore?: number;
  authorized?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Opportunity {
  id: string;
  kind: OpportunityKind;
  topic: string;
  score: number;
  evidence: Signal[];
  gap: string;
  nextAction: 'generate' | 'source' | 'recommend' | 'escalate';
  status: 'detected' | 'qualified' | 'generated' | 'verified' | 'registered' | 'published';
}

export interface Solution {
  type: 'internal' | 'external' | 'generated' | 'recommended';
  title: string;
  canonicalKey?: string;
  url?: string;
  price?: { amount: number; currency: string };
  provider?: string;
  fulfillment?: string;
  confidence: number;
}

export interface ContentBrief {
  topic: string;
  audience?: string;
  geography?: string;
  hook: string;
  angle: string;
  cta: string;
  platforms: string[];
  canonicalUrl?: string;
  sourceRefs: string[];
}

export const DOMINION_VERSION = '1.0.0';
export const DOMAINS: Domain[] = [
  'intelligence', 'content', 'media', 'commerce', 'payments', 'fulfillment',
  'geo', 'communications', 'members', 'growth',
];

export const SOURCE_CAPABILITIES: Record<SourcePlatform, string[]> = {
  web: ['search', 'crawl', 'ingest'],
  tiktok: ['public-metadata', 'authorized-ingest'],
  twitch: ['public-metadata', 'authorized-vod'],
  bigo: ['public-metadata', 'authorized-ingest'],
  x: ['public-metadata', 'authorized-ingest'],
  youtube: ['public-metadata', 'authorized-video'],
  internal: ['registry', 'analytics', 'content'],
};

export function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96);
}

export function scoreSignal(signal: Signal): number {
  const demand = Math.max(0, Math.min(100, signal.demandScore ?? 0));
  const freshness = Math.max(0, Math.min(100, signal.freshnessScore ?? 50));
  const engagement = Math.max(0, Math.min(100, signal.engagementScore ?? 0));
  return Math.round(demand * 0.5 + freshness * 0.2 + engagement * 0.3);
}

export function detectOpportunity(signals: Signal[]): Opportunity | null {
  if (!signals.length) return null;
  const ranked = [...signals].sort((a, b) => scoreSignal(b) - scoreSignal(a));
  const top = ranked[0];
  const score = scoreSignal(top);
  if (score < 40) return null;
  const topic = top.topic.trim();
  const gap = top.query && top.query.toLowerCase() !== topic.toLowerCase()
    ? `Demand exists for "${top.query}" but canonical coverage is weak or absent.`
    : `Demand signal for "${topic}" lacks sufficient ResoFit coverage.`;
  const kind: OpportunityKind = /buy|price|cost|shop|equipment|product/i.test(top.query ?? topic)
    ? 'product'
    : /book|appointment|coach|gym|spa|service/i.test(top.query ?? topic)
      ? 'service'
      : 'content';
  return {
    id: `opp_${slugify(topic)}_${Date.now().toString(36)}`,
    kind,
    topic,
    score,
    evidence: ranked.slice(0, 10),
    gap,
    nextAction: kind === 'content' ? 'generate' : 'source',
    status: 'qualified',
  };
}

export function buildContentBrief(opportunity: Opportunity): ContentBrief {
  const geo = opportunity.evidence.find((s) => s.geography)?.geography;
  const query = opportunity.evidence.find((s) => s.query)?.query ?? opportunity.topic;
  return {
    topic: opportunity.topic,
    geography: geo,
    hook: `${query}: the practical ResoFit solution people are looking for`,
    angle: `Answer the demand gap directly, compare viable solutions, and route the visitor to the best verified next step.`,
    cta: opportunity.kind === 'product' ? 'View the verified solution' : 'Get the personalized ResoFit solution',
    platforms: ['website', 'tiktok', 'youtube', 'instagram', 'facebook', 'whatsapp'],
    sourceRefs: opportunity.evidence.map((s) => s.url).filter((u): u is string => Boolean(u)),
  };
}

export function solutionHierarchy(hasInternal: boolean, hasExternal: boolean, canGenerate: boolean): Solution['type'] {
  if (hasInternal) return 'internal';
  if (hasExternal) return 'external';
  if (canGenerate) return 'generated';
  return 'recommended';
}
