import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import EditorsSection from "@/components/EditorsSection";

export const revalidate = 3600;

// About us: its hero (the about text from Hero Texts), then the
// editorial team
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div className="relative flex flex-col">
      {/* The editorial team (the latest issue's editors) */}
      <EditorsSection />
    </div>
  );
}
