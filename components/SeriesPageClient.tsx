"use client";

import { useRef } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { useArticles } from "@/lib/contexts/ArticlesContext";
import { urlFor } from "@/lib/sanity/image";
import ArticlesPageClient from "./ArticlesPageClient";

// A series' page: a hero as an article's (ArticleReader): the screen tall,
// centred: the title (Display), the series' image below it (at most 40% of
// the screen tall, growing a little as the hero scrolls away), its about
// text below that. Then the articles page's filters and grid, with only
// this series' articles
export default function SeriesPageClient({ slug }: { slug: string }) {
  const { series } = useArticles();
  const current = series.find((s) => s.slug.current === slug);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  if (!current) notFound();
  const text = current.aboutText ?? current.description;

  return (
    <>
      <div
        ref={heroRef}
        // The drunk filter moves its Display text too (DrunkFilter)
        data-drunk-display
        className="relative h-dvh overflow-hidden bg-background text-foreground"
      >
        <div className="relative z-10 flex flex-col h-full justify-center items-center px-3 lg:px-24 pt-12 pb-4 text-center">
          <div className="flex flex-col items-center justify-center w-full text-center leading-auto lg:leading-tight whitespace-normal break-words text-xl lg:text-4xl font-baskervilleNeoDisplay tracking-normal px-12 lg:px-0 gap-6 lg:max-w-xl">
            <h1>{current.title}</h1>
            {current.coverImage?.asset && (
              <motion.div style={{ scale: imageScale }}>
                <Image
                  src={urlFor(current.coverImage).width(1600).url()}
                  alt={current.coverImage.alt ?? current.title}
                  width={0}
                  height={0}
                  sizes="(min-width: 1024px) 33vw, 80vw"
                  className="h-auto max-h-[40dvh] w-auto border border-foreground max-w-full object-contain"
                />
              </motion.div>
            )}
          </div>
          {/* The about text, below, where an article has its author */}
          {text && (
            <p className="mt-6 mx-auto max-w-prose text-xs lg:text-base tracking-wider lg:tracking-wide leading-tight font-baskervilleNeoText">
              {text}
            </p>
          )}
        </div>
      </div>
      <ArticlesPageClient seriesSlug={slug} />
    </>
  );
}
