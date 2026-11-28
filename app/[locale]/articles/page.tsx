import ColorTheme from "@/components/ColorTheme";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ArticlesPageClient from "@/components/ArticlesPageClient";
import Hero from "@/components/Hero";

export const revalidate = 3600;

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <section className="theme-blue relative flex flex-col w-full  ">
      <ColorTheme name="blue" />
      <Hero />
      <ArticlesPageClient />
    </section>
  );
}
