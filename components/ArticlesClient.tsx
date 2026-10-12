"use client";

import { useArticles } from "@/lib/contexts/ArticlesContext";
import { ArticleFront } from "./Covers";

export default function ArticlesClient() {
  const { articles } = useArticles();

  return (
    <div className="flex flex-col items-center gap-12 w-full px-4 pt-20 pb-16 lg:pt-24">
      {articles.map((article) => (
        <ArticleFront key={article._id} article={article} />
      ))}
    </div>
  );
}
