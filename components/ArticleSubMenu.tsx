"use client";

import { useState } from "react";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { articleTitle } from "@/lib/articleTitle";

// Same 3-column row as IssuesSubMenu: meta | title | the link variant's ☜ (::after)
const rowClass =
  "grid grid-cols-3 items-center leading-loose px-4 font-baskervilleNeoDisplay normal-case w-full justify-start after:justify-self-end aria-expanded:border-b-transparent aria-expanded:pt-4";

// Opens the article in ArticleReader (/articles/[slug])
function ArticleRow({ article }: { article: Article }) {
  return (
    <Button variant="link" size="lg" className={rowClass} asChild>
      <Link href={`/articles/${article.slug.current}`}>
        <span className="justify-self-start">{article.author?.name}</span>
        <span className="justify-self-start text-left">
          {articleTitle(article.title)}
        </span>
      </Link>
    </Button>
  );
}

export default function ArticleSubMenu() {
  const { articles, series } = useArticles();
  const [openSeries, setOpenSeries] = useState<string | null>(null);

  // Series that have articles, each with its articles; then the rest
  const seriesGroups = series
    .map((s) => ({
      series: s,
      articles: articles.filter(
        (a) => a.series?.slug.current === s.slug.current,
      ),
    }))
    .filter((g) => g.articles.length > 0);
  const standalone = articles.filter((a) => !a.series);

  return (
    <div className="flex flex-col items-start justify-start whitespace-normal w-full border-b border-b-foreground">
      <div className="flex flex-col w-full">
        {seriesGroups.map(({ series: s, articles: seriesArticles }) => {
          const isOpen = openSeries === s._id;
          return (
            <div key={s._id} className="flex flex-col w-full">
              <Button
                variant="link"
                size="lg"
                className={rowClass}
                aria-expanded={isOpen}
                onClick={() => setOpenSeries(isOpen ? null : s._id)}
              >
                <span className="justify-self-start">
                  ({seriesArticles.length})
                </span>
                <span className="justify-self-start text-left">
                  {s.title}
                </span>
              </Button>
              {isOpen &&
                seriesArticles.map((article) => (
                  <ArticleRow key={article._id} article={article} />
                ))}
            </div>
          );
        })}

        {standalone.map((article) => (
          <ArticleRow key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
}
