"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

// Collapsed height (16rem)
const COLLAPSED_HEIGHT = 256;

// Content cut to a fixed height (COLLAPSED_HEIGHT) with a fade over its
// bottom edge — from the background up to transparent — and a "Läs mer"
// button that shows all of it ("Visa mindre" folds it again), animating the
// height so what's below slides along. Only when the content is taller than
// that; shorter content shows as it is
export default function ReadMore({
  children,
  aside,
}: {
  children: ReactNode;
  // Shown at the right end of the button's line, on its baseline (and on
  // its own when there's no button)
  aside?: ReactNode;
}) {
  const t = useTranslations("Issue");
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Animate only once the button has been used, so the first measurement
  // folds the content instantly instead of visibly collapsing it on open
  const [toggled, setToggled] = useState(false);
  const transition = {
    duration: toggled ? 0.4 : 0,
    ease: "easeInOut",
  } as const;

  // Whether the content is taller than the collapsed height, re-checked as
  // it resizes (fonts loading, the window narrowing)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.offsetHeight > COLLAPSED_HEIGHT + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const collapsed = !expanded;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative w-full">
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{
            height: collapsed && overflows ? COLLAPSED_HEIGHT : "auto",
          }}
          transition={transition}
        >
          {/* Measured at its natural height */}
          <div ref={contentRef}>{children}</div>
        </motion.div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"
          initial={false}
          animate={{ opacity: collapsed && overflows ? 1 : 0 }}
          transition={transition}
        />
      </div>
      {(overflows || expanded || aside) && (
        // The button on the left, `aside` on the right, on one baseline
        <div className="mt-6 flex w-full items-baseline justify-between gap-6">
          {(overflows || expanded) && (
            <Button
              variant="link"
              size="xs"
              aria-expanded={expanded}
              className={`w-auto after:opacity-100 text-foreground ${expanded ? "after:content-['☝']" : "after:content-['☟']"}`}
              onClick={() => {
                setToggled(true);
                setExpanded((e) => !e);
              }}
            >
              {expanded ? t("readLess") : t("readMore")}
            </Button>
          )}
          {aside && <span className="ml-auto">{aside}</span>}
        </div>
      )}
    </div>
  );
}
