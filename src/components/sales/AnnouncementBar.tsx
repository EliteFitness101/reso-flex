import { useEffect, useState } from "react";

export const AnnouncementBar = () => {
  const [orders, setOrders] = useState(347);
  const [time, setTime] = useState({ h: 11, m: 47, s: 22 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((p) => {
        let { h, m, s } = p;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
      if (Math.random() > 0.85) setOrders((o) => o + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="sticky top-0 z-50 bg-gradient-noir border-b border-gold/30 backdrop-blur-xl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-60" />
        <div className="container relative flex flex-wrap items-center justify-between gap-2 py-2.5 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 text-gold">
            <i className="fa-solid fa-bolt animate-pulse" />
            <span className="font-semibold tracking-wider uppercase">Launch Discount 22% OFF</span>
            <span className="hidden sm:inline text-foreground/70">— Code</span>
            <span className="rounded border border-gold/60 bg-noir-900 px-2 py-0.5 font-mono text-gold">RESO22</span>
          </div>
          <div className="flex items-center gap-3 text-foreground/80">
            <span className="hidden md:flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>{orders.toLocaleString()} Nigerians ordered today</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-gold">
              <i className="fa-regular fa-clock" />
              {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
