import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ShopClient from "@/components/ShopClient";
import IntroCard from "@/components/IntroCard";
import JustifyLetters from "@/components/JustifyLetters";
import HeroSection from "@/components/HeroSection";
import LatestIssueSection from "@/components/LatestIssueSection";
import SubscribeSection from "@/components/SubscribeSection";

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
    <div className="flex flex-col mt-0  px-0 ">
      {/* HERO: the title and tagline, the about text and a subscribe
          button, then the latest issue */}

      {/* "L'AMOUR" fixed to the top and "LA MORT" to the bottom, each
          spread across the full width */}

      <ShopClient />
      <SubscribeSection />
    </div>
  );
}
