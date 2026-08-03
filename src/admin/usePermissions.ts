import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Reads the caller's effective permissions via the RBAC tables. */
export function usePermissions() {
  const [perms, setPerms] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) { if (!cancelled) setPerms([]); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);

      const roleList = (roles ?? []).map((r) => r.role);
      if (!roleList.length) { if (!cancelled) setPerms([]); return; }

      const { data: rp } = await supabase
        .from("role_permissions")
        .select("permission_code")
        .in("role", roleList as never);

      if (!cancelled) setPerms([...new Set((rp ?? []).map((r) => r.permission_code as string))]);
    })();
    return () => { cancelled = true; };
  }, []);

  return {
    perms,
    loading: perms === null,
    can: (code: string) => !!perms?.includes(code),
  };
}
