"use client";

import { useTranslations } from "next-intl";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import ArticleTile from "./ArticleTile";

// The latest article (articles come newest first) as an article tile: full
// width and a screen tall (instead of square), with "Senaste artikeln"
// above the title and the author below it. Nothing if there's no article
// yet
export default function LatestArticle() {
  const t = useTranslations("Article");
  const latest = useArticles().articles[0];
  if (!latest) return null;

  return (
    <ArticleTile
      article={latest}
      index={0}
      label={t("latest")}
      noHover
      className="aspect-auto lg:aspect-auto h-[calc(100dvh-4rem)] lg:h-dvh"
    />
  );
}
