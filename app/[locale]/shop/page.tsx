import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ShopClient from "@/components/ShopClient";

export const revalidate = 3600;

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <section className="flex flex-col w-full">
      <ShopClient />
    </section>
  );
}
