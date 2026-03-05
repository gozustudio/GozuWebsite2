# Pending Tasks Design — 2026-03-05

## Task 1: Asset Copy Script

Node.js script at `website/scripts/copy-assets.js` that copies brand assets from `Media/` to `website/public/`.

Copies:
- `Media/Images/Logo/Favicon/*` → `website/public/`
- `Media/Images/Logo/SVG/*` → `website/public/images/`
- `Media/Videos/LandingVideo.mp4` → `website/public/videos/`
- `Media/Images/LandingImage.jpg` → `website/public/images/`

Add `npm run copy-assets` script. Hook into `npm run dev` to run before dev server.

## Task 2: Page-Level WebMCP Metadata

Add `<script type="application/json" id="webmcp">` to pages with tools:
- `/contact` — `contact_gozu_studio` form tool
- `/quote` — `request_quote_gozu_studio` form tool
- `/projects` — `search_gozu_projects` imperative tool
- `/` (home) — `get_gozu_studio_info` imperative tool

## Task 3: Contact Form Backend

New: `website/src/app/api/contact/route.ts`
- Validate fields (name, email, subject, message) + honeypot
- Append to "Contact" sheet in existing Google Spreadsheet
- Send email to info@gozustudio.com via Resend

Update: `ContactForm.tsx` — call `/api/contact` on submit

New dependency: `resend`
New env var: `RESEND_API_KEY`
DNS: Add Resend DKIM/SPF records to Squarespace for gozustudio.com

## Task 4: i18n Wiring (next-intl)

Infrastructure:
- `website/src/i18n/` — config, routing, request handler
- Next.js middleware for locale detection and prefix routing
- Default locale: `en` (no prefix)
- Other 9 locales prefixed: `/lt/`, `/es/`, `/sv/`, `/no/`, `/da/`, `/nl/`, `/de/`, `/fr/`, `/it/`

Message files:
- `website/messages/en.json` — extract hardcoded English strings
- 9 other locale files via AI translation
- CMS content stays English — i18n covers UI strings only

Page updates:
- `useTranslations()` hook in pages
- Replace hardcoded strings with `t('key')` calls
- Move routes into `[locale]/` dynamic segment
