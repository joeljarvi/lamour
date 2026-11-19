"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Issue } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { issueTitle } from "@/lib/issueTitle";
import { useCart } from "@/lib/contexts/CartContext";

// One issue in the shop: its cover (linking to the issue, which opens as a
// modal), then its number + title, and below them the price with "Lägg i
// korg" on the same baseline at the right (revealed on hover); sold out
// issues say so instead

// Text revealed on hover over the cover (desktop; always shown on touch
// screens)
const REVEAL =
  "transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-80";

export default function ShopCover({
  issue,
  className,
}: {
  issue: Issue;
  className?: string;
}) {
  const t = useTranslations("Issue");
  const { addToCart, setDrawerOpen } = useCart();
  const soldOut = issue.inStock === false;

  return (
    // Like an article's cover: the cover in a fixed 3:4 box (cropped to
    // fill it), then the title, and the price below it
    <div className={`group flex flex-col gap-3 lg:gap-[24px] ${className ?? ""}`}>
      <Link
        href={`/shop/${issue.slug.current}`}
        scroll={false}
        aria-label={issueTitle(issue.title)}
        className={`relative block aspect-[3/4] w-full overflow-hidden transition-opacity hover:opacity-90 ${soldOut ? "opacity-30" : ""}`}
      >
        {issue.cover?.asset && (
          <Image
            src={urlFor(issue.cover).width(1200).url()}
            alt={issue.cover.alt ?? issueTitle(issue.title)}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover shadow"
          />
        )}
      </Link>

      <div className="flex flex-col gap-0">
        <h3 className="pStyle">
          #{issue.issueNumber} — {issueTitle(issue.title)}
        </h3>
        {/* The price on the left ("Slutsåld" when sold out) and, on the
            same baseline at the right, "Lägg i korg" (revealed on hover on
            desktop; adds the issue and opens the cart) */}
        <div className="mt-[12px] flex items-baseline justify-between gap-6 pStyle">
          {soldOut ? (
            <span className="italic normal-case tracking-wide">
              {t("soldOut")}
            </span>
          ) : (
            <>
              <span className="normal-case tracking-wide">
                {issue.price != null ? `${issue.price} kr` : null}
              </span>
              <button
                type="button"
                onClick={() => {
                  addToCart({
                    id: issue._id,
                    title: issue.title,
                    price: issue.price != null ? `${issue.price} kr` : "0",
                  });
                  setDrawerOpen(true);
                }}
                className={`shrink-0 cursor-pointer underline-offset-4 hover:underline focus-visible:opacity-100 ${REVEAL}`}
              >
                {t("addToCart")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
