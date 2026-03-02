# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gozu Studio** — luxury architecture & interior design brand headquartered in London, UK with operations in Lithuania. This repository contains both the Next.js website source code and the content assets (media, project data, settings).

- **Domain**: gozustudio.com
- **Founder**: Goda Zukaite
- **Primary goal**: High-end client lead generation, portfolio prestige
- **Markets**: UK, Lithuania, all Europe, worldwide

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS 4
- **Internationalization**: 10 languages (EN, LT, ES, SV, NO, DA, NL, DE, FR, IT) — automated translation, English source of truth
- **Analytics**: GA4 (Measurement ID: G-7BJ23T92B7, Property: 526398179)
- **Hosting**: Squarespace Domains, deployment TBD
- **AI/Web Standards**: WebMCP (W3C draft), llms.txt, schema.org JSON-LD

## Content Asset Structure

```
Media/
├── Images/Logo/
│   ├── Favicon/          # ico, svg, png (16/32/96/192/512)
│   └── SVG/              # Brand logos (dark/white/currentColor), social icons
│                           (instagram, linkedin, telegram, whatsapp, x)
└── Videos/
    └── LandingVideo.mp4  # Hero landing video

Projects/                 # Source of truth for portfolio
├── Main/                 # Featured project
├── 2/ through 8/         # Portfolio projects (each identical structure)
│   ├── ProjectInfo.txt   # Title, Year, Location, Type, Short Description
│   ├── Images/           # Main.jpg + numbered (2.jpg, 3.jpg, ...)
│   └── Videos/           # Main.mp4 + numbered (2.mp4, ...)

Settings/
├── ColourPalette.txt     # Source of truth for CSS color variables
└── PrivacyNotice.txt     # Legal privacy statement
```

## Source of Truth Principle

Content files are the single source of truth. The website reads from them dynamically:
- **ColourPalette.txt** → CSS custom properties (colors)
- **ProjectInfo.txt** → Project page content
- **Project images/videos** → Replacing a file with same name/extension auto-updates the site

## Color System (from Settings/ColourPalette.txt)

| Role | Variable | Value |
|------|----------|-------|
| Main | `--color-main` | `#d4bc90` |
| Highlight | `--color-highlight` | `#e2a55e` |
| Background | `--color-bg` | `#f8f4ed` |
| Text | `--color-text` | `#333` |
| Secondary Text | `--color-text-secondary` | `#888` |
| Label | `--color-label` | `#999` |
| Container BG | `--color-container` | `#FFF` |
| Bar Border | `--color-border` | `#757575` |
| Body | `--color-body` | `#212529` |
| Success | `--color-success` | `#90ee90` |
| Error | `--color-error` | `#ed645a` |

Derived shades allowed via opacity/filter transforms (e.g., `color-mix()`, `oklch()` adjustments) while keeping the TXT as the canonical source.

## Pages

1. **Home/Landing** — Cinematic hero video, featured projects, studio intro
2. **Projects** — Portfolio grid with filtering
3. **Project Detail** — Full gallery with metadata from ProjectInfo.txt
4. **About** — Studio intro, founder (Goda Zukaite), approach, awards
5. **Services** — Architecture & interior design offerings
6. **Contact** — Contact info, social links, map
7. **Request a Quote** — Multi-step form (WebMCP-annotated)
8. **Privacy Policy** — From Settings/PrivacyNotice.txt

## WebMCP Implementation

Every page must include WebMCP support (W3C draft, Chrome 146+):
- **Declarative**: Forms annotated with `toolname`, `tooldescription`, `toolparamdescription`
- **Imperative**: `navigator.modelContext.registerTool()` for dynamic tools
- **Manifest**: `/.well-known/webmcp` JSON manifest for pre-navigation discovery
- **Page-level**: `<script type="application/json" id="webmcp">` per page
- **Feature detection**: Check `navigator.modelContext` before registering

## SEO Requirements

- Schema.org JSON-LD on every page (Organization, WebSite, ArchitecturalProject, LocalBusiness)
- `/llms.txt` for AI discoverability
- `/robots.txt` and `/sitemap.xml`
- Semantic HTML with clean heading hierarchy (h1 > h2 > h3)
- All target keywords integrated naturally into content
- Multi-language hreflang tags

## Contact Info

- Email: info@gozustudio.com
- Phone/WhatsApp/Telegram: (+44) 07765 577275
- Instagram: https://www.instagram.com/gozustudio/
- Website: gozustudio.com
- Locations: United Kingdom, Lithuania

## Git Workflow

- Repository: github.com/gozustudio/GozuWebsite2
- Default branch: `main`
- Commit messages: imperative mood, short summary
- Do not force-push to `main`

## Development Notes

- Always read relevant files before editing
- Keep solutions minimal — avoid over-engineering
- Do not auto-commit — wait for explicit user instruction
- Ask before adding new dependencies
- Colors must always derive from ColourPalette.txt
- Project content must always derive from ProjectInfo.txt files
