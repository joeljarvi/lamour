"use client";

import { useEffect } from "react";

// A page's colour theme (globals.css: .theme-redwine, .theme-blue): set
// on <html> while the page is shown, so everything outside the page (the
// navbar, the cart, modals) takes it too; removed when leaving the page
export default function ColorTheme({ name }: { name: "redwine" | "blue" }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-color-theme", name);
    return () => {
      if (root.getAttribute("data-color-theme") === name)
        root.removeAttribute("data-color-theme");
    };
  }, [name]);
  return null;
}
