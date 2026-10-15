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

  return (
    <div className="group relative">
      {/* Mobile follows the link to the slug page; desktop opens the panel instead */}
      <Link
        href={`/shop/${issue.slug.current}`}
        onClick={(e) => {
          if (!window.matchMedia("(min-width: 1024px)").matches) return;
          e.preventDefault();
          onSelect(issue);
        }}
        className="block relative bg-background  transition-all  aspect-square w-full p-12 lg:p-6 text-center lg:text-left cursor-pointer"
      >
        {/* Title for screen readers only; the tile shows the issue number */}
        <span className="sr-only">{issueTitle(issue.title)}</span>

        {/* Cover: half the card's height on mobile; half + 48px on desktop,
            shrinking to half on hover. Issue number below it, always shown */}
        <div className="absolute inset-6 z-20 lg:z-auto flex flex-col gap-6 items-center justify-center">
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
            className="font-baskervilleNeoDisplay text-xs uppercase tracking-[24%] group-hover:tracking-[48%] group-hover:italic transition-all"
          >
            #{issue.issueNumber}
          </span>
        </div>

        {/* One running sentence ("Medv. A, B, C"), clamped to two lines */}
        {contributors.length > 0 && (
          <p className="absolute bottom-8 left-6 right-6 z-10 line-clamp-2 font-baskervilleNeoText text-xs tracking-[12%] leading-[1.5] opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <span className="tracking-[12%]">Medv. </span>
            <span className="italic tracking-[6%]">
              {contributors.join(", ")}
            </span>
          </p>
        )}
      </Link>
      {/* Mobile only (desktop adds to cart from the panel). Outside the link,
        since a button can't sit inside one */}
      <Button
        variant="outline"
        size="sm"
        disabled={soldOut}
        onClick={handleAddToCart}
        className="lg:hidden absolute bottom-12 left-12 right-12 w-auto z-30 bg-background justify-center disabled:opacity-30 font-baskervilleNeoText text-xs tracking-[24%] uppercase"
      >
        {soldOut ? t("soldOut") : t("addToCart")}
      </Button>
      {/* Desktop: square add-to-cart in the top-right corner, shown while the
          tile is hovered (or the button has keyboard focus) */}
      <Button
        variant="default"
        size="xs"
        disabled={soldOut}
        onClick={handleAddToCart}
        aria-label={soldOut ? t("soldOut") : t("addToCart")}
        className={`hidden  absolute top-6 right-6 z-30 h-6 w-auto aspect-square px-0 bg-foreground justify-center text-background border-y-foreground font-baskervilleNeoDisplay text-base tracking-normal opacity-0 transition-opacity duration-300 focus-visible:opacity-100 ${soldOut ? "disabled:opacity-0 disabled:group-hover:opacity-30" : "group-hover:opacity-100"}`}
      >
        +
      </Button>
    </div>
  );
}
