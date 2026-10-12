import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center    w-full rounded-none  transition-all disabled:pointer-events-none whitespace-nowrap disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap justify-center",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border-1 border-x-foreground border-y-transparent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-foreground bg-transparent hover:bg-foreground  hover:text-background font-baskervilleSC justify-start  ",
        link: " text-primary hover:text-primary/80    ",
        navLink:
          "font-baskervilleSC lowercase tracking-widest text-foreground bg-transparent hover:bg-foreground hover:text-background transition-colors justify-start",
        navLinkDesktop:
          "font-baskervilleSC lowercase tracking-widest text-foreground bg-transparent  hover:text-foreground/80 transition-colors w-auto",
      },
      size: {
        default:
          "h-14 lg:h-20   has-[>svg]:px-3 uppercase font-universTypewriter text-base lg:text-sm hover:text-foreground/80 cursor-pointer ",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: " text-sm font-universTypewriter uppercase has-[>svg]:px-3 px-4 justify-start h-12 gap-x-4  ",
        lg: "h-14 font-baskervilleNeoDisplay  px-6 has-[>svg]:px-4 justify-between w-full text-xl border-b border-b-foreground ",
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
      // Pointing hand after the active link (aria-current="page") or an open
      // submenu toggle (aria-expanded="true")
      {
        variant: "link",
        size: ["lg", "sm"],
        class:
          "aria-[current=page]:after:content-['☜'] aria-expanded:after:content-['☜'] after:ml-2 after:font-baskervilleNeoDisplay",
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
