"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { issueTitle } from "@/lib/issueTitle";
import ShopCover, { type CoverView } from "./ShopCover";
import { Button } from "@/components/ui/button";
import { Input, SEARCH_LOOK } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NAV_SIZE } from "./filterBarStyles";
import { titleCase } from "@/lib/titleCase";
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

// The shop: every issue as a grid of tiles, searched, sorted and filtered
// by contributor in the filter drawer (opened by "Filtrera & sök")
// Desktop: the filter bar's controls in the nav buttons' type (text-1
// capitals with wider spacing, no side padding), 28px tall (h-7) with the
// capitals centred in them: the line's centring would leave them ~2.85px
// high (it also holds the font's room for descenders), so 0.45em (≈5.7px)
// of top padding moves them down by half that; the buttons' own look
// (fill sweeping in on hover) kept

// The heading's sorts, in the order a click cycles through them
// ("Senast tillagda" first, the default)
const SORT_CYCLE: ShopSort[] = ["latest", "az", "price", "cheap"];
const nextSort = (sort: ShopSort) =>
  SORT_CYCLE[(SORT_CYCLE.indexOf(sort) + 1) % SORT_CYCLE.length];

// Issues sorted: newest first (as they come), by title A–Ö, or by price,
// highest or lowest first (issues without a price last)
function sortIssues(list: Issue[], sort: ShopSort) {
  if (sort === "az")
    return [...list].sort((a, b) =>
      issueTitle(a.title).localeCompare(issueTitle(b.title), "sv"),
    );
  if (sort === "price")
    return [...list].sort(
      (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
    );
  if (sort === "cheap")
    return [...list].sort(
      (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    );
  return list;
}

export default function ShopClient() {
  const t = useTranslations("Nav");
  const tFilter = useTranslations("Filter");
  const issues = useIssues();
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ShopSort>("latest");
  // "Alla nummer"'s own sort (its heading's last part; a click moves to
  // the next)
  const [allSort, setAllSort] = useState<ShopSort>("latest");
  // How the issues are shown ("1 2 3" top right): 1 six a row, each cover
  // its own height; 2 four a row in squares; 3 four a row in 3:4 boxes
  const [gridView, setGridView] = useState<CoverView>(2);
  const [chosen, setChosen] = useState<string[]>([]);
  // The contributor list below the header, shown or not
  const [contributorsOpen, setContributorsOpen] = useState(false);
  // The sort list in the grid's first column (desktop), shown or not
  // ("Sortera" toggles it)
  const [sortOpen, setSortOpen] = useState(true);
  // What the open list shows: the contributors or the issues' titles
  const [listKind, setListKind] = useState<"contributors" | "titles">(
    "contributors",
  );
  // The chosen titles (none: every issue)
  const [chosenTitles, setChosenTitles] = useState<string[]>([]);

  // The search in use (focused, or something typed): it takes the row's
  // free space, "Alla nummer" shrinks to its text
  const [searchFocused, setSearchFocused] = useState(false);
  const searchActive = searchFocused || query.trim() !== "";

  // Every contributor across the issues, once each, in Swedish order
  const contributors = useMemo(
    () =>
      [...new Set(issues.flatMap(contributorsOf))].sort((a, b) =>
        a.localeCompare(b, "sv"),
      ),
    [issues],
  );

  // Every issue's title, once each, in Swedish order
  const titles = useMemo(
    () =>
      [...new Set(issues.map((issue) => issueTitle(issue.title)))].sort(
        (a, b) => a.localeCompare(b, "sv"),
      ),
    [issues],
  );
  const toggleTitle = (title: string) =>
    setChosenTitles((prev) =>
      prev.includes(title) ? prev.filter((n) => n !== title) : [...prev, title],
    );

  // The open list narrowed by the search too: the names and titles
  // containing it (the chosen ones always kept, so they can be unchosen)
  const q = query.trim().toLocaleLowerCase("sv");
  const listed = (items: string[], picked: string[]) =>
    q
      ? items.filter(
          (item) =>
            picked.includes(item) || item.toLocaleLowerCase("sv").includes(q),
        )
      : items;
  const listedContributors = listed(contributors, chosen);
  const listedTitles = listed(titles, chosenTitles);

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
        contributorsOf(issue).some((name) => chosen.includes(name))) &&
      (chosenTitles.length === 0 ||
        chosenTitles.includes(issueTitle(issue.title))),
  );
  // Sorted: newest first (as they come), by title A–Ö, or by price,
  // highest first (issues without a price last)
  const visibleIssues =
    sort === "az"
      ? [...filtered].sort((a, b) =>
          issueTitle(a.title).localeCompare(issueTitle(b.title), "sv"),
        )
      : sort === "price"
        ? [...filtered].sort(
            (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
          )
        : sort === "cheap"
          ? [...filtered].sort(
              (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
            )
          : filtered;
  // The searched and filtered issues by title, A–Ö (the "Alla nummer A–Ö"
  // section)
  const issuesAz = sortIssues(filtered, allSort);
  // Nothing chosen or searched: every issue shows ("Alla")
  const showingAll =
    chosen.length === 0 && chosenTitles.length === 0 && query.trim() === "";

  // Back to every issue, newest first
  const clearAll = () => {
    setQuery("");
    setSort("latest");
    setChosen([]);
    setChosenTitles([]);
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

  // Each sort's name in the headings
  const sortName: Record<ShopSort, string> = {
    latest: tFilter("recentlyAdded"),
    az: tFilter("az"),
    price: tFilter("sortHighLow"),
    cheap: tFilter("sortLowHigh"),
  };
  // A heading's sort: its name, a click moving to the next sort
  const sortButton = (value: ShopSort, set: (s: ShopSort) => void) => (
    <button
      type="button"
      onClick={() => set(nextSort(value))}
      aria-label={`${tFilter("sortBy")}: ${sortName[value]}`}
      className="cursor-pointer text-left italic transition-opacity hover:opacity-60"
    >
      {sortName[value]}
    </button>
  );

  return (
    <div>
      {/* A sticky strip below the navbar with no height (so it takes no
          space), for the active filters */}

      {/* Desktop: the filter panel, while open, fixed on the left (a third
          of the screen); the grid moves right past it (ml-1/3) (two columns then, so the tiles keep their
          size) */}
      <div className="lg:flex lg:items-start   bg-background pt-0  ">
        <div className={`flex-1 min-w-0 min-h-dvh px-3 `}>
          {/* The filter bar: "Filtrera", the search, the lists' buttons;
              the sort on the right */}
          {/* Desktop: four columns (12px apart, 12px in from the sides):
              the first a list of ways to see the issues (text-6, sticking
              while the grid scrolls), the issues in the other three. Mobile:
              two columns of issues */}
          {/* The newest three issues, unfiltered and unsorted: "Senast
              tillagda" (text-1) top left, the issues in the other three
              columns. Mobile: two columns */}
          {/* Every issue, sorted by the heading's sort (searched and
              filtered): the heading and the filter controls side by side
              above, the issues in all four columns below */}
          <section className="mt-48">
            {/* The line above the section, sticking right below the navbar
                while the section is on screen (the heading 12px under it) */}

            <div className=" pt-3 flex flex-col gap-3">
              {/* One row: the heading, then the search, "Medverkande ❦
                Titlar" and "Rensa filter" (the list they open below
                them) */}
              {/* Desktop: 12 columns as the navbar's (20px in, 12px apart):
                  the heading in cols 1–2, the filter from col 3 (under the
                  navbar's pages) */}
              <div className="flex flex-row flex-wrap items-baseline gap-x-12 gap-y-3 -mx-3 px-5 lg:grid lg:grid-cols-12 lg:gap-x-3">
                {/* "Alla nummer ❦ A–Ö": the heading split before its last
                  word (the order), a ❦ between, 12px apart */}
                <h2 className="font-baskervilleNeoText text-1 flex gap-x-3 lg:col-span-2">
                  {/* "Affären" with the number of issues shown raised */}
                  <span>
                    {tFilter("shopHeading")}
                    <sup className="ml-0.5">{issuesAz.length}</sup>
                  </span>

                  {sortButton(allSort, setAllSort)}
                </h2>
                <div
                  id="filter"
                  data-section="filter"
                  // Next to the heading, taking the rest of the row
                  className="z-40 flex min-w-0 flex-1 flex-col items-stretch h-auto pStyle normal-case lg:col-start-3 lg:col-span-9"
                >
                  {/* "Alla nummer", then "Filtrera efter medverkande", which
                      shows and hides every contributor below the header */}
                  {/* One row: "Alla nummer" takes the space left over (and
                      gives it up first); the filter button, sort and "Rensa
                      filter" keep their width; the search shrinks if needed */}
                  {/* The search, then below it the filter options:
                        "Medverkande / Titlar" and, while a list is shown,
                        "Rensa filter" (normal case, never filled) */}
                  <div className="relative flex min-w-0 flex-row flex-wrap items-baseline gap-x-6 gap-y-3 h-auto w-full">
                    <div className="contents">
                      {/* "Filtrera efter medverkande": shows the contributors
                          below; clicking again hides them */}
                      <Button
                        variant="Link"
                        size="xs"
                        className={cn(
                          NAV_SIZE,
                          "px-0 lg:px-0 normal-case lg:normal-case tracking-normal lg:tracking-normal not-italic hover:italic aria-expanded:italic",
                        )}
                        aria-pressed={contributorsOpen}
                        aria-expanded={contributorsOpen}
                        onClick={() => {
                          if (contributorsOpen) setContributorsOpen(false);
                          else {
                            setListKind("contributors");
                            setContributorsOpen(true);
                          }
                        }}
                      >
                        {tFilter("byContributor")}
                      </Button>
                      {/* While a list is shown: "Rensa filter" */}
                      {contributorsOpen && (
                        <Button
                          variant="Link"
                          size="xs"
                          className={cn(
                            NAV_SIZE,
                            "px-0 lg:px-0 normal-case lg:normal-case tracking-normal lg:tracking-normal not-italic hover:italic",
                          )}
                          onClick={clearAll}
                        >
                          {tFilter("clearFilters")}
                        </Button>
                      )}
                    </div>
                    {/* Searches the issues (title, contributors…), as the
                        filter panel's search does */}
                    {/* The search box, a cross inside it on the right that
                        empties it (the browser's own clear button hidden).
                        Right after "Filtrera" */}
                    <div className="group relative w-40 shrink min-w-0 lg:w-48 -ml-2">
                      <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder={tFilter("searchPlaceholder")}
                        aria-label={tFilter("search")}
                        // SEARCH_LOOK: transparent, a light grey fill sweeping in from
                        // the left on hover and while typing
                        className={`peer ${SEARCH_LOOK} px-4 pr-9 ${NAV_SIZE} lg:pr-5 lg:pt-[0.3em]`}
                      />
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label={tFilter("clearFilters")}
                        // Only while the search is in use: focused, or something typed
                        className="absolute right-3 lg:right-0 top-1/2 -translate-y-1/2 hidden peer-focus:flex peer-[:not(:placeholder-shown)]:flex size-4 cursor-pointer items-center justify-center text-primary hover:opacity-60"
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 16 16"
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path d="M2 2 14 14M14 2 2 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Every contributor, wrapping onto as many lines as needed: a
                        click filters by them (several at once: issues with any of
                        them); chosen ones dark, the rest faded. Inside the sticky
                        bar, right below its row and as wide (sticks with it; scrolls
                        itself if taller than half the screen) */}
                  {contributorsOpen && (
                    <div
                      // The names one after another, wrapping onto as many lines as
                      // needed
                      className="flex flex-wrap gap-x-3 gap-y-3 justify-start mx-0 h-auto max-h-dvh overflow-y-auto mt-3 px-0 scrollbar-none bg-background
                        py-5 text-1 normal-case rounded-none"
                    >
                      {listKind === "contributors" ? (
                        <>
                          {/* First: every contributor (clears the choice); dark
                              while none is chosen */}
                          <Button
                            variant="Link"
                            size="linkSize"
                            aria-pressed={chosen.length === 0}
                            onClick={() => setChosen([])}
                            className={`transition-opacity hover:opacity-100 text-1 ${chosen.length === 0 ? "italic" : "opacity-100"}`}
                          >
                            {tFilter("allContributors")}
                          </Button>
                          {listedContributors.map((name) => {
                            const on = chosen.includes(name);
                            return (
                              <Button
                                key={name}
                                variant="Link"
                                size="linkSize"
                                aria-pressed={on}
                                onClick={() => toggleContributor(name)}
                                className={`transition-opacity hover:opacity-100 text-1 ${on ? "italic" : "opacity-50"}`}
                              >
                                {titleCase(name)}
                              </Button>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          {/* First: every title (clears the choice); then each
                              issue's title, a click filters by it (several at
                              once) */}
                          <Button
                            variant="Link"
                            size="linkSize"
                            aria-pressed={chosenTitles.length === 0}
                            onClick={() => setChosenTitles([])}
                            className={`normal-case transition-opacity hover:opacity-100 text-1 ${chosenTitles.length === 0 ? "italic" : "opacity-50"}`}
                          >
                            {tFilter("allTitles")}
                          </Button>
                          {listedTitles.map((title) => {
                            const on = chosenTitles.includes(title);
                            return (
                              <Button
                                key={title}
                                variant="Link"
                                size="linkSize"
                                aria-pressed={on}
                                onClick={() => toggleTitle(title)}
                                className={`transition-opacity hover:opacity-100 ${on ? "italic" : "opacity-50"}`}
                              >
                                {titleCase(title)}
                              </Button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
                {/* "1 2 3": how the issues are shown (column 12, on the
                    right); the chosen one italic */}
                <div className="ml-auto flex items-baseline justify-end gap-x-3 lg:ml-0 lg:col-start-12">
                  {([1, 2, 3] as const).map((view) => (
                    <Button
                      key={view}
                      variant="Link"
                      size="xs"
                      aria-pressed={gridView === view}
                      aria-label={`${tFilter("view")} ${view}`}
                      onClick={() => setGridView(view)}
                      className={cn(
                        NAV_SIZE,
                        "px-0 lg:px-0 normal-case lg:normal-case tracking-normal lg:tracking-normal not-italic hover:italic aria-pressed:italic",
                      )}
                    >
                      {view}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Desktop: six issues a row (view 1) or four (views 2, 3);
                  20px in, as the navbar */}
              <ul
                className={cn(
                  "grid grid-cols-2 gap-x-5 gap-y-10 -mx-3 px-5 list-none",
                  gridView === 1 ? "lg:grid-cols-6" : "lg:grid-cols-4",
                )}
              >
                {issuesAz.map((issue) => (
                  <li key={issue._id}>
                    <ShopCover issue={issue} view={gridView} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
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
