"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useArticles,
  type Article,
  type Series,
} from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import ArticleCover from "./ArticleCover";
import type { CoverView } from "./ShopCover";
import SeriesCover from "./SeriesCover";
import { Button } from "./ui/button";
import { Input, SEARCH_LOOK } from "./ui/input";
import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/titleCase";
import { CrossIcon, NAV_SIZE } from "./filterBarStyles";

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

// A grid item's key
const itemKey = (
  it:
    | { kind: "article"; article: Article }
    | { kind: "series"; series: Series },
) => (it.kind === "article" ? it.article._id : `series-${it.series._id}`);

// The articles page, laid out as the shop (ShopClient): one row on the
// navbar's 12 columns, "Artiklar" with the count and the sort (cols 1–2),
// the filters ("Författare", "Serier", "Kategorier", "Rensa filter", the
// search) from col 3, "1 2 3" (how the covers show) in col 12; the open
// list below; then the covers, six a row (view 1) or four (2, 3). A series
// is one cover; a click shows its articles instead
// `seriesSlug`: on a series' page, only that series' articles (each its
// own cover, no "Serier" filter)
export default function ArticlesPageClient({
  seriesSlug,
}: {
  seriesSlug?: string;
} = {}) {
  const { articles: allArticles, series } = useArticles();
  const articles = seriesSlug
    ? allArticles.filter((a) => a.series?.slug.current === seriesSlug)
    : allArticles;
  const t = useTranslations("Nav");
  const tFilter = useTranslations("Filter");

  // The chosen series and author (one each; none = all), the search text,
  // the sort, and which option list is open
  const [filters, setFilters] = useState<Filters>({});
  const [query, setQuery] = useState("");
  // The heading's sort: newest first (the default) or A–Ö, a click
  // switching
  const [sort, setSort] = useState<"latest" | "az">("latest");
  // How the covers show ("1 2 3"), as the shop's
  const [gridView, setGridView] = useState<CoverView>(2);
  // "Filtrera" open (its lists shown), and which list: authors, series
  // or categories (as the shop's Medverkande / Titel)
  const [filterOpen, setFilterOpen] = useState(false);
  const [listKind, setListKind] = useState<"author" | "series" | "category">(
    "author",
  );

  const filtered = articles.filter(
    (a) => matchesFilters(a, filters) && matchesSearch(a, query),
  );
  // Newest first as they come, or A–Ö
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
    if (!slug || filters.series || seriesSlug) {
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
  // label)
  type ListKey = "series" | "category" | "author";
  type Option = {
    value: string;
    label: string;
  };
  const lists: Record<ListKey, { all: string; options: Option[] }> = {
    // Every series in Sanity
    series: {
      all: tFilter("allSeries"),
      options: series.map((s) => ({
        value: s.title,
        label: s.title,
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
  // The open list, narrowed by the search (the chosen one always kept)
  const q = query.trim().toLocaleLowerCase("sv");
  const open = filterOpen
    ? {
        key: listKind,
        ...lists[listKind],
        options: lists[listKind].options.filter(
          (o) =>
            !q ||
            filters[listKind] === o.value ||
            o.label.toLocaleLowerCase("sv").includes(q),
        ),
      }
    : null;
  // Choosing the chosen one again clears it; "Alla …" (undefined) clears
  const choose = (key: ListKey, value?: string) =>
    setFilters((f) => ({
      ...f,
      [key]: value === undefined || f[key] === value ? undefined : value,
    }));

  // Anything chosen, searched or sorted ("Alla artiklar" not in use)
  const anyFilter = Object.values(filters).some(Boolean) || query.trim() !== "";
  const clearAll = () => {
    setFilters({});
    setQuery("");
  };

  // A cover: an article, or a series (a click shows its articles)
  const cover = (item: Item) =>
    item.kind === "article" ? (
      // Its place in the full list picks its colour, so it keeps it when
      // filtered or sorted
      <ArticleCover
        article={item.article}
        index={allArticles.indexOf(item.article)}
        view={gridView}
      />
    ) : (
      <SeriesCover
        series={item.series}
        count={item.articles.length}
        index={series.indexOf(item.series)}
        view={gridView}
      />
    );

  // The shop's button look: normal case, upright, italic on hover and
  // while pressed / open
  const BTN = cn(
    NAV_SIZE,
    "px-0 lg:px-0 normal-case lg:normal-case tracking-normal lg:tracking-normal not-italic hover:italic aria-pressed:italic aria-expanded:italic",
  );
  // The grid's columns: two on mobile; six (view 1) or four (2, 3)
  const COLS = cn(
    "grid-cols-2",
    gridView === 1 ? "lg:grid-cols-6" : "lg:grid-cols-4",
  );
  const sortName = {
    latest: tFilter("recentlyAdded"),
    az: tFilter("az"),
  };

  return (
    <div className="min-h-dvh px-3">
      <section className={cn("pb-24", !seriesSlug && "mt-48")}>
        <div className="pt-3 flex flex-col gap-3">
          {/* One row, on the navbar's 12 columns (20px in, 12px apart) */}
          <div className="flex flex-row flex-wrap items-baseline gap-x-12 gap-y-3 -mx-3 px-5 lg:grid lg:grid-cols-12 lg:gap-x-3">
            {/* "Artiklar" with the number shown raised, then the sort
                (italic; a click switches it) */}
            <h2 className="font-baskervilleNeoText text-1 flex gap-x-3 lg:col-span-2">
              <span>
                {t("articles")}
                <sup className="ml-0.5">{items.length}</sup>
              </span>
              <button
                type="button"
                onClick={() => setSort(sort === "latest" ? "az" : "latest")}
                aria-label={`${tFilter("sortBy")}: ${sortName[sort]}`}
                className="cursor-pointer text-left italic transition-opacity hover:opacity-60"
              >
                {sortName[sort]}
              </button>
            </h2>

            {/* From col 3 (under the navbar's pages): the filters, "Rensa
                filter" while anything is chosen or searched, the search;
                24px apart. The open list below them */}
            <div
              id="filter"
              data-section="filter"
              className="z-40 flex min-w-0 flex-1 flex-col items-stretch h-auto pStyle normal-case lg:col-start-3 lg:col-span-7"
            >
              <div className="relative flex min-w-0 flex-row flex-wrap items-baseline gap-x-6 gap-y-3 h-auto w-full">
                {(
                  [
                    ["author", tFilter("authors")],
                    ["series", t("series")],
                    ["category", tFilter("categories")],
                  ] as const
                )
                  // A series' page: "Författare" only
                  .filter(([kind]) => !seriesSlug || kind === "author")
                  .map(([kind, label]) => {
                    const shown = filterOpen && listKind === kind;
                    return (
                      <Fragment key={kind}>
                        <Button
                          variant="Link"
                          size="xs"
                          className={BTN}
                          aria-expanded={shown}
                          onClick={() => {
                            if (shown) setFilterOpen(false);
                            else {
                              setListKind(kind);
                              setFilterOpen(true);
                            }
                          }}
                        >
                          {label}
                        </Button>
                        {/* Its list, open right beside it (wrapping onto
                          more lines if long): "Alla …" (clears the choice),
                          then each option (title case); the chosen one
                          italic, the rest faded */}
                        {shown && open && (
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
                            {[undefined, ...open.options].map((option) => {
                              const on = filters[open.key] === option?.value;
                              return (
                                <Button
                                  key={option?.value ?? "all"}
                                  variant="Link"
                                  size="xs"
                                  aria-pressed={on}
                                  onClick={() =>
                                    choose(open.key, option?.value)
                                  }
                                  className={cn(
                                    NAV_SIZE,
                                    "px-0 lg:px-0 normal-case lg:normal-case tracking-normal lg:tracking-normal transition-opacity hover:opacity-100",
                                    on ? "italic" : "opacity-50",
                                  )}
                                >
                                  {option ? titleCase(option.label) : open.all}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                {anyFilter && (
                  <Button
                    variant="Link"
                    size="xs"
                    className={BTN}
                    onClick={clearAll}
                  >
                    {tFilter("clearFilters")}
                  </Button>
                )}
              </div>
            </div>

            {/* The search, in cols 10–11 (titles, authors, series; narrows
                the open list); a cross on the right that empties it */}
            {
              <div className="group relative w-40 shrink min-w-0 -ml-2 lg:w-auto lg:col-start-10 lg:col-span-2">
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tFilter("searchPlaceholder")}
                  aria-label={tFilter("search")}
                  className={`peer ${SEARCH_LOOK} px-4 pr-9 ${NAV_SIZE} lg:pr-5 lg:pt-[0.3em]`}
                />
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={tFilter("clearSearch")}
                  // Only while the search is in use: focused, or something typed
                  className="absolute right-3 lg:right-0 top-1/2 -translate-y-1/2 hidden peer-focus:flex peer-[:not(:placeholder-shown)]:flex size-4 cursor-pointer items-center justify-center text-primary hover:opacity-60"
                >
                  <CrossIcon />
                </button>
              </div>
            }

            {/* "1 2 3": how the covers show (col 12, on the right); the
                chosen one italic */}
            <div className="ml-auto flex items-baseline justify-end gap-x-3 lg:ml-0 lg:col-start-12">
              {([1, 2, 3] as const).map((view) => (
                <Button
                  key={view}
                  variant="Link"
                  size="xs"
                  aria-pressed={gridView === view}
                  aria-label={`${tFilter("view")} ${view}`}
                  onClick={() => setGridView(view)}
                  className={BTN}
                >
                  {view}
                </Button>
              ))}
            </div>
          </div>

          {/* With a series chosen, its about text */}
          {!seriesSlug && chosenSeries?.aboutText && (
            <p className="pStyle max-w-prose py-5 lg:px-2">
              {chosenSeries.aboutText}
            </p>
          )}

          {/* The covers: six a row (view 1) or four (2, 3), 20px apart and
              20px in, as the shop's */}
          <ul
            id="archive"
            data-section="archive"
            className={cn("grid gap-x-5 gap-y-10 -mx-3 px-5 list-none", COLS)}
          >
            {items.map((item) => (
              <li key={itemKey(item)}>{cover(item)}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
