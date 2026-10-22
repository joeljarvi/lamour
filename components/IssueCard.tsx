"use client";

import Image from "next/image";
import { motion, AnimatePresence, useInView } from "motion/react";
import { urlFor } from "@/lib/sanity/image";
import { useCart } from "@/lib/contexts/CartContext";
import { type Issue, useIssues } from "@/lib/contexts/IssuesContext";
import SanityPortableText from "@/components/SanityPortableText";
import IssueTile from "@/components/IssueTile";
import Footer from "@/components/Footer";
import ReadMore from "@/components/ReadMore";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { issueTitle } from "@/lib/issueTitle";
import { splitNames } from "@/lib/splitNames";

type ImageItem = { asset: any; alt?: string; _key?: string };

// Number of other issues shown under Related items
const RELATED_COUNT = 4;

// Product information shown where an issue doesn't have it in Sanity
const PRODUCT_PLACEHOLDER = {
  releaseDate: "2026-11-12",
  binding: "softcover",
  pages: 125,
  isbn: "978-3-85676-501-9",
};

// Issue panel: two screens, one vertical column on every screen size. The
// first (one screen tall) has the header (back, cart), an image carousel with
// arrows + position ([1/3]), number + title, price and an Information link;
// scrolling down shows the second, with the description, contributors, editors
// and credits, then related issues and the site footer. Add to cart stays
// pinned to the bottom. Slides in up from the bottom, below the navbar,
// full width
export default function IssueCard({
  issue,
  onClose,
  onExited,
}: {
  issue: Issue | null;
  onClose: () => void;
  // Called once the panel has finished sliding out
  onExited?: () => void;
}) {
  const t = useTranslations("Issue");
  const tNav = useTranslations("Nav");
  const { addToCart, setDrawerOpen, totalItems } = useCart();
  // The panel's scroll container, and the sections its buttons scroll to
  const scrollRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLElement>(null);
  const relatedRef = useRef<HTMLElement>(null);
  // Related items + footer: once they reach the middle of the screen, the
  // pinned add-to-cart turns into a back-to-shop button
  const endRef = useRef<HTMLDivElement>(null);
  const atEnd = useInView(endRef, {
    root: scrollRef,
    margin: "0px 0px -50% 0px",
  });
  // Smooth-scrolls the panel so `el` is at the top
  function scrollPanelTo(el: HTMLElement | null) {
    if (scrollRef.current && el)
      scrollRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  }
  // The other issues nearest in number to this one
  const allIssues = useIssues();
  const related = issue
    ? allIssues
        .filter((other) => other._id !== issue._id)
        .sort(
          (a, b) =>
            Math.abs(a.issueNumber - issue.issueNumber) -
            Math.abs(b.issueNumber - issue.issueNumber),
        )
        .slice(0, RELATED_COUNT)
    : [];
  // Another issue (e.g. a related one) starts back at the top of the panel
  const issueId = issue?._id;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [issueId]);
  // Where the mouse pointer is over the carousel (for its "1 of 5" label),
  // or null while it's elsewhere
  const [cursorAt, setCursorAt] = useState<{ x: number; y: number } | null>(
    null,
  );
  // Carousel position, per issue — opening another issue starts at its cover
  const [imageAt, setImageAt] = useState<{ id: string; index: number } | null>(
    null,
  );

  const images: ImageItem[] = issue
    ? [
        ...(issue.cover?.asset ? [issue.cover as ImageItem] : []),
        ...(issue.previewImages?.filter((img) => img.asset) ?? []),
      ]
    : [];
  const imageIndex =
    issue && imageAt?.id === issue._id
      ? Math.min(imageAt.index, images.length - 1)
      : 0;
  function showImage(index: number) {
    if (!issue || images.length === 0) return;
    // Wrap around at either end
    const n = images.length;
    setImageAt({ id: issue._id, index: ((index % n) + n) % n });
  }

  const contributors = splitNames(issue?.contributors);
  const editors = splitNames(issue?.editors);
  const credits = issue?.credits?.filter((c) => c.name) ?? [];
  // Product information rows (title + value). Year, format, language and
  // weight come from Sanity and are left out when not set; binding, pages
  // and ISBN fall back to PRODUCT_PLACEHOLDER
  const cover = issue?.dimensions?.cover;
  const productInfo = [
    { label: t("productYear"), value: issue?.publishedAt?.slice(0, 4) },
    // Short date, e.g. 12.11.26 (like the articles list); placeholder until
    // the issue has a release date in Sanity
    {
      label: t("productReleaseDate"),
      value: new Date(
        issue?.releaseDate ?? PRODUCT_PLACEHOLDER.releaseDate,
      ).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "Europe/Stockholm",
      }),
    },
    {
      label: t("productFormat"),
      value:
        cover?.width != null && cover?.height != null
          ? t("productDimensions", {
              width: cover.width / 10,
              height: cover.height / 10,
            })
          : null,
    },
    {
      label: t("productBinding"),
      value: t("productBindingType", {
        binding: issue?.binding ?? PRODUCT_PLACEHOLDER.binding,
      }),
    },
    {
      label: t("productPages"),
      value: String(issue?.pageCount ?? PRODUCT_PLACEHOLDER.pages),
    },
    { label: "ISBN", value: issue?.isbn || PRODUCT_PLACEHOLDER.isbn },
    // Language code: SV / EN
    { label: t("productLanguage"), value: issue?.language?.toUpperCase() },
    {
      label: t("productWeight"),
      value: issue?.weight != null ? `${issue.weight} g` : null,
    },
  ].filter((row): row is { label: string; value: string } => !!row.value);
  const soldOut = issue?.inStock === false;

  // Number + title, and the price below
  const titlePrice = issue && (
    <>
      <h2 className="max-w-full truncate font-baskervilleNeoText text-lg uppercase tracking-[24%] mb-1">
        #{issue.issueNumber} — {issueTitle(issue.title)}
      </h2>
      {issue.price != null && (
        <span className="font-baskervilleNeoText text-lg uppercase italic tracking-[24%]">
          {issue.price} kr
        </span>
      )}
    </>
  );

  function handleAddToCart() {
    if (!issue) return;
    addToCart({
      id: issue._id,
      title: issue.title,
      price: issue.price != null ? `${issue.price} kr` : "0",
    });
    setDrawerOpen(true);
    onClose();
  }

  return (
    <AnimatePresence onExitComplete={onExited}>
      {issue && (
        <>
          {/* Backdrop and panel fill the screen beneath the navbar, which
              sits above them (z-90) and stays visible; the panel's own
              header starts below the navbar (60px on mobile: its 12px top
              padding + 48px header; 48px on desktop) */}
          {/* Backdrop */}
          <motion.div
            className="fixed inset-x-0 bottom-0 top-0 lg:top-0 z-70 w-full bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel, full width. It's the containing block for its fixed
              add-to-cart bar (contain: layout), so that bar always spans
              the panel */}
          <motion.aside
            aria-label={issueTitle(issue.title)}
            className="fixed bottom-0 top-15 lg:top-0 right-0 z-80 w-full bg-background flex flex-col shadow-md [contain:layout]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Scrolls inside the panel (not the panel itself) so the pinned
                add-to-cart stays put */}
            <div
              ref={scrollRef}
              className="relative  flex-1 min-h-0 overflow-y-auto"
            >
              {/* Two columns on desktop: the carousel on the left, sticking
                  in place, and title, price, add to cart and the information
                  frame on the right, scrolling past it. Stacked on mobile */}
              <div className="lg:grid lg:grid-cols-2 lg:items-start">
                {/* First screen: header, carousel, title, price. On mobile
                  as tall as the panel (the screen minus the navbar), so the
                  information frame starts below the fold; on desktop the
                  left column, the full screen height, dark (bg-foreground,
                  light text for the arrows and counter) */}
                <section className="relative flex h-[calc(100dvh-3.75rem)] lg:h-dvh lg:sticky lg:top-0 flex-col px-3 lg:bg-foreground lg:text-background">
                  {/* Header: back, top left (the title and price are below
                      the carousel on mobile, at the top of the right column
                      on desktop) */}
                  <div className="flex top-15 lg:top-18 left-3 right-3 z-90 fixed shrink-0 items-start justify-between gap-3 lg:gap-6 h-auto lg:h-9  lg:px-0 lg:pt-0  ">
                    <Button
                      variant="link"
                      size="xs"
                      className="shrink-0 w-auto h-12 gap-2  after:content-none"
                      onClick={onClose}
                    >
                      <span aria-hidden className="font-baskervilleNeoDisplay">
                        ☜
                      </span>
                      {t("back")}
                    </Button>
                  </div>

                  {/* Carousel (and, on mobile, title and price), centred in the
                panel. On mobile the bottom padding clears the pinned
                add-to-cart (5rem) and its 2rem fade; on desktop the column is
                the full screen height with no vertical padding or gap (the
                block after the carousel is empty there), so the image sits in
                the vertical centre of the viewport */}
                  <div
                    className="relative flex flex-1 min-h-0 flex-col items-center justify-center gap-12 lg:gap-0 px-6 lg:px-12 pb-28 lg:py-0"
                    // With a mouse, a "1 of 5" label follows the pointer
                    onPointerMove={(e) => {
                      if (e.pointerType !== "mouse") return;
                      const box = e.currentTarget.getBoundingClientRect();
                      setCursorAt({
                        x: e.clientX - box.left,
                        y: e.clientY - box.top,
                      });
                    }}
                    onPointerLeave={() => setCursorAt(null)}
                  >
                    {/* "1 of 5" next to the mouse pointer while it's over the
                        carousel */}
                    {cursorAt && images.length > 0 && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute z-10 whitespace-nowrap font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]"
                        style={{ left: cursorAt.x + 16, top: cursorAt.y + 16 }}
                      >
                        {t("imageOf", {
                          current: imageIndex + 1,
                          total: images.length,
                        })}
                      </span>
                    )}
                    {/* Image carousel: one image at a time, vertically centred;
                  clicking moves to the next (wrapping around). The position
                  shows next to the mouse pointer (desktop) or at the bottom
                  of the panel (mobile) */}
                    {images.length > 0 && (
                      <div className="flex w-1/2 lg:w-full shrink-0 flex-col items-center gap-6">
                        {/* Clicking (or tapping) the image row shows the
                            next image */}
                        <div
                          className="flex w-full items-center justify-center gap-2 cursor-pointer"
                          onClick={() => showImage(imageIndex + 1)}
                        >
                          {/* Keyboard / screen reader: previous and next,
                              invisible until focused */}
                          <button
                            type="button"
                            aria-label={t("previousImage")}
                            className="sr-only focus-visible:not-sr-only"
                            onClick={(e) => {
                              e.stopPropagation();
                              showImage(imageIndex - 1);
                            }}
                          >
                            ☜
                          </button>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={imageIndex}
                              className="min-w-0 max-w-1/2 lg:max-w-full mx-auto"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Image
                                src={urlFor(images[imageIndex]).url()}
                                alt={images[imageIndex].alt ?? ""}
                                width={0}
                                height={0}
                                sizes="(min-width: 1024px) 40vw, 70vw"
                                className=" w-auto h-[50dvh] max-w-full object-contain"
                              />
                            </motion.div>
                          </AnimatePresence>
                          <button
                            type="button"
                            aria-label={t("nextImage")}
                            className="sr-only focus-visible:not-sr-only"
                            onClick={(e) => {
                              e.stopPropagation();
                              showImage(imageIndex + 1);
                            }}
                          >
                            ☞
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Below the indicators: number + title, price below it, add to cart */}
                    <div className="flex shrink-0 flex-col items-center mt-18 lg:mt-0 gap-6 lg:gap-6">
                      {/* Mobile: number + title and price below the carousel (on
                          desktop they're at the top of the right column) */}
                      <div className="flex w-full min-w-0 flex-col items-start lg:hidden">
                        {titlePrice}
                      </div>
                      <div className="fixed inset-x-0 lg:left-1/2 bottom-0 z-10 bg-background lg:bg-transparent before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-linear-to-b before:from-transparent before:to-background before:pointer-events-none px-6 lg:px-12 pt-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pb-6">
                        {/* Back to shop instead once the related items are in
                          view */}
                        <Button
                          variant="default"
                          size="default"
                          disabled={!atEnd && soldOut}
                          className="w-full lg:mx-auto lg:flex justify-center bg-foreground disabled:opacity-30 disabled:cursor-not-allowed font-baskervilleNeoText text-xs tracking-[24%] uppercase hover:bg-foreground text-background"
                          onClick={atEnd ? onClose : handleAddToCart}
                        >
                          {atEnd
                            ? t("backToShop")
                            : soldOut
                              ? t("soldOut")
                              : t("addToCart")}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Position, e.g. "1 of 5": on mobile at the bottom of the
                      carousel panel, just above the pinned add-to-cart and
                      its fade; on desktop only for screen readers (the label
                      by the pointer shows it). Announced as it changes */}
                  {images.length > 0 && (
                    <span
                      aria-live="polite"
                      className="absolute inset-x-0 bottom-28 text-center font-baskervilleNeoDisplay text-xs uppercase tracking-[24%] lg:sr-only"
                    >
                      {t("imageOf", {
                        current: imageIndex + 1,
                        total: images.length,
                      })}
                    </span>
                  )}
                </section>

                {/* Information frame (the right column on desktop), one
                  column: the description, then contributors, editors and
                  product information (collapsible), then the credits list.
                  At least a screen tall, longer if the text needs it */}
                <section
                  ref={infoRef}
                  className="flex flex-col min-h-dvh gap-12 px-6 lg:px-12 pt-12 pb-12 0"
                >
                  {/* Desktop: number + title and price, fixed at top-18 like
                      the back button, at the start of the right column. The
                      title sits in a 36px row with its text centred, like
                      the button's label, so the two share a baseline. On
                      mobile they're below the carousel */}
                  <div className="hidden lg:flex lg:fixed lg:top-18 lg:left-1/2 lg:px-12 z-90 flex-col items-start gap-0 [&>h2]:h-9 [&>h2]:flex [&>h2]:items-center">
                    {titlePrice}
                  </div>
                  {/* Description */}
                  <div className="flex flex-col gap-6 mt-6 lg:mt-36 col-span-2">
                    {/* Justified, hyphenated (in the page's language) to keep
                      the word spacing even */}
                    {issue.description && (
                      // Cut short behind "Läs mer" (new per issue, so it
                      // starts folded each time)
                      <ReadMore key={issue._id}>
                        <div className="flex  flex-col [&_p]:text-justify [&_p]:hyphens-auto">
                          <SanityPortableText value={issue.description} />
                        </div>
                      </ReadMore>
                    )}
                  </div>
                  {/* Produktinfo: always shown, a two-column table — rows
                      stacked with no gaps, each drawing its sides and bottom
                      (the table draws the top line, so no line doubles), a
                      line between the title (first half) and the value. Contributors and editors first (one name per
                      line), then the product details */}
                  <div className="flex w-full flex-col items-start gap-0 col-span-2">
                    <dl className="flex w-full flex-col border-t border-t-neutral-600 font-baskervilleNeoText text-neutral-700 leading-[1.5] tracking-[6%] text-xs">
                      {[
                        ...(contributors.length > 0
                          ? [
                              {
                                label: t("contributors"),
                                names: contributors,
                              },
                            ]
                          : []),
                        ...(editors.length > 0
                          ? [{ label: t("editors"), names: editors }]
                          : []),
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-2 tracking-[24%] border-x border-b border-neutral-600"
                        >
                          <dt className="not-italic uppercase text-xs text-neutral-400 px-3 py-2 border-r border-r-neutral-600">
                            {row.label}
                          </dt>
                          {/* One name per line, each with a line under it
                                running the cell's width; the padding moves
                                onto the names, and the last has no line (the
                                row's own border closes it) */}
                          <dd>
                            <ul>
                              {row.names.map((name, i) => (
                                <li
                                  key={i}
                                  className="px-3 py-2 border-b border-b-neutral-600 last:border-b-0"
                                >
                                  {name}
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      ))}
                      {productInfo.map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-2 tracking-[24%] border-x border-b border-neutral-600"
                        >
                          <dt className="not-italic uppercase text-xs text-neutral-400 px-3 py-2 border-r border-r-neutral-600">
                            {row.label}
                          </dt>
                          <dd className="px-3 py-2">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  {/* Credits list */}
                  {credits.length > 0 && (
                    <dl className="flex flex-col items-start gap-0 font-baskervilleNeoText text-xs tracking-[3%] text-neutral-700 leading-[1.5]">
                      {credits.map((c) => (
                        <div key={c._key} className="flex gap-2">
                          {c.role && <dt>{c.role}:</dt>}
                          <dd>{c.name}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
