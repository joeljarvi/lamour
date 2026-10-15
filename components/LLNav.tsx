"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "./ui/button";
import NavDropdown, { exploreItems, type NavSection } from "./NavDropdown";

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

// Overlay buttons span the row with the label centred and the pointing hand
// (the link variant's ::after) pinned to the right edge
const OVERLAY_BUTTON_CLASS =
  "relative justify-center text-center after:absolute after:right-4 after:ml-0";
// Submenu rows: same, but the label is left-aligned
const SUBMENU_BUTTON_CLASS =
  "relative justify-start text-left after:absolute after:right-4 after:ml-0";

// Utforska with its submenu. Its open state lives here, so it starts
// collapsed each time the overlay opens (the overlay's list remounts this)
function ExploreItem({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [exploreOpen, setExploreOpen] = useState(false);

  return (
    <motion.li className="w-full" variants={ITEM_VARIANTS}>
      <Button
        variant="link"
        size="sm"
        className={OVERLAY_BUTTON_CLASS}
        aria-expanded={exploreOpen}
        onClick={() => setExploreOpen((v) => !v)}
      >
        {t("explore")}
      </Button>
      <AnimatePresence initial={false}>
        {exploreOpen && (
          <motion.ul
            className="list-none overflow-hidden py-3 pl-3 border-b border-b-neutral-500 mb-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {exploreItems(t, pathname, locale).map((item) => (
              <li key={item.key} className="w-full  ">
                {item.href ? (
                  <Button
                    variant="link"
                    size="sm"
                    className={SUBMENU_BUTTON_CLASS}
                    asChild
                  >
                    <Link
                      href={item.href}
                      locale={item.locale}
                      aria-current={
                        !item.locale && pathname === item.href
                          ? "page"
                          : undefined
                      }
                      onClick={onNavigate}
                    >
                      {item.label}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    className={SUBMENU_BUTTON_CLASS}
                  >
                    {item.label}
                  </Button>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

// Same items as the desktop bar: Affären and Artiklar go straight to their
// pages, Utforska opens a submenu with the desktop drop-down's explore links
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
          className="flex flex-col w-full justify-center items-center font-baskerville   py-0 mt-24 px-0 list-none gap-y-0"
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

          <ExploreItem onNavigate={close} />

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
      className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-colors duration-500
        ${navOpen ? "h-dvh bg-pergament" : "h-14 lg:h-auto"}`}
    >
      {/* ── DESKTOP: affären (col 1) · artiklar (col 3) · logo (centre) ·
          utforska (col 11) · cart ──
          Hovering Affären / Artiklar / Utforska drops its list down below
          the bar; leaving the bar + list area closes it */}
      <div className="hidden lg:block" onMouseLeave={() => setSection(null)}>
        {/* Bar turns yellow while a drop-down is open */}
        <div
          className={`grid grid-cols-12 gap-6 items-center h-24 px-12 pt-6 transition-colors duration-300 ${section ? "bg-pergament" : "bg-background"}`}
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
          <Link
            href="/"
            aria-label="L'Amour — La Mort"
            onMouseEnter={() => setSection(null)}
            className="col-start-5 col-span-4 justify-self-center flex items-center gap-3 font-baskervilleNeoDisplay text-xs uppercase tracking-[24%] whitespace-nowrap hover:opacity-60 transition-opacity"
          >
            L&apos;Amour
            <span
              aria-hidden
              className={`block shrink-0 bg-foreground transition-[width] duration-300 h-[0.5px] ${section ? "w-3" : "w-12"}`}
            />
            La Mort
          </Link>

          {/* Utforska: drop-down only, lists the remaining nav links */}
          <Button
            variant="link"
            size="xs"
            className={`col-start-11 justify-self-start h-auto w-auto ${DROPDOWN_HAND_CLASS}`}
            aria-expanded={section === "explore"}
            onMouseEnter={() => setSection("explore")}
            onFocus={() => setSection("explore")}
          >
            {t("explore")}
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
        className={`relative grid grid-cols-4 lg:hidden items-start w-full shrink-0   h-16 lg:h-24 px-0 lg:px-3.5 pt-0 transition-colors duration-300 ${navOpen ? "bg-pergament" : "bg-pergament"}`}
      >
        {/* Menu toggle — mobile only, fixed at the bottom centre of the screen */}
        <Button
          onClick={() => setNavOpen((v) => !v)}
          variant="link"
          className="lg:hidden fixed z-50 left-1/2 -translate-x-1/2 bottom-[max(1.5rem,env(safe-area-inset-bottom))] h-12 px-4 w-auto justify-center text-center items-center font-baskervilleNeoDisplay normal-case border border-neutral-300 bg-pergament  text-sm gap-x-0 after:content-none"
          aria-label="Menu"
          aria-expanded={navOpen}
        >
          [<span className="">{navOpen ? "x" : "menu"}</span>]
        </Button>

        {/* Logo — middle two columns (mobile header) */}
        <Link
          href="/"
          className="col-start-2 col-span-2 lg:col-span-1 justify-self-stretch lg:justify-self-center flex items-center justify-center h-16 lg:h-24 font-baskervilleNeoDisplay text-sm uppercase tracking-[24%] gap-3 
       
          hover:opacity-60 transition-opacity whitespace-nowrap"
        >
          L'Amour
          {/* Dash between the names — widens while the menu is open */}
          <span
            aria-hidden
            className={`block shrink-0 bg-foreground transition-[width] duration-300 h-[0.5px] mt-0 ${navOpen ? "w-3" : "w-12"}`}
          />
          La Mort
        </Link>

        {/* Cart — mobile only, last column */}
        <Button
          variant="link"
          className="col-start-4 h-16 aspect-square w-auto text-sm font-baskervilleNeoDisplay  normal-case tracking-[24%] gap-x-2  justify-self-end after:content-none lg:hidden"
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
