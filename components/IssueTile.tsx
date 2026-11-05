"use client";

import Image from "next/image";
import type { Issue } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import { issueTitle } from "@/lib/issueTitle";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

// Square grid card: title always visible, cover centred, contributors on hover
// (hover effects desktop only). Links to the issue, which opens as a modal
// (the intercepted /shop/[slug] route)
export default function IssueTile({
  issue,
  replace,
}: {
  issue: Issue;
  // Replace the current history entry instead of adding one (e.g. switching
  // issue inside the modal, so closing it still goes back to the page)
  replace?: boolean;
}) {
  // The product image when the issue has one and "Use product image" is on
  // in Sanity, otherwise the cover; shown the same way either way
  const image =
    issue.useProductImage && issue.productImage?.asset
      ? issue.productImage
      : issue.cover;
  const src = image?.asset ? urlFor(image).url() : null;
  // One name per line or comma in Sanity's Contributors field
  const contributors = (issue.contributors ?? "")
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean);
  const t = useTranslations("Issue");
  const soldOut = issue.inStock === false;

  const tileClass = `block  relative transition-all aspect-square p-3 lg:p-6 bg-background hover:bg-neutral-100 w-full text-center lg:text-left`;

  const content = (
    <>
      {/* Title for screen readers (the visible one only shows on hover) */}
      <span className="sr-only">
        {issueTitle(issue.title)}
        {soldOut && ` (${t("soldOut")})`}
      </span>

      {/* Image (cover or product image): half the card's height, the same
          in every tile (its width following its shape), always exactly
          centred in the tile. The title (desktop, on hover) floats 24px
          above it and the issue number 24px below, neither taking space */}
      <div className="@container absolute inset-0 z-20 lg:z-auto flex flex-col gap-6 items-center justify-center">
        {/* The cover, with the title absolute above it: a box half the
            tile's height, as wide as the cover */}
        <span className="relative flex h-1/2 shrink-0">
          {/* Desktop: the title, 24px above the cover and centred on it,
              two thirds of the tile's width (66cqw: this box's @container),
              fading in on hover. Absolute, so it takes no space and the
              cover and number don't move. White with mix-blend-difference,
              so it shows inverted over the tile */}
          <span
            aria-hidden
            className="hidden  absolute bottom-full left-1/2 -translate-x-1/2 mb-6 z-40 w-[66cqw] text-white mix-blend-difference font-baskervilleNeoDisplay whitespace-break-spaces leading-[1.8] text-sm uppercase tracking-[48%] text-center opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300"
          >
            {issueTitle(issue.title)}
          </span>
          {src && (
            <Image
              src={src}
              width={0}
              height={0}
              sizes="(min-width: 1024px) 33vw, 50vw"
              alt={image?.alt ?? issue.title}
              className="h-full w-auto object-contain shadow"
            />
          )}
          {/* The issue number, always shown, 24px below the cover and
              centred on it. Absolute, like the title, so the cover alone is
              centred in the tile */}
          <span
            aria-hidden
            className="absolute top-full left-1/2 -translate-x-1/2 mt-6 lg:mt-6 whitespace-nowrap font-baskervilleNeoDisplay text-xs  lg:text-sm uppercase tracking-[48%]"
          >
            #{issue.issueNumber}
          </span>
        </span>
      </div>
    </>
  );

  return (
    // No "group" when sold out, so the hover effects don't run
    // 1px grid lines without doubling: each tile draws its right and bottom
    // line, the grid around the tiles its top and left
    <div className={`${soldOut ? "" : "group"} relative bg-background`}>
      {soldOut ? (
        <>
          {/* Sold out: the cover still shows, faded (opacity-30), with the
              label on top; not a link */}
          <div aria-disabled className={`${tileClass} opacity-20 select-none`}>
            {content}
          </div>
          {/* Label centred on top of the cover, outside the blurred tile so
              it stays sharp (the screen-reader title already says sold
              out). The cover sits above the tile's centre by half of the
              number below it plus their gap ((16px + 48px) / 2 = 32px), so
              the label moves up by that much */}
          <span
            aria-hidden
            className={`absolute inset-0 z-30 -translate-y-8 flex items-center justify-center font-baskervilleNeoText uppercase text-xs ml-24 lg:ml-60 rotate-90 lg:text-xs italic  tracking-[24%] lg:tracking-[48%]`}
          >
            {t("soldOut")}
          </span>
        </>
      ) : (
        // scroll={false} keeps the page underneath the modal where it was
        <Link
          href={`/shop/${issue.slug.current}`}
          scroll={false}
          replace={replace}
          className={`${tileClass} cursor-pointer`}
        >
          {content}
        </Link>
      )}
    </div>
  );
}
