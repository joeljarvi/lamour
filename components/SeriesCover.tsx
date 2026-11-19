"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Series } from "@/lib/contexts/ArticlesContext";
import { urlFor } from "@/lib/sanity/image";
import { tileColor } from "./ArticleTile";

// A series in the articles grid, looking like an article's cover: the
// series' cover image in the same 3:4 box (a colour when it has none),
// then its title and, on hover, "Serie · 3 artiklar". A click on the cover
// shows its articles in the grid instead (the series chosen)
export default function SeriesCover({
  series,
  count,
  index,
  onOpen,
  className,
}: {
  series: Series;
  // How many of its articles are shown
  count: number;
  // Picks the colour when it has no cover image
  index: number;
  onOpen: () => void;
  className?: string;
}) {
  const t = useTranslations("Article");
  return (
    <div className={`group flex flex-col gap-[24px] ${className ?? ""}`}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={series.title}
        className={`relative block aspect-[3/4] w-full cursor-pointer overflow-hidden transition-opacity hover:opacity-90 ${series.coverImage?.asset ? "" : tileColor(index)}`}
      >
        {series.coverImage?.asset && (
          <Image
            src={urlFor(series.coverImage).width(1200).url()}
            alt={series.coverImage.alt ?? series.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover shadow"
          />
        )}
      </button>

      <div className="flex flex-col gap-0">
        <h3 className="pStyle">{series.title}</h3>
        {/* "Serie · 3 artiklar", revealed on hover (desktop; always
            shown on touch screens) */}
        <p className="pStyle mt-[12px] normal-case tracking-wide transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-80">
          {t("seriesCount", { count })}
        </p>
      </div>
    </div>
  );
}
