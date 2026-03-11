# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gozu Studio** — luxury architecture & interior design brand operating remotely across Europe. This repository contains both the Next.js website source code (`website/`) and the content assets (`Media/`, `Projects/`).

- **Domain**: gozustudio.com
- **Founder**: Goda Zukaite
- **Primary goal**: High-end client lead generation, portfolio prestige
- **Markets**: All Europe, worldwide (remote-first — no location shown on site by design)
- **Repository**: github.com/gozustudio/GozuWebsite2 (account: `gozustudio`)

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router) with TypeScript 5, React 19.2
- **Styling**: Tailwind CSS 4 with `@theme inline` for custom properties
- **Animations**: Framer Motion 12
- **CMS**: Tina CMS (`tinacms` + `@tinacms/cli`) — admin UI at `/admin`, content in `website/content/`
- **Internationalization**: next-intl 4.8 — 26 locales: EN (default, no prefix), LT, ES, SV, NO, DA, NL, DE, FR, IT, LV, ET, RU, PL, FI, PT, CS, HU, RO, EL, HR, SR, BG, SK, SL, UK
- **Content Translation**: Google Cloud Translation API v2 — auto-translates CMS content via GitHub Action (not at build time)
- **Email**: Resend (`website@gozustudio.com` → `info@gozustudio.com`)
- **Image processing**: Sharp 0.34
- **Analytics**: GA4 (Measurement ID: `G-7BJ23T92B7`, Property: `526398179`)
- **Hosting**: Vercel (deployment target + DNS), domain registered at Squarespace Domains
- **AI/Web Standards**: WebMCP (W3C draft), llms.txt, schema.org JSON-LD

## Build & Dev Commands

```bash
cd website
npm install                    # install dependencies
npm run dev                    # start Tina + Next.js dev server (localhost:3000, admin at localhost:4001/admin)
npm run build                  # production build (requires NEXT_PUBLIC_TINA_CLIENT_ID + TINA_TOKEN)
npm run start                  # serve production build
npm run lint                   # run ESLint
```

**Local build without Tina Cloud credentials** (for TypeScript verification):
```bash
cd website
npx tinacms build --local --skip-cloud-checks && npx next build
```

**Asset copy** (automated): `npm run copy-assets` copies brand assets from `Media/` to `website/public/`. Runs automatically before `npm run dev` via the `predev` hook. These copies are gitignored — the source of truth is always `Media/`.

**Vercel build command** (set in Project Settings → Build and Deployment):
```
node scripts/copy-assets.js && npx tinacms build --skip-cloud-checks && npx next build
```
The `--skip-cloud-checks` flag is required due to a Tina Cloud schema indexing bug (see Tina CMS section). The copy-assets step is required because brand assets in `website/public/` are gitignored. Translation is handled by GitHub Action (not during build). Vercel Root Directory: `website`.

**Project media** is committed directly to `website/public/uploads/projects/` — no copy step needed.

## Repository Structure

