"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

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
          className="fixed inset-0 z-60 m-auto flex h-screen  w-full flex-col items-center justify-center overflow-y-auto bg-yellow-300 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-baskervilleSC lowercase text-lg lg:text-xl">
              Om oss
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer font-baskervilleNeoText text-xs normal-case tracking-wide underline-offset-4 hover:underline"
            >
              {t("closeMenu")} (x)
            </button>
          </div>
          <p className="font-baskerVilleOld text-base">
            Sedan 2017 har vi samlat ung litteratur under ett skevt
            konsthistoriskt paraply och publicerat över hundra författare och
            konstnärer i början, mitten, och slutet av sina karriärer. Målet?
            Att ge skimret av ett samlad förtrupp. Att historisera allt nu. En
            tids skrift av text och bild.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
