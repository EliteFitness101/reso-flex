import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { waUrl } from "@/lib/waScript";
import { bumpIntent, lockFunnel } from "@/lib/funnelLock";

const WA_URL = waUrl({ source: "chatb2k" });

type CTA = { label: string; href: string; event?: string };
type Msg = { role: "user" | "bot"; text: string; cta?: CTA[]; options?: Option[] };
type Option = { label: string; next: string };

// =========================================================================
// Structured decision tree — guides the user from goal → fitness level →
// constraint → personalized B2K plan + equipment bundle recommendation.
// =========================================================================
type Node = {
  text: string;
  options?: Option[];
  cta?: CTA[];
};

const TREE: Record<string, Node> = {
  root: {
    text: "What's your #1 goal right now? I'll match you to the right B2K plan + equipment in 3 quick taps.",
    options: [
      { label: "🔥 Fat loss", next: "goal_fat" },
      { label: "🍑 Glute / curve growth", next: "goal_curve" },
      { label: "💪 Build strength", next: "goal_strength" },
      { label: "❤️ Cardio & wellness", next: "goal_cardio" },
    ],
  },

  // ---------- FAT LOSS ----------
  goal_fat: {
    text: "Got it — fat loss. What's your current fitness level?",
    options: [
      { label: "Beginner (0–3 mo)", next: "fat_beginner" },
      { label: "Intermediate", next: "fat_intermediate" },
      { label: "Advanced", next: "fat_advanced" },
    ],
  },
  fat_beginner: {
    text: "Perfect starting point. Your space constraint?",
    options: [
      { label: "Small apartment", next: "rec_walkingpad_b2kcore" },
      { label: "Full home gym room", next: "rec_treadmill25_b2kcore" },
    ],
  },
  fat_intermediate: {
    text: "Nice. Pick your budget tier:",
    options: [
      { label: "Under ₦300k", next: "rec_walkingpad_b2kpro" },
      { label: "₦300k–₦700k", next: "rec_treadmill3_b2kpro" },
      { label: "Premium ₦700k+", next: "rec_treadmill4_b2kelite" },
    ],
  },
  fat_advanced: {
    text: "Elite track. Cardio preference?",
    options: [
      { label: "Running", next: "rec_treadmill4_b2kelite" },
      { label: "Spin / HIIT", next: "rec_spin_b2kelite" },
    ],
  },

  // ---------- CURVE / GLUTE ----------
  goal_curve: {
    text: "Love it — glute & curve focus. Where are you starting?",
    options: [
      { label: "Beginner", next: "rec_b2kstarter" },
      { label: "Some training history", next: "rec_b2kcore" },
      { label: "Advanced sculpt", next: "rec_b2kelite_full" },
    ],
  },

  // ---------- STRENGTH ----------
  goal_strength: {
    text: "Strength build — do you want cardio paired with it?",
    options: [
      { label: "Yes, conditioning", next: "rec_treadmill3_b2kpro" },
      { label: "No, just coaching", next: "rec_b2kpro_only" },
    ],
  },

  // ---------- CARDIO / WELLNESS ----------
  goal_cardio: {
    text: "Wellness cardio — daily time you can give?",
    options: [
      { label: "15–30 min", next: "rec_walkingpad_b2kstarter" },
      { label: "45+ min", next: "rec_treadmill25_b2kcore" },
    ],
  },

  // =================== RECOMMENDATIONS (LEAF NODES) ===================
  rec_walkingpad_b2kcore: {
    text:
      "✅ My pick: **ResoFlex Walking Pad + B2K Core**. Compact, NEPA-safe, 10k steps daily — paired with the Core curve & nutrition system. Total ≈ ₦280k.",
    cta: [
      { label: "View Bundle", href: "#products" },
      { label: "Free Assessment", href: "https://reso-fit.lovable.app", event: "assessment_click" },
      { label: "Restart", href: "#restart" },
    ],
  },
  rec_walkingpad_b2kpro: {
    text:
      "✅ Pick: **Walking Pad + B2K Pro**. Sustainable fat loss with priority coach support. Total ≈ ₦295k.",
    cta: [
      { label: "View Bundle", href: "#products" },
      { label: "Talk to Coach", href: WA_URL, event: "whatsapp_click" },
      { label: "Restart", href: "#restart" },
    ],
  },
  rec_walkingpad_b2kstarter: {
    text:
      "✅ Pick: **Walking Pad + B2K Starter**. Easy entry — daily walking + foundational guidance. Total ≈ ₦255k.",
    cta: [
      { label: "View Bundle", href: "#products" },
      { label: "Restart", href: "#restart" },
    ],
  },
  rec_treadmill25_b2kcore: {
    text:
      "✅ Pick: **ResoFlex 2.5HP + B2K Core**. Voltage-hardened motor, foldable, full coaching + meal blueprint.",
    cta: [
      { label: "View Treadmills", href: "#products" },
      { label: "Free Assessment", href: "https://reso-fit.lovable.app", event: "assessment_click" },
      { label: "Restart", href: "#restart" },
    ],
  },
  rec_treadmill3_b2kpro: {
    text:
      "✅ Pick: **ResoFlex 3.0HP + B2K Pro**. Serious cardio engine + advanced periodized coaching.",
    cta: [
      { label: "View Treadmills", href: "#products" },
      { label: "Talk to Coach", href: WA_URL, event: "whatsapp_click" },
      { label: "Restart", href: "#restart" },
    ],
  },
  rec_treadmill4_b2kelite: {
    text:
      "✅ Flagship pick: **ResoFlex 4.0HP Elite + B2K Elite 90-Day**. Marathon-grade motor, VIP coach access, full transformation roadmap.",
    cta: [
      { label: "View Flagship", href: "#products" },
      { label: "Free Assessment", href: "https://reso-fit.lovable.app", event: "assessment_click" },
      { label: "Restart", href: "#restart" },
    ],
  },
  rec_spin_b2kelite: {
    text:
      "✅ Pick: **ResoFlex Spin Bike + B2K Elite**. HIIT-ready, magnetic resistance, VIP coaching.",
    cta: [
      { label: "View Spin Bike", href: "#products" },
      { label: "Restart", href: "#restart" },
    ],
  },
  rec_b2kstarter: {
    text: "✅ **B2K Starter (₦5k)** — perfect first step into glute training + nutrition basics.",
    cta: [{ label: "Get B2K Starter", href: "#products" }, { label: "Restart", href: "#restart" }],
  },
  rec_b2kcore: {
    text: "✅ **B2K Core (₦12k)** — complete sculpt & lift system with coach guidance.",
    cta: [{ label: "Get B2K Core", href: "#products" }, { label: "Restart", href: "#restart" }],
  },
  rec_b2kpro_only: {
    text: "✅ **B2K Pro (₦25k)** — advanced periodized strength + priority coach support.",
    cta: [{ label: "Get B2K Pro", href: "#products" }, { label: "Restart", href: "#restart" }],
  },
  rec_b2kelite_full: {
    text:
      "✅ **B2K Elite 90-Day (₦50k)** — VIP transformation: personalized weekly plans + direct coach access.",
    cta: [
      { label: "Get B2K Elite", href: "#products" },
      { label: "Talk to Coach", href: WA_URL, event: "whatsapp_click" },
      { label: "Restart", href: "#restart" },
    ],
  },
};

