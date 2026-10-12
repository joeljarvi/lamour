"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Issue } from "@/lib/contexts/IssuesContext";
import type { Article } from "@/lib/contexts/ArticlesContext";
import { urlFor } from "@/lib/sanity/image";
import { getDimensions } from "@/lib/getDimensions";

const DEFAULT_DIMS = getDimensions();

// ─── Issue front cover ────────────────────────────────────────────────────

export function IssueFront({
  issue,
  onSelect,
}: {
  issue: Issue;
  onSelect: (issue: Issue) => void;
}) {
  const dims = getDimensions(issue.dimensions);
  const src = issue.cover?.asset ? urlFor(issue.cover).url() : null;

  return (
    <Link
      href={`/shop/${issue.slug.current}`}
      onClick={(e) => {
        e.preventDefault();
        onSelect(issue);
      }}
      className="relative block w-full max-w-md overflow-hidden shadow hover:opacity-90 transition-opacity duration-300"
      style={{ aspectRatio: dims.coverAspectRatio }}
    >
      {src ? (
        <Image
          src={src}
          fill
          alt={issue.cover?.alt ?? issue.title}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-foreground/20 flex flex-col justify-end items-start p-6">
          <span className="font-baskervilleSC text-foreground lowercase text-lg tracking-widest leading-tight">
            {issue.title}
          </span>
          <span className="font-baskervilleSC lowercase text-foreground/60 text-lg">
            LL ({issue.issueNumber})
          </span>
        </div>
      )}
    </Link>
  );
}

// ─── Article front cover ──────────────────────────────────────────────────

export function ArticleFront({ article }: { article: Article }) {
  const src = article.coverImage?.asset
    ? urlFor(article.coverImage).url()
    : null;

  return (
    <Link
      href={`/articles/${article.slug.current}`}
      className="relative block w-full max-w-md overflow-hidden shadow hover:opacity-80 transition-opacity duration-300"
      style={{ aspectRatio: DEFAULT_DIMS.coverAspectRatio }}
    >
      {src ? (
        <Image
          src={src}
          fill
          alt={article.coverImage?.alt ?? article.title}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-foreground/10 flex flex-col justify-center items-center p-6">
          <span className="font-baskervilleSC text-center text-foreground lowercase text-lg tracking-widest leading-tight">
            {article.title}
          </span>
          {article.author && (
            <span className="font-baskervilleSC lowercase text-foreground/60 text-lg">
              {article.author.name}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
