"use client";

import { useState } from "react";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { IssueFront } from "./Covers";
import IssueCard from "./IssueCard";
import IssuesSubMenu from "./IssuesSubMenu";

export default function ShopClient() {
  const issues = useIssues();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  return (
    <>
      <div className="flex flex-col items-center gap-12 w-full px-4 pt-20 pb-16 lg:pt-24">
        <IssuesSubMenu />
        {issues.map((issue) => (
          <IssueFront
            key={issue._id}
            issue={issue}
            onSelect={setSelectedIssue}
          />
        ))}
      </div>
      <IssueCard issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </>
  );
}
