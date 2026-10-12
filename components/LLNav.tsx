"use client";

import { Fragment, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import LLButton from "./LLButton";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { useCart } from "@/lib/contexts/CartContext";

import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "./ui/button";
import { articleTitle } from "@/lib/articleTitle";

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

/* ─── ROW COMPONENTS ─── */

function ArticleRow({
  article,
  setNavOpen,
}: {
  article: Article;
  setNavOpen: (v: boolean) => void;
}) {
  return (
    <Button
      variant="link"
      size="lg"
      className=" leading-loose px-20    font-baskervilleNeoDisplay "
      asChild
    >
      <Link
        href={`/articles/${article.slug.current}`}
        onClick={() => setNavOpen(false)}
      >
        <span className="min-w-0 truncate">{articleTitle(article.title)}</span>
      </Link>
    </Button>
  );
}

function IssueRow({
  issue,
  setNavOpen,
  addToCart,
}: {
  issue: Issue;
  setNavOpen: (v: boolean) => void;
  addToCart: (item: { id: string; title: string; price: string }) => void;
}) {
  return (
    <Button
      variant="link"
      size="lg"
      className=" leading-loose px-20    font-baskervilleNeoDisplay "
      asChild
    >
      <Link
        href={`/shop/${issue.slug.current}`}
        onClick={() => setNavOpen(false)}
      >
        <span className="flex min-w-0 gap-2 normal-case">
          <span className="shrink-0">LL{issue.issueNumber}</span>
          <span className="min-w-0 truncate">{issue.title}</span>
        </span>
      </Link>
    </Button>
  );
}

/* ─── ARTICLE SUBMENU ─── */

function ArticleSubMenu({
  setNavOpen,
}: {
  setNavOpen: (open: boolean) => void;
}) {
  const { articles, series } = useArticles();
  const t = useTranslations("Nav");
  const [openSeries, setOpenSeries] = useState<string | null>(null);

  // Series that have articles, each with its articles; then the rest
  const seriesGroups = series
    .map((s) => ({
      series: s,
      articles: articles.filter(
        (a) => a.series?.slug.current === s.slug.current,
      ),
    }))
    .filter((g) => g.articles.length > 0);
  const standalone = articles.filter((a) => !a.series);

  return (
    <div className="flex flex-col items-start justify-start whitespace-normal w-full border-b border-b-foreground">
      <div className="flex flex-col w-full">
        {seriesGroups.map(({ series: s, articles: seriesArticles }) => {
          const isOpen = openSeries === s._id;
          return (
            <div key={s._id} className="flex flex-col w-full ">
              <Button
                variant="link"
                size="lg"
                className="font-baskervilleNeoDisplay  pl-12 pr-6 aria-expanded:pl-18"
                aria-expanded={isOpen}
                onClick={() => setOpenSeries(isOpen ? null : s._id)}
              >
                <span className="min-w-0 truncate">{s.title}</span>
              </Button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="flex flex-col  w-full overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {seriesArticles.map((article) => (
                      <ArticleRow
                        key={article._id}
                        article={article}
                        setNavOpen={setNavOpen}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {standalone.map((article) => (
          <ArticleRow
            key={article._id}
            article={article}
            setNavOpen={setNavOpen}
          />
        ))}

        <Button
          variant="outline"
          size="sm"
          className=" justify-center "
          onClick={() => setNavOpen(false)}
        >
          {t("readAll")}
        </Button>
      </div>
    </div>
  );
}

function ShopSubMenu({ setNavOpen }: { setNavOpen: (v: boolean) => void }) {
  const issues = useIssues();
  const { addToCart, setDrawerOpen } = useCart();
  const t = useTranslations("Nav");
  return (
    <div className="flex flex-col items-start justify-start whitespace-normal w-full border-b border-b-foreground">
      <div className="flex flex-col w-full">
        {issues.map((issue) => (
          <IssueRow
            key={issue._id}
            issue={issue}
            setNavOpen={setNavOpen}
            addToCart={addToCart}
          />
        ))}

        <Button
          variant="outline"
          size="sm"
          className=" justify-center "
          onClick={() => {
            setDrawerOpen(true);
            setNavOpen(false);
          }}
        >
          {t("toCheckout")}
        </Button>
      </div>
    </div>
  );
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

/* ─── NAV OVERLAY (shared mobile + desktop) ─── */

function NavOverlay({
  navOpen,
  openShopSubMenu,
  setOpenShopSubMenu,
  openArticleSubMenu,
  setOpenArticleSubMenu,
  setNavOpen,
}: {
  navOpen: boolean;
  openShopSubMenu: boolean;
  setOpenShopSubMenu: (v: boolean) => void;
  openArticleSubMenu: boolean;
  setOpenArticleSubMenu: (v: boolean) => void;
  setNavOpen: (v: boolean) => void;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <AnimatePresence>
      {navOpen && (
        <motion.ul
          className="flex flex-col w-full justify-start items-start font-baskerville   py-0 list-none gap-y-2"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <motion.li className="w-full" variants={ITEM_VARIANTS}>
            <Button
              variant="link"
              size="lg"
              aria-expanded={openShopSubMenu}
              aria-current={isActive(pathname, "/shop") ? "page" : undefined}
              onClick={() => {
                setOpenShopSubMenu(!openShopSubMenu);
                setOpenArticleSubMenu(false);
              }}
            >
              {t("allIssues")}
            </Button>
            <AnimatePresence>
              {openShopSubMenu && <ShopSubMenu setNavOpen={setNavOpen} />}
            </AnimatePresence>
          </motion.li>

          <motion.li className="w-full" variants={ITEM_VARIANTS}>
            <Button
              variant="link"
              size="lg"
              aria-expanded={openArticleSubMenu}
              aria-current={
                isActive(pathname, "/articles") ? "page" : undefined
              }
              onClick={() => {
                setOpenArticleSubMenu(!openArticleSubMenu);
                setOpenShopSubMenu(false);
              }}
            >
              {t("allArticles")}
            </Button>
            <AnimatePresence>
              {openArticleSubMenu && <ArticleSubMenu setNavOpen={setNavOpen} />}
            </AnimatePresence>
          </motion.li>

          {[
            { label: t("about"), href: "/" },
            { label: t("subscribe"), href: "/" },
            { label: t("contact"), href: "/" },
            { label: t("nextIssue"), href: "/" },
          ].map(({ label, href }) => (
            <motion.li key={label} className="w-full" variants={ITEM_VARIANTS}>
              <Button variant="link" size="lg" className=" " asChild>
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
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
/* ─── MAIN NAV ─── */

export default function LLNav() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [openArticleSubMenu, setOpenArticleSubMenu] = useState(false);
  const [openShopSubMenu, setOpenShopSubMenu] = useState(false);
  const { totalItems, setDrawerOpen } = useCart();
  const t = useTranslations("Nav");
  const locale = useLocale();
  const otherLocale = locale === "en" ? "sv" : "en";

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
        className={`relative flex items-center w-full shrink-0 h-16 lg:h-16 px-4 lg:px-8 transition-colors duration-200 ${navOpen ? "bg-transparent" : "bg-yellow-50"}`}
      >
        {/* Logo — centered on mobile, left on desktop */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex items-center gap-2  font-baskervilleNeoText text-base lg:text-lg  h-12 px-6 
       
          hover:opacity-60 transition-opacity whitespace-nowrap"
        >
          L'Amour — La Mort
        </Link>

        {/* Menu button — mobile only */}
        <Button
          onClick={() => setNavOpen((v) => !v)}
          variant="outline"
          className="fixed bottom-2 left-2 right-2 w-auto  lg:hidden flex "
        >
          Menu
        </Button>

        {/* Desktop horizontal nav links + controls */}
        <nav className="hidden lg:flex items-center justify-end gap-x-1 w-full">
          {[
            { label: t("allIssues"), href: "/shop" },
            { label: t("allArticles"), href: "/articles" },
            { label: t("about"), href: "/" },
            { label: t("subscribe"), href: "/" },
          ].map(({ label, href }) => (
            <Button key={label} variant="link" size="lg" asChild>
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            </Button>
          ))}
          <Button variant="navLinkDesktop" size="navLinkDesktop" asChild>
            <Link href={pathname} locale={otherLocale}>
              {t("switchLanguage")}
            </Link>
          </Button>
          <motion.button
            key={totalItems}
            className="h-full inline-flex items-center px-4 font-baskerVilleOld hover:opacity-50 transition-opacity"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => setDrawerOpen(true)}
            aria-label={t("openCart")}
          >
            <span className="flex items-center gap-x-3 font-baskervilleNeoText text-base lowercase tracking-widest">
              {"("}
              {totalItems}
              {")"}
            </span>
          </motion.button>
        </nav>
      </div>

      {/* ── NAV OVERLAY (mobile) ── */}
      <div
        className={`flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain lg:hidden ${navOpen ? "" : "hidden"}`}
      >
        <NavOverlay
          navOpen={navOpen}
          openShopSubMenu={openShopSubMenu}
          setOpenShopSubMenu={setOpenShopSubMenu}
          openArticleSubMenu={openArticleSubMenu}
          setOpenArticleSubMenu={setOpenArticleSubMenu}
          setNavOpen={setNavOpen}
        />
      </div>

      <div className="lg:hidden fixed top-0 right-0 z-60 flex items-center h-14">
        <motion.button
          key={totalItems}
          className="h-full inline-flex items-center px-4 font-baskerVilleOld hover:opacity-50 transition-opacity"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={() => setDrawerOpen(true)}
          aria-label={t("openCart")}
        >
          <span className="flex font-baskervilleNeoText text-base ">
            <span className="flex items-center gap-x-3">
              {"("}
              {totalItems}
              {")"}
            </span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
