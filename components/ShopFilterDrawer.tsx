"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

export type ShopSort = "latest" | "az";

// A row's label: John Sans, small capitals, spaced out
const LABEL = "font-baskervilleNeoText text-sm normal-case tracking-wide";

// The shop's filters, in a panel (on mobile sliding up from the bottom, as
// tall as its content, at most the screen): search, sorting (latest / A–Ö)
// and the contributors (any of the chosen ones), stacked, each section
// framed. On mobile a full-width overlay; on desktop (`inline`) a cell in
// the shop's grid, a third of its width. Changes apply at once;
// "Visa resultat" just closes it
export default function ShopFilterDrawer({
  open,
  onClose,
  query,
  setQuery,
  sort,
  setSort,
  contributors,
  chosen,
  toggleContributor,
  clear,
  resultCount,
  inline = false,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (value: string) => void;
  sort: ShopSort;
  setSort: (value: ShopSort) => void;
  // Every contributor across the issues, sorted
  contributors: string[];
  chosen: string[];
  toggleContributor: (name: string) => void;
  clear: () => void;
  resultCount: number;
  // Desktop: a column a third of the screen wide, fixed on the left below
  // the navbar (the shop's grid moves right to make room), instead of the overlay,
  // which is then mobile only
  inline?: boolean;
}) {
  const t = useTranslations("Filter");

  // Esc closes it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // The chosen option dark and underlined, the others grey
  const option = (active: boolean) =>
    `w-auto h-9 lg:h-14 px-0 justify-start after:content-none ${LABEL} ${
      active
        ? "text-foreground underline underline-offset-4 decoration-[0.5px]"
        : "text-neutral-400 hover:text-foreground"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (overlay only): a click outside closes it */}
          {!inline && (
            <motion.div
              className="fixed inset-0 z-50 bg-foreground/20 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
            />
          )}

          <motion.aside
            aria-label={t("title")}
            className={`bg-background flex flex-col pl-6 pt-0 font-baskervilleNeoText tracking-wide ${
              inline
                ? "hidden lg:flex fixed left-0 top-14 z-40 w-1/3 h-[calc(100dvh-3.5rem)]"
                : "fixed bottom-0 left-0 z-50 max-h-dvh w-full shadow-md lg:hidden"
            }`}
            initial={inline ? { opacity: 0 } : { y: "100%" }}
            animate={inline ? { opacity: 1 } : { y: 0 }}
            exit={inline ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-0 bg-background">
              {/* Search: issue number, title, contributors and editors */}
              <div className="flex flex-col">
                <section className="border-t border-x border-neutral-600">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    aria-label={t("search")}
                    className={`w-full h-14 px-6 bg-transparent outline-none placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:appearance-none ${LABEL}`}
                  />
                </section>

                {/* Sort: latest first (as the issues come), or by title A–Ö */}
                <section
                  role="group"
                  aria-label={t("sortBy")}
                  className="flex items-baseline gap-6 px-6 py-0 border-t border-x border-neutral-600"
                >
                  <span className={`${LABEL} text-neutral-700 italic`}>
                    {t("sortBy")}:
                  </span>
                  {(
                    [
                      ["latest", t("latest")],
                      ["az", t("az")],
                    ] as const
                  ).map(([value, label]) => (
                    <Button
                      key={value}
                      variant="link"
                      size="xs"
                      aria-pressed={sort === value}
                      className={`${option(sort === value)} font-baskervilleNeoDisplay`}
                      onClick={() => setSort(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </section>
              </div>

              {/* Contributors, in an area filling the rest of the panel: the
                  only part that scrolls (no scrollbar) */}
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none border-t border-x border-neutral-600">
                {/* Contributors: one button each, any number chosen (an issue
                  shows if it has any of them) */}
                {contributors.length > 0 && (
                  <section
                    role="group"
                    aria-label={t("contributors")}
                    className="flex flex-col"
                  >
                    <span
                      className={`${LABEL} shrink-0 text-neutral-700 h-14 border-b px-6 flex items-center justify-start italic border-neutral-600`}
                    >
                      {t("contributors")}:
                    </span>
                    <div className="flex flex-col py-3 px-6">
                      {contributors.map((name) => (
                        <Button
                          key={name}
                          variant="link"
                          size="xs"
                          aria-pressed={chosen.includes(name)}
                          // As tall as the name needs (wrapping when long)
                          className={`${option(chosen.includes(name))} h-auto lg:h-auto py-1.5 whitespace-normal text-left`}
                          onClick={() => toggleContributor(name)}
                        >
                          {name}
                        </Button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Footer, on the right: clear everything, then close to see
                the results */}
            <div className="flex gap-6 py-6 border-t border-neutral-600 items-center">
              <Button
                variant="link"
                size="xs"
                className={`flex-1 w-auto h-12 lg:h-14 justify-center px-0 border border-neutral-600 text-foreground after:content-none ${LABEL}`}
                onClick={clear}
              >
                {t("clear")}
              </Button>
              <Button
                variant="default"
                size="xs"
                // Twice as wide as "Rensa" (flex-2 to its flex-1)
                className={`flex-2 w-auto h-12 lg:h-14 justify-center px-6 bg-foreground text-background hover:bg-foreground ${LABEL}`}
                onClick={onClose}
              >
                {t("apply")} ({resultCount})
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
