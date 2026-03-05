# Pending Tasks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 4 features: asset copy script, page-level WebMCP metadata, contact form backend (Resend + Google Sheets), and i18n wiring (next-intl with 10 languages).

**Architecture:** Tasks are ordered by complexity and dependency. Tasks 1-3 are independent. Task 4 (i18n) restructures the app directory, so it goes last. Each task ends with a commit.

**Tech Stack:** Next.js 16.1.6, Tailwind CSS 4, Tina CMS, Resend (email), next-intl 4.8, googleapis

---

## Task 1: Asset Copy Script

**Files:**
- Create: `website/scripts/copy-assets.js`
- Modify: `website/package.json`

**Step 1: Create the copy script**

Create `website/scripts/copy-assets.js`:

```js
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const PUB = path.resolve(__dirname, "../public");

const copies = [
  // Favicons
  { from: "Media/Images/Logo/Favicon", to: "", glob: true },
  // Logos and social icons
  { from: "Media/Images/Logo/SVG", to: "images", glob: true },
  // Landing video
  { from: "Media/Videos/LandingVideo.mp4", to: "videos/LandingVideo.mp4" },
  // Landing image
  { from: "Media/Images/LandingImage.jpg", to: "images/LandingImage.jpg" },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`  ${path.relative(PUB, dest)}`);
}

console.log("Copying brand assets from Media/ to public/...\n");

for (const entry of copies) {
  const src = path.join(ROOT, entry.from);
  if (entry.glob) {
    const destDir = path.join(PUB, entry.to);
    ensureDir(destDir);
    for (const file of fs.readdirSync(src)) {
      copyFile(path.join(src, file), path.join(destDir, file));
    }
  } else {
    const dest = path.join(PUB, entry.to);
    if (!fs.existsSync(src)) {
      console.warn(`  SKIP (not found): ${entry.from}`);
      continue;
    }
    copyFile(src, dest);
  }
}

console.log("\nDone.");
```

**Step 2: Add npm scripts**

In `website/package.json`, update scripts:

```json
{
  "scripts": {
    "copy-assets": "node scripts/copy-assets.js",
    "predev": "node scripts/copy-assets.js",
    "dev": "tinacms dev -c \"next dev\"",
    "build": "tinacms build && next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

**Step 3: Verify**

Run: `cd website && npm run copy-assets`
Expected: Lists all copied files, no errors.

**Step 4: Commit**

```bash
git add website/scripts/copy-assets.js website/package.json
git commit -m "add asset copy script to automate Media/ to public/ copying"
```

---

## Task 2: Page-Level WebMCP Metadata

**Files:**
- Modify: `website/src/app/page.tsx`
- Modify: `website/src/app/contact/page.tsx`
- Modify: `website/src/app/quote/page.tsx`
- Modify: `website/src/app/projects/page.tsx`

Add a `<script type="application/json" id="webmcp">` tag to each page that exposes WebMCP tools. This tells agents what capabilities are available on each page without requiring JavaScript execution.

**Step 1: Add WebMCP metadata to home page**

In `website/src/app/page.tsx`, add inside the return before `{/* Cinematic Hero */}`:

```tsx
<script
  type="application/json"
  id="webmcp"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      tools: [
        {
          name: "get_gozu_studio_info",
          type: "imperative",
          description: "Get information about Gozu Studio including contact details, services, and the founder.",
          readOnly: true,
        },
        {
          name: "search_gozu_projects",
          type: "imperative",
          description: "Search Gozu Studio's architecture and interior design portfolio.",
          readOnly: true,
        },
      ],
    }),
  }}
/>
```

**Step 2: Add WebMCP metadata to contact page**

In `website/src/app/contact/page.tsx`, add inside the return after the schema.org script:

```tsx
<script
  type="application/json"
  id="webmcp"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      tools: [
        {
          name: "contact_gozu_studio",
          type: "declarative",
          description: "Send a contact message to Gozu Studio. Fields: name, email, subject, message.",
          formSelector: "#contactForm",
        },
      ],
    }),
  }}
/>
```

**Step 3: Add WebMCP metadata to quote page**

In `website/src/app/quote/page.tsx`, add inside the return before `{/* Hero */}`:

```tsx
<>
  <script
    type="application/json"
    id="webmcp"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        tools: [
          {
            name: "request_quote_gozu_studio",
            type: "declarative",
            description: "Submit a project quote request to Gozu Studio. 4-step wizard: Contact, Address, Project Details, Package.",
            formSelector: "#quoteForm",
          },
        ],
      }),
    }}
  />
  {/* ... rest of page */}
