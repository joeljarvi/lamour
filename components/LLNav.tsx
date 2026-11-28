"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { LOGO_AT, NAV_AT, WORD_FADE, WORD_STAGGER } from "@/lib/introTiming";

function useTypingAnimation(fullText: string, collapsed: boolean, speed = 70) {
  const [text, setText] = useState("");
  useEffect(() => {
    const target = collapsed ? fullText[0] : fullText;
    if (text === target) return;
    const timer = setTimeout(() => {
      setText((prev) =>
        prev.length < target.length
          ? fullText.slice(0, prev.length + 1)
          : prev.slice(0, -1),
      );
    }, speed);
    return () => clearTimeout(timer);
  }, [text, collapsed, fullText, speed]);
  return text;
}

// Links also match their sub-pages. "/" is the shop, so it matches the home
// page and the issue pages under /shop/
function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/" || pathname.startsWith("/shop/")
    : pathname === href || pathname.startsWith(`${href}/`);
}

// The navbar's text colour: dark (text-foreground) everywhere, top of the
// page included; light only on mobile while the menu is open (the
// full-screen menu is dark)
function navText(navOpen: boolean) {
  return [
    "[&_a]:transition-colors [&_button]:transition-colors [&_a]:duration-300 [&_button]:duration-300",
    "[&_a]:text-foreground [&_button]:text-foreground",
    navOpen
      ? "max-lg:[&_a]:text-background max-lg:[&_button]:text-background"
      : "",
  ].join(" ");
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

// On the home page's first load the navbar appears word by word, left to
// right, in two parts (lib/introTiming): first its title (LOGO_AT, before
// the intro card's tagline), then, once the intro card has finished, the
// rest (NAV_AT). `order` is the word's place in its part (`at`, NAV_AT by
// default). Elsewhere, or when it's off, the text shows at once
function Reveal({
  on,
  order,
  at = NAV_AT,
  children,
}: {
  on: boolean;
  order: number;
  at?: number;
  children: React.ReactNode;
}) {
  if (!on) return <>{children}</>;
  return (
    <motion.span
      className="inline-block whitespace-pre"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: WORD_FADE, delay: at + order * WORD_STAGGER }}
    >
      {children}
    </motion.span>
  );
}

// The logo in the bar, as tall as the text it replaced. Its letters are a
// mask over a box in the text colour (bg-current), so it takes the
// navbar's colour like text does (light over the hero, dark elsewhere).
// The files' viewBoxes are cropped to the letters. Two to choose from:
// "Lamour kursiv" (italic, used always) and "Lamour svart" (upright
// capitals, not used now)
const LOGOS = {
  kursiv: {
    src: "/logo/lamour-kursiv-letters.svg",
    // As tall as text-2 (0.9rem, 14.4px), 4px up from the bottom (mb-1)
    className: "h-[0.9rem] mb-1 aspect-[108.5/13.5]",
  },
  svart: {
    src: "/logo/lamour-svart-letters.svg",
    // Capitals only: 12px, about text-sm's capitals
    className: "h-3 aspect-[212/15.5]",
  },
} as const;

// The navbar's name, as text (the logo files, LOGOS, unused)
function NavLogo() {
  // "L'Amour — La Mort" as text in Baskerville Neo Text (the button around
  // it sets its size and case)
  return (
    <span className="block whitespace-nowrap font-baskervilleNeoText">
      L&apos;Amour — La Mort
    </span>
  );
}

// The navbar's title, word by word, first of all (LOGO_AT), with the
// spaces between the words
function RevealWords({ on, text }: { on: boolean; text: string }) {
  return text.split(" ").map((word, i, words) => (
    <Reveal key={i} on={on} order={i} at={LOGO_AT}>
      {i < words.length - 1 ? `${word} ` : word}
    </Reveal>
  ));
}

/* ─── NAV LINKS ─── */

