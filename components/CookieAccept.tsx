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

// Cookie notice: slides up at the bottom of the screen once the visitor
// starts scrolling (on every visit, for now), until they accept or decline; the answer is kept in
// the browser. Full width less 24px each side on mobile; on desktop centred
// at the bottom (inset-x-0 + mx-auto, as Motion's slide owns `transform`)
export default function CookieAccept() {
  const t = useTranslations("Cookies");
  // Opened once the visitor first scrolls (not on load, so it doesn't
  // cover the home page's intro). For now it asks on every visit, even if
  // answered before; to ask only once, open it only when
  // getCookieConsent() is null
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        setOpen(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function answer(consent: CookieConsent) {
    try {
      localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // No storage: it'll ask again next visit
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label={t("label")}
          className="fixed bottom-6 left-6  lg:mx-0 lg:w-md z-[95] flex flex-col gap-6 p-6  border border-neutral-700 bg-background text-foreground"
          // Rises in shortly after the first scroll; leaves at once when
          // answered
          initial={{ opacity: 0, y: 24 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut", delay: 0.6 },
          }}
          exit={{
            opacity: 0,
            y: 24,
            transition: { duration: 0.3, ease: "easeIn" },
          }}
        >
          <p className="pStyle">{t("text")}</p>
          <div className="flex items-baseline justify-between">
            <Button
              variant="link"
              size="xs"
              className="w-auto px-0 text-foreground tracking-wide text-[18px] lg:text-lg after:content-none "
              onClick={() => answer("declined")}
            >
              ( {t("decline")} )
            </Button>
            <Button
              variant="link"
              size="xs"
              className="w-auto px-0 text-foreground tracking-wide text-[18px] lg:text-lg after:content-none"
              onClick={() => answer("accepted")}
            >
              ( {t("accept")} )
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
