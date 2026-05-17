import { useState } from "react";

const faqs = [
  { q: "Is the 22% discount automatic?", a: "Yes. The launch coupon RESO22 is auto-applied at Paystack checkout for the first 1,000 customers." },
  { q: "Will it survive Nigerian power supply?", a: "Every ResoFlex motor is voltage-hardened between 140V and 260V with PowerSaver inverter circuitry, tested against generator and inverter power." },
  { q: "How long is delivery?", a: "2–4 working days within Lagos, Abuja and Port Harcourt. 4–7 working days nationwide, all 36 states. Fully insured." },
  { q: "Is the warranty real?", a: "Yes — 2 full years covering motor, frame and electronics, serviced by ResoFlex-certified technicians." },
  { q: "Do you offer installment payments?", a: "Yes. We offer 3-month and 6-month split payment plans through verified partners. Your advisor will share options on WhatsApp." },
  { q: "Can I become a reseller?", a: "Absolutely. Scroll to the Elite Partner Program section and apply. Approval typically within 24 hours." },
];

export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24">
      <div className="container max-w-3xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.35em] text-gold">Answered</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Frequently Asked</h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`glass-panel rounded-xl transition ${isOpen ? "border-gold/60" : ""}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-display text-base font-semibold sm:text-lg">{f.q}</span>
                  <i className={`fa-solid fa-chevron-down text-gold transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-relaxed text-foreground/70 animate-fade-up">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
