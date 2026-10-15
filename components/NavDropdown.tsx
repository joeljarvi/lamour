"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import { useCart } from "@/lib/contexts/CartContext";
import { urlFor } from "@/lib/sanity/image";
import { issueTitle } from "@/lib/issueTitle";
import { Button } from "./ui/button";

export type NavSection = "issues" | "explore" | "articles";

// One row in the drop-down's list: a link (optionally to another locale) or,
// for pages that don't exist yet, a plain button
export type ListItem = {
  key: string;
  label: string;
  href?: string;
  locale?: "sv" | "en";
  // Column heading (bold, not clickable)
  heading?: boolean;
};

// The explore section's links — shared by this drop-down and LLNav's mobile
// overlay submenu
export function exploreItems(
  t: ReturnType<typeof useTranslations<"Nav">>,
  pathname: string,
  locale: string,
): ListItem[] {
  return [
    // TODO: no pages for these yet — add hrefs once they exist
    { key: "about", label: t("about") },
    { key: "clues", label: t("clues") },
    { key: "terms", label: t("terms") },
    { key: "contact", label: t("contact") },
    { key: "subscribe", label: t("subscribe") },
    { key: "nextIssue", label: t("nextIssue") },
    { key: "login", label: t("login") },
    {
      key: "changeLanguage",
      label: t("changeLanguage"),
      href: pathname,
      locale: locale === "sv" ? "en" : "sv",
    },
  ];
}

// Height of one list row
const ROW_HEIGHT = 32;
const LIST_COLUMNS = 2;

// Lay a flat list out row by row across LIST_COLUMNS columns
function flowRows(items: (ListItem | null)[]): (ListItem | null)[] {
  return items;
}

// A heading on its own row, then its items flowing row by row; padded with
// empty cells so the next group's heading starts on a fresh row
function headedGroup(
  heading: ListItem,
  items: ListItem[],
): (ListItem | null)[] {
  const pad = (n: number) =>
    Array<null>((LIST_COLUMNS - (n % LIST_COLUMNS)) % LIST_COLUMNS).fill(null);
  return [heading, ...pad(1), ...items, ...pad(items.length)];
}

// Full-width call-to-action along the bottom of the right half
const CTA_CLASS =
  "w-full justify-center disabled:opacity-30 font-baskervilleNeoText text-xs tracking-[24%] uppercase hover:bg-foreground hover:text-background";

function formatDate(locale: string, dateStr: string) {
  return new Date(dateStr).toLocaleDateString(
    locale === "sv" ? "sv-SE" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );
}

