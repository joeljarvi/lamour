"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

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

// Home page intro, one centred column revealed piece by piece: the logo card
// alone on the first screen (fading in on load, "Skrolla ner" fixed at the
// bottom centre of the screen), then, as you scroll down,
// "Om oss" and the subscribe button fading in and the about text typing
// itself out, each as it comes into view
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
  // The about text types itself out as it moves up the screen: from when
  // its top enters at the bottom (0) until its top reaches the middle (1)
  const aboutRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "start center"],
  });
  const [typed, setTyped] = useState(0);
  useMotionValueEvent(aboutProgress, "change", (p) =>
    setTyped(Math.round(ABOUT_TEXT.length * Math.min(1, Math.max(0, p)))),
  );

  return (
    <section
      ref={ref}
      className="flex w-full flex-col items-center px-6 bg-background"
    >
      {/* First screen: the logo card, centred. 16:9, the screen minus 24px
          each side on mobile, 40% of the screen tall on desktop */}
      <div className="flex min-h-dvh w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="aspect-video w-full lg:w-auto lg:h-[40vh] bg-pergament flex flex-col items-center justify-center rounded-xs gap-6"
        >
          <h1 className="h1Style font-baskervilleNeoDisplay text-base uppercase tracking-[48%] text-center">
            L&apos;Amour — La Mort
          </h1>
          <h2 className="h2Style">en tids skrift</h2>
        </motion.div>
        {/* Scroll hint, fixed to the bottom centre of the screen while the
            intro is in view; fades in on load, out as the intro ends */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="pointer-events-none fixed bottom-6 inset-x-0 z-40 text-center h2Style text-foreground"
        >
          <motion.span style={{ opacity: hintOpacity }}>
            ( {tHome("scroll")} )
          </motion.span>
        </motion.div>
      </div>

      {/* Below it, each revealed as you scroll to it: about, then subscribe */}
      <div className="flex w-full lg:w-1/2 flex-col items-center gap-12 pb-[30vh] text-center text-foreground">
        <motion.h2 {...reveal} className="h2Style">
          om oss
        </motion.h2>
        {/* Typed out as it scrolls up the screen (see aboutRef above):
            always the whole text, the part not yet typed invisible, so every
            line keeps its final place and the letters appear where they'll
            stay. Screen readers get it whole */}
        <p
          ref={aboutRef}
          className="h2Style not-italic leading-[1.8] font-features-[normal]"
        >
          <span className="sr-only">{ABOUT_TEXT}</span>
          <span aria-hidden>
            {ABOUT_TEXT.slice(0, typed)}
            <span className="invisible">{ABOUT_TEXT.slice(typed)}</span>
          </span>
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
