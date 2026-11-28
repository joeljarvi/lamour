"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// How long the loader shows (ms) and how long each font stays (ms)
const DURATION = 5000;
// Its fade out (ms)
const FADE = 500;
// When it has gone completely (ms from the page load): the page reveals
// itself from then (PageReveal)
export const LOADER_TOTAL = DURATION + FADE;
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

// Where the hero text's large initial is on the screen: its first letter
// (the first character of the hero's text, #intro) as a box. The initial
// is text-4xl, the loader text's size (HeroNav). Null when the page has no
// hero
function measureInitial() {
  const intro = document.getElementById("intro");
  if (!intro) return null;
  const walker = document.createTreeWalker(intro, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.textContent?.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const node = walker.nextNode() as Text | null;
  if (!node) return null;
  const at = node.textContent!.search(/\S/);
  const range = document.createRange();
  range.setStart(node, at);
  range.setEnd(node, at + 1);
  const box = range.getBoundingClientRect();
  if (!box.width) return null;
  return { left: box.left, top: box.top };
}

// On every full page load: "L'Amour—La Mort", then "en tids skrift", over
// the whole screen (on the site's background), changing font every second
// for five seconds, then fading away. The text sits exactly where the hero
// text's large initial is, at the same size (text-4xl; measureInitial), so as
// the loader fades its first letter is left behind as that initial (the
// last font is Baskerville Neo Text, the initial's). Without a hero:
// centred. Shown from the first paint (rendered on the server too), so the
// page doesn't flash first
export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  // Which text (index into TEXTS)
  const [text, setText] = useState(0);
  // The hero initial's place and size (null: centred, the default size)
  const [initial, setInitial] = useState<{
    left: number;
    top: number;
  } | null>(null);

  // Measured once the page is laid out (under the loader), and again on
  // resize and when the fonts have loaded (they change its place)
  useEffect(() => {
    const measure = () => setInitial(measureInitial());
    const frame = requestAnimationFrame(measure);
    document.fonts.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, []);

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
            transition={{ duration: FADE / 1000, ease: "easeOut" }}
          >
            <p
              // text-4xl, as the initial. At the initial: its top left
              // corner on the initial's (a line as tall as the glyph's box:
              // leading-normal, as the measured box); else centred
              className={
                initial
                  ? "absolute whitespace-nowrap text-4xl leading-normal"
                  : "text-center text-4xl leading-tight"
              }
              style={{
                fontFamily: FONTS[step],
                ...(initial && { left: initial.left, top: initial.top }),
              }}
            >
              {TEXTS[text]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
