"use client";

import { motion } from "motion/react";
// With `revealAt`: the time between letters, and each one's fade
const LETTER_STAGGER = 0.06;
const LETTER_FADE = 0.3;

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
export default function SpreadLetters({
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
