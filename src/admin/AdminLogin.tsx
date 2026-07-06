import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

/** Simple email/password sign-in for admins. New signups must be granted admin manually. */
export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    nav("/admin", { replace: true });
  }

  return (
    <main className="min-h-screen grid place-items-center bg-noir-950 text-foreground px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-gold/40 bg-noir-900/70 p-7 space-y-4">
        <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Admin Sign-in</div>
        <input
          type="email" required placeholder="admin@resoflex.co"
          value={email} onChange={e => setEmail(e.target.value)}
          className="w-full bg-noir-950 border border-border/40 px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          type="password" required placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full bg-noir-950 border border-border/40 px-3 py-2 text-sm outline-none focus:border-gold"
        />
        {err && <div className="text-xs text-red-400">{err}</div>}
        <button
          disabled={busy}
          className="w-full bg-gold text-noir-950 py-2 text-[11px] uppercase tracking-[0.3em] disabled:opacity-50"
        >
          {busy ? "…" : "Sign in"}
        </button>
        <p className="text-[10px] text-foreground/50">
          Access is restricted. Admin role must be granted from the database.
        </p>
      </form>
    </main>
  );
}
