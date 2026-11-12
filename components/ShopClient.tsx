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

// The header's sort button: plain text, dark, no fixed height,
// underlined on hover (no pointing hand)
const SORT_BUTTON =
  "w-auto h-auto lg:h-auto px-0 font-baskervilleNeoText text-sm normal-case tracking-wide text-foreground underline-offset-4 hover:underline after:content-none";

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
  // The contributor list below the header, shown or not
  const [contributorsOpen, setContributorsOpen] = useState(false);

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
        <div
          className={`flex-1 min-w-0 min-h-dvh ${filterOpen ? "lg:ml-[33.3333%]" : ""}`}
        >
          {/* Header: "Alla nummer" on the left; on the right the active
              sort, a button switching between Senaste and A–Ö */}
          <div className="flex items-baseline justify-between gap-6 px-3 lg:px-6 pt-6 pb-3 lg:pb-6 font-baskervilleNeoText text-sm normal-case tracking-wide">
            {/* "Alla nummer", then "Filtrera efter medverkande", which
                shows and hides every contributor below the header */}
            <div className="flex items-baseline gap-6">
              <h2 className="whitespace-nowrap">{t("allIssues")}</h2>
              <Button
                variant="link"
                size="xs"
                className={SORT_BUTTON}
                onClick={() => setContributorsOpen((v) => !v)}
                aria-expanded={contributorsOpen}
              >
                {contributorsOpen ? t("closeMenu") : tFilter("byContributor")}
              </Button>
              {/* "Rensa filter": back to every issue, newest first; only
                  while something is chosen, searched or sorted */}
              {(chosen.length > 0 ||
                query.trim() !== "" ||
                sort !== "latest") && (
                <Button
                  variant="link"
                  size="xs"
                  className={SORT_BUTTON}
                  onClick={clearAll}
                >
                  {tFilter("clearFilters")}
                </Button>
              )}
              {/* Searches the issues (title, contributors…), as the
                  filter panel's search does */}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tFilter("searchPlaceholder")}
                aria-label={tFilter("search")}
                className="w-32 lg:w-48 bg-transparent outline-none placeholder:text-neutral-400 font-baskervilleNeoText text-sm normal-case tracking-wide"
              />
            </div>
            <div className="flex items-baseline gap-3">
              <Button
                variant="link"
                size="xs"
                className={SORT_BUTTON}
                onClick={() => setSort(sort === "latest" ? "az" : "latest")}
              >
                {sort === "latest" ? tFilter("latest") : tFilter("az")}
              </Button>
            </div>
          </div>

          {/* Every contributor, wrapping onto as many lines as needed: a
              click filters by them (several at once: issues with any of
              them); chosen ones dark, the rest faded */}
          {contributorsOpen && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 px-3 lg:px-6 pb-12 font-baskervilleNeoText text-sm normal-case tracking-wide">
              {/* First: every contributor (clears the choice); dark while
                  none is chosen */}
              <button
                type="button"
                aria-pressed={chosen.length === 0}
                onClick={() => setChosen([])}
                className={`cursor-pointer transition-opacity hover:opacity-100 ${chosen.length === 0 ? "" : "opacity-50"}`}
              >
                {tFilter("allContributors")}
              </button>
              {contributors.map((name) => {
                const on = chosen.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleContributor(name)}
                    className={`cursor-pointer transition-opacity hover:opacity-100 ${on ? "" : "opacity-50"}`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* The covers: two per row on mobile; on desktop a 24-column grid,
              three per row, each 6 columns wide with 3 empty columns between
              them (starting at columns 1, 10 and 19) */}
          <div className="grid content-start grid-cols-2 gap-x-3 lg:gap-x-6 gap-y-12 px-3 lg:px-6 pb-24 lg:grid-cols-24 lg:gap-y-24">
            {visibleIssues.map((issue, i) => (
              <ShopCover
                key={issue._id}
                issue={issue}
                className={`lg:col-span-6 ${COL_START[i % 3]}`}
              />
            ))}
          </div>
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
