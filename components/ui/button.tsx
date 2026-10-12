import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center    w-full rounded-none text-sm font-medium transition-all disabled:pointer-events-none whitespace-normal disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap justify-center",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-foreground bg-transparent hover:bg-foreground  hover:text-background font-baskervilleSC justify-start  ",
        link: "justify-start text-primary hover:text-primary/80    ",
        navLink:
          "font-baskervilleSC lowercase tracking-widest text-foreground bg-transparent hover:bg-foreground hover:text-background transition-colors justify-start",
        navLinkDesktop:
          "font-baskervilleSC lowercase tracking-widest text-foreground bg-transparent  hover:text-foreground/80 transition-colors w-auto",
      },
      size: {
        default:
          "h-14 lg:h-20 pb-1 tracking-widest has-[>svg]:px-3 lowercase text-lg lg:text-xl w-full",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 pb-0.5 px-6  tracking-widest has-[>svg]:px-3 lowercase text-base  w-full",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
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
    },
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