</>
```

**Step 4: Add WebMCP metadata to projects page**

In `website/src/app/projects/page.tsx`, add inside the return before `{/* Hero */}`:

```tsx
<>
  <script
    type="application/json"
    id="webmcp"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        tools: [
          {
            name: "search_gozu_projects",
            type: "imperative",
            description: "Search and filter Gozu Studio's architecture and interior design portfolio.",
            readOnly: true,
          },
        ],
      }),
    }}
  />
  {/* ... rest of page */}
</>
```

**Step 5: Verify**

Run: `cd website && npm run dev`
Navigate to each page, open DevTools → Elements, search for `id="webmcp"`. Confirm the script tag exists with correct JSON.

**Step 6: Commit**

```bash
git add website/src/app/page.tsx website/src/app/contact/page.tsx website/src/app/quote/page.tsx website/src/app/projects/page.tsx
git commit -m "add page-level WebMCP metadata script tags"
```

---

## Task 3: Contact Form Backend

**Files:**
- Create: `website/src/app/api/contact/route.ts`
- Modify: `website/src/components/sections/ContactForm.tsx`
- Modify: `website/package.json` (add resend dependency)

**Step 1: Install Resend**

```bash
cd website && npm install resend
```

**Step 2: Create API route**

Create `website/src/app/api/contact/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "Contact";

const resend = new Resend(process.env.RESEND_API_KEY);

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, honeypot } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      honeypot?: string;
    };

    // Honeypot — silently accept to fool bots
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email, and message are required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const row = [timestamp, name, email, subject ?? "", message];

    // 1. Save to Google Sheets
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    // 2. Send email notification
    await resend.emails.send({
      from: "Gozu Studio Website <website@gozustudio.com>",
      to: "info@gozustudio.com",
      subject: `New Contact: ${subject ?? "General Inquiry"} — ${name}`,
      text: [
        `New contact form submission`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject ?? "Not specified"}`,
        ``,
        `Message:`,
        message,
        ``,
        `---`,
        `Sent from gozustudio.com contact form at ${timestamp}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
```

**Step 3: Update ContactForm.tsx**

Replace the `handleSubmit` function in `website/src/components/sections/ContactForm.tsx`. The human submission path should call the API:

```tsx
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const nativeEvent = e.nativeEvent as WebMCPSubmitEvent;
  const fd = new FormData(e.currentTarget);

  if (nativeEvent.agentInvoked) {
    const ref = "REF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    nativeEvent.respondWith?.(
      `Contact form submitted successfully. Reference: ${ref}. Name: ${fd.get("name")}, Email: ${fd.get("email")}.`
    );
  }

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        subject: fd.get("subject"),
        message: fd.get("message"),
        honeypot: fd.get("honeypot") ?? "",
      }),
    });
    if (!res.ok) throw new Error("Failed");
    setSubmitted(true);
  } catch {
    setSubmitted(true); // Still show success to avoid leaking backend state
  }
};
```

Also add a hidden honeypot field to the form, before the submit button:

```tsx
<input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
```

**Step 4: Verify**

Run: `cd website && npm run dev`
Open http://localhost:3000/contact, submit the form. Check:
1. Google Sheet "Contact" tab has the new row (create the "Contact" sheet first if needed)
2. Email arrives at info@gozustudio.com

Note: For local testing, add `RESEND_API_KEY` to `website/.env.local`. You'll also need to verify the `gozustudio.com` domain in Resend first (DNS records in Squarespace).

**Step 5: Commit**

```bash
git add website/src/app/api/contact/route.ts website/src/components/sections/ContactForm.tsx website/package.json website/package-lock.json
git commit -m "add contact form backend with Resend email + Google Sheets"
```

---

## Task 4: i18n Wiring (next-intl)

This is the largest task. It restructures the app directory to support locale-prefixed routes.

**Locales:** `en` (default, no prefix), `lt`, `es`, `sv`, `no`, `da`, `nl`, `de`, `fr`, `it`

**Files:**
- Create: `website/src/i18n/routing.ts`
- Create: `website/src/i18n/request.ts`
- Create: `website/src/i18n/navigation.ts`
- Create: `website/src/middleware.ts`
- Create: `website/messages/en.json`
- Create: `website/messages/lt.json` (and 8 more locale files)
- Move: all `src/app/` page routes into `src/app/[locale]/`
- Modify: `layout.tsx` → `[locale]/layout.tsx`
- Modify: all page files to use `useTranslations` / `getTranslations`
- Modify: `Header.tsx`, `Footer.tsx` to use translations
- Modify: `next.config.ts` (if exists) or `next.config.js`

### Step 1: Create i18n routing config

Create `website/src/i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "lt", "es", "sv", "no", "da", "nl", "de", "fr", "it"],
  defaultLocale: "en",
});
```

### Step 2: Create i18n request config

Create `website/src/i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

