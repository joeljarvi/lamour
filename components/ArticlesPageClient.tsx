"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import ArticleCover from "./ArticleCover";
import { Button } from "./ui/button";

// Desktop column where each article in a row starts (24-column grid)
const COL_START = ["lg:col-start-1", "lg:col-start-10", "lg:col-start-19"];

// The selected value in each filter group (none = no filtering by it)
type Filters = { series?: string; author?: string; year?: string };

const articleYear = (a: Article) => a.publishedAt?.slice(0, 4);

// An article shows if it matches every selected filter
function matchesFilters(a: Article, f: Filters) {
  return (
    (!f.series || a.series?.title === f.series) &&
    (!f.author || a.author?.name === f.author) &&
    (!f.year || articleYear(a) === f.year)
  );
}

// Whether the search text appears in the article's title, author or series
// (ignoring case)
function matchesSearch(a: Article, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [articleTitle(a.title), a.author?.name, a.series?.title].some((text) =>
    text?.toLowerCase().includes(q),
  );
}

// Distinct values, sorted alphabetically in Swedish order
const unique = (values: (string | undefined)[]) =>
  [...new Set(values.filter((v): v is string => !!v))].sort((a, b) =>
    a.localeCompare(b, "sv"),
  );

// The header's buttons: plain text, dark, no fixed height, underlined on
// hover (no pointing hand)
const HEADER_BUTTON =
  "w-auto h-auto lg:h-auto px-0 font-baskervilleNeoText text-sm normal-case tracking-wide text-foreground underline-offset-4 hover:underline after:content-none";

// Every article in a grid like the shop's (each its cover, title and
// author), with a header like the shop's: "Alla artiklar", "Serier" and
// "Filtrera efter författare" (each showing its options below the header,
// one list open at a time), a search field, and the sort (Senaste / A–Ö)
export default function ArticlesPageClient() {
  const { articles } = useArticles();
  const t = useTranslations("Nav");
  const tFilter = useTranslations("Filter");

  // The chosen series and author (one each; none = all), the search text,
  // the sort, and which option list is open
  const [filters, setFilters] = useState<Filters>({});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "az">("latest");
  const [openList, setOpenList] = useState<"series" | "author" | null>(null);

  const filtered = articles.filter(
    (a) => matchesFilters(a, filters) && matchesSearch(a, query),
  );
  const visibleArticles =
    sort === "az"
      ? [...filtered].sort((a, b) =>
          articleTitle(a.title).localeCompare(articleTitle(b.title), "sv"),
        )
      : filtered;

  // The open list's options, its "all" option, and its key in the filters
  const lists = {
    series: {
      key: "series" as const,
      all: tFilter("allSeries"),
      options: unique(articles.map((a) => a.series?.title)),
    },
    author: {
      key: "author" as const,
      all: tFilter("allAuthors"),
      options: unique(articles.map((a) => a.author?.name)),
    },
  };
  const open = openList ? lists[openList] : null;
  // Choosing the chosen one again clears it
  const choose = (key: "series" | "author", value?: string) =>
    setFilters((f) => ({ ...f, [key]: f[key] === value ? undefined : value }));

  const toggleList = (list: "series" | "author") =>
    setOpenList((v) => (v === list ? null : list));

  return (
    <div className="min-h-dvh">
      {/* Header: "Alla artiklar", Serier, Filtrera efter författare and the
          search on the left; the sort on the right */}
      <div className="flex items-baseline justify-between gap-6 px-3 lg:px-6 pt-6 pb-3 lg:pb-6 font-baskervilleNeoText text-sm normal-case tracking-wide">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h2>{t("allArticles")}</h2>
          <Button
            variant="link"
            size="xs"
            className={HEADER_BUTTON}
            onClick={() => toggleList("series")}
            aria-expanded={openList === "series"}
          >
            {openList === "series" ? t("closeMenu") : t("series")}
          </Button>
          <Button
            variant="link"
            size="xs"
            className={HEADER_BUTTON}
            onClick={() => toggleList("author")}
            aria-expanded={openList === "author"}
          >
            {openList === "author" ? t("closeMenu") : tFilter("byAuthor")}
          </Button>
          {/* Searches the titles, authors and series */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tFilter("searchPlaceholder")}
            aria-label={tFilter("search")}
            className="w-32 lg:w-48 bg-transparent outline-none placeholder:text-neutral-400 font-baskervilleNeoText text-sm normal-case tracking-wide"
          />
        </div>
        <Button
          variant="link"
          size="xs"
          className={HEADER_BUTTON}
          onClick={() => setSort(sort === "latest" ? "az" : "latest")}
        >
          {sort === "latest" ? tFilter("latest") : tFilter("az")}
        </Button>
      </div>

      {/* The open list (series or authors), wrapping: first "Alla …"
          (clears the choice), then each option; the chosen one dark, the
          rest faded */}
      {open && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 px-3 lg:px-6 pb-12 font-baskervilleNeoText text-sm normal-case tracking-wide">
          {[undefined, ...open.options].map((value) => {
            const on = filters[open.key] === value;
            return (
              <button
                key={value ?? "all"}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  value === undefined
                    ? setFilters((f) => ({ ...f, [open.key]: undefined }))
                    : choose(open.key, value)
                }
                className={`cursor-pointer transition-opacity hover:opacity-100 ${on ? "" : "opacity-50"}`}
              >
                {value ?? open.all}
              </button>
            );
          })}
        </div>
      )}

      {/* Like the shop: two per row on mobile; on desktop a 24-column
          grid, three per row, each 6 columns wide with 3 empty columns
          between them (starting at columns 1, 10 and 19) */}
      <ul className="grid w-full grid-cols-2 gap-x-3 lg:gap-x-6 gap-y-12 px-3 lg:px-6 pb-24 lg:grid-cols-24 lg:gap-y-24">
        {visibleArticles.map((article, i) => (
          <li key={article._id} className={`lg:col-span-6 ${COL_START[i % 3]}`}>
            {/* Its place in the full list picks its colour, so it keeps
                it when filtered or sorted */}
            <ArticleCover article={article} index={articles.indexOf(article)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
