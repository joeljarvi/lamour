"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "./ui/button";

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

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

/* ─── NAV OVERLAY (mobile) ─── */

// Overlay buttons (and the submenu's rows) span the row with the label
// left-aligned and the pointing hand (the link variant's ::after) pinned to
// the right edge
const OVERLAY_BUTTON_CLASS =
  "relative justify-start text-left text-foreground after:absolute after:right-4 after:ml-0 border-b border-b-neutral-400";

// Affären and Artiklar go straight to their pages, then Om oss, Logga in and
// the cart
function NavOverlay({
  navOpen,
  setNavOpen,
  inverted,
}: {
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
  // Articles page: on the nav's dark background (bg-foreground) instead
  // of pergament, its text taking the nav's light colour
  inverted: boolean;
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
        <motion.ul
          className={`flex flex-col w-full justify-center items-center font-baskerville ${inverted ? "bg-transparent" : "bg-pergament"}   py-0 mt-24 px-3 list-none gap-y-0`}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {pageLinks.map(({ label, href }) => (
            <motion.li key={href} className="w-full " variants={ITEM_VARIANTS}>
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

          {/* TODO: no about / login pages yet — link them once they exist */}
          {[t("about"), t("login")].map((label) => (
            <motion.li key={label} className="w-full" variants={ITEM_VARIANTS}>
              <Button variant="link" size="sm" className={OVERLAY_BUTTON_CLASS}>
                {label}
              </Button>
            </motion.li>
          ))}

          <motion.li className="w-full" variants={ITEM_VARIANTS}>
            <Button
              variant="link"
              size="sm"
              className={OVERLAY_BUTTON_CLASS}
              onClick={() => {
                close();
                setDrawerOpen(true);
              }}
            >
              {t("cart", { count: totalItems })}
            </Button>
          </motion.li>
        </motion.ul>
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

  const lamourText = useTypingAnimation("L'Amour", scrolled);
  const lamortText = useTypingAnimation("La Mort", scrolled);

  if (pathname.startsWith("/studio") || pathname.startsWith("/articles/"))
    return null;

  // The articles page has its own colours (no blend; see below)
  const onArticles = pathname === "/articles";

  return (
    <>
      <motion.div
        // Closed: transparent, its white items blended with
        // mix-blend-difference so they show inverted over the page. Open: a
        // solid pergament overlay without the blend (white on pergament would
        // vanish), its items dark instead
        // z-90: above the issue modal (z-70 / z-80), which opens beneath it
        //
        // Articles page instead: its items in the nav's own text colour
        // ([&_a]/[&_button]:text-inherit, over the link variant's white) —
        // no blend; dark with light text, from the top of the page and while
        // open (the overlay shares it)
        className={`fixed top-0 left-0 right-0 lg:pt-3 lg:px-3  z-90 flex flex-col transition-colors duration-500
        ${
          onArticles
            ? `[&_a]:text-inherit [&_button]:text-inherit ${
                navOpen
                  ? "h-dvh bg-foreground text-background"
                  : "h-16 lg:h-14 bg-foreground text-background"
              }`
            : navOpen
              ? "h-dvh bg-pergament"
              : "mix-blend-difference bg-transparent h-16 lg:h-14"
        }`}
      >
        {/* ── DESKTOP: affären (col 1) · artiklar (col 3) · logo (centre) ·
          log in (col 9) · cart ── */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-0 items-center h-auto bg-transparent  ">
            {/* Affären and Artiklar: link to their page. The link variant's ☜
              marks the current page */}
            {(
              [
                {
                  key: "issues",
                  label: t("shop"),
                  href: "/",
                  col: "col-start-1 col-span-2",
                },
                {
                  key: "articles",
                  label: t("articles"),
                  href: "/articles",
                  col: "col-start-3 col-span-2",
                },
              ] as const
            ).map(({ key, label, href, col }) => (
              <Button
                key={key}
                variant="link"
                size="xs"
                className={`${col}  w-full justify-start justify-self-start  h-9 px-3`}
                asChild
              >
                <Link
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                >
                  {label}
                </Link>
              </Button>
            ))}

            {/* Logo, centred (columns 5–8 straddle the middle of 12); no
              pointing hand (the link variant's ::after) */}
            <Button
              variant="link"
              size="xs"
              className="col-start-5 col-span-4 justify-self-center flex items-center whitespace-nowrap h-auto after:content-none"
              asChild
            >
              <Link href="/" aria-label="L'Amour — La Mort">
                L&apos;Amour — La Mort
              </Link>
            </Button>

            {/* Log in, without the pointing hand */}
            {/* TODO: placeholder — no login page yet */}
            <Button
              variant="link"
              size="xs"
              className="col-start-9 italic justify-self-start h-auto w-auto after:content-none"
            >
              ( {t("subscribe")} )
            </Button>
            <Button
              variant="link"
              size="xs"
              // Cart: "Korg" and its item count, in the bar's top-right corner
              className="col-start-12 w-auto justify-self-end self-center h-auto after:content-none"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("openCart")}
            >
              <motion.span
                key={totalItems}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {t("cartWord")} ({totalItems})
              </motion.span>
            </Button>
          </div>
        </div>

        {/* ── HEADER ── */}
        <div
          className={`relative flex lg:hidden justify-between   items-start w-full shrink-0   h-16 px-0 lg:px-3.5 pt-0 transition-colors duration-300 ${navOpen && !onArticles ? "bg-pergament" : "bg-transparent"}`}
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
                  // In the nav's text colour on the articles page
                  className={`block h-[0.5px] transition-all duration-300 ease-out ${onArticles ? "bg-current" : navOpen ? "bg-foreground" : "bg-background"} ${navOpen ? open : "w-6"}`}
                />
              ))}
            </span>
          </Button>

          {/* Logo — middle two columns (mobile header). Italic while the menu
            is open, with Baskerville Neo's swashes (.italic turns on "swsh"
            in globals.css). No pointing hand (the link variant's ::after) */}
          <Button
            variant="link"
            size="xs"
            className={`flex items-center justify-center px-3 border-none h-16 lg:h-12 w-auto after:content-none ${navOpen ? "italic text-foreground" : ""}`}
            asChild
          >
            <Link href="/">L&apos;Amour — La Mort</Link>
          </Button>

          {/* Cart — mobile only, last column: the item count, centred in
              the square (no padding or letter-spacing: the size's tracking
              adds space after the ")", pushing it off centre) */}
          <Button
            variant="link"
            className={`h-16 w-16  lg:h-12 p-0 tracking-normal leading-none flex justify-center items-center after:content-none lg:hidden ${navOpen ? "text-foreground" : ""}`}
            onClick={() => setDrawerOpen(true)}
            aria-label={t("openCart")}
          >
            <motion.span
              key={totalItems}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              ( {totalItems} )
            </motion.span>
          </Button>
        </div>

        {/* ── NAV OVERLAY (mobile) ── */}
        <div
          className={`flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain lg:hidden ${navOpen ? "" : "hidden"}`}
        >
          <NavOverlay
            navOpen={navOpen}
            setNavOpen={setNavOpen}
            inverted={onArticles}
          />
        </div>
      </motion.div>
    </>
  );
}