```
GozuWebsite2/
├── Media/                          # Brand assets (source of truth)
│   ├── Images/Logo/Favicon/        # Favicon set (ico, svg, png sizes)
│   ├── Images/Logo/SVG/            # Logos (5 variants), social icons (5)
│   └── Videos/LandingVideo.mp4     # Hero video
├── Projects/                       # Original project media
│   ├── Main/, 2/, 3/, ..., 8/      # Each project folder contains:
│   │   ├── Images/                 #   Main.jpg + numbered (2.jpg, 3.jpg, ...)
│   │   └── Videos/                 #   Main.mp4 + numbered (2.mp4, ...)
├── website/                        # Next.js application
│   ├── content/                    # CMS content (source of truth for text/metadata)
│   │   ├── projects/               #   main.json, 2.json, ..., 8.json
│   │   ├── pages/                  #   home.json, about.json, services.json
│   │   └── settings/               #   colors.json, privacy.json
│   ├── tina/
│   │   └── config.ts               # Tina CMS schema definition
│   ├── messages/                   # i18n translation files (en.json, lt.json, etc.)
│   ├── scripts/
│   │   ├── copy-assets.js          # Copies Media/ → public/ (brand assets)
│   │   └── translate-content.js    # Auto-translates CMS content via Google Translate API
│   ├── src/
│   │   ├── i18n/                   # next-intl config (routing, request, navigation)
│   │   ├── proxy.ts               # next-intl locale proxy (was middleware.ts, renamed for Next.js 16)
│   │   ├── app/                    # App Router
│   │   │   ├── layout.tsx          #   Minimal root layout (pass-through)
│   │   │   ├── globals.css         #   CSS variables, base styles, Tailwind
│   │   │   ├── [locale]/           #   Locale-prefixed routes
│   │   │   │   ├── layout.tsx      #     Locale layout (fonts, GA4, schema.org, NextIntlClientProvider)
│   │   │   │   ├── page.tsx        #     Home (reads home.json + featured projects)
│   │   │   │   ├── projects/       #     Projects index + [slug] detail
│   │   │   │   ├── about/          #     Studio, founder, approach
│   │   │   │   ├── services/       #     4 service categories + process
│   │   │   │   ├── contact/        #     Contact info + WebMCP form
│   │   │   │   ├── quote/          #     Quote request (WebMCP form)
│   │   │   │   └── privacy/        #     Privacy policy
│   │   │   ├── api/contact/        #   Contact form → Sheets + Resend email
│   │   │   ├── api/quote/          #   Quote form → Sheets + Resend email
│   │   │   ├── api/packages/       #   Package definitions from Google Sheets
│   │   │   ├── api/projects/       #   Projects JSON API
│   │   │   ├── .well-known/webmcp/ #   WebMCP site manifest
│   │   │   ├── llms.txt/           #   AI discoverability (dynamic route)
│   │   │   ├── robots.ts           #   Robots.txt generator
│   │   │   └── sitemap.ts          #   Sitemap.xml generator
│   │   ├── components/
│   │   │   ├── layout/             #   Header.tsx, Footer.tsx
│   │   │   ├── sections/           #   HeroVideo, ContactForm, QuoteForm
│   │   │   ├── ui/                 #   FadeIn (scroll animation)
│   │   │   └── webmcp/             #   WebMCPTools (imperative tool registration)
│   │   ├── lib/
│   │   │   ├── colors.ts           #   Reads content/settings/colors.json → CSS vars
│   │   │   ├── content.ts          #   loadTranslatedContent() — locale-aware content loader
│   │   │   ├── projects.ts         #   Reads content/projects/*.json → typed data (locale-aware)
│   │   │   └── constants.ts        #   Site info, nav links, social links
│   │   └── types/
│   │       └── webmcp.d.ts         #   TypeScript types for WebMCP APIs
│   └── public/
│       └── uploads/projects/       #   Project images/videos (committed to Git, served by Vercel CDN)
├── CLAUDE.md
└── .gitignore
```

## Source of Truth Principle

Content files are the single source of truth. The website reads from them at build time:
- **`website/content/projects/*.json`** → Project page content via `lib/projects.ts`
- **`website/content/settings/colors.json`** → CSS custom properties injected in `layout.tsx`
- **`website/content/settings/privacy.json`** → Privacy page content
- **`website/content/pages/*.json`** → Page copy (home, about, services)
- **`website/public/uploads/projects/*/`** → Project images and videos (committed to Git)
- **`Media/`** → Brand assets (logo, hero video) — must be copied to `website/public/` for dev

### Content JSON format (projects)
```json
{
  "title": "Project Name",
  "year": "2024",
  "location": "City, Country",
  "type": ["Residential", "Interior"],
  "shortDescription": "...",
  "images": ["/uploads/projects/main/Main.jpg"],
  "videos": ["/uploads/projects/main/Main.mp4"],
  "featured": true,
  "order": 1
}
```

### Content JSON format (colors)
```json
{
  "main": "#d4bc90",
  "highlight": "#e2a55e",
  "background": "#f8f4ed",
  ...
}
```

## Content Translation

- **Script**: `website/scripts/translate-content.js` — reads CMS JSON, translates via Google Cloud Translation API v2, writes to `content/translated/{locale}/`
- **Trigger**: GitHub Action (`.github/workflows/translate.yml`) — NOT during Vercel build
- **Triggers on**: push to `main` changing content files, daily cron at 06:00 UTC, manual `workflow_dispatch`
- **Throttle**: Max once per 24h (metadata in `content/translated/.last-translation`). Manual trigger bypasses throttle
- **Selective**: Uses `git diff` to find changed files since last translation, translates only those (`--only` flag)
- **Output**: `website/content/translated/{locale}/pages/*.json`, `content/translated/{locale}/projects/*.json`, `content/translated/{locale}/settings/privacy.json`
- **Committed to Git**: `content/translated/` is committed (NOT gitignored) — Vercel builds use pre-translated files
- **Loader**: `src/lib/content.ts` exports `loadTranslatedContent<T>(relPath, locale)` — tries translated file, falls back to English
- **Projects**: `loadProjects(locale?)` and `getProject(slug, locale?)` accept optional locale
- **Fields skipped**: `images`, `videos`, `year`, `order`, `featured`, `step`, `slug`, `collaborations` — not translated
- **Cost protection**: GCP budget cap $1/month + daily character quota + 24h throttle
- **Auth**: `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` stored as GitHub repo secrets
- **Workflow**: Goda edits content in Tina (English) → push to main → GitHub Action translates (if 24h passed) → commits translated files → Vercel builds with pre-translated content

