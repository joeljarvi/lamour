"use client";

import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import IssueCard from "./IssueCard";
import IssueTile from "./IssueTile";
import LLBottomBar, { type BarFilter } from "./LLBottomBar";

const FILTERS: BarFilter[] = [
  { id: "all", label: "alla" },
  { id: "sv", label: "svenska" },
  { id: "en", label: "engelska" },
  { id: "inStock", label: "i lager" },
];

function matchesFilter(issue: Issue, filter: string) {
  if (filter === "sv" || filter === "en") return issue.language === filter;
  if (filter === "inStock") return issue.inStock !== false;
  return true;
}

export default function ShopClient() {
  const issues = useIssues();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filter, setFilter] = useState("all");
  const visibleIssues = issues.filter((issue) => matchesFilter(issue, filter));

  // The bottom bar only shows once the grid has reached the top of the screen
  // (i.e. the home page hero has been scrolled past), until the grid has
  // scrolled away. The observed area is the top 10% of the viewport
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { margin: "0px 0px -90% 0px" });

  return (
    <>
      {/* Heading spans the page; issues below as a 2/3-column grid of tiles */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 lg:grid-cols-4 px-0 pt-16 lg:pt-0 pb-16 w-full"
      >
        <div className="lg:col-span-4">
          {/* 1px grid lines: tiles draw right + bottom, grid draws top + left */}
          <div className="grid grid-cols-1 lg:grid-cols-4  border-l border-neutral-300">
            {visibleIssues.map((issue) => (
              <IssueTile
                key={issue._id}
                issue={issue}
                onSelect={setSelectedIssue}
              />
            ))}
          </div>
        </div>
      </div>
      <IssueCard issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      <LLBottomBar
        visible={gridInView}
        filters={FILTERS}
        activeFilter={filter}
        onFilterChange={setFilter}
      />
    </>
  );
}
