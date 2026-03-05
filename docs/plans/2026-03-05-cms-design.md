# CMS Design — Gozu Studio

## Goal

Enable Goda (non-technical) to edit all website content — projects, page copy, colors, privacy notice — without developer help, using a polished web UI.

## Constraints

- Free (no paid services)
- Content stays in GitHub (Git-based)
- No third-party video hosting (videos served directly from Vercel CDN)
- 1–2 minute deploy delay on content changes is acceptable

## Solution: Tina CMS

Tina CMS is installed inside the Next.js site. It provides:

1. `/admin` route — Goda's editing UI at `gozustudio.com/admin`
2. `tina/config.ts` — content schema defined in code
3. Git-based storage — content saved as JSON files, committed to GitHub automatically
4. Tina Cloud (free, 2 users) — handles auth and the GitHub commit pipeline

On save: Tina commits to GitHub → Vercel rebuilds → live in ~1–2 min.

## Architecture

```
Goda edits at /admin
  → Tina Cloud commits JSON to GitHub
  → Vercel rebuilds
  → Pages read from Tina-generated client
  → Site live with new content
```

## Content Schema

### Projects (collection — one document per project)
- `title` (string)
- `year` (string)
- `location` (string)
- `type` (string array — tags)
- `shortDescription` (text)
- `images` (image list — uploaded via media manager)
- `videos` (file list — uploaded via media manager)
- `slug` (auto-generated from title)

### Pages (singletons)
- **Home**: hero tagline, featured projects selection
- **About**: studio description, founder bio, approach text
- **Services**: service list (name + description), process steps
- **Contact**: email, WhatsApp URL, Telegram URL, Instagram URL

### Settings (singletons)
- **Colors**: all 11 CSS color variables (main, highlight, bg, text, etc.)
- **Privacy**: full privacy notice text

## Media Handling

- Images and videos uploaded through Tina's media manager UI
- Stored in `website/public/uploads/` — committed to Git, served by Vercel CDN
- GitHub hard limit: 100MB per file — videos must be web-compressed before upload
- Recommended tool for Goda: HandBrake (free) — target under 80MB per video
- Logos/favicons stay in `Media/Images/Logo/` — dev-managed, not Goda-managed

## Authentication & Access

- Goda creates Tina Cloud account at tina.io using `info@gozustudio.com`
- Connects the `gozustudio/GozuWebsite2` GitHub repo to Tina Cloud
- Invites additional users (Francisco, others) as needed
- Free tier: 2 users
- Registration happens after build is complete, as the last step before going live

## Code Changes

### New files
- `tina/config.ts` — full schema definition
- `content/projects/main.json`, `2.json` ... `8.json`
- `content/settings/colors.json`
- `content/settings/privacy.json`
- `content/pages/home.json`, `about.json`, `services.json`, `contact.json`

### Modified files
- `lib/projects.ts` — reads from Tina client instead of ProjectInfo.txt
- `lib/colors.ts` — reads from JSON instead of ColourPalette.txt
- Page `.tsx` files (about, services, home, contact) — read from Tina content instead of hardcoded copy
- `website/public/` — new `uploads/` subfolder for Tina media

### Deleted files
- All `Projects/*/ProjectInfo.txt`
- `Settings/ColourPalette.txt`
- `Settings/PrivacyNotice.txt`

### Unchanged
- All UI components, Tailwind styles, Framer Motion animations
- WebMCP tools, Quote form, Contact form
- SEO, sitemap, robots.txt, schema.org JSON-LD

## Build Order

1. Install and configure Tina CMS locally (local mode, no account needed)
2. Define schema in `tina/config.ts`
3. Migrate content from .txt files to JSON
4. Rewrite data-fetching in `lib/` to use Tina client
5. Update page `.tsx` files to read from CMS content
6. Delete old .txt source files
7. Test locally — verify all pages render correctly
8. Deploy to Vercel
9. Goda registers at tina.io, connects repo, adds env vars to Vercel
10. Admin goes live at `gozustudio.com/admin`
