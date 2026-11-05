"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { articleTitle } from "@/lib/articleTitle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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

// Square grid card for an article, linking to it: the series at the top
// centre, the title (wrapping onto more lines when long), and at the bottom
// centre the author (desktop), swapping to "( läs nu )" on hover — on
// mobile "( läs nu )" always. With a label, the author and then the series
// sit below the title instead. `className` overrides the tile's own (e.g. full width instead
// of square, for the latest article); `label` shows above the title
export default function ArticleTile({
  article,
  className,
  label,
  noHover = false,
}: {
  article: Article;
  // Position in the articles list (unused by the tile now that it has no
  // colour of its own)
  index: number;
  className?: string;
  label?: string;
  // No hover effect (otherwise the tile turns light grey)
  noHover?: boolean;
}) {
  const tArticle = useTranslations("Article");
  return (
    // A box (not a link): "( läs nu )" is the link, stretched over the
    // whole tile (before:absolute inset-0), so a click anywhere opens the
    // article
    <Button
      variant="link"
      size="xs"
      // h-auto lg:h-auto: the xs size's fixed heights (h-6 lg:h-9) would
      // cut the tile short of its content; whitespace-normal so its text
      // wraps
      className={cn(
        "group relative w-full justify-center flex flex-col items-center gap-0 h-auto lg:h-auto whitespace-normal p-6 lg:p-12 text-foreground transition-all  after:content-none ",
        // The page's background, light grey on hover
        "bg-background",
        !noHover && "hover:bg-neutral-100",
        className,
      )}
      asChild
    >
      <div>
        {/* The series, top centre (nothing for an article outside a
            series; with a label it's in the centre instead) */}
        {!label && article.series && (
          <span className="max-w-full truncate leading-normal opacity-60 text-center">
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
          <span className="w-full text-center leading-loose whitespace-normal break-words mb-12 text-base lg:text-2xl font-baskervilleNeoText lg:font-baskervilleNeoDisplay max-w-2xl">
            {articleTitle(article.title)}
          </span>
          {/* With a label (the latest article): on mobile too */}
          {label && article.author && (
            <span className="block leading-normal ">{article.author.name}</span>
          )}
          {/* …and its series below the author */}
          {label && article.series && (
            <span className="block max-w-full truncate leading-normal opacity-60">
              {article.series.title}
            </span>
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
        {/* Bottom centre, in one spot (a one-cell grid): on desktop the
            author, swapping to "( läs nu )" on hover (or keyboard focus);
            on mobile, and on a tile without hover (the latest article,
            whose author is below its title), "( läs nu )" always. Läs nu
            is the link, stretched over the whole tile (so the tile stays
            clickable while its text is hidden) */}
        <div className="mt-auto grid w-full place-items-center">
          {!label && article.author && (
            <span
              className={cn(
                "col-start-1 row-start-1 hidden lg:block leading-normal opacity-60 text-center transition-opacity duration-300",
                !noHover &&
                  "lg:group-hover:opacity-0 lg:group-has-[:focus-visible]:opacity-0",
              )}
            >
              {article.author.name}
            </span>
          )}
          <Link
            href={`/articles/${article.slug.current}`}
            className={cn(
              "col-start-1 row-start-1 px-3 h2Style before:absolute before:inset-0 transition-opacity duration-300",
              !noHover &&
                "lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100",
            )}
          >
            ( {tArticle("readNow")} )
          </Link>
        </div>
      </div>
    </Button>
  );
}
