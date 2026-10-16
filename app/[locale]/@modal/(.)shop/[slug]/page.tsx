import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import IssueModal from "@/components/IssueModal";

// /shop/[slug] reached by a link inside the site: the issue opens as a modal
// over the current page. Opened directly (e.g. from Instagram) or reloaded,
// shop/[slug]/page.tsx renders it as a page instead
export default async function IssueModalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  return <IssueModal slug={slug} />;
}
