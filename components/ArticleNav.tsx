"use client";

import { useState, type RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Button } from "./ui/button";
import GlyphBorder from "./GlyphBorder";

// Floating reading nav, framed like LLBottomBar (top ❦ flipped / left ☙ /
// bottom ❦ / right ❧). Appears at the bottom centre once the reader scrolls;
// ☝ jumps back to the top, the percentage fills up as the body text is read.
export default function ArticleNav({
  bodyRef,
}: {
  bodyRef: RefObject<HTMLElement | null>;
}) {
  const [visible, setVisible] = useState(false);
  const [percent, setPercent] = useState(0);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 50));

  // 0% when the body's top reaches the top of the screen,
  // 100% when its bottom reaches the bottom of the screen
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setPercent(Math.round(Math.min(Math.max(p, 0), 1) * 100)),
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          className="fixed bottom-6 left-1/2 z-20 flex flex-col font-baskervilleNeoText text-xl leading-none"
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 16, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <GlyphBorder
            glyph="❦"
            trimEnd={2}
            className="-scale-y-100 bg-linear-to-t from-transparent to-background ml-3 -mr-3"
          />
          <div className="flex w-full">
            <GlyphBorder
              glyph="☙"
              vertical
              className="bg-linear-to-r from-transparent to-background"
            />
            <span className="flex items-center px-1.5 bg-background">
              <Button
                variant="ghost"
                size="sm"
                aria-label="till toppen"
                className="w-auto h-16 px-6"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                ☝
              </Button>
              {/* Progress bar: the fill grows with the reading percentage */}
              <div
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="relative h-16 w-24 flex items-center justify-center font-baskervilleNeoText tracking-[12%] text-sm"
              >
                <span
                  className="absolute inset-y-0 left-0 bg-foreground/+"
                  style={{ width: `${percent}%` }}
                />
                <span className="relative">{percent}%</span>
              </div>
            </span>
            <GlyphBorder
              glyph="❧"
              vertical
              className="bg-linear-to-l from-transparent to-background"
            />
          </div>
          <GlyphBorder
            glyph="❦"
            trimEnd={2}
            className="bg-linear-to-t from-transparent to-background ml-3 -mr-3"
          />
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
