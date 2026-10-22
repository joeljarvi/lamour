"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { exploreItems } from "./NavDropdown";
import { Button } from "./ui/button";

// The practical explore links (the drop-down's clues / next issue stay there)
const FOOTER_KEYS = [
  "about",
  "contact",
  "terms",
  "subscribe",
  "login",
  "changeLanguage",
];

// Site footer, centred at the bottom of every page: the practical links from
// the explore menu, then the copyright line
export default function Footer() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();

  // Same pages LLNav hides on
  if (pathname.startsWith("/studio") || pathname.startsWith("/articles/"))
    return null;

  const items = exploreItems(t, pathname, locale).filter((item) =>
    FOOTER_KEYS.includes(item.key),
  );

  return (
    // The link buttons set text-foreground: the link variant's own text is
    // white (text-background, for the navbar's mix-blend-difference), which
    // would vanish on the page's white background
    <footer className="flex flex-col items-center justify-start gap-6 w-full px-3 pt-9 pb-0 ">
      <ul className="flex flex-wrap justify-center gap-x-3 lg:gap-x-6 gap-y-6 list-none border-b bg-background  border-b-neutral-600 border-t border-t-neutral-600 border-r border-r-neutral-600">
        {items.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <Button
                variant="link"
                size="xs"
                className="w-auto text-[8px] text-foreground"
                asChild
              >
                <Link
                  href={item.href}
                  locale={item.locale}
                  aria-current={
                    !item.locale && pathname === item.href ? "page" : undefined
                  }
                >
                  {item.label}
                </Link>
              </Button>
            ) : (
              // TODO: no pages for these yet — exploreItems gets the hrefs
              <Button
                variant="link"
                size="xs"
                className="w-auto text-[8px] text-foreground"
              >
                {item.label}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <span className="font-baskervilleNeoText text-[8px] tracking-[48%] uppercase text-background italic pb-9 px-6 ">
        © {new Date().getFullYear()} L&apos;Amour — La Mort
      </span>
    </footer>
  );
}