// The nav links in a column (the menu's contents, on desktop below "Meny"
// in the bar, on mobile on the dark full-screen menu): Baskerville Neo
// Text, text-sm, normal case; the pointing hand (☜) on hover and for the
// current page; fading in one after another. A click closes the menu
// The menu's pages, in order; on desktop numbered "1. Affären",
// "2. Artiklar"… (their submenus' sections continue it: "2.14 …")
// The desktop bar's buttons: text-1, normal case, no padding or fixed height
const NAV_BTN =
  "h-auto lg:h-auto flex items-baseline px-0 font-baskervilleNeoText text-1 normal-case tracking-normal whitespace-nowrap";

const PAGES = [
  { key: "shop", href: "/" },
  { key: "articles", href: "/articles" },
  { key: "subscribe", href: "/subscribe" },
  { key: "about", href: "/about" },
  // "Till kassan": the checkout (the cart's contents)
  { key: "toCheckout", href: "/checkout" },
] as const;

// A page's number in the menu (1-based), or 1 for a page not in it
const pageNumber = (pathname: string) =>
  PAGES.findIndex((p) => p.href === pathname) + 1 || 1;

function NavLinks({
  pathname,
  close,
  submenu,
  footer,
  onCart,
  linkVariant = "link",
  linkClassName,
  layout = false,
  exclude = [],
  numbered = false,
  listClassName = "flex flex-row items-start list-none pt-3 pb-3",
}: {
  // The list's layout (default: a column)
  listClassName?: string;
  pathname: string;
  close: () => void;
  // Given: a "Korg[n]" link after the pages, opening the cart (desktop)
  onCart?: () => void;
  // The links' Button variant ("Link": the desktop nav's, blue shadow)
  linkVariant?: "link" | "Link" | "LLButton" | "LLButtonLeft";
  // Extra classes for each link (merged over the defaults)
  linkClassName?: string;
  // Animate the links into place when the list's layout changes (motion)
  layout?: boolean;
  // Pages left out (their hrefs): the desktop bar has "Om LL" and "Kassa"
  // on the right, next to Korg
  exclude?: string[];
  // Below the last link, after an empty row (the desktop menu's
  // "Stäng meny")
  footer?: React.ReactNode;
  // Each link with its number ("1. Affären": the desktop menu)
  numbered?: boolean;
  // The desktop menu's section submenu, shown right below the current
  // page's link (Affären on the home page, Artiklar on the articles page)
  submenu?: React.ReactNode;
}) {
  const t = useTranslations("Nav");
  const { totalItems } = useCart();
  return (
    <motion.ul
      key="desktop-links"
      className={listClassName}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: {
          transition: {
            staggerChildren: 0.04,
            staggerDirection: -1,
          },
        },
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {PAGES.filter(({ href }) => !exclude.includes(href))
        .map(({ key, href }, i) => ({
          key,
          label: numbered ? `${i + 1}. ${t(key)}` : t(key),
          href,
        }))
        .map(({ key, label, href }) => (
          // "Till kassan" set apart from the page links: one empty row
          // (24px) above it
          <motion.li
            key={label}
            layout={layout ? "position" : undefined}
            transition={{ layout: { duration: 0.35, ease: "easeInOut" } }}
            variants={ITEM_VARIANTS}
            className={href === "/checkout" ? "" : undefined}
          >
            <Button
              variant={linkVariant}
              size="xs"
              // pStyle on mobile and desktop
              className={cn(
                "w-auto h-12 lg:h-12 flex items-center lg:items-baseline px-0 font-baskervilleNeoText text-1 uppercase tracking-wider whitespace-nowrap",
                linkVariant !== "LLButtonLeft" && "after:content-none",
                linkClassName,
              )}
              asChild={href != null}
            >
              {href != null ? (
                <Link
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  onClick={close}
                >
                  {label}
                </Link>
              ) : (
                <span>{label}</span>
              )}
            </Button>
            {/* Below the current page's link: the submenu, if given */}
            {href === pathname && submenu}
          </motion.li>
        ))}
      {/* "Korg[n]": opens the cart, its item count raised as the pages'
          counts */}
      {onCart && (
        <motion.li variants={ITEM_VARIANTS}>
          <Button
            variant={linkVariant}
            size="xs"
            className="w-auto h-12 lg:h-12 flex items-center lg:items-baseline px-0 font-baskervilleNeoText text-1 uppercase tracking-wider whitespace-nowrap after:content-none"
            onClick={onCart}
            aria-label={t("openCart")}
          >
            {t("cartWord")}
            <sup className="ml-0.5 text-[10px] leading-none tracking-normal tabular-nums">
              {totalItems}
            </sup>
          </Button>
        </motion.li>
      )}
      {footer && (
        <motion.li variants={ITEM_VARIANTS} className="mt-[24px]">
          {footer}
        </motion.li>
      )}
    </motion.ul>
  );
}

