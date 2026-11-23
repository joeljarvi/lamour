"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// How long the loader shows (ms) and how long each font stays (ms)
const DURATION = 5000;
const STEP = 1000;

// The texts, one after the other, each for half the time
const TEXTS = ["L’Amour—La Mort", "en tids skrift"];

// The offset fonts (public/fonts/drunk_fonts, as the drunk filter), under
// names of their own here; font-display: block, so a font that hasn't
// arrived yet shows nothing rather than the wrong one for a moment
const OFFSET_FONTS = [
  { family: "Loader Offset M", file: "FM-LLBASK-OFFSET-M.woff2" },
  { family: "Loader Offset L", file: "FM-LLBASK-OFFSET-L.woff2" },
  { family: "Loader Offset XL", file: "FM-LLBASK-OFFSET-XL.woff2" },
];
const FONT_FACES = OFFSET_FONTS.map(
  ({ family, file }) => `@font-face {
  font-family: "${family}";
  src: url("/fonts/drunk_fonts/${file}") format("woff2");
  font-display: block;
}`,
).join("\n");

// The font each second: Baskerville Neo Text, the three offsets (M, L, XL),
// then Baskerville Neo Text again for the last second
const FONTS = [
  "var(--font-baskerville-neo-text)",
  ...OFFSET_FONTS.map(({ family }) => `"${family}"`),
  "var(--font-baskerville-neo-text)",
];

// On every full page load: "L'Amour—La Mort", then "en tids skrift",
// centred over the whole screen (on the site's background), changing font
// every second for five seconds, then fading away. Shown from the first
// paint (rendered on the server too), so the page doesn't flash first
export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  // Which text (index into TEXTS)
  const [text, setText] = useState(0);

  useEffect(() => {
    // Start loading the offset fonts straight away
    for (const { family } of OFFSET_FONTS)
      document.fonts.load(`48px "${family}"`).catch(() => {});
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, FONTS.length - 1)),
      STEP,
    );
    const next = setTimeout(() => setText(1), DURATION / TEXTS.length);
    const done = setTimeout(() => setVisible(false), DURATION);
    return () => {
      clearInterval(timer);
      clearTimeout(next);
      clearTimeout(done);
    };
  }, []);

  return (
    <>
      <style>{FONT_FACES}</style>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="loader"
            aria-hidden
            className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-background text-foreground"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p
              className="text-center text-4xl leading-tight lg:text-4xl"
              style={{ fontFamily: FONTS[step] }}
            >
              {TEXTS[text]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
