"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Issue } from "@/lib/contexts/IssuesContext";
import { useCart } from "@/lib/contexts/CartContext";
import { urlFor } from "@/lib/sanity/image";
import { issueTitle } from "@/lib/issueTitle";
import { splitNames } from "@/lib/splitNames";

// How many contributors are listed below a cover before "m.m"
const MAX_CONTRIBUTORS = 4;

// One issue in the shop: its cover (linking to the issue, which opens as a
// modal), then its number + title and its first contributors ("Jonathan
// Brott, Essy Klingberg, m.m"). Hovering reveals "Lägg i korg" below
// (always shown on touch screens); sold out issues say so instead
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
  const names = splitNames(issue.contributors);
  const contributors = [
    ...names.slice(0, MAX_CONTRIBUTORS),
    ...(names.length > MAX_CONTRIBUTORS ? [t("andMore")] : []),
  ].join(", ");

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

      <div className="flex flex-col gap-2 lg:gap-3    ">
        <h3 className="font-baskervilleNeoText uppercase tracking-wide leading-tight text-xs">
          #{issue.issueNumber} — {issueTitle(issue.title)}
        </h3>
        {contributors && (
          <p className="normal-case tracking-wide text-sm text-neutral-700 font-baskervilleNeoText">
            {contributors}
          </p>
        )}
      </div>

      {soldOut ? (
        <span className="font-baskervilleNeoText text-xs uppercase italic tracking-[24%] ">
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
          className="self-start cursor-pointer font-baskervilleNeoText text-sm normal-case tracking-wide underline-offset-4 hover:underline transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-80 focus-visible:opacity-100"
        >
          {t("addToCart")}
        </button>
      )}
    </div>
  );
}
