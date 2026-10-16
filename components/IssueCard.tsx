"use client";

import Image from "next/image";
import { motion, AnimatePresence, useInView } from "motion/react";
import { urlFor } from "@/lib/sanity/image";
import { useCart } from "@/lib/contexts/CartContext";
import { type Issue, useIssues } from "@/lib/contexts/IssuesContext";
import SanityPortableText from "@/components/SanityPortableText";
import IssueTile from "@/components/IssueTile";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { issueTitle } from "@/lib/issueTitle";

type ImageItem = { asset: any; alt?: string; _key?: string };

// Number of other issues shown under Related items
const RELATED_COUNT = 4;

// Product information shown where an issue doesn't have it in Sanity
const PRODUCT_PLACEHOLDER = {
  binding: "softcover",
  pages: 125,
  isbn: "978-3-85676-501-9",
};

// Issue panel: two screens, one vertical column on every screen size. The
// first (one screen tall) has the header (back, cart), an image carousel with
// arrows + position ([1/3]), number + title, price and an Information link;
// scrolling down shows the second, with the description, contributors, editors
// and credits, then related issues and the site footer. Add to cart stays
// pinned to the bottom. Slides in up from the bottom, full width
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
  // Contributors, editors and product information start collapsed; their
  // buttons toggle them
  const [open, setOpen] = useState({
    contributors: false,
    editors: false,
    productInfo: false,
  });
  function toggle(section: keyof typeof open) {
    setOpen((current) => ({ ...current, [section]: !current[section] }));
  }
  // The pointing hand: ☞ while collapsed, ☟ when open
  const handClass = (isOpen: boolean) =>
    isOpen ? "after:content-['☟']" : "after:content-['☞']";
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

  // One name per line or comma in Sanity's Contributors and Editors
  // fields
  const splitNames = (names?: string) =>
    (names ?? "")
      .split(/[\n,]/)
      .map((name) => name.trim())
      .filter(Boolean);
  const contributors = splitNames(issue?.contributors);
  const editors = splitNames(issue?.editors);
  const credits = issue?.credits?.filter((c) => c.name) ?? [];
  // Product information rows (title + value). Year, format, language and
  // weight come from Sanity and are left out when not set; binding, pages
  // and ISBN fall back to PRODUCT_PLACEHOLDER
  const cover = issue?.dimensions?.cover;
  const productInfo = [
    { label: t("productYear"), value: issue?.publishedAt?.slice(0, 4) },
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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-70 w-full bg-foreground/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            aria-label={issueTitle(issue.title)}
            className="fixed inset-y-0 right-0 z-80 w-full bg-background flex flex-col shadow-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Scrolls inside the panel (not the panel itself) so the pinned
                add-to-cart stays put */}
            <div
              ref={scrollRef}
              className="relative flex-1 min-h-0 overflow-y-auto"
            >
              {/* First screen: header, carousel, title, price. A full
                  screen tall, so the information frame starts below the fold */}
              <section className="flex h-dvh flex-col">
                {/* Header: back left, cart right */}
                <div className="flex shrink-0 items-center justify-between gap-3 lg:gap-6 h-16 lg:h-24 px-6 lg:px-12 lg:pt-12">
                  {/* Left-pointing hand before the label (instead of the link
                  variant's ☜ after it) */}
                  <Button
                    variant="link"
                    size="xs"
                    className="justify-self-start w-auto h-auto gap-2 after:content-none"
                    onClick={onClose}
                  >
                    <span aria-hidden className="font-baskervilleNeoDisplay">
                      ☜
                    </span>
                    {t("back")}
                  </Button>
                  {/* Cart: closes the panel (it sits above the cart drawer) and
                  opens the drawer */}
                  <Button
                    variant="link"
                    size="xs"
                    className="justify-self-end w-auto h-auto after:content-none"
                    onClick={() => {
                      onClose();
                      setDrawerOpen(true);
                    }}
                    aria-label={tNav("openCart")}
                  >
                    {/* Just the item count, as in the nav header */}
                    <motion.span
                      key={totalItems}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {totalItems}
                    </motion.span>
                  </Button>
                </div>

                {/* Carousel, title and price, centred in the rest of the screen.
                The bottom padding clears the pinned add-to-cart (5rem tall on
                mobile, 6.5rem on desktop) and its 2rem fade */}
                <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-12 lg:gap-12 px-6 lg:px-12 pb-28 lg:pb-34 lg:pt-36">
                  {/* Image carousel: one image at a time, pointing hands ☜ / ☞
                  right beside it, vertically centred, and the position below
                  it ([1/3]). Wraps around at either end */}
                  {images.length > 0 && (
                    <div className="flex w-full shrink-0 flex-col items-center gap-6">
                      <div className="flex w-full items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={t("previousImage")}
                          className="shrink-0 p-2 font-baskervilleNeoDisplay text-xl hover:opacity-60 transition-opacity"
                          onClick={() => showImage(imageIndex - 1)}
                        >
                          ☜
                        </button>
                        {/* min-w-0 lets a wide image shrink to leave room for
                            the arrows */}
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={imageIndex}
                            className="min-w-0 max-w-1/2 mx-auto"
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
                              className=" w-auto h-[40dvh] max-w-full lg:max-w-[70vw] object-contain"
                            />
                          </motion.div>
                        </AnimatePresence>
                        <button
                          type="button"
                          aria-label={t("nextImage")}
                          className="shrink-0 p-2 font-baskervilleNeoDisplay text-xl hover:opacity-60 transition-opacity"
                          onClick={() => showImage(imageIndex + 1)}
                        >
                          ☞
                        </button>
                      </div>
                      {/* Position, e.g. [1/3]; announced as it changes */}
                      <span
                        aria-live="polite"
                        className="font-baskervilleNeoDisplay text-xs tracking-[24%]"
                      >
                        [{imageIndex + 1}/{images.length}]
                      </span>
                    </div>
                  )}

                  {/* Below the indicators: number + title, price below it, add to cart */}
                  <div className="flex shrink-0 flex-col items-center mt-6 lg:mt-0 gap-6 lg:gap-6">
                    <h2 className="text-center font-baskervilleNeoDisplay text-xs uppercase tracking-[24%]">
                      <span>
                        #{issue.issueNumber} — {issueTitle(issue.title)}
                      </span>
                    </h2>
                    {issue.price != null && (
                      <span className="font-baskervilleNeoDisplay text-xs uppercase italic tracking-[24%]">
                        {issue.price} kr
                      </span>
                    )}
                    {/* Scrolls down to the information frame */}
                    <Button
                      variant="link"
                      size="xs"
                      className="w-auto mb-0 lg:mb-12 after:content-['☟'] after:opacity-100"
                      onClick={() => scrollPanelTo(infoRef.current)}
                    >
                      {t("information")}
                    </Button>
                    {/* Add to cart: pinned to the bottom of the screen (fixed is
                    relative to the panel, which fills the screen). Full width
                    on mobile, centred and at most 320px wide on desktop. A
                    2rem strip above it fades from transparent to the
                    background, so content scrolls under a soft edge */}
                    <div className="fixed inset-x-0  bottom-0 z-10 bg-background before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-linear-to-b before:from-transparent before:to-background before:pointer-events-none px-6 lg:px-12 pt-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pb-6">
                      {/* Back to shop instead once the related items are in
                          view */}
                      <Button
                        variant="outline"
                        size="default"
                        disabled={!atEnd && soldOut}
                        className="w-full lg:mx-auto lg:flex justify-center bg-background disabled:opacity-30 disabled:cursor-not-allowed font-baskervilleNeoText text-xs tracking-[24%] uppercase hover:bg-foreground hover:text-background"
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

              {/* Information frame: a four-column grid on desktop —
                  contributors, editors and product information (collapsible)
                  in column 1, the description across columns 2–3, the credits
                  list in column 4. Stacked on mobile with the description
                  first. At least a screen tall, longer if the text needs it */}
              <section
                ref={infoRef}
                className="grid min-h-dvh grid-cols-1 lg:grid-cols-4 content-start items-stretch gap-12 px-6 lg:px-12 pt-12 pb-12"
              >
                {/* Description across columns 2–3 (first on mobile). Its
                    button scrolls the panel here; the link variant's
                    hover-only ☜ after the label becomes an always-visible
                    down-pointing hand (☟) */}
                <div className="flex flex-col gap-6 lg:col-start-2 lg:col-span-2 lg:row-start-1">
                  <Button
                    variant="link"
                    size="xs"
                    className="self-start w-auto after:content-['☟'] after:opacity-100"
                    onClick={() => scrollPanelTo(infoRef.current)}
                  >
                    {t("description")}
                  </Button>
                  {/* Justified, hyphenated (in the page's language) to keep
                      the word spacing even */}
                  {issue.description && (
                    <div className="flex  flex-col [&_p]:text-justify [&_p]:hyphens-auto">
                      <SanityPortableText value={issue.description} />
                    </div>
                  )}
                </div>
                {/* Column 1: contributors, editors and product information,
                    each collapsed until its button is clicked */}
                <div className="flex flex-col gap-12 lg:gap-6 lg:col-start-1 lg:row-start-1">
                  {/* Contributors: one name per line */}
                  <div className="flex w-full flex-col items-start gap-6 ">
                    <Button
                      variant="link"
                      size="xs"
                      className={`self-start w-auto ${handClass(open.contributors)} after:opacity-100`}
                      aria-expanded={open.contributors}
                      onClick={() => toggle("contributors")}
                    >
                      {t("contributors")}
                    </Button>
                    {open.contributors && contributors.length > 0 && (
                      <ul className="flex flex-col items-start text-left font-baskervilleNeoText text-neutral-700 leading-[1.5] tracking-[6%] text-sm ">
                        {contributors.map((name, i) => (
                          <li key={i}>{name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Editors, styled like contributors */}
                  {editors.length > 0 && (
                    <div className="flex w-full flex-col items-start gap-6">
                      <Button
                        variant="link"
                        size="xs"
                        className={`self-start w-auto ${handClass(open.editors)} after:opacity-100`}
                        aria-expanded={open.editors}
                        onClick={() => toggle("editors")}
                      >
                        {t("editors")}
                      </Button>
                      {open.editors && (
                        <ul className="flex flex-col items-start text-left font-baskervilleNeoText text-neutral-700 leading-[1.5] tracking-[6%] text-sm">
                          {editors.map((name, i) => (
                            <li key={i}>{name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {/* Product information: titles in a fixed-width column so
                      the values line up */}
                  <div className="flex w-full flex-col items-start gap-6">
                    <Button
                      variant="link"
                      size="xs"
                      className={`self-start w-auto ${handClass(open.productInfo)} after:opacity-100`}
                      aria-expanded={open.productInfo}
                      onClick={() => toggle("productInfo")}
                    >
                      {t("productInfo")}
                    </Button>
                    {open.productInfo && (
                      <dl className="flex w-full flex-col gap-3 font-baskervilleNeoText text-neutral-700 leading-[1.5] tracking-[6%] text-xs">
                        {productInfo.map((row) => (
                          <div
                            key={row.label}
                            className="grid grid-cols-[6rem_1fr] gap-6  tracking-[24%]"
                          >
                            <dt className=" not-italic uppercase text-xs text-neutral-400 ">
                              {row.label}
                            </dt>
                            <dd>{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </div>
                {/* Fourth column: the credits list */}
                {credits.length > 0 && (
                  <dl className="flex flex-col items-start gap-1 font-baskervilleNeoText text-xs tracking-[3%] text-neutral-700 leading-[1.5] lg:col-start-4 lg:row-start-1">
                    {credits.map((c) => (
                      <div key={c._key} className="flex gap-2">
                        {c.role && <dt>{c.role}:</dt>}
                        <dd>{c.name}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>

              <div ref={endRef}>
                {/* Related items: the other issues nearest in number, as shop
                  tiles (two columns on mobile); picking one opens it
                  in this panel, replacing this one in the history */}
                {related.length > 0 && (
                  <section
                    ref={relatedRef}
                    className="flex flex-col items-center gap-6 pt-12 lg:px-6"
                  >
                    <Button
                      variant="link"
                      size="xs"
                      className="self-center w-auto after:content-['☟'] after:opacity-100"
                      onClick={() => scrollPanelTo(relatedRef.current)}
                    >
                      {t("related")}
                    </Button>
                    <div className="grid w-full grid-cols-2 lg:grid-cols-4">
                      {related.map((other) => (
                        <IssueTile key={other._id} issue={other} replace />
                      ))}
                    </div>
                  </section>
                )}

                {/* Site footer (the page's own is behind the panel); extra
                  bottom padding clears the pinned add-to-cart */}
                <div className="pb-20 lg:pb-28">
                  <Footer />
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
