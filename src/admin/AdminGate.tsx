import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "authed" | "denied" | "signed_out";

/** Gates admin routes: requires Supabase auth session + `admin` role. */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("loading");
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapMsg, setBootstrapMsg] = useState<string | null>(null);

  async function check() {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) { setState("signed_out"); return; }
    const { data: isAdmin, error } = await supabase.rpc("has_role", {
      _user_id: sess.session.user.id,
      _role: "admin",
    });
    if (error || !isAdmin) setState("denied");
    else setState("authed");
  }

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await check(); })();
    const sub = supabase.auth.onAuthStateChange(() => { if (!cancelled) check(); });
    return () => { cancelled = true; sub.data.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function claimAdmin() {
    setBootstrapping(true); setBootstrapMsg(null);
    const { data, error } = await supabase.rpc("bootstrap_first_admin");
    setBootstrapping(false);
    if (error) { setBootstrapMsg(error.message); return; }
    const status = (data as any)?.status;
    if (status === "bootstrapped" || status === "already_admin") {
      setBootstrapMsg("Admin role granted. Refreshing…");
      await check();
    } else {
      setBootstrapMsg("An admin already exists. Ask them to grant you access.");
    }
  }

  if (state === "loading") {
    return <div className="min-h-screen grid place-items-center bg-noir-950 text-foreground/60 text-xs uppercase tracking-[0.35em]">Verifying access…</div>;
  }
  if (state === "signed_out") return <Navigate to="/admin/login" replace />;
  if (state === "denied") {
    return (
      <div className="min-h-screen grid place-items-center bg-noir-950 px-4">
        <div className="max-w-md w-full border border-border/40 bg-noir-900/70 p-6 text-center space-y-4">
          <div className="text-red-400 text-sm">Access denied. Your account does not have admin privileges.</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">First-time setup</div>
          <button
            onClick={claimAdmin}
            disabled={bootstrapping}
            className="w-full border border-gold/60 text-gold px-4 py-2 text-xs uppercase tracking-[0.25em] hover:bg-gold/10 disabled:opacity-40"
          >
            {bootstrapping ? "Claiming…" : "Claim first admin role"}
          </button>
          {bootstrapMsg && <div className="text-xs text-foreground/70">{bootstrapMsg}</div>}
          <p className="text-[10px] text-foreground/40">
            Works only if no admin exists yet. After the first admin is created, ask them to grant you the role,
            and the bootstrap function should be revoked in the database.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

