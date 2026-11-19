"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/lib/sanity/image";
import HeroRichText, { type RichText } from "./HeroRichText";

// A hero's content on a 12-column grid (one column on mobile): on the
// home page a small image (`image`, from Hero Media) in the middle of the
// screen, and the page's `text` at the bottom, both in columns 5–8. The
// text in pStyle, justified, its first letter a large initial (raised on
// the first line, not dropped)
export default function HeroNav({
  text,
  image,
  light = false,
}: {
  text: RichText;
  // All the text light (text-background), over a background image
  light?: boolean;
  // The image in the middle (the home page), if Hero Media has one
  image?: { asset?: unknown; alt?: string } | null;
}) {
  const t = useTranslations("Nav");

  return (
    <>
      {/* The hero's content in one column, centred in the hero's height (h-full + justify-center) */}
      <div
        data-section="intro"
        className={`relative z-10 flex h-full flex-col items-start justify-start pr-12 lg:pr-0  lg:mx-auto lg:w-full lg:max-w-xl   lg:gap-[48px] lg:pl-[0px] pt-[24px]  ${light ? "text-background" : "text-foreground"}`}
      >
        {/* id="intro": the menu's "En tids skrift" (its row) */}
        <div id="intro" className="flex w-full flex-col gap-6">
          {/* The image (the home page): at most 40% of the screen tall,
              its width following its shape, centred in the columns; its
              caption (the image's alt text in Sanity) small and italic, below it (order-last),
              aligned to its right edge (the figure is as wide as the
              image: self-center, items-end) */}

          {/* The image (the subscribe page's, from Subscribe Media),
              above the text: centred, at most 192px tall (8 rows of
              24px), its width following its shape */}
          {!!image?.asset && (
            <Image
              src={urlFor(image).width(1400).url()}
              alt={image.alt ?? ""}
              width={1400}
              height={1400}
              sizes="(min-width: 1024px) 721px, 100vw"
              // 48px (2 rows) to the text below: the column's 24px gap
              // plus 24px here
              className="mb-[48px] h-auto max-h-[192px] w-auto max-w-full self-center"
            />
          )}

          {/* The text (rich text from Hero Texts): pStyle, left-aligned
              and hyphenated; the first letter a large initial (3em),
              raised on the first line without changing its height
              (leading-0) */}
          <HeroRichText
            value={text}
            className="pStyle w-full max-w-xl text-left hyphens-auto [&>p:first-child]:first-letter:font-baskervilleNeoDisplay [&>p:first-child]:first-letter:text-[3em] [&>p:first-child]:first-letter:leading-0"
          />
        </div>

        {/* Hidden for now (class "hidden"). "Prenumerera" ("Subscribe" in
          English): an h3, very big, in WordArt style (a 3D extrusion,
          rocking in 3D: .wordArt in globals.css), linking to the subscribe
          page (pointer-events-auto: the box around it lets clicks
          through) */}
      </div>
    </>
  );
}
