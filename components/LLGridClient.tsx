"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "motion/react";
import { useIssues, type Issue } from "@/lib/contexts/IssuesContext";
import { useArticles, type Article } from "@/lib/contexts/ArticlesContext";
import { useBookshelfSettings } from "@/lib/contexts/BookshelfSettingsContext";
import { urlFor } from "@/lib/sanity/image";
import IssueCard from "./IssueCard";
import { Button } from "./ui/button";
import { useState } from "react";

// ─── Animation variants ───────────────────────────────────────────────────

const framItemVariants = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: (i: number) => ({
    opacity: 1,
    rotateY: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeOut" as const },
  }),
};

const bakItemVariants = {
  hidden: { opacity: 0, rotateY: 90 },
  visible: (i: number) => ({
    opacity: 1,
    rotateY: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" as const },
  }),
};

// ─── IssueGridItem ────────────────────────────────────────────────────────

export function IssueGridItem({
  issue,
  mode,
  idx,
  onSelect,
}: {
  issue: Issue;
  mode: "fram" | "bak";
  idx: number;
  onSelect: (issue: Issue) => void;
}) {
  const src =
    mode === "fram"
      ? issue.cover?.asset
        ? urlFor(issue.cover).url()
        : null
      : issue.back?.asset
        ? urlFor(issue.back).url()
        : null;

  return (
    <motion.div
      custom={idx}
      initial="hidden"
      animate="visible"
      variants={mode === "bak" ? bakItemVariants : framItemVariants}
      className="aspect-3/4 flex flex-col p-6 w-full mx-auto border-neutral-300 border-[0.5px] items-center lg:items-center justify-center text-center lg:text-start group lg:transition-colors lg:hover:bg-neutral-400"
    >
      <Link
        href={`/shop/${issue.slug.current}`}
        onClick={(e) => {
          e.preventDefault();
          onSelect(issue);
        }}
        className="relative aspect-3/4 overflow-hidden block hover:opacity-90 transition-opacity w-full"
      >
        <span className="font-baskervilleSC text-foreground lowercase text-sm tracking-widest mt-2 leading-tight">
          {issue.title}
        </span>
        {src ? (
          <Image
            src={src}
            fill
            alt={issue.title}
            className="object-contain object-center shadow  aspect-3/4 max-w-39.25"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-full aspect-3/4 max-w-39.25 bg-foreground/20 flex items-center justify-center shadow">
              <span className="font-baskervilleSC text-foreground/40 text-sm tracking-widest lowercase">
                {mode === "bak" ? "back" : issue.title}
              </span>
            </div>
          </div>
        )}
      </Link>
      <span className="flex w-full justify-center lg:justify-between items-baseline lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <h2 className="hidden lg:block text-lg lowercase tracking-widest font-baskervilleSC">
          {issue.price} SEK
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="font-baskervilleSC lowercase tracking-widest justify-center w-min whitespace-nowrap"
        >
          köp nu
        </Button>
      </span>
    </motion.div>
  );
}

// ─── ArticleGridItem ──────────────────────────────────────────────────────

export function ArticleGridItem({
  article,
  mode,
  idx,
}: {
  article: Article;
  mode: "fram" | "bak";
  idx: number;
}) {
  const src = article.coverImage?.asset
    ? urlFor(article.coverImage).url()
    : null;

  return (
    <motion.div
      custom={idx}
      initial="hidden"
      animate="visible"
      variants={mode === "bak" ? bakItemVariants : framItemVariants}
      className="aspect-3/4 flex flex-col p-6 w-full mx-auto border border-foreground items-center lg:items-start text-center lg:text-start group lg:transition-colors lg:hover:bg-neutral-400"
    >
      <Link
        href={`/articles/${article.slug.current}`}
        className="relative aspect-3/4 overflow-hidden block hover:opacity-80 transition-opacity w-full"
      >
        <span className="font-baskervilleSC text-foreground lowercase text-sm tracking-widest mt-2 leading-tight">
          {article.title}
        </span>
        {src ? (
          <Image
            src={src}
            fill
            alt={article.title}
            className="object-contain object-center shadow aspect-3/4 max-w-39.25 mx-auto"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-full aspect-3/4 max-w-39.25 bg-foreground/10 flex items-center justify-center shadow">
              <span className="font-baskervilleSC text-foreground/40 text-sm tracking-widest lowercase">
                {article.title}
              </span>
            </div>
          </div>
        )}
      </Link>
      <span className="flex w-full justify-center lg:justify-between items-baseline">
        <h2 className="hidden lg:block text-lg lowercase tracking-widest font-baskervilleSC">
          {article.author?.name ?? ""}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="font-baskervilleSC lowercase tracking-widest justify-center w-min whitespace-nowrap"
        >
          läs nu
        </Button>
      </span>
    </motion.div>
  );
}

// ─── IssuesShelf ──────────────────────────────────────────────────────────

export function IssuesShelf() {
  const issues = useIssues();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { mode, setMode } = useBookshelfSettings();

  useEffect(() => {
    if (mode === "rygg") setMode("fram");
  }, []);

  const gridMode = mode === "bak" ? "bak" : "fram";

  return (
    <>
      <div
        className="w-full    min-h-dvh grid grid-cols-2 lg:grid-cols-4 pb-16 lg:pb-0"
        style={{ perspective: "1200px" }}
      >
        {issues.map((issue, idx) => (
          <IssueGridItem
            key={`${gridMode}-${issue._id}`}
            issue={issue}
            mode={gridMode}
            idx={idx}
            onSelect={setSelectedIssue}
          />
        ))}
      </div>
      <IssueCard issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </>
  );
}

// ─── ArticlesShelf ────────────────────────────────────────────────────────

export function ArticlesShelf() {
  const { articles } = useArticles();
  const { mode, setMode } = useBookshelfSettings();

  useEffect(() => {
    if (mode === "rygg") setMode("fram");
  }, []);

  const gridMode = mode === "bak" ? "bak" : "fram";

  return (
    <div
      className="w-full lg:pt-16  min-h-dvh grid grid-cols-2 lg:grid-cols-4 pb-16 lg:pb-0"
      style={{ perspective: "1200px" }}
    >
      {articles.map((article, idx) => (
        <ArticleGridItem
          key={`${gridMode}-${article._id}`}
          article={article}
          mode={gridMode}
          idx={idx}
        />
      ))}
    </div>
  );
}
