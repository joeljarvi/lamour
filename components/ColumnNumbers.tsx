"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Width (px) of each numbered cell
const CELL = 24;

// A row of numbers, 1, 2, 3… from left to right, each in a 24px-wide cell
// (text-xs), like LineNumbers turned on its side: it fills its parent's
// width (absolute, inset-x-0) and counts how many cells fit, recounting
// whenever its size changes. `className` places it or restyles it
export default function ColumnNumbers({ className }: { className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setCount(Math.floor(el.clientWidth / CELL));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ol
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 hidden lg:flex h-[24px] list-none overflow-hidden font-baskervilleNeoText text-xs tabular-nums text-neutral-400 select-none",
        className,
      )}
    >
      {/* The first cell empty, without borders: the corner, where the
          line numbers' 1 sits, shared by both (so this row goes on from
          2); the rest numbered, each with a line on its right and below
          (the row's bottom edge) */}
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className={cn(
            "h-full w-[24px] shrink-0 text-center text-[10px] h-[24px] leading-[24px] flex items-center justify-center",
            i > 0 && "border-r border-b",
            // Every 15th (15, 30, 45…) a dark line on its right and a dark
            // number, the rest light
            i > 0 &&
              ((i + 1) % 15 === 0
                ? "border-r-neutral-800 text-neutral-800"
                : "border-r-neutral-200"),
          )}
        >
          {i > 0 ? i + 1 : null}
        </li>
      ))}
    </ol>
  );
}
