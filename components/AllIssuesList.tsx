"use client";

import { Link } from "@/i18n/navigation";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { issueTitle } from "@/lib/issueTitle";
import { Button } from "./ui/button";

// Every issue, newest first, as "#N — Title" links that open the issue modal;
// one column on mobile, four on desktop. Sold-out issues are faded but still
// open
export default function AllIssuesList({
  oneColumn,
}: {
  // One column on desktop too (e.g. in a narrow column), instead of four
  oneColumn?: boolean;
}) {
  const issues = useIssues();
  return (
    <ul
      className={`columns-1 ${oneColumn ? "" : "lg:columns-4"} gap-0 bg-background h3Style leading-snug`}
    >
      {issues.map((issue) => (
        <li
          key={issue._id}
          className="break-inside-avoid grid grid-cols-6 border-b border-b-neutral-600 "
        >
          <Button
            variant="link"
            size="xs"
            className={`justify-start col-span-1 italic bg-background text-foreground tracking-[12%] tabular-nums h-auto hover:opacity-60 transition-opacity truncate ${issue.inStock === false ? "opacity-40" : ""}`}
            asChild
          >
            <Link href={`/shop/${issue.slug.current}`} scroll={false}>
              #{issue.issueNumber}
            </Link>
          </Button>
          <Button
            variant="link"
            size="xs"
            className={`justify-start bg-background text-foreground col-span-5 h-auto hover:opacity-60 transition-opacity truncate ${issue.inStock === false ? "opacity-40" : ""}`}
            asChild
          >
            <Link href={`/shop/${issue.slug.current}`} scroll={false}>
              {issueTitle(issue.title)}
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}
