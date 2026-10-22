"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { issueTitle } from "@/lib/issueTitle";

// Shown until the latest issue has credits in Sanity
const PLACEHOLDER_CREDIT = "Omslag: Agnes Ivarsson";

// The latest issue's credits above its cover (issues come newest first),
// filling its parent — the cover scaled to fit, against the left edge, and
// linking to the issue, which opens as a modal over the page. Nothing if
// there's no issue or cover
export default function LatestIssueCover() {
  const latest = useIssues()[0];
  if (!latest?.cover?.asset) return null;

  // The issue's credits as "Role: Name", or the placeholder until it has any
  const credits = latest.credits?.filter((c) => c.name) ?? [];
  const creditLine =
    credits.length > 0
      ? credits
          .map((c) => (c.role ? `${c.role}: ${c.name}` : c.name))
          .join(" · ")
      : PLACEHOLDER_CREDIT;

  return (
    // Takes the space its column leaves (flex-1): the credits on top, the
    // cover in the rest, both against the container's left edge
    <div className="flex w-full flex-1 min-h-0 min-w-0 flex-col items-start justify-start pt-0 gap-1.5">
      <h3 className="max-w-full break-words text-left  h2Style normal-case tracking-[12%] text-background px-3">
        {creditLine}
      </h3>
      <Link
        href={`/shop/${latest.slug.current}`}
        scroll={false}
        aria-label={issueTitle(latest.title)}
        className="relative block w-full flex-1 items-start justify-start min-h-0 hover:opacity-90 transition-opacity"
      >
        <Image
          src={urlFor(latest.cover).width(1600).url()}
          alt={latest.cover.alt ?? issueTitle(latest.title)}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-contain object-left"
        />
      </Link>
    </div>
  );
}
