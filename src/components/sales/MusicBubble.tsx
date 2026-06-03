import { useState } from "react";

/**
 * Floating music bubble. The audio iframe is NOT mounted until the user clicks play.
 * No autoplay. Mobile-data friendly.
 */
export const MusicBubble = () => {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      {open && (
        <div className="mb-3 w-72 border border-gold/40 bg-noir-900/95 p-3 shadow-[var(--shadow-elevated)] backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold">// Sovereign FM</span>
            <button
              aria-label="Close music"
              onClick={() => setOpen(false)}
              className="text-foreground/60 hover:text-foreground"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {!playing ? (
            <button
              onClick={() => setPlaying(true)}
              className="luxury-button inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-[11px]"
            >
              <i className="fa-solid fa-play" /> Play ambient mix
            </button>
          ) : (
            <iframe
              title="Sovereign FM ambient mix"
              src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0"
              width="100%"
              height="80"
              loading="lazy"
              allow="autoplay; encrypted-media"
              className="border border-gold/30"
            />
          )}
          <p className="mt-2 text-[10px] leading-relaxed text-foreground/50">
            Tap play to load the audio stream. No autoplay — data-safe.
          </p>
        </div>
      )}

      <button
        aria-label={open ? "Hide music player" : "Show music player"}
        onClick={() => setOpen((v) => !v)}
        className="luxury-button flex h-12 w-12 items-center justify-center rounded-full shadow-gold"
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-music"} text-base`} />
      </button>
    </div>
  );
};
