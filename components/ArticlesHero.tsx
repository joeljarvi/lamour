import { getTranslations } from "next-intl/server";
import { client } from "@/lib/sanity/client";
import { backgroundMediaQuery } from "@/lib/sanity/queries";
import BackgroundMedia, { type BackgroundMediaData } from "./BackgroundMedia";

// The articles page's first screen, like the home page hero: "Artiklar",
// white, in the middle, over the image or video picked in Sanity's
// Articles Hero Media (empty until one is picked)
export default async function ArticlesHero() {
  const [media, t] = await Promise.all([
    client.fetch<BackgroundMediaData>(backgroundMediaQuery, {
      id: "articlesHeroMedia",
    }),
    getTranslations("Nav"),
  ]);

  return (
    <section
      id="hero"
      className="relative h-dvh w-full overflow-hidden bg-foreground"
    >
      <BackgroundMedia media={media} priority />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <h1 className="max-w-full px-6 lg:px-0 lg:max-w-5xl text-center font-baskervilleNeoDisplay text-2xl leading-tight text-white lg:text-6xl">
          {t("articles")}
        </h1>
      </div>
    </section>
  );
}
