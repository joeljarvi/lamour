"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollContainerContext } from "@/lib/ScrollContainerContext";
import SanityPortableText from "@/components/SanityPortableText";
import ArticleNavbar from "@/components/ArticleNavbar";
import ArticleFooter from "@/components/ArticleFooter";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

// While scrolling, the body's paragraph (.pStyle) spanning the middle of
// the screen gets data-active (dark; the rest light grey: globals.css).
// Between paragraphs (the middle on a gap or an image): the last one
// stays dark
function useReaderFocus(body: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    let current: Element | null = null;
    const update = () => {
      const root = body.current;
      if (!root) return;
      const middle = window.innerHeight / 2;
      const reached = Array.from(root.querySelectorAll(".pStyle")).find(
        (el) => {
          const box = el.getBoundingClientRect();
          return box.top <= middle && box.bottom >= middle;
        },
      );
      if (!reached || reached === current) return;
      current?.removeAttribute("data-active");
      reached.setAttribute("data-active", "");
      current = reached;
    };
    const frame = requestAnimationFrame(update);
    // Any scrolling (the page's, or a box's when the article opens over
    // another page): scroll events don't bubble, so caught on the way down
    document.addEventListener("scroll", update, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [body]);
}
import ColumnNumbers from "@/components/ColumnNumbers";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // The paragraph in the middle of the screen dark, the rest light grey
  useReaderFocus(bodyRef);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // At most 75 characters per line: the body text's average character
  // width, in its own font (its rendered width over its .length, plus the
  // letter spacing), times 75, set as --measure on the body; the text
  // columns are no wider than that. Measured again when the window
  // resizes (the font size changes on desktop) and once the fonts load
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const measure = () => {
      const paragraphs = Array.from(body.querySelectorAll("p"));
      const text = paragraphs.map((p) => p.textContent ?? "").join(" ");
      if (!ctx || paragraphs.length === 0 || text.length === 0) return;
      const style = getComputedStyle(paragraphs[0]);
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const spacing = parseFloat(style.letterSpacing) || 0;
      const perChar = ctx.measureText(text).width / text.length + spacing;
      body.style.setProperty("--measure", `${Math.floor(perChar * 75)}px`);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [body]);

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
        className="relative w-full bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Column numbers along the top (desktop) */}
        <ColumnNumbers className="z-50" />
        <ScrollContainerContext.Provider value={scrollRef}>
          <article className="flex flex-col pb-32">
            {/* Hero */}
            {/* Hero, in the article's tile colour (light text on the dark
                one) */}
            <div
              ref={heroRef}
              // The drunk filter moves its Display text too (DrunkFilter)
              data-drunk-display
              // The page's background (not the article's tile colour)
              className="relative h-dvh overflow-hidden bg-background text-foreground"
            >
              {/* Text content */}
              <div className="relative z-10 flex flex-col h-full justify-center items-center px-3 lg:px-24 pt-12 pb-4 text-center">
                <div className="flex flex-col items-center justify-center  w-full text-center leading-auto lg:leading-tight whitespace-normal break-words  text-xl lg:text-4xl truncate font-baskervilleNeoDisplay  lg:font-baskervilleNeoDisplay tracking-normal px-12 lg:px-0 gap-6 gap-x-24 lg:max-w-xl">
                  <h1 className="  ">
                    {/* "{series}: {title} — {subtitle}", the subtitle in
                        italics */}
                    {series && <>{series.title}: </>}
                    <span className="">
                      {title}
                      {subtitle && (
                        <>
                          {"— "}
                          <span className="italic">{subtitle}</span>
                        </>
                      )}
                    </span>
                  </h1>
                  {/* The article's image, below the title (and subtitle):
                      at most 40% of the screen tall, its width following
                      its shape; it grows a little as the hero scrolls
                      away (imageScale) */}
                  {coverImage?.asset && (
                    <motion.div style={{ scale: imageScale }}>
                      <Image
                        src={urlFor(coverImage).width(1600).url()}
                        alt={coverImage.alt ?? title}
                        width={0}
                        height={0}
                        sizes="(min-width: 1024px) 33vw, 80vw"
                        className="h-auto max-h-[40dvh] w-auto border  border-foreground max-w-full object-contain"
                      />
                    </motion.div>
                  )}
                </div>
                {/* Desktop: the author, bottom centre of the hero, just above
                    the reader's bottom bar (h-12) */}
                {author && (
                  <Link
                    href={`/authors/${author.slug.current}`}
                    className="block  mt-6  mx-auto w-fit text-xs lg:text-base tracking-wider lg:tracking-wide leading-tight font-baskervilleNeoText hover:opacity-60 transition-opacity"
                  >
                    {author.name}
                  </Link>
                )}
              </div>
            </div>

            {/* Body text justified and hyphenated (in the page's language)
                to keep the word spacing even. Set on the normal paragraphs
                themselves ([&_.pStyle]:), since SanityPortableText gives
                each one its own alignment (text-left, or text-center in
                interviews); interviews are justified too. Other styles
                (names, preamble…) keep their own alignment */}
            <div
              ref={bodyRef}
              // Paragraphs light grey except the one in the middle of the
              // screen (globals.css; useReaderFocus)
              data-reader-focus
              // Full width (minus padding): the article layout sets the
              // text's width (half on desktop) and places the images
              className="px-6 pt-6 lg:px-12 [&_.pStyle]:text-justify [&_.pStyle]:hyphens-auto"
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
