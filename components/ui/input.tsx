import * as React from "react";

import { cn } from "@/lib/utils";

// shadcn's input
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

// The filter bars' search box: square, no border, transparent; on hover
// (and while typing) a light grey (neutral-100) fill sweeping in from the
// left, as the buttons' (PILL_LOOK in button.tsx), the text staying in the
// primary colour
export const SEARCH_LOOK =
  "rounded-none border-0 shadow-none bg-transparent text-primary placeholder:text-primary/60 bg-linear-to-r from-neutral-100 to-neutral-100 bg-no-repeat bg-left bg-[length:0%_100%] transition-[background-size] duration-300 ease-out hover:bg-[length:100%_100%] focus:bg-[length:100%_100%]";

export { Input };
