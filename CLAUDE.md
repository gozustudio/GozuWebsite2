# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gozu Studio** — luxury architecture & interior design brand headquartered in London, UK with operations in Lithuania. This repository contains both the Next.js website source code (`website/`) and the content assets (`Media/`, `Projects/`, `Settings/`).

- **Domain**: gozustudio.com
- **Founder**: Goda Zukaite
- **Primary goal**: High-end client lead generation, portfolio prestige
- **Markets**: UK, Lithuania, all Europe, worldwide
- **Repository**: github.com/gozustudio/GozuWebsite2 (account: `gozustudio`)

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router) with TypeScript 5, React 19.2
- **Styling**: Tailwind CSS 4 with `@theme inline` for custom properties
- **Animations**: Framer Motion 12
- **Internationalization**: next-intl 4.8 (planned, not yet wired — 10 languages: EN, LT, ES, SV, NO, DA, NL, DE, FR, IT)
- **Image processing**: Sharp 0.34
- **Analytics**: GA4 (Measurement ID: `G-7BJ23T92B7`, Property: `526398179`)
- **Hosting**: Vercel (deployment target), Squarespace Domains (DNS)
- **AI/Web Standards**: WebMCP (W3C draft), llms.txt, schema.org JSON-LD

## Build & Dev Commands

```bash
cd website
npm install                    # install dependencies
npm run dev                    # start dev server (localhost:3000)
npm run build                  # production build
npm run start                  # serve production build
npm run lint                   # run ESLint
```

**Important**: Before `dev` or `build`, project assets must be copied to `website/public/`:
```bash
# From repo root:
cp -r Media/Images/Logo/Favicon/* website/public/
cp -r Media/Images/Logo/SVG/* website/public/images/
cp Media/Videos/LandingVideo.mp4 website/public/videos/
for proj in Main 2 3 4 5 6 7 8; do
  mkdir -p "website/public/projects/$proj/images" "website/public/projects/$proj/videos"
  cp Projects/$proj/Images/*.jpg "website/public/projects/$proj/images/"
  cp Projects/$proj/Videos/*.mp4 "website/public/projects/$proj/videos/"
done
```
These copied files are gitignored — the source of truth is always the root `Media/`, `Projects/`, `Settings/` folders.

## Repository Structure

```
GozuWebsite2/
├── Media/                          # Brand assets (source of truth)
│   ├── Images/Logo/Favicon/        # Favicon set (ico, svg, png sizes)
│   ├── Images/Logo/SVG/            # Logos (5 variants), social icons (5)
│   └── Videos/LandingVideo.mp4     # Hero video
├── Projects/                       # Portfolio data (source of truth)
│   ├── Main/, 2/, 3/, ..., 8/      # Each project folder contains:
│   │   ├── ProjectInfo.txt         #   Title, Year, Location, Type, Short Description
│   │   ├── Images/                 #   Main.jpg + numbered (2.jpg, 3.jpg, ...)
│   │   └── Videos/                 #   Main.mp4 + numbered (2.mp4, ...)
├── Settings/                       # Configuration (source of truth)
│   ├── ColourPalette.txt           #   CSS color variables
│   └── PrivacyNotice.txt           #   Legal privacy statement
├── website/                        # Next.js application
│   ├── src/
│   │   ├── app/                    # App Router pages & routes
│   │   │   ├── page.tsx            #   Home (cinematic hero + featured projects)
│   │   │   ├── projects/page.tsx   #   Projects index (portfolio grid)
│   │   │   ├── projects/[slug]/    #   Project detail (gallery + metadata)
│   │   │   ├── about/              #   Studio, founder, approach
│   │   │   ├── services/           #   4 service categories + process
│   │   │   ├── contact/            #   Contact info + WebMCP form
│   │   │   ├── quote/              #   Quote request (WebMCP form)
│   │   │   ├── privacy/            #   Reads from PrivacyNotice.txt
│   │   │   ├── .well-known/webmcp/ #   WebMCP site manifest (API route)
│   │   │   ├── api/projects/       #   Projects JSON API
│   │   │   ├── llms.txt/           #   AI discoverability (dynamic route)
│   │   │   ├── robots.ts           #   Robots.txt generator
│   │   │   ├── sitemap.ts          #   Sitemap.xml generator
│   │   │   ├── layout.tsx          #   Root layout (fonts, GA4, schema.org)
│   │   │   └── globals.css         #   CSS variables, base styles, Tailwind
│   │   ├── components/
│   │   │   ├── layout/             #   Header.tsx, Footer.tsx
│   │   │   ├── sections/           #   HeroVideo, ContactForm, QuoteForm
│   │   │   ├── ui/                 #   FadeIn (scroll animation)
│   │   │   └── webmcp/             #   WebMCPTools (imperative tool registration)
│   │   ├── lib/
│   │   │   ├── colors.ts           #   Reads ColourPalette.txt → CSS vars
│   │   │   ├── projects.ts         #   Reads ProjectInfo.txt → typed data
│   │   │   └── constants.ts        #   Site info, nav links, social links
│   │   └── types/
│   │       └── webmcp.d.ts         #   TypeScript types for WebMCP APIs
│   └── public/                     #   Static assets (gitignored copies)
├── CLAUDE.md
└── .gitignore
```

