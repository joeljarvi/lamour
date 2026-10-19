"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "./ui/button";
import NavDropdown, { type NavSection } from "./NavDropdown";

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
  "relative justify-start text-left after:absolute after:right-4 after:ml-0 border-b border-b-neutral-400";

// Affären and Artiklar go straight to their pages, then Om oss, Logga in and
// the cart
function NavOverlay({
  navOpen,
  setNavOpen,
}: {
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
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
          className="flex flex-col w-full justify-center items-center font-baskerville   py-0 mt-24 px-6 list-none gap-y-0"
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

// Drop-down triggers: the link variant's ☜ (current page / hover) rotates a
// quarter turn to point down (☟) while the trigger's drop-down is open
const DROPDOWN_HAND_CLASS =
  "after:inline-block after:transition-all after:duration-300 aria-expanded:after:-rotate-90";

export default function LLNav() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  // Desktop: issue list dropped down while hovering Nummer
  // Which desktop drop-down section is open (on hover)
  const [section, setSection] = useState<NavSection | null>(null);
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

  return (
    <motion.div
      className={`fixed top-3 left-3 right-3 z-50 flex flex-col transition-colors duration-500
        ${navOpen ? "h-dvh bg-pergament" : "bg-background h-12 lg:h-auto"}`}
    >
      {/* ── DESKTOP: affären (col 1) · artiklar (col 3) · logo (centre) ·
          filter (col 11) · cart ──
          Hovering Affären / Artiklar drops its list down below the bar;
          leaving the bar + list area closes it */}
      <div className="hidden lg:block" onMouseLeave={() => setSection(null)}>
        {/* Bar turns yellow while a drop-down is open */}
        <div
          className={`grid grid-cols-12 gap-6 items-center h-auto px-3 py-3 transition-colors duration-300 border-b border-b-neutral-400  ${section ? "bg-pergament" : "bg-background"}`}
        >
          {/* Affären and Artiklar: link to their page, hover opens the
              drop-down. The link variant's ☜ marks the current page and
              turns to point down while the drop-down is open */}
          {(
            [
              {
                key: "issues",
                label: t("shop"),
                href: "/",
                col: "col-start-1",
              },
              {
                key: "articles",
                label: t("articles"),
                href: "/articles",
                col: "col-start-3",
              },
            ] as const
          ).map(({ key, label, href, col }) => (
            <Button
              key={key}
              variant="link"
              size="xs"
              className={`${col} h-auto w-auto justify-self-start ${DROPDOWN_HAND_CLASS}`}
              asChild
            >
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                aria-expanded={section === key}
                onMouseEnter={() => setSection(key)}
                onFocus={() => setSection(key)}
              >
                {label}
              </Link>
            </Button>
          ))}

          {/* Logo, centred (columns 5–8 straddle the middle of 12); the dash
              shrinks while a drop-down is open */}
          <Button
            variant="link"
            size="xs"
            className="col-start-5 col-span-4 justify-self-center flex items-center  whitespace-nowrap h-auto"
            asChild
          >
            <Link
              href="/"
              aria-label="L'Amour — La Mort"
              onMouseEnter={() => setSection(null)}
            >
              L&apos;Amour — La Mort
            </Link>
          </Button>

          {/* Filter (replaces Utforska on desktop; the mobile overlay keeps
              Utforska). Hovering it closes any open drop-down */}
          {/* TODO: placeholder — doesn't filter anything yet */}
          <Button
            variant="link"
            size="xs"
            className="col-start-11 justify-self-start h-auto w-auto"
            onMouseEnter={() => setSection(null)}
          >
            {t("filter")}
          </Button>
          <Button
            variant="link"
            size="xs"
            // Cart is just its item count, in the bar's top-right corner
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
              {totalItems}
            </motion.span>
          </Button>
        </div>
        <NavDropdown section={section} onNavigate={() => setSection(null)} />
      </div>

      {/* ── HEADER ── */}
      <div
        className={`relative flex lg:hidden justify-between  items-start w-full shrink-0   h-12 px-0 lg:px-3.5 pt-0 transition-colors duration-300 ${navOpen ? "bg-pergament" : "bg-background"}`}
      >
        {/* Menu toggle — mobile only, square, top left: three thin
            horizontal lines that animate into an X while the menu is open
            (outer lines meet in the middle and turn ±45°, the middle one
            fades, and the X's lines shorten from 24px to 16px) */}
        <Button
          onClick={() => setNavOpen((v) => !v)}
          variant="link"
          className="lg:hidden h-12 w-12  aspect-square px-0 justify-center items-center after:content-none"
          aria-label={t("menu")}
          aria-expanded={navOpen}
        >
          <span
            aria-hidden
            className="flex flex-col items-center gap-[4px] pb-0"
          >
            {[
              "w-4 translate-y-[4.5px] rotate-45",
              "opacity-0",
              "w-4 -translate-y-[4.5px] -rotate-45",
            ].map((open, i) => (
              <span
                key={i}
                className={`block h-[0.5px] bg-foreground transition-all duration-300 ease-out ${navOpen ? open : "w-6"}`}
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
          className={`flex items-center justify-center px-3 h-12 w-auto after:content-none ${navOpen ? "italic" : ""}`}
          asChild
        >
          <Link href="/">L&apos;Amour — La Mort</Link>
        </Button>

        {/* Cart — mobile only, last column */}
        <Button
          variant="link"
          className=" h-12 aspect-square w-auto   justify-self-end after:content-none lg:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label={t("openCart")}
        >
          <motion.span
            key={totalItems}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {totalItems}
          </motion.span>
        </Button>
      </div>

      {/* ── NAV OVERLAY (mobile) ── */}
      <div
        className={`flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain lg:hidden ${navOpen ? "" : "hidden"}`}
      >
        <NavOverlay navOpen={navOpen} setNavOpen={setNavOpen} />
      </div>
    </motion.div>
  );
}
