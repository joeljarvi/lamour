"use client";

import { useEffect, useRef, useState } from "react";

// Ticker speed in pixels per second, so long and short titles move alike
const SPEED = 40;

// Text that, when it doesn't fit its box, runs right to left in an endless
// loop like a newsroom ticker (two copies with a gap, moved left by one
// copy's width, then repeated); when it fits it stays still. Pauses on
// hover; with reduced motion it stays still and is cut off with an ellipsis
export default function Ticker({ text }: { text: string }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  // Seconds one loop takes, or null while the text fits
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const textEl = textRef.current;
    if (!box || !textEl) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      const overflows = textEl.offsetWidth > box.clientWidth;
      // One loop moves one copy plus its gap (pr-12, 48px)
      setDuration(
        overflows && !reducedMotion.matches
          ? (textEl.offsetWidth + 48) / SPEED
          : null,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(textEl);
    reducedMotion.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", measure);
    };
  }, [text]);

  const moving = duration !== null;

  return (
    <span
      ref={boxRef}
      className={`relative block w-full overflow-hidden whitespace-nowrap ${moving ? "" : "text-center text-ellipsis"}`}
    >
      <span
        className={moving ? "ticker inline-flex" : ""}
        style={
          moving
            ? ({ "--ticker-duration": `${duration}s` } as React.CSSProperties)
            : undefined
        }
      >
        <span className={moving ? "pr-12" : ""}>
          <span ref={textRef}>{text}</span>
        </span>
        {/* The second copy follows the first, so the loop is seamless */}
        {moving && (
          <span aria-hidden className="pr-12">
            {text}
          </span>
        )}
      </span>
      {/* While moving, a 12px fade from the background on each edge, so
          the text slides in and out softly */}
      {moving && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-linear-to-r from-background to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-3 bg-linear-to-l from-background to-transparent"
          />
        </>
      )}
    </span>
  );
}
