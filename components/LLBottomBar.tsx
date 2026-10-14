"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";

export type BarFilter = { id: string; label: string };

// Floating bottom nav.
// "filter" grows the bar upwards with one row per filter.
export default function LLBottomBar({
  visible = true,
  filters = [],
  activeFilter,
  onFilterChange,
  onSearch,
}: {
  // Hidden bars fade out and ignore clicks but stay mounted, so the open
  // filters / search text survive
  visible?: boolean;
  filters?: BarFilter[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  onSearch?: (query: string) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  function updateQuery(value: string) {
    setQuery(value);
    onSearch?.(value);
  }

  return (
    // Pinned bottom right on mobile, bottom left on desktop. Open filters
    // stretch the bar across the screen (inset 24px each side); the controls
    // row keeps one width and stays on its side, so the filter button never
    // moves
    <nav
      className={`fixed bottom-6 z-50 flex flex-col items-end lg:items-start bg-transparent font-baskervilleNeoText text-xl leading-none gap-0 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${
        filtersOpen
          ? "left-6 right-6"
          : "right-6 left-auto lg:left-6 lg:right-auto"
      }`}
    >
      <div className="flex w-full bg-background border border-foreground">
        <div className="flex flex-col w-full">
          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                className="flex flex-col gap-6 p-6 overflow-hidden bg-background "
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {filters.map((f) => (
                  <Button
                    key={f.id}
                    variant="link"
                    size="xs"
                    aria-pressed={activeFilter === f.id}
                    // Selected filter keeps the link variant's ☜ visible
                    className="aria-pressed:after:opacity-100"
                    onClick={() => onFilterChange?.(f.id)}
                  >
                    {f.label}
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <span className="flex items-center justify-start self-end lg:self-start px-1.5 w-auto lg:w-[calc(50vw-48px)]">
            {/* Search; a swash X clears it once something is typed */}
            <div className="relative hidden lg:block w-full">
              <input
                type="search"
                placeholder="sök..."
                aria-label="sök"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                className="h-16 w-full bg-background pl-6 pr-14 font-baskervilleNeoDisplay tracking-[24%] text-sm uppercase placeholder:text-foreground outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                // Baskerville Neo's swash X (OpenType "swsh")
                <button
                  type="button"
                  aria-label="rensa sökning"
                  onClick={() => updateQuery("")}
                  className="absolute right-0 inset-y-0 w-14 flex items-center justify-center cursor-pointer font-baskervilleNeoDisplay text-base [font-feature-settings:'swsh'_1] hover:opacity-60 transition-opacity"
                >
                  X
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-auto h-16 px-6 gap-6"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((o) => !o)}
            >
              {/* Mobile shows only the icon: ☝ closed, swash X open. Fixed
                  width so swapping them doesn't shift anything */}
              <span className="hidden lg:inline">filter</span>
              <span className="inline-flex w-6 justify-center">
                {filtersOpen ? (
                  <span className="font-baskervilleNeoDisplay [font-feature-settings:'swsh'_1]">
                    X
                  </span>
                ) : (
                  "☝"
                )}
              </span>
            </Button>
          </span>
        </div>
      </div>
    </nav>
  );
}
