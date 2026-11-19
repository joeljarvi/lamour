import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

// The shop (Affären) is the home page: /shop leads there
export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/", locale: locale as Locale });
}
