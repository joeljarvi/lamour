import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ShopClient from "@/components/ShopClient";
import IntroCard from "@/components/IntroCard";
import LatestIssueCover from "@/components/LatestIssueCover";
import LatestIssueTitle from "@/components/LatestIssueTitle";

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
    <div className="flex flex-col mt-0  px-0 bg-background">
      {/* HERO: the logo card, folding away on scroll to reveal the about
          text and a subscribe button */}
      <IntroCard />
      <section className="flex flex-col  items-center justify-center w-full h-auto ">
        {/* LATEST ISSUE SECTION */}
        <div className="flex flex-col items-center justify-center  w-full  h-dvh  min-w-0 bg-background px-6 gap-12 pb-6 pt-24">
          <h2 className="h2Style  ">Nytt nummer</h2>

          <LatestIssueCover />

          <div className="flex w-full min-w-0 shrink-0 flex-col items-center gap-12 px-3 lg:px-12 py-6 lg:py-6 break-words ">
            <h2 className="h2Style  not-italic ">
              <LatestIssueTitle />
            </h2>
          </div>
        </div>
        {/* SUBSCriBE SECtiON */}
      </section>
      <ShopClient />
    </div>
  );
}
