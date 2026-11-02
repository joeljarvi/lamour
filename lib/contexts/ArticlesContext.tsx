"use client";

import { createContext, useContext } from "react";

export type Article = {
  _id: string;
  title: string;
  slug: { current: string };
  author?: { name: string; slug: { current: string } };
  issue?: { title: string; issueNumber: number };
  series?: { title: string; slug: { current: string } };
  coverImage?: { asset: { _ref: string }; alt?: string };
  publishedAt?: string;
  bodyLength?: number;
  // The tile colour chosen in Sanity (red, purple, green, yellow, pink)
  color?: string;
};

export type Series = {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  aboutText?: string;
};

type ArticlesContextType = {
  articles: Article[];
  series: Series[];
};

const ArticlesContext = createContext<ArticlesContextType>({
  articles: [],
  series: [],
});

export function ArticlesProvider({
  articles,
  series,
  children,
}: ArticlesContextType & { children: React.ReactNode }) {
  return (
    <ArticlesContext.Provider value={{ articles, series }}>
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  return useContext(ArticlesContext);
}

// The next article in the series of the one with this slug: the first in
// the series published after it (the list is newest first); null if it's
// the last, or isn't in a series
export function useNextInSeries(currentSlug: string) {
  const { articles } = useArticles();
  const index = articles.findIndex((a) => a.slug.current === currentSlug);
  const seriesSlug = articles[index]?.series?.slug.current;
  if (!seriesSlug) return null;
  for (let i = index - 1; i >= 0; i--) {
    if (articles[i].series?.slug.current === seriesSlug) return articles[i];
  }
  return null;
}
