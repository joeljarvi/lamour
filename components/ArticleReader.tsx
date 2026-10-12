"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollContainerContext } from "@/lib/ScrollContainerContext";
import SanityPortableText from "@/components/SanityPortableText";
import { urlFor } from "@/lib/sanity/image";
import Link from "next/link";
import Image from "next/image";

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
  coverImage,
  category,
}: ArticleReaderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <>
      <div className="fixed z-20 w-full">
        <div className="flex  justify-between items-center lg:grid lg:grid-cols-3 gap-16  px-2 pt-2 lg:px-4 w-full ">
          {category && (
            <div className="font-universTypewriter text-xs text-lime uppercase whitespace-normal flex flex-col items-center justify-center gap-1">
              <div className="font-baskervilleSC lowercase flex gap-x-0.5 text-2xl">
                {"{"}
                <span>A</span>
                {"}"}
              </div>
              <span>{category === "interview" ? "intervju" : category}</span>
            </div>
          )}
          {issue && (
            <div className="font-universTypewriter text-xs text-lime  uppercase whitespace-normal">
              <Link
                href={`/shop/${issue.slug?.current}`}
                className="hover:opacity-60 transition-opacity flex flex-col items-center gap-0"
              >
                <div className="font-baskervilleSC lowercase flex gap-x-1 text-2xl mb-1">
                  {"{"}
                  <span>I</span>
                  {"}"}
                </div>
                ur: LL#{issue.issueNumber} — {issue.title}
              </Link>
            </div>
          )}

          <Link
            href="/articles"
            className="font-universTypewriter text-xs text-lime uppercase whitespace-normal flex flex-col items-center justify-center gap-1 hover:opacity-60 transition-opacity"
          >
            <div className="font-baskervilleSC lowercase flex gap-x-0.5 text-2xl">
              {"{"}
              <span>X</span>
              {"}"}
            </div>
            <span>stäng</span>
          </Link>
        </div>
      </div>
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
                <motion.div
                  className="absolute inset-0"
                  style={{ scale: imageScale }}
                >
                  <Image
                    src={urlFor(coverImage).url()}
                    alt={coverImage.alt ?? title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              )}

              {/* Text content */}
              <div className="relative z-10 flex flex-col h-full justify-center items-center px-8 pt-12 pb-4 text-center">
                <div className="flex flex-col items-center justify-center gap-0">
                  {author && (
                    <Link
                      href={`/authors/${author.slug.current}`}
                      className="font-baskerVilleOld text-3xl  tracking-wider hover:opacity-60 transition-opacity"
                    >
                      {author.name}
                    </Link>
                  )}
                  <h1 className="font-baskerVV text-7xl  tracking-widest leading-[1] mb-2 lg:max-w-3xl">
                    {title}
                  </h1>
                  {subtitle && (
                    <h2 className="font-baskerVilleOld text-2xl leading-[1.2] tracking-widest ">
                      {subtitle}
                    </h2>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 px-2">
              {body && <SanityPortableText value={body} category={category} />}
            </div>
          </article>
        </ScrollContainerContext.Provider>
      </motion.div>
    </>
  );
}
