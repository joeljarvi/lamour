import ColorTheme from "@/components/ColorTheme";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ShopClient from "@/components/ShopClient";
import Hero from "@/components/Hero";
import IntroCard from "@/components/IntroCard";
import JustifyLetters from "@/components/JustifyLetters";
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
  // The hero's background, Hero Media in Sanity, is off for now; to bring
  // it back: client.fetch<BackgroundMediaData>(backgroundMediaQuery,
  // { id: "heroMedia" }) and render BackgroundMedia in the hero

  return (
    <div className="theme-redwine relative flex flex-col mt-0  px-0 ">
      <ColorTheme name="redwine" />
      {/* The theme's light shade (secondary) at the top of the page,
          fading to transparent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 hidden top-0 h-[50vh] bg-linear-to-b from-secondary to-transparent"
      />
      <Hero />
      <ShopClient />

      <BottomNav />
    </div>
  );
}
