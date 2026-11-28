"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

// Time between the steps, and each step's fade (ms)
const STEP = 500;
const FADE = 600;

// Every page reveals itself in three steps, top to bottom in order of
// importance: 1. the wordmark, 2. the page's content, 3. the navigation
// (the menu, cart, toggles). Each part is marked data-reveal-part="mark" |
// "content" | "nav"; the page's step is html[data-reveal] (0: nothing yet,
// 1–3: up to that part), and the rule below hides the parts not yet
// reached, each fading in when its turn comes. On a full load it starts as
// the loader has gone (LOADER_TOTAL); on moving to another page, at once.
// Before this runs (the server's page) nothing is hidden. Its rule is
// added from here rather than globals.css so it's always served with it
const RULE = `[data-reveal-part] {
  transition: opacity ${FADE}ms ease;
}
html[data-reveal="0"] [data-reveal-part],
html[data-reveal="1"] [data-reveal-part="content"],
html[data-reveal="1"] [data-reveal-part="nav"],
html[data-reveal="2"] [data-reveal-part="nav"] {
  opacity: 0;
}`;

export default function PageReveal() {
  const pathname = usePathname();
  const first = useRef(true);

  // Before the page is painted (layout effect), so a new page never shows
  // before its turn
  useLayoutEffect(() => {
    const root = document.documentElement;
    // At once: the loader is off for now (with it, a full load waited
    // LOADER_TOTAL for it to go)
    const start = 0;
    first.current = false;
    root.setAttribute("data-reveal", "0");
    const timers = [1, 2, 3].map((n) =>
      setTimeout(
        () => root.setAttribute("data-reveal", String(n)),
        start + (n - 1) * STEP + 50,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return <style>{RULE}</style>;
}
