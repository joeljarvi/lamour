import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

// The pill sizes' look (it wins over the variant's colours: the size's
// classes come after them): no rounding, no fill, the text in the
// primary colour; on hover (and while pressed, aria-pressed: a chosen
// toggle) filled with the primary colour, sweeping in from the left, the
// text the light secondary
// The fill is a primary-coloured band (a gradient of one colour) growing
// from the left edge to the full width (its background-size 0 → 100%)
export const PILL_LOOK =
  "rounded-none shadow-none bg-transparent text-primary bg-linear-to-r from-primary to-primary bg-no-repeat bg-left bg-[length:0%_100%] transition-[background-size,color] duration-300 ease-out hover:bg-[length:100%_100%] hover:text-secondary aria-pressed:bg-[length:100%_100%] aria-pressed:text-secondary";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center    w-full rounded-none  transition-all disabled:pointer-events-none whitespace-nowrap disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground border border-foreground whitespace-nowrap justify-center",
        // shadcn's default button (dark fill, light text)
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-1 border-x-foreground border-y-transparent hover:bg-foreground hover:text-background ",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: " tracking-[24%] bg-background ",
        link: " text-white    ",
        // Links: dark text, no fill or shadow
        Link: "w-auto bg-transparent text-foreground",
        // The top navbar's buttons: transparent, as tall as their text; the
        // pointing hand (☞) before the text on hover, keyboard focus and
        // for the current page (aria-current="page"), opening up its room
        // so the text slides right. The hand exactly as tall as the
        // capitals: both on the baseline (the buttons are items-baseline;
        // hidden with clip-path, as overflow would move its baseline), its
        // glyph 0.486em tall against the capitals' 0.705em, so 1.45× the
        // text's size. About 2px from the text (its negative margin takes
        // back the size's 4px gap: all of it while hidden)
        LLButton:
          "w-auto bg-transparent text-foreground before:content-['☞'] before:inline-block before:[clip-path:inset(0)] before:whitespace-nowrap before:font-baskervilleNeoDisplay before:text-[1.45em] before:leading-none before:w-0 before:-mr-1 before:opacity-0 before:transition-[width,margin,opacity] before:duration-300 before:ease-out hover:before:w-[0.98em] hover:before:-mr-0.5 hover:before:opacity-100 focus-visible:before:w-[0.98em] focus-visible:before:-mr-0.5 focus-visible:before:opacity-100 aria-[current=page]:before:w-[0.98em] aria-[current=page]:before:-mr-0.5 aria-[current=page]:before:opacity-100",
        // As LLButton, but the hand after the text, pointing back at it (☜),
        // 6px from it when shown (2px margin + the size's 4px gap)
        LLButtonLeft:
          "w-auto bg-transparent text-foreground after:content-['☜'] after:inline-block after:[clip-path:inset(0)] after:whitespace-nowrap after:font-baskervilleNeoDisplay after:text-[1.45em] after:leading-none after:w-0 after:-ml-1 after:opacity-0 after:transition-[width,margin,opacity] after:duration-300 after:ease-out hover:after:w-[0.98em] hover:after:ml-0.5 hover:after:opacity-100 focus-visible:after:w-[0.98em] focus-visible:after:ml-0.5 focus-visible:after:opacity-100 aria-[current=page]:after:w-[0.98em] aria-[current=page]:after:ml-0.5 aria-[current=page]:after:opacity-100",
        navLink:
          "font-baskervilleSC lowercase tracking-widest text-foreground bg-transparent hover:bg-foreground hover:text-background transition-colors justify-start",
        navLinkDesktop:
          "font-baskervilleSC lowercase tracking-widest text-foreground bg-transparent  hover:text-foreground/80 transition-colors w-auto",
      },
      size: {
        default:
          "h-14 lg:h-20   has-[>svg]:px-3  text-xs font-baskervilleNeoDisplay tracking-[48%] uppercase cursor-pointer ",
        // The type scale's smallest (text-1), capitals, wider spacing (as the
        // nav links)
        xs: "h-6 lg:h-9 px-3 font-baskervilleNeoText text-1 tracking-wider uppercase gap-1 rounded-none has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: " text-xs font-baskervilleNeoText uppercase has-[>svg]:px-3 px-4 justify-center tracking-[48%] h-12 gap-x-4  ",
        lg: "h-14 font-baskervilleNeoDisplay  px-6 has-[>svg]:px-4 justify-between w-full text-xl border-b border-b-foreground ",
        // shadcn's sizes (pill: default, -sm, -lg; icon-pill: square),
        // square-cornered, transparent until hover (PILL_LOOK)
        pill: `h-9 w-auto px-4 py-2 gap-2 has-[>svg]:px-3 text-2 font-medium ${PILL_LOOK}`,
        "icon-pill": `size-9 ${PILL_LOOK}`,
        "pill-sm": `h-8 w-auto px-3 gap-1.5 has-[>svg]:px-2.5 text-sm font-medium ${PILL_LOOK}`,
        "pill-lg": `h-10 w-auto px-6 gap-2 has-[>svg]:px-4 text-sm font-medium ${PILL_LOOK}`,
        "icon-pill-lg": `size-10 ${PILL_LOOK}`,
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        linkSize: "h-auto p-0",
        navLinkMobile:
          "h-auto pt-2 pb-3 px-6 border-b border-foreground/20 text-xl justify-start gap-6 lg:text-lg w-full",
        navLinkDesktop:
          "h-auto  px-6 text-xl justify-start gap-6 lg:text-lg w-min whitespace-nowrap",
      },
      // Overrides the font set by `variant`; omit to keep the variant's font
      font: {
        baskervilleSC: "font-baskervilleSC",
        universTypewriter: "font-universTypewriter",
      },
    },
    compoundVariants: [
      // Pointing hand after the link, faded in on hover, on the active link
      // (aria-current="page") and on an open submenu toggle (aria-expanded="true").
      // Always rendered so its space is reserved and the label doesn't shift.
      {
        variant: "link",
        size: ["lg", "sm", "xs"],
        class:
          "after:content-['☜'] after:ml-2 after:font-baskervilleNeoDisplay after:opacity-0 after:transition-opacity after:duration-300 after:ease-out hover:after:opacity-100 focus-visible:after:opacity-100 aria-[current=page]:after:opacity-100 aria-expanded:after:opacity-100",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  font,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, font, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
