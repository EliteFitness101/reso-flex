// Standalone ChatB2K™ route — reuses the existing ChatB2K component.
// Attribution (rsid/utm/anon_id), memory and analytics all live inside that
// component + its hooks, so nothing is duplicated here.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatB2K } from "@/components/sales/ChatB2K";
import { captureAttribution } from "@/lib/attribution";
import { track } from "@/lib/track";
import { setSeo } from "@/lib/seo";

export default function ChatB2KPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try { captureAttribution(); } catch { /* non-fatal */ }
    setSeo({
      title: "ChatB2K™ Free Fitness Assessment — ResoFlex",
      description:
        "Take the free ChatB2K™ assessment and get matched to the right B2K plan and ResoFlex equipment in three quick taps.",
      path: "/chatb2k",
    });
    track("chatb2k_open", { source: "standalone_route" });
  }, []);

  return (
    <main className="min-h-screen bg-noir-950">
      <h1 className="sr-only">ChatB2K™ Fitness Assessment</h1>
      <ChatB2K open onClose={() => navigate("/")} />
    </main>
  );
}
