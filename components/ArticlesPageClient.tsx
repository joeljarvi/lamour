"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useArticles,
  type Article,
  type Series,
} from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import ArticleCover from "./ArticleCover";
import SeriesCover from "./SeriesCover";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { Button } from "./ui/button";

// Desktop column where each article in a row starts (24-column grid)
const COL_START = ["lg:col-start-1", "lg:col-start-10", "lg:col-start-19"];

// The selected value in each filter group (none = no filtering by it)
type Filters = {
  series?: string;
  author?: string;
  category?: string;
  year?: string;
};

// The categories, in this order (an article without one is an Article)
const CATEGORIES = ["article", "interview", "poem"] as const;
const categoryOf = (a: Article) => a.category ?? "article";

const articleYear = (a: Article) => a.publishedAt?.slice(0, 4);

// An article shows if it matches every selected filter
function matchesFilters(a: Article, f: Filters) {
  return (
    (!f.series || a.series?.title === f.series) &&
    (!f.author || a.author?.name === f.author) &&
    (!f.category || categoryOf(a) === f.category) &&
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

// A grid item's key
const itemKey = (
  it:
    | { kind: "article"; article: Article }
    | { kind: "series"; series: Series },
) => (it.kind === "article" ? it.article._id : `series-${it.series._id}`);

// Every article in a grid like the shop's (a series as one cover; a click
// shows its articles in the grid instead) (each its cover, title and
// author), with a header like the shop's: "Alla artiklar", "Serier"
// (every series, with its cover), "Kategorier" (Artikel, Intervju,
// Dikt) and "Filtrera efter författare" (each showing its options below the header,
// one list open at a time), a search field, and the sort (Senaste / A–Ö)
export default function ArticlesPageClient() {
  const { articles, series } = useArticles();
  const t = useTranslations("Nav");
  const tFilter = useTranslations("Filter");

  // The chosen series and author (one each; none = all), the search text,
  // the sort, and which option list is open
  const [filters, setFilters] = useState<Filters>({});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "az">("latest");
  const [openList, setOpenList] = useState<
    "series" | "category" | "author" | null
  >(null);

  const filtered = articles.filter(
    (a) => matchesFilters(a, filters) && matchesSearch(a, query),
  );
  const visibleArticles =
    sort === "az"
      ? [...filtered].sort((a, b) =>
          articleTitle(a.title).localeCompare(articleTitle(b.title), "sv"),
        )
      : filtered;

  // The grid's items: each article outside a series on its own, and each
  // series once, as one cover holding its (shown) articles, at the place
  // of its first one. Sorted A–Ö, series by their title. With a series
  // chosen (its cover clicked, or picked under Serier), that series'
  // articles each on their own instead
  type Item =
    | { kind: "article"; article: Article }
    | { kind: "series"; series: Series; articles: Article[] };
  const items: Item[] = [];
  for (const article of visibleArticles) {
    const slug = article.series?.slug.current;
    if (!slug || filters.series) {
      items.push({ kind: "article", article });
      continue;
    }
    const group = items.find(
      (it) => it.kind === "series" && it.series.slug.current === slug,
    );
    if (group?.kind === "series") group.articles.push(article);
    else
      items.push({
        kind: "series",
        // The full series document (with its cover), or what the article
        // knows of it
        series:
          series.find((s) => s.slug.current === slug) ??
          ({ _id: slug, ...article.series } as Series),
        articles: [article],
      });
  }
  if (sort === "az")
    items.sort((a, b) =>
      (a.kind === "series"
        ? a.series.title
        : articleTitle(a.article.title)
      ).localeCompare(
        b.kind === "series" ? b.series.title : articleTitle(b.article.title),
        "sv",
      ),
    );
  // The chosen series (its document, for its about text)
  const chosenSeries = filters.series
    ? series.find((s) => s.title === filters.series)
    : undefined;

  // The filter lists: each its "all" option and its options (value,
  // label, and for a series its cover image)
  type ListKey = "series" | "category" | "author";
  type Option = {
    value: string;
    label: string;
    image?: { asset?: { _ref: string }; alt?: string };
  };
  const lists: Record<ListKey, { all: string; options: Option[] }> = {
    // Every series in Sanity, with its cover
    series: {
      all: tFilter("allSeries"),
      options: series.map((s) => ({
        value: s.title,
        label: s.title,
        image: s.coverImage,
      })),
    },
    category: {
      all: tFilter("allCategories"),
      options: CATEGORIES.map((c) => ({
        value: c,
        label: tFilter("categoryName", { category: c }),
      })),
    },
    author: {
      all: tFilter("allAuthors"),
      options: unique(articles.map((a) => a.author?.name)).map((name) => ({
        value: name,
        label: name,
      })),
    },
  };
  const open = openList ? { key: openList, ...lists[openList] } : null;
  // Choosing the chosen one again clears it; "Alla …" (undefined) clears
  const choose = (key: ListKey, value?: string) =>
    setFilters((f) => ({
      ...f,
      [key]: value === undefined || f[key] === value ? undefined : value,
    }));

  const toggleList = (list: ListKey) =>
    setOpenList((v) => (v === list ? null : list));

  // Where the grid's header is on the page (scrolled to when a series
  // opens)
  const rootRef = useRef<HTMLDivElement>(null);
  const gridTop = () =>
    (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;

  return (
    <div ref={rootRef} className="min-h-dvh">
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
            onClick={() => toggleList("category")}
            aria-expanded={openList === "category"}
          >
            {openList === "category" ? t("closeMenu") : tFilter("categories")}
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

      {/* The open list (series, categories or authors), wrapping: first
          "Alla …" (clears the choice), then each option, a series with its
          cover beside its title; the chosen one dark, the rest faded */}
      {open && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-3 lg:px-6 pb-12 font-baskervilleNeoText text-sm normal-case tracking-wide">
          {[undefined, ...open.options].map((option) => {
            const on = filters[open.key] === option?.value;
            return (
              <button
                key={option?.value ?? "all"}
                type="button"
                aria-pressed={on}
                onClick={() => choose(open.key, option?.value)}
                className={`flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-100 ${on ? "" : "opacity-50"}`}
              >
                {option?.image?.asset && (
                  <span className="relative block h-12 aspect-[3/4] shrink-0 overflow-hidden">
                    <Image
                      src={urlFor(option.image).width(120).url()}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                )}
                {option?.label ?? open.all}
              </button>
            );
          })}
        </div>
      )}

      {/* With a series chosen: its title and about text above its
          articles, and "Stäng" back to every article */}
      {filters.series && (
        <div className="flex flex-col gap-3 px-3 lg:px-6 pb-12">
          <div className="flex items-baseline gap-6 font-baskervilleNeoText text-sm normal-case tracking-wide">
            <h3>{filters.series}</h3>
            <Button
              variant="link"
              size="xs"
              className={HEADER_BUTTON}
              onClick={() => choose("series", undefined)}
            >
              {t("closeMenu")}
            </Button>
          </div>
          {chosenSeries?.aboutText && (
            <p className="pStyle max-w-2xl">{chosenSeries.aboutText}</p>
          )}
        </div>
      )}

      {/* Like the shop: two per row on mobile; on desktop a 24-column
          grid, three per row, each 6 columns wide with 3 empty columns
          between them (starting at columns 1, 10 and 19). A series is one
          cover; a click shows its articles here instead */}
      <ul className="grid w-full grid-cols-2 gap-x-3 lg:gap-x-6 gap-y-12 px-3 lg:px-6 pb-24 lg:grid-cols-24 lg:gap-y-24">
        {items.map((item, i) => (
          <li
            key={itemKey(item)}
            className={`lg:col-span-6 ${COL_START[i % 3]}`}
          >
            {item.kind === "article" ? (
              // Its place in the full list picks its colour, so it keeps
              // it when filtered or sorted
              <ArticleCover
                article={item.article}
                index={articles.indexOf(item.article)}
              />
            ) : (
              <SeriesCover
                series={item.series}
                count={item.articles.length}
                index={series.indexOf(item.series)}
                onOpen={() => {
                  choose("series", item.series.title);
                  window.scrollTo({ top: gridTop(), behavior: "smooth" });
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
