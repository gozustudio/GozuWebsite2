# Language Selector + 26 Locales Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a language selector dropdown to the Header and expand from 10 to 26 European locales.

**Architecture:** LanguageSelector client component using next-intl's useRouter/usePathname/useLocale to switch locales while staying on the same page. 16 new message JSON files with AI-translated UI strings. Font subsets expanded for Cyrillic and Greek.

**Tech Stack:** next-intl 4.8, React 19, Tailwind CSS 4, Framer Motion (optional fade)

---

### Task 1: Update routing config with 26 locales

**Files:**
- Modify: `website/src/i18n/routing.ts`

**Step 1: Update locales array**

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "en", "lt", "es", "sv", "no", "da", "nl", "de", "fr", "it",
    "lv", "et", "ru", "pl", "fi", "pt", "cs", "hu", "ro", "el",
    "hr", "sr", "bg", "sk", "sl", "uk"
  ],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
```

**Step 2: Verify build**

Run: `cd website && npx tinacms build --local --skip-cloud-checks && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add website/src/i18n/routing.ts
git commit -m "feat: expand locales from 10 to 26 European languages"
```

---

### Task 2: Create 16 new message files

**Files:**
- Create: `website/messages/{lv,et,ru,pl,fi,pt,cs,hu,ro,el,hr,sr,bg,sk,sl,uk}.json`

Each file is a translation of `en.json` into the target language. Same JSON structure, translated values. Use native language names for all UI strings.

**Step 1: Create all 16 files**

Generate translations of `en.json` for each new locale. Same keys, translated values.

**Step 2: Verify build**

Run: `cd website && npx tinacms build --local --skip-cloud-checks && npx next build 2>&1 | tail -5`
Expected: Build succeeds with 26 locale paths generated

**Step 3: Commit**

```bash
git add website/messages/
git commit -m "feat: add 16 new locale translation files"
```

---

### Task 3: Update font subsets for Cyrillic and Greek

**Files:**
- Modify: `website/src/app/[locale]/layout.tsx:14-25`

**Step 1: Add cyrillic and greek subsets**

```ts
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek", "greek-ext"],
  display: "swap",
});
```

**Step 2: Commit**

```bash
git add website/src/app/[locale]/layout.tsx
git commit -m "feat: add cyrillic and greek font subsets"
```

---

### Task 4: Build LanguageSelector component

**Files:**
- Create: `website/src/components/layout/LanguageSelector.tsx`

**Step 1: Create component**

Client component that:
- Shows current locale code (e.g. "EN") as trigger
- Opens dropdown on click with all 26 locales showing native names
- Highlights current locale in gold
- Scrollable max-height ~320px
- Closes on click outside, Escape, or selection
- Uses `useRouter().replace()` from next-intl to switch locale on same page
- Uses `usePathname()` and `useLocale()` from next-intl

Locale display map defined inline:
```ts
const LOCALE_NAMES: Record<string, string> = {
  bg: "Български", hr: "Hrvatski", cs: "Čeština", da: "Dansk",
  nl: "Nederlands", en: "English", et: "Eesti", fi: "Suomi",
  fr: "Français", de: "Deutsch", el: "Ελληνικά", hu: "Magyar",
  it: "Italiano", lv: "Latviešu", lt: "Lietuvių", no: "Norsk",
  pl: "Polski", pt: "Português", ro: "Română", ru: "Русский",
  sr: "Srpski", sk: "Slovenčina", sl: "Slovenščina", es: "Español",
  sv: "Svenska", uk: "Українська",
};
```

Sorted alphabetically by native name for dropdown display.

**Step 2: Commit**

```bash
git add website/src/components/layout/LanguageSelector.tsx
git commit -m "feat: add LanguageSelector component"
```

---

### Task 5: Integrate LanguageSelector into Header

**Files:**
- Modify: `website/src/components/layout/Header.tsx`

**Step 1: Add to desktop nav**

Import LanguageSelector. Place it after the "Get Quote" button in the desktop nav `div.hidden.lg:flex`.

**Step 2: Add to mobile menu**

Place it at the bottom of the mobile overlay, below the "Get Quote" link.

**Step 3: Verify locally**

Run: `cd website && npm run dev`
Test: Open localhost:3000, verify selector appears, switching languages works.

**Step 4: Commit**

```bash
git add website/src/components/layout/Header.tsx
git commit -m "feat: integrate language selector into header"
```

---

### Task 6: Update sitemap with locale alternates

**Files:**
- Modify: `website/src/app/sitemap.ts`

**Step 1: Add locale paths to sitemap**

Import routing locales. Generate alternate URLs for each locale for every page. Use `alternates.languages` format per Next.js sitemap spec.

**Step 2: Commit**

```bash
git add website/src/app/sitemap.ts
git commit -m "feat: add locale alternates to sitemap"
```

---

### Task 7: Final build verification and push

**Step 1: Full production build**

Run: `cd website && npx tinacms build --local --skip-cloud-checks && npx next build`
Expected: Build succeeds, 26 locales x pages generated

**Step 2: Test locally**

Run: `cd website && npx next start -p 3001`
Test: `/`, `/es`, `/ru`, `/bg` all return 200. Language selector works.

**Step 3: Push to both branches**

```bash
git push origin master && git push origin master:main
```
