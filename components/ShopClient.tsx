"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { issueTitle } from "@/lib/issueTitle";
import ShopCover from "./ShopCover";
import { Button } from "./ui/button";
import ShopFilterDrawer, { type ShopSort } from "./ShopFilterDrawer";

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

// Desktop column where each cover in a row starts (24-column grid)
const COL_START = ["lg:col-start-1", "lg:col-start-10", "lg:col-start-19"];

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
      {/* A sticky strip below the navbar with no height (so it takes no
          space), for the active filters */}

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
        {/* The covers: two per row on mobile; on desktop a 24-column grid,
            three per row, each 6 columns wide with 3 empty columns between
            them (starting at columns 1, 10 and 19) */}
        <div
          className={`grid flex-1 min-w-0 min-h-dvh content-start grid-cols-2 gap-x-6 gap-y-12 px-6 py-24 lg:grid-cols-24 lg:gap-y-24 ${filterOpen ? "lg:ml-[33.3333%]" : ""}`}
        >
          {visibleIssues.map((issue, i) => (
            <ShopCover
              key={issue._id}
              issue={issue}
              className={`lg:col-span-6 ${COL_START[i % 3]}`}
            />
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

      {/* "Filtrera", bottom right: opens and closes the filter panel (it
          has no close button of its own). Sticky at the bottom of the
          screen, but only within the shop (this strip, with no height, is
          the shop's last child): over the hero it waits below the screen,
          coming up as the shop scrolls in. Light text with
          mix-blend-difference (on the strip, since a sticky element with a
          z-index blends its contents only within itself), so it inverts
          against whatever is behind it. z-60: above the filter panel and
          mobile overlay, below the issue page (z-95) */}
      {/* The strip sticks the button's height (h-14, lg:h-20) plus 24px
          above the bottom, and the button hangs below it (top-0): so it
          never reaches above the shop's top edge into the hero */}
      <div className="sticky bottom-20 lg:bottom-26 z-60 h-0 mix-blend-difference">
        <Button
          variant="link"
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen}
          className="absolute top-0 right-6 w-auto h-14 lg:h-20 text-sm font-baskervilleNeoDisplay normal-case tracking-wide text-background"
        >
          {filterOpen ? t("closeMenu") : t("filterSearch")}
        </Button>
      </div>
    </div>
  );
}
