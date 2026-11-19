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
// then its title below, and "Läs nu" on hover
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
    <div className={`group flex flex-col gap-[24px] ${className ?? ""}`}>
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
            className="object-cover shadow"
          />
        )}
      </Link>

      {/* As a shop cover's: the title, then a row below it */}
      <div className="flex flex-col gap-0">
        <h3 className="pStyle">{title}</h3>
        {/* "Läs nu" at the right, revealed on hover (desktop; always
            shown on touch screens), linking to the article */}
        <div className="mt-[12px] flex items-baseline justify-end gap-6 pStyle normal-case">
          <Link
            href={`/articles/${article.slug.current}`}
            className="shrink-0 underline-offset-4 hover:underline focus-visible:opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-80"
          >
            {t("readNow")}
          </Link>
        </div>
      </div>
    </div>
  );
}
