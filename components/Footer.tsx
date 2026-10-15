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
    <footer className="flex flex-col items-center gap-6 w-full px-6 lg:px-12 pt-24 pb-12">
      <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 list-none">
        {items.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <Button variant="link" size="xs" className="w-auto" asChild>
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
              <Button variant="link" size="xs" className="w-auto">
                {item.label}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <span className="font-baskervilleNeoText text-xs tracking-[3%] text-neutral-700">
        © {new Date().getFullYear()} L&apos;Amour — La Mort
      </span>
    </footer>
  );
}
