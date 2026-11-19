"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import Ticker from "./Ticker";
import { useArticleColor } from "./ArticleTile";
import { cn } from "@/lib/utils";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import ArticleBottomBar from "./ArticleBottomBar";

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
  const t = useTranslations("Article");
  const tNav = useTranslations("Nav");

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

  return (
    <>
      {/* Top: the title (mobile) and close, on the background so the
          text scrolls away beneath it. All its text has a 16px line
          height (leading-4), the close cross's size, so they line up */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-20 grid grid-cols-3 lg:grid-cols-12 items-center gap-6 h-9 lg:h-[72px] pl-3 pr-2 lg:px-6 bg-background text-foreground border-b border-b-foreground ",
          color,
        )}
      >
        {/* Mobile: "<series>: <title>", like the hero heading; runs as a
            ticker when it doesn't fit */}
        <span className="lg:hidden col-start-1 col-span-2 min-w-0 flex items-baseline pStyle leading-4 tracking-wider ">
          <span className="min-w-0">
            {/* The series upright, the title in italics */}
            <Ticker text={series ? `${series.title}: ${title}` : title}>
              {series && <>{series.title}: </>}
              <span className="italic">{title}</span>
            </Ticker>
          </span>
        </span>
        {/* Desktop: the series top left ("ur — <series>") and the title top
            centre, as plain text (no tickers), cut off with "…" when they
            don't fit */}
        <span className="hidden lg:block col-start-1 col-span-1 lg:col-span-4 min-w-0 truncate pStyle ">
          {/* "ur serien — <series>", the series' name in italics */}
          {series &&
            t.rich("fromSeries", {
              series: series.title,
              i: (chunks) => (
                <span className="italic tracking-wider">{chunks}</span>
              ),
            })}
        </span>
        {/* "Artiklar — <title>", centred */}
        <span className="hidden lg:flex col-start-5 col-span-4 min-w-0 items-baseline justify-center pStyle uppercase tracking-widest">
          <span className="min-w-0 truncate">{title}</span>
        </span>
        {/* Top right: the close cross (the reading percentage is bottom
            left: ArticleBottomBar) */}
        <div className="col-start-3 lg:col-start-12 justify-self-end flex items-center">
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

      {/* Settings, next article / clear queue, and the queue */}
      <ArticleBottomBar slug={slug} percent={percent} />
    </>
  );
}
