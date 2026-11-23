import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ShopClient from "@/components/ShopClient";
import IntroCard from "@/components/IntroCard";
import JustifyLetters from "@/components/JustifyLetters";
import HeroSection from "@/components/HeroSection";
import HeroGrid from "@/components/HeroGrid";
import HeroLinks from "@/components/HeroLinks";
import LatestIssueSection from "@/components/LatestIssueSection";
import SubscribeSection from "@/components/SubscribeSection";
import LLTextCard from "@/components/LLTextCard";
import ColumnNumbers from "@/components/ColumnNumbers";
import Latest from "@/components/Latest";
import BottomNav from "@/components/BottomNav";

export const revalidate = 3600;

// The shop is the home page
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div className="relative flex flex-col mt-0  px-0 ">
      <HeroSection />

      <ShopClient />

      <BottomNav />
    </div>
  );
}