## Tina CMS

- **Admin UI**: `http://localhost:4001/admin` (dev) / `gozustudio.com/admin` (production — working)
- **Local mode**: `npm run dev` starts Tina alongside Next.js — edits save directly to JSON files
- **Production mode**: Tina Cloud connected — org "Gozu Studio's Organization", project "GozuWebsite2"
- **Client ID**: `ae555ca3-160b-4ba2-9e68-ab502f57bf8a`
- **Env vars**: `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `NEXT_PUBLIC_TINA_BRANCH=main` in Vercel
- **Tina Cloud config**: "Path to Tina Config" = `website` (no leading slash — `/website` is wrong)
- **Site URLs**: `https://www.gozustudio.com` and `https://gozustudio.com` registered in Tina Cloud
- **Branch indexing**: `main` branch indexed; default fallback in `tina/config.ts` is `main`
- **Media uploads**: Tina media manager enabled and synced; uploads to `website/public/uploads/` (committed to Git)
- **Generated files**: `website/tina/__generated__/` and `website/public/admin/` are gitignored
- **Lock file**: `website/tina/tina-lock.json` — committed to Git, Tina Cloud reads this for schema. Must be updated when schema changes.
- **Schema indexing bug**: Tina Cloud's indexer does NOT pick up the `collaborations` field despite correct config. Build uses `--skip-cloud-checks` as workaround. The `collaborations` field cannot be saved from the admin UI — edit directly in JSON files instead. Periodically test removing `--skip-cloud-checks` to see if fixed.

## i18n (next-intl)

