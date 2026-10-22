"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { Button } from "./ui/button";

export type PageMenuSection = {
  key: string;
  label: string;
  // The button's label while the section is open (default: `label`)
  openLabel?: string;
  // Revealed below the bar when the section's button is clicked; as a
  // function it gets `close`, to close the section from inside
  content?: ReactNode | ((close: () => void) => ReactNode);
  // Shown in the bar in place of the button (e.g. a search field); the
  // section then has no button or content
  inline?: ReactNode;
  // Classes placing the button on desktop, e.g. "lg:col-start-5
  // lg:col-span-3" (on mobile every button is full width). Written out in
  // full so Tailwind sees them
  column?: string;
};

// Page-specific menu: a bar at the bottom of the screen on mobile, sticky
// under the top navbar on desktop. Each page passes its own sections; each
// is a button (☟ while open, no hand while closed) that reveals its content.
// One section open at a time; navigating (e.g. opening an issue) closes it
export default function PageMenu({
  sections,
}: {
  sections: PageMenuSection[];
}) {
  // The open section and the path it was opened on — once the path changes
  // it counts as closed
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<{
    key: string;
    pathname: string;
  } | null>(null);
  const openKey = openAt?.pathname === pathname ? openAt.key : null;

  const open = sections.find((s) => s.key === openKey);

  return (
    // Mobile: pinned to the bottom of the screen, the open content above the
    // buttons. Desktop: sticky — in the page where it's rendered (e.g. at the
    // top of the shop, below the hero), scrolling up with it until it
    // reaches the navbar (48px), then staying there; the open content floats
    // below it over the page. A line along the bar's outer edge (top on
    // mobile, bottom on desktop) while every section is closed
    <div
      className={`fixed inset-x-0 bottom-0 lg:sticky lg:inset-x-auto mix-blend-difference lg:bottom-auto lg:top-12 lg:mx-3 bg-transparent z-40  gap-0 pb-3 px-3 lg:px-0 lg:pb-0   grid grid-cols-2 lg:grid-cols-12 ${open ? "" : ""}`}
    >
      {/* Buttons (or inline items): on desktop side by side on the first row
          of the 12-column grid, at their `column`; on mobile half the width
          each (one of 2 columns), 48px tall (h-12). An open section's button
          is shaded */}
      {sections.map((s) =>
        s.inline ? (
          <div
            key={s.key}
            className={`row-start-2 lg:row-start-1 col-span-1 h-12 lg:h-9  ${s.column ?? ""}`}
          >
            {s.inline}
          </div>
        ) : (
          <Button
            key={s.key}
            variant="link"
            size="xs"
            className={`row-start-2 lg:row-start-1 col-span-1 h-12 lg:h-9 justify-self-start justify-between text-foreground after:opacity-100 ${s.column ?? ""} ${openKey === s.key ? " after:content-['☟']" : " after:content-none"}`}
            aria-expanded={openKey === s.key}
            onClick={() =>
              setOpenAt(openKey === s.key ? null : { key: s.key, pathname })
            }
          >
            {openKey === s.key ? (s.openLabel ?? s.label) : s.label}
          </Button>
        ),
      )}
      {/* The open section's content, full width: above the buttons on
          mobile; on desktop floating just below the bar (absolute, so it
          covers the page instead of pushing it down) */}
      {open && (
        <div
          className={`row-start-1 lg:absolute lg:inset-x-0 lg:top-full col-span-2 lg:col-span-12 w-full  max-h-[60vh] overflow-y-auto `}
        >
          {typeof open.content === "function"
            ? open.content(() => setOpenAt(null))
            : open.content}
        </div>
      )}
    </div>
  );
}
