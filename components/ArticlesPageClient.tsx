"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/lib/sanity/image";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import { Button } from "./ui/button";
import Ticker from "./Ticker";
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
  const tArticle = useTranslations("Article");

  // Applied filters (what the list shows), and the draft being edited in
  // the filter panel until it's applied
  const [filters, setFilters] = useState<Filters>({});
  const [draft, setDraft] = useState<Filters>({});
  const [query, setQuery] = useState("");
  // Which filter groups are open (all closed by default)
  const [openGroups, setOpenGroups] = useState<(keyof Filters)[]>([]);
  const visibleArticles = articles.filter(
    (a) => matchesFilters(a, filters) && matchesSearch(a, query),
  );

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
      <ul className="grid grid-cols-3 w-full     ">
        {visibleArticles.map((article) => (
          <li key={article._id} className="relative">
            <Button
              variant="link"
              size="xs"
              className="w-full justify-start flex flex-col items-start gap-0 aspect-square h-auto lg:h-min p-3 lg:p-6 text-foreground  border after:content-none "
              asChild
            >
              <Link href={`/articles/${article.slug.current}`}>
                {/* Date above title, 4px apart, like the author line below
                  (min-w-0 lets a long title shrink, so the ticker can run).
                  Always a date: the placeholder where Sanity has none */}
                <span className="flex min-w-0 flex-col items-start justify-start gap-1 w-full">
                  {/* Title; runs as a ticker when it doesn't fit. The title,
                      author and series are clipped (the ticker's and
                      truncate's overflow: hidden), so they need a normal line
                      height: the button's leading-[1] would cut off the rings
                      and dots of Å, Ä and Ö above the capitals */}
                  <span className="w-full text-left items-start justify-start leading-normal overflow-hidden px-0  flex i mb-3  ">
                    <Ticker text={articleTitle(article.title)} />
                  </span>
                </span>
                {/* Author, then "Del av <series>" for an article in a series,
                  12px apart and as wide as the row allows: the author in full,
                  the series cut off if it doesn't fit */}
                <span className="self-center flex max-w-full min-w-0 gap-3 text-neutral-600 mb-3">
                  {article.author && (
                    <span className="shrink-0 leading-normal">
                      {article.author.name}
                    </span>
                  )}
                  {article.series && (
                    <span className="min-w-0 truncate leading-normal">
                      {tArticle("partOf", { series: article.series.title })}
                    </span>
                  )}
                </span>
                {/* The article's cover image, at most a third of the item's
                    width (nothing when it has none) */}
                {article.coverImage?.asset && (
                  <Image
                    src={urlFor(article.coverImage).width(800).url()}
                    alt={article.coverImage.alt ?? ""}
                    width={0}
                    height={0}
                    sizes="(min-width: 1024px) 15vw, 33vw"
                    className="self-center w-auto h-auto max-w-1/3 px-3"
                  />
                )}
                {/* "( läs nu )" at the bottom of the item (the whole item
                    links to the article) */}
                <div className="flex justify-between w-full mt-3">
                  <span className="mt-auto px-3 h2Style">
                    ( {tArticle("readNow")} )
                  </span>
                  <span className="mt-auto px-3 h2Style">
                    ( {tArticle("readLater")} )
                  </span>
                </div>
              </Link>
            </Button>
            {/* "( läs senare )", bottom right on the "( läs nu )" line. Over
                the item but outside its link, since a button can't sit
                inside a link */}
            {/* TODO: no read-later list yet — save the article here */}
          </li>
        ))}
      </ul>
    </>
  );
}
