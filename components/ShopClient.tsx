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

  // The bottom bar only shows while the grid fills the top of the screen
  // (the observed area is the top 10% of the viewport)
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { margin: "0px 0px -90% 0px" });

  return (
    <>
      {/* Heading spans the page; issues below as a 2/3-column grid of tiles */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 lg:grid-cols-4 px-0 pt-16 lg:pt-24 lg:px-6 pb-16 w-full gap-12"
      >
        {/* Header: page title, centred */}
        <div className="lg:col-span-4 flex items-center justify-center h-auto lg:h-auto px-6">
          <h1 className="font-baskervilleNeoDisplay italic text-xs uppercase tracking-[48%]">
            alla nummer 2017–nu
          </h1>
        </div>
        <div className="lg:col-span-4">
          {/* 1px grid lines: tiles draw right + bottom, grid draws top + left */}
          <div className="grid grid-cols-1 lg:grid-cols-4  ">
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
      {/* Desktop only — on mobile the bar would hold just the filter button */}
      <div className="hidden lg:block">
        <LLBottomBar
          visible={gridInView}
          filters={FILTERS}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
      </div>
    </>
  );
}
