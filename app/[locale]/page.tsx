import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import HomeClient from "@/components/HomeClient";
import Footer from "@/components/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <section className="flex flex-col w-full ">
      <HomeClient />
      <Footer />
    </section>
  );
}
