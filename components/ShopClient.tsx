"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { issueTitle } from "@/lib/issueTitle";
import IssueTile from "./IssueTile";
import { Button } from "./ui/button";
import ShopFilterDrawer, {
  FILTER_TOGGLE_CLASS,
  type ShopSort,
} from "./ShopFilterDrawer";

// Whether the search text appears in the issue's number, title,
// contributors or editors (ignoring case)
function matchesSearch(issue: Issue, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    `#${issue.issueNumber}`,
    issueTitle(issue.title),
    issue.contributors,
    issue.editors,
  ].some((text) => text?.toLowerCase().includes(q));
}

// The issue's contributors: one name per line or comma in Sanity
function contributorsOf(issue: Issue) {
  return (issue.contributors ?? "")
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

// The shop: every issue as a grid of tiles, searched, sorted and filtered
// by contributor in the filter drawer (opened by "Filtrera & sök")
export default function ShopClient() {
  const t = useTranslations("Nav");
  const tFilter = useTranslations("Filter");
  const issues = useIssues();
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ShopSort>("latest");
  const [chosen, setChosen] = useState<string[]>([]);

  // Every contributor across the issues, once each, in Swedish order
  const contributors = useMemo(
    () =>
      [...new Set(issues.flatMap(contributorsOf))].sort((a, b) =>
        a.localeCompare(b, "sv"),
      ),
    [issues],
  );

  const toggleContributor = (name: string) =>
    setChosen((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  // Searched, then by contributor (any of the chosen), then sorted: newest
  // first (as they come) or by title A–Ö
  const filtered = issues.filter(
    (issue) =>
      matchesSearch(issue, query) &&
      (chosen.length === 0 ||
        contributorsOf(issue).some((name) => chosen.includes(name))),
  );
  const visibleIssues =
    sort === "az"
      ? [...filtered].sort((a, b) =>
          issueTitle(a.title).localeCompare(issueTitle(b.title), "sv"),
        )
      : filtered;

  // Back to every issue, newest first
  const clearAll = () => {
    setQuery("");
    setSort("latest");
    setChosen([]);
  };

  // The active filters, each with how to remove it: the search text and
  // the chosen contributors
  const activeFilters = [
    ...(query.trim()
      ? [
          {
            key: "query",
            label: `“${query.trim()}”`,
            remove: () => setQuery(""),
          },
        ]
      : []),
    ...chosen.map((name) => ({
      key: name,
      label: name,
      remove: () => toggleContributor(name),
    })),
  ];

  return (
    <div>
      {/* "Filtrera", fixed bottom right, in John Sans, above the filter
          panel and the mobile overlay (z-60; below the issue card, z-70 / z-80): opens and closes it (the
          panel has no close button of its own) */}
      <Button
        variant="link"
        onClick={() => setFilterOpen((v) => !v)}
        aria-expanded={filterOpen}
        className={`fixed bottom-6 right-6 z-60 ${FILTER_TOGGLE_CLASS}`}
      >
        {filterOpen ? t("closeMenu") : t("filterSearch")}
      </Button>

      {/* A sticky strip below the navbar with no height (so it takes no
          space), for the active filters */}
      <div className="sticky top-14 z-50 h-0">
        {/* Top right of the grid: "Alla nummer" (opens the
            filters), then the active filters — the search text and the
            chosen contributors — each with an × (click to remove it), and
            "Rensa filter" to clear them all. The
            row wraps leftwards, stopping short of the filter panel while
            it's open */}
        <div
          className={`absolute top-3 right-6 flex h-10 flex-wrap items-center justify-end gap-3 ${filterOpen ? "left-6 lg:left-[calc(33.3333%+1.5rem)]" : "left-6"}`}
        >
          <Button
            variant="link"
            size="xs"
            className="w-auto font-johnSans text-foreground after:content-none"
            onClick={() => setFilterOpen(true)}
          >
            {t("allIssues")}
          </Button>
          {activeFilters.map(({ key, label, remove }) => (
            <Button
              key={key}
              variant="link"
              size="xs"
              className="w-auto font-johnSans text-foreground after:content-none"
              onClick={remove}
              aria-label={tFilter("removeFilter", { filter: label })}
            >
              {label} ×
            </Button>
          ))}
          {/* Clear every filter (shown while any is active) */}
          {activeFilters.length > 0 && (
            <Button
              variant="link"
              size="xs"
              className="w-auto font-johnSans text-foreground underline underline-offset-4 decoration-[0.5px] after:content-none"
              onClick={clearAll}
            >
              {tFilter("clearFilters")}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop: the filter panel, while open, fixed on the left (a third
          of the screen); the grid moves right past it (ml-1/3) (two columns then, so the tiles keep their
          size) */}
      <div className="lg:flex lg:items-start">
        <ShopFilterDrawer
          inline
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={setSort}
          contributors={contributors}
          chosen={chosen}
          toggleContributor={toggleContributor}
          clear={clearAll}
          resultCount={visibleIssues.length}
        />
        <div
          className={`grid flex-1 min-w-0 min-h-dvh content-start grid-cols-2 ${filterOpen ? "lg:grid-cols-2 lg:ml-[33.3333%]" : "lg:grid-cols-3"}`}
        >
          {visibleIssues.map((issue) => (
            <IssueTile key={issue._id} issue={issue} />
          ))}
        </div>
      </div>

      {/* Mobile: the filters as an overlay from the bottom */}
      <ShopFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        contributors={contributors}
        chosen={chosen}
        toggleContributor={toggleContributor}
        clear={clearAll}
        resultCount={visibleIssues.length}
      />
    </div>
  );
}
