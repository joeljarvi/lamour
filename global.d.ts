import { routing } from "@/i18n/routing";
import messages from "./messages/en.json";

// Type-checks translation keys and locales across the app
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
