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
type ListItem = {
  key: string;
  label: string;
  href?: string;
  locale?: "sv" | "en";
  // Column heading (bold, not clickable)
  heading?: boolean;
};

// Height of one list row
const ROW_HEIGHT = 32;
const LIST_COLUMNS = 2;

// Lay a flat list out row by row across LIST_COLUMNS columns
function flowRows(items: ListItem[]): (ListItem | null)[] {
  return items;
}

// Put each list in its own column (one list per column), padding the shorter
// ones with empty cells so the grid stays row-aligned
function columnsToRows(columns: ListItem[][]): (ListItem | null)[] {
  const rows = Math.max(0, ...columns.map((c) => c.length));
  const cells: (ListItem | null)[] = [];
  for (let r = 0; r < rows; r++)
    for (const column of columns) cells.push(column[r] ?? null);
  return cells;
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
          issues.map((issue) => ({
            key: issue._id,
            label: issueTitle(issue.title),
            href: `/shop/${issue.slug.current}`,
          })),
        )
      : section === "articles"
        ? // Series in column 1, articles without a series in column 2
          columnsToRows([
            [
              { key: "series-heading", label: t("series"), heading: true },
              ...series
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
            ],
            [
              { key: "articles-heading", label: t("articles"), heading: true },
              ...articles
                .filter((a) => !a.series)
                .map((a) => ({
                  key: a._id,
                  label: articleTitle(a.title),
                  href: `/articles/${a.slug.current}`,
                })),
            ],
          ])
        : section === "explore"
          ? flowRows([
              { key: "about", label: t("about"), href: "/" },
              // TODO: no pages for these yet — add hrefs once they exist
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
            ])
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

  return (
    <AnimatePresence initial={false}>
      {section && (
        <motion.nav
          aria-label={t(section)}
          className="hidden lg:grid grid-cols-2 mt-6 border-t border-t-foreground px-12 gap-0 min-h-[50vh] bg-background shadow"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* List for the open section, in the left half; cells go row by
              row across LIST_COLUMNS columns */}
          <ul
            className="col-start-1 col-span-1 grid pt-6 content-start gap-0 list-none"
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
                  <span className="px-0 font-baskervilleNeoText italic text-xs uppercase tracking-[48%] mb-3">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Button
                    variant="default"
                    className="px-0 h-auto  text-sm tracking-[6%] font-baskervilleNeoDisplay uppercase   min-w-0"
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
                    variant="default"
                    className="px-0 h-auto font-baskervilleNeoDisplay tracking-[6%] text-sm  uppercase min-w-0"
                    size="xs"
                  >
                    <span className="truncate">{item.label}</span>
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {/* Right half: intro text and latest cover pushed to opposite
              sides (flex, justify-between); add to cart along the bottom */}
          <div className="col-span-1 flex flex-col gap-8 p-8 bg-background">
            <div className="flex flex-1 justify-between items-start gap-12">
              <div className="font-baskervilleNeoText text-sm tracking-[6%] max-w-xs">
                L&apos;Amour — La Mort är en oberoende tidskrift.
              </div>
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
                    className="w-auto h-auto max-w-[17vw] max-h-[40vh]"
                  />
                </Link>
              )}
            </div>
            {latest && (
              <Button
                variant="outline"
                size="sm"
                disabled={latest.inStock === false}
                className="w-full justify-center disabled:opacity-30 font-baskervilleNeoText text-xs tracking-[24%] uppercase hover:bg-foreground hover:text-background"
                onClick={addLatestToCart}
              >
                {latest.inStock === false
                  ? tIssue("soldOut")
                  : tIssue("addToCart")}
              </Button>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
