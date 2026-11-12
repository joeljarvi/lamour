"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Issue } from "@/lib/contexts/IssuesContext";
import { urlFor } from "@/lib/sanity/image";
import { issueTitle } from "@/lib/issueTitle";
import { useCart } from "@/lib/contexts/CartContext";

// One issue in the shop: its cover (linking to the issue, which opens as a
// modal), then its number + title with its price across from it, and
// "Lägg i korg" below (the price and the button revealed on hover); sold out issues say so instead
// Text revealed on hover over the cover (desktop; always shown on touch
// screens), as the old "Lägg i korg" was
const REVEAL =
  "font-baskervilleNeoText text-sm normal-case tracking-wide leading-tight transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-80";

export default function ShopCover({
  issue,
  className,
}: {
  issue: Issue;
  className?: string;
}) {
  const t = useTranslations("Issue");
  const soldOut = issue.inStock === false;
  const { addToCart, setDrawerOpen } = useCart();

  return (
    <div className={`group flex flex-col gap-3  ${className ?? ""}`}>
      <Link
        href={`/shop/${issue.slug.current}`}
        scroll={false}
        aria-label={issueTitle(issue.title)}
        className={`block transition-opacity hover:opacity-90 ${soldOut ? "opacity-30" : ""}`}
      >
        {issue.cover?.asset && (
          <Image
            src={urlFor(issue.cover).width(1200).url()}
            alt={issue.cover.alt ?? issueTitle(issue.title)}
            width={1200}
            height={1650}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="w-full h-auto shadow"
          />
        )}
      </Link>

      {/* Number + title on the left; the price on the right, revealed
          on hover (always shown on touch screens) */}
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 font-baskervilleNeoText uppercase tracking-wide leading-tight text-xs">
          #{issue.issueNumber} — {issueTitle(issue.title)}
        </h3>
        {issue.price != null && (
          <span className={`shrink-0 ${REVEAL}`}>{issue.price} kr</span>
        )}
      </div>

      {/* Below: "Lägg i korg", also revealed on hover (adds the issue and
          opens the cart), or "Slutsåld" when sold out */}
      {soldOut ? (
        <span className="self-start font-baskervilleNeoText text-xs italic normal-case tracking-wide leading-tight">
          {t("soldOut")}
        </span>
      ) : (
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
          className={`self-start cursor-pointer underline underline-offset-4 focus-visible:opacity-100 ${REVEAL}`}
        >
          {t("addToCart")}
        </button>
      )}
    </div>
  );
}
