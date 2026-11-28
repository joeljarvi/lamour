"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Series } from "@/lib/contexts/ArticlesContext";
import { cn } from "@/lib/utils";
import { tileColor } from "./ArticleTile";
import { CoverCaption, CoverImage } from "./ArticleCover";
import { BOX_LOOK, COVER_BOX, type CoverView } from "./ShopCover";

// A series in the articles grid, looking like an article's cover
// (ArticleCover): its cover image in the view's box (a colour when it has
// none), then its title and "Serie · 3 artiklar". The cover links to the
// series' page (/articles/series/[slug])
export default function SeriesCover({
  series,
  count,
  index,
  view = 1,
  className,
}: {
  series: Series;
  // How many of its articles are shown
  count: number;
  // Picks the colour when it has no cover image
  index: number;
  view?: CoverView;
  className?: string;
}) {
  const t = useTranslations("Article");
  return (
    <div className={cn("group flex flex-col gap-3 lg:gap-0 w-auto", className)}>
      <Link
        href={`/articles/series/${series.slug.current}`}
        aria-label={series.title}
        className={cn(
          COVER_BOX,
          "w-full cursor-pointer overflow-visible hover:opacity-90",
          BOX_LOOK[view],
        )}
      >
        <CoverImage
          image={series.coverImage}
          alt={series.coverImage?.alt ?? series.title}
          color={tileColor(index)}
          view={view}
        />
      </Link>
      <CoverCaption view={view} title={series.title}>
        {t("seriesCount", { count })}
      </CoverCaption>
    </div>
  );
}
