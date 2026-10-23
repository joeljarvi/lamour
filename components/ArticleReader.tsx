"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollContainerContext } from "@/lib/ScrollContainerContext";
import SanityPortableText from "@/components/SanityPortableText";
import ArticleNavbar from "@/components/ArticleNavbar";
import ArticleFooter from "@/components/ArticleFooter";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useArticleColor } from "@/components/ArticleTile";
import { cn } from "@/lib/utils";

type ArticleReaderProps = {
  slug: string;
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
  slug,
  title,
  subtitle,
  body,
  author,
  issue,
  series,
  coverImage,
  category,
}: ArticleReaderProps) {
  // The article's tile colour, for the hero (as the top bar and footer)
  const color = useArticleColor(slug);
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
      {/* Series and title (mobile) and close at the top; settings, the
          reading progress and the queue at the bottom */}
      <ArticleNavbar
        slug={slug}
        title={title}
        series={series}
        bodyRef={bodyRef}
      />
      <motion.div
        ref={scrollRef}
        className="w-full bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ScrollContainerContext.Provider value={scrollRef}>
          <article className="flex flex-col pb-32">
            {/* Hero */}
            {/* Hero, in the article's tile colour (light text on the dark
                one) */}
            <div
              ref={heroRef}
              className={cn(
                "relative h-dvh overflow-hidden bg-background text-foreground",
                color,
              )}
            >
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
                <div className="flex flex-col items-center justify-center gap-0 w-full text-center leading-loose whitespace-normal break-words  text-base lg:text-2xl truncate font-baskervilleNeoText uppercase lg:font-baskervilleNeoDisplay tracking-[24%] px-12 lg:px-0 gap-12 lg:max-w-2xl">
                  {author && (
                    <Link
                      href={`/authors/${author.slug.current}`}
                      className="text-xs tracking-[48%]   leading-loose font-baskervilleNeoText uppercase"
                    >
                      {author.name}
                    </Link>
                  )}
                  <h1 className="  ">
                    {/* "{series}: {title}", with the title in italics */}
                    {series && <>{series.title}: </>}
                    <span className="">{title}</span>
                  </h1>
                  {subtitle && (
                    <h2 className="italic text-xs tracking-[48%] leading-loose font-baskervilleNeoText">
                      {subtitle}
                    </h2>
                  )}
                </div>
                {/* Author pinned to the bottom centre of the hero */}
              </div>
            </div>

            {/* Body text justified and hyphenated (in the page's language)
                to keep the word spacing even. Set on the normal paragraphs
                themselves ([&_.readStyle]:), since SanityPortableText gives
                each one its own alignment (text-left, or text-center in
                interviews); interviews are justified too. Other styles
                (names, preamble…) keep their own alignment */}
            <div
              ref={bodyRef}
              // Full width (minus padding): the article layout sets the
              // text's width (half on desktop) and places the images
              className="px-6 pt-6 lg:px-12 [&_.readStyle]:text-justify [&_.readStyle]:hyphens-auto"
            >
              {body && (
                <SanityPortableText
                  value={body}
                  category={category}
                  articleLayout
                />
              )}
            </div>
          </article>
          {/* Colophon and the series' other articles */}
          <ArticleFooter slug={slug} />
        </ScrollContainerContext.Provider>
      </motion.div>
    </>
  );
}
