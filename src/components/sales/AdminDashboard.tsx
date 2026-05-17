export const AdminDashboard = () => {
  const stats = [
    { l: "Orders Today", v: "184", d: "+12% vs yesterday", i: "fa-cart-shopping" },
    { l: "Payments Cleared", v: "₦47.2M", d: "Paystack settled", i: "fa-money-bill-trend-up" },
    { l: "Reseller Leads", v: "39", d: "Pending approval", i: "fa-handshake" },
    { l: "Ad Conversions", v: "6.4%", d: "Meta + TikTok + Google", i: "fa-bullseye" },
  ];
  return (
    <section className="py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.35em] text-gold">Operator Suite</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Admin <span className="gold-text">Command Center</span>
          </h2>
          <p className="mt-3 text-sm text-foreground/60">Placeholder analytics — wire to your backend.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">{s.l}</span>
                <i className={`fa-solid ${s.i} text-gold`} />
              </div>
              <div className="mt-3 font-display text-3xl font-bold gold-text">{s.v}</div>
              <div className="mt-1 text-xs text-foreground/55">{s.d}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold">Live Order Feed</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["#10241", "ResoFlex 2.5HP", "Lagos", "₦608,400"],
                ["#10240", "Walking Pad", "Abuja", "₦351,000"],
                ["#10239", "ResoFlex 3.0HP", "Port Harcourt", "₦741,000"],
                ["#10238", "Spin Bike", "Ibadan", "₦351,000"],
              ].map(([id, p, c, amt]) => (
                <li key={id} className="flex items-center justify-between rounded-lg bg-noir-900/60 px-3 py-2.5">
                  <span className="font-mono text-xs text-foreground/55">{id}</span>
                  <span className="flex-1 px-3 text-foreground/85 truncate">{p}</span>
                  <span className="text-xs text-foreground/55 hidden sm:inline">{c}</span>
                  <span className="ml-3 font-semibold text-gold">{amt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold">Campaign Conversion</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["Meta Ads", 78],
                ["TikTok Ads", 64],
                ["Google Ads", 52],
                ["Organic / Direct", 38],
              ].map(([name, pct]) => (
                <li key={name as string}>
                  <div className="flex justify-between text-xs text-foreground/65">
                    <span>{name}</span><span className="text-gold">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-noir-900">
                    <div className="h-full bg-gradient-gold" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
