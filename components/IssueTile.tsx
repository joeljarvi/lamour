"use client";

import Image from "next/image";
import type { Issue } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import { issueTitle } from "@/lib/issueTitle";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/contexts/CartContext";
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
  const src = issue.cover?.asset ? urlFor(issue.cover).url() : null;
  // One name per line or comma in Sanity's Contributors field
  const contributors = (issue.contributors ?? "")
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean);
  const t = useTranslations("Issue");
  const { addToCart, setDrawerOpen } = useCart();
  const soldOut = issue.inStock === false;

  function handleAddToCart() {
    addToCart({
      id: issue._id,
      title: issue.title,
      price: issue.price != null ? `${issue.price} kr` : "0",
    });
    setDrawerOpen(true);
  }

  const tileClass = `block  relative bg-background  transition-all aspect-square p-6 w-full text-center lg:text-left`;
  const content = (
    <>
      {/* Title for screen readers only; the tile shows the issue number */}
      <span className="sr-only">
        {issueTitle(issue.title)}
        {soldOut && ` (${t("soldOut")})`}
      </span>

      {/* Cover: half the card's height on mobile; half + 48px on desktop,
          shrinking to half on hover. Issue number below it, always shown */}
      <div className="absolute inset-6 z-20 lg:z-auto flex flex-col gap-12 items-center justify-center">
        {src && (
          <Image
            src={src}
            width={0}
            height={0}
            sizes="(min-width: 1024px) 25vw, 100vw"
            alt={issue.cover?.alt ?? issue.title}
            className="w-auto h-auto max-w-full max-h-1/2 lg:max-h-[calc(50%+48px)] lg:group-hover:max-h-1/2 transition-[max-height] duration-300 ease-out shadow"
          />
        )}
        <span
          aria-hidden
          className="font-baskervilleNeoText text-xs uppercase tracking-[24%] group-hover:tracking-[48%] group-hover:italic transition-all"
        >
          #{issue.issueNumber}
        </span>
      </div>
    </>
  );

  return (
    // No "group" when sold out, so the hover effects don't run
    <div className={`${soldOut ? "" : "group"} relative`}>
      {soldOut ? (
        <>
          {/* Sold out: blurred, faded and not a link */}
          <div aria-disabled className={`${tileClass}   opacity-0 select-none`}>
            {content}
          </div>
          {/* Label centred on top of the cover, outside the blurred tile so
              it stays sharp (the screen-reader title already says sold
              out). The cover sits above the tile's centre by half of the
              number below it plus their gap ((16px + 48px) / 2 = 32px), so
              the label moves up by that much */}
          <span
            aria-hidden
            className="absolute inset-0 z-30 -translate-y-8 flex items-center justify-center font-unifraktur text-xs  lowercase lg:text-sm text-red-700 tracking-[24%] lg:tracking-[12%]"
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
