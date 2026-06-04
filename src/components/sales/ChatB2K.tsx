import { useEffect, useRef, useState } from "react";

const WA_URL =
  "https://wa.me/2348132255842?text=" +
  encodeURIComponent("Hi, I want help choosing my ResoFlex plan or equipment");

type Msg = { role: "user" | "bot"; text: string; cta?: { label: string; href: string }[] };

const QUICK = [
  "Recommend a treadmill",
  "B2K plan for fat loss",
  "Best home setup under ₦300k",
  "Talk to a human",
];

// Lightweight decision-tree "ChatB2K" — luxury, Naija-first, conversion-focused.
function answer(input: string): Msg {
  const q = input.toLowerCase();
  const cta = (label: string, href: string) => ({ label, href });

  if (/human|advisor|whatsapp|call|agent/.test(q)) {
    return {
      role: "bot",
      text: "Connecting you to a ResoFlex advisor on WhatsApp now — average reply under 3 minutes.",
      cta: [cta("Open WhatsApp", WA_URL)],
    };
  }
  if (/treadmill|run|cardio/.test(q)) {
    return {
      role: "bot",
      text:
        "For a Lagos/Abuja home, the ResoFlex 4.0HP Elite is our top pick — voltage-hardened motor (140–260V), foldable, 2-year warranty. Run a 60-sec assessment so I match your weight, space and goals.",
      cta: [
        cta("Start Free Assessment", "https://reso-fit.lovable.app"),
        cta("View Treadmill", "#products"),
      ],
    };
  }
  if (/b2k|fat loss|weight loss|transform|plan|program/.test(q)) {
    return {
      role: "bot",
      text:
        "B2K is our 4-tier transformation system: Starter (₦5k), Core (₦12k), Pro (₦25k), Elite (₦50k). For fat loss, most clients start on B2K Core — coaching + meal blueprint + accountability.",
      cta: [
        cta("See B2K Plans", "#products"),
        cta("Explore Programs", "https://joy-funnel-ai.lovable.app"),
      ],
    };
  }
  if (/bundle|setup|home gym|under|budget|naira|₦/.test(q)) {
    return {
      role: "bot",
      text:
        "Under ₦300k, I'd pair the ResoFlex Walking Pad + B2K Core coaching. Compact, NEPA-safe, and gets you 10k steps daily without leaving home.",
      cta: [cta("View Bundle", "#products"), cta("Free Assessment", "https://reso-fit.lovable.app")],
    };
  }
  if (/delivery|ship|lagos|abuja|port harcourt|state/.test(q)) {
    return {
      role: "bot",
      text:
        "Insured delivery: 2–4 working days within Lagos, Abuja, PH. 4–7 days nationwide (all 36 states). White-glove install included.",
      cta: [cta("Chat Advisor", WA_URL)],
    };
  }
  if (/warranty|guarantee|return/.test(q)) {
    return {
      role: "bot",
      text:
        "Full 2-year warranty — motor, frame and electronics — serviced by ResoFlex-certified technicians. Pay-on-delivery & escrow available.",
    };
  }
  if (/price|cost|how much/.test(q)) {
    return {
      role: "bot",
      text:
        "Pricing spans ₦5k (B2K Starter) to flagship treadmills. Tell me your goal and budget and I'll narrow it down in one reply.",
      cta: [cta("Browse Catalog", "#products")],
    };
  }
  return {
    role: "bot",
    text:
      "I'm ChatB2K — your ResoFlex advisor. Ask me about equipment, B2K coaching plans, bundles, or delivery. Or jump straight to the assessment.",
    cta: [
      cta("Free Assessment", "https://reso-fit.lovable.app"),
      cta("Open WhatsApp", WA_URL),
    ],
  };
}

export const ChatB2K = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text:
        "Welcome to ChatB2K — your luxury fitness advisor. How can I help you transform today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e6, behavior: "smooth" });
  }, [messages, typing]);

  if (!open) return null;

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, answer(text)]);
      setTyping(false);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/70 backdrop-blur-sm sm:items-center">
      <div className="relative flex h-[85vh] w-full max-w-md flex-col border border-gold/40 bg-noir-900 shadow-[var(--shadow-elevated)] sm:h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/25 bg-noir-800/60 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-gradient-gold text-noir-900 shadow-gold">
              <i className="fa-solid fa-infinity" />
            </span>
            <div>
              <div className="font-display text-sm font-bold">ChatB2K Advisor</div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Online
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="grid h-8 w-8 place-items-center text-foreground/60 hover:text-gold"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-gold text-noir-900"
                    : "border border-gold/20 bg-noir-800/80 text-foreground/90"
                }`}
              >
                {m.text}
                {m.cta && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.cta.map((c) => (
                      <a
                        key={c.label}
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        onClick={c.href.startsWith("#") ? onClose : undefined}
                        className="inline-flex items-center gap-1.5 border border-gold/50 bg-noir-900/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-noir-800"
                      >
                        {c.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex gap-1 border border-gold/20 bg-noir-800/80 px-3 py-2.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Quick replies */}
        <div className="flex flex-wrap gap-1.5 border-t border-gold/15 bg-noir-800/40 px-3 py-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="border border-gold/30 px-2.5 py-1 text-[11px] text-foreground/80 hover:border-gold hover:text-gold"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 border-t border-gold/25 bg-noir-900 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ChatB2K…"
            className="flex-1 border border-gold/30 bg-noir-800 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="bg-gradient-gold px-4 text-noir-900 shadow-gold hover:opacity-90"
            aria-label="Send"
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </form>
      </div>
    </div>
  );
};

export const WA_LINK = WA_URL;
