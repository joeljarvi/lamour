import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// The pages linked after the logo, in order
const LINKS = [
  { label: "shop", href: "/" },
  { label: "articles", href: "/articles" },
  { label: "about", href: "/about" },
  { label: "subscribe", href: "/subscribe" },
] as const;

// The home page's first screen, a third version of the hero: the logo and
// the nav links as one line of text, wrapping like a sentence, ", "
// between each ("L'Amour — La Mort, Affären, Artiklar, Om oss,
// Prenumerera"), text-2xl (text-4xl on desktop). The logo is the
// navbar's italic one, its letters at the text's capital height, linking
// home. Underlined on hover; no pointing hands
export default async function HeroLinks() {
  const tNav = await getTranslations("Nav");

  return (
    <section className="min-h-dvh w-full px-3 pt-24 pb-12 lg:px-6">
      <h1 className="sr-only">L&apos;Amour — La Mort</h1>
      <nav className="flex flex-wrap items-baseline font-baskervilleNeoDisplay text-2xl leading-tight text-foreground lg:text-6xl">
        {/* The logo, first: a mask over a box in the text colour
            (bg-current), 0.7em tall (Baskerville's capital height) */}
        <Link
          href="/"
          aria-label="L´Amour — La Mort"
          // On the text's baseline: in the row (items-baseline) a box with
          // no text sits on it with its bottom edge, and the logo file is
          // cropped to the letters, so their foot is that edge. mb nudges
          // it if the letters' foot needs to sit a hair lower or higher
          className="mb-0 hover:opacity-60 transition-opacity"
        >
          <span
            aria-hidden
            className="block h-[1em] aspect-[108.5/13.5] bg-current"
            style={{
              maskImage: "url(/logo/lamour-kursiv-letters.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "left center",
              WebkitMaskImage: "url(/logo/lamour-kursiv-letters.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "left center",
            }}
          />
        </Link>
        {LINKS.map(({ label, href }) => (
          <Fragment key={href}>
            {/* ", " before each link (kept with it, not left at a line's
                end alone) */}
            <span aria-hidden className="whitespace-pre">
              ,{" "}
            </span>
            <Link
              href={href}
              className="underline-offset-4 decoration-1 hover:underline"
            >
              {tNav(label)}
            </Link>
          </Fragment>
        ))}
      </nav>
    </section>
  );
}
