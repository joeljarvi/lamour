import Image from "next/image";
import { groq } from "next-sanity";

import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { backgroundMediaQuery, heroTextsQuery } from "@/lib/sanity/queries";
import type { BackgroundMediaData } from "./BackgroundMedia";
import HeroNav from "./HeroNav";
import { toRichText, type RichText } from "./HeroRichText";

// The five latest issues' covers (newest first)
const latestIssuesQuery = groq`*[_type == "issue" && defined(cover.asset)] | order(issueNumber desc)[0...5] {
  _id,
  title,
  issueNumber,
  cover
}`;
type PileIssue = {
  _id: string;
  title: string;
  issueNumber: number;
  cover: { asset: { _ref: string }; alt?: string };
};

// The pile: each cover a little further down / down-right than the one
// above it (px), the newest at [0, 0] on top. The covers are 256px minus
// the largest offset tall, so the whole pile is at most 256px
const PILE_OFFSETS: [number, number][] = [
  [0, 0],
  [2, 4],
  [5, 7],
  [6, 11],
  [9, 14],
];
const PILE_H = 320;
// The largest offsets: the room the pile takes right of and below the top
// cover
const PILE_DX = Math.max(...PILE_OFFSETS.map(([x]) => x));
const PILE_DY = Math.max(...PILE_OFFSETS.map(([, y]) => y));
const COVER_H = PILE_H - PILE_DY;

// The hero's links
const HERO_LINKS = [
  { label: "Börja handla", href: "/" },
  { label: "Prenumerera", href: "/subscribe" },
  { label: "Till Artiklar", href: "/articles" },
] as const;

// The pages with a hero
export type HeroPage = "home" | "shop" | "articles" | "about" | "subscribe";

// The about text lives in Hero (shown there too)
export { ABOUT_TEXT } from "./Hero";
import { ABOUT_TEXT } from "./Hero";

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
  const [texts, media, latest] = await Promise.all([
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
    client.fetch<PileIssue[]>(latestIssuesQuery).catch(() => []),
  ]);
  const image =
    media?.mediaType === "video" ? media.poster : (media?.image ?? null);
  // Rich text from Hero Texts, or the built-in text
  const text = toRichText(texts?.[page], FALLBACK_TEXTS[page]);

  return (
    // Brown at the top, fading to
    // transparent at the bottom
    // Mobile: two columns; the first the logo and "en tids skrift" (one
    // under the other) at the top and the links at the bottom, the second
    // the pile of covers. Desktop: all in one row, as before
    <section className="w-screen h-dvh lg:h-[75vh] grid grid-cols-2 grid-rows-[auto_1fr_auto] items-start gap-x-6 pStyle p-6 bg-background lg:flex lg:items-start">
      <div className="col-start-1 row-start-1 flex flex-col lg:flex-row lg:gap-x-6">
        {/* The logo, fixed where it starts (the hero's 24px padding) so it
            stays as the page scrolls; an invisible copy keeps its place */}
        <h1 className="fixed top-6 left-6 lg:h-12 h-auto px-0 flex items-center pStyle max-lg:text-[24px] max-lg:leading-[28px] z-50">
          L&apos;Amour—La Mort
        </h1>
        <span
          aria-hidden
          className="invisible h-12 px-0 flex items-center pStyle max-lg:text-[24px] max-lg:leading-[28px]"
        >
          L&apos;Amour—La Mort
        </span>
      </div>
      {/* The five latest issues as a pile of magazines, the newest on
          top: the newest in the flow (it sizes the pile), the older ones
          behind it, each a little further down and to the right */}
      {latest.length > 0 && (
        // Mobile: its column's full width, each cover as tall as that makes
        // it. Desktop: its height (--pile-h), the covers as wide as that
        // makes them (PILE_H, the 320px here, and PILE_DY, the 14px below)
        <div
          className="col-start-2 row-start-1 row-span-3 w-full lg:w-auto relative shrink-0 isolate mt-3 lg:[--pile-h:320px] lg:max-h-(--pile-h)"
          style={{
            paddingRight: PILE_DX,
            paddingBottom: PILE_DY,
          }}
        >
          {latest.map((issue, i) => (
            <Image
              key={issue._id}
              src={urlFor(issue.cover)
                .height(COVER_H * 2)
                .url()}
              alt={issue.cover.alt ?? issue.title}
              width={Math.round(COVER_H * 0.75)}
              height={COVER_H}
              priority={i === 0}
              className={`w-full h-auto lg:w-auto lg:h-[calc(var(--pile-h)-14px)] shadow-sm ${i === 0 ? "relative" : "absolute top-0 left-0 max-lg:w-[calc(100%-9px)]"}`}
              style={{
                zIndex: latest.length - i,
                transform: `translate(${PILE_OFFSETS[i][0]}px, ${PILE_OFFSETS[i][1]}px)`,
              }}
            />
          ))}
        </div>
      )}
      {/* Where to go next: links, in the text's style */}
      {/* Mobile: one under the other at the bottom of the first column
          (no slashes); desktop: in the row, slashes between */}
      <nav className="col-start-1 col-span-2 row-start-3 self-end flex gap-3  items-start lg:flex-row lg:items-center lg:self-auto lg:gap-x-6">
        {HERO_LINKS.map(({ label, href }, i) => (
          <span
            key={href}
            className="flex items-center gap-x-6 pStyle max-lg:text-[24px] max-lg:leading-[28px]"
          >
            {i > 0 && (
              <span aria-hidden className=" lg:inline">
                /
              </span>
            )}
            <Button
              variant="link"
              size="xs"
              className="h-12 lg:h-12 w-auto p-0 pStyle max-lg:text-[24px] max-lg:leading-[28px] normal-case flex items-center after:content-none underline-offset-4 decoration-1 justify-center hover:underline text-foreground"
              asChild
            >
              <Link href={href}>{label}</Link>
            </Button>
          </span>
        ))}
      </nav>
    </section>
  );
}
