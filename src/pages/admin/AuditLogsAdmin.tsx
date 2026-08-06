import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { exportCsv, exportPdf } from "@/admin/exports";

type AuditRow = {
  id: string;
  created_at: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  result: string;
  actor_email: string | null;
  actor_id: string | null;
  ip: string | null;
};

// Event groups map onto the action prefixes already written by the webhook,
// order processing, RBAC and admin flows — no new audit system.
const GROUPS: Record<string, string[]> = {
  all: [],
  webhook: ["paystack.", "webhook."],
  payment: ["payment.", "order.", "reconcile."],
  auth: ["auth.", "login", "session."],
  rls: ["rls."],
  rbac: ["admin.bootstrap", "role.", "rbac."],
  admin: ["admin."],
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

export default function AuditLogsAdmin() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [group, setGroup] = useState("all");
  const [q, setQ] = useState("");

  const load = async () => {
    setRows(null);
    const { data } = await supabase
      .from("audit_logs")
      .select("id, created_at, action, resource_type, resource_id, result, actor_email, actor_id, ip")
      .gte("created_at", `${from}T00:00:00Z`)
      .lte("created_at", `${to}T23:59:59Z`)
      .order("created_at", { ascending: false })
      .limit(2000);
    setRows((data ?? []) as AuditRow[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [from, to]);

  const filtered = useMemo(() => {
    const prefixes = GROUPS[group] ?? [];
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      const inGroup = !prefixes.length || prefixes.some((p) => r.action?.toLowerCase().startsWith(p));
      const inSearch =
        !needle ||
        [r.action, r.resource_type, r.resource_id, r.result, r.actor_email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle));
      return inGroup && inSearch;
    });
  }, [rows, group, q]);

  const exportRows = () =>
    filtered.map((r) => ({
      timestamp: new Date(r.created_at).toISOString(),
      action: r.action,
      resource_type: r.resource_type,
      resource_id: r.resource_id ?? "",
      result: r.result,
      actor_email: r.actor_email ?? "",
      actor_id: r.actor_id ?? "",
      ip: r.ip ?? "",
    }));

  const fileBase = `resoflex-audit-${from}_${to}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl uppercase tracking-[0.25em] text-gold">Audit Logs</h1>
        <p className="mt-1 text-xs text-foreground/50">
          Webhook verification, payment reconciliation, authentication, RLS, RBAC and admin actions.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2 border border-border/40 bg-noir-900/60 p-4">
        <label className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block border border-border/50 bg-noir-950 px-2 py-1.5 text-xs text-foreground" />
        </label>
        <label className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="mt-1 block border border-border/50 bg-noir-950 px-2 py-1.5 text-xs text-foreground" />
        </label>
        <label className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Event
          <select value={group} onChange={(e) => setGroup(e.target.value)}
            className="mt-1 block border border-border/50 bg-noir-950 px-2 py-1.5 text-xs text-foreground">
            {Object.keys(GROUPS).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Search
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="action, actor, resource"
            className="mt-1 block w-56 border border-border/50 bg-noir-950 px-2 py-1.5 text-xs text-foreground placeholder:text-foreground/40" />
        </label>

        <div className="ml-auto flex gap-2">
          <button onClick={() => exportCsv(fileBase, exportRows())}
            className="border border-gold/50 px-3 py-2 text-[11px] uppercase tracking-wider text-gold hover:bg-noir-800">
            Export CSV
          </button>
          <button
            onClick={() =>
              exportPdf({
                title: "ResoFlex — Security Audit Log",
                subtitle: `${from} → ${to} · filter: ${group} · ${filtered.length} events`,
                columns: ["timestamp", "action", "resource_type", "resource_id", "result", "actor_email", "ip"],
                rows: exportRows(),
              })
            }
            className="border border-gold/50 px-3 py-2 text-[11px] uppercase tracking-wider text-gold hover:bg-noir-800">
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <tr>
              <th className="p-3">Time</th><th className="p-3">Action</th><th className="p-3">Resource</th>
              <th className="p-3">Result</th><th className="p-3">Actor</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && <tr><td colSpan={5} className="p-6 text-center text-foreground/40">Loading…</td></tr>}
            {rows !== null && filtered.map((r) => (
              <tr key={r.id} className="border-t border-border/20">
                <td className="p-3 text-foreground/60">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 text-gold">{r.action}</td>
                <td className="p-3 text-foreground/70">{r.resource_type}{r.resource_id ? ` · ${r.resource_id}` : ""}</td>
                <td className="p-3 text-foreground/70">{r.result}</td>
                <td className="p-3 text-foreground/50">{r.actor_email ?? r.actor_id ?? "system"}</td>
              </tr>
            ))}
            {rows !== null && !filtered.length && (
              <tr><td colSpan={5} className="p-6 text-center text-foreground/40">No audit events in range.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
