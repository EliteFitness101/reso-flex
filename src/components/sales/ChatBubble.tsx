import { lazy, Suspense, useEffect, useState } from "react";

const ChatB2K = lazy(() =>
  import("./ChatB2K").then((m) => ({ default: m.ChatB2K })),
);

const WA_URL =
  "https://wa.me/2348132255842?text=" +
  encodeURIComponent("Hi, I want help choosing my ResoFlex plan or equipment");

export const ChatBubble = () => {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [lastY, setLastY] = useState(0);

  // Appear after 3s
  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), 3000);
    return () => window.clearTimeout(t);
  }, []);

  // Reappear on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY) setShown(true);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  // Pulse every 6s
  useEffect(() => {
    const id = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1500);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  // Listen for global trigger (e.g. footer button)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chatb2k", handler);
    return () => window.removeEventListener("open-chatb2k", handler);
  }, []);

  return (
    <>
      <div
        className={`fixed bottom-5 right-5 z-[90] transition-all duration-500 ${
          shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative">
          {pulse && (
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-ping rounded-full bg-gold/40"
            />
          )}
          <button
            onClick={() => setOpen(true)}
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
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
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
