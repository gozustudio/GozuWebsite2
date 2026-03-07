import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "en", "lt", "es", "sv", "no", "da", "nl", "de", "fr", "it",
    "lv", "et", "ru", "pl", "fi", "pt", "cs", "hu", "ro", "el",
    "hr", "sr", "bg", "sk", "sl", "uk",
  ],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