// Desktop drop-down below LLNav's top bar, as tall as its content. Which list
// it shows depends on the hovered nav item (`section`).
export default function NavDropdown({
  section,
  onNavigate,
}: {
  section: NavSection | null;
  onNavigate: () => void;
}) {
  const t = useTranslations("Nav");
  const issues = useIssues();
  const { articles, series } = useArticles();
  const pathname = usePathname();
  const tIssue = useTranslations("Issue");
  const { addToCart, setDrawerOpen } = useCart();

  const locale = useLocale();

  // Left-half list for the open section, as grid cells in row order
  const cells: (ListItem | null)[] =
    section === "issues"
      ? flowRows(
          headedGroup(
            { key: "issues-heading", label: t("allIssues"), heading: true },
            issues.map((issue) => ({
              key: issue._id,
              label: issueTitle(issue.title),
              href: `/shop/${issue.slug.current}`,
            })),
          ),
        )
      : section === "articles"
        ? // Series, then the articles without a series, in one flowing list
          flowRows([
            ...headedGroup(
              { key: "series-heading", label: t("series"), heading: true },
              series
                .filter((s) =>
                  articles.some(
                    (a) => a.series?.slug.current === s.slug.current,
                  ),
                )
                .map((s) => ({
                  key: s._id,
                  label: s.title,
                  // No series pages yet — the articles page lists them
                  href: "/articles",
                })),
            ),
            ...headedGroup(
              {
                key: "articles-heading",
                label: t("allArticles"),
                heading: true,
              },
              articles
                .filter((a) => !a.series)
                .map((a) => ({
                  key: a._id,
                  label: articleTitle(a.title),
                  href: `/articles/${a.slug.current}`,
                })),
            ),
          ])
        : section === "explore"
          ? flowRows(exploreItems(t, pathname, locale))
          : [];

  // Issues come newest first (ordered by issueNumber desc)
  const latest = issues[0];
  function addLatestToCart() {
    if (!latest) return;
    addToCart({
      id: latest._id,
      title: latest.title,
      price: latest.price != null ? `${latest.price} kr` : "0",
    });
    setDrawerOpen(true);
    onNavigate();
  }

  // Articles come newest first (ordered by publishedAt desc)
  const latestArticle = articles[0];
  const latestArticleHref = latestArticle
    ? `/articles/${latestArticle.slug.current}`
    : "/articles";

  return (
    <AnimatePresence initial={false}>
      {section && (
        <motion.nav
          aria-label={t(section)}
          className="hidden lg:grid grid-cols-2    gap-0 min-h-[50vh] bg-pergament "
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* List for the open section, in the left half; cells go row by
              row across LIST_COLUMNS columns */}
          <ul
            className="col-start-1 col-span-1 grid pt-6 content-start gap-y-0 gap-x-6 list-none px-12"
            style={{
              gridTemplateColumns: `repeat(${LIST_COLUMNS}, minmax(0, 1fr))`,
            }}
          >
            {cells.map((item, i) => (
              // Fixed height so rows line up across the columns
              <li
                key={item?.key ?? `empty-${i}`}
                className="flex items-center"
                style={{ height: ROW_HEIGHT }}
              >
                {!item ? null : item.heading ? (
                  <span className="px-0 font-baskervilleNeoDisplay italic text-xs uppercase tracking-[48%] mb-6">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Button
                    variant="link"
                    className="px-0 h-auto  font-baskervilleNeoDisplay uppercase   min-w-0"
                    size="xs"
                    asChild
                  >
                    <Link
                      href={item.href}
                      locale={item.locale}
                      aria-current={
                        !item.locale && pathname === item.href
                          ? "page"
                          : undefined
                      }
                      onClick={onNavigate}
                    >
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    className="px-0 h-auto  uppercase min-w-0"
                    size="xs"
                  >
                    <span className="truncate">{item.label}</span>
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {/* RIGHT HALF: heading row, the section's content, then a
              full-width button along the bottom */}
          <div className="col-span-1 flex flex-col gap-12 p-6 bg-pergament">
            {/* Heading on the left, the section's latest item on the right:
                in article mode the title, author and date, the title on the
                heading's baseline (items-baseline aligns the column's first
                line); in issue mode the cover, its top level with the
                heading's, and the issue number below it */}
            <div
              className={`flex justify-between gap-12 ${section === "issues" ? "items-start" : "items-baseline"}`}
            >
              <h2 className="shrink-0 font-baskervilleNeoDisplay italic text-xs uppercase tracking-[48%]">
                {section === "issues"
                  ? t("latestIssue")
                  : section === "articles"
                    ? t("latestArticle")
                    : "L'Amour — La Mort"}
              </h2>
              {section === "articles" && latestArticle && (
                <div className="flex flex-col items-end gap-6 min-w-0 max-w-xs text-right">
                  <h3 className="max-w-full truncate font-baskervilleNeoDisplay uppercase text-xs tracking-[24%] leading-[1.5]">
                    <Link
                      href={latestArticleHref}
                      onClick={onNavigate}
                      className="hover:opacity-60 transition-opacity"
                    >
                      {articleTitle(latestArticle.title)}
                    </Link>
                  </h3>
                  <div className="flex flex-col items-end gap-1 font-baskervilleNeoText text-xs tracking-[3%] text-neutral-700 leading-[1.5]">
                    {latestArticle.author && (
                      <span>{latestArticle.author.name}</span>
                    )}
                    {latestArticle.publishedAt && (
                      <time dateTime={latestArticle.publishedAt}>
                        {formatDate(locale, latestArticle.publishedAt)}
                      </time>
                    )}
                  </div>
                </div>
              )}
              {section === "issues" && (
                <div className="flex flex-col items-end gap-3">
                  {latest?.cover?.asset && (
                    <Link
                      href={`/shop/${latest.slug.current}`}
                      onClick={onNavigate}
                      className="shrink-0 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={urlFor(latest.cover).url()}
                        alt={latest.cover.alt ?? latest.title}
                        width={0}
                        height={0}
                        sizes="17vw"
                        // Natural shape; capped so a tall cover can't stretch the drop-down
                        className="rounded-xs w-auto h-auto max-w-[17vw] max-h-[40vh]"
                      />
                    </Link>
                  )}
                  {latest && (
                    <span className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]">
                      LL#{latest.issueNumber}
                    </span>
                  )}
                </div>
              )}
            </div>
            {section === "issues" && (
              <>
                {/* Cover and number are in the heading row above */}
                <div className="flex-1" />
                {latest && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={latest.inStock === false}
                    className={CTA_CLASS}
                    onClick={addLatestToCart}
                  >
                    {latest.inStock === false
                      ? tIssue("soldOut")
                      : tIssue("addToCart")}
                  </Button>
                )}
              </>
            )}

            {section === "articles" && latestArticle && (
              <>
                {/* Title, author and date are in the heading row above */}
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className={CTA_CLASS}
                  asChild
                >
                  <Link href={latestArticleHref} onClick={onNavigate}>
                    {t("goToArticle")}
                  </Link>
                </Button>
              </>
            )}

            {section === "explore" && (
              <>
                <div className="flex flex-1 justify-between items-start gap-12">
                  <div className="flex flex-col gap-6 min-w-0 max-w-xs">
                    <h3 className="truncate font-baskervilleNeoDisplay uppercase text-xs tracking-[24%]">
                      {t("about")}
                    </h3>
                    <p className="font-baskervilleNeoText text-xs tracking-[3%] text-neutral-700 leading-[1.5]">
                      Sedan 2017 har vi samlat ung litteratur under ett skevt
                      konsthistoriskt paraply och publicerat över hundra
                      författare och konstnärer i början, mitten, och slutet av
                      sina karriärer. Målet? Att ge skimret av ett samlad
                      förtrupp. Att historisera allt nu. En tids skrift av text
                      och bild.
                    </p>
                  </div>
                  <div className="flex flex-col gap-y-3 gap-x-4 items-start justify-end">
                    {/* Placeholder image (same as the home page's) */}
                    <Image
                      src="/Boknas-bokhylla.jpg"
                      alt=""
                      width={0}
                      height={0}
                      sizes="17vw"
                      className="shrink-0 shadow w-auto h-auto max-w-[17vw] max-h-[40vh]"
                    />
                    <h3 className="font-unifraktur text-base tracking-[12%]">
                      sedan 2017
                    </h3>
                  </div>
                </div>
                {/* TODO: no subscribe page yet — link it once it exists */}
                <Button variant="outline" size="sm" className={CTA_CLASS}>
                  {t("becomeSubscriber")}
                </Button>
              </>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
