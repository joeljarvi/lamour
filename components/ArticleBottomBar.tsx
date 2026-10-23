"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import { useNextArticle, useQueue } from "@/lib/contexts/QueueContext";
import { articleTitle } from "@/lib/articleTitle";

// The fixed bottom bar of the article reader and the articles page (there
// only once something is queued): "Inst." (settings, in the reader) bottom
// left; bottom centre, in the reader, "Skrolla ner" at the top and "Nästa
// artikel" (or "Till toppen") at the end, or, while the queue is open, "Töm
// kö"; and "Visa kö" bottom right, opening the reading queue
// above the bar
export default function ArticleBottomBar({
  slug,
  percent,
}: {
  // The article being read, left out of "Nästa artikel" (none on the
  // articles page, which has no "Nästa artikel")
  slug?: string;
  // Reading progress, in the reader (hidden for now)
  percent?: number;
}) {
  const t = useTranslations("Article");

  // The reading queue, as the queued articles, in queue order (ids no
  // longer among the articles left out), and whether its panel is open
  const { queue, removeFromQueue, clearQueue } = useQueue();
  const { articles } = useArticles();
  const queued = queue
    .map((id) => articles.find((a) => a._id === id))
    .filter((a) => a !== undefined);
  const [queueOpen, setQueueOpen] = useState(false);

  // "Nästa artikel": the next in the queue, or else the next in the
  // article's series
  const next = useNextArticle(slug ?? "");

  // At the end of the article (its text read to the bottom), and at the
  // top of the page (not yet scrolled): they pick the middle button
  const atEnd = percent !== undefined && percent >= 100;
  const [atTop, setAtTop] = useState(true);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setAtTop(y < 50));

  // On the articles page (no article) the bar only shows once something is
  // queued (or while the queue is open)
  if (!slug && !queueOpen && queued.length === 0) return null;

  return (
    <>
      {/* Bottom: settings on the left, next article / clear queue in the
          centre, the queue on the right, on a solid background. With an
          empty queue (only settings showing) it's transparent and lets
          clicks through to the page; its buttons still catch them */}
      <footer
        className={cn(
          "fixed bottom-0 inset-x-0 z-20 grid grid-cols-3 items-center gap-6 h-16 lg:h-12 px-3",
          queueOpen || queued.length > 0
            ? "bg-transparent "
            : "bg-transparent pointer-events-none",
        )}
      >
        {/* Reader settings, in the reader only (an empty cell on the
            articles page). TODO: no reader settings yet — open them here */}
        {slug ? (
          <Button
            variant="link"
            size="xs"
            aria-label={t("settingsLabel")}
            className="justify-self-start pointer-events-auto w-auto text-foreground after:content-none"
          >
            ( {t("settings")} )
          </Button>
        ) : (
          <span aria-hidden />
        )}
        {/* Middle column: while the queue is open, "Töm kö" (greyed out
            while it's empty). In the reader: at the top, "Skrolla ner"; at
            the end, "Nästa artikel" (the next in the queue, or else in the
            series), or "Till toppen" when there's none; nothing in between
            (an empty cell, so "Visa kö" stays on the right). Nothing on the
            articles page */}
        {queueOpen ? (
          <Button
            variant="link"
            size="xs"
            disabled={queued.length === 0}
            className="justify-self-center pointer-events-auto w-auto text-background after:content-none disabled:opacity-30"
            onClick={clearQueue}
          >
            ( {t("clearQueue")} )
          </Button>
        ) : slug && atEnd && next ? (
          <Button
            variant="link"
            size="xs"
            className="justify-self-center pointer-events-auto w-auto text-foreground after:content-none"
            asChild
          >
            <Link href={`/articles/${next.slug.current}`}>
              ( {t("nextArticle")} )
            </Link>
          </Button>
        ) : slug && atEnd ? (
          <Button
            variant="link"
            size="xs"
            className="justify-self-center pointer-events-auto w-auto text-foreground after:content-none"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ( {t("backToTop")} )
          </Button>
        ) : slug && atTop ? (
          // Past the screen-tall hero, to the text
          <Button
            variant="link"
            size="xs"
            className="justify-self-center pointer-events-auto w-auto text-foreground after:content-none"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
          >
            ( {t("scrollDown")} )
          </Button>
        ) : (
          <span aria-hidden />
        )}
        {/* Progress bar (in the reader): the fill grows with the reading
            percentage. Hidden for now (the middle column has the buttons) */}
        {percent !== undefined && (
          <div
            aria-hidden
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="hidden justify-self-center relative h-9 w-24 items-center justify-center font-baskervilleNeoText tracking-[12%] text-xs"
          >
            <span
              className="absolute inset-y-0 left-0 bg-transparent"
              style={{ width: `${percent}%` }}
            />
            <span className="relative">{percent}%</span>
          </div>
        )}
        {/* Opens / closes the queue panel above the bar: hidden while the
            queue is empty (invisible, holding its place); while the panel is
            open it stays, to close it, e.g. just after "Töm kö" */}
        <Button
          variant="link"
          size="xs"
          aria-expanded={queueOpen}
          aria-controls="reading-queue"
          aria-hidden={!queueOpen && queued.length === 0}
          tabIndex={!queueOpen && queued.length === 0 ? -1 : undefined}
          className={cn(
            "justify-self-end pointer-events-auto w-auto text-foreground after:content-none",
            !queueOpen && queued.length === 0 && "invisible",
          )}
          onClick={() => setQueueOpen((open) => !open)}
        >
          ( {queueOpen ? t("hideQueue") : t("showQueue")} )
        </Button>
      </footer>

      {/* The reading queue: the articles saved with "läs senare", newest
          last, each linking to the article with a remove (x) on the
          right. Slides up above the bottom bar */}
      <AnimatePresence>
        {queueOpen && (
          <motion.section
            id="reading-queue"
            aria-label={t("queue")}
            className="fixed inset-x-0 bottom-16 lg:bottom-12 z-20 max-h-[60dvh] overflow-y-auto bg-background border-t border-t-neutral-400"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {queued.length === 0 ? (
              <p className="px-6 py-6 font-baskervilleNeoText text-xs uppercase tracking-[24%]">
                {t("queueEmpty")}
              </p>
            ) : (
              <ul className="flex flex-col">
                {queued.map((article) => (
                  // Title on the left, remove on the right
                  <li
                    key={article._id}
                    className="flex items-center justify-center gap-0 h-auto px-3"
                  >
                    <Link
                      href={`/articles/${article.slug.current}`}
                      onClick={() => setQueueOpen(false)}
                      className="flex min-w-0 flex-col gap-1 py-3 px-3 hover:opacity-60 transition-opacity"
                    >
                      <span className="truncate font-baskervilleNeoText text-xs uppercase tracking-[24%]">
                        {articleTitle(article.title)}
                      </span>
                    </Link>
                    <Button
                      variant="link"
                      size="xs"
                      aria-label={t("removeFromQueue", {
                        title: articleTitle(article.title),
                      })}
                      className="shrink-0 w-auto text-foreground after:content-none"
                      onClick={() => removeFromQueue(article._id)}
                    >
                      <span className="lowercase">(x)</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
