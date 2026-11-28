"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/lib/contexts/ArticlesContext";
import { urlFor } from "@/lib/sanity/image";
import { articleTitle } from "@/lib/articleTitle";
import { cn } from "@/lib/utils";
import { tileColor } from "./ArticleTile";
import Ticker from "./Ticker";
import {
  BOX_LOOK,
  CAPTION_LOOK,
  COVER_BOX,
  IMAGE_LOOK,
  type CoverView,
} from "./ShopCover";

// One article in the articles grid, as a shop cover (ShopCover): its cover
// image in the box the view gives it (1 the tile's width at its own
// height; 2 a square; 3 a 3:4 box), the article's colour in its place when
// it has no image; linking to the article. Below it, as the shop's
// caption: the title (a ticker if too long) and "Läs nu"
export default function ArticleCover({
  article,
  index,
  view = 1,
  className,
}: {
  article: Article;
  // Position in the articles list, picking the colour of an article
  // without a cover image
  index: number;
  view?: CoverView;
  className?: string;
}) {
  const t = useTranslations("Article");
  const title = articleTitle(article.title);
  const href = `/articles/${article.slug.current}`;
  return (
    <div className={cn("group flex flex-col gap-3 lg:gap-0 w-auto", className)}>
      <Link
        href={href}
        aria-label={title}
        className={cn(
          COVER_BOX,
          "w-full overflow-visible hover:opacity-90",
          BOX_LOOK[view],
        )}
      >
        <CoverImage
          image={article.coverImage}
          alt={article.coverImage?.alt ?? title}
          color={tileColor(index, article.color)}
          view={view}
        />
      </Link>
      <CoverCaption view={view} title={title}>
        <Link
          href={href}
          className="normal-case tracking-wide underline-offset-4 hover:underline"
        >
          {t("readNow")}
        </Link>
      </CoverCaption>
    </div>
  );
}

// A cover's image, sized by the view (IMAGE_LOOK) with a drop shadow; a
// block of colour in its place without one (3:4 in view 1, filling the
// box otherwise)
export function CoverImage({
  image,
  alt,
  color,
  view,
}: {
  image?: { asset?: unknown; alt?: string } | null;
  alt: string;
  color: string;
  view: CoverView;
}) {
  if (!image?.asset)
    return (
      <span
        aria-hidden
        className={cn(
          "block w-full",
          view === 1 ? "aspect-3/4" : "h-full",
          color,
        )}
      />
    );
  return (
    <Image
      src={urlFor(image).width(1200).url()}
      alt={alt}
      width={1200}
      height={1600}
      sizes="(min-width: 1024px) 25vw, 50vw"
      className={cn(
        "block drop-shadow-[0_1px_3px_rgb(0_0_0/0.15)]",
        IMAGE_LOOK[view],
      )}
    />
  );
}

// A cover's caption, as the shop's: the title (text-2 small capitals, one
// line, a ticker if too long), then on the right, in the theme's colour
// (small capitals, swashes), `children` ("Läs nu", "Serie · 3 artiklar")
export function CoverCaption({
  view,
  title,
  children,
}: {
  view: CoverView;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-start items-start gap-0 text-foreground",
        CAPTION_LOOK(view),
      )}
    >
      <div className="flex w-full min-w-0 items-baseline gap-x-3">
        <h3 className="min-w-0 flex-1 text-left">
          <Ticker
            text={title}
            align="left"
            className="font-baskervilleNeoText text-2 tracking-normal [font-variant-caps:all-small-caps]"
          />
        </h3>
        <div className="ml-9 shrink-0 font-baskervilleNeoText text-2 tracking-wide text-primary [font-variant-caps:all-small-caps] [font-feature-settings:'swsh'_1]">
          {children}
        </div>
      </div>
    </div>
  );
}
