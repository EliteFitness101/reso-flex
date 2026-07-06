import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "authed" | "denied" | "signed_out";

/** Gates admin routes: requires Supabase auth session + `admin` role. */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { if (!cancelled) setState("signed_out"); return; }
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: sess.session.user.id,
        _role: "admin",
      });
      if (cancelled) return;
      if (error || !isAdmin) setState("denied");
      else setState("authed");
    }
    check();
    const sub = supabase.auth.onAuthStateChange(() => check());
    return () => { cancelled = true; sub.data.subscription.unsubscribe(); };
  }, []);

  if (state === "loading") {
    return <div className="min-h-screen grid place-items-center bg-noir-950 text-foreground/60 text-xs uppercase tracking-[0.35em]">Verifying access…</div>;
  }
  if (state === "signed_out") return <Navigate to="/admin/login" replace />;
  if (state === "denied") {
    return (
      <div className="min-h-screen grid place-items-center bg-noir-950 text-red-400 text-sm">
        Access denied. Your account does not have admin privileges.
      </div>
    );
  }
  return <>{children}</>;
}
