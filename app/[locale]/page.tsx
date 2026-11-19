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
      {/* Down the page's left edge, its full height, scrolling with it
          (absolute in this relative box; h-auto: top-0 + bottom-0 set
          the height) */}

      {/* Along the top of the page, the page's full width */}

      {/* HERO: the title and tagline, the about text and a subscribe
          button, then the latest issue */}

      {/* "L'AMOUR" fixed to the top and "LA MORT" to the bottom, each
          spread across the full width */}

      {/* "Om oss", in the middle of the screen on load */}
      <LLTextCard />
      {/* The hero (first version: logo, text and the nav links at the
          bottom); <HeroGrid /> and <HeroLinks /> are the other versions */}
      <HeroSection />
      {/* Hidden for now (class "hidden"; "flex flex-col lg:flex-row" to
          show them again): the latest issue and, next to it, the latest
          article (on desktop side by side, starting 359px in; stacked on
          mobile) */}
      <div className="hidden">
        <Latest kind="issue" className="lg:ml-[359px]" />
        <Latest kind="article" />
      </div>
      <ShopClient />
      {/* Back to the top, the articles, subscribe */}
      <BottomNav />
    </div>
  );
}
