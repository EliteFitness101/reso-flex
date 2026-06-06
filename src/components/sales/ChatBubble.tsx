import { lazy, Suspense, useEffect, useState } from "react";
import { track } from "@/lib/track";
import { waUrl } from "@/lib/waScript";
import { bumpIntent, lockFunnel } from "@/lib/funnelLock";

const ChatB2K = lazy(() =>
  import("./ChatB2K").then((m) => ({ default: m.ChatB2K })),
);

export const ChatBubble = () => {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Appear after 3s — fixed position, no layout shift (out of normal flow).
  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), 3000);
    return () => window.clearTimeout(t);
  }, []);

  // Reappear on scroll-up (uses ref, not state, to avoid re-renders).
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < lastY - 4) setShown(true);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pulse every 6s.
  useEffect(() => {
    const id = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1500);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => {
      track("chatb2k_open", { source: "global_event" });
      setOpen(true);
    };
    window.addEventListener("open-chatb2k", handler);
    return () => window.removeEventListener("open-chatb2k", handler);
  }, []);

  const handleOpen = () => {
    track("chatb2k_open", { source: "bubble" });
    bumpIntent(6, "bubble_open");
    lockFunnel("chatb2k", "bubble", "medium");
    setOpen(true);
  };

  const handleWA = () => {
    track("whatsapp_click", { source: "bubble" });
    bumpIntent(5, "bubble_wa");
    lockFunnel("whatsapp", "bubble", "soft");
  };

  return (
    <>
      <div
        className={`fixed bottom-5 right-5 z-[90] transition-opacity duration-500 ${
          shown ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          // Reserve box to prevent any browser repaint shift when toggling
          willChange: "opacity",
          contain: "layout paint",
        }}
      >
        <div className="relative">
          {pulse && (
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-ping rounded-full bg-gold/40"
            />
          )}
          <button
            onClick={handleOpen}
            aria-label="Open ChatB2K Advisor"
            className="group flex items-center gap-2 rounded-full border border-gold/60 bg-noir-900/85 px-4 py-3 text-gold shadow-gold backdrop-blur-xl transition hover:bg-noir-800 sm:px-5"
            style={{ animation: "floatY 4s ease-in-out infinite" }}
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-noir-900">
              <i className="fa-solid fa-comments" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-noir-900 animate-pulse" />
            </span>
            <span className="hidden text-xs font-bold uppercase tracking-[0.2em] sm:inline">
              ChatB2K Advisor
            </span>
          </button>
          <a
            href={waUrl({ source: "bubble" })}
            target="_blank"
            rel="noreferrer"
            onClick={handleWA}
            aria-label="WhatsApp ResoFlex"
            className="absolute -top-2 -left-2 grid h-7 w-7 place-items-center rounded-full border border-gold/50 bg-noir-900 text-[#25D366] shadow-gold hover:scale-110 transition"
          >
            <i className="fa-brands fa-whatsapp text-sm" />
          </a>
        </div>
        <style>{`@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
      </div>

      <Suspense fallback={null}>
        <ChatB2K open={open} onClose={() => setOpen(false)} />
      </Suspense>
    </>
  );
};
