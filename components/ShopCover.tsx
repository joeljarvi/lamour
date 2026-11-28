"use client";

import { cn } from "@/lib/utils";
import Ticker from "./Ticker";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Issue } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { issueNumberLabel, issueTitle } from "@/lib/issueTitle";
import { useCart } from "@/lib/contexts/CartContext";

// One issue in the shop: its cover (linking to the issue, which opens as a
// modal), then its number + title, and below them the price with "Lägg i
// korg" on the same baseline at the right (revealed on hover); sold out
// issues say so instead

// The square box an issue's cover sits in (the shop's tiles, the issue
// page's header): a border (no shadow); the cover centred in it (COVER_IN_BOX: every cover the same
// height, 75% of the box, its width its own)
export const COVER_BOX =
  "relative flex aspect-square min-h-0 overflow-hidden items-center justify-start  transition-all duration-300 bg-background hover:bg-neutral-200  p-0   ";
export const COVER_IN_BOX =
  "block h-full  w-auto max-w-[90%] object-left shadow";

// How the cover is shown: 1 the tile's full width at its own height; 2 in
// a square, centred; 3 in a 3:4 box, at its bottom left
export type CoverView = 1 | 2 | 3;
export const BOX_LOOK: Record<CoverView, string> = {
  1: "aspect-auto",
  2: "aspect-square items-center justify-center py-10 px-10 bg-neutral-100",
  3: "aspect-3/4 items-end justify-start",
};
export const IMAGE_LOOK: Record<CoverView, string> = {
  1: "w-full h-auto",
  2: "w-full h-full object-contain object-center",
  3: "w-full h-full object-contain object-left-bottom",
};

// The caption under a cover, by the view (views 1, 3: 8px down, 20px in on
// the right; view 2: 20px down, 40px in on the left, 20px right)
export const CAPTION_LOOK = (view: CoverView) =>
  view === 2 ? "pt-5 pl-10 pr-5" : "mt-2 pl-0 pr-5";

export default function ShopCover({
  issue,
  view = 1,
  className,
}: {
  issue: Issue;
  view?: CoverView;
  className?: string;
}) {
  const t = useTranslations("Issue");
  const { addToCart, setDrawerOpen } = useCart();
  const soldOut = issue.inStock === false;

  return (
    // The cover in its square box, then the title (centred), and the
    // price below it
    <div
      className={`group flex flex-col gap-3 lg:gap-0 w-auto ${className ?? ""}`}
    >
      <Link
        href={`/shop/${issue.slug.current}`}
        scroll={false}
        aria-label={issueTitle(issue.title)}
        // The square box (COVER_BOX), the tile's full width
        className={cn(
          COVER_BOX,
          // The tile's full width; its shape by the view (BOX_LOOK). Not
          // clipped, so the covers' shadows show at the edges
          "w-full overflow-visible hover:opacity-90",
          BOX_LOOK[view],
          soldOut && "opacity-30 bg-neutral-100",
        )}
      >
        {issue.cover?.asset && (
          <Image
            src={urlFor(issue.cover).width(1200).url()}
            alt={issue.cover.alt ?? issueTitle(issue.title)}
            width={1200}
            height={1600}
            sizes="(min-width: 1024px) 25vw, 50vw"
            // Sized by the view (IMAGE_LOOK), its proportions kept; a drop
            // shadow (following the cover itself, not the room a contained
            // image leaves around it)
            className={cn(
              "block drop-shadow-[0_1px_3px_rgb(0_0_0/0.15)]",
              IMAGE_LOOK[view],
            )}
          />
        )}
      </Link>

      {/* The caption under the cover (CAPTION_LOOK) */}
      <div
        className={cn(
          "flex flex-col justify-start items-start gap-0 text-foreground",
          CAPTION_LOOK(view),
        )}
      >
        {/* One row: the number; the title (one line, scrolling as a
            ticker if longer than the space left); the price, 48px on */}
        <div className="flex w-full min-w-0 items-baseline gap-x-3">
          <span className="shrink-0 font-baskervilleNeoText text-1 tracking-normal [font-variant-caps:all-small-caps]">
            {issueNumberLabel(issue)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            {/* View 1: the number only (the title kept for screen
                readers; its space still pushes the price right) */}
            <h3 className={cn("min-w-0 text-left", view === 1 && "sr-only")}>
              <Ticker
                text={issueTitle(issue.title)}
                align="left"
                className="font-baskervilleNeoText text-2 tracking-normal [font-variant-caps:all-small-caps]"
              />
            </h3>
          </div>
          {/* The price ("SLUTSÅLD" when sold out), with Baskerville Neo's
              swashes (the price's SEK: its K); clicking it adds the issue to
              the cart (and opens the cart) */}
          <div className="relative ml-9 shrink-0 flex items-baseline justify-start gap-3 lg:gap-6 font-baskervilleNeoText text-2 tracking-wide text-primary [font-variant-caps:all-small-caps] [font-feature-settings:'swsh'_1]">
            {soldOut ? (
              // In capitals: Baskerville Neo's swashes are on capitals only
              // (SLUTSÅLD: its T and Å)
              <span className="italic uppercase tracking-wide [font-feature-settings:'swsh'_1]">
                {t("soldOut")}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  addToCart({
                    id: issue._id,
                    title: issue.title,
                    price: issue.price != null ? `${issue.price} SEK` : "0",
                  });
                  setDrawerOpen(true);
                }}
                aria-label={`${t("addToCart")}: ${issue.price != null ? `${issue.price} SEK` : ""}`}
                className="normal-case tracking-wide cursor-pointer underline-offset-4 hover:underline"
              >
                {issue.price != null ? `${issue.price} SEK` : t("addToCart")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
