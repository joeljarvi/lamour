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

// The navbar's text colour: light (text-background) while it's over the
// home page's hero (its image or video), dark (text-foreground) once past
// it and on every other page. Light too on mobile while the menu is open
// (the full-screen menu is dark)
function navText(overHero: boolean, navOpen: boolean) {
  return [
    "[&_a]:transition-colors [&_button]:transition-colors [&_a]:duration-300 [&_button]:duration-300",
    overHero
      ? "[&_a]:text-background [&_button]:text-background"
      : "[&_a]:text-foreground [&_button]:text-foreground",
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
// The files' viewBoxes are cropped to the letters. Two to try:
// "Lamour kursiv" (italic, the default) and "Lamour svart" (upright
// capitals, while the menu is open)
const LOGOS = {
  kursiv: {
    src: "/logo/lamour-kursiv-letters.svg",
    className: "h-4 aspect-[108.5/13.5]",
  },
  svart: {
    src: "/logo/lamour-svart-letters.svg",
    // Capitals only: 12px, about text-sm's capitals
    className: "h-3 aspect-[212/15.5]",
  },
} as const;

function NavLogo({ menuOpen }: { menuOpen: boolean }) {
  const LOGO = menuOpen ? LOGOS.svart : LOGOS.kursiv;
  return (
    <span
      aria-hidden
      className={`block bg-current ${LOGO.className}`}
      style={{
        maskImage: `url(${LOGO.src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url(${LOGO.src})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
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
function NavLinks({
  pathname,
  close,
}: {
  pathname: string;
  close: () => void;
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
      {[
        { label: t("shop"), href: "/" },
        { label: t("articles"), href: "/articles" },
        // TODO: no about page yet — link it once it exists
        { label: t("about"), href: null },
        { label: t("subscribe"), href: "/subscribe" },
      ].map(({ label, href }) => (
        <motion.li key={label} variants={ITEM_VARIANTS}>
          <Button
            variant="link"
            size="xs"
            className="w-auto h-6 lg:h-6 px-3 font-baskervilleNeoText text-sm normal-case tracking-wide whitespace-nowrap after:ml-3"
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
        </motion.li>
      ))}
    </motion.ul>
  );
}

/* ─── MAIN NAV ─── */

export default function LLNav() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
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

  // Whether the navbar is over the home page's hero (the section with
  // id="hero"): until the hero's bottom edge scrolls up past the bar
  const [overHero, setOverHero] = useState(false);
  useEffect(() => {
    // Looked up each time: the hero is only on the home page
    const update = () => {
      const hero = document.getElementById("hero");
      const barHeight = barRef.current?.getBoundingClientRect().height ?? 0;
      setOverHero(
        !!hero && hero.getBoundingClientRect().bottom > barHeight / 2,
      );
    };
    // After the new page has rendered
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

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
        // z-90: below the issue page (z-95), which covers it, and the cart (z-100)
        className={`fixed top-0 lg:top-0 left-0 right-0 lg:pt-3 lg:px-3  z-90 flex flex-col transition-colors duration-500
        ${navText(overHero, navOpen)} ${navOpen ? "h-dvh bg-foreground lg:h-auto lg:bg-transparent" : "bg-transparent h-16 lg:h-auto"}`}
      >
        {/* ── DESKTOP: nav links (col 1) · logo (centre) · cart ── */}
        <div className="hidden lg:block">
          {/* The links' column, logo and cart along the top (items-start) */}
          <div
            className={`grid grid-cols-12 gap-0 items-start h-auto bg-transparent`}
          >
            {/* "Meny" (Baskerville Neo Text, text-sm, normal case; no
              pointing hand), opening and closing the nav links just below
              it in a column, in the bar itself (no overlay). The links get
              the pointing hand (☜) on hover and for the current page; one
              click closes the menu */}
            <nav className="col-start-1 col-span-2 justify-self-start flex flex-col items-start">
              <Button
                variant="link"
                size="xs"
                className="w-auto h-6 lg:h-6 px-3 font-baskervilleNeoText text-sm normal-case tracking-wide whitespace-nowrap after:content-none"
                onClick={() => setNavOpen((v) => !v)}
                aria-expanded={navOpen}
              >
                <Reveal on={intro} order={0}>
                  {navOpen ? `${t("closeMenu")} (x)` : t("menu")}
                </Reveal>
              </Button>
              <AnimatePresence>
                {navOpen && (
                  <NavLinks
                    key="desktop-links"
                    pathname={pathname}
                    close={() => setNavOpen(false)}
                  />
                )}
              </AnimatePresence>
            </nav>

            {/* Logo, centred (columns 5–8 straddle the middle of 12); no
              pointing hand (the link variant's ::after) */}
            <Button
              variant="link"
              size="xs"
              // Baskerville Neo Display; while the menu is open Baskerville
              // Neo Text (upright, no swashes)
              className={`col-start-5 col-span-4 justify-self-center text-sm tracking-[60%] flex items-center whitespace-nowrap h-6 lg:h-6 px-3 after:content-none ${navOpen ? "font-baskervilleNeoText" : "font-baskervilleNeoText"}`}
              asChild
            >
              <Link href="/" aria-label="L´Amour — La Mort">
                <Reveal on={intro} order={0} at={LOGO_AT}>
                  <NavLogo menuOpen={navOpen} />
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
              className="col-start-12 w-auto justify-self-end h-6 lg:h-6 px-3 font-baskervilleNeoDisplay normal-case tracking-wide text-sm after:content-none"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("openCart")}
            >
              <Reveal on={intro} order={3}>
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
              </Reveal>
            </Button>
          </div>
        </div>

        {/* ── HEADER ── */}
        <div
          className={`relative flex lg:hidden justify-start items-start w-full shrink-0 h-16 px-0 lg:px-3.5 pt-0 transition-colors duration-300 ${navOpen ? "bg-foreground" : "bg-transparent"}`}
        >
          {/* Menu and, below it, the cart (just its item count), top
            left, like the desktop menu button (Baskerville Neo Text, normal
            case, wide spacing); no pointing hands */}
          <div className="flex flex-col items-start pt-3">
            <Button
              variant="link"
              size="xs"
              className="w-auto h-6 px-3 font-baskervilleNeoText text-xs normal-case tracking-wide whitespace-nowrap after:content-none"
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
              className="w-auto h-6 px-3 font-baskervilleNeoText text-sm normal-case tracking-wide after:content-none"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("openCart")}
            >
              <Reveal on={intro} order={1}>
                <motion.span
                  key={totalItems}
                  className="inline-block"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {totalItems}
                </motion.span>
              </Reveal>
            </Button>
          </div>

          {/* Logo, centred on the header (absolute, so the menu and cart
            beside it don't move it). No pointing hand (the
            link variant's ::after) */}
          <Button
            variant="link"
            size="xs"
            className={`absolute left-1/2 top-0 -translate-x-1/2 flex items-center justify-center px-3 border-none h-12 w-auto after:content-none`}
            asChild
          >
            <Link href="/" aria-label="L´Amour — La Mort">
              <Reveal on={intro} order={0} at={LOGO_AT}>
                <NavLogo menuOpen={navOpen} />
              </Reveal>
            </Link>
          </Button>
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
