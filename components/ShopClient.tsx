"use client";

import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import IssueCard from "./IssueCard";
import IssueTile from "./IssueTile";
import LLBottomBar, { type BarFilter } from "./LLBottomBar";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Nav");
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
        className="grid grid-cols-1 lg:grid-cols-4 px-0 pt-16 lg:pt-24 lg:px-6 pb-16 w-full gap-12"
      >
        {/* Header: page title left, subscribe right */}
        <div className="lg:col-span-4 flex items-center justify-between h-auto lg:h-auto px-6">
          <h1 className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]">
            alla nummer 2017–nu
          </h1>
          {/* TODO: no subscribe page yet — link it once it exists */}
          <Button variant="link" size="xs" className="w-auto h-auto">
            {t("becomeSubscriber")}
          </Button>
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