/* ─── SECTION LINKS ─── */

// Each page's sections the submenu jumps to (by element id), with their
// labels, in page order; pages not listed have no submenu
type Section = {
  id: string;
  label:
    | "sectionIntro"
    | "sectionFilter"
    | "sectionShop"
    | "sectionSubscribe"
    | "sectionArticles"
    | "sectionArchive"
    | "sectionThanks"
    | "sectionPlans"
    | "sectionAbout"
    | "sectionEditors";
};
const SECTIONS: Record<string, Section[]> = {
  "/": [
    { id: "intro", label: "sectionIntro" },
    { id: "filter", label: "sectionFilter" },
    { id: "shop", label: "sectionShop" },
    { id: "subscribe", label: "sectionSubscribe" },
  ],
  "/articles": [
    { id: "intro", label: "sectionArticles" },
    { id: "filter", label: "sectionFilter" },
    { id: "archive", label: "sectionArchive" },
  ],
  "/about": [
    { id: "intro", label: "sectionAbout" },
    { id: "editors", label: "sectionEditors" },
  ],
  "/subscribe": [
    { id: "intro", label: "sectionThanks" },
    { id: "plans", label: "sectionPlans" },
  ],
};

// Height (px) of one line-number row (LineNumbers / ColumnNumbers)
const ROW = 24;

// Where the line numbers start on the page (their top edge, row 1), in
// page coordinates; the page's top when they aren't on the page
function lineNumbersTop() {
  const list = document.getElementById("line-numbers");
  return list ? list.getBoundingClientRect().top + window.scrollY : 0;
}

