"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

// Content cut to a fixed height (max-h-64, 16rem) with a fade over its
// bottom edge — from the background up to transparent — and a "Läs mer"
// button that shows all of it ("Visa mindre" folds it again). Only when the
// content is taller than that; shorter content shows as it is
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

  // Whether the content is taller than the collapsed height, re-checked as
  // it resizes (fonts loading, the window narrowing)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const collapsed = !expanded;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative w-full">
        <div
          ref={contentRef}
          className={collapsed ? "max-h-64 overflow-hidden" : ""}
        >
          {children}
        </div>
        {collapsed && overflows && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"
          />
        )}
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
              onClick={() => setExpanded((e) => !e)}
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
