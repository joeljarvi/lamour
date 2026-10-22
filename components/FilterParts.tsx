"use client";

import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

// Shared pieces of the page menus' filter panels and search (the shop's and
// the articles page's). Their link-style buttons set text-foreground: the
// link variant's own text is white (text-background, for the navbar's
// mix-blend-difference), which would vanish on these light backgrounds

// Drop-down headings in a filter panel: label left, pointing hand right;
// capitals with Baskerville Neo's swashes (h2Style's italic comes from
// @apply, which the .italic swash rule in globals.css doesn't catch)
export const DROPDOWN_HEADING_CLASS =
  "flex w-full text-foreground h-12 lg:h-9 items-center justify-between px-3 cursor-pointer uppercase font-baskervilleNeoText [font-feature-settings:'swsh'_1]";

// Options that work like check buttons: the pointing hand (the link
// variant's ::after) shows only while the option is selected (not on
// hover), at the right end of the row
const CHECK_CLASS =
  "justify-between hover:after:opacity-0 aria-pressed:after:opacity-100!";

// The mobile menu's X: two 16px hairlines crossed at ±45°
export function HairlineX() {
  return (
    <span aria-hidden className="relative block size-4 shrink-0">
      <span className="absolute left-0 top-1/2 block h-[0.5px] w-4 bg-foreground rotate-45" />
      <span className="absolute left-0 top-1/2 block h-[0.5px] w-4 bg-foreground -rotate-45" />
    </span>
  );
}

// One filter group: a drop-down heading (☞ closed, ☟ open) over its
// options. Clicking the selected option clears it
export function FilterGroup({
  label,
  options,
  selected,
  onSelect,
  open,
  onOpenChange,
  names,
  twoColumns,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected?: string;
  onSelect: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Lists of names: left-aligned, cut off when long, scrolling on their own
  names?: boolean;
  // Options in two columns (e.g. years)
  twoColumns?: boolean;
}) {
  return (
    <div className="bg-neutral-100">
      {/* Left and bottom line (the left lines divide the columns) */}
      <h3 className="h2Style h-12 lg:h-9 border-b border-b-neutral-600 border-l border-l-neutral-600">
        <button
          type="button"
          aria-expanded={open}
          className={DROPDOWN_HEADING_CLASS}
          onClick={() => onOpenChange(!open)}
        >
          {label}
          <span aria-hidden className="font-baskervilleNeoDisplay">
            {open ? "☟" : "☞"}
          </span>
        </button>
      </h3>
      {open && (
        <ul
          className={
            names
              ? "max-h-[40vh] overflow-y-auto overflow-x-hidden scrollbar-none"
              : twoColumns
                ? "grid grid-cols-2"
                : ""
          }
        >
          {options.map((o) => (
            <li key={o.value}>
              <Button
                variant="link"
                size="xs"
                aria-pressed={selected === o.value}
                className={`w-full min-w-0 px-12 bg-background text-foreground border-b h-12 lg:h-9 border-b-neutral-600 aria-pressed:after:opacity-100 ${names ? "justify-start" : CHECK_CLASS}`}
                onClick={() => onSelect(o.value)}
              >
                {/* Long names are cut off with an ellipsis */}
                <span className="truncate">{o.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Apply, then clear, at the end of a filter panel (the bottom on mobile): a
// full-width row, half each, stuck to the bottom of the panel's scroll area
// so it stays in view
export function FilterActions({
  onApply,
  onClear,
}: {
  // Applies the draft and closes the panel
  onApply: () => void;
  // Clears the draft and the applied filters at once
  onClear: () => void;
}) {
  const tFilter = useTranslations("Filter");
  return (
    <div className="sticky bottom-0 z-10 grid grid-cols-2 lg:col-span-12">
      <Button
        variant="link"
        size="sm"
        className="w-full border-l border-l-neutral-600 border-b-neutral-600 border-b bg-neutral-600 text-background h-12 lg:h-9 font-baskervilleNeoText after:content-none"
        onClick={onApply}
      >
        {tFilter("apply")}
      </Button>
      <Button
        variant="link"
        size="sm"
        className="w-full bg-neutral-100 text-foreground border-l border-l-neutral-600 border-b-neutral-600 border-b h-12 lg:h-9 font-baskervilleNeoText after:content-none"
        onClick={onClear}
      >
        {tFilter("clear")}
      </Button>
    </div>
  );
}

// Search field for a page menu bar; narrows as you type. Shaded like an open
// menu button while focused or holding a search, with an X to clear it
export function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const tFilter = useTranslations("Filter");
  return (
    <div className="relative h-full">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={tFilter("search")}
        aria-label={tFilter("search")}
        // Room on the right for the clear button; the browser's own clear
        // button hidden
        className={`w-full   pl-3 pr-12 h3Style h-12 lg:h-9 font-baskervilleNeoText text-xs uppercase tracking-[24%] placeholder:text-foreground outline-none [&::-webkit-search-cancel-button]:appearance-none ${value ? "" : " focus:bg-neutral-100"}`}
      />
      {value && (
        <button
          type="button"
          aria-label={tFilter("clearSearch")}
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 w-12 flex items-center justify-center cursor-pointer hover:opacity-60 transition-opacity"
        >
          <HairlineX />
        </button>
      )}
    </div>
  );
}
