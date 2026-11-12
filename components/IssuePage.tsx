"use client";

import Image from "next/image";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { urlFor } from "@/lib/sanity/image";
import { useCart } from "@/lib/contexts/CartContext";
import { type Issue } from "@/lib/contexts/IssuesContext";
import { issueTitle } from "@/lib/issueTitle";
import { splitNames } from "@/lib/splitNames";
import SanityPortableText from "@/components/SanityPortableText";
import ReadMore from "@/components/ReadMore";
import { Button } from "./ui/button";
import { Field, LABEL, useProductInfo } from "./IssueInfo";
import BackgroundMedia, { hasBackgroundMedia } from "./BackgroundMedia";

// Mobile: how far (px) the page must be pulled up past its end to close
const PULL_TO_CLOSE = 120;

// An issue as a full-screen page over the shop (opened as a modal from the
// shop, or on its own at /shop/[slug]). A hero, 75% of the screen tall, with
// the issue number large in the middle; then the issue on a 12-column grid
// on desktop: title, price, description, add to cart and credits (4
// columns); a column gap; editors and contributors (3); the cover (4). Stacked on mobile,
// the cover first. Slides up from the bottom; "Stäng (x)" top right
export default function IssuePage({
  issue,
  onClose,
  onExited,
}: {
  issue: Issue | null;
  onClose: () => void;
  // Called once the page has finished sliding out
  onExited?: () => void;
}) {
  const t = useTranslations("Issue");
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const issueId = issue?._id;

  // Mobile: swipe up past the end to close. Once scrolled to the bottom,
  // pulling further up drags the content after the finger (at half speed,
  // rubber-band style); letting go more than PULL_TO_CLOSE px up slides it
  // away and closes it (upwards), less springs it back
  const pull = useMotionValue(0);
  const pullOpacity = useTransform(pull, [-300, 0], [0.4, 1]);
  const [exitUp, setExitUp] = useState(false);
  const touchStartY = useRef<number | null>(null);
  function atBottom() {
    const el = scrollRef.current;
    return !!el && el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
  }
  function onTouchStart(e: React.TouchEvent) {
    setExitUp(false);
    touchStartY.current = atBottom() ? e.touches[0].clientY : null;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) {
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
  // Another issue starts back at the top, and a page closed by swiping up
  // starts back in place when reopened
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    pull.set(0);
  }, [issueId, pull]);

  function handleAddToCart() {
    if (!issue) return;
    addToCart({
      id: issue._id,
      title: issue.title,
      price: issue.price != null ? `${issue.price} kr` : "0",
    });
    onClose();
  }

  const soldOut = issue?.inStock === false;
  const hasHero = hasBackgroundMedia(issue?.heroMedia ?? null);
  const productInfo = useProductInfo(issue);
  const contributors = splitNames(issue?.contributors);
  const editors = splitNames(issue?.editors);
  // Credits, one field per role (e.g. "Omslag"), its names one per line,
  // in the order they first appear; credits without a role under "Credits"
  const creditRows: { label: string; names: string[] }[] = [];
  for (const c of issue?.credits?.filter((c) => c.name) ?? []) {
    const label = c.role?.trim() || t("credits");
    const row = creditRows.find((r) => r.label === label);
    if (row) row.names.push(c.name!);
    else creditRows.push({ label, names: [c.name!] });
  }

  return (
    <AnimatePresence onExitComplete={onExited}>
      {issue && (
        <motion.aside
          key="issue-page"
          aria-label={issueTitle(issue.title)}
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-95 w-full bg-background flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          // Closed by swiping up: leave upwards; otherwise slide down
          exit={{ y: exitUp ? "-100%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {/* "Stäng (x)", top right, on the navbar's line, like its menu
              button (Baskerville Neo Text, text-xs; text-sm on desktop) */}
          <div className="fixed top-0 right-0 lg:top-6 lg:right-6 z-90">
            <Button
              variant="link"
              size="xs"
              className="shrink-0 w-auto h-12 lg:h-9 px-3 font-baskervilleNeoText text-xs lg:text-sm normal-case tracking-wide text-foreground after:content-none"
              onClick={onClose}
            >
              {t("close")} (x)
            </Button>
          </div>

          <motion.div
            ref={scrollRef}
            style={{ y: pull, opacity: pullOpacity }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            className="relative flex-1 min-h-0 overflow-y-auto"
          >
            {/* Hero: the title, large and centred (like the home page
                hero's text), at most four lines (line-clamp-4) */}
            {/* Over the issue's Hero Image (or Media Library item) when it
                has one, filling the section (not darkened), the text
                white */}
            <section className="relative flex h-[90dvh] w-full items-center justify-center overflow-hidden px-6">
              {hasHero && (
                <>
                  <BackgroundMedia
                    media={issue.heroMedia ?? null}
                    priority
                    veil={false}
                  />
                </>
              )}
              <h1
                className={`relative z-10 max-w-5xl text-center font-baskervilleNeoDisplay text-2xl leading-tight lg:text-6xl whitespace-pre-line line-clamp-4 ${hasHero ? "text-white" : ""}`}
              >
                {issue.title}
              </h1>
            </section>

            <section className="flex flex-col gap-12 px-6 pb-24 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start pt-6">
              {/* Desktop: two rows. Title and price in the first (columns
                  1–4); the description, add to cart and credits below them,
                  with editors and contributors (columns 6–8) on the same
                  row, so they start level with "Om numret". The cover
                  (columns 9–12) spans both */}
              <dl className="order-2 -mb-6 lg:mb-0 lg:order-none lg:col-span-4 lg:row-start-1 flex flex-col gap-6">
                <Field
                  valueClassName="pStyle"
                  label={t("title")}
                  values={[issueTitle(issue.title)]}
                />
                {/* Price, with "Lägg i korg" beside it ("Slutsåld",
                    disabled, when sold out); the button's pointing hand
                    on hover */}
                <div className="flex flex-col gap-1">
                  <dt className={LABEL}>{t("price")}</dt>
                  <dd className="pStyle flex items-baseline gap-6">
                    {issue.price != null && <span>{issue.price} kr</span>}
                    <Button
                      variant="link"
                      size="xs"
                      disabled={soldOut}
                      className="w-auto h-auto lg:h-auto px-0 pStyle text-lg tracking-wide normal-case text-foreground after:ml-3 disabled:opacity-30"
                      onClick={handleAddToCart}
                    >
                      {soldOut ? t("soldOut") : t("addToCart")}
                    </Button>
                  </dd>
                </div>
              </dl>

              <div className="order-3 lg:order-none lg:col-span-4 lg:row-start-2 flex flex-col gap-6">
                {issue.description && (
                  <div className="flex flex-col gap-1">
                    <span className={LABEL}>{t("aboutIssue")}</span>
                    {/* Justified, hyphenated; cut short behind "Läs mer"
                        (new per issue, so it starts folded each time) */}
                    <ReadMore key={issue._id}>
                      <div className="flex flex-col [&_p]:text-justify [&_p]:hyphens-auto">
                        <SanityPortableText value={issue.description} />
                      </div>
                    </ReadMore>
                  </div>
                )}

                {creditRows.length > 0 && (
                  <dl className="flex flex-col gap-6">
                    {creditRows.map((row) => (
                      <Field
                        valueClassName="pStyle"
                        key={row.label}
                        label={row.label}
                        values={row.names}
                        inline
                      />
                    ))}
                  </dl>
                )}

                {/* Product details: year, format, pages, ISBN… */}
                <dl className="flex flex-col gap-6">
                  {productInfo.map((row) => (
                    <Field
                      valueClassName="pStyle"
                      key={row.label}
                      label={row.label}
                      values={[row.value]}
                      inline
                    />
                  ))}
                </dl>
              </div>

              {/* Editors and contributors */}
              <dl className="order-4 lg:order-none lg:col-span-3 lg:col-start-6 lg:row-start-2 flex flex-col gap-6">
                {editors.length > 0 && (
                  <Field
                    valueClassName="pStyle"
                    label={t("editors")}
                    values={editors}
                    inline
                  />
                )}
                {contributors.length > 0 && (
                  <Field
                    valueClassName="pStyle"
                    label={t("contributors")}
                    values={contributors}
                    inline
                  />
                )}
              </dl>

              {/* The cover, sticking below the top while the text scrolls */}
              <div className="order-1 lg:order-none lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
                {issue.cover?.asset && (
                  <Image
                    src={urlFor(issue.cover).width(1600).url()}
                    alt={issue.cover.alt ?? issueTitle(issue.title)}
                    width={1600}
                    height={2200}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="w-full h-auto"
                  />
                )}
              </div>
            </section>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
