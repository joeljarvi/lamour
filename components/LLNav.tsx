"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "./ui/button";
import NavDropdown, { exploreItems, type NavSection } from "./NavDropdown";
import { HERO_INTRO_MS } from "@/lib/heroIntro";

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

// "/" only matches the home page; other links also match their sub-pages
function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
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

// Same items as the desktop bar: Nummer and Artiklar go straight to their
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
    { label: t("home"), href: "/" },
    { label: t("issues"), href: "/shop" },
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

          {/* TODO: no subscribe page or accounts yet — wire up once they exist */}
          {[t("subscribe"), t("login")].map((label) => (
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

  // A visit that starts on the home page waits for the hero intro to finish
  // before the nav fades in (mobile and desktop); any other entry page shows
  // it straight away. (Read once on first render — the nav stays mounted
  // across pages)
  const [introOnLoad] = useState(() => pathname === "/");

  if (pathname.startsWith("/studio") || pathname.startsWith("/articles/"))
    return null;

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-colors duration-500
        ${navOpen ? "h-dvh bg-pergament" : "h-14 lg:h-auto"}`}
      initial={introOnLoad ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: introOnLoad ? HERO_INTRO_MS / 1000 : 0,
      }}
    >
      {/* ── DESKTOP: home (col 1) · nummer (col 3) · artiklar (col 6) · cart ──
          Hovering Nummer drops the issue list down below the bar; leaving
          the bar + list area closes it */}
      <div className="hidden lg:block" onMouseLeave={() => setSection(null)}>
        {/* Bottom border shows (in foreground colour) while a drop-down is open */}
        {/* Bar turns yellow while a drop-down is open */}
        <div
          className={`grid grid-cols-12 gap-6 items-center h-24 px-12 pt-12 transition-colors duration-300 ${section ? "bg-pergament" : "bg-background"}`}
        >
          <Button
            variant="link"
            size="xs"
            className="col-start-1  h-auto w-auto justify-self-start "
            asChild
          >
            <Link
              href="/"
              aria-current={isActive(pathname, "/") ? "page" : undefined}
              onMouseEnter={() => setSection(null)}
            >
              {t("home")}
            </Link>
          </Button>
          <Button
            variant="link"
            size="xs"
            className="col-start-2  h-auto w-auto justify-self-start"
            asChild
          >
            <Link
              href="/shop"
              aria-current={isActive(pathname, "/shop") ? "page" : undefined}
              aria-expanded={section === "issues"}
              onMouseEnter={() => setSection("issues")}
              onFocus={() => setSection("issues")}
            >
              {t("issues")}
            </Link>
          </Button>
          <Button
            variant="link"
            size="xs"
            className="col-start-4 w-auto h-auto justify-self-start"
            asChild
          >
            <Link
              href="/articles"
              aria-current={
                isActive(pathname, "/articles") ? "page" : undefined
              }
              aria-expanded={section === "articles"}
              onMouseEnter={() => setSection("articles")}
              onFocus={() => setSection("articles")}
            >
              {t("articles")}
            </Link>
          </Button>
          {/* Utforska: centred (columns 6–7 straddle the middle of 12); drop-down
              only, lists the remaining nav links */}
          <Button
            variant="link"
            size="xs"
            // Centred in the bar and the label centred in the button: no ☜
            // (after:hidden frees its reserved space) and the hand hangs
            // outside the label instead of taking up width
            className="relative col-start-6 col-span-2 justify-self-center h-auto w-auto gap-x-3 flex justify-center text-center after:hidden"
            aria-expanded={section === "explore"}
            onMouseEnter={() => setSection("explore")}
            onFocus={() => setSection("explore")}
          >
            {t("explore")}
            {/* Baskerville Neo's north-east pointing hand (U+E000 in the
                hands font, see globals.css) */}
            <span
              aria-hidden
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 font-hands"
            >
              {"\uE000"}
            </span>
          </Button>
          {/* TODO: no subscribe page yet — link it once it exists */}
          <Button
            variant="link"
            size="xs"
            className="col-start-9 w-auto h-auto justify-self-start"
            onMouseEnter={() => setSection(null)}
          >
            {t("subscribe")}
          </Button>
          <Button
            variant="link"
            size="xs"
            className="col-start-11 w-auto h-auto justify-self-start"
            onMouseEnter={() => setSection(null)}
          >
            {t("login")}
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