### Step 3: Create navigation helpers

Create `website/src/i18n/navigation.ts`:

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### Step 4: Create middleware

Create `website/src/middleware.ts`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except:
    // - /api, /_next, /admin, /.well-known, /images, /videos, /uploads
    // - files with extensions (favicon.ico, robots.txt, etc.)
    "/((?!api|_next|admin|\\.well-known|images|videos|uploads|projects/.*\\.|.*\\..*).*)",
  ],
};
```

### Step 5: Create English message file

Create `website/messages/en.json` with all UI strings extracted from pages:

```json
{
  "nav": {
    "projects": "Projects",
    "about": "About",
    "services": "Services",
    "contact": "Contact",
    "getQuote": "Get a Quote",
    "requestQuote": "Request a Quote"
  },
  "home": {
    "aboutLabel": "About the Studio",
    "learnMore": "Learn More",
    "portfolioLabel": "Portfolio",
    "selectedWorks": "Selected Works",
    "viewAllProjects": "View All Projects",
    "whatWeDo": "What We Do",
    "ourServices": "Our Services",
    "architectureTitle": "Architecture",
    "architectureDesc": "From concept to completion — bespoke residential and commercial architecture that responds to context, light, and living.",
    "interiorTitle": "Interior Design",
    "interiorDesc": "Considered interiors that harmonise material, proportion, and craft. Every detail serves the whole.",
    "renovationTitle": "Renovation",
    "renovationDesc": "Thoughtful transformation of existing spaces — preserving character while introducing contemporary clarity.",
    "exploreServices": "Explore Services"
  },
  "about": {
    "label": "About",
    "title": "The Studio",
    "founderLabel": "Founder",
    "approachLabel": "Our Approach",
    "approachTitle": "How We Work",
    "cta": "Let's create something together.",
    "ctaButton": "Get in Touch"
  },
  "services": {
    "label": "What We Do",
    "title": "Our Services",
    "processLabel": "Process",
    "processTitle": "From Vision to Reality",
    "cta": "Ready to start your project?",
    "ctaButton": "Request a Quote"
  },
  "projects": {
    "label": "Portfolio",
    "title": "Our Projects",
    "subtitle": "A curated selection of residential and commercial architecture, interior design, and renovation projects."
  },
  "contact": {
    "label": "Contact",
    "title": "Get in Touch",
    "subtitle": "We would love to hear about your project. Reach out and let's start a conversation.",
    "emailLabel": "Email",
    "messageUsLabel": "Message Us",
    "socialLabel": "Social",
    "formName": "Name",
    "formNamePlaceholder": "Your name",
    "formEmail": "Email",
    "formEmailPlaceholder": "your@email.com",
    "formSubject": "Subject",
    "formMessage": "Message",
    "formMessagePlaceholder": "Tell us about your project...",
    "formSubmit": "Send Message",
    "formSuccess": "Thank you for reaching out.",
    "formSuccessDetail": "We'll be in touch within 24 hours.",
    "subjectArchitecture": "Architecture Project",
    "subjectInterior": "Interior Design",
    "subjectRenovation": "Renovation",
    "subjectConsultation": "General Consultation",
    "subjectOther": "Other"
  },
  "quote": {
    "label": "Get Started",
    "title": "Request a Quote",
    "subtitle": "Answer a few questions about your project and we'll provide a personalised estimate. No commitment required."
  },
  "privacy": {
    "title": "Privacy Policy"
  },
  "footer": {
    "cta": "Have a project in mind?",
    "ctaSub": "Let's create something extraordinary together.",
    "ctaButton": "Request a Quote",
    "navigateLabel": "Navigate",
    "contactLabel": "Contact",
    "followLabel": "Follow",
    "brandLine1": "Luxury architecture & interior design.",
    "brandLine2": "Projects across Europe.",
    "copyright": "© {year} Gozu Studio. All rights reserved.",
    "privacyLink": "Privacy Policy"
  }
}
```

### Step 6: Generate translation files for other 9 locales

Create `website/messages/{lt,es,sv,no,da,nl,de,fr,it}.json` files. Each is a translated copy of `en.json`. Use AI translation for initial versions (can be refined later by Goda).

The translations should maintain the same key structure as `en.json`. Do NOT translate brand names ("Gozu Studio"), proper nouns, or email addresses.

### Step 7: Restructure app directory

Move all page routes into `[locale]/` dynamic segment:

```
src/app/[locale]/layout.tsx        ← moved from src/app/layout.tsx
src/app/[locale]/page.tsx          ← moved from src/app/page.tsx
src/app/[locale]/about/page.tsx    ← moved from src/app/about/page.tsx
src/app/[locale]/services/page.tsx ← moved from src/app/services/page.tsx
src/app/[locale]/contact/page.tsx  ← moved from src/app/contact/page.tsx
src/app/[locale]/quote/page.tsx    ← moved from src/app/quote/page.tsx
src/app/[locale]/privacy/page.tsx  ← moved from src/app/privacy/page.tsx
src/app/[locale]/projects/page.tsx ← moved
src/app/[locale]/projects/[slug]/page.tsx ← moved
```

Keep these at the root (NOT inside `[locale]/`):
- `src/app/api/` — all API routes stay put
- `src/app/.well-known/` — WebMCP manifest
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/llms.txt/`
- `src/app/globals.css`

