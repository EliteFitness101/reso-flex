// Dev-only Attribution QA harness. Not shipped in production bundles
// (route is registered behind import.meta.env.DEV in App.tsx).
import { useEffect, useMemo, useState } from "react";
import { getAttribution, getDeviceContext } from "@/lib/attribution";
import { __devSubscribeFunnel, __devGetSessionId } from "@/lib/funnelLog";
import { supabase } from "@/integrations/supabase/client";

const CANONICAL_ORDER = [
  "landing_page_view",
  "whatsapp_click",
  "assessment_started",
  "assessment_completed",
  "checkout_started",
  "payment_pending",
  "payment_success",
  "welcome_completed",
  "upsell_accepted",
  "referral_joined",
];

const REQUIRED_FIELDS = [
  "rsid", "session_id",
  // in props:
  "device", "browser", "language", "referrer", "landing_page", "ts",
];

type Live = { event: string; row: any; ts: number };

export default function AttributionQA() {
  const [live, setLive] = useState<Live[]>([]);
  const [dbRows, setDbRows] = useState<any[]>([]);
  const sessionId = useMemo(() => __devGetSessionId(), []);
  const attr = useMemo(() => getAttribution(), []);
  const dev = useMemo(() => getDeviceContext(), []);

  useEffect(() => {
    const unsub = __devSubscribeFunnel((e) => setLive(l => [...l, e]));
    return () => unsub();
  }, []);

  useEffect(() => {
    supabase.from("funnel_events").select("*").eq("session_id", sessionId).order("created_at", { ascending: true })
      .then(({ data }) => setDbRows(data || []));
  }, [sessionId, live.length]);

  // ==== Checks ====
  const rsidPersists = !!attr.rsid;
  const rsidChecks = {
    session: !!sessionStorage.getItem("rf_attribution_v1"),
    memory: !!attr.rsid,
  };

  const seen = new Set(dbRows.map(r => r.event_type));
  const orderedSeen = CANONICAL_ORDER.filter(e => seen.has(e));
  const orderedActual = dbRows.map(r => r.event_type).filter(e => CANONICAL_ORDER.includes(e));
  // strip duplicates for ordering comparison
  const orderedActualDedup: string[] = [];
  for (const e of orderedActual) if (orderedActualDedup[orderedActualDedup.length - 1] !== e) orderedActualDedup.push(e);
  const orderingOk = orderedActualDedup.every((e, i) => CANONICAL_ORDER.indexOf(e) >= (i > 0 ? CANONICAL_ORDER.indexOf(orderedActualDedup[i - 1]) : -1));

  const counts: Record<string, number> = {};
  for (const e of orderedActual) counts[e] = (counts[e] || 0) + 1;
  const oneShot = new Set(["landing_page_view", "assessment_completed", "payment_success", "welcome_completed"]);
  const duplicates = Object.entries(counts).filter(([e, n]) => n > 1 && oneShot.has(e));

  const missingFields: Array<{ event: string; missing: string[] }> = [];
  for (const r of dbRows) {
    const flat = { ...r, ...(r.props || {}) };
    const missing = REQUIRED_FIELDS.filter(f => flat[f] == null || flat[f] === "");
    if (missing.length) missingFields.push({ event: r.event_type, missing });
  }

  const report = {
    passed: [
      rsidPersists && "RSID present",
      orderingOk && "Event ordering canonical",
      !duplicates.length && "No duplicate one-shot events",
      !missingFields.length && dbRows.length > 0 && "All events include required fields",
    ].filter(Boolean),
    failed: [
      !rsidPersists && "RSID missing",
      !orderingOk && "Events out of canonical order",
    ].filter(Boolean),
    duplicates,
    missingFields,
    orderedSeen,
  };

  return (
    <main className="min-h-screen bg-noir-950 text-foreground p-6 space-y-6 text-sm">
      <header>
        <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Dev QA</div>
        <h1 className="font-display text-2xl mt-1">Attribution Pipeline QA</h1>
        <p className="text-foreground/50 text-xs mt-1">Session <span className="font-mono">{sessionId}</span></p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="RSID & Session">
          <KV label="RSID" value={attr.rsid || "—"} />
          <KV label="Landing page" value={attr.landing_page || "—"} />
          <KV label="Referrer" value={attr.referrer || "—"} />
          <KV label="sessionStorage" value={String(rsidChecks.session)} />
        </Card>
        <Card title="Device Context">
          <KV label="Device" value={dev.device} />
          <KV label="Browser" value={dev.browser} />
          <KV label="Language" value={dev.lang} />
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title={`Passed (${report.passed.length})`} tone="green">
          {report.passed.map((p, i) => <div key={i} className="text-emerald-400">✓ {p}</div>)}
        </Card>
        <Card title={`Failed (${report.failed.length})`} tone="red">
          {report.failed.length ? report.failed.map((p, i) => <div key={i} className="text-red-400">✗ {p}</div>) : <div className="text-foreground/50">—</div>}
        </Card>
      </section>

      <Card title={`Duplicates (${report.duplicates.length})`}>
        {report.duplicates.length ? report.duplicates.map(([e, n]) => <div key={e}><span className="font-mono">{e}</span>: {n}</div>) : <div className="text-foreground/50">None</div>}
      </Card>

      <Card title={`Missing fields (${report.missingFields.length})`}>
        {report.missingFields.length ? report.missingFields.map((m, i) => (
          <div key={i}><span className="font-mono">{m.event}</span> → {m.missing.join(", ")}</div>
        )) : <div className="text-foreground/50">None</div>}
      </Card>

      <Card title={`Canonical order seen (${report.orderedSeen.length}/${CANONICAL_ORDER.length})`}>
        <ol className="list-decimal ml-5 text-xs space-y-0.5">
          {CANONICAL_ORDER.map(e => (
            <li key={e} className={seen.has(e) ? "text-emerald-400" : "text-foreground/40"}>{e}</li>
          ))}
        </ol>
      </Card>

      <Card title={`DB events for this session (${dbRows.length})`}>
        <pre className="text-[10px] max-h-64 overflow-auto bg-noir-950 border border-border/30 p-2">{JSON.stringify(dbRows, null, 2)}</pre>
      </Card>

      <Card title={`Live in-memory (${live.length})`}>
        <pre className="text-[10px] max-h-40 overflow-auto bg-noir-950 border border-border/30 p-2">{JSON.stringify(live, null, 2)}</pre>
      </Card>
    </main>
  );
}

function Card({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "green" | "red" }) {
  const border = tone === "green" ? "border-emerald-400/30" : tone === "red" ? "border-red-400/30" : "border-border/40";
  return (
    <div className={`border ${border} bg-noir-900/60 p-4`}>
      <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function KV({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 text-xs"><span className="text-foreground/50">{label}</span><span className="font-mono truncate max-w-[60%]">{value}</span></div>;
}
