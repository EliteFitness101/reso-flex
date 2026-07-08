import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Skeleton } from "@/admin/ui";
import { ngn } from "@/admin/exports";

type TimelineStep = { key: string; label: string; at: string | null };
type OrderView = {
  id?: string; status: "pending" | "paid" | "failed" | "cancelled" | "refunded" | "expired";
  reference?: string; amount?: number; currency?: string; paid_at?: string | null;
  fulfillment_status?: string; next_steps?: string | null;
  customer_email?: string | null; customer_name?: string | null;
  items?: Array<{ sku?: string; amount?: number }>;
  download_links?: Array<{ label: string; url: string }>;
  coach_contact?: string | null; message?: string;
  timeline?: TimelineStep[];
};

const BACKOFF = [2000, 2500, 3000];
const TIMEOUT_MS = 5 * 60 * 1000;
const TERMINAL = new Set(["paid", "failed", "cancelled", "refunded", "expired"]);

const CANONICAL_STEPS: Array<{ key: string; label: string }> = [
  { key: "order_created", label: "Order Created" },
  { key: "checkout_started", label: "Checkout Started" },
  { key: "payment_submitted", label: "Payment Submitted" },
  { key: "webhook_received", label: "Webhook Received" },
  { key: "signature_verified", label: "Signature Verified" },
  { key: "payment_verified", label: "Payment Verified" },
  { key: "order_marked_paid", label: "Order Marked Paid" },
  { key: "referral_processed", label: "Referral Processed" },
  { key: "welcome_completed", label: "Welcome Completed" },
  { key: "ready_for_fulfillment", label: "Ready for Fulfillment" },
  { key: "fulfilled", label: "Fulfilled" },
];

export default function OrderStatusV2() {
  const { orderId = "" } = useParams();
  const [search] = useSearchParams();
  const token = search.get("token") || "";
  const [order, setOrder] = useState<OrderView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const attempt = useRef(0);

  useEffect(() => {
    let cancelled = false; let timer: number | undefined;
    async function poll() {
      if (cancelled) return;
      try {
        const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-order`);
        url.searchParams.set("orderId", orderId);
        if (token) url.searchParams.set("token", token);
        const r = await fetch(url.toString(), {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        });
        if (!r.ok) throw new Error(`http_${r.status}`);
        const payload: OrderView = await r.json();
        if (cancelled) return;
        setOrder(payload); setErr(null);
        if (TERMINAL.has(payload.status)) return;
      } catch (e: any) { if (!cancelled) setErr(e?.message || "network_error"); }
      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        if (!cancelled) setOrder(o => o ?? { status: "expired" });
        return;
      }
      timer = window.setTimeout(poll, BACKOFF[Math.min(attempt.current++, BACKOFF.length - 1)]);
    }
    poll();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [orderId, token]);

  const s = statusCopy(order?.status);
  const timeline = order?.timeline ?? [];
  const byKey = new Map(timeline.map(t => [t.key, t]));

  return (
    <main className="min-h-screen bg-noir-950 px-4 py-16 text-foreground">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="text-[10px] uppercase tracking-[0.35em] text-foreground/50 hover:text-gold">← Back to ResoFlex</Link>
        <div className="mt-6 border border-gold/40 bg-noir-900/70 p-7 shadow-elevated">
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Order Status</div>
          <h1 className={`mt-3 font-display text-2xl font-bold leading-tight ${s.tone}`}>{s.title}</h1>

          {!order && !err && (
            <div className="mt-6 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {order && (
            <div className="mt-6 space-y-3 text-sm">
              {order.reference && <Row label="Reference" value={order.reference} mono />}
              <Row label="Status" value={order.status.toUpperCase()} />
              {typeof order.amount === "number" && <Row label="Amount" value={ngn(order.amount)} />}
              {order.paid_at && <Row label="Paid at" value={new Date(order.paid_at).toLocaleString()} />}
              {order.fulfillment_status && <Row label="Fulfillment" value={order.fulfillment_status} />}
              {order.status === "paid" && order.customer_email && <Row label="Email" value={order.customer_email} />}
              {order.status === "paid" && order.download_links && order.download_links.length > 0 && (
                <div className="border-t border-border/40 pt-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">Downloads</div>
                  <ul className="mt-2 space-y-1">
                    {order.download_links.map((d, i) => (
                      <li key={i}><a href={d.url} target="_blank" rel="noreferrer" className="text-gold underline">{d.label}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              {order.next_steps && <div className="border-t border-border/40 pt-4 text-sm text-foreground/80">{order.next_steps}</div>}
            </div>
          )}

          {/* Timeline — verified backend state only */}
          {order && (
            <div className="mt-8 border-t border-border/40 pt-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-4">Progress Timeline</div>
              {!timeline.length && !err && (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              )}
              {timeline.length > 0 && (
                <ol className="relative border-l border-border/40 pl-5 space-y-4">
                  {CANONICAL_STEPS.filter(step => byKey.has(step.key)).map(step => {
                    const t = byKey.get(step.key)!;
                    return (
                      <li key={step.key} className="relative">
                        <span className="absolute -left-[27px] top-1 grid h-3 w-3 place-items-center rounded-full bg-emerald-400/90 ring-2 ring-noir-900" />
                        <div className="text-sm text-foreground/90">{t.label}</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/45 mt-0.5">
                          {t.at ? new Date(t.at).toLocaleString() : ""}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}

          {err && !order && <div className="mt-6 text-xs text-red-400">Network hiccup — retrying…</div>}
          {order && !TERMINAL.has(order.status) && (
            <div className="mt-6 text-[10px] uppercase tracking-[0.25em] text-foreground/45">Auto-refreshing until payment is confirmed…</div>
          )}
        </div>
      </div>
    </main>
  );
}

function statusCopy(s?: string) {
  if (s === "paid") return { title: "Payment Successful", tone: "text-emerald-400" };
  if (s === "failed") return { title: "Payment Failed", tone: "text-red-400" };
  if (s === "cancelled") return { title: "Payment Cancelled", tone: "text-foreground/60" };
  if (s === "expired") return { title: "Payment Expired", tone: "text-foreground/60" };
  if (s === "refunded") return { title: "Payment Refunded", tone: "text-foreground/60" };
  return { title: "Pending Verification", tone: "text-gold" };
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/30 pb-2">
      <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">{label}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
    </div>
  );
}