Create a minimal root `src/app/layout.tsx` that just renders children (needed for routes outside `[locale]/`):

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### Step 8: Update [locale]/layout.tsx

The moved `layout.tsx` gets the locale param and wraps content with `NextIntlClientProvider`:

```tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WebMCPTools from "@/components/webmcp/WebMCPTools";
import { SITE } from "@/lib/constants";
import { loadColors, colorsToCSS } from "@/lib/colors";
import "../globals.css";

// ... font declarations unchanged ...

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const cssVars = colorsToCSS(loadColors());

  // ... jsonLd declarations unchanged ...

  return (
    <html lang={locale} className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        {/* GA4, color palette, schema.org — unchanged */}
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <WebMCPTools />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Step 9: Update Header.tsx with translations

Replace hardcoded strings with `useTranslations`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Header() {
  const t = useTranslations("nav");
  // ... rest unchanged, but replace:
  // - NAV_LINKS labels with t('projects'), t('about'), etc.
  // - "Get a Quote" with t('getQuote')
  // - Link from "next/link" with Link from "@/i18n/navigation"
}
```

### Step 10: Update Footer.tsx with translations

Same pattern — use `useTranslations` for footer strings, use `Link` from `@/i18n/navigation`.

### Step 11: Update page files with translations

Each page needs:
1. Server components: `import { getTranslations, setRequestLocale } from "next-intl/server"` and call `setRequestLocale(locale)` + `const t = await getTranslations("namespace")`
2. Accept `params: Promise<{ locale: string }>` prop
3. Replace hardcoded strings with `t('key')` calls

Example for `[locale]/about/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const about = loadAboutPage();

  return (
    <>
      <section className="...">
        <FadeIn>
          <p className="...">{t("label")}</p>
          <h1 className="...">{t("title")}</h1>
        </FadeIn>
      </section>
      {/* ... rest with t() calls */}
    </>
  );
}
```

### Step 12: Update next.config

Ensure `next.config.ts` or `next.config.mjs` includes the next-intl plugin:

```ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {};

export default withNextIntl(nextConfig);
```

### Step 13: Update constants.ts

`NAV_LINKS` labels should become translation keys instead of hardcoded English. Update to use keys:

```ts
export const NAV_LINKS = [
  { href: "/projects", labelKey: "projects" },
  { href: "/about", labelKey: "about" },
  { href: "/services", labelKey: "services" },
  { href: "/contact", labelKey: "contact" },
] as const;
```

### Step 14: Verify

Run: `cd website && npm run dev`
Test:
1. `http://localhost:3000/` — English (no prefix), all strings correct
2. `http://localhost:3000/lt/` — Lithuanian, strings translated
3. `http://localhost:3000/es/about` — Spanish about page
4. Navigation links work between locales
5. API routes still work (`/api/projects`, `/api/quote`, `/api/contact`)
6. `/admin` still works (Tina CMS)
7. `/.well-known/webmcp` still returns JSON

### Step 15: Commit

```bash
git add -A
git commit -m "wire up next-intl i18n with 10-language routing and translations"
```

---

## Post-Implementation: Manual Steps

After all code tasks are done, these manual steps are needed:

1. **Resend setup**: Create account at resend.com, verify `gozustudio.com` domain (add DNS records to Squarespace), get API key
2. **Env vars**: Add `RESEND_API_KEY` to both `website/.env.local` and Vercel
3. **Google Sheet**: Create a "Contact" sheet tab in the existing spreadsheet with headers: `Timestamp | Name | Email | Subject | Message`
4. **Test email delivery**: Submit the contact form and verify the email arrives at info@gozustudio.com