// Fallback keyword answers when user types free-text.
function freeText(input: string): Msg {
  const q = input.toLowerCase();
  if (/human|advisor|whatsapp|call|agent/.test(q)) {
    return {
      role: "bot",
      text: "Connecting you to a ResoFlex advisor on WhatsApp — average reply under 3 minutes.",
      cta: [{ label: "Open WhatsApp", href: WA_URL, event: "whatsapp_click" }],
    };
  }
  if (/delivery|ship|state/.test(q)) {
    return {
      role: "bot",
      text:
        "Insured delivery: 2–4 days in Lagos/Abuja/PH. 4–7 days nationwide. White-glove install included.",
    };
  }
  if (/warranty|guarantee|return/.test(q)) {
    return {
      role: "bot",
      text: "Full 2-year warranty — motor, frame, electronics. Pay-on-delivery & escrow available.",
    };
  }
  // default: kick into decision tree
  return { role: "bot", text: TREE.root.text, options: TREE.root.options };
}

export const ChatB2K = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text:
        "Welcome to ChatB2K — your luxury fitness advisor. Let's find your perfect plan in 3 taps.",
    },
    { role: "bot", text: TREE.root.text, options: TREE.root.options },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e6, behavior: "smooth" });
  }, [messages, typing]);

  if (!open) return null;

  const pushBot = (m: Msg) => {
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, m]);
      setTyping(false);
    }, 500);
  };

  const choose = (opt: Option) => {
    track("chatb2k_step", { choice: opt.label, next: opt.next });
    setMessages((prev) => [...prev, { role: "user", text: opt.label }]);
    if (opt.next === "restart") {
      pushBot({ role: "bot", text: TREE.root.text, options: TREE.root.options });
      return;
    }
    const node = TREE[opt.next];
    if (!node) return;
    pushBot({ role: "bot", text: node.text, options: node.options, cta: node.cta });
    if (opt.next.startsWith("rec_")) {
      track("chatb2k_recommendation", { node: opt.next });
    }
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    track("chatb2k_message", { length: text.length });
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    pushBot(freeText(text));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/70 backdrop-blur-sm sm:items-center">
      <div className="relative flex h-[85vh] w-full max-w-md flex-col border border-gold/40 bg-noir-900 shadow-[var(--shadow-elevated)] sm:h-[600px]">
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
            onClick={() => {
              track("chatb2k_close");
              onClose();
            }}
            aria-label="Close chat"
            className="grid h-8 w-8 place-items-center text-foreground/60 hover:text-gold"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-gold text-noir-900"
                    : "border border-gold/20 bg-noir-800/80 text-foreground/90"
                }`}
              >
                {m.role === "bot" ? (
                  <span dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong class='text-gold'>$1</strong>") }} />
                ) : (
                  <span>{m.text}</span>
                )}
                {m.options && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {m.options.map((o) => (
                      <button
                        key={o.label}
                        onClick={() => choose(o)}
                        className="border border-gold/40 bg-noir-900/60 px-3 py-2 text-left text-xs font-semibold text-foreground/90 transition hover:border-gold hover:text-gold"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
                {m.cta && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.cta.map((c) =>
                      c.href === "#restart" ? (
                        <button
                          key={c.label}
                          onClick={() => choose({ label: "↻ Restart", next: "restart" })}
                          className="inline-flex items-center gap-1.5 border border-foreground/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/70 hover:border-gold hover:text-gold"
                        >
                          ↻ {c.label}
                        </button>
                      ) : (
                        <a
                          key={c.label}
                          href={c.href}
                          target={c.href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          onClick={() => {
                            if (c.event) track(c.event, { source: "chatb2k_cta", label: c.label });
                            if (c.href.startsWith("#")) onClose();
                          }}
                          className="inline-flex items-center gap-1.5 border border-gold/50 bg-noir-900/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-noir-800"
                        >
                          {c.label}
                        </a>
                      ),
                    )}
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
            placeholder="Or type a question…"
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
