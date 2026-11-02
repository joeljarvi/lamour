"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { toPlainText } from "@portabletext/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import LatestIssueCover from "./LatestIssueCover";
import SpreadLetters from "./SpreadLetters";
import LatestIssueTitle from "./LatestIssueTitle";
import { useIssues } from "@/lib/contexts/IssuesContext";
import { useCart } from "@/lib/contexts/CartContext";
import {
  BUTTONS_AT,
  BUTTONS_FADE,
  COVER_AT,
  COVER_FADE,
  NEW_ISSUE_AT,
  NEW_ISSUE_FADE,
  TAGLINE,
  TAGLINE_AT,
} from "@/lib/introTiming";

// Home page intro: the tagline, sticking at the top, above the latest
// issue — "Senaste numret", its number + title, its cover, and "Läs mer" /
// "Bli prenumerant" — fitting in one screen below it. Revealed in turn on
// load, between the navbar's title and the rest of the navbar (timing in
// lib/introTiming)
export default function IntroCard() {
  // The sticky tagline block's height (--intro-h on the section), so the
  // latest issue's screen can start right below it
  const blockRef = useRef<HTMLDivElement>(null);
  const [blockHeight, setBlockHeight] = useState(0);
  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    const measure = () => setBlockHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const tIssue = useTranslations("Issue");
  // The latest issue (issues come newest first), for "Läs mer"
  const latest = useIssues()[0];
  const { addToCart } = useCart();
  const t = useTranslations("Nav");

  return (
    <section
      className="flex w-full flex-col items-center px-12 bg-background  "
      style={{ "--intro-h": `${blockHeight}px` } as React.CSSProperties}
    >
      {/* The name and the tagline, sticking just below the navbar (top-16 /
          lg:top-14)
          until the section has scrolled past. Fades in on load */}
      <motion.div
        ref={blockRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-16 lg:top-14 z-10 mt-0 flex w-full  px-0 flex-col items-center justify-center gap-3 py-0 "
      >
        {/* The name and the tagline, each spread across the full width
            (SpreadLetters, justify-between; L' as one). The name is the
            page's main heading */}

        <h2
          aria-label={TAGLINE}
          className="h2Style font-baskervilleNeoDisplay text-xs  tracking-wide flex w-full justify-between  text-foreground"
        >
          {/* Appears letter by letter after the card has faded in */}
          <SpreadLetters text={TAGLINE} revealAt={TAGLINE_AT} />
        </h2>
      </motion.div>

      {/* The latest issue, fitting within one screen (h-dvh, its spacing
          inside it), on the page background, full width (-mx-6 undoes the
          section's padding): "Senaste numret" (spread evenly), the issue's
          number + title, the cover (taking the height that's left, scaled
          to fit), its description, then "Läs mer" and "Bli prenumerant" */}
      {/* Spacing, 24px throughout: the top padding clears the navbar's
          height (the sticky block's top, 4rem / lg 3rem) plus the block's
          measured height (--intro-h) plus 24px; gap-6 between the
          items; 24px at the
          bottom. So they all fit in one screen below the tagline, evenly
          spaced */}
      <div className="-mx-6 self-stretch flex h-dvh min-w-0 flex-col items-center gap-6  px-6 pt-[calc(4rem+var(--intro-h)+1.5rem)] lg:pt-[calc(3rem+var(--intro-h)+0.5rem)] pb-6 w-full">
        {/* "Senaste numret", its letters spread evenly across the full
            width (justify-evenly), fading in after the tagline (hidden from
            screen readers, as the heading after the cover says it) */}
        <motion.p
          aria-hidden
          className="h2Style tracking-normal h2Style text-xs  flex w-full shrink-0 justify-evenly whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: NEW_ISSUE_FADE, delay: NEW_ISSUE_AT }}
        >
          <SpreadLetters text="Senaste numret" />
        </motion.p>

        {/* The issue's number + title, right below "Senaste numret",
            fading in just after it: the heading, read as "Senaste numret …"
            (the sr-only prefix) */}
        <motion.h2
          className="h2Style not-italic [font-feature-settings:normal] flex shrink-0 justify-center whitespace-nowrap text-xl lg:text-4xl  font-baskervilleNeoDisplay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: NEW_ISSUE_FADE, delay: NEW_ISSUE_AT + 0.2 }}
        >
          <span className="sr-only">Senaste numret </span>
          <LatestIssueTitle />
        </motion.h2>

        {/* The cover, taking the height that's left (flex-1), fading in
            after the heading */}
        <motion.div
          className="flex w-full flex-1 min-h-0 flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: COVER_FADE, delay: COVER_AT }}
        >
          {/* Much smaller than its default (two thirds / a third): a
              third of the screen wide on mobile, a sixth on desktop */}
          <LatestIssueCover className="w-1/3 lg:w-1/6" />
        </motion.div>

        {/* "Lägg i korg", large (text-4xl), right below the cover, fading
            in with it: puts the latest issue in the cart (the cart button's
            count goes up; as in the issue panel, the drawer stays shut).
            "Slutsåld", disabled, when it's sold out */}
        {latest && (
          <motion.div
            className="shrink-0 pb-3 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: COVER_FADE, delay: COVER_AT }}
          >
            <Button
              variant="link"
              size="xs"
              disabled={latest.inStock === false}
              // No swashes ([font-feature-settings:normal]): h2Style's swash
              // capitals have no Ä, so "LÄGG" would lose its dots; a normal
              // line height leaves room for them above the capitals
              className="w-auto h-auto lg:h-auto px-0 text-foreground after:content-none h2Style lg:text-2xl leading-normal lg:font-baskervilleNeoDisplay [font-feature-settings:normal] disabled:opacity-40"
              onClick={() =>
                addToCart({
                  id: latest._id,
                  title: latest.title,
                  price: latest.price != null ? `${latest.price} kr` : "0",
                })
              }
            >
              ({" "}
              {latest.inStock === false
                ? tIssue("soldOut")
                : tIssue("addToCart")}{" "}
              )
            </Button>
            {/* Below it, the alternative: to the subscribe page */}
          </motion.div>
        )}

        {/* The issue's description, below the cover, fading in with it: as
            plain text, at most three lines (cut off with an ellipsis; "Läs
            mer" opens the whole issue), two thirds of the screen wide on mobile,
            a third on desktop */}

        {/* "Läs mer" left and "Bli prenumerant" right, the row two thirds
            of the screen wide on mobile, a third on desktop */}
      </div>
    </section>
  );
}
