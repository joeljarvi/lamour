import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { client } from "@/lib/sanity/client";
import { heroTextsQuery } from "@/lib/sanity/queries";
import { FALLBACK_TEXTS, type HeroPage } from "./HeroSection";

// The pages the grid links to, in order, with their nav label and address
const LINKS: {
  page: Exclude<HeroPage, "home">;
  label: "shop" | "articles" | "about" | "subscribe";
  href: string;
}[] = [
  { page: "shop", label: "shop", href: "/" },
  { page: "articles", label: "articles", href: "/articles" },
  { page: "about", label: "about", href: "/about" },
  { page: "subscribe", label: "subscribe", href: "/subscribe" },
];

// The home page's first screen, a second version of the hero: a 4-column
// grid (one column on mobile), one column per page (Affären, Artiklar, Om
// oss, Prenumerera): its name as an h2 with its Hero Text below, the whole
// block a link to the page; the pointing hand before the name on hover.
// The texts come from Hero Texts in Sanity (each page's built-in text when
// empty)
export default async function HeroGrid() {
  const [texts, tNav] = await Promise.all([
    client.fetch<Partial<Record<HeroPage, string>> | null>(heroTextsQuery),
    getTranslations("Nav"),
  ]);
  const textFor = (page: HeroPage) =>
    texts?.[page]?.trim() || FALLBACK_TEXTS[page];

  return (
    // No id="home-hero": the navbar shows from the start here
    // The labels in the middle of the screen (content-center), each
    // centred in its column
    <div className="pt-12 px-3 pb-3 lg:px-6 lg:pb-6 h-dvh ">
      {/* Desktop: the columns touch (no gap), each with its own padding,
          and a vertical line between them running the grid's full height
          (the one row stretches to fill it, lg:content-stretch) */}
      <section className="grid h-full w-full grid-cols-1 content-start justify-items-start gap-x-12 gap-y-12 px-3 py-6 lg:grid-cols-4 lg:content-stretch lg:justify-items-stretch lg:gap-x-0 lg:p-0 bg-blue-200 border border-foreground ">
        {/* The site's name, for screen readers (the page's main heading) */}
        <h1 className="sr-only">L&apos;Amour — La Mort</h1>

        {/* One page per column: its name and its text, a link; a line on
            the left of every column but the first */}
        {LINKS.map(({ page, label, href }, i) => (
          <Link
            key={page}
            href={href}
            className={`group relative flex flex-col items-start justify-start lg:p-6 ${i > 0 ? "lg:border-l lg:border-foreground" : ""}`}
          >
            <h2 className="flex items-baseline font-baskervilleNeoText text-sm uppercase tracking-[48%] text-foreground">
              {tNav(label)}
              {/* The pointing hand after the name, pointing back at it:
                shown on hover (or keyboard focus) on desktop, always on
                mobile */}
              <span
                aria-hidden
                className="ml-3 normal-case tracking-normal transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
              >
                ☜
              </span>
            </h2>
            {/* The page's text below the label, always shown */}
            <p className="pStyle mt-3 whitespace-pre-line text-foreground">
              {textFor(page)}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
