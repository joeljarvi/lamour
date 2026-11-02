"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import {
  HINT_AT,
  HINT_DURATION,
  LETTER_FADE,
  LETTER_STAGGER,
  TAGLINE,
  TAGLINE_AT,
} from "@/lib/introTiming";

// The site's name, the intro card's heading
const TITLE = "L'Amour — La Mort";

// A text's letters, one per span; an apostrophe stays with the letter
// before it (L')
function splitLetters(text: string) {
  return Array.from(text).reduce<string[]>(
    (letters, char) =>
      char === "'" && letters.length
        ? [...letters.slice(0, -1), letters[letters.length - 1] + char]
        : [...letters, char],
    [],
  );
}

// A heading's text spread across its width: one span per letter (spaces
// too), with justify-between instead of letter-spacing. Read as one word
// by screen readers (the letters are hidden). With `revealAt`, the letters
// fade in one at a time, left to right, starting that many seconds after
// load
function SpreadLetters({
  text,
  revealAt,
}: {
  text: string;
  revealAt?: number;
}) {
  return splitLetters(text).map((char, i) =>
    revealAt !== undefined ? (
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: LETTER_FADE,
          delay: revealAt + i * LETTER_STAGGER,
        }}
        aria-hidden
        className="whitespace-pre"
      >
        {char}
      </motion.span>
    ) : (
      <span key={i} aria-hidden className="whitespace-pre">
        {char}
      </span>
    ),
  );
}

// A heading's letters opening up with scroll: they sit justify-between,
// 0.48em apart at least, in a box centred in the heading that grows with
// `spread` (0–1) from just wide enough for them that far apart — gathered
// in the centre, evenly spaced as with tracking-[48%] — to the full width.
// The gathered width is measured from a hidden copy of the letters. Spaces
// and the dash are letters too, L' as one. `revealAt`: see SpreadLetters
function ScrollSpread({
  text,
  spread,
  revealAt,
}: {
  text: string;
  spread: MotionValue<number>;
  revealAt?: number;
}) {
  const gatheredRef = useRef<HTMLSpanElement>(null);
  const gathered = useMotionValue(0);
  useEffect(() => {
    const el = gatheredRef.current;
    if (!el) return;
    const measure = () => gathered.set(el.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [gathered]);
  const width = useMotionTemplate`calc(${gathered}px + (100% - ${gathered}px) * ${spread})`;

  return (
    <>
      {/* min-w-max: never narrower than the letters gathered (e.g. before
          the hidden copy is measured) */}
      <motion.span
        className="flex min-w-max justify-between gap-[0.48em]"
        style={{ width }}
      >
        <SpreadLetters text={text} revealAt={revealAt} />
      </motion.span>
      <span
        ref={gatheredRef}
        aria-hidden
        className="invisible absolute flex w-max gap-[0.48em]"
      >
        <SpreadLetters text={text} />
      </span>
    </>
  );
}

// (The intro's timing is in lib/introTiming)

// The about text, below the logo card
const ABOUT_TEXT =
  "Sedan 2017 har vi samlat ung litteratur under ett skevt konsthistoriskt paraply och publicerat över hundra författare och konstnärer i början, mitten, och slutet av sina karriärer. Målet? Att ge skimret av ett samlad förtrupp. Att historisera allt nu. En tids skrift av text och bild.";

// Fades and slides up into place the first time it scrolls into view (when
// 60% of it is on screen)
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.6 },
  transition: { duration: 0.8, ease: "easeOut" },
} as const;

