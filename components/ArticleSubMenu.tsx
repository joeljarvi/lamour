"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { articleTitle } from "@/lib/articleTitle";

function ArticleRow({ article }: { article: Article }) {
  return (
    <Button
      variant="link"
      size="lg"
      className=" leading-loose px-20    font-baskervilleNeoDisplay "
      asChild
    >
      <Link href={`/articles/${article.slug.current}`}>
        <span className="min-w-0 truncate">{articleTitle(article.title)}</span>
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
            <div key={s._id} className="flex flex-col w-full ">
              <Button
                variant="link"
                size="lg"
                className="font-baskervilleNeoDisplay  pl-12 pr-6 aria-expanded:pl-18"
                aria-expanded={isOpen}
                onClick={() => setOpenSeries(isOpen ? null : s._id)}
              >
                <span className="min-w-0 truncate">{s.title}</span>
              </Button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="flex flex-col  w-full overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {seriesArticles.map((article) => (
                      <ArticleRow key={article._id} article={article} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