## Source of Truth Principle

Content files are the single source of truth. The website reads from them at build time:
- **`Settings/ColourPalette.txt`** → CSS custom properties in `globals.css`
- **`Projects/*/ProjectInfo.txt`** → Project page content via `lib/projects.ts`
- **`Settings/PrivacyNotice.txt`** → Privacy page content
- **Project images/videos** → Replacing a file with same name/extension auto-updates the site

### ProjectInfo.txt Format
```
Title: "Project Name";
Year: "2020";
Location: "City, Country";
Type: "Category1, Category2";
Short Description: "...";
```

### ColourPalette.txt Format
```
Main Colour: #d4bc90;
Highlight Colour: #e2a55e;
...
```

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

Derived shades use `color-mix(in oklch, ...)` — the TXT remains the canonical source.

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

- Schema.org JSON-LD on every page: Organization, WebSite, CreativeWork (projects), LocalBusiness (contact)
- `/llms.txt` — dynamically generated from project data
- `/sitemap.xml` — all static + dynamic project routes
- `/robots.txt` — allows all crawlers, blocks `/api/`
- GA4 snippet in root layout `<head>`
- Open Graph + Twitter Card meta tags
- Target keywords in metadata

## Contact Info

- Email: info@gozustudio.com
- Phone/WhatsApp/Telegram: (+44) 07765 577275
- Instagram: https://www.instagram.com/gozustudio/
- Locations: London (UK), Vilnius (Lithuania)

## Git Workflow

- Default branch: `main`
- Commit messages: imperative mood, short summary
- Do not force-push to `main`
- `website/public/` asset copies are gitignored

## Development Notes

- Always read relevant files before editing
- Keep solutions minimal — avoid over-engineering
- Do not auto-commit — wait for explicit user instruction
- Ask before adding new dependencies
- Colors must always derive from ColourPalette.txt
- Project content must always derive from ProjectInfo.txt files
- Logo SVG paths are inlined in Header, Footer, and HeroVideo components

## Pending Work

- **Asset copy script**: Automate `Media/`→`public/` and `Projects/`→`public/` copying (pre-build)
- **i18n wiring**: next-intl installed but not configured; needs 10-language routing + build-time AI translation
- **Real project data**: All 8 ProjectInfo.txt files contain identical placeholder data ("KAZ House")
- **Vercel deployment**: Connect repo, configure build command (`cd website && npm run build`)
- **Form backend**: Contact and Quote forms show success UI but don't send emails yet
- **GSC/GA4 MCP auth**: Service account credentials needed for analytics MCP tools
- **Page-level WebMCP metadata**: `<script type="application/json" id="webmcp">` not yet added to individual pages
