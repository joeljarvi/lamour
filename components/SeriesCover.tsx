"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Series } from "@/lib/contexts/ArticlesContext";
import { urlFor } from "@/lib/sanity/image";
import { tileColor } from "./ArticleTile";

// A series in the articles grid, looking like an article's cover: the
// series' cover image in the same 3:4 box (a colour when it has none),
// then its title and "Serie · 3 artiklar". A click shows its articles in
// the grid instead (the series chosen); "Visa artiklar" on hover
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
    <div className={`group flex flex-col gap-3 ${className ?? ""}`}>
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

      <div className="flex flex-col gap-1">
        <h3 className="font-baskervilleNeoText uppercase tracking-wide leading-tight text-xs">
          {series.title}
        </h3>
        <p className="font-baskervilleNeoText normal-case tracking-wide text-sm text-neutral-700">
          {t("seriesCount", { count })}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="hidden lg:block self-start cursor-pointer font-baskervilleNeoText text-sm normal-case tracking-wide underline-offset-4 hover:underline transition-opacity duration-300 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-80"
      >
        {t("showArticles")}
      </button>
    </div>
  );
}
