"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/lib/contexts/ArticlesContext";
import { urlFor } from "@/lib/sanity/image";
import { articleTitle } from "@/lib/articleTitle";
import { tileColor } from "./ArticleTile";

// One article in the articles grid, like a shop cover: its cover image,
// every one the same height (a fixed 3:4 box, the image cropped to fill
// it; the article's colour when it has no image), linking to the article;
// then its title and author (and series) below, and "Läs nu" on hover
export default function ArticleCover({
  article,
  index,
  className,
}: {
  article: Article;
  // Position in the articles list, picking the colour of an article
  // without a cover image
  index: number;
  className?: string;
}) {
  const t = useTranslations("Article");
  const title = articleTitle(article.title);
  return (
    <div className={`group flex flex-col gap-3 ${className ?? ""}`}>
      <Link
        href={`/articles/${article.slug.current}`}
        aria-label={title}
        className={`relative block aspect-[3/4] w-full overflow-hidden transition-opacity hover:opacity-90 ${article.coverImage?.asset ? "" : tileColor(index, article.color)}`}
      >
        {article.coverImage?.asset && (
          <Image
            src={urlFor(article.coverImage).width(1200).url()}
            alt={article.coverImage.alt ?? title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover shadow  "
          />
        )}
      </Link>

      <div className="flex flex-col gap-1 font-baskervilleNeoText text-xs">
        <h3 className="font-baskervilleNeoText uppercase tracking-wide leading-tight text-xs">
          {title}
        </h3>
        {article.author && (
          <p className="normal-case tracking-wide text-sm text-neutral-700 font-baskervilleNeoText">
            {article.author.name}
            {article.series && `, ${article.series.title}`}
          </p>
        )}
      </div>

      {/* "Läs nu", revealed on hover (always shown on touch screens),
          like the shop covers' "Lägg i korg" */}
      <Link
        href={`/articles/${article.slug.current}`}
        className="self-start font-baskervilleNeoText text-sm normal-case tracking-wide underline-offset-4 hover:underline transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-80 focus-visible:opacity-100"
      >
        {t("readNow")}
      </Link>
    </div>
  );
}
