"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

// The setting, remembered in this browser (on/off and the amount)
const STORAGE_KEY = "drunkFilter";

// The drunk fonts (public/fonts/drunk_fonts: Baskerville with its letters
// offset), from least to most offset; the slider picks one, shown by its
// name ("full / fullare / fullast"; in English "drunk / drunker /
// drunkest")
const SIZES = [
  { label: "M", sv: "full", en: "drunk", file: "FM-LLBASK-OFFSET-M.woff2" },
  {
    label: "L",
    sv: "fullare",
    en: "drunker",
    file: "FM-LLBASK-OFFSET-L.woff2",
  },
  {
    label: "XL",
    sv: "fullast",
    en: "drunkest",
    file: "FM-LLBASK-OFFSET-XL.woff2",
  },
] as const;

// Each as its own font family ("Drunk M"…), loaded only when used
// (font-display: swap: the normal font until it arrives). While on, the
// site's Baskerville Neo Text switches to the chosen one: every use of it
// (pStyle, font-baskervilleNeoText: the menu's links, the cart's buttons…)
// reads the font variable next/font sets on <body>, so the rule replaces
// that variable there (the original families after it, as fallbacks).
// Outside any layer and more specific than next/font's class, so it wins.
// Baskerville Neo Display likewise, but only inside an element marked
// data-drunk-display (the article's hero: ArticleReader). Added from here
// rather than globals.css so it's always served along with this component
const RULE =
  SIZES.map(
    ({ label, file }) => `@font-face {
  font-family: "Drunk ${label}";
  src: url("/fonts/drunk_fonts/${file}") format("woff2");
  font-display: swap;
}`,
  ).join("\n") +
  `
html[data-drunk] body {
  --font-baskerville-neo-text: var(--drunk-family), "baskervilleNeoText",
    "baskervilleNeoText Fallback";
}
html[data-drunk] [data-drunk-display] {
  --font-baskerville-neo-display: var(--drunk-family),
    "baskervilleNeoDisplay", "baskervilleNeoDisplay Fallback";
}`;

// "Drunk filter on/off", fixed bottom right. On, all the site's
// Baskerville Neo Text is set in one of the drunk fonts, the slider
// choosing how drunk: full, fullare or fullast (drunk, drunker, drunkest)
export default function DrunkFilter() {
  const lang = useLocale() === "sv" ? "sv" : "en";
  const [on, setOn] = useState(false);
  // Which font (index into SIZES)
  const [size, setSize] = useState(0);

  // The saved setting, once on load (after hydration on purpose: the
  // server can't read the browser's storage, so the first render
  // matches the server's)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOn(!!saved.on);
        if (typeof saved.size === "number" && SIZES[saved.size])
          setSize(saved.size);
      }
    } catch {
      // No storage (private window…): start off
    }
  }, []);

  // Saves the setting
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ on, size }));
    } catch {
      // Not saved; it still works for this visit
    }
  }, [on, size]);

  // The fonts and the rule, once
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = RULE;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // While on: the chosen font in use
  useEffect(() => {
    const root = document.documentElement;
    if (on) {
      root.style.setProperty("--drunk-family", `"Drunk ${SIZES[size].label}"`);
      root.setAttribute("data-drunk", "");
    } else {
      root.removeAttribute("data-drunk");
      root.style.removeProperty("--drunk-family");
    }
  }, [on, size]);

  return (
    <div className="pStyle fixed right-[24px] bottom-[24px] z-110 flex items-center gap-6 bg-background px-[12px]">
      {/* While on: how drunk (full, fullare, fullast / drunk, drunker,
          drunkest) */}
      {on && (
        <label className="flex items-center gap-3">
          <span className="sr-only">Amount</span>
          <input
            type="range"
            min={0}
            max={SIZES.length - 1}
            step={1}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24 cursor-pointer accent-foreground"
          />
          {/* As wide as the longest name, so the slider doesn't move */}
          <span className="w-[8ch]">{SIZES[size][lang]}</span>
        </label>
      )}
      <button
        type="button"
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
        className="cursor-pointer whitespace-nowrap underline-offset-4 decoration-1 hover:underline"
      >
        Drunk filter {on ? "on" : "off"}
      </button>
    </div>
  );
}
