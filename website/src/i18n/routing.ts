import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "lt", "es", "sv", "no", "da", "nl", "de", "fr", "it"],
  defaultLocale: "en",
});
