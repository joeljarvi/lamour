import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";

// An image's width and height, read from its asset reference
// ("image-<id>-<width>x<height>-<format>"); null if it can't be read
function imageSize(value: any): { width: number; height: number } | null {
  const match = value?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

// An image block from the body, with its caption (the image's alt text)
// under it. With `innerClassName`, the image and caption sit in their own
// box inside the figure (e.g. one that sticks while the figure scrolls).
// The image fills its box's width, at most a screen tall; scaled down to
// fit, it sits at the box's left edge (object-left), or centred when
// `wide`. The caption starts at that same edge (no side padding)
function BodyImage({
  value,
  className = "",
  innerClassName,
  imageClassName = "",
  wide = false,
  sizes,
}: {
  value: any;
  className?: string;
  innerClassName?: string;
  // Extra classes for the image (e.g. a tighter height limit)
  imageClassName?: string;
  wide?: boolean;
  sizes?: string;
}) {
  const content = (
    <>
      <Image
        src={urlFor(value).url()}
        alt={value.alt ?? ""}
        width={imageSize(value)?.width ?? 1200}
        height={imageSize(value)?.height ?? 800}
        sizes={sizes}
        // cn: the caller's height limit replaces max-h-dvh
        className={cn(
          "min-h-0 w-full h-auto max-h-dvh object-contain",
          wide ? "object-center" : "object-left",
          imageClassName,
        )}
      />
      {value.alt && (
        <figcaption
          className={`w-full pt-3 font-baskervilleNeoText text-xs lg:text-sm flex justify-between gap-6 ${wide ? "" : "text-left"}`}
        >
          {/* The image's number in the body: fig 1., fig 2.… */}
          {value._fig != null && (
            <span className="shrink-0">fig {value._fig}.</span>
          )}
          <span>{value.alt}</span>
        </figcaption>
      )}
    </>
  );
  return (
    <figure className={className}>
      {innerClassName ? (
        <div className={innerClassName}>{content}</div>
      ) : (
        content
      )}
    </figure>
  );
}

function buildComponents(
  category?: string,
  // Article layout: images left in the text are small and centred
  // (sticky and wide ones are laid out by the sections instead)
  articleLayout = false,
): PortableTextComponents {
  const normalAlign =
    category === "interview"
      ? "text-left lg:text-justify"
      : "text-left lg:text-justify";
  return {
    block: {
      normal: ({ children, value }) => {
        if ((value as any)._empty) return null;
        const indent = (value as any)._indented ? "indent-0" : "";
        const dropcap = (value as any)._dropcap ? "dropcap" : "";
        const initial = (value as any)._initial ? "initial" : "";
        return (
          <p
            className={`pStyle text-neutral-800 ${normalAlign} ${indent} ${dropcap} ${initial}  mx-auto `}
          >
            {children}
          </p>
        );
      },
      h1: ({ children }) => (
        <h1 className="font-baskervilleNeoDisplay text-4xl tracking-wide text-center">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="font-baskervilleNeoDisplay text-2xl tracking-wide text-center">
          {children}
        </h2>
      ),
      blockquote: ({ children }) => (
        <blockquote className="font-baskervilleNeoDisplay text-2xl italic tracking-wider border-l-2 border-foreground pl-6 text-foreground/80">
          {children}
        </blockquote>
      ),
      quote: ({ children }) => (
        <blockquote className="font-universTypewriter text-xl text-center italic px-8 text-foreground/90">
          {children}
        </blockquote>
      ),
      preamble: ({ children }) => (
        <p className="font-baskervilleNeoText italic text-[18px] lg:text-lg  text-justify mb-6">
          {children}
        </p>
      ),
      key: ({ children }) => (
        <p className="font-universTypewriter tracking-widest uppercase text-xl">
          {children}
        </p>
      ),
      // Centred across the column: full width (w-full), as the column
      // aligns its items to the start, which would shrink it to its text
      name: ({ children }) => (
        <p className="text-[18px] lg:text-sm uppercase tracking-widest font-baskervilleNeoText   w-full text-left">
          {children}
        </p>
      ),
    },
    types: {
      image: ({ value }) =>
        articleLayout ? (
          // The text column's full width
          <BodyImage
            value={value}
            className="w-full border flex flex-col items-start"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ) : (
          // A two-screen-tall frame; the image (with its caption) sticks
          // in the middle of the screen through it, then scrolls away with
          // the frame's end before the text continues. Its box is a screen
          // tall (no padding), the image scaled to fit (max-h-full)
          <BodyImage
            value={value}
            className="w-full h-[200dvh]"
            innerClassName="sticky top-0 h-dvh flex flex-col items-start justify-center"
            imageClassName="max-h-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ),
    },
    marks: {
      em: ({ children }) => <em className="italic ">{children}</em>,
      // Added by markDropcap, not by editors in Sanity
      firstWord: ({ children }) => (
        <span className="dropcap-word font-normal">{children}</span>
      ),
      strong: ({ children }) => (
        <strong className="font-baskervilleNeoText font-normal  tracking-[24%] [font-variant-caps:all-small-caps]">
          {children}
        </strong>
      ),
      link: ({ value, children }) => (
        <a
          href={value?.href}
          className="underline underline-offset-2 hover:opacity-60 transition-opacity"
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      ),
    },
  };
}

function normalizeStyles(blocks: any[], category?: string): any[] {
  return blocks.map((block, i) => {
    let result = block;

    // existing: after "name" block, force style → normal
    if (i > 0 && blocks[i - 1]?.style === "name" && block._type === "block") {
      result = { ...result, style: "normal" };
    }

    if (
      category === "article" &&
      block._type === "block" &&
      block.style === "normal"
    ) {
      const text = block.children?.map((c: any) => c.text ?? "").join("") ?? "";

      // mark empty blocks so the renderer can suppress them
      if (text.trim() === "") {
        result = { ...result, _empty: true };
      }

      // mark block that follows an empty block as indented
      if (
        i > 0 &&
        blocks[i - 1]?._type === "block" &&
        blocks[i - 1]?.style === "normal"
      ) {
        const prevText =
          blocks[i - 1].children?.map((c: any) => c.text ?? "").join("") ?? "";
        if (prevText.trim() === "") {
          result = { ...result, _indented: true };
        }
      }
    }

    return result;
  });
}

// Index of the first normal block with text, or -1
function firstTextBlock(blocks: any[]): number {
  return blocks.findIndex(
    (b) =>
      b._type === "block" &&
      b.style === "normal" &&
      !b._empty &&
      b.children?.some((c: any) => c.text?.trim()),
  );
}

// Marks the first non-empty normal block for a drop cap, and splits the first
// word of its text into its own span with a "firstWord" mark
function markDropcap(blocks: any[]): any[] {
  const i = firstTextBlock(blocks);
  if (i === -1) return blocks;
  const block = blocks[i];
  const j = block.children.findIndex((c: any) => c.text?.trim());
  const span = block.children[j];
  const [, word, rest] = span.text.match(/^(\s*\S+)([\s\S]*)$/);
  const marks = [...(span.marks ?? []), "firstWord"];
  const split = [
    { ...span, _key: `${span._key}-first`, text: word, marks },
    ...(rest ? [{ ...span, text: rest }] : []),
  ];
  const children = [
    ...block.children.slice(0, j),
    ...split,
    ...block.children.slice(j + 1),
  ];
  return blocks.map((b, k) =>
    k === i ? { ...block, children, _dropcap: true } : b,
  );
}

// Marks the first non-empty normal block for a raised initial
function markInitial(blocks: any[]): any[] {
  const i = firstTextBlock(blocks);
  return blocks.map((b, k) => (k === i ? { ...b, _initial: true } : b));
}

type Section =
  // A wide image, on its own between the text
  | { kind: "wide"; image: any }
  // Text, with the sticky image that starts it (if any)
  | { kind: "text"; image?: any; blocks: any[] };

// Splits the blocks into sections: each sticky image starts one (holding
// the blocks after it, up to the next sticky or wide image); each wide image
// is one of its own; text before the first of them is a section without an
// image. Inline images stay among the blocks
function sections(blocks: any[]): Section[] {
  const result: Section[] = [{ kind: "text", blocks: [] }];
  for (const block of blocks) {
    const placement = block._type === "image" ? block.placement : null;
    if (placement === "wide") {
      result.push({ kind: "wide", image: block });
      result.push({ kind: "text", blocks: [] });
    } else if (placement === "sticky") {
      result.push({ kind: "text", image: block, blocks: [] });
    } else {
      const last = result[result.length - 1];
      if (last.kind === "text") last.blocks.push(block);
    }
  }
  return result.filter((s) => s.kind === "wide" || s.image || s.blocks.length);
}

export default function SanityPortableText({
  value,
  category,
  dropcap,
  initial,
  articleLayout,
}: {
  value: any;
  category?: string;
  // The article reader's layout, by each image's placement (set in Sanity):
  // sticky images beside the text that follows them, staying centred in
  // view while it's read (on desktop half the width, alternating right and
  // left; on mobile above the text, pinned below the top bar); wide images
  // full width between the text; inline images small in the text. The text
  // is half the width on desktop, centred where there's no sticky image
  articleLayout?: boolean;
  // Large first letter, with the rest of the first word in tracked capitals
  dropcap?: boolean;
  // Large first letter on the first line (not dropped)
  initial?: boolean;
}) {
  let normalized = Array.isArray(value)
    ? normalizeStyles(value, category)
    : value;
  if (dropcap && Array.isArray(normalized))
    normalized = markDropcap(normalized);
  if (initial && Array.isArray(normalized))
    normalized = markInitial(normalized);
  // Number the images in the order they come (_fig: 1, 2…), for their
  // captions ("fig 1.", "fig 2."…)
  if (Array.isArray(normalized)) {
    let fig = 0;
    normalized = normalized.map((block: any) =>
      block?._type === "image" ? { ...block, _fig: ++fig } : block,
    );
  }
  const components = buildComponents(category, articleLayout);

  if (articleLayout && Array.isArray(normalized)) {
    // Sticky images alternate sides: right, left, right…
    let stickyCount = 0;
    return (
      <div className="flex flex-col gap-24 lg:gap-6">
        {sections(normalized).map((section, i) => {
          if (section.kind === "wide") {
            return (
              <BodyImage
                key={section.image._key ?? i}
                value={section.image}
                className="w-full flex flex-col items-center"
                wide
                sizes="100vw"
              />
            );
          }

          const text = (
            // 24px between the paragraphs (and headings, quotes…); at most
            // 75 characters a line (--measure, set by ArticleReader; 75ch
            // until it's measured)
            <div className="flex flex-col items-start justify-start gap-6 min-w-0 w-full max-w-[var(--measure,75ch)] mx-auto">
              <PortableText value={section.blocks} components={components} />
            </div>
          );

          // No sticky image: the text alone, centred, half the width
          if (!section.image) {
            return (
              <section key={i} className="w-full lg:w-1/2 mx-auto">
                {text}
              </section>
            );
          }

          const left = stickyCount++ % 2 === 1;
          return (
            // Image first in the markup: above its text on mobile. On
            // desktop two equal columns, the image on the right (or, every
            // other one, the left)
            <section
              key={section.image._key ?? i}
              className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-6"
            >
              {/* Mobile: pinned below the top bar (h-16), over the text
                  as it scrolls up beneath it, at most half the screen
                  tall. Desktop: a screen-tall box, sticking at the top, the
                  image centred in it between the top and bottom bars, so it
                  stays in the middle of the screen while the section's
                  text scrolls by. self-start: a grid item stretched to the
                  row's height couldn't stick */}
              <BodyImage
                value={section.image}
                className={`sticky top-16 z-10 self-start w-full bg-background lg:top-0 lg:z-auto lg:h-dvh lg:bg-transparent flex flex-col items-start justify-center lg:row-start-1 ${left ? "lg:col-start-1" : "lg:col-start-2"}`}
                imageClassName="max-h-[50dvh] lg:max-h-full"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div
                className={`lg:row-start-1 ${left ? "lg:col-start-2" : "lg:col-start-1"}`}
              >
                {text}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-start gap-4">
      <PortableText value={normalized} components={components} />
    </div>
  );
}
