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
- **Internationalization**: next-intl 4.8 (planned, not yet wired — 10 languages: EN, LT, ES, SV, NO, DA, NL, DE, FR, IT)
- **Image processing**: Sharp 0.34
- **Analytics**: GA4 (Measurement ID: `G-7BJ23T92B7`, Property: `526398179`)
- **Hosting**: Vercel (deployment target), Squarespace Domains (DNS)
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

**Important**: Before `dev` or `build`, brand/media assets must be copied to `website/public/`:
```bash
# From repo root:
cp -r Media/Images/Logo/Favicon/* website/public/
cp -r Media/Images/Logo/SVG/* website/public/images/
cp Media/Videos/LandingVideo.mp4 website/public/videos/
cp Media/Images/LandingImage.jpg website/public/images/
```
These copied files are gitignored — the source of truth is always `Media/`.

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
│   ├── src/
│   │   ├── app/                    # App Router pages & routes
│   │   │   ├── page.tsx            #   Home (reads home.json + featured projects)
│   │   │   ├── projects/page.tsx   #   Projects index (portfolio grid)
│   │   │   ├── projects/[slug]/    #   Project detail (gallery + metadata)
│   │   │   ├── about/              #   Studio, founder, approach (reads about.json)
│   │   │   ├── services/           #   4 service categories + process (reads services.json)
│   │   │   ├── contact/            #   Contact info + WebMCP form
│   │   │   ├── quote/              #   Quote request (WebMCP form)
│   │   │   ├── privacy/            #   Reads from content/settings/privacy.json
│   │   │   ├── .well-known/webmcp/ #   WebMCP site manifest (API route)
│   │   │   ├── api/projects/       #   Projects JSON API
│   │   │   ├── llms.txt/           #   AI discoverability (dynamic route)
│   │   │   ├── robots.ts           #   Robots.txt generator
│   │   │   ├── sitemap.ts          #   Sitemap.xml generator
│   │   │   ├── layout.tsx          #   Root layout (fonts, GA4, schema.org, color injection)
│   │   │   └── globals.css         #   CSS variables, base styles, Tailwind
│   │   ├── components/
│   │   │   ├── layout/             #   Header.tsx, Footer.tsx
│   │   │   ├── sections/           #   HeroVideo, ContactForm, QuoteForm
│   │   │   ├── ui/                 #   FadeIn (scroll animation)
│   │   │   └── webmcp/             #   WebMCPTools (imperative tool registration)
│   │   ├── lib/
│   │   │   ├── colors.ts           #   Reads content/settings/colors.json → CSS vars
│   │   │   ├── projects.ts         #   Reads content/projects/*.json → typed data
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

## Tina CMS

- **Admin UI**: `http://localhost:4001/admin` (dev) / `gozustudio.com/admin` (production)
- **Local mode**: `npm run dev` starts Tina alongside Next.js — edits save directly to JSON files
- **Production mode**: Requires Tina Cloud account (`info@gozustudio.com` at tina.io), connected to `gozustudio/GozuWebsite2` repo
- **Env vars for production**: `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` (in Vercel)
- **Media uploads**: Tina media manager uploads to `website/public/uploads/` (committed to Git)
- **Generated files**: `website/tina/__generated__/` and `website/public/admin/` are gitignored

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
- Run gcloud commands with `--configuration=gozustudio` flag
- clasp (Apps Script CLI): installed globally, authenticated as `info@gozustudio.com` (`%APPDATA%/.clasprc.json`); Apps Script API must be ON at https://script.google.com/home/usersettings

## Git Workflow

- Default branch: `master` (not `main`)
- Commit messages: imperative mood, short summary
- Do not force-push to `master`
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
- When replacing brand assets in `Media/`, also copy to `website/public/` manually for dev server to reflect the change
- Hero video poster image: `Media/Images/LandingImage.jpg` → `website/public/images/LandingImage.jpg`
- Project media lives in `website/public/uploads/projects/` (committed to Git) — no copy step needed

## Pending Work

- **Asset copy script**: Automate `Media/`→`public/` copying (brand assets only — project media is already in uploads/)
- **i18n wiring**: next-intl installed but not configured; needs 10-language routing + build-time AI translation
- **Real project data**: Update `website/content/projects/*.json` with actual project info (currently all placeholder "KAZ House" data)
- **Vercel deployment**: Project created (`gozu-website`), env vars set — connect GitHub repo at vercel.com/gozustudio/gozu-website/settings/git, set root directory to `website`; add `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` after setting up Tina Cloud
- **Tina Cloud setup**: Goda creates account at tina.io with `info@gozustudio.com`, connects `gozustudio/GozuWebsite2` repo, copies Client ID and Content Token to Vercel env vars
- **Contact form backend**: Contact form shows success UI but doesn't send emails yet
- **GSC/GA4 MCP auth**: Service account credentials needed for analytics MCP tools
- **Page-level WebMCP metadata**: `<script type="application/json" id="webmcp">` not yet added to individual pages
- **Quote form post-launch**: Update `UpdateProspectsDatabase` GAS script to skip `Prospects="Partial"` rows (if needed — verify after first real submission)
