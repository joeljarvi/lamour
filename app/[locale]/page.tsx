import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ShopClient from "@/components/ShopClient";
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
      {/* HERO SECTION  */}
      <section className="flex flex-col lg:flex-row items-center justify-center w-full h-auto lg:h-dvh">
        {/* Left panel, a column: the latest issue's credits and cover
            (taking the space the text leaves), then the text */}
        <div className="flex flex-col items-center justify-center lg:items-start lg:justify-start w-full lg:w-1/2 h-dvh lg:h-full min-w-0 bg-foreground px-6 gap-12 pb-6 pt-24">
          <LatestIssueCover />
          {/* Text below the cover, stacked; min-w-0 and break-words keep
              long words inside the panel, and the text is light on the dark
              panel */}
          <div className="flex w-full min-w-0 shrink-0 flex-col items-start gap-12 px-3 lg:px-12 py-6 lg:py-6 break-words text-background">
            <h2 className="h2Style max-w-full ">Nytt nummer</h2>
            <h2 className="h2Style max-w-full w-full flex items-center justify-center not-italic">
              <LatestIssueTitle />
            </h2>
            <h3 className="h2Style max-w-full w-full flex items-end justify-end">
              ( lägg i korg )
            </h3>
          </div>
        </div>
        <div className="flex flex-col items-center lg:items-start justify-between w-full h-dvh  lg:w-1/2 lg:h-full bg-pergament gap-12 pt-24 px-12 pb-12">
          {" "}
          <div className="flex flex-col gap-12 w-full">
            <h2 className="h2Style max-w-full not-italic text-center lg:text-left ">
              L'Amour — La Mort
            </h2>
            <h2 className="h2Style max-w-full w-full text-center ">
              en tids skrift
            </h2>
          </div>
          <div className="flex flex-col gap-12 w-full">
            <h2 className="h2Style max-w-full not-italic lg:text-left text-center ">
              Sluta röka
            </h2>
            <h2 className="h2Style max-w-full not-italic w-full text-center lg:text-left ">
              Börja festa
            </h2>
            <h2 className="h2Style max-w-full  w-full text-center lg:text-left  ">
              ( bli prenumerant )
            </h2>{" "}
          </div>
        </div>
      </section>
      <ShopClient />
    </div>
  );
}
