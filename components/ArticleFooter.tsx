"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  useArticles,
  useNextInSeries,
  usePrevInSeries,
} from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import { cn } from "@/lib/utils";
import { tileColor, useArticleColor } from "./ArticleTile";

// Short date, day.month.year with two digits each (e.g. 28.09.26), in
// Swedish time, like the articles list
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Europe/Stockholm",
  });
}

// The end of the article reader, in the same colour as the top bar (the
// article's tile colour): a colophon — author, date, series — then, if
// there's a next article in the series, a
// screen-tall "Nästa artikel" panel for it (in its own tile colour);
// scrolling it fully into view opens it.
// Everything comes from the articles list, found by the slug; nothing if
// the article isn't in it
export default function ArticleFooter({ slug }: { slug: string }) {
  const t = useTranslations("Article");
  const router = useRouter();
  const { articles } = useArticles();
  const color = useArticleColor(slug);
  const article = articles.find((a) => a.slug.current === slug);

  // The next article, and whether its panel has been scrolled (almost)
  // fully into view: then it opens, once
  const next = useNextInSeries(slug);
  const prev = usePrevInSeries(slug);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const nextInView = useInView(nextRef, { amount: 0.9 });
  const opened = useRef(false);
  useEffect(() => {
    // Only once the reader has scrolled, so a short article doesn't jump
    // straight on
    if (!nextInView || !next || opened.current || window.scrollY === 0) return;
    opened.current = true;
    router.push(`/articles/${next.slug.current}`);
  }, [nextInView, next, router]);

  if (!article) return null;

  // Label / value rows, left out where Sanity has no value
  const colophon = [
    {
      label: t("colophonAuthor"),
      value: article.author && (
        <Link
          href={`/authors/${article.author.slug.current}`}
          className="hover:opacity-60 transition-opacity"
        >
          {article.author.name}
        </Link>
      ),
    },
    {
      label: t("colophonDate"),
      value: article.publishedAt && formatDate(article.publishedAt),
    },
    { label: t("colophonSeries"), value: article.series?.title },
  ].filter((row) => row.value);

  return (
    // Bottom padding clears the reader's fixed bottom bar (h-12)
    <footer
      className={cn(
        "flex flex-col gap-24 lg:gap-6 w-full px-6 lg:px-12 pt-24 pb-36  bg-background text-foreground",
        color,
      )}
    >
      {/* Colophon: one row per detail, the label on the left */}
      <dl className="flex flex-col w-full lg:w-1/2 mx-auto font-baskervilleNeoText text-xs  gap-6">
        {colophon.map((row) => (
          <div key={row.label} className="flex flex-col gap-2   ">
            <dt className="text-neutral-600 uppercase tracking-widest">
              {row.label}
            </dt>
            <dd className="pStyle">{row.value}</dd>
          </div>
        ))}
      </dl>

      {/* Previous and next in the series (when it's in one and they
          exist), and back to the articles; above the next-article panel,
          which opens the next article once it's fully in view */}
      <nav className="flex w-full lg:w-1/2 mx-auto items-baseline justify-between gap-6 font-baskervilleNeoText text-sm normal-case tracking-wide">
        <span className="flex-1">
          {prev && (
            <Link
              href={`/articles/${prev.slug.current}`}
              className="hover:underline underline-offset-4"
            >
              ← {t("prevInSeries")}
            </Link>
          )}
        </span>
        <Link
          href="/articles"
          className="shrink-0 hover:underline underline-offset-4"
        >
          {t("backToArticles")}
        </Link>
        <span className="flex-1 text-right">
          {next && (
            <Link
              href={`/articles/${next.slug.current}`}
              className="hover:underline underline-offset-4"
            >
              {t("nextInSeries")} →
            </Link>
          )}
        </span>
      </nav>

      {next && (
        // The whole panel links to the next article too
        <Link
          ref={nextRef}
          href={`/articles/${next.slug.current}`}
          className={cn(
            "-mx-6 lg:-mx-12 -mb-36 flex h-dvh flex-col items-center justify-center gap-6 px-6 text-center bg-background text-foreground",
            tileColor(articles.indexOf(next), next.color),
          )}
        >
          <span className="h2Style">( {t("nextArticle")} )</span>
          <span className="max-w-2xl font-baskervilleNeoText lg:font-baskervilleNeoDisplay text-base lg:text-2xl leading-loose">
            {articleTitle(next.title)}
          </span>
          {next.author && (
            <span className="font-baskervilleNeoText text-xs uppercase tracking-[24%] opacity-60">
              {next.author.name}
            </span>
          )}
        </Link>
      )}
    </footer>
  );
}
