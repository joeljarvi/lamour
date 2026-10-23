import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ArticlesPageClient from "@/components/ArticlesPageClient";
import LatestArticle from "@/components/LatestArticle";
import ArticleBottomBar from "@/components/ArticleBottomBar";

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <section className="flex flex-col w-full mt-14 ">
      {/* The latest article, a full-width tile above the grid */}
      <LatestArticle />
      <ArticlesPageClient />
      {/* "Visa kö", once something is queued */}
      <ArticleBottomBar />
    </section>
  );
}
