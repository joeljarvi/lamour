import { client } from "@/lib/sanity/client";
import { backgroundMediaQuery, heroTextsQuery } from "@/lib/sanity/queries";
import type { BackgroundMediaData } from "./BackgroundMedia";
import HeroNav from "./HeroNav";
import { toRichText, type RichText } from "./HeroRichText";

// The pages with a hero
export type HeroPage = "home" | "shop" | "articles" | "about" | "subscribe";

export const ABOUT_TEXT =
  "Sedan 2017 har vi samlat ung litteratur under ett skevt konsthistoriskt paraply och publicerat över hundra författare och konstnärer i början, mitten, och slutet av sina karriärer. Målet? Att ge skimret av ett samlad förtrupp. Att historisera allt nu. En tids skrift av text och bild.";

// Each page's text when Hero Texts in Sanity has none for it
export const FALLBACK_TEXTS: Record<HeroPage, string> = {
  home: ABOUT_TEXT,
  shop: "Handla alla våra nummer idag. Gåvor, symboler",
  articles:
    "Läs utvalda texter från tidigare nummer. Ibland exklusiva för hemsidan",
  about: ABOUT_TEXT,
  subscribe: "Ja tack, prenumerera gärna",
};

// A page's first screen, the same on every page with one (the home page,
// the articles, about us, subscribe): the screen tall, the page's text
// (rich text from Hero Texts in Sanity, or the built-in text) centred,
// justified, with a large initial (HeroNav)
export default async function HeroSection({
  page = "home",
}: {
  page?: HeroPage;
}) {
  // Straight from Sanity, not its CDN (which kept serving an old, empty
  // answer after Hero Texts was published); the page itself is cached for
  // an hour (revalidate), so this runs rarely
  const home = page === "home";
  // The image above the text: on the subscribe page, Subscribe Media's
  // (image, or its video's poster)
  const mediaId =
    page === "subscribe" ? "subscribeMedia" : home ? "heroMedia" : null;
  const [texts, media] = await Promise.all([
    client
      .withConfig({ useCdn: false })
      .fetch<Partial<
        Record<HeroPage, RichText | string>
      > | null>(heroTextsQuery),
    mediaId
      ? client.fetch<BackgroundMediaData>(backgroundMediaQuery, {
          id: mediaId,
        })
      : null,
  ]);
  const image =
    media?.mediaType === "video" ? media.poster : (media?.image ?? null);
  // Rich text from Hero Texts, or the built-in text
  const text = toRichText(texts?.[page], FALLBACK_TEXTS[page]);

  return (
    <section
      id={page === "home" ? "home-hero" : undefined}
      // 24 rows of 24px tall (576px, on the line-number grid), a border on
      // every side; on desktop its side borders exactly on ColumnNumbers'
      // dark lines after columns 15 and 45. Those are drawn inside their
      // cells' right edges (pixels 359–360 and 1079–1080), and this box's
      // border inside its own edges, so it starts at 359px and is 721px
      // wide; its content in one column, centred in it (HeroNav)
      className="relative w-full overflow-hidden bg-background  mt-[25vh]  lg:mt-[144px] px-6 lg:p-[24px] "
    >
      <HeroNav
        text={text}
        // Shown above the text on the subscribe page only (the home
        // page's Hero Media image isn't shown for now)
        image={page === "subscribe" ? image : null}
      />
    </section>
  );
}
