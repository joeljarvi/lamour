"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// A column of line numbers, 1, 2, 3… from top to bottom, one per line of
// pStyle text (18px on mobile and desktop, tight leading: 22.5px a line),
// so they line up with pStyle text beside them. It fills its parent's
// height (absolute, inset-y-0) and counts how many lines fit: its own
// height over the line height, which it reads from its own style (so it
// follows any change to pStyle). Recounted whenever its size changes.
// `className` places it (e.g. "left-0 w-8") or restyles the numbers.
// Tied to scrolling: the row at the middle of the screen is dark
// (text-neutral-800), each row above and below it a step lighter
// (700, 600, 500, 400), then the rest light: a falloff that moves with the page

// Height (px) of one row
const ROW = 24;

// Each row's colour by its distance from the middle row (0 = the middle);
// further out, the list's own text-neutral-300
const FALLOFF = [
  "text-neutral-800",
  "text-neutral-700",
  "text-neutral-600",
  "text-neutral-500",
  "text-neutral-400",
];

export default function LineNumbers({
  className,
  // "line-numbers" (the one the menu's section links measure from); a
  // second list on the same page (the issue page over the shop) needs
  // its own
  id = "line-numbers",
}: {
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLOListElement>(null);
  const [count, setCount] = useState(0);
  // The row (1-based) at the middle of the screen
  const [center, setCenter] = useState<number | null>(null);

  // Which row is at the middle of the screen: from where the list's top
  // edge is now, on every scroll and resize
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const listTop = el.getBoundingClientRect().top;
      setCenter(Math.floor((window.innerHeight / 2 - listTop) / ROW) + 1);
    };
    update();
    // Any scrolling, the page's or a box's (the issue page scrolls in its
    // own box): scroll events don't bubble, so caught on the way down
    document.addEventListener("scroll", update, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", update);
    return () => {
      document.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      if (!lineHeight) return;
      setCount(Math.floor(el.clientHeight / lineHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // id: where rows are counted from (the menu's section links measure
    // against this list's top edge, row 1)
    <ol
      ref={ref}
      id={id}
      aria-hidden
      className={cn(
        "h-[800vh] hidden lg:block text-xs font-baskervilleNeoText top-0 left-0   leading-[24px] pointer-events-none absolute inset-y-0 list-none overflow-hidden  tabular-nums text-neutral-300 select-none border-r",
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <li
          className={cn(
            "h-[24px] border-b border-b-neutral-200 text-center text-[10px] leading-[24px] w-[24px] flex items-center justify-center transition-colors duration-300",
            // The middle row dark, fading out a step per row on each side
            center !== null && FALLOFF[Math.abs(i + 1 - center)],
          )}
          key={i}
        >
          {i + 1}
        </li>
      ))}
    </ol>
  );
}
