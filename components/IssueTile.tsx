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

  const tileClass = `block  relative bg-background  transition-all aspect-square p-3 lg:p-6 w-full text-center lg:text-left`;
  // The issue number
  const numberLabel = (
    <span
      aria-hidden
      className="font-baskervilleNeoText text-xs uppercase tracking-[24%] lg:group-hover:tracking-[48%] lg:group-hover:italic transition-all"
    >
      #{issue.issueNumber}
    </span>
  );

  const content = (
    <>
      {/* Title for screen readers only; the tile shows the issue number */}
      <span className="sr-only">
        {issueTitle(issue.title)}
        {soldOut && ` (${t("soldOut")})`}
      </span>

      {/* Image (cover or product image): half the card's height on mobile;
          half + 48px on desktop, shrinking to half on hover. Issue number
          below it */}
      <div className="absolute inset-6 z-20 lg:z-auto flex flex-col gap-6 lg:gap-12 items-center justify-center">
        {src && (
          <Image
            src={src}
            width={0}
            height={0}
            sizes="(min-width: 1024px) 33vw, 50vw"
            alt={image?.alt ?? issue.title}
            className="w-auto h-auto max-w-full max-h-3/4 lg:max-h-[calc(50%+48px)] lg:group-hover:max-h-1/2 transition-[max-height] duration-300 ease-out shadow"
          />
        )}
        {numberLabel}
      </div>
    </>
  );

  return (
    // No "group" when sold out, so the hover effects don't run
    // 1px grid lines without doubling: each tile draws its right and bottom
    // line, the grid around the tiles its top and left
    <div className={`${soldOut ? "" : "group"} relative`}>
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
      {/* Mobile only (desktop adds to cart from the panel). Outside the link,
        since a button can't sit inside one */}

      {/* Desktop: square add-to-cart in the top-right corner, shown while the
          tile is hovered (or the button has keyboard focus) */}
    </div>
  );
}
