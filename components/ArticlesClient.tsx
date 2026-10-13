"use client";

import ArticleSubMenu from "./ArticleSubMenu";

export default function ArticlesClient() {
  return (
    // Same layout as ShopClient: article list spans all three columns
    <div className="grid grid-cols-1 lg:grid-cols-3 px-0 pt-36 pb-16 w-full">
      <div className="lg:col-span-3">
        <ArticleSubMenu />
      </div>
    </div>
  );
}
