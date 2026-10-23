"use client";

import Image from "next/image";
import {
  motion,
  AnimatePresence,
  animate,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
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

// Mobile: how far (px) the panel must be pulled up past its end to close
const PULL_TO_CLOSE = 120;

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
  const { addToCart, totalItems } = useCart();
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
  const issueId = issue?._id;

  // Mobile: swipe up past the end to close. Once the panel is scrolled to
  // the bottom, pulling further up drags its content up after the finger (at
  // half speed, rubber-band style); letting go more than PULL_TO_CLOSE px up
  // slides it away and closes the panel (upwards), less springs it back
  const pull = useMotionValue(0);
  const pullOpacity = useTransform(pull, [-300, 0], [0.4, 1]);
  const [exitUp, setExitUp] = useState(false);
  const touchStartY = useRef<number | null>(null);
  function atBottom() {
    const el = scrollRef.current;
    return !!el && el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
  }
  function onTouchStart(e: React.TouchEvent) {
    // A close by any other means slides the panel down again
    setExitUp(false);
    touchStartY.current = atBottom() ? e.touches[0].clientY : null;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) {
      // Reached the bottom mid-swipe: start counting from here
      if (atBottom()) touchStartY.current = e.touches[0].clientY;
      return;
    }
    const delta = e.touches[0].clientY - touchStartY.current;
    pull.set(Math.min(0, delta) * 0.5);
  }
  function onTouchEnd() {
    touchStartY.current = null;
    if (pull.get() < -PULL_TO_CLOSE) {
      setExitUp(true);
      animate(pull, -window.innerHeight, {
        duration: 0.3,
        ease: "easeIn",
      }).then(onClose);
    } else {
      animate(pull, 0, { type: "spring", stiffness: 400, damping: 35 });
    }
  }
  // Another issue (e.g. a related one) starts back at the top of the panel,
  // and a panel closed by swiping up starts back in place when reopened
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    pull.set(0);
  }, [issueId, pull]);
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
  // Credits as Produktinfo rows: one row per role (e.g. "Omslag"), its names
  // one per line, in the order they first appear; credits without a role
  // under "Credits"
  const creditRows: { label: string; names: string[] }[] = [];
  for (const c of credits) {
    const label = c.role?.trim() || t("credits");
    const row = creditRows.find((r) => r.label === label);
    if (row) row.names.push(c.name!);
    else creditRows.push({ label, names: [c.name!] });
  }
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

  // Number + title: centred on mobile; on desktop as tall as the back
  // button, cut off when long
  const titleRow = issue && (
    <div className="flex w-full min-w-0 flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:h-9">
      <h2 className="min-w-0 truncate font-baskervilleNeoText text-xs uppercase tracking-[48%]">
        #{issue.issueNumber} — {issueTitle(issue.title)}
      </h2>
    </div>
  );
  // The price, on the "Läs mer" button's line below the description
  const price = issue?.price != null && (
    <span className="font-baskervilleNeoText text-xs uppercase italic tracking-[24%]">
      {issue.price} kr
    </span>
  );

  function handleAddToCart() {
    if (!issue) return;
    addToCart({
      id: issue._id,
      title: issue.title,
      price: issue.price != null ? `${issue.price} kr` : "0",
    });
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
            className="fixed bottom-0 top-0 lg:top-0 right-0 z-80 w-full bg-background flex flex-col shadow-md [contain:layout]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            // Closed by swiping up: leave upwards; otherwise slide down
            exit={{ y: exitUp ? "-100%" : "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Scrolls inside the panel (not the panel itself) so the pinned
                add-to-cart stays put */}
            <motion.div
              ref={scrollRef}
              style={{ y: pull, opacity: pullOpacity }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
              className="relative  flex-1 min-h-0 overflow-y-auto"
            >
              {/* Two columns on desktop: the carousel on the left, sticking
                  in place, and title, price, add to cart and the information
                  frame on the right, scrolling past it. Stacked on mobile */}
              <div className="relative lg:grid lg:grid-cols-2 lg:items-start">
                {/* Header: "☜ Tillbaka", top centre on mobile, top left on
                    desktop; dark text (the link variant's own text is
                    white). Positioned on the scrolling content (not fixed,
                    and outside the sticky left column), so it scrolls away
                    with the panel */}
                <div className="flex top-12 lg:top-18 left-3 right-3 z-90 absolute shrink-0 items-start justify-center lg:justify-start gap-3 lg:gap-6 h-auto lg:h-9  lg:px-0 lg:pt-0  ">
                  {/* Left-pointing hand before the label (instead of the
                      link variant's ☜ after it) */}
                  <Button
                    variant="link"
                    size="xs"
                    className="shrink-0 w-auto h-12 lg:h-9 gap-2 text-foreground after:content-none"
                    onClick={onClose}
                  >
                    <span aria-hidden className="font-baskervilleNeoDisplay">
                      ☜
                    </span>
                    {t("back")}
                  </Button>
                </div>
                {/* First screen: header, carousel, title, price. On mobile
                  as tall as the panel (the screen minus the navbar), so the
                  information frame starts below the fold; on desktop the
                  left column, the full screen height, dark (bg-foreground,
                  light text for the arrows and counter) */}
                <section className="relative flex h-[calc(100dvh-3.75rem)] lg:h-dvh lg:sticky lg:top-0 flex-col px-3 ">
                  {/* Carousel (and, on mobile, title and price), centred in the
                panel. On mobile the bottom padding clears the pinned
                add-to-cart (5rem) and its 2rem fade; on desktop the column is
                the full screen height with no vertical padding or gap (the
                block after the carousel is empty there), so the image sits in
                the vertical centre of the viewport */}
                  <div
                    className="relative flex flex-1 min-h-0 flex-col items-center justify-center pt-24 gap-0 px-6 lg:px-12 pb-24 lg:py-0"
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
                        className="hidden lg:block pointer-events-none absolute z-10 whitespace-nowrap font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]"
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
                      <div className="relative flex w-full shrink-0 flex-col items-center gap-6">
                        {/* Clicking (or tapping) the image row shows the
                            next image */}
                        <div
                          className={`flex w-full items-center justify-center gap-2 ${images.length > 1 ? "cursor-pointer" : ""}`}
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
                              className="min-w-0 w-1/2 lg:w-auto lg:max-w-full mx-auto"
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
                                className="w-full h-auto lg:w-auto lg:h-[50dvh] lg:max-w-full object-contain"
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
                        {/* Under the image, out of the centring (absolute), so
                            the image itself sits in the middle: the position */}
                        <div className="absolute inset-x-0 top-full mt-12 flex flex-col items-center gap-6">
                          {/* Position, e.g. "1 av 5", just under the image: on
                            mobile; on desktop only for screen readers (the label
                            by the mouse pointer shows it). Announced as it
                            changes */}
                          {
                            <span
                              aria-live="polite"
                              className="text-center font-baskervilleNeoDisplay text-xs uppercase tracking-[24%] lg:sr-only"
                            >
                              {t("imageOf", {
                                current: imageIndex + 1,
                                total: images.length,
                              })}
                            </span>
                          }
                        </div>
                      </div>
                    )}
                    {/* Mobile: number + title, 24px above the pinned
                        add-to-cart (the section ends 3.75rem above the panel's
                        bottom, the bar is 5rem tall: 5 - 3.75 + 1.5 = 2.75rem).
                        On desktop it's at the top of the right column */}
                    <div className="lg:hidden absolute inset-x-6 bottom-11 flex min-w-0 flex-col items-center">
                      {titleRow}
                    </div>
                    {/* Below the carousel: the pinned add-to-cart (mobile) */}
                    <div className="flex shrink-0 flex-col items-center gap-6">
                      {/* Mobile only: add to cart pinned to the bottom of the
                          panel (on desktop it's above the product table) */}
                      <div className="lg:hidden fixed inset-x-0 lg:left-1/2 bottom-0 z-10 bg-background lg:bg-transparent before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-linear-to-b before:from-transparent before:to-background before:pointer-events-none px-6 lg:px-12 pt-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pb-6">
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
                </section>

                {/* Information frame (the right column on desktop), one
                  column: the description, then contributors, editors and
                  product information (collapsible), then the credits list.
                  At least a screen tall, longer if the text needs it */}
                <section
                  ref={infoRef}
                  className="flex flex-col min-h-dvh gap-12 px-6 lg:pl-0 lg:pr-48 lg:pt-24   lg:pb-24 0 "
                >
                  {/* Desktop: number + title (price on the right) at the top
                      of the right column, 24px below the back button (lg:mt-9,
                      measured). Static, so it scrolls away */}
                  <div className="hidden lg:flex lg:mt-9 w-full min-w-0">
                    {titleRow}
                  </div>
                  {/* Description */}
                  <div className="flex flex-col gap-6 mt-6 lg:mt-0 col-span-2">
                    {/* Justified, hyphenated (in the page's language) to keep
                      the word spacing even */}
                    {issue.description && (
                      // Cut short behind "Läs mer" (new per issue, so it
                      // starts folded each time)
                      <ReadMore key={issue._id} aside={price}>
                        <div className="flex  flex-col [&_p]:text-justify [&_p]:hyphens-auto">
                          <SanityPortableText value={issue.description} />
                        </div>
                      </ReadMore>
                    )}
                  </div>
                  {/* Desktop: add to cart, full width above the product
                      table, styled like the mobile pinned bar's button
                      ("Slutsåld", disabled, for a sold-out issue) */}
                  <Button
                    variant="default"
                    size="default"
                    disabled={soldOut}
                    className="hidden lg:flex w-full justify-center bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed font-baskervilleNeoText text-xs tracking-[24%] uppercase hover:bg-foreground"
                    onClick={handleAddToCart}
                  >
                    {soldOut ? t("soldOut") : t("addToCart")}
                  </Button>
                  {/* Produktinfo: always shown, a two-column table — rows
                      stacked with no gaps, each drawing its sides and bottom
                      (the table draws the top line, so no line doubles), a
                      line between the title (first half) and the value.
                      Contributors and editors first (one name per line),
                      then the credits (a row per role), then the product
                      details */}
                  <div className="flex w-full flex-col items-start gap-0 col-span-2 mb-28">
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
                        ...creditRows,
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
                </section>
              </div>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
