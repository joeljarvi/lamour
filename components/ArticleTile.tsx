"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useQueue } from "@/lib/contexts/QueueContext";

// Tile background colours by name, with light text on the dark one (full
// class names, so Tailwind generates them). The names are the choices of
// the article's Color field in Sanity
const TILE_COLORS = {
  red: "bg-red-600",
  purple: "bg-purple-950 text-background",
  green: "bg-green-300",
  yellow: "bg-yellow-50",
  pink: "bg-pink-300",
} as const;
const CYCLE = Object.values(TILE_COLORS);

// An article's colour: the one chosen in Sanity, or else, by its `index`
// in the articles list, the next in turn (the latest article first, then
// the grid). Also used by the article reader's top bar, hero and footer, so
// they match the article's tile
export function tileColor(index: number, color?: string) {
  return (
    TILE_COLORS[color as keyof typeof TILE_COLORS] ??
    CYCLE[index % CYCLE.length]
  );
}

// The colour of the tile of the article with this slug, by its position in
// the articles list (newest first, as on the articles page), for the
// article reader's top bar and footer; null if it isn't in the list
export function useArticleColor(slug: string) {
  const { articles } = useArticles();
  const index = articles.findIndex((a) => a.slug.current === slug);
  return index >= 0 ? tileColor(index, articles[index].color) : null;
}

// Square grid card for an article, linking to it: the author at the top
// centre (desktop only), the title (wrapping onto more lines when long),
// then "( läs nu )" and "( lägg i kön )" at the bottom. With a label, the
// author moves below the title. `className` overrides the
// tile's own (e.g. full width instead of square, for the latest article);
// `label` shows above the title
export default function ArticleTile({
  article,
  index,
  className,
  label,
  noHover = false,
}: {
  article: Article;
  // Position in the articles list, picking the tile's colour when the
  // article has none chosen in Sanity
  index: number;
  className?: string;
  label?: string;
  // No hover effect (otherwise the tile turns dark with light text)
  noHover?: boolean;
}) {
  const tArticle = useTranslations("Article");
  const { isQueued, toggleQueued } = useQueue();
  const queued = isQueued(article._id);

  return (
    // A box (not a link): "( läs nu )" is the link, stretched over the
    // whole tile (before:absolute inset-0), so a click anywhere opens the
    // article, and "( lägg i kön )" can be a button above it (a button
    // can't sit inside a link)
    <Button
      variant="link"
      size="xs"
      className={cn(
        "relative w-full justify-center flex flex-col items-center gap-0  h-auto lg:h-auto aspect-square p-6 lg:p-12 text-foreground transition-all  after:content-none ",
        !noHover && "hover:bg-foreground hover:text-background",
        tileColor(index, article.color),
        className,
      )}
      asChild
    >
      <div>
        {/* Author, top centre, desktop only (with a label, below the title
            instead, on every screen) */}
        {!label && article.author && (
          <span className="hidden lg:block leading-normal opacity-60 text-center">
            {article.author.name}
          </span>
        )}
        {/* Mobile: the series, top centre (nothing for an article outside
            a series) */}
        {article.series && (
          <span className="lg:hidden max-w-full truncate leading-normal opacity-60 text-center">
            {article.series.title}
          </span>
        )}
        {/* Title, centred in the space the bottom buttons leave (flex-1) */}
        <span className="flex flex-1 min-w-0 flex-col items-center justify-center gap-1 w-full">
          {label && (
            <span className="h2Style mb-12 tracking-[48%]">{label}</span>
          )}
          {/* Title, wrapping (the button doesn't); a normal line height,
              as the button's leading-[1] would crowd the rings and dots of
              Å, Ä and Ö above the capitals */}
          <span className="w-full text-center leading-loose whitespace-normal break-words mb-12 text-base lg:text-2xl truncate font-baskervilleNeoText lg:font-baskervilleNeoDisplay max-w-2xl ">
            {articleTitle(article.title)}
          </span>
          {/* With a label (the latest article): on mobile too */}
          {label && article.author && (
            <span className="block leading-normal ">{article.author.name}</span>
          )}
        </span>
        {/* Author, then "Del av <series>" for an article in a series,
          12px apart and as wide as the row allows: the author in full,
          the series cut off if it doesn't fit */}
        <span className="self-center flex max-w-full min-w-0 gap-3 text-neutral-600 mb-3 hidden">
          {article.author && (
            <span className="shrink-0 leading-normal">
              {article.author.name}
            </span>
          )}
          {article.series && (
            <span className="min-w-0 truncate leading-normal">
              {tArticle("partOf", { series: article.series.title })}
            </span>
          )}
        </span>
        {/* "( läs nu )" and "( lägg i kön )" along the bottom. Lägg i kön
            adds the article to the reading queue ("( i kö )" once it's
            there; clicking again takes it out), above the stretched link
            (relative z-10) */}
        <div className="mt-auto flex items-baseline w-full justify-between">
          <Link
            href={`/articles/${article.slug.current}`}
            className="px-3 h2Style before:absolute before:inset-0"
          >
            ( {tArticle("readNow")} )
          </Link>
          <button
            type="button"
            aria-pressed={queued}
            className="relative z-10 px-3 h2Style cursor-pointer hover:opacity-60 transition-opacity"
            onClick={() => toggleQueued(article._id)}
          >
            ( {queued ? tArticle("inQueue") : tArticle("readLater")} )
          </button>
        </div>
      </div>
    </Button>
  );
}
