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
import { useQueue } from "@/lib/contexts/QueueContext";
import ArticleBottomBar from "./ArticleBottomBar";

// The article reader's navbar: a fixed top section, in the same colour as
// the article's tile — the series and title ("<series>: <title>", a
// ticker) top left on mobile; on desktop the series top left and the title
// top centre, tickers too; and "Stäng" top right, back to the articles
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

  const { loaded, removeFromQueue } = useQueue();
  const { articles } = useArticles();

  // Opening an article takes it out of the queue (it's being read), after
  // the stored queue is read, so it doesn't overwrite this
  const current = articles.find((a) => a.slug.current === slug);
  useEffect(() => {
    if (!loaded || !current) return;
    removeFromQueue(current._id);
    // Once per article opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, current?._id]);

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

  // "Artiklar — ", before the title: Artiklar links to the articles list
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
          text scrolls away beneath it */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-20 grid grid-cols-3 lg:grid-cols-12 items-center gap-6 h-16 lg:h-12 px-6 lg:px-6 bg-background text-foreground ",
          color,
        )}
      >
        {/* "Artiklar — <series>: <title>": Artiklar links back to the
            list; the rest, like the hero heading, runs as a ticker when it
            doesn't fit */}
        <span className="lg:hidden col-start-1 col-span-2 min-w-0 flex items-baseline font-baskervilleNeoText text-xs uppercase tracking-[24%]">
          {breadcrumb}
          <span className="min-w-0">
            <Ticker text={series ? `${series.title}: ${title}` : title} />
          </span>
        </span>
        {/* Desktop: the series top left ("ur — <series>") and the title top
            centre, each a ticker when it doesn't fit */}
        <span className="hidden lg:block col-start-1 col-span-1 min-w-0 font-baskervilleNeoText text-xs uppercase tracking-[24%]">
          {series && (
            <Ticker text={t("fromSeries", { series: series.title })} />
          )}
        </span>
        {/* "Artiklar — <title>", centred */}
        <span className="hidden lg:flex col-start-5 col-span-4 min-w-0 items-baseline justify-center font-baskervilleNeoText text-xs uppercase tracking-[24%]">
          {breadcrumb}
          <span className="min-w-0">
            <Ticker text={title} />
          </span>
        </span>
        <Button
          variant="link"
          size="xs"
          // The bar's text colour (light on the dark tile colour)
          className="justify-self-end w-auto text-inherit after:content-none col-start-3 lg:col-start-12"
          asChild
        >
          <Link href="/articles">{t("close")} (x)</Link>
        </Button>
      </header>

      {/* Settings, next article / clear queue, and the queue */}
      <ArticleBottomBar slug={slug} percent={percent} />
    </>
  );
}
