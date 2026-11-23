"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

// "Om oss", a yellow card in the middle of the screen when the page loads
// (fixed, over the page, below the navbar), fading in; "Stäng (x)" or
// Escape closes it
export default function LLTextCard() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Om oss"
          className=" fixed inset-0 z-60 m-auto flex h-screen  w-full flex-col items-center justify-center overflow-y-auto  p-4 bg-background/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative flex flex-col max-w-1/2 aspect-video  mx-auto bg-yellow-300 p-3 lg:p-6 ">
            {/* "Stäng (x)", top right: closes the card */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 lg:top-6 lg:right-6 cursor-pointer pStyle text-neutral-800 underline-offset-4 hover:underline"
            >
              {t("closeMenu")} (x)
            </button>
            <div className="mb-12 flex flex-col items-baseline justify-between gap-1 ">
              <h1 className="pStyle ">L'Amour — La Mort</h1>
              <h2 className="pStyle italic tracking-wide ">en tids skrift</h2>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
