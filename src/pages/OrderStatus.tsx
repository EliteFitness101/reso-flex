import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";


type OrderView = {
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  reference: string;
  amount?: number;
  currency?: string;
  paid_at?: string | null;
  fulfillment_status?: string;
  next_steps?: string | null;
  created_at?: string;
  customer_email?: string | null;
  customer_name?: string | null;
  items?: Array<{ sku?: string; amount?: number; currency?: string }>;
  download_links?: Array<{ label: string; url: string }>;
  coach_contact?: string | null;
  message?: string;
};

// Polling schedule (ms) with cap. Stops on terminal state.
const BACKOFF = [1500, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 30000];
const TIMEOUT_MS = 5 * 60 * 1000;

const TERMINAL = new Set(["paid", "failed", "cancelled", "refunded"]);

export default function OrderStatus() {
  const { reference = "" } = useParams();
  const [search] = useSearchParams();
  const token = search.get("token") || "";
  const [order, setOrder] = useState<OrderView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());
  const attempt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      if (cancelled) return;
      try {
        const url = new URL(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-order`
        );
        url.searchParams.set("reference", reference);
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
        setOrder(payload);
        setErr(null);

        if (payload && TERMINAL.has(payload.status)) return; // stop polling
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "network_error");
      }

      if (Date.now() - startedAt.current > TIMEOUT_MS) return;
      const delay = BACKOFF[Math.min(attempt.current, BACKOFF.length - 1)];
      attempt.current++;
      timer = window.setTimeout(poll, delay);
    }
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reference, token]);

  const ngn = (koboUnknown: number | undefined) =>
    typeof koboUnknown === "number"
      ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(koboUnknown / 100)
      : "—";

  const statusCopy = (s?: string) => {
    if (s === "paid") return { title: "Payment verified successfully.", tone: "text-emerald-400" };
    if (s === "failed") return { title: "Payment could not be verified.", tone: "text-red-400" };
    if (s === "cancelled") return { title: "Payment cancelled.", tone: "text-foreground/60" };
    if (s === "refunded") return { title: "Payment refunded.", tone: "text-foreground/60" };
    return {
      title: "Payment received. We're verifying your transaction. This usually takes a few moments.",
      tone: "text-gold",
    };
  };
  const s = statusCopy(order?.status);

  return (
    <main className="min-h-screen bg-noir-950 px-4 py-16 text-foreground">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="text-[10px] uppercase tracking-[0.35em] text-foreground/50 hover:text-gold">
          ← Back to ResoFlex
        </Link>

        <div className="mt-6 border border-gold/40 bg-noir-900/70 p-7 shadow-elevated">
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Order Status</div>
          <h1 className={`mt-3 font-display text-2xl font-bold leading-tight ${s.tone}`}>
            {s.title}
          </h1>

          {order && (
            <div className="mt-6 space-y-4 text-sm">
              <Row label="Reference" value={order.reference} mono />
              <Row label="Status" value={order.status.toUpperCase()} />
              <Row label="Amount" value={ngn(order.amount)} />
              <Row label="Paid at" value={order.paid_at ? new Date(order.paid_at).toLocaleString() : "—"} />
              <Row label="Fulfillment" value={order.fulfillment_status || "—"} />

              {order.customer_email && <Row label="Email" value={order.customer_email} />}
              {order.customer_name && <Row label="Name" value={order.customer_name} />}

              {order.items && order.items.length > 0 && (
                <div className="border-t border-border/40 pt-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">Items</div>
                  <ul className="mt-2 space-y-1">
                    {order.items.map((it, i) => (
                      <li key={i} className="text-sm">
                        {it.sku || "item"} — {ngn(it.amount)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {order.download_links && order.download_links.length > 0 && (
                <div className="border-t border-border/40 pt-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">Downloads</div>
                  <ul className="mt-2 space-y-1">
                    {order.download_links.map((d, i) => (
                      <li key={i}>
                        <a href={d.url} className="text-gold underline" target="_blank" rel="noreferrer">
                          {d.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {order.coach_contact && (
                <Row label="Coach" value={order.coach_contact} />
              )}

              {order.next_steps && (
                <div className="border-t border-border/40 pt-4 text-sm text-foreground/80">
                  {order.next_steps}
                </div>
              )}
            </div>
          )}

          {!order && !err && (
            <div className="mt-6 text-xs text-foreground/50">Loading…</div>
          )}
          {err && !order && (
            <div className="mt-6 text-xs text-red-400">Network hiccup — retrying…</div>
          )}

          {order && !TERMINAL.has(order.status) && (
            <div className="mt-6 text-[10px] uppercase tracking-[0.25em] text-foreground/45">
              Auto-refreshing until payment is confirmed…
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/30 pb-2">
      <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">{label}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
    </div>
  );
}
