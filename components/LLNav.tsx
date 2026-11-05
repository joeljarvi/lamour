"use client";

import { useState, useEffect } from "react";
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

// All the navbar's text (and the menu button's lines): light
// (text-background), blended with mix-blend-difference, so it shows
// inverted against whatever is behind it
const NAV_TEXT =
  "[&_a]:text-background [&_button]:text-background [&_a]:mix-blend-difference [&_button]:mix-blend-difference";

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

// The navbar's title, word by word, first of all (LOGO_AT), with the
// spaces between the words
function RevealWords({ on, text }: { on: boolean; text: string }) {
  return text.split(" ").map((word, i, words) => (
    <Reveal key={i} on={on} order={i} at={LOGO_AT}>
      {i < words.length - 1 ? `${word} ` : word}
    </Reveal>
  ));
}

/* ─── NAV OVERLAY ─── */

// Overlay buttons (and the submenu's rows) span the row with the label
// left-aligned and the pointing hand (the link variant's ::after) pinned to
// the right edge (on desktop, 12px after the label instead). Light text
// blended with mix-blend-difference, on the dark overlay. Dotted lines between the rows; Baskerville Neo Display,
// text-sm, on desktop
const OVERLAY_BUTTON_CLASS =
  "relative justify-start text-left px-6 text-background mix-blend-difference after:absolute after:right-4 after:ml-0 lg:after:static lg:after:ml-3  font-baskervilleNeoText lg:text-sm";

