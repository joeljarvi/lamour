import ColorTheme from "@/components/ColorTheme";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import SeriesPageClient from "@/components/SeriesPageClient";

export const revalidate = 3600;

// A series: its hero (title and about text), then its articles
export default async function SeriesPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  return (
    <section className="theme-blue relative flex flex-col w-full">
      <ColorTheme name="blue" />
      <SeriesPageClient slug={slug} />
    </section>
  );
}
