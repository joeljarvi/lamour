"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { useNextInSeries } from "@/lib/contexts/ArticlesContext";

// The article reader's fixed bottom bar: at the end of the article, bottom
// centre, "Nästa artikel" (the next in the article's series) or, when
// there's none, "Till toppen". Transparent, letting clicks through to the
// page; its button still catches them
export default function ArticleBottomBar({
  slug,
  percent,
}: {
  // The article being read
  slug: string;
  // Reading progress (the progress bar is hidden for now)
  percent: number;
}) {
  const t = useTranslations("Article");
  const next = useNextInSeries(slug);
  // At the end of the article: its text read to the bottom
  const atEnd = percent >= 100;

  return (
    <footer className="fixed bottom-0 inset-x-0 z-20 grid grid-cols-3 items-center gap-6 h-16 lg:h-12 px-3 bg-transparent pointer-events-none">
      {/* Middle column (the outer two empty) */}
      <span aria-hidden />
      {atEnd && next ? (
        <Button
          variant="link"
          size="xs"
          className="justify-self-center pointer-events-auto w-auto text-foreground after:content-none"
          asChild
        >
          <Link href={`/articles/${next.slug.current}`}>
            ( {t("nextArticle")} )
          </Link>
        </Button>
      ) : atEnd ? (
        <Button
          variant="link"
          size="xs"
          className="justify-self-center pointer-events-auto w-auto text-foreground after:content-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ( {t("backToTop")} )
        </Button>
      ) : (
        <span aria-hidden />
      )}
      <span aria-hidden />
      {/* Progress bar: the fill grows with the reading percentage. Hidden
          for now */}
      <div
        aria-hidden
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="hidden"
      >
        <span style={{ width: `${percent}%` }} />
        <span>{percent}%</span>
      </div>
    </footer>
  );
}
