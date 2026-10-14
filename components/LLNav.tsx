"use client";

import { Fragment, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "./ui/button";
import NavDropdown, { type NavSection } from "./NavDropdown";
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

// Language switch labels, in display order
const LANGUAGES: { locale: Locale; label: string }[] = [
  { locale: "sv", label: "SV" },
  { locale: "en", label: "EN" },
];

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

/* ─── NAV OVERLAY (shared mobile + desktop) ─── */

function NavOverlay({
  navOpen,
  setNavOpen,
}: {
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <AnimatePresence>
      {navOpen && (
        <motion.ul
          className="flex flex-col w-full justify-start items-start font-baskerville   py-0 mt-24 px-0 list-none gap-y-0"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {[
            { label: t("allIssues"), href: "/shop" },
            { label: t("allArticles"), href: "/articles" },
            { label: t("about"), href: "/" },
            { label: t("subscribe"), href: "/" },
            { label: t("contact"), href: "/" },
            { label: t("nextIssue"), href: "/" },
          ].map(({ label, href }) => (
            <motion.li key={label} className="w-full" variants={ITEM_VARIANTS}>
              <Button
                variant="link"
                size="lg"
                className="aria-[current=page]:pl-12"
                asChild
              >
                <Link
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  {label}
                </Link>
              </Button>
            </motion.li>
          ))}

          <motion.li
            className="w-full flex items-baseline justify-start gap-8 p-4"
            variants={ITEM_VARIANTS}
          >
            {LANGUAGES.map(({ locale: l, label }, i) => (
              <Fragment key={l}>
                {i > 0 && "/"}
                <Button variant="link" size="sm" className="w-min" asChild>
                  <Link
                    href={pathname}
                    locale={l}
                    aria-current={l === locale ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                  >
                    {label}
                  </Link>
                </Button>
              </Fragment>
            ))}
          </motion.li>

          <motion.li className="w-full px-4" variants={ITEM_VARIANTS}>
            {/* TODO: no accounts yet — wire up when login exists */}
            <Button variant="link" size="sm">
              {t("login")}
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
        ${navOpen ? "h-dvh bg-yellow-50" : "h-14 lg:h-auto"}`}
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
        <div className="grid grid-cols-12 gap-6 items-center h-12 px-12 pt-12 bg-background">
          <Button
            variant="link"
            size="xs"
            className="col-start-1 h-auto w-auto justify-self-start "
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
            className="col-start-2 h-auto w-auto justify-self-start"
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
              className="absolute left-full top-1/2 -translate-y-1/2 font-hands"
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
            className="col-start-12 w-auto justify-self-end self-start h-auto after:content-none"
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
        className={`relative grid grid-cols-4 lg:hidden items-start w-full shrink-0   h-16 lg:h-24 px-0 lg:px-3.5 pt-0 transition-colors duration-300 ${navOpen ? "bg-yellow-50" : "bg-background"}`}
      >
        {/* Menu toggle — mobile only, first column */}
        <Button
          onClick={() => setNavOpen((v) => !v)}
          variant="link"
          className="col-start-1 h-16 aspect-square w-auto  font-baskervilleNeoDisplay normal-case gap-x-1  justify-self-start after:content-none lg:hidden"
          aria-label="Menu"
          aria-expanded={navOpen}
        >
          [<span className="">{navOpen ? "−" : "+"}</span>]
        </Button>

        {/* Logo — middle two columns (mobile header) */}
        <Link
          href="/"
          className="col-span-2 lg:col-span-1 justify-self-stretch lg:justify-self-center flex items-center justify-center gap-2  font-baskervilleNeoDisplay text-xl lg:text-xl lg:w-full tracking-wide   h-16 lg:h-24 px-6 
       
          hover:opacity-60 transition-opacity whitespace-nowrap"
        >
          L'Amour
          {/* Dash between the names — widens while the menu is open */}
          <span
            aria-hidden
            className={`block shrink-0 bg-foreground transition-[width] duration-300 h-[0.5px] mt-0 ${navOpen ? "w-4" : "w-12"}`}
          />
          La Mort
        </Link>

        {/* Cart — mobile only, last column */}
        <Button
          variant="link"
          className="col-start-4 h-16 aspect-square w-auto text-xl font-baskervilleNeoDisplay  normal-case gap-x-2  justify-self-end after:content-none lg:hidden"
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