// Desktop submenu, below "Affären" in the nav links (24px padding all
// round): a link to each of the page's
// sections, numbered by the line-number row it starts on — "1.14
// Introduktion", "1.43 Filtrering"… (row = its distance from the top of
// the line numbers ÷ 24px, plus 1, as LineNumbers counts). Measured on the page,
// so the numbers follow the layout (a screen-tall hero moves them),
// remeasured on resize and when the page's height changes. Only the
// sections on the current page (none: no submenu). A click scrolls the
// section's first row to the middle of the screen
function SectionLinks({ pathname }: { pathname: string }) {
  const t = useTranslations("Nav");
  const [rows, setRows] = useState<
    {
      id: string;
      label: Section["label"];
      row: number;
    }[]
  >([]);

  useEffect(() => {
    const measure = () =>
      setRows(
        (SECTIONS[pathname] ?? []).flatMap(({ id, label }) => {
          const el = document.getElementById(id);
          if (!el) return [];
          // Measured from the line numbers' top edge (their row 1), so the
          // rows match theirs exactly
          const origin = lineNumbersTop();
          const box = el.getBoundingClientRect();
          const top = box.top + window.scrollY - origin;
          return [
            {
              id,
              label,
              row: Math.floor(top / ROW) + 1,
            },
          ];
        }),
      );
    // After the page has rendered
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  if (rows.length === 0) return null;
  return (
    <ul className="flex flex-col items-start list-none mt-[24px] pb-[24px] px-[48px]">
      {rows.map(({ id, label, row }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              // Scroll so the section's first row is in the middle of the
              // screen
              const rowTop = lineNumbersTop() + (row - 1) * ROW;
              window.scrollTo({
                top: Math.max(0, rowTop + ROW / 2 - window.innerHeight / 2),
                behavior: "smooth",
              });
            }}
            className="block px-3 pStyle normal-case underline-offset-4 decoration-1 hover:underline"
          >
            {t(label)}
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ─── BACKGROUND PICKER ─── */

// The backgrounds to choose from: `value` is the colour (for paper its
// average, shown while the image loads); `image`, if any, laid over it
// (paper: public/paper_texture_2.jpg)
const BACKGROUNDS: { name: string; value: string; image?: string }[] = [
  { name: "Vit", value: "#ffffff" },
  { name: "Misty-blue", value: "#b5c7eb" },
  { name: "Papper", value: "#f2f2f2", image: "/paper_texture_2.jpg" },
];
const BACKGROUND_KEY = "siteBackground";

// With an image background (html[data-bg-image], its url in --bg-image):
// the page and everything with the site's background (bg-background: the
// bars, the cart, boxes…) show it, fixed to the screen and covering it, so
// it runs on seamlessly under them. Unlayered, so it wins over their
// colour classes
const BACKGROUND_RULE = `html[data-bg-image],
html[data-bg-image] .bg-background {
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}`;

// A circle per background: a click sets the whole site's background
// (--background on <html>, which every bg-background reads), remembered in
// this browser. The chosen one filled in, the others outlined
function BackgroundPicker({ className = "" }: { className?: string }) {
  const [chosen, setChosen] = useState<string>(BACKGROUNDS[0].value);

  // The saved colour, once on load (after hydration on purpose: the
  // server can't read the browser's storage)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BACKGROUND_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && BACKGROUNDS.some((b) => b.value === saved)) setChosen(saved);
    } catch {
      // No storage: white
    }
  }, []);

  // The rule for image backgrounds, once
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = BACKGROUND_RULE;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--background", chosen);
    const image = BACKGROUNDS.find((b) => b.value === chosen)?.image;
    if (image) {
      root.style.setProperty("--bg-image", `url("${image}")`);
      root.setAttribute("data-bg-image", "");
    } else {
      root.style.removeProperty("--bg-image");
      root.removeAttribute("data-bg-image");
    }
    try {
      localStorage.setItem(BACKGROUND_KEY, chosen);
    } catch {
      // Not saved; it still works for this visit
    }
  }, [chosen]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {BACKGROUNDS.map(({ name, value, image }) => (
        <button
          key={value}
          type="button"
          aria-label={name}
          aria-pressed={chosen === value}
          onClick={() => setChosen(value)}
          // The colour, or the image filling the circle
          style={{
            backgroundColor: value,
            backgroundImage: image ? `url("${image}")` : undefined,
            backgroundSize: "cover",
          }}
          className={`size-[16px] cursor-pointer rounded-full border border-foreground transition-shadow hover:ring-1 hover:ring-foreground hover:ring-offset-2 ${chosen === value ? "ring-1 ring-foreground ring-offset-0" : ""}`}
        />
      ))}
    </div>
  );
}

/* ─── MAIN NAV ─── */

