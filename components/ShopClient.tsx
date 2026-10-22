"use client";

import { useState } from "react";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { issueTitle } from "@/lib/issueTitle";
import IssueTile from "./IssueTile";
import { SearchField } from "./FilterParts";

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

// The shop: every issue as a grid of tiles, narrowed by a search field
// centred at the bottom
export default function ShopClient() {
  const issues = useIssues();
  const [query, setQuery] = useState("");
  const visibleIssues = issues.filter((issue) => matchesSearch(issue, query));

  return (
    <div className="bg-background">
      {/* Tiles: two columns on mobile, three on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 border-r border-r-neutral-600">
        {visibleIssues.map((issue) => (
          <IssueTile key={issue._id} issue={issue} />
        ))}
      </div>
      {/* Search, centred at the bottom: sticky at the end of the shop, so it
          rides along at the bottom of the screen while the grid is in view
          (and doesn't show over the hero above it). Framed top, right and
          bottom; the field draws its own left line */}
      <div className="sticky bottom-6 z-30 mx-auto mt-6 w-[min(20rem,calc(100%-1.5rem))] h-12 lg:h-9 border-y border-r border-neutral-600 bg-background">
        <SearchField value={query} onChange={setQuery} />
      </div>
    </div>
  );
}
