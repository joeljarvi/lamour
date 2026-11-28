"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Each letter's fade-in after the one before it, a row's spread to the
// full width, and the pause before the next row (ms)
const LETTER = 90;
const SPREAD = 600;
const PAUSE = 150;

// A row's letters, an apostrophe kept with the letter before it ("L'")
const lettersOf = (row: string) => row.match(/.'?/gu) ?? [];

// Rows of letters revealed one by one, a row at a time: each row's letters
// appear one after another gathered in the middle, then the row spreads
// out to the full width (justify-between) and the next row begins.
// Starts as the page's content is revealed (PageReveal: html[data-reveal]
// ≥ 2, after the loader on a first load); with reduced motion, all at once
export default function HeroLetters({
  rows,
  className = "",
}: {
  rows: string[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [started, setStarted] = useState(false);
  // How many rows have spread so far
  const [spread, setSpread] = useState(0);

  // Start once the page's content shows
  useEffect(() => {
    const root = document.documentElement;
    const ready = () => {
      const step = root.getAttribute("data-reveal");
      return step === null || Number(step) >= 2;
    };
    if (ready()) {
      setStarted(true);
      return;
    }
    const observer = new MutationObserver(() => {
      if (ready()) {
        setStarted(true);
        observer.disconnect();
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-reveal"],
    });
    return () => observer.disconnect();
  }, []);

  // When each row starts (ms from the start)
  const letters = rows.map(lettersOf);
  const starts: number[] = [];
  let at = 0;
  for (const row of letters) {
    starts.push(at);
    at += row.length * LETTER + SPREAD + PAUSE;
  }

  // Spread each row once its last letter has appeared
  useEffect(() => {
    if (!started) return;
    if (reduce) {
      setSpread(rows.length);
      return;
    }
    const timers = letters.map((row, i) =>
      setTimeout(() => setSpread(i + 1), starts[i] + row.length * LETTER),
    );
    return () => timers.forEach(clearTimeout);
    // starts and letters follow from rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, reduce, rows]);

  return (
    <div className={className}>
      {/* The words for screen readers (the letters are hidden) */}
      <span className="sr-only">{rows.join(" ")}</span>
      {letters.map((row, i) => (
        <p
          key={i}
          aria-hidden
          className={`flex w-full ${i < spread ? "justify-between" : "justify-center"}`}
        >
          {row.map((letter, j) => (
            <motion.span
              key={j}
              layout="position"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: started ? 1 : 0 }}
              transition={{
                opacity: {
                  duration: 0.3,
                  delay: reduce ? 0 : (starts[i] + j * LETTER) / 1000,
                },
                layout: { duration: SPREAD / 1000, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </p>
      ))}
    </div>
  );
}