export default function LLNav() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  // Desktop: the menu column slid away ("Stäng meny"); marks the page
  // (data-menu-closed) and narrows --layout-ml / --layout-mr, so the
  // layout widens with it
  const [menuClosed, setMenuClosed] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-menu-closed", menuClosed);
    // Every page's layout (as globals.css): between the menu (w-xs, 20rem)
    // on the left and the cart drawer's room (w-xs too) on the right, so
    // the full width less 640px; 12.5vw each side with the menu closed
    root.style.setProperty("--layout-ml", menuClosed ? "12.5vw" : "20rem");
    root.style.setProperty("--layout-mr", menuClosed ? "12.5vw" : "20rem");
  }, [menuClosed]);

  const { totalItems, drawerOpen, setDrawerOpen } = useCart();
  const t = useTranslations("Nav");
  const locale = useLocale();

  const [scrolled, setScrolled] = useState(false);
  // The page's scroll (motion's useScroll): whether scrolled at all
  const { scrollY } = useScroll();
  const onScroll = (y: number) => {
    setScrolled(y > 0);
  };
  useMotionValueEvent(scrollY, "change", onScroll);
  // Once on load (a page opened already scrolled)
  useEffect(() => {
    onScroll(window.scrollY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // The navbar's height, as --nav-h on the page (desktop), so sticky
  // parts below it (the latest issue's cover and title, the issue page's
  // cover…) move down while the menu's links make it taller
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      root.style.setProperty(
        "--nav-h",
        desktop ? `${bar.getBoundingClientRect().height}px` : "0px",
      );
    });
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--nav-h");
    };
  }, []);

  // Mobile: the header sits right above the page's filter bar (#filter),
  // pushed down there and rising with the page as it scrolls until it
  // reaches the top, where it stays (sticky). The filter bar sticks at
  // 72px (top-18), right under it: the header's bottom (24px down, 48px
  // tall). No filter bar: at the top. Not while the menu is open
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = mobileHeaderRef.current;
    if (!header) return;
    const mobile = window.matchMedia("(max-width: 1023px)");
    let anchor = 0;
    const apply = () => {
      const y =
        navOpen || !mobile.matches ? 0 : Math.max(0, anchor - window.scrollY);
      header.style.transform = y ? `translateY(${y}px)` : "";
    };
    const measure = () => {
      const filter = document.getElementById("filter");
      const bottom = 24 + header.offsetHeight;
      // The filter bar's place in the page, unstuck: its parent's top (it's
      // the first thing in it; the parent doesn't stick)
      const parent = filter?.parentElement;
      const top = parent
        ? parent.getBoundingClientRect().top + window.scrollY
        : 0;
      anchor = filter ? Math.max(0, top - bottom) : 0;
      apply();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", apply, { passive: true });
    mobile.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", apply);
      mobile.removeEventListener("change", measure);
    };
  }, [pathname, navOpen]);

  // Word-by-word reveal: only when the site opens on the home page (the
  // nav stays mounted while navigating, so it plays once)
  const [intro] = useState(() => pathname === "/");

  const lamourText = useTypingAnimation("L'Amour", scrolled);
  const lamortText = useTypingAnimation("La Mort", scrolled);

  // Not in the studio, nor on an article (it has its own bar); a series'
  // page (/articles/series/…) has it
  if (
    pathname.startsWith("/studio") ||
    (pathname.startsWith("/articles/") &&
      !pathname.startsWith("/articles/series/"))
  )
    return null;

  return (
    <>
      <motion.div
        ref={barRef}
        // Closed: a solid bar (bg-background).
        // Open: dark (bg-foreground), filling the screen on mobile; on
        // desktop just the bar (the menu slides in as its own panel). Its
        // text light over the hero, dark past it (navText).
        // The same on every page.
        // z-90: above the issue page (z-85), so it stays visible over it;
        // below the cart (z-100). Desktop, while the cart is open: above
        // the cart (z-110), so "Korg" stays on top of the drawer (what
        // would sit over the drawer is hidden)
        // Desktop: clicks pass through the bar's empty space to the page
        // under it (the filter buttons at the top…); only its links and
        // buttons take them.
        // Desktop: 168px tall, 7 rows of 24px, its bottom border (inside)
        // on the same pixels as LineNumbers' line under row 7
        className={`fixed top-0 lg:top-0 left-0 right-0 lg:px-5 z-90 ${drawerOpen ? "lg:z-110" : ""} flex flex-col transition-[color,background-color,opacity,translate] duration-500 lg:h-auto lg:pointer-events-none lg:[&_a]:pointer-events-auto lg:[&_button]:pointer-events-auto 
        ${navText(navOpen)} ${navOpen ? "h-dvh bg-foreground lg:bg-transparent" : "bg-transparent h-[63px]"} ${navOpen ? "" : "max-lg:pointer-events-none"}`}
      >
        {/* ── DESKTOP: one row along the top: the nav links top left
            (horizontal), the logo centred, "Korg[n]" top right ── */}
        <div className="hidden lg:block">
          <div
            // Fixed, on the page's background: 96px tall at the top of the
            // page, 48px once scrolled; its links, logo and buttons on its
            // bottom edge
            data-top-bar
            // On the page's background; transparent while an issue page is
            // open (data-pdp on <html>, set by IssuePage)
            className="relative px-0 pt-5 pb-2 bg-transparent in-data-pdp:bg-transparent"
          >
            {/* 12 columns, 12px apart: the logo (cols 1–2); the pages
                (col 3); Om LL and Logga in (col 10); Korg (col 12) */}
            <div className="grid grid-cols-12 gap-x-3 items-baseline">
              <div className="col-span-2">
                <Button
                  data-reveal-part="mark"
                  variant="Link"
                  size="xs"
                  className={`${NAV_BTN} justify-start`}
                  asChild
                >
                  <Link href="/" aria-label="L´Amour — La Mort">
                    <Reveal on={intro} order={0} at={LOGO_AT}>
                      <NavLogo />
                    </Reveal>
                  </Link>
                </Button>
              </div>

              {/* The pages, one under the other, the hand on their right
                  pointing back at them */}
              <nav data-reveal-part="nav" className="col-start-3">
                <NavLinks
                  key="desktop-links"
                  pathname={pathname}
                  close={() => setNavOpen(false)}
                  linkVariant="LLButtonLeft"
                  linkClassName={`${NAV_BTN} min-w-[110px] justify-start`}
                  exclude={["/about", "/checkout"]}
                  listClassName="flex flex-col gap-0 items-start list-none"
                />
              </nav>

              <div
                className={`col-start-10 col-span-2 flex flex-row items-baseline gap-x-3 transition-opacity duration-300 ${drawerOpen ? "pointer-events-none opacity-0 [&_*]:pointer-events-none!" : ""}`}
              >
                {[
                  { href: "/about", label: t("about") },
                  { href: "/login", label: t("login") },
                ].map(({ href, label }) => (
                  <Button
                    key={href}
                    variant="Link"
                    size="xs"
                    className={`${NAV_BTN}  `}
                    asChild
                  >
                    <Link
                      href={href}
                      aria-current={
                        isActive(pathname, href) ? "page" : undefined
                      }
                    >
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>

              {/* "Korg[n]" (opens the cart), top right */}
              <div className="col-start-12 flex justify-end">
                <Button
                  variant="Link"
                  size="xs"
                  className={`${NAV_BTN} gap-0`}
                  // Opens the cart; while it's open (on top of it), closes it
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  aria-expanded={drawerOpen}
                  aria-label={t("openCart")}
                >
                  {t("cartWord")}
                  <sup className="text-[10px] leading-none tracking-normal tabular-nums">
                    {totalItems}
                  </sup>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── HEADER (mobile): the logo top left; "Cart" and the menu
            button side by side top right. On mobile's 21px lines: one line down
            (pt-[21px]), each item one line tall, the header three lines
            (63px) ── */}
        <div
          ref={mobileHeaderRef}
          // Right above the shop's filter bar, scrolling with the page until
          // it reaches the top, where it stays (mobileHeaderRef); the filter
          // bar sticks right under it. Clicks: the bar around it lets them
          // through, the header itself takes them
          className={`relative flex lg:hidden justify-between items-start w-full shrink-0 h-auto  px-6 top-6 pointer-events-auto transition-colors duration-300 ${navOpen ? "bg-foreground" : ""}`}
        >
          {/* Logo, top left. No pointing hand (the link variant's ::after) */}
          <span
            // Open: dark, as the menu behind it (its text light: navText)
            className={`flex justify-between w-full items-center h-12 lg:h-12 border transition-colors duration-300 ${navOpen ? "bg-foreground border-background" : "bg-background border-foreground"}`}
          >
            <Button
              data-reveal-part="mark"
              variant="link"
              size="xs"
              className="flex items-center justify-start px-3 border-none h-10 text-[14px] w-auto after:content-none"
              asChild
            >
              <Link href="/" aria-label="L´Amour — La Mort">
                <Reveal on={intro} order={0} at={LOGO_AT}>
                  <NavLogo />
                </Reveal>
              </Link>
            </Button>

            {/* Top right: "Cart" with the item count raised
              (superscript), in pStyle, then the menu button: three lines, a
              cross while the menu is open; no pointing hands */}
            <div data-reveal-part="nav" className="flex items-center">
              <Button
                variant="link"
                size="xs"
                className="w-auto h-[21px] px-3 pStyle normal-case after:content-none"
                onClick={() => setDrawerOpen(true)}
                aria-label={t("openCart")}
              >
                <motion.span
                  key={totalItems}
                  className="inline-block"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {t("cartWord")}{" "}
                  <span className="inline-flex align-super text-[10px] leading-none tracking-normal">
                    {totalItems}
                  </span>
                </motion.span>
              </Button>
              <button
                type="button"
                onClick={() => setNavOpen((v) => !v)}
                aria-expanded={navOpen}
                aria-label={navOpen ? t("closeMenu") : t("menu")}
                className="flex size-[21px] shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 mr-3"
              >
                {/* Three thin lines (a hamburger); a cross while open */}
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="size-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  {navOpen ? (
                    <path d="M3 3 L17 17 M17 3 L3 17" />
                  ) : (
                    <path d="M2 5 H18 M2 10 H18 M2 15 H18" />
                  )}
                </svg>
              </button>
            </div>
          </span>
        </div>

        {/* ── NAV OVERLAY (mobile): the menu filling the screen (dark),
            the links in a column below "Meny", like the desktop menu ── */}
        <div
          // Below the header (which sits 24px down: top-6)
          className={`flex flex-col flex-1 min-h-0 mt-6 pt-3 px-3 overflow-y-auto overscroll-contain lg:hidden ${navOpen ? "" : "hidden"}`}
        >
          <AnimatePresence>
            {navOpen && (
              <NavLinks
                key="mobile-links"
                pathname={pathname}
                close={() => setNavOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

// The whole menu (the pages, their counts, Korg[n]) in a row, wrapping:
// the hero's (HeroSection). With `fixedFrom` (a breakpoint query): from
// there, fixed at the top of the screen where it sits in the hero's row;
// an invisible copy keeps its place, and the menu takes that copy's left
// edge (a fixed item in a flex row would otherwise jump to its start)
export function HeroMenu({
  className,
  fixedFrom,
}: {
  className?: string;
  fixedFrom?: string;
}) {
  const pathname = usePathname();
  const { setDrawerOpen } = useCart();
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [fixedLeft, setFixedLeft] = useState<number | null>(null);
  useEffect(() => {
    const el = placeholderRef.current;
    if (!fixedFrom || !el) return;
    const query = window.matchMedia(fixedFrom);
    const measure = () =>
      setFixedLeft(
        query.matches ? el.getBoundingClientRect().left + window.scrollX : null,
      );
    measure();
    // Again when the fonts arrive or anything in the row changes size
    // (the logo's width, the pile's…)
    document.fonts.ready.then(measure).catch(() => {});
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(el);
    for (const sibling of el.parentElement?.children ?? [])
      observer.observe(sibling);
    query.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", measure);
    };
  }, [fixedFrom]);

  const menu = (
    <NavLinks
      pathname={pathname}
      close={() => {}}
      onCart={() => setDrawerOpen(true)}
      listClassName="flex flex-row flex-wrap items-center gap-x-12 list-none"
    />
  );
  // Dark text (the link buttons are light by themselves; in the navbar
  // navText sets it), left-aligned
  const look =
    "[&_a]:text-foreground [&_button]:text-foreground [&_a]:justify-start [&_button]:justify-start " +
    // As the hero's logo: 48px tall, 12px in from each side, 14px text on
    // mobile
    "[&_a]:h-12 [&_button]:h-12 [&_a]:px-3 [&_button]:px-3 max-lg:[&_a]:text-[14px] max-lg:[&_button]:text-[14px] max-lg:[&_a]:leading-[18px] max-lg:[&_button]:leading-[18px] " +
    // Desktop: 18px Baskerville Neo Display, as the hero's logo
    "lg:[&_a]:text-[18px] lg:[&_button]:text-[18px] lg:[&_a]:leading-[24px] lg:[&_button]:leading-[24px] lg:[&_a]:font-baskervilleNeoDisplay lg:[&_button]:font-baskervilleNeoDisplay";
  return (
    <>
      {fixedFrom && (
        <div
          ref={placeholderRef}
          aria-hidden
          inert
          // Only where the menu is fixed (desktop: the breakpoint the
          // hero passes, lg)
          className={`invisible max-lg:hidden ${look} ${className ?? ""}`}
        >
          {menu}
        </div>
      )}
      <nav
        className={`${look} ${fixedLeft != null ? "fixed top-0 z-50" : (className ?? "")}`}
        style={fixedLeft != null ? { left: fixedLeft } : undefined}
      >
        {menu}
      </nav>
    </>
  );
}
