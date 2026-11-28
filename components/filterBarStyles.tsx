// The shop's and the articles page's filter bars, styled alike: a row of
// 48px buttons and a search box, sticking below the navbar

// The buttons: 12px in from each side; their text centred vertically (no
// vertical padding: the box's height places it)
export const FILTER_TEXT =
  "items-center px-3 lg:px-3 py-0 leading-[14px] lg:leading-[18px]";

// A border round each (its colour from tone; last in each class list, so
// it wins over the buttons' own border colours)
export const BORDER = "border";

// Every button and the search alike, in use or not: light grey text and
// a 1px light grey line under it (last in each class list, after the
// border classes, so it wins). `active` kept for a later difference
export const tone = (active: boolean) =>
  `${active ? "text-neutral-400" : "text-neutral-400"} border-b border-b-neutral-400`;

// Pressed, a button drops 3px down to the right
export const PRESS =
  "transition-[translate] duration-100 active:translate-x-[3px] active:translate-y-[3px]";

// A toggle or sort button in the row (after the first): its own width, a
// line under it
export const ROW_BUTTON = `${FILTER_TEXT} text-[14px] lg:text-[18px] h-12 lg:h-12 w-auto shrink-0 whitespace-nowrap justify-start tracking-wide normal-case bg-background rounded-none border-0 border-b ${PRESS}`;

// The filter controls (shop, articles), sized as the navbar's links on
// desktop
export const NAV_SIZE =
  "lg:h-7 lg:w-auto lg:px-2 lg:pt-[0.45em] lg:pb-1 lg:font-baskervilleNeoText lg:text-1 lg:font-normal lg:uppercase px-3 lg:tracking-wider";

// A thin cross (a toggle's open state, the search's clear)
export function CrossIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 2 14 14M14 2 2 14" />
    </svg>
  );
}
