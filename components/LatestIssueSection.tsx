"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useCart } from "@/lib/contexts/CartContext";
import { urlFor } from "@/lib/sanity/image";
import { issueNumberLabel, issueTitle } from "@/lib/issueTitle";
import { cn } from "@/lib/utils";
import { COVER_BOX, COVER_IN_BOX } from "./ShopCover";
import SanityPortableText from "@/components/SanityPortableText";

// Below the hero on the home page: the latest issue (issues come newest
// first), laid out as the issue page: on a 12-column grid (12px apart,
// 12px in) "Nytt nummer" (col 1), the number and title (cols 3–4), the
// cover (cols 5–8), and the information (cols 10–12, sticking): the
// price and "Lägg i korg" on one line, the description shortened with
// "Läs mer" to the issue page. Stacked on mobile
export default function LatestIssueSection() {
  const latest = useIssues()[0];
  if (!latest) return null;
  return <LatestIssue issue={latest} />;
}

function LatestIssue({ issue }: { issue: Issue }) {
  const t = useTranslations("Issue");
  const { addToCart, setDrawerOpen } = useCart();
  const soldOut = issue.inStock === false;
  const href = `/shop/${issue.slug.current}`;
  // The info column sticks 12px below the navbar
  const STICKY =
    "lg:sticky lg:top-[calc(var(--nav-h,48px)+12px)] lg:self-start";

  return (
    <section className="w-full  h-screen px-3 flex flex-col gap-6 font-baskervilleNeoText text-1 lg:grid lg:grid-cols-12 lg:gap-x-3 lg:items-start">
      {/* The number and the title (small capitals), in column 1 where
          "Nytt nummer" was */}
      <h2
        className={cn(
          "flex gap-x-3 lg:col-start-1 lg:col-span-2 mt-48 [font-variant-caps:all-small-caps] text-2",
          STICKY,
        )}
      >
        <span className="shrink-0">{issueNumberLabel(issue)}</span>
        <span>{issueTitle(issue.title)}</span>
      </h2>

      {/* The cover in its box (opening the issue), the price and "Lägg i
          korg" below it */}
      <div className="flex flex-col gap-3 lg:col-start-7 lg:col-span-4 lg:row-start-1 mt-3">
        <Link
          href={href}
          scroll={false}
          aria-label={issueTitle(issue.title)}
          // In a box as the shop covers' (ShopCover): square, the cover
          // centred in it in its own proportions
          className={cn(COVER_BOX, "w-full hover:opacity-90")}
        >
          {issue.cover?.asset && (
            <Image
              src={urlFor(issue.cover).width(1600).url()}
              alt={issue.cover.alt ?? issueTitle(issue.title)}
              width={1600}
              height={2200}
              sizes="(min-width: 1024px) 33vw, 100vw"
              className={cn(
                COVER_IN_BOX,
                "max-w-full object-contain object-center",
              )}
            />
          )}
        </Link>
        {/* Below the box, as the shop covers' caption: the price, and
            "Lägg i korg" on the right (styled as the covers' price: text-2
            small capitals, the theme's colour, swashes, underlined on
            hover; adds the issue and opens the cart). "SLUTSÅLD" when sold
            out */}
        <div className="flex w-full items-baseline justify-between gap-x-12 mt-1 text-2 [font-variant-caps:all-small-caps]">
          <p>
            {soldOut
              ? t("soldOut")
              : issue.price != null
                ? `${issue.price} SEK`
                : null}
          </p>
          <div className="font-baskervilleNeoText tracking-wide text-primary [font-feature-settings:'swsh'_1]">
            {soldOut ? (
              <span className="italic uppercase tracking-wide">
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
                className="normal-case tracking-wide cursor-pointer underline-offset-4 hover:underline"
              >
                {t("addToCart")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col items-start gap-6 lg:col-start-3 lg:col-span-3 lg:row-start-1 mt-48",
          STICKY,
        )}
      >
        {/* The whole description */}
        {issue.description && (
          <div className="flex flex-col [&_p]:hyphens-auto [&_p]:text-1">
            <SanityPortableText value={issue.description} />
          </div>
        )}
      </div>
    </section>
  );
}
