"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollContainerContext } from "@/lib/ScrollContainerContext";
import SanityPortableText from "@/components/SanityPortableText";
import ArticleNav from "@/components/ArticleNav";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { issueTitle } from "@/lib/issueTitle";

type ArticleReaderProps = {
  title: string;
  subtitle?: string;
  body?: any[];
  author?: {
    name: string;
    slug: { current: string };
    image?: { asset: any; alt?: string };
  };
  issue?: { title: string; issueNumber: number; slug: { current: string } };
  series?: {
    title: string;
    slug: { current: string };
    coverImage?: { asset: any; alt?: string };
  };
  coverImage?: { asset: any; alt?: string };
  category?: string;
};

export default function ArticleReader({
  title,
  subtitle,
  body,
  author,
  issue,
  series,
  coverImage,
  category,
}: ArticleReaderProps) {
  const t = useTranslations("Article");
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <>
      <ArticleNav bodyRef={bodyRef} />
      {/* "ur: LL#n — title" top centre, linking to the issue */}
      {issue && (
        <Link
          href={`/shop/${issue.slug?.current}`}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-20 font-baskervilleNeoText tracking-[12%] text-sm uppercase whitespace-nowrap hover:opacity-60 transition-opacity"
        >
          {t("fromIssue", {
            number: issue.issueNumber,
            title: issueTitle(issue.title),
          })}
        </Link>
      )}
      {/* Close: Baskerville Neo's swash X (OpenType "swsh"), back to the list */}
      <Link
        href="/articles"
        aria-label={t("close")}
        className="fixed top-6 right-6 z-20 font-baskervilleNeoDisplay text-2xl leading-none [font-feature-settings:'swsh'_1] hover:opacity-60 transition-opacity"
      >
        X
      </Link>
      <motion.div
        ref={scrollRef}
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ScrollContainerContext.Provider value={scrollRef}>
          <article className="flex flex-col pb-32">
            {/* Hero */}
            <div ref={heroRef} className="relative h-dvh overflow-hidden">
              {coverImage?.asset && (
                // Centred, at most a third of the page wide
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ scale: imageScale }}
                >
                  <Image
                    src={urlFor(coverImage).url()}
                    alt={coverImage.alt ?? title}
                    width={0}
                    height={0}
                    sizes="33vw"
                    className="w-full opacity-0 max-w-1/3 h-auto"
                  />
                </motion.div>
              )}

              {/* Text content */}
              <div className="relative z-10 flex flex-col h-full justify-center items-center px-8 pt-12 pb-4 text-center">
                <div className="flex flex-col items-center justify-center gap-0">
                  <h1 className="font-baskervilleNeoDisplay text-4xl uppercase tracking-widest leading-[1.5]  lg:max-w-3xl mb-6">
                    {/* "{series}: {title}", with the title in italics */}
                    {series && <>{series.title}: </>}
                    <span className="italic">{title}</span>
                  </h1>
                  {subtitle && (
                    <h2 className="font-baskervilleNeoDisplay text-2xl leading-[1.2] tracking-[6%] ">
                      {subtitle}
                    </h2>
                  )}
                </div>
                {/* Author pinned to the bottom centre of the hero */}
                {author && (
                  <Link
                    href={`/authors/${author.slug.current}`}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 font-baskervilleNeoDisplay text-lg tracking-wider hover:opacity-60 transition-opacity"
                  >
                    {author.name}
                  </Link>
                )}
              </div>
            </div>

            <div ref={bodyRef} className="pt-2 px-2">
              {body && <SanityPortableText value={body} category={category} />}
            </div>
          </article>
        </ScrollContainerContext.Provider>
      </motion.div>
    </>
  );
}
