import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { client } from "@/lib/sanity/client";
import { articleBySlugQuery } from "@/lib/sanity/queries";
import ArticleReader from "@/components/ArticleReader";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Article = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  author?: {
    name: string;
    slug: { current: string };
    image?: { asset: any; alt?: string };
    bio?: any[];
  };
  issue?: { title: string; issueNumber: number; slug: { current: string } };
  series?: { title: string; slug: { current: string }; coverImage?: { asset: any; alt?: string } };
  coverImage?: { asset: any; alt?: string };
  body?: any[];
  category?: string;
  publishedAt?: string;
};


export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  let article: Article | null = null;
  try {
    article = await client.fetch(articleBySlugQuery, { slug });
  } catch {
    // Sanity not yet configured
  }

  if (!article) notFound();

  return (
    <div className="">
      <ArticleReader
        title={article.title}
        subtitle={article.subtitle}
        body={article.body}
        author={article.author}
        issue={article.issue}
        coverImage={article.coverImage}
        category={article.category}
      />
    </div>
  );
}
