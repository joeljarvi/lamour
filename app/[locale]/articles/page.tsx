import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ArticlesPageClient from "@/components/ArticlesPageClient";

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <section className="flex flex-col w-full mt-24 ">
      <ArticlesPageClient />
    </section>
  );
}
