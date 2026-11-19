"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import Ticker from "./Ticker";
import { useArticleColor } from "./ArticleTile";
import { cn } from "@/lib/utils";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import ArticleBottomBar from "./ArticleBottomBar";

// Where the reading focus setting (on/off) is remembered
const FOCUS_KEY = "readerFocus";

// The article reader's navbar: a fixed top section, in the same colour as
// the article's tile — the series and title ("<series>: <title>", a
// ticker) top left on mobile; on desktop the series top left and the title
// top centre, as plain text; and "Stäng" top right, back to the articles
// list — and the bottom bar (ArticleBottomBar)
export default function ArticleNavbar({
  slug,
  title,
  series,
  bodyRef,
}: {
  // The article's slug, to find its place in the articles list (its colour)
  slug: string;
  title: string;
  series?: { title: string };
  // The article's body text, which the progress measures
  bodyRef: RefObject<HTMLElement | null>;
}) {
  const tNav = useTranslations("Nav");
  const locale = useLocale();

  // The colour of the article's tile (none if it isn't in the list)
  const color = useArticleColor(slug);

  // Reading progress: 0% when the body's top reaches the top of the
  // screen, 100% when its bottom reaches the bottom of the screen
  const [percent, setPercent] = useState(0);
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setPercent(Math.round(Math.min(Math.max(p, 0), 1) * 100)),
  );

  // "Artiklar — ", before the title (desktop): Artiklar links to the
  // articles list
  const breadcrumb = (
    <span className="shrink-0 whitespace-pre">
      <Link href="/articles" className="hover:opacity-60 transition-opacity">
        {tNav("articles")}
      </Link>
      {" — "}
    </span>
  );

  // Reading focus (on by default), marked on the page (data-focus, which
  // globals.css's rule needs) and remembered in this browser
  const [focus, setFocus] = useState(true);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FOCUS_KEY);
      // After hydration on purpose (the server can't read the browser's
      // storage), so the first render matches the server's
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved != null) setFocus(saved === "on");
    } catch {
      // No storage: on
    }
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-focus", focus);
    try {
      localStorage.setItem(FOCUS_KEY, focus ? "on" : "off");
    } catch {
      // Not saved; it still works for this visit
    }
    return () => root.removeAttribute("data-focus");
  }, [focus]);

  return (
    <>
      {/* Top: the title (mobile) and close, on the background so the
          text scrolls away beneath it. All its text has a 16px line
          height (leading-4), the close cross's size, so they line up */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-20 flex lg:grid lg:grid-cols-12 items-center gap-6 h-9 lg:h-12 pl-3 pr-2 lg:px-6 bg-background text-foreground  ",
          color,
        )}
      >
        {/* Top left: how far through the article (e.g. "42%") */}
        <span
          className="shrink-0 lg:col-start-1 lg:col-span-2 lg:justify-self-start pStyle tabular-nums"
          aria-label={`${percent}%`}
        >
          {percent}%
        </span>
        {/* Mobile: "<series>: <title>", like the hero heading; runs as a
            ticker when it doesn't fit */}
        <span className="lg:hidden flex-1 col-start-1 col-span-2 min-w-0 flex items-baseline pStyle leading-4 tracking-wider ">
          <span className="min-w-0">
            {/* The series upright, the title in italics */}
            <Ticker text={series ? `${series.title}: ${title}` : title}>
              {series && <>{series.title}: </>}
              <span className="italic">{title}</span>
            </Ticker>
          </span>
        </span>
        {/* Desktop: the title top centre (no series), as plain text (no
            ticker), cut off with "…" when it doesn't fit */}
        <span className="hidden lg:flex col-start-3 col-span-8 min-w-0 items-baseline justify-center pStyle uppercase tracking-widest">
          <span className="min-w-0 truncate">{title}</span>
        </span>
        {/* Top right: the close cross */}
        <div className="shrink-0 ml-auto lg:col-start-11 lg:col-span-2 justify-self-end flex items-center">
          <Button
            variant="link"
            size="xs"
            // The bar's text colour (light on the dark tile colour)
            className="w-auto h-auto justify-end lg:h-auto p-0 text-inherit after:content-none hover:opacity-60 transition-opacity"
            asChild
          >
            {/* A thin cross (0.75px lines, 20px), in the bar's text colour;
              back to the articles */}
            <Link href="/articles" aria-label={tNav("closeMenu")}>
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={0.75}
              >
                <path d="M3 3 L17 17 M17 3 L3 17" />
              </svg>
            </Link>
          </Button>
        </div>
      </header>

      {/* Bottom left: "fokus:" and a checkbox, like the drunk filter's
          bottom right (DrunkFilter): ticked, the body text grey except the
          lines in the middle of the screen (ArticleReader); remembered in
          this browser */}
      <label className="pStyle fixed left-[24px] bottom-[24px] z-80 flex h-12 cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap bg-transparent px-6 text-foreground">
        {locale === "sv" ? "fokus:" : "focus:"}
        {/* A custom checkbox: a square (no rounding) with a thin border,
            filled when on. The real checkbox stays (invisible) for
            keyboards and screen readers; the square shows its focus */}
        <input
          type="checkbox"
          checked={focus}
          onChange={(e) => setFocus(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`block size-[12px] rounded-none border transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground ${focus ? "bg-foreground border-foreground" : "bg-background border-foreground"}`}
        />
      </label>

      {/* Settings, next article / clear queue, and the queue */}
      <ArticleBottomBar slug={slug} percent={percent} />
    </>
  );
}
