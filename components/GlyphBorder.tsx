"use client";

import { useLayoutEffect, useRef, useState } from "react";

// A strip of ornament glyphs. Only whole glyphs are drawn: the strip and one
// glyph are measured, as many as fit are rendered and spread evenly to both
// ends. The strip is as thick as the glyph so nothing is clipped sideways.
// `trimEnd` hides that many glyphs at the far end (spacing unchanged) to
// leave a corner free.
export default function GlyphBorder({
  glyph,
  vertical = false,
  trimEnd = 0,
  className = "",
}: {
  glyph: string;
  vertical?: boolean;
  trimEnd?: number;
  className?: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [thickness, setThickness] = useState<number>();

  useLayoutEffect(() => {
    const strip = stripRef.current;
    const probe = probeRef.current;
    if (!strip || !probe) return;

    const measure = () => {
      const g = probe.getBoundingClientRect();
      const glyphLength = vertical ? g.height : g.width;
      const stripLength = vertical ? strip.clientHeight : strip.clientWidth;
      setThickness(vertical ? g.width : g.height);
      setCount(glyphLength > 0 ? Math.floor(stripLength / glyphLength) : 0);
    };

    measure();
    // Re-measure on resize and once the web font has loaded
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [vertical]);

  // Each glyph's share of the strip; the mask fades out across the first
  // trimmed glyph and is fully transparent after it
  const slot = count > 0 ? 100 / count : 0;
  const visibleEnd = (count - trimEnd) * slot;
  const trimMask = `linear-gradient(to ${vertical ? "bottom" : "right"}, black ${visibleEnd}%, transparent ${visibleEnd + slot}%)`;

  return (
    <div
      ref={stripRef}
      aria-hidden
      className={`relative shrink-0 overflow-hidden text-[9px] lg:text-xs leading-none ${
        vertical ? "self-stretch" : "self-stretch mx-3"
      } ${className}`}
      style={{
        ...(vertical ? { width: thickness } : { height: thickness }),
        // Fade the strip (background included) out over the trimmed glyphs,
        // so the freed corner is fully transparent
        ...(trimEnd > 0 && count > trimEnd && { maskImage: trimMask }),
      }}
    >
      {/* Invisible single glyph used for measuring */}
      <span ref={probeRef} className="absolute invisible">
        {glyph}
      </span>
      <div
        className={`absolute inset-0 flex justify-between ${
          vertical ? "flex-col items-center" : "flex-row items-center"
        }`}
      >
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={i >= count - trimEnd ? "invisible" : ""}>
            {glyph}
          </span>
        ))}
      </div>
    </div>
  );
}
