"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBookshelfSettings } from "@/lib/contexts/BookshelfSettingsContext";

import { motion, AnimatePresence } from "motion/react";
import LLButton from "./LLButton";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { useCart } from "@/lib/contexts/CartContext";

import Link from "next/link";
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
      size="navLink"
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
      size="navLink"
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
          läs alla
        </Button>
      </div>
    </div>
  );
}

function ShopSubMenu({ setNavOpen }: { setNavOpen: (v: boolean) => void }) {
  const issues = useIssues();
  const { addToCart, setDrawerOpen } = useCart();
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
          till kassan
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
              Alla nummer
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
              Alla artiklar
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
            { label: "Om oss", href: "/" },
            { label: "Prenumerera", href: "/" },
            { label: "Kontakt", href: "/" },
            { label: "Nästa nummer", href: "/" },
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
  const {
    mode,
    setMode,
    showIssues,
    setShowIssues,
    showArticles,
    setShowArticles,
  } = useBookshelfSettings();
  const { totalItems, setDrawerOpen } = useCart();

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lamourText = useTypingAnimation("L'Amour", scrolled);
  const lamortText = useTypingAnimation("La Mort", scrolled);

  const isGridPage = pathname === "/shop" || pathname === "/articles";
  const modeLabel = mode === "bak" ? "baksida" : "framsida";
  function toggleGridMode() {
    setMode(mode === "bak" ? "fram" : "bak");
  }

  if (pathname.startsWith("/studio") || pathname.startsWith("/articles/"))
    return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-colors duration-500
        ${navOpen ? "min-h-dvh bg-background" : "h-14 lg:h-16"}`}
    >
      {/* ── HEADER ── */}
      <div
        className={`relative flex items-center w-full shrink-0 h-14 lg:h-16 px-4 lg:px-8 transition-colors duration-200 ${navOpen ? "bg-transparent" : "bg-background"}`}
      >
        {/* Logo — centered on mobile, left on desktop */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex items-center gap-2 font-baskervilleSC text-xl lg:text-lg tracking-widest hover:opacity-60 lowercase transition-opacity whitespace-nowrap"
        >
          {lamourText}
          <div
            className={`bg-foreground transition-[width] duration-300 h-[0.5px] mt-1 ${navOpen ? "w-16" : "w-4"}`}
          />
          {lamortText}
        </Link>

        {/* Menu button — mobile only */}
        <button
          onClick={() => setNavOpen((v) => !v)}
          className="lg:hidden flex items-center gap-x-1 font-baskervilleSC text-lg tracking-widest hover:opacity-60 transition-opacity shrink-0"
        >
          {"{"}{" "}
          <span className={navOpen ? "mt-0" : "mt-0.5"}>
            {navOpen ? "x" : "+"}
          </span>{" "}
          {"}"}
        </button>

        {/* Desktop horizontal nav links + controls */}
        <nav className="hidden lg:flex items-center justify-end gap-x-1 w-full">
          {[
            { label: "Alla nummer", href: "/shop" },
            { label: "Alla artiklar", href: "/articles" },
            { label: "Om oss", href: "/" },
            { label: "Prenumerera", href: "/" },
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
          {isGridPage && (
            <button
              onClick={toggleGridMode}
              className="inline-flex h-full items-center px-6 font-baskervilleSC text-lg lowercase tracking-widest hover:opacity-50 transition-opacity"
            >
              {modeLabel}
            </button>
          )}
          <motion.button
            key={totalItems}
            className="h-full inline-flex items-center px-4 font-baskerVilleOld hover:opacity-50 transition-opacity"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Öppna korg"
          >
            <span className="flex items-center gap-x-3 font-baskervilleSC text-lg lowercase tracking-widest">
              {"{"}
              {totalItems}
              {"}"}
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
          aria-label="Öppna korg"
        >
          <span className="flex font-baskervilleSC text-lg lowercase tracking-widest">
            <span className="flex items-center gap-x-3">
              {"{"}
              {totalItems}
              {"}"}
            </span>
          </span>
        </motion.button>
      </div>

      {isGridPage && (
        <button
          onClick={toggleGridMode}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 font-baskervilleSC text-lg tracking-widest h-10 lowercase bg-background border border-foreground/20 px-6 pt-1 pb-2 hover:opacity-60 transition-opacity"
        >
          {modeLabel}
        </button>
      )}
    </div>
  );
}