- **Locales**: `en` (default, no URL prefix), `lt`, `es`, `sv`, `no`, `da`, `nl`, `de`, `fr`, `it`, `lv`, `et`, `ru`, `pl`, `fi`, `pt`, `cs`, `hu`, `ro`, `el`, `hr`, `sr`, `bg`, `sk`, `sl`, `uk`
- **Message files**: `website/messages/{locale}.json` — UI strings (nav, buttons, labels, headings)
- **CMS content translation**: `scripts/translate-content.js` auto-translates CMS JSON to `content/translated/{locale}/` via Google Cloud Translation API
- **Config**: `src/i18n/routing.ts` (with `localePrefix: "as-needed"`), `src/i18n/request.ts`, `src/i18n/navigation.ts`
- **Proxy**: `src/proxy.ts` — handles locale detection and routing (renamed from `middleware.ts` for Next.js 16)
- **Navigation**: Use `Link` from `@/i18n/navigation` (not `next/link`) in components
- **Server components**: Use `getTranslations()` + `setRequestLocale(locale)`
- **Client components**: Use `useTranslations()`
- **NAV_LINKS**: Uses `labelKey` (not `label`) — components call `t(link.labelKey)`
- **Routes outside [locale]/**: API routes, `.well-known/`, `robots.ts`, `sitemap.ts`, `globals.css`

## Color System

| Role | CSS Variable | Value |
|------|-------------|-------|
| Main (gold) | `--color-main` | `#d4bc90` |
| Highlight | `--color-highlight` | `#e2a55e` |
| Background (cream) | `--color-bg` | `#f8f4ed` |
| Text | `--color-text` | `#333` |
| Secondary Text | `--color-text-secondary` | `#888` |
| Label | `--color-label` | `#999` |
| Container | `--color-container` | `#FFF` |
| Border | `--color-border` | `#757575` |
| Body (near-black) | `--color-body` | `#212529` |
| Success | `--color-success` | `#90ee90` |
| Error | `--color-error` | `#ed645a` |

Colors are sourced from `content/settings/colors.json` and injected as CSS variables in `layout.tsx` via `lib/colors.ts`. Derived shades use `color-mix(in oklch, ...)`.

## Typography

- **Serif (headlines)**: Cormorant Garamond — `var(--font-cormorant)` / `font-serif`
- **Sans (body/UI)**: Inter — `var(--font-inter)` / `font-sans`
- Navigation: 11px uppercase, tracking 3px
- Headlines: font-weight 400, line-height 1.15

## WebMCP Implementation

WebMCP (W3C Community Group Draft, Chrome 146+) is a core requirement:

**Declarative (forms)**:
- Contact form: `toolname="contact_gozu_studio"`
- Quote form: `toolname="request_quote_gozu_studio"`
- All inputs have `toolparamdescription` attributes
- Agent submissions detected via `nativeEvent.agentInvoked`, responded to with `respondWith()`

**Imperative (JS tools, registered in `WebMCPTools.tsx`)**:
- `search_gozu_projects` — read-only portfolio search
- `get_gozu_studio_info` — read-only studio information

**Discovery**:
- Site manifest: `/.well-known/webmcp` (API route)
- Page-level metadata: `<script type="application/json" id="webmcp">` on home, contact, quote, projects pages
- Feature detection: `navigator.modelContext !== undefined`

**Rules**:
- Different names for declarative vs imperative tools
- `respondWith()` must be called synchronously before any `await`
- `useRef` guard prevents double-registration in React strict mode
- Never add `toolname` to sensitive forms

## SEO

- Schema.org JSON-LD on every page: Organization, WebSite, CreativeWork (projects), Organization (contact — was LocalBusiness, changed to remove address)
- `/llms.txt` — dynamically generated from project data
- `/sitemap.xml` — all static + dynamic project routes
- `/robots.txt` — allows all crawlers, blocks `/api/`
- GA4 snippet in root layout `<head>`
- Open Graph + Twitter Card meta tags
- Target keywords in metadata

## Contact Info

- Email: info@gozustudio.com
- WhatsApp: https://wa.me/4407765577275 (preferred — phone number NOT displayed on site)
- Telegram: https://t.me/+4407765577275 (preferred — phone number NOT displayed on site)
- Instagram: https://www.instagram.com/gozustudio/
- Location: NOT displayed anywhere on site (remote-first positioning for pan-European clients)

## Security Policy

**All backend functions, API routes, scripts, and cloud services must be private and require authentication. Public/unauthenticated access is not allowed.**

- Next.js API routes (`/api/*`) must validate the request source or require a secret — never expose raw data endpoints publicly without auth
- Google Apps Script functions must NOT be deployed as public web apps (`access: ANYONE_ANONYMOUS` is forbidden); use `ANYONE` with Google sign-in, or `DOMAIN` restricted, or trigger-only (no web deployment)
- Google Cloud service account keys must never be committed or exposed
- **GCP Cloud Functions and Cloud Run: always deploy with `--no-allow-unauthenticated`** — never omit this flag, never use `--allow-unauthenticated`
- Vercel serverless functions inherit Next.js route auth requirements above
- When in doubt: default to private, require explicit justification to open access

## Google Account

- **Always use `info@gozustudio.com`** for all Google services (Drive, Sheets, GCP, gcloud)
- gcloud configuration: `gozustudio` (separate from personal `default` config which is `fransanda@gmail.com`)
- GCP project: `gozu-studio-website` (under `info@gozustudio.com`)
- Service account: `gozu-website@gozu-studio-website.iam.gserviceaccount.com`
- Key file: `gozu-service-account.json` (repo root, gitignored)
- Spreadsheets: `GOOGLE_SPREADSHEET_ID` (Database - Form Responses), `GOOGLE_INPUT_FIELDS_SPREADSHEET_ID` (Input Fields - Onboarding Form)
- Run gcloud commands with `--configuration=gozustudio` flag
- clasp (Apps Script CLI): installed globally, authenticated as `info@gozustudio.com` (`%APPDATA%/.clasprc.json`); Apps Script API must be ON at https://script.google.com/home/usersettings

## Git Workflow

- **Working branch**: `master` — **Production branch**: `main` (Vercel auto-deploys from `main`)
- After committing to `master`, always push to both: `git push origin master && git push origin master:main`
- Commit messages: imperative mood, short summary
- Do not force-push to `master` or `main`
- `website/public/` brand asset copies are gitignored (but `website/public/uploads/` is NOT gitignored)
- Git identity: Francisco / fransanda@hotmail.com.ar (GitHub: `fransanda`, collaborator on `gozustudio` org)
- Auth: PAT embedded in remote URL — `https://fransanda:TOKEN@github.com/gozustudio/GozuWebsite2.git`

## Development Notes

- Always read relevant files before editing
- Keep solutions minimal — avoid over-engineering
- Do not auto-commit — wait for explicit user instruction
- Ask before adding new dependencies
- Colors are sourced from `content/settings/colors.json` — edit there, not in globals.css
- Project content is sourced from `content/projects/*.json` — edit there, not hardcoded in pages
- Logo SVG paths are inlined in Header, Footer, and HeroVideo — canonical source is `Media/Images/Logo/SVG/logo.svg`
- Header non-scrolled state: gradient `from-[var(--color-bg)]/80 via-[var(--color-bg)]/30 to-transparent`, always dark text
- Footer copyright year uses `suppressHydrationWarning` to prevent SSR/client mismatch
- When replacing brand assets in `Media/`, run `npm run copy-assets` (or restart dev server) to reflect the change
- Hero video poster image: `Media/Images/LandingImage.jpg` → `website/public/images/LandingImage.jpg`
- Project media lives in `website/public/uploads/projects/` (committed to Git) — no copy step needed

## Contact Form Backend

- **API route**: `/api/contact` — validates fields, honeypot bot check
- **Google Sheets**: Appends to "Contact" sheet (columns: Timestamp, Name, Email, Subject, Message)
- **Email**: Sends notification via Resend from `website@gozustudio.com` to `info@gozustudio.com`
- **Env vars**: `RESEND_API_KEY` (in `.env.local` and Vercel), plus existing Google Sheets vars

## Quote Form Backend

- **API route**: `/api/quote` — validates fields, honeypot bot check, dedup by email
- **Google Sheets**: Writes to "Main" sheet in `Database - Form Responses` spreadsheet (26 columns A–Z)
- **Dedup**: `findRowByEmail` searches column C — updates existing row if found, appends new row if not
- **Partial saves**: Steps 1–3 send `partial: true` (Prospects="Partial"); final submit sends `partial: false` (Prospects="")
- **Email**: Sends notification via Resend on final submission only
- **Completion mapping**: "As soon as possible"→0, "5–6 months"→1, "6–12 months"→2
- **Package codes**: Stored as numeric 1–5 (not names)

## Package System

- **API route**: `/api/packages` — reads from "Input Fields - Onboarding Form" spreadsheet (range BA2:BR6)
- **Spreadsheet ID**: `GOOGLE_INPUT_FIELDS_SPREADSHEET_ID` env var (separate from `GOOGLE_SPREADSHEET_ID`)
- **5 packages**: 1 Standard (interior), 2 Advance (interior), 3 Premium (interior), 4 Standard (no interior), 5 Advance (no interior)
- **Conditional display**: Interior selected → packages 1/2/3; Interior NOT selected → packages 4/5
- **Items**: Up to 15 items per package (columns BD–BR), sourced dynamically from spreadsheet
- **Service account** needs Viewer access to both spreadsheets

## Hosting & DNS

- **Vercel project**: `gozu-website` under `info-19126180s` account
- **Production branch**: `main` (Vercel auto-deploys from this branch)
- **Domain**: `gozustudio.com` redirects (307) to `www.gozustudio.com` (www is primary)
- **DNS**: Vercel nameservers (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) — set at Squarespace registrar 2026-03-06
- **DNS records in Vercel**: MX (`smtp.google.com` priority 1), SPF (`v=spf1 include:_spf.google.com ~all`), DMARC, Resend DKIM (`resend._domainkey`), Resend MX+SPF on `send` subdomain
- **SSL**: Auto-provisioned by Vercel
- **Site status**: Live and verified working (2026-03-06)
- **Tina Cloud**: Build uses `--skip-cloud-checks` due to schema indexing bug. Admin UI at `gozustudio.com/admin` is functional (except `collaborations` field — see Tina CMS section).

## Pending Work

- **Real project data**: Update `website/content/projects/*.json` with actual project info (currently all placeholder "KAZ House" data) — Goda can edit via Tina admin UI at `gozustudio.com/admin`
- **Tina Cloud schema bug**: `collaborations` field not indexed — file issue at github.com/tinacms/tinacms if persists
- **Quote form post-launch**: Update `UpdateProspectsDatabase` GAS script to skip `Prospects="Partial"` rows (if needed — verify after first real submission)
- **Translation refinement**: AI-generated translations in `website/messages/` and Google Translate output in `content/translated/` may need native-speaker review
- **HeroVideo hardcoded text**: "Architecture · Interior Design" and "Scroll" in `HeroVideo.tsx` are not translated (client component, would need `useTranslations`)
