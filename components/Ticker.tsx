"use client";

import { useEffect, useRef, useState } from "react";

// Ticker speed in pixels per second, so long and short titles move alike
const SPEED = 40;

// Fades the moving text out over 12px at the left and right edges
const EDGE_FADE =
  "linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)";

// Text that, when it doesn't fit its box, runs right to left in an endless
// loop like a newsroom ticker (two copies with a gap, moved left by one
// copy's width, then repeated); when it fits it stays still. Pauses on
// hover; with reduced motion it stays still and is cut off with an ellipsis
// `children`: the same text with styling (e.g. part in italics), shown
// instead of `text`, which stays the plain version (re-measured when it
// changes)
// `align`: where the text sits while still (default centred); `className`:
// added to the box (its size, font…)
export default function Ticker({
  text,
  children,
  align = "center",
  className = "",
}: {
  text: string;
  children?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const content = children ?? text;
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
    // While moving, the text fades out over 12px at each edge, so it
    // slides in and out softly (a mask, so it works on any background)
    <span
      ref={boxRef}
      className={`relative block w-full overflow-hidden whitespace-nowrap ${moving ? "" : `${align === "left" ? "text-left" : "text-center"} text-ellipsis`} ${className}`}
      style={
        moving
          ? { maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }
          : undefined
      }
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
          <span ref={textRef}>{content}</span>
        </span>
        {/* The second copy follows the first, so the loop is seamless */}
        {moving && (
          <span aria-hidden className="pr-12">
            {content}
          </span>
        )}
      </span>
    </span>
  );
}
