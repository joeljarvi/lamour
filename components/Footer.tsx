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
    // Dark (bg-foreground), its text all light (text-background)
    <footer className="flex lg:h-[80vh]  flex-col items-start justify-between gap-y-[21px] lg:gap-6 w-full px-6 pt-6  bg-primary">
      <ul className="flex flex-col justify-start items-start gap-x-3 lg:gap-x-6 gap-y-0 list-none">
        {items.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <Button
                variant="link"
                size="xs"
                className="text-4 tracking-normal text-left justify-start  normal-case h-[21px] lg:h-[24px]  px-0 text-secondary "
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
                className="text-4 tracking-normal text-left justify-start text-secondary normal-case h-[21px] lg:h-[24px]  px-0"
              >
                {item.label}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <span className="pStyle text-[14px] italic tracking-[21px] lg:tracking-[24px] text-foreground text-center w-full pb-[21px] lg:pb-[24px] px-0">
        © {new Date().getFullYear()} L&apos;Amour — La Mort
      </span>
    </footer>
  );
}
