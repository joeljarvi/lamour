import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge, taught about the type scale and pStyle (globals.css: the body text's font,
// size, line height and letter spacing in one class): pStyle replaces any
// of those set before it (e.g. a Button size's text-xs, leading-[1] and
// tracking-[48%]), so it isn't overridden by them. Ones set after it (a
// display font on a title, lg:text-6xl…) still win over its parts
const twMerge = extendTailwindMerge<"p-style">({
  extend: {
    // The type scale's sizes (globals.css: text-1 … text-9), so they're
    // read as font sizes, not colours
    theme: { text: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] },
    classGroups: { "p-style": ["pStyle"] },
    conflictingClassGroups: {
      "p-style": ["font-size", "leading", "tracking", "font-family"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
