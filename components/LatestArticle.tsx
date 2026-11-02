"use client";

import { useTranslations } from "next-intl";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/lib/sanity/image";
import ArticleTile from "./ArticleTile";

// The latest article (articles come newest first): on desktop its cover on
// the left half and its tile on the right, a screen tall; on mobile the
// tile alone (full width, instead of square). The tile has "Senaste
// artikeln" above the title and the author below it, and no hover effect.
// Nothing if there's no article yet
export default function LatestArticle() {
  const t = useTranslations("Article");
  const latest = useArticles().articles[0];
  if (!latest) return null;

  return (
    // Desktop: two columns, the cover on the left (filling it, linking to
    // the article) and the tile on the right. Mobile: the tile alone
    <div className="lg:grid lg:grid-cols-2">
      {latest.coverImage?.asset && (
        <Link
          href={`/articles/${latest.slug.current}`}
          aria-hidden
          tabIndex={-1}
          className="relative hidden lg:block h-dvh"
        >
          <Image
            src={urlFor(latest.coverImage).width(1600).url()}
            alt=""
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
        </Link>
      )}
      <ArticleTile
        article={latest}
        index={0}
        label={t("latest")}
        noHover
        className={`aspect-auto lg:aspect-auto h-[calc(100dvh-4rem)] lg:h-dvh ${latest.coverImage?.asset ? "" : "lg:col-span-2"}`}
      />
    </div>
  );
}
