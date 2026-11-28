"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import { useCart } from "@/lib/contexts/CartContext";
import { urlFor } from "@/lib/sanity/image";
import { issueTitle } from "@/lib/issueTitle";
import { articleTitle } from "@/lib/articleTitle";
import { tileColor } from "./ArticleTile";

// The box both versions share: 697px wide on desktop, borders at the sides
// and bottom; inside, the label ("Senaste numret:" / "Senaste artikeln:"),
// the image (a link), then the details below
const BOX =
  "w-full lg:w-[697px] flex flex-col border-x border-b border-neutral-200 font-baskervilleNeoText";
const LABEL =
  "uppercase tracking-[12px] h-[24px] leading-none flex items-center justify-center text-[12px]";
const IMAGE =
  "block w-full h-[216px] max-w-full object-contain object-left-top transition-opacity group-hover:opacity-90";
const DETAILS =
  "flex flex-col items-start pStyle text-foreground";
// The link at the bottom of each box ("Till affären" / "Till artiklar"),
// below the rest, 48px down
const BOTTOM_LINK =
  "pt-[48px] h-auto pStyle text-foreground underline underline-offset-4 decoration-1 hover:opacity-60";
const ACTION =
  "mt-[24px] cursor-pointer h-[48px] underline underline-offset-4 decoration-1 hover:opacity-60 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40";

// The latest issue or article (both lists come newest first), in a box on
// the line grid. "issue": its cover (a link to the issue, which opens as a
// modal), then its number and title, price and "Lägg i korg" (adds it to
// the cart and opens it; "Slutsåld", disabled, when sold out). "article":
// its cover image (its colour when it has none), then its title, author
// and "Läs nu". Not one link around it all: a button can't sit in a link.
// `className` places it (e.g. the issue's lg:ml-[24px])
export default function Latest({
  kind = "issue",
  className = "",
}: {
  kind?: "issue" | "article";
  className?: string;
}) {
  return kind === "article" ? (
    <LatestArticleBox className={className} />
  ) : (
    <LatestIssueBox className={className} />
  );
}

function LatestIssueBox({ className }: { className: string }) {
  const t = useTranslations("Issue");
  const tNav = useTranslations("Nav");
  const { addToCart, setDrawerOpen } = useCart();
  const latest = useIssues()[0];
  if (!latest) return null;
  const title = `#${latest.issueNumber} — ${issueTitle(latest.title)}`;
  const href = `/shop/${latest.slug.current}`;
  const soldOut = latest.inStock === false;

  return (
    <section className={`${BOX} ${className}`}>
      <div className="flex flex-col items-start p-[24px]">
        {/* The label, image and details, then the link below them */}
        <div className="flex flex-col items-start justify-start">
          <Link
            href={href}
            scroll={false}
            aria-label={title}
            className="group flex flex-col"
          >
            <span className={LABEL}>{tNav("latestIssue")}:</span>
            {latest.cover?.asset && (
              <Image
                src={urlFor(latest.cover).height(576).url()}
                alt={latest.cover.alt ?? issueTitle(latest.title)}
                width={432}
                height={576}
                sizes="216px"
                className={IMAGE}
              />
            )}
          </Link>

          <div className={DETAILS}>
            <Link
              href={href}
              scroll={false}
              className=" underline-offset-4 decoration-1 hover:underline"
            >
              {title}
            </Link>
            {/* The issue's price (when set in Sanity) */}
            {latest.price != null && <span>{latest.price} SEK</span>}
            <button
              type="button"
              disabled={soldOut}
              onClick={() => {
                addToCart({
                  id: latest._id,
                  title: latest.title,
                  price: latest.price != null ? `${latest.price} SEK` : "0",
                });
                setDrawerOpen(true);
              }}
              className={ACTION}
            >
              {soldOut ? t("soldOut") : t("addToCart")}
            </button>
          </div>
        </div>
        {/* At the bottom: to the shop (the home page) */}
        <Link href="/" className={BOTTOM_LINK}>
          {tNav("toShop")}
        </Link>
      </div>
    </section>
  );
}

function LatestArticleBox({ className }: { className: string }) {
  const tNav = useTranslations("Nav");
  const tArticle = useTranslations("Article");
  const { articles } = useArticles();
  const latest = articles[0];
  if (!latest) return null;
  const title = articleTitle(latest.title);
  const href = `/articles/${latest.slug.current}`;

  return (
    <section className={`${BOX} ${className}`}>
      <div className="flex flex-col items-start p-[24px]">
        {/* The label, image and details, then the link below them */}
        <div className="flex flex-col items-start">
          <Link
            href={href}
            aria-label={title}
            className="group flex flex-col w-full"
          >
            <span className={LABEL}>{tNav("latestArticle")}:</span>
            {latest.coverImage?.asset ? (
              <Image
                src={urlFor(latest.coverImage).height(576).url()}
                alt={latest.coverImage.alt ?? title}
                width={432}
                height={576}
                sizes="216px"
                className={IMAGE}
              />
            ) : (
              // No cover image: the article's colour, the same size
              <span
                aria-hidden
                className={`block h-[216px] w-[162px] ${tileColor(0, latest.color)}`}
              />
            )}
          </Link>

          <div className={DETAILS}>
            <Link
              href={href}
              className="mt-[24px] underline-offset-4 decoration-1 hover:underline"
            >
              {title}
            </Link>
            {latest.author && <span>{latest.author.name}</span>}
            <Link href={href} className={ACTION}>
              {tArticle("readNow")}
            </Link>
          </div>
        </div>
        {/* At the bottom: to the articles */}
        <Link href="/articles" className={BOTTOM_LINK}>
          {tNav("toArticles")}
        </Link>
      </div>
    </section>
  );
}
