import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge, taught about pStyle (globals.css: the body text's font,
// size, line height and letter spacing in one class): pStyle replaces any
// of those set before it (e.g. a Button size's text-xs, leading-[1] and
// tracking-[48%]), so it isn't overridden by them. Ones set after it (a
// display font on a title, lg:text-6xl…) still win over its parts
const twMerge = extendTailwindMerge<"p-style">({
  extend: {
    classGroups: { "p-style": ["pStyle"] },
    conflictingClassGroups: {
      "p-style": ["font-size", "leading", "tracking", "font-family"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
