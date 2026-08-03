import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Skeleton } from "@/admin/ui";

type ChatEvent = { id: string; event_type: string; goal: string | null; campaign: string | null; created_at: string; props: any };
type Reco = { id: string; goal: string | null; confidence_score: number | null; upsell_score: number | null; recommended_products: any; created_at: string };

export default function ChatB2KAdmin() {
  const [events, setEvents] = useState<ChatEvent[] | null>(null);
  const [recos, setRecos] = useState<Reco[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [e, r] = await Promise.all([
        supabase.from("chatb2k_events").select("id, event_type, goal, campaign, created_at, props").order("created_at", { ascending: false }).limit(200),
        supabase.from("recommendation_results").select("id, goal, confidence_score, upsell_score, recommended_products, created_at").order("created_at", { ascending: false }).limit(50),
      ]);
      if (e.error) setErr(e.error.message);
      setEvents((e.data ?? []) as unknown as ChatEvent[]);
      setRecos((r.data ?? []) as unknown as Reco[]);
    })();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of events ?? []) c[e.event_type] = (c[e.event_type] ?? 0) + 1;
    return c;
  }, [events]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl text-foreground">ChatB2K Intelligence</h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">Assessments · recommendations · conversion</p>
      </div>

      {err && <div className="border border-red-400/40 p-3 text-xs text-red-400">{err}</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Assessments started" value={counts["assessment_started"] ?? 0} />
        <Card label="Assessments completed" value={counts["assessment_completed"] ?? 0} />
        <Card label="Recommendations" value={counts["recommendation_generated"] ?? 0} />
        <Card label="Checkouts from chat" value={counts["checkout_started"] ?? 0} />
      </div>

      <div>
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-foreground/50">Latest recommendations</h2>
        {!events ? (
          <Skeleton className="h-40 w-full" />
        ) : recos.length === 0 ? (
          <div className="border border-border/40 bg-noir-900/60 p-4 text-xs text-foreground/50">No recommendations recorded yet.</div>
        ) : (
          <div className="divide-y divide-border/20 border border-border/40 text-xs">
            {recos.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <span className="text-foreground">{r.goal ?? "—"}</span>
                <span className="text-foreground/50">
                  {Array.isArray(r.recommended_products)
                    ? r.recommended_products.map((p: any) => p.sku).join(", ")
                    : "—"}
                </span>
                <span className="ml-auto text-gold">conf {Math.round((r.confidence_score ?? 0) * 100)}%</span>
                <span className="text-foreground/50">upsell {Math.round((r.upsell_score ?? 0) * 100)}%</span>
                <span className="text-foreground/40">{new Date(r.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
