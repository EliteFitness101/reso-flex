import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Card, Skeleton } from "@/admin/ui";

const ROLES = [
  "super_admin",
  "catalog_admin",
  "operations_admin",
  "finance_admin",
  "support_admin",
  "content_admin",
  "admin",
  "staff",
  "user",
] as const;

type RoleRow = { id: string; user_id: string; role: string; created_at: string };
type AuditRow = { id: string; action: string; resource_type: string; result: string; created_at: string; actor_email: string | null };

export default function SecurityAdmin() {
  const [roles, setRoles] = useState<RoleRow[] | null>(null);
  const [logs, setLogs] = useState<AuditRow[] | null>(null);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string>("catalog_admin");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("id, action, resource_type, result, created_at, actor_email").order("created_at", { ascending: false }).limit(50),
    ]);
    setRoles((r ?? []) as RoleRow[]);
    setLogs((l ?? []) as AuditRow[]);
  };

  useEffect(() => { load(); }, []);

  const grant = async () => {
    setMsg(null);
    if (!/^[0-9a-f-]{36}$/i.test(userId.trim())) { setMsg("Enter a valid user id (UUID)."); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role: role as never });
    setMsg(error ? error.message : "Role granted.");
    if (!error) { setUserId(""); load(); }
  };

  const revoke = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl uppercase tracking-[0.25em] text-gold">Security</h1>
        <p className="mt-1 text-xs text-foreground/50">Roles are enforced server-side by row-level security. Never trust client state.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Role grants" value={roles?.length ?? "—"} />
        <Card label="Distinct users" value={roles ? new Set(roles.map((r) => r.user_id)).size : "—"} />
        <Card label="Audit entries" value={logs?.length ?? "—"} sub="latest 50" />
      </div>

      <section className="border border-border/40 bg-noir-900/60 p-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Grant role</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID (UUID)"
            className="w-full max-w-sm border border-border/50 bg-noir-950 px-3 py-2 text-xs text-foreground placeholder:text-foreground/40"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border border-border/50 bg-noir-950 px-3 py-2 text-xs text-foreground">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={grant} className="border border-gold/50 px-4 py-2 text-[11px] uppercase tracking-wider text-gold hover:bg-noir-800">
            Grant
          </button>
        </div>
        {msg && <div className="mt-2 text-[11px] text-foreground/60">{msg}</div>}
      </section>

      <section>
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Assigned roles</div>
        {!roles ? <Skeleton className="mt-3 h-32 w-full" /> : (
          <div className="mt-3 overflow-x-auto border border-border/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                <tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Granted</th><th className="p-3" /></tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id} className="border-t border-border/20">
                    <td className="p-3 font-mono text-foreground/70">{r.user_id}</td>
                    <td className="p-3"><Badge tone="amber">{r.role}</Badge></td>
                    <td className="p-3 text-foreground/50">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => revoke(r.id)} className="text-[11px] uppercase tracking-wider text-red-400/80 hover:text-red-400">Revoke</button>
                    </td>
                  </tr>
                ))}
                {!roles.length && <tr><td colSpan={4} className="p-6 text-center text-foreground/40">No roles assigned.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Audit log</div>
        <div className="mt-3 space-y-1 text-[11px] text-foreground/60">
          {(logs ?? []).map((l) => (
            <div key={l.id}>
              {new Date(l.created_at).toLocaleString()} · {l.action} · {l.resource_type} · {l.result}
              {l.actor_email ? ` · ${l.actor_email}` : ""}
            </div>
          ))}
          {logs && !logs.length && <div className="text-foreground/40">No audit entries.</div>}
        </div>
      </section>
    </div>
  );
}
