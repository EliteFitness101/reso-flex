import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Minimum reserved height to prevent layout shift before hydration. */
  minHeight?: number;
  /** Distance ahead of viewport to start mounting. */
  rootMargin?: string;
  /** Force-mount after N ms even if observer hasn't fired (guarantees visibility). */
  forceAfterMs?: number;
};

/**
 * Mounts children only when scrolled near the viewport.
 * Uses IntersectionObserver; falls back to immediate mount where unsupported.
 */
export const LazySection = ({
  children,
  minHeight = 400,
  rootMargin = "300px 0px",
  forceAfterMs,
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);

    let t: number | undefined;
    if (forceAfterMs) {
      t = window.setTimeout(() => setVisible(true), forceAfterMs);
    }
    return () => {
      io.disconnect();
      if (t) window.clearTimeout(t);
    };
  }, [visible, rootMargin, forceAfterMs]);

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
};
