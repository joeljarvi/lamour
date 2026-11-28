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
import { useLocale, useTranslations } from "next-intl";
import { urlFor } from "@/lib/sanity/image";
import { useCart } from "@/lib/contexts/CartContext";
import { type Issue, useIssues } from "@/lib/contexts/IssuesContext";
import { issueNumberLabel, issueTitle } from "@/lib/issueTitle";
import { splitNames } from "@/lib/splitNames";
import SanityPortableText from "@/components/SanityPortableText";
import { Button } from "./ui/button";
import { useProductInfo } from "./IssueInfo";
import { COVER_BOX, COVER_IN_BOX } from "./ShopCover";
import { cn } from "@/lib/utils";

// Mobile: how far (px) the page must be pulled up past its end to close
const PULL_TO_CLOSE = 120;

// An issue as a full-screen page over the shop (opened as a modal from the
// shop, or on its own at /shop/[slug]): on desktop a 12-column grid, the
// number, title, cover and information side by side. Slides up from the
// bottom

// The close button's cross
function CrossIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 2 14 14M14 2 2 14" />
    </svg>
  );
}
export default function IssuePage({
  issue: openedIssue,
  onClose,
  onExited,
}: {
  issue: Issue | null;
  onClose: () => void;
  // Called once the page has finished sliding out
  onExited?: () => void;
}) {
  const t = useTranslations("Issue");
  const locale = useLocale();
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Another issue picked from the titles list, shown in place of the one
  // opened (the page stays open; the address follows along). Forgotten when
  // the page closes or another issue is opened from outside
  const [picked, setPicked] = useState<Issue | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicked(null);
  }, [openedIssue?._id]);
  const issue = openedIssue ? (picked ?? openedIssue) : null;
  const issueId = issue?._id;
  // While open: marked on <html> (data-pdp), so the navbar turns
  // transparent over it
  const isOpen = !!openedIssue;
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    root.setAttribute("data-pdp", "");
    return () => root.removeAttribute("data-pdp");
  }, [isOpen]);
  function showIssue(other: Issue) {
    setPicked(other);
    // The address, replaced (not pushed): closing still goes back to the
    // page the issue was opened from
    window.history.replaceState(
      window.history.state,
      "",
      `/${locale}/shop/${other.slug.current}`,
    );
  }

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
      price: issue.price != null ? `${issue.price} SEK` : "0",
    });
    onClose();
  }

  const soldOut = issue?.inStock === false;
  // "Produktdetaljer" open; closed again for another issue
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetailsOpen(false);
  }, [issueId]);
  // Every other issue, newest first (as they come)
  const otherIssues = useIssues().filter((i) => i._id !== issueId);
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
          // Below the navbar (z-90), which stays visible over it; the cart
          // (z-100) above both
          className="fixed inset-0 z-85 w-full bg-background flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          // Closed by swiping up: leave upwards; otherwise slide down
          exit={{ y: exitUp ? "-100%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <motion.div
            ref={scrollRef}
            style={{ y: pull, opacity: pullOpacity }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            className="relative flex-1 min-h-0 overflow-y-auto"
          >
            {/* Desktop: a 12-column grid (12px apart, 12px in): the issue
                number (col 1), the title (col 3), the cover (cols 5–8),
                the information (cols 10–12: price, "Lägg i korg",
                description, product details). Stacked on
                mobile */}
            <div className="relative mt-36 flex flex-col gap-6 px-6 pb-12 font-baskervilleNeoText text-1 lg:grid lg:grid-cols-12 lg:gap-x-3 lg:items-start">
              {/* Desktop: fixed to the viewport where column 1 is, 144px down */}
              <p className="lg:fixed lg:top-36 lg:left-6 lg:w-[calc((100vw-180px)/12)]">
                {issueNumberLabel(issue)}
              </p>
              {/* The title, then 144px below it the other issues' titles,
                  one per line, faded (full strength on hover); a click opens
                  that issue */}
              {/* Desktop: fixed where columns 3–4 are, from 144px down to 12px
                  above the bottom; the titles list scrolls within it */}
              <div className="flex flex-col lg:fixed lg:top-36 lg:bottom-3 lg:left-[calc(48px+(100vw-180px)/6)] lg:w-[calc((100vw-180px)/6+12px)] lg:overflow-hidden">
                <h1 className="italic">{issueTitle(issue.title)}</h1>
                {/* Fading out towards the bottom (a transparent gradient
                    over the list, as a mask) */}
                <ul className="mt-36 flex flex-col items-start list-none max-h-[50dvh] overflow-y-auto scrollbar-none lg:max-h-none lg:min-h-0 lg:flex-1 mask-[linear-gradient(to_bottom,black_30%,transparent)]">
                  {otherIssues.map((other) => (
                    <li key={other._id}>
                      <button
                        type="button"
                        onClick={() => showIssue(other)}
                        className="cursor-pointer text-left font-baskervilleNeoText text-foreground opacity-50 transition-opacity hover:opacity-100"
                      >
                        {issueTitle(other.title)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The cover in a box as in the shop (ShopCover's), but 3:4 */}
              <div
                className={cn(
                  COVER_BOX,
                  "aspect-3/4 bg-background lg:col-start-5 lg:col-span-4",
                )}
              >
                {issue.cover?.asset && (
                  <Image
                    src={urlFor(issue.cover).width(1600).url()}
                    alt={issue.cover.alt ?? issueTitle(issue.title)}
                    width={1600}
                    height={2200}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className={COVER_IN_BOX}
                    priority
                  />
                )}
              </div>

              {/* Desktop: fixed to the viewport, where columns 10–12 are, from
                  144px down to 12px above the bottom (scrolling itself if
                  taller), "Lägg i korg" at its bottom. Mobile: in the flow,
                  the button fixed along the screen's bottom */}
              <div className="flex flex-col items-start gap-6 pb-16 lg:pb-0 lg:fixed lg:top-36 lg:bottom-3 lg:right-6 lg:w-[calc((100vw-180px)/4+24px)] lg:overflow-hidden">
                {/* The price, close (×) on the right */}
                <div className="flex w-full items-baseline justify-between gap-3">
                  <p>
                    {soldOut
                      ? t("soldOut")
                      : issue.price != null
                        ? `${issue.price} SEK`
                        : null}
                  </p>
                  <Button
                    variant="Link"
                    size="xs"
                    className="h-auto lg:h-auto px-0 lg:px-0"
                    onClick={onClose}
                    aria-label={t("close")}
                  >
                    <CrossIcon />
                  </Button>
                </div>

                {/* The description and product details scroll on their own
                    (desktop), between the price row and "Lägg i korg", which
                    stay put */}
                <div className="flex w-full flex-col items-start gap-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto scrollbar-none">
                  {issue.description && (
                    <div className="text-1 font-baskervilleNeoText flex flex-col [&_p]:hyphens-auto [&_p]:text-1">
                      <SanityPortableText value={issue.description} />
                    </div>
                  )}

                  {/* "Produktdetaljer": shows and hides the details (year,
                      format, pages, ISBN…, editors, contributors, credits) */}
                  <div className="flex w-full flex-col border-t pt-3">
                    <button
                      type="button"
                      onClick={() => setDetailsOpen((v) => !v)}
                      aria-expanded={detailsOpen}
                      className="flex w-full cursor-pointer items-baseline justify-between text-left"
                    >
                      <span>{t("productDetails")}</span>
                      <span aria-hidden>{detailsOpen ? "−" : "+"}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {detailsOpen && (
                        <motion.div
                          key="details"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <dl className="flex flex-col gap-3 pt-3">
                            {[
                              ...productInfo.map((r) => ({
                                label: r.label,
                                values: [r.value],
                              })),
                              ...(editors.length > 0
                                ? [{ label: t("editors"), values: editors }]
                                : []),
                              ...(contributors.length > 0
                                ? [
                                    {
                                      label: t("contributors"),
                                      values: contributors,
                                    },
                                  ]
                                : []),
                              ...creditRows.map((r) => ({
                                label: r.label,
                                values: r.names,
                              })),
                            ].map((row) => (
                              <div
                                key={row.label}
                                className="grid grid-cols-3 gap-x-3"
                              >
                                <dt className="text-neutral-600">{row.label}</dt>
                                <dd className="col-span-2">
                                  {row.values.map((v) => (
                                    <span key={v} className="block">
                                      {v}
                                    </span>
                                  ))}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* "Lägg i korg": at the bottom of the column (desktop),
                    along the screen's bottom (mobile) */}
                <Button
                  variant="primary"
                  size="pill"
                  disabled={soldOut}
                  onClick={handleAddToCart}
                  className="fixed bottom-3 inset-x-3 z-10 w-auto bg-primary text-secondary lg:static lg:mt-auto lg:w-full"
                >
                  {soldOut ? t("soldOut") : t("addToCart")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
