"use client";

import Image from "next/image";
import { useState } from "react";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import { IssueFront, ArticleFront } from "./Covers";
import IssueCard from "./IssueCard";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/lib/sanity/image";
import { getDimensions } from "@/lib/getDimensions";

// ─── Hero: front cover of the latest issue ───────────────────────────────

function Hero({
  issue,
  onSelect,
}: {
  issue: Issue;
  onSelect: (issue: Issue) => void;
}) {
  if (!issue.cover?.asset) return null;
  const dims = getDimensions(issue.dimensions);

  return (
    <section className="relative w-full h-dvh flex flex-col items-center justify-center pt-8 bg-yellow-50">
      <Link
        href={`/shop/${issue.slug.current}`}
        onClick={(e) => {
          e.preventDefault();
          onSelect(issue);
        }}
        className="relative block h-full max-w-3/4 overflow-hidden shadow max-h-[75dvh] hover:opacity-90 transition-opacity duration-300"
        style={{ aspectRatio: dims.coverAspectRatio }}
      >
        <Image
          src={urlFor(issue.cover).url()}
          fill
          priority
          sizes="75vw"
          alt={issue.cover.alt ?? issue.title}
          className="object-object-contain"
        />
      </Link>
    </section>
  );
}

export default function HomeClient() {
  const issues = useIssues();
  const { articles } = useArticles();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const latestIssue = issues[0];

  return (
    <>
      {latestIssue && <Hero issue={latestIssue} onSelect={setSelectedIssue} />}
      <div className="flex flex-col items-center gap-12 w-full px-4 pt-20 pb-16 lg:pt-24">
        {issues.map((issue) => (
          <IssueFront
            key={issue._id}
            issue={issue}
            onSelect={setSelectedIssue}
          />
        ))}
        {articles.map((article) => (
          <ArticleFront key={article._id} article={article} />
        ))}
      </div>
      <IssueCard issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </>
  );
}
