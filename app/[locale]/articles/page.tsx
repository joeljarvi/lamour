import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ArticlesPageClient from "@/components/ArticlesPageClient";
import HeroSection from "@/components/HeroSection";

export const revalidate = 3600;

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <section className="relative flex flex-col w-full  ">
      {/* The hero (the articles' text from Hero Texts), then the grid */}
      <HeroSection page="articles" />
      <ArticlesPageClient />
    </section>
  );
}