// Affären and Artiklar go straight to their pages, then Om oss (no page
// yet), Prenumerera and the cart
// `desktop`: a dark (bg-foreground) panel the screen's full width (as tall as its
// content, at most the screen), the links in a column on the left. Fixed
// below the navbar's items, sliding down from the top (and back up when
// closed). On mobile: the rows straight inside the full-screen overlay
function NavOverlay({
  navOpen,
  setNavOpen,
  desktop = false,
}: {
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
  desktop?: boolean;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { totalItems, setDrawerOpen } = useCart();

  const close = () => setNavOpen(false);

  const pageLinks = [
    { label: t("shop"), href: "/" },
    { label: t("articles"), href: "/articles" },
  ];

  return (
    <AnimatePresence>
      {navOpen && (
        <motion.div
          key="nav-overlay"
          className={
            desktop
              ? "fixed top-0 left-0 z-89 max-h-dvh w-full overflow-y-auto overscroll-contain bg-foreground"
              : "w-full"
          }
          initial={desktop ? { y: "-100%" } : false}
          animate={{ y: 0 }}
          exit={desktop ? { y: "-100%" } : undefined}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          <motion.ul
            className={`flex flex-col lg:items-start w-full justify-center items-center font-baskerville bg-transparent py-0 lg:pt-18 lg:pb-6 mt-24 lg:mt-0 px-0 list-none gap-y-0`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {pageLinks.map(({ label, href }) => (
              <motion.li key={href} className="w-full" variants={ITEM_VARIANTS}>
                <Button
                  variant="link"
                  size="sm"
                  className={OVERLAY_BUTTON_CLASS}
                  asChild
                >
                  <Link
                    href={href}
                    aria-current={isActive(pathname, href) ? "page" : undefined}
                    onClick={close}
                  >
                    {label}
                  </Link>
                </Button>
              </motion.li>
            ))}

            {/* TODO: no about page yet — link it once it exists */}
            <motion.li className="w-full" variants={ITEM_VARIANTS}>
              <Button variant="link" size="sm" className={OVERLAY_BUTTON_CLASS}>
                {t("about")}
              </Button>
            </motion.li>

            <motion.li className="w-full" variants={ITEM_VARIANTS}>
              <Button
                variant="link"
                size="sm"
                className={OVERLAY_BUTTON_CLASS}
                asChild
              >
                <Link
                  href="/subscribe"
                  aria-current={
                    isActive(pathname, "/subscribe") ? "page" : undefined
                  }
                  onClick={close}
                >
                  {t("subscribe")}
                </Link>
              </Button>
            </motion.li>

            <motion.li className="w-full" variants={ITEM_VARIANTS}>
              <Button
                variant="link"
                size="sm"
                // The cart opens a drawer, not a page: no pointing hand
                className={`${OVERLAY_BUTTON_CLASS} after:content-none`}
                onClick={() => {
                  close();
                  setDrawerOpen(true);
                }}
              >
                {t("cart", { count: totalItems })}
              </Button>
            </motion.li>
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
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
        // Closed: a solid bar (bg-background).
        // Open: dark (bg-foreground), filling the screen on mobile; on
        // desktop just the bar (the menu slides in as its own panel). Its
        // text light and blended (NAV_TEXT), so it inverts against either.
        // The same on every page.
        // z-90: above the issue modal (z-70 / z-80), which opens beneath it
        className={`fixed top-0 lg:top-0 left-0 right-0 lg:pt-3 lg:px-3  z-90 flex flex-col transition-colors duration-500
        ${NAV_TEXT} ${navOpen ? "h-dvh bg-foreground lg:h-14" : "bg-background h-16 lg:h-14"}`}
      >
        {/* ── DESKTOP: menu (col 1) · logo (centre) · cart ── */}
        <div className="hidden lg:block">
          {/* Menu, logo and cart all 36px tall (h-9) and on one baseline
              (items-baseline), whatever their font */}
          <div
            className={`grid grid-cols-12 gap-0 items-baseline h-auto bg-transparent`}
          >
            {/* Menu: opens and closes the overlay with the nav links, in
              John Sans; no pointing hand */}
            <Button
              variant="link"
              size="xs"
              className="col-start-1 col-span-2 w-auto justify-self-start font-johnSans tracking-[48%] text-xs h-9 px-3 after:content-none"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
            >
              <Reveal on={intro} order={0}>
                {navOpen ? t("closeMenu") : t("menu")}
              </Reveal>
            </Button>

            {/* Logo, centred (columns 5–8 straddle the middle of 12); no
              pointing hand (the link variant's ::after) */}
            <Button
              variant="link"
              size="xs"
              // Baskerville Neo Display; while the menu is open Baskerville
              // Neo Text (upright, no swashes)
              className={`col-start-5 col-span-4 justify-self-center text-sm tracking-[60%] flex items-center whitespace-nowrap h-9 px-3 after:content-none ${navOpen ? "font-baskervilleNeoText" : "font-baskervilleNeoDisplay"}`}
              asChild
            >
              <Link href="/" aria-label="L´Amour — La Mort">
                <RevealWords on={intro} text="L'Amour — La Mort" />
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
              className="col-start-12 w-auto justify-self-end h-9 px-3 font-baskervilleNeoDisplay text-sm after:content-none"
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
                  {totalItems}
                </motion.span>
              </Reveal>
            </Button>
          </div>
        </div>

        {/* ── HEADER ── */}
        <div
          className={`relative flex lg:hidden justify-between   items-start w-full shrink-0   h-16 px-0 lg:px-3.5 pt-0 transition-colors duration-300 ${navOpen ? "bg-foreground" : "bg-transparent"}`}
        >
          {/* Menu toggle — mobile only, square, top left: three thin
            horizontal lines that animate into an X while the menu is open
            (outer lines meet in the middle and turn ±45°, the middle one
            fades, and the X's lines shorten from 24px to 16px) */}
          <Button
            onClick={() => setNavOpen((v) => !v)}
            variant="link"
            className="lg:hidden h-16 w-16 lg:h-12 bg-transparent    aspect-square px-0 justify-center items-center after:content-none"
            aria-label={t("menu")}
            aria-expanded={navOpen}
          >
            <Reveal on={intro} order={0}>
              <span
                aria-hidden
                className="flex flex-col items-center gap-[4px] pb-0"
              >
                {[
                  "w-3 translate-y-[4.5px] rotate-45",
                  "opacity-0",
                  "w-3 -translate-y-[4.5px] -rotate-45",
                ].map((open, i) => (
                  <span
                    key={i}
                    className={`block h-[0.5px] transition-all duration-300 ease-out bg-background ${navOpen ? open : "w-6"}`}
                  />
                ))}
              </span>
            </Reveal>
          </Button>

          {/* Logo — middle two columns (mobile header). No pointing hand (the
            link variant's ::after) */}
          <Button
            variant="link"
            size="xs"
            className={`flex items-center justify-center px-3 border-none h-16 lg:h-12 w-auto after:content-none`}
            asChild
          >
            <Link href="/">
              <RevealWords on={intro} text="L'Amour — La Mort" />
            </Link>
          </Button>

          {/* Cart — mobile only, last column: the item count, centred in
              the square (no padding or letter-spacing: the size's tracking
              adds space after the ")", pushing it off centre) */}
          <Button
            variant="link"
            className={`h-16 w-16  lg:h-12 p-0 tracking-normal leading-none flex justify-center items-center after:content-none lg:hidden`}
            onClick={() => setDrawerOpen(true)}
            aria-label={t("openCart")}
          >
            <Reveal on={intro} order={1}>
              <motion.span
                key={totalItems}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {totalItems}
              </motion.span>
            </Reveal>
          </Button>
        </div>

        {/* ── NAV OVERLAY (mobile): the menu filling the screen ── */}
        <div
          className={`flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain lg:hidden ${navOpen ? "" : "hidden"}`}
        >
          <NavOverlay navOpen={navOpen} setNavOpen={setNavOpen} />
        </div>
      </motion.div>

      {/* ── NAV OVERLAY (desktop): a panel sliding down from the top, below
          the navbar's items (z-89, under the nav's z-90). Outside the nav,
          so the nav's blend doesn't apply to it ── */}
      <div className="hidden lg:block">
        <NavOverlay navOpen={navOpen} setNavOpen={setNavOpen} desktop />
      </div>
    </>
  );
}
