"use client";

import { Fragment, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
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
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-colors duration-500
        ${navOpen ? "h-dvh bg-yellow-50" : "h-14 lg:h-16"}`}
    >
      {/* ── HEADER ── */}
      <div
        className={`relative grid grid-cols-4 lg:grid-cols-3 items-start w-full shrink-0 h-16 lg:h-16 px-0 lg:px-2 pt-0 transition-colors  duration-200 ${navOpen ? "bg-yellow-50" : "bg-transparent"}`}
      >
        {/* Desktop: left column — 3×2 link grid */}
        <nav className="hidden lg:grid grid-cols-3 grid-rows-2 gap-x-0 items-center px-0 pt-2 ">
          {[
            { label: t("home"), href: "/", cell: "col-start-1 row-start-1" },
            {
              label: t("issues"),
              href: "/shop",
              cell: "col-start-1 row-start-2",
            },
            { label: t("about"), href: "/", cell: "col-start-2 row-start-1" },
            {
              label: t("articles"),
              href: "/articles",
              cell: "col-start-2 row-start-2",
            },
            // TODO: no terms page yet — point at it once it exists
            { label: "Villkor", href: "/", cell: "col-start-3 row-start-1" },
          ].map(({ label, href, cell }) => (
            <Button
              key={label}
              variant="link"
              size="xs"
              className={`  ${cell}`}
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
        </nav>

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

        {/* Logo — middle two columns on mobile, middle column on desktop */}
        <Link
          href="/"
          className="col-span-2 lg:col-span-1 justify-self-stretch lg:justify-self-center flex items-center justify-center gap-2  font-baskervilleNeoDisplay text-xl lg:text-xl lg:w-full tracking-wide lg:border-x lg:border-x-foreground  h-16 lg:h-full px-6 
       
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

        {/* Desktop: right column — subscribe + log in | languages; cart pinned top-right */}
        <div className="hidden lg:grid grid-cols-3 grid-rows-2 items-start justify-start w-full gap-x-4 pt-2">
          {/* Column 1: subscribe with log in stacked below */}
          <span className="col-start-2 row-span-2 flex flex-col">
            <Button variant="link" size="xs">
              Prenumerera
            </Button>
            {/* TODO: no accounts yet — wire up when login exists */}
            <Button variant="link" size="xs">
              {t("login")}
            </Button>
          </span>
          {/* Column 2: one language button per row */}
          {LANGUAGES.map(({ locale: l, label }, i) => (
            <Button
              key={l}
              variant="link"
              size="xs"
              className={`col-start-3 justify-start ${i === 0 ? "row-start-1" : "row-start-2"}`}
              asChild
            >
              <Link
                href={pathname}
                locale={l}
                aria-current={l === locale ? "page" : undefined}
              >
                {label}
              </Link>
            </Button>
          ))}
          {/* Cart — pinned to the header's top-right corner */}
          <Button
            variant="link"
            size="xs"
            className="absolute top-2 right-2 w-auto h-6  font-bold after:content-none"
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
    </div>
  );
}
