"use client";

import { useIssues } from "@/lib/contexts/IssuesContext";
import { issueTitle } from "@/lib/issueTitle";

// The latest issue's number and title, e.g. "#21 — Cant help myself"
// (issues come newest first), as plain text for a
// heading on a server-rendered page; nothing if there's no issue yet
export default function LatestIssueTitle() {
  const latest = useIssues()[0];
  return latest ? (
    <>
      #{latest.issueNumber} — {issueTitle(latest.title)}
    </>
  ) : null;
}
