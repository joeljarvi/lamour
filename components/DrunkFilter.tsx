"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

// The setting, remembered in this browser (on/off)
const STORAGE_KEY = "drunkFilter";

// The drunk fonts (public/fonts/drunk_fonts: Baskerville with its letters
// offset), from least to most offset; one picked at random each time the
// filter turns on
const SIZES = [
  { label: "M", file: "FM-LLBASK-OFFSET-M.woff2" },
  { label: "L", file: "FM-LLBASK-OFFSET-L.woff2" },
  { label: "XL", file: "FM-LLBASK-OFFSET-XL.woff2" },
] as const;

// A random one (index into SIZES)
const randomSize = () => Math.floor(Math.random() * SIZES.length);

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

// "DRUNK" and a checkbox, fixed bottom right. On, all the site's
// Baskerville Neo Text is set in one of the drunk fonts, picked at random
// each time it turns on (ticked, or a page load with it on)
export default function DrunkFilter() {
  const [on, setOn] = useState(false);
  // Which font (index into SIZES): picked when it turns on
  const [size, setSize] = useState(0);

  // The saved setting, once on load (after hydration on purpose: the
  // server can't read the browser's storage, so the first render
  // matches the server's)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved?.on) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSize(randomSize());
        setOn(true);
      }
    } catch {
      // No storage (private window…): start off
    }
  }, []);

  // Saves the setting
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ on }));
    } catch {
      // Not saved; it still works for this visit
    }
  }, [on]);

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
    <div
      data-reveal-part="nav"
      className="pStyle fixed right-[24px] bottom-[24px] z-80"
    >
      {/* "Drunk": a toggle (shadcn's default button, rounded); pressed,
          the drunk font on (a new random one each time), the button dark */}
      <Button
        variant={on ? "primary" : "secondary"}
        size="pill-lg"
        aria-pressed={on}
        onClick={() => {
          if (!on) setSize(randomSize());
          setOn(!on);
        }}
      >
        Drunk
      </Button>
    </div>
  );
}
