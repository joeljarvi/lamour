import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sv"],
  defaultLocale: "en",
  // English lives at "/", Swedish at "/sv"
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
