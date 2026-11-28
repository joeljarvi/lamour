"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

// Where the visitor's answer is kept in the browser
const STORAGE_KEY = "lamour-cookie-consent";

export type CookieConsent = "accepted" | "declined";

// The visitor's answer, or null if they haven't answered (or storage isn't
// available). For scripts that need consent (analytics etc.) to check
// before they load
export function getCookieConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

// The answers, as link buttons in the bar's light text
const OPTION =
  "w-auto font-baskervilleNeoText text-1 text-secondary hover:underline underline-offset-4";

// The cookie bar: a dark strip along the bottom of the screen, sliding up
// once the page has revealed and staying until the visitor
// answers (saved in the browser for scripts to check). "Det är OK"
// accepts, "Nej, tack." declines, "Vadå kakor?" shows what they are in
// its place
export default function CookieAccept() {
  const t = useTranslations("Cookies");
  // Shown once the page has revealed itself, and kept on screen (scrolled
  // or not) until answered on this visit. For now it asks on every visit
  // (an answer from an earlier visit doesn't hide it)
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const open = revealed && !answered;
  const [explain, setExplain] = useState(false);

  // The page revealed: PageReveal's last step (html[data-reveal] = 3; at
  // once on a page without it)
  useEffect(() => {
    const root = document.documentElement;
    const ready = () => {
      const step = root.getAttribute("data-reveal");
      return step === null || Number(step) >= 3;
    };
    if (ready()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealed(true);
      return;
    }
    const observer = new MutationObserver(() => {
      if (ready()) {
        setRevealed(true);
        observer.disconnect();
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-reveal"],
    });
    return () => observer.disconnect();
  }, []);

  function answer(consent: CookieConsent) {
    try {
      localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // No storage: it'll ask again next visit
    }
    setAnswered(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label={t("label")}
          className="fixed inset-x-0 bottom-0 z-[95] flex min-h-8 flex-col gap-x-6 gap-y-1 bg-foreground px-6 py-2 text-secondary lg:flex-row lg:items-center lg:justify-between"
          initial={{ y: "100%" }}
          animate={{ y: 0, transition: { duration: 0.4, ease: "easeOut" } }}
          exit={{ y: "100%", transition: { duration: 0.3, ease: "easeIn" } }}
        >
          <p className="font-baskervilleNeoText text-1">
            {explain ? t("explain") : t("text")}
          </p>
          <div className="flex shrink-0 items-center gap-2 font-baskervilleNeoText text-1">
            <Button
              variant="Link"
              size="linkSize"
              className={OPTION}
              onClick={() => answer("accepted")}
            >
              {t("accept")}
            </Button>
            <span aria-hidden>/</span>
            <Button
              variant="Link"
              size="linkSize"
              className={OPTION}
              onClick={() => answer("declined")}
            >
              {t("decline")}
            </Button>
            <span aria-hidden>/</span>
            <Button
              variant="Link"
              size="linkSize"
              className={OPTION}
              aria-expanded={explain}
              onClick={() => setExplain((v) => !v)}
            >
              {t("what")}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
