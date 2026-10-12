"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import LLButton from "./LLButton";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
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
      variant="navLink"
      size="navLinkMobile"
      className="justify-center lg:justify-start text-center lg:text-left"
      asChild
    >
      <Link
        href={`/articles/${article.slug.current}`}
        onClick={() => setNavOpen(false)}
      >
        {article.title}
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
      variant="navLink"
      size="navLinkMobile"
      className="justify-center lg:justify-start text-center lg:text-left"
      asChild
    >
      <Link
        href={`/shop/${issue.slug.current}`}
        onClick={() => setNavOpen(false)}
      >
        <span className="shrink-0">LL{issue.issueNumber}</span>
        {issue.title}
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
  const { articles } = useArticles();
  const t = useTranslations("Nav");
  return (
    <div className="flex flex-col items-start justify-start whitespace-normal w-full max-h-[60vh] overflow-y-auto">
      <div className="flex flex-col w-full">
        {articles.map((article) => (
          <ArticleRow
            key={article._id}
            article={article}
            setNavOpen={setNavOpen}
          />
        ))}

        <Button
          variant="navLink"
          className="justify-center lg:justify-start"
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
    <div className="flex flex-col items-start justify-start whitespace-normal w-full max-h-[60vh] overflow-y-auto">
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
          variant="navLink"
          className="justify-center lg:justify-start"
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
          className="flex flex-col w-full justify-start items-start font-baskerville mt-24 lg:mt-0  py-0 list-none gap-y-2"
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
              variant="navLink"
              className="justify-center lg:justify-between pr-4"
              onClick={() => {
                setOpenShopSubMenu(!openShopSubMenu);
                setOpenArticleSubMenu(false);
              }}
            >
              {t("allIssues")}
              <span
                className={`transition-transform duration-200 absolute right-6  ${openShopSubMenu ? "rotate-0" : "-rotate-90"}`}
              >
                V
              </span>
            </Button>
            <AnimatePresence>
              {openShopSubMenu && <ShopSubMenu setNavOpen={setNavOpen} />}
            </AnimatePresence>
          </motion.li>

          <motion.li className="w-full" variants={ITEM_VARIANTS}>
            <Button
              variant="navLink"
              className="justify-center lg:justify-between pr-4"
              onClick={() => {
                setOpenArticleSubMenu(!openArticleSubMenu);
                setOpenShopSubMenu(false);
              }}
            >
              {t("allArticles")}
              <span
                className={`transition-transform duration-200 absolute right-6 ${openArticleSubMenu ? "rotate-0" : "-rotate-90"}`}
              >
                V
              </span>
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
              <Button
                variant="navLink"
                className="justify-center lg:justify-start"
                asChild
              >
                <Link href={href} onClick={() => setNavOpen(false)}>
                  {label}
                </Link>
              </Button>
            </motion.li>
          ))}

          <motion.li className="w-full" variants={ITEM_VARIANTS}>
            <Button
              variant="navLink"
              className="justify-center lg:justify-start"
              asChild
            >
              <Link
                href={pathname}
                locale={locale === "en" ? "sv" : "en"}
                onClick={() => setNavOpen(false)}
              >
                {t("switchLanguage")}
              </Link>
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
        ${navOpen ? "min-h-dvh bg-yellow-50" : "h-14 lg:h-16"}`}
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
        <button
          onClick={() => setNavOpen((v) => !v)}
          className="lg:hidden flex items-center gap-x-1 font-baskervilleNeoText text-base  hover:opacity-60 transition-opacity shrink-0"
        >
          Menu
        </button>

        {/* Desktop horizontal nav links + controls */}
        <nav className="hidden lg:flex items-center justify-end gap-x-1 w-full">
          {[
            { label: t("allIssues"), href: "/shop" },
            { label: t("allArticles"), href: "/articles" },
            { label: t("about"), href: "/" },
            { label: t("subscribe"), href: "/" },
          ].map(({ label, href }) => (
            <Button
              key={label}
              variant="navLinkDesktop"
              size="navLinkDesktop"
              asChild
            >
              <Link href={href}>{label}</Link>
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
        className={`flex flex-col flex-1 overflow-y-auto lg:hidden ${navOpen ? "" : "hidden"}`}
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
