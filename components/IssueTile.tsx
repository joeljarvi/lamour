"use client";

import Image from "next/image";
import type { Issue } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import { issueTitle } from "@/lib/issueTitle";

// Square grid card: title always visible, cover centred, contributors on hover
// (hover effects desktop only)
export default function IssueTile({
  issue,
  onSelect,
}: {
  issue: Issue;
  onSelect: (issue: Issue) => void;
}) {
  const src = issue.cover?.asset ? urlFor(issue.cover).url() : null;
  // One name per line or comma in Sanity's Contributors field
  const contributors = (issue.contributors ?? "")
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean);

  return (
    // Mobile follows the link to the slug page; desktop opens the panel instead
    <Link
      href={`/shop/${issue.slug.current}`}
      onClick={(e) => {
        if (!window.matchMedia("(min-width: 1024px)").matches) return;
        e.preventDefault();
        onSelect(issue);
      }}
      className=" group block relative bg-background hover:bg-[rgb(0,255,0)] transition-all border-r border-b border-neutral-300 aspect-square w-full p-6 lg:p-6 text-center lg:text-left cursor-pointer"
    >
      <span className="relative lg:z-10 block font-baskervilleNeoDisplay tracking-wide  lg:font-baskervilleNeoText text-xl lg:text-xs lg:tracking-[24%] uppercase">
        {issueTitle(issue.title)}
      </span>

      {/* Cover: half the card's height + 48px, shrinks to half on hover.
          Sits above the title on mobile, below it on desktop */}
      <div className="absolute inset-6 z-20 lg:z-auto flex items-center justify-center">
        {src && (
          <Image
            src={src}
            width={0}
            height={0}
            sizes="(min-width: 1024px) 25vw, 100vw"
            alt={issue.cover?.alt ?? issue.title}
            className="w-auto h-auto max-w-full max-h-[calc(50%+48px)] lg:group-hover:max-h-1/2 transition-[max-height] duration-300 ease-out shadow"
          />
        )}
      </div>

      {/* One running sentence ("Medv. A, B, C"), clamped to two lines */}
      {contributors.length > 0 && (
        <p className="absolute bottom-8 left-6 right-6 z-10 line-clamp-2 font-baskervilleNeoText text-base leading-snug opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
          <span className="tracking-[12%]">Medv. </span>
          <span className="italic tracking-[6%]">
            {contributors.join(", ")}
          </span>
        </p>
      )}
    </Link>
  );
}
