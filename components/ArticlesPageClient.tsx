"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import ArticleTile from "./ArticleTile";
import PageMenu from "./PageMenu";
import { FilterActions, FilterGroup, SearchField } from "./FilterParts";

// Shown for articles without a publication date in Sanity
const PLACEHOLDER_DATE = "2026-01-01";

// Short date, day.month.year with two digits each (e.g. 28.09.26), in
// Swedish time so a late-evening timestamp doesn't land on the next day
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Europe/Stockholm",
  });
}

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

// Every article, newest first (as the layout loads them), in one column:
// each a full-width row linking to the article, the date above the title,
// then the author and, for an article in a series, which series. A page
// menu filters them (series, author, year) and searches them
export default function ArticlesPageClient() {
  const { articles } = useArticles();
  const t = useTranslations("Nav");
  const tFilter = useTranslations("Filter");

  // Applied filters (what the list shows), and the draft being edited in
  // the filter panel until it's applied
  const [filters, setFilters] = useState<Filters>({});
  const [draft, setDraft] = useState<Filters>({});
  const [query, setQuery] = useState("");
  // Which filter groups are open (all closed by default)
  const [openGroups, setOpenGroups] = useState<(keyof Filters)[]>([]);
  // All but the latest (the first), which LatestArticle shows above the grid
  const visibleArticles = articles
    .slice(1)
    .filter((a) => matchesFilters(a, filters) && matchesSearch(a, query));

  // Filter groups, each with its options taken from the articles
  const groups: {
    key: keyof Filters;
    label: string;
    options: string[];
    names?: boolean;
    twoColumns?: boolean;
  }[] = [
    {
      key: "series",
      label: tFilter("series"),
      options: unique(articles.map((a) => a.series?.title)),
      names: true,
    },
    {
      key: "author",
      label: tFilter("authors"),
      options: unique(articles.map((a) => a.author?.name)),
      names: true,
    },
    {
      key: "year",
      label: tFilter("year"),
      options: unique(articles.map(articleYear)).reverse(),
      twoColumns: true,
    },
  ];

  return (
    <>
      <ul className="grid grid-cols-1 lg:grid-cols-3 w-full     ">
        {visibleArticles.map((article, i) => (
          <li key={article._id} className="relative">
            {/* + 1: the latest article above the grid takes the first
                colour */}
            <ArticleTile article={article} index={i + 1} />
          </li>
        ))}
      </ul>
    </>
  );
}
