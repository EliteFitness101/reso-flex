import { Link, NavLink, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/admin", end: true, label: "Dashboard" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/fulfillment", label: "Fulfillment" },
  { to: "/admin/chatb2k", label: "ChatB2K" },
  { to: "/admin/resellers", label: "Resellers" },
  { to: "/admin/whatsapp", label: "WhatsApp" },
];


export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-noir-950 text-foreground">
      <header className="border-b border-border/30 bg-noir-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="text-[10px] uppercase tracking-[0.35em] text-gold">ResoFlex // Revenue OS</Link>
          <nav className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.25em]">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={(l as any).end}
                className={({ isActive }) =>
                  `px-2 py-1 border ${isActive ? "border-gold text-gold" : "border-transparent text-foreground/60 hover:text-foreground"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => supabase.auth.signOut()}
            className="ml-auto text-[10px] uppercase tracking-[0.25em] text-foreground/50 hover:text-red-400"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
