"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
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
    className: "h-4 lg:h-[24px] aspect-[108.5/13.5]",
  },
  svart: {
    src: "/logo/lamour-svart-letters.svg",
    // Capitals only: 12px, about text-sm's capitals
    className: "h-3 aspect-[212/15.5]",
  },
} as const;

// The navbar's name, as text: "L'Amour — La Mort" in Baskerville Neo Text,
// 18px on a 24px line, normal case and spacing (the button around it sets
// its own size and tracking, overridden here). The logo files (LOGOS) stay
// for now, unused
function NavLogo() {
  return (
    <span className="block whitespace-nowrap pStyle normal-case">
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
const PAGES = [
  { key: "shop", href: "/" },
  { key: "articles", href: "/articles" },
  { key: "about", href: "/about" },
  { key: "subscribe", href: "/subscribe" },
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
  numbered = false,
}: {
  pathname: string;
  close: () => void;
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
  return (
    <motion.ul
      key="desktop-links"
      className="flex flex-col items-start list-none pt-3 pb-3"
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
      {PAGES.map(({ key, href }, i) => ({
        label: numbered ? `${i + 1}. ${t(key)}` : t(key),
        href,
      })).map(({ label, href }) => (
        // "Till kassan" set apart from the page links: one empty row
        // (24px) above it
        <motion.li
          key={label}
          variants={ITEM_VARIANTS}
          className={href === "/checkout" ? "" : undefined}
        >
          <Button
            variant="link"
            size="xs"
            // pStyle on mobile and desktop
            className="w-auto h-[21px] lg:h-auto px-3 lg:px-[24px] pStyle normal-case whitespace-nowrap after:ml-3"
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
            <span className="tabular-nums">
              {pageNumber(pathname)}.{row}
            </span>{" "}
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
    // Every page's layout: 20vw in from each side with the menu open
    // (as globals.css), 12.5vw with it closed
    const inset = menuClosed ? "12.5vw" : "20vw";
    root.style.setProperty("--layout-ml", inset);
    root.style.setProperty("--layout-mr", inset);
  }, [menuClosed]);

  const { totalItems, setDrawerOpen } = useCart();
  const t = useTranslations("Nav");
  const locale = useLocale();

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Word-by-word reveal: only when the site opens on the home page (the
  // nav stays mounted while navigating, so it plays once)
  const [intro] = useState(() => pathname === "/");

  const lamourText = useTypingAnimation("L'Amour", scrolled);
  const lamortText = useTypingAnimation("La Mort", scrolled);

  if (pathname.startsWith("/studio") || pathname.startsWith("/articles/"))
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
        // z-90: below the issue page (z-95), which covers it, and the cart (z-100).
        // Desktop: clicks pass through the bar's empty space to the page
        // under it (the filter buttons at the top…); only its links and
        // buttons take them.
        // Desktop: 168px tall, 7 rows of 24px, its bottom border (inside)
        // on the same pixels as LineNumbers' line under row 7
        className={`fixed top-0 lg:top-0 left-0 right-0 lg:pt-[24px] lg:pl-0 lg:pr-[24px]   z-90 flex flex-col transition-[color,background-color,opacity,translate] duration-500 lg:h-[168px] lg:pointer-events-none lg:[&_a]:pointer-events-auto lg:[&_button]:pointer-events-auto 
        ${navText(navOpen)} ${navOpen ? "h-dvh bg-foreground lg:bg-transparent" : "bg-transparent h-[63px]"}`}
      >
        {/* ── DESKTOP: nav links (col 1) · logo (centre) · cart ── */}
        <div className="hidden lg:block">
          {/* The links' column, logo and cart along the top (items-start) */}
          <div
            className={`grid grid-cols-12 gap-0 items-start h-auto bg-transparent`}
          >
            {/* The nav links, always shown on desktop (no "Meny" button),
              in a column top left, in the bar itself. They get the
              pointing hand (☜) on hover and for the current page */}
            {/* The menu column: the links, sliding out to the left as a
                drawer when closed ("Stäng meny"), "Meny" in their place to
                bring them back. The page's layout moves left with it
                (--layout-ml: globals.css) */}
            <div className="relative col-start-1 col-span-2 justify-self-start">
              <nav
                aria-hidden={menuClosed || undefined}
                inert={menuClosed || undefined}
                className={`flex flex-col items-start [&_ul]:pt-0 transition-transform duration-500 ease-in-out ${menuClosed ? "-translate-x-[calc(100%+48px)]" : "translate-x-0"}`}
              >
                <NavLinks
                  key="desktop-links"
                  numbered
                  pathname={pathname}
                  close={() => setNavOpen(false)}
                  // Below the current page's link: its sections, numbered
                  // by row
                  submenu={<SectionLinks pathname={pathname} />}
                  footer={
                    // The site's background colour (no "Stäng": the menu
                    // stays open on desktop)
                    <BackgroundPicker className="px-[48px]" />
                  }
                />
              </nav>
              {/* "Meny": while the menu is closed, top left, opens it */}
              <Button
                variant="link"
                size="xs"
                aria-expanded={!menuClosed}
                tabIndex={menuClosed ? 0 : -1}
                className={`absolute top-0 left-0 w-auto h-auto lg:h-auto px-3 lg:px-[24px] pStyle normal-case after:content-none underline-offset-4 decoration-1 hover:underline transition-opacity duration-500 ${menuClosed ? "opacity-100" : "pointer-events-none! opacity-0"}`}
                onClick={() => setMenuClosed(false)}
              >
                {t("menu")}
              </Button>
            </div>

            {/* Logo, centred (columns 5–8 straddle the middle of 12), 24px
              tall; no pointing hand (the link variant's ::after) */}
            <Button
              variant="link"
              size="xs"
              className="col-start-5 col-span-4 justify-self-center text-sm tracking-[60%] flex items-center whitespace-nowrap h-6 lg:h-[24px] px-3 after:content-none font-baskervilleNeoText"
              asChild
            >
              <Link href="/" aria-label="L´Amour — La Mort">
                <Reveal on={intro} order={0} at={LOGO_AT}>
                  <NavLogo />
                </Reveal>
              </Link>
            </Button>

            {/* Log in, without the pointing hand */}
            {/* TODO: placeholder — no login page yet */}
            <Button
              variant="link"
              size="xs"
              className="col-start-9 hidden italic justify-self-start h-auto w-auto after:content-none"
            >
              <Reveal on={intro} order={2}>
                ( {t("subscribe")} )
              </Reveal>
            </Button>
            <Button
              variant="link"
              size="xs"
              // Cart: its item count in brackets, in Baskerville Neo, in the bar's
              // top-right corner
              className="col-start-12 w-auto justify-self-end h-6 lg:h-(--line) px-3 font-baskervilleNeoText normal-case text-sm after:content-none lg:text-lg lg:tracking-normal lg:leading-tight"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("openCart")}
            >
              <>
                <motion.span
                  key={totalItems}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  Cart{" "}
                  {/* The count in a small circle, raised. inline-flex: an
                    inline span ignores width and aspect-ratio */}
                  <span className="inline-flex align-super  text-[10px] leading-none tracking-normal ">
                    {totalItems}
                  </span>
                </motion.span>
              </>
            </Button>
          </div>
        </div>

        {/* ── HEADER (mobile): the logo top left; "Meny" and "Cart" side
            by side top right. On mobile's 21px lines: one line down
            (pt-[21px]), each item one line tall, the header three lines
            (63px) ── */}
        <div
          className={`relative flex lg:hidden justify-between items-start w-full shrink-0 h-[63px] px-3 pt-[21px] transition-colors duration-300 ${navOpen ? "bg-foreground" : "bg-background"}`}
        >
          {/* Logo, top left. No pointing hand (the link variant's ::after) */}
          <Button
            variant="link"
            size="xs"
            className="flex items-center justify-start px-3 border-none h-[21px] w-auto after:content-none"
            asChild
          >
            <Link href="/" aria-label="L´Amour — La Mort">
              <Reveal on={intro} order={0} at={LOGO_AT}>
                <NavLogo />
              </Reveal>
            </Link>
          </Button>

          {/* Top right: "Meny" (or "Stäng (x)"), then "Cart" with the item
              count raised (superscript), in pStyle; no pointing hands */}
          <div className="flex items-baseline">
            <Button
              variant="link"
              size="xs"
              className="w-auto h-[21px] px-3 pStyle normal-case whitespace-nowrap after:content-none"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
            >
              <Reveal on={intro} order={0}>
                {navOpen ? `${t("closeMenu")} (x)` : t("menu")}
              </Reveal>
            </Button>
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
                Cart{" "}
                <span className="inline-flex align-super text-[10px] leading-none tracking-normal">
                  {totalItems}
                </span>
              </motion.span>
            </Button>
          </div>
        </div>

        {/* ── NAV OVERLAY (mobile): the menu filling the screen (dark),
            the links in a column below "Meny", like the desktop menu ── */}
        <div
          className={`flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain lg:hidden ${navOpen ? "" : "hidden"}`}
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