// Home page intro, one centred column revealed piece by piece: the title
// and tagline alone on the first screen (fading in on load, "Skrolla ner"
// fixed at the bottom centre of the screen), the pair opening up and
// sticking at the top as you scroll down, past "Om oss" (fading in, then
// sticking below them), the about text and the subscribe button (fading in
// as it comes into view)
export default function IntroCard() {
  const t = useTranslations("Nav");
  const tHome = useTranslations("Home");
  // How far through the intro we've scrolled: 0 at the top, 1 when its
  // bottom reaches the bottom of the screen. The fixed scroll hint fades out
  // over the last fifth (a function, not a [range] mapping, keeps Motion
  // from handing it to the browser's scroll timeline)
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const hintOpacity = useTransform(scrollYProgress, (p) =>
    Math.min(1, Math.max(0, (1 - p) / 0.2)),
  );
  // The sticky title block's height, so "Om oss" can stick right below it
  // (--intro-h on the section)
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
  // The title and tagline open up as you scroll (ScrollSpread): 0 at the
  // top of the page, 1 once you've scrolled half a screen
  const { scrollY } = useScroll();
  const spread = useTransform(scrollY, (y) =>
    typeof window === "undefined"
      ? 0
      : Math.min(1, Math.max(0, y / (window.innerHeight / 2))),
  );

  return (
    <section
      ref={ref}
      className="flex w-full flex-col items-center px-6 bg-pergament"
      style={{ "--intro-h": `${blockHeight}px` } as React.CSSProperties}
    >
      {/* The title and the tagline under it, one block that starts in the
          middle of the first screen (the top margin: half the screen less
          half its height, about 2.5rem) and, as you scroll, sticks just
          below the navbar (h-16 / lg:h-14) until the section — the about
          text — has scrolled past. On the section's background, so the
          about text passes beneath it. Fades in on load */}
      <motion.div
        ref={blockRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-16 lg:top-14 z-10 mt-[calc(50dvh-2.5rem)] flex w-full  px-6 flex-col items-center justify-center gap-6 py-6 bg-pergament"
      >
        {/* Title and tagline, each opening up with scroll
            (ScrollSpread): centred, evenly spaced (0.48em) at the top of
            the page, justify-between across the full width half a screen
            down */}
        <h1
          aria-label={TITLE}
          className="relative flex w-full justify-center leading-loose  text-base lg:text-base  font-baskervilleNeoText  uppercase lg:font-baskervilleNeoText"
        >
          <ScrollSpread text={TITLE} spread={spread} />
        </h1>
        <h2
          aria-label={TAGLINE}
          className="relative h2Style tracking-normal flex w-full justify-center text-foreground"
        >
          {/* Appears letter by letter after the card has faded in */}
          <ScrollSpread text={TAGLINE} spread={spread} revealAt={TAGLINE_AT} />
        </h2>
      </motion.div>

      {/* The rest of the first screen below the block, then the scroll
          hint, fixed to the bottom centre of the screen while the intro is
          in view; rises in after the tagline, fades out as the intro ends */}
      <div aria-hidden className="h-[calc(50dvh-2.5rem)] shrink-0" />
      {/* Rises in from the bottom once the tagline has appeared */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: HINT_DURATION,
          delay: HINT_AT,
          ease: "easeOut",
        }}
        className="pointer-events-none fixed bottom-6 inset-x-0 z-40 text-center h2Style text-foreground"
      >
        <motion.span style={{ opacity: hintOpacity }}>
          ( {tHome("scroll")} )
        </motion.span>
      </motion.div>

      {/* Below it, each revealed as you scroll to it: about, then subscribe */}
      <div className="flex w-full lg:w-1/2 flex-col items-center gap-12 pb-[30vh] text-center text-foreground">
        {/* Sticks right below the title block (the navbar's height plus
            the block's, --intro-h) until the about text has scrolled past;
            on the background, so the text passes beneath it */}
        <motion.h2
          {...reveal}
          className="h2Style sticky z-10 w-full py-3 bg-pergament top-[calc(4rem+var(--intro-h))] lg:top-[calc(3.5rem+var(--intro-h))]"
        >
          om oss
        </motion.h2>
        {/* Justified and hyphenated (in the page's language) to keep the
            word spacing even */}
        <p className="font-baskervilleNeoText text-base not-italic leading-[1.8] font-features-[normal] text-neutral-800 text-justify hyphens-auto">
          {ABOUT_TEXT}
        </p>
        <motion.div {...reveal}>
          <Button
            variant="link"
            size="sm"
            className="w-auto h-auto text-foregrounditalic font-baskervilleNeoText after:content-none tracking-[48%] h2Style"
            asChild
          >
            <Link href="/subscribe">( {t("becomeSubscriber")} )</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
