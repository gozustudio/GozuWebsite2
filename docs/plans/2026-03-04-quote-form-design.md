# Quote Form Redesign — Design Document
**Date:** 2026-03-04

## Overview

Replace the current single-page `QuoteForm.tsx` with a 4-step multi-step wizard that collects rich project data and submits it to `Database - Form Responses` (Google Sheets) via a Next.js API route authenticated with a Google Cloud service account. This triggers the existing automation pipeline (prospect creation, pricing, first quote email).

## Architecture

```
Website form (4 steps)
    ↓ POST /api/quote
Next.js API route
    ↓ googleapis (service account auth)
Database - Form Responses (Google Sheets)
    ↓ UpdateProspectsDatabase script (existing, ~12h trigger)
Prospect created → pricing email sent
```

## Form Steps

1. **Contact** — Email, First Name, Last Name
2. **Project Address** — Country (searchable), State, City, Postcode, Street Name, Street Number, Apartment
3. **Project Details** — Property type, scope, construction type, demolition, area+unit, project site, completion timeline
4. **Package** — Standard / Advance / Premium

## Visual Design

- Keeps exact website aesthetic: `var(--color-container)` card, `p-8 lg:p-12`, gold focus borders, 11px uppercase labels
- Step indicator: 4 dots connected by a thin line, gold fill for completed
- Framer Motion `x` slide transitions between steps
- Icon option cards: gold border + cream background when selected
- Country dropdown: custom searchable combobox (no external library)
- Back (ghost) + Next/Submit (gold fill) navigation buttons

## Step 3 Fields

| Field | Type | Options |
|---|---|---|
| Property type | multi-select cards | Residential · Offices · Commercial |
| Residential sub-type | single-select (conditional) | Single Family Property · Multiple Family Property |
| Project scope | multi-select cards | Interior · Exterior · Landscape |
| Construction type | single-select | Renovation · Construction from zero |
| Demolition | single-select | Yes · No |
| Area | number + unit toggle | Square Metres / Square Feet |
| Project site | single-select | On-site · Remote |
| Completion | single-select | As soon as possible · 5-6 months · 6-12 months |

## Package Cards (Step 4)

| # | Name | Tagline |
|---|---|---|
| 1 | Standard | All the basic technical plans |
| 2 | Advance | More advanced with aesthetics specialist advice |
| 3 | Premium | Complete with realistic visualizations |

## Data Mapping — 26 Columns

Matches `Database - Form Responses` sheet exactly:

| Column | Value |
|---|---|
| Prospects | `"Partial"` (partial save) / `""` (full submit) |
| Timestamp | server-side ISO timestamp |
| Email | email |
| Name | firstName |
| Last Name | lastName |
| Country Code | CO-prefixed code (e.g. CO014) |
| State | state |
| City | city |
| Postcode | postcode |
| Street Name | streetName |
| Street Number | streetNumber |
| Apartment | apartment |
| Residential | TRUE/FALSE |
| Offices | TRUE/FALSE |
| Commercial | TRUE/FALSE |
| Residential Property | "Single Family Property" / "Multiple Family Property" / "" |
| Interior | TRUE/FALSE |
| Exterior | TRUE/FALSE |
| Landscape | TRUE/FALSE |
| Construction Type | "Renovation" / "Construction from zero" |
| Demolition | "Yes" / "No" |
| Area | number |
| Unit | "Square Metres" / "Square Feet" |
| Project Site | "On-site" / "Remote" |
| Completition Date | "As soon as possible" / "5-6 months" / "6-12 months" |
| Package | "Standard" / "Advance" / "Premium" |

## Partial Save Strategy

- **localStorage**: full form state persisted on every change — page refresh restores progress
- **Step 1 → Step 2**: fire silent background POST with contact fields, `Prospects = "Partial"`
- **Steps 2–3 → next**: upsert by email, `Prospects = "Partial"`
- **Step 4 submit**: upsert by email, `Prospects = ""` (triggers automation)
- **Deduplication key**: email (column C) — find row, update in place; if not found, append
- **Post-launch task**: update `UpdateProspectsDatabase` to skip rows where `Prospects = "Partial"`

## API Route

File: `website/src/app/api/quote/route.ts`

- Reads `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID` from env
- Authenticates via `googleapis` npm package (JWT auth)
- On each call: reads column C to find existing row by email → update or append
- Accepts `partial: boolean` in body to set `Prospects` value accordingly

## New Dependency

- `googleapis` — official Google API client for Node.js

## Environment Variables

| Variable | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `gozu-website@gozu-studio-website.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | private key from `gozu-service-account.json` |
| `GOOGLE_SPREADSHEET_ID` | `1LJo7px07ANM0iMQc0iCovuuz-MRaZL7oiap4lC4QmYI` |

## Countries List

Hardcoded TypeScript constant from `Database - Countries` (CO001–CO195). Fetched once at dev time, never at runtime.

## Files Affected

- `website/src/components/sections/QuoteForm.tsx` — full rewrite
- `website/src/app/api/quote/route.ts` — new file
- `website/src/lib/countries.ts` — new file (hardcoded country list)
- `website/.env.local` — add 3 env vars
- `website/package.json` — add `googleapis`
