import { getTranslations } from "next-intl/server";
import { client } from "@/lib/sanity/client";
import { backgroundMediaQuery } from "@/lib/sanity/queries";
import { Link } from "@/i18n/navigation";
import BackgroundMedia, { type BackgroundMediaData } from "./BackgroundMedia";
import { Button } from "./ui/button";

// Below the shop on the home page, in two columns (stacked on mobile): on
// the left the image or video from Sanity's Subscribe Media, filling the
// column; on the right "L'Amour — La Mort", a short text about the
// magazine and a link to the subscribe page (light text in a dark box)
export default async function SubscribeSection() {
  const [media, t] = await Promise.all([
    client.fetch<BackgroundMediaData>(backgroundMediaQuery, {
      id: "subscribeMedia",
    }),
    getTranslations("Nav"),
  ]);

  return (
    <section
      id="subscribe"
      data-section="subscribe"
      className=" w-full flex flex-col lg:min-h-dvh relative z-10  h-full items-start justify-start lg:border-x lg:border-x-neutral-200 lg:ml-[359px]  justify-center gap-6 px-3 lg:px-[24px] pt-[24px] pb-[24px]"
    >
      {/* The media, filling the column (a screen tall on desktop) */}
      <div className="relative h-[60dvh] lg:h-auto overflow-hidden">
        <BackgroundMedia media={media} />
      </div>

      <div className="flex flex-col items-start justify-center gap-12 px-6 py-24  lg:w-[721px] ">
        {/* TODO: placeholder about text — replace with the real one */}
        <p className="max-w-xl pStyle">
          {t("aboutText")}
        </p>
        <Button
          variant="link"
          // Italic with Baskerville Neo's swashes (set explicitly: the
          // .italic rule's swashes can lose to other font settings); light
          // text on its dark box
          className="w-auto font-baskervilleNeoText italic [font-feature-settings:'swsh'_1] text-sm h-9 bg-foreground px-6 normal-case tracking-wide text-background w-full max-w-xl"
          asChild
        >
          <Link href="/subscribe">{t("subscribeCta")}</Link>
        </Button>
      </div>
    </section>
  );
}
