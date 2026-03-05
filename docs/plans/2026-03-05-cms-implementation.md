# Tina CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Integrate Tina CMS so Goda can edit all site content through a web UI at `/admin`, with content stored as JSON files in Git and media in `website/public/uploads/`.

**Architecture:** Tina CMS is installed inside the Next.js app. Content is stored as JSON in `website/content/`. The `/admin` editor is served by Tina's CLI (proxied in dev, static in production). Next.js pages read content from JSON files at build time using `fs` — no Tina API calls needed at build time.

**Tech Stack:** `tinacms` + `@tinacms/cli`, Next.js 16 App Router, TypeScript, existing `lib/` utilities rewritten for JSON.

---

## Context for Implementer

- Repo root: the directory containing `website/`, `Projects/`, `Settings/`, `Media/`
- All Next.js work is inside `website/` — run all `npm` commands from `website/`
- Content will move from `.txt` files (in `Projects/*/ProjectInfo.txt`, `Settings/*.txt`) to JSON files in `website/content/`
- Media will move to `website/public/uploads/` (committed to Git, served by Vercel CDN)
- `lib/projects.ts` currently reads `.txt` files — it will be rewritten to read JSON
- `lib/colors.ts` exists but is **not wired up** anywhere — colors are hardcoded in `globals.css`. We will wire it up: `layout.tsx` will inject CSS variables from `content/settings/colors.json`
- `project.type` is currently a `string` (comma-separated); it will become `string[]` in JSON
- No tests exist in this project — skip TDD steps; verify by building and checking pages render
- Do not auto-commit — user will review and commit manually
- CLAUDE.md says: do not add dependencies without asking — `tinacms` and `@tinacms/cli` are approved by the user for this task

---

### Task 1: Install Tina CMS and update build scripts

**Files:**
- Modify: `website/package.json`
- Create: `website/.env.example` (document required env vars)

**Step 1: Install packages**

```bash
cd website
npm install tinacms
npm install --save-dev @tinacms/cli
```

**Step 2: Update `website/package.json` scripts**

Replace the `scripts` block:
```json
"scripts": {
  "dev": "tinacms dev -c \"next dev\"",
  "build": "tinacms build && next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Step 3: Create `website/.env.example`**

```
# Tina Cloud credentials (needed for production /admin)
# Goda creates account at tina.io, connects repo, then finds these values
NEXT_PUBLIC_TINA_CLIENT_ID=
TINA_TOKEN=
```

**Step 4: Add generated files to `.gitignore`**

Add these lines to the root `.gitignore`:
```
# Tina CMS generated files
website/tina/__generated__/
website/public/admin/
```

**Step 5: Verify dev server starts**

```bash
cd website
npm run dev
```
Expected: Tina starts alongside Next.js. Console shows Tina dev server messages. Visit `http://localhost:3000` — site works. (Admin won't work yet — schema not defined.)

---

### Task 2: Define the Tina content schema

**Files:**
- Create: `website/tina/config.ts`

**Step 1: Create `website/tina/config.ts`**

```typescript
import { defineConfig } from "tinacms";

export default defineConfig({
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "master",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      // ── Projects ──────────────────────────────────────────────────
      {
        name: "project",
        label: "Projects",
        path: "content/projects",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) =>
              values.title
                ? values.title.toLowerCase().replace(/\s+/g, "-")
                : "untitled",
          },
        },
        fields: [
          {
            name: "title",
            type: "string",
            label: "Title",
            required: true,
          },
          {
            name: "year",
            type: "string",
            label: "Year",
          },
          {
            name: "location",
            type: "string",
            label: "Location",
          },
          {
            name: "type",
            type: "string",
            label: "Project Types",
            list: true,
            ui: {
              component: "tags",
            },
          },
          {
            name: "shortDescription",
            type: "string",
            label: "Short Description",
            ui: {
              component: "textarea",
            },
          },
          {
            name: "images",
            type: "image",
            label: "Images",
            list: true,
          },
          {
            name: "videos",
            type: "string",
            label: "Videos",
            list: true,
            description:
              "Upload video files via the media manager and paste the path here. Compress to under 80MB (use HandBrake).",
          },
          {
            name: "featured",
            type: "boolean",
            label: "Show on Home Page",
            description: "Feature this project in the Selected Works section on the home page.",
          },
          {
            name: "order",
            type: "number",
            label: "Display Order",
            description: "Lower number = shown first. Main project should be 1.",
          },
        ],
      },

      // ── Pages ─────────────────────────────────────────────────────
      {
        name: "homePage",
        label: "Home Page",
        path: "content/pages",
        format: "json",
        match: { include: "home" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "heroTagline",
            type: "string",
            label: "Hero Tagline",
            description: "Large headline in the studio intro section.",
          },
          {
            name: "introText",
            type: "string",
            label: "Intro Paragraph",
            ui: { component: "textarea" },
          },
        ],
      },
      {
        name: "aboutPage",
        label: "About Page",
        path: "content/pages",
        format: "json",
        match: { include: "about" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "introParagraph1",
            type: "string",
            label: "Intro — Paragraph 1",
            ui: { component: "textarea" },
          },
          {
            name: "introParagraph2",
            type: "string",
            label: "Intro — Paragraph 2",
            ui: { component: "textarea" },
          },
          {
            name: "introParagraph3",
            type: "string",
            label: "Intro — Paragraph 3",
            ui: { component: "textarea" },
          },
          {
            name: "founderBio",
            type: "string",
            label: "Founder Bio",
            ui: { component: "textarea" },
          },
          {
            name: "founderFacts",
            type: "object",
            label: "Founder Facts",
            list: true,
            ui: { itemProps: (item) => ({ label: item.label }) },
            fields: [
              { name: "label", type: "string", label: "Label" },
              { name: "value", type: "string", label: "Value" },
            ],
          },
          {
            name: "approachSteps",
            type: "object",
            label: "Approach Steps",
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { name: "step", type: "string", label: "Step Number (e.g. 01)" },
              { name: "title", type: "string", label: "Step Title" },
              { name: "desc", type: "string", label: "Step Description", ui: { component: "textarea" } },
            ],
          },
        ],
      },
      {
        name: "servicesPage",
        label: "Services Page",
        path: "content/pages",
        format: "json",
        match: { include: "services" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "heroText",
            type: "string",
            label: "Hero Subtitle",
            ui: { component: "textarea" },
          },
          {
            name: "services",
            type: "object",
            label: "Services",
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { name: "title", type: "string", label: "Service Title" },
              { name: "description", type: "string", label: "Description", ui: { component: "textarea" } },
              { name: "features", type: "string", label: "Features", list: true },
            ],
          },
          {
            name: "processSteps",
            type: "object",
            label: "Process Steps",
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { name: "step", type: "string", label: "Step Number (e.g. 01)" },
              { name: "title", type: "string", label: "Step Title" },
              { name: "desc", type: "string", label: "Step Description", ui: { component: "textarea" } },
            ],
          },
        ],
      },

      // ── Settings ──────────────────────────────────────────────────
      {
        name: "colors",
        label: "Color Palette",
        path: "content/settings",
        format: "json",
        match: { include: "colors" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { name: "main", type: "string", label: "Main (Gold)", ui: { component: "color" } },
          { name: "highlight", type: "string", label: "Highlight", ui: { component: "color" } },
          { name: "background", type: "string", label: "Background (Cream)", ui: { component: "color" } },
          { name: "text", type: "string", label: "Body Text", ui: { component: "color" } },
          { name: "textSecondary", type: "string", label: "Secondary Text", ui: { component: "color" } },
          { name: "label", type: "string", label: "Label Text", ui: { component: "color" } },
          { name: "container", type: "string", label: "Container Background", ui: { component: "color" } },
          { name: "border", type: "string", label: "Border", ui: { component: "color" } },
          { name: "body", type: "string", label: "Near-Black (Body)", ui: { component: "color" } },
          { name: "success", type: "string", label: "Success", ui: { component: "color" } },
          { name: "error", type: "string", label: "Error", ui: { component: "color" } },
          { name: "autofillBoxShadow", type: "string", label: "Autofill Box Shadow", description: "Usually 'transparent'" },
        ],
      },
      {
        name: "privacy",
        label: "Privacy Notice",
        path: "content/settings",
        format: "json",
        match: { include: "privacy" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "content",
            type: "string",
            label: "Privacy Notice Text",
            description: "Separate paragraphs with a blank line.",
            ui: { component: "textarea" },
          },
        ],
      },
    ],
  },
});
```

**Step 2: Verify schema loads**

```bash
cd website
npm run dev
```
Expected: No TypeScript errors from Tina. Visit `http://localhost:4001/admin` — the Tina admin UI loads showing the sidebar with Projects, Pages, Settings.

---

### Task 3: Create initial content JSON files

**Files:**
- Create: `website/content/projects/main.json`
- Create: `website/content/projects/2.json` through `8.json`
- Create: `website/content/pages/home.json`
- Create: `website/content/pages/about.json`
- Create: `website/content/pages/services.json`
- Create: `website/content/settings/colors.json`
- Create: `website/content/settings/privacy.json`

**Step 1: Create project JSON files**

Read each `Projects/<folder>/ProjectInfo.txt` and convert to JSON. Media paths reference `/uploads/projects/<folder>/` (which will be populated in Task 4).

`website/content/projects/main.json`:
```json
{
  "title": "KAZ House",
  "year": "2020",
  "location": "Stockholm, Sweden",
  "type": ["Exterior", "Renovations"],
  "shortDescription": "The competition site, which includes existing buildings, is located in the historic Naujamiestis area of Vilnius. This area developed along Gedimino Avenue in the late 19th century and became one of the city's main streets. The area's character is defined by closed blocks of buildings that are mostly 4–5 storeys high, with some taller buildings up to 10 storeys, like on this site. While the buildings along Gedimino Avenue and A. Stulginskio Street fit well into the context, the inner courtyard feels incomplete. The current 4-storey building does not fully enclose the courtyard near A. Stulginskio Street 7. To fix this, a U-shaped building is planned. It connects to the building at Gedimino Avenue 24A with a shared wall, closing off the courtyard from the south. This new 6-storey building will be tallest at the southern edge and steps down toward the courtyard, creating a cozy, inviting space and its changing perspectives.",
  "images": [
    "/uploads/projects/main/Main.jpg",
    "/uploads/projects/main/2.jpg",
    "/uploads/projects/main/3.jpg",
    "/uploads/projects/main/4.jpg",
    "/uploads/projects/main/5.jpg"
  ],
  "videos": [
    "/uploads/projects/main/Main.mp4",
    "/uploads/projects/main/2.mp4"
  ],
  "featured": true,
  "order": 1
}
```

Repeat for `2.json` through `8.json` — all have the same placeholder data from `ProjectInfo.txt`. Set `"featured": true` for all 8 initially (Goda can untick later), `"order"` from 2 to 8.

Check the actual ProjectInfo.txt files for each folder first — they may differ:
```bash
for f in 2 3 4 5 6 7 8; do echo "=== $f ==="; cat ../../Projects/$f/ProjectInfo.txt; done
```
(Run from `website/` directory — adjust path as needed from repo root.)

List available images/videos per project:
```bash
for f in 2 3 4 5 6 7 8; do echo "=== $f images ==="; ls ../../Projects/$f/Images/; echo "=== $f videos ==="; ls ../../Projects/$f/Videos/; done
```

**Step 2: Create `website/content/pages/home.json`**

```json
{
  "heroTagline": "Architecture that tells your story",
  "introText": "Gozu Studio is a luxury architecture and interior design practice founded by Goda Zukaite. We create spaces that balance refined aesthetics with functional living — from bespoke residences to considered commercial environments across Europe."
}
```

**Step 3: Create `website/content/pages/about.json`**

```json
{
  "introParagraph1": "Gozu Studio is a multidisciplinary architecture and interior design practice creating refined, considered spaces for discerning clients across Europe. Founded by Goda Zukaite, our work bridges diverse cultural traditions with a distinctive European sensibility.",
  "introParagraph2": "We believe that architecture should be an act of listening — to the site, to the client, to the way light moves through a room. Our projects begin with deep understanding and evolve into spaces that feel both inevitable and surprising.",
  "introParagraph3": "We serve clients throughout Europe, working remotely and on-site to bring each project to life. Our portfolio spans luxury residences, commercial interiors, and heritage renovations.",
  "founderBio": "Goda Zukaite founded Gozu Studio with a vision to create architecture that balances sophistication with warmth. With a background spanning both Baltic and British design traditions, she brings a distinctive perspective to every project — one that values restraint, materiality, and the quiet power of thoughtful space.",
  "founderFacts": [
    { "label": "Education", "value": "Architecture & Design" },
    { "label": "Practice", "value": "Gozu Studio" },
    { "label": "Expertise", "value": "Residential, Interior Design, Renovation" },
    { "label": "Region", "value": "Europe" }
  ],
  "approachSteps": [
    {
      "step": "01",
      "title": "Listen",
      "desc": "Every project starts with deep conversation. We learn how you live, what you value, and what the site tells us."
    },
    {
      "step": "02",
      "title": "Design",
      "desc": "We develop concepts that respond to context, light, and proportion — iterating until every detail serves the whole."
    },
    {
      "step": "03",
      "title": "Deliver",
      "desc": "From planning permissions to final finishes, we guide the project to completion with precision and care."
    }
  ]
}
```

**Step 4: Create `website/content/pages/services.json`**

```json
{
  "heroText": "From initial concept to final detail, we provide comprehensive architecture and design services tailored to each client and project.",
  "services": [
    {
      "title": "Residential Architecture",
      "description": "Bespoke homes designed around how you live. From new-build houses to luxury apartments, we create residential architecture that combines aesthetic refinement with practical intelligence. Every project is a unique response to site, client, and context.",
      "features": [
        "New-build residential design",
        "Planning & building regulations",
        "Sustainable design integration",
        "Project management"
      ]
    },
    {
      "title": "Interior Design",
      "description": "Considered interiors that transform how spaces feel. We work with material, light, and proportion to create environments that are both beautiful and deeply functional. From concept to completion, every detail is intentional.",
      "features": [
        "Full interior design service",
        "Material & finish selection",
        "Bespoke furniture design",
        "Lighting design"
      ]
    },
    {
      "title": "Renovation & Restoration",
      "description": "Thoughtful transformation of existing buildings. We specialise in giving new life to period properties and heritage structures, preserving their character while introducing contemporary clarity and comfort.",
      "features": [
        "Period property renovation",
        "Heritage building restoration",
        "Extension design",
        "Structural modifications"
      ]
    },
    {
      "title": "Commercial Interiors",
      "description": "Workspaces and commercial environments that elevate brands. We design offices, retail spaces, and hospitality interiors that align physical space with business identity and culture.",
      "features": [
        "Office & workspace design",
        "Retail interiors",
        "Hospitality design",
        "Brand-aligned environments"
      ]
    }
  ],
  "processSteps": [
    { "step": "01", "title": "Consultation", "desc": "We discuss your vision, requirements, and budget." },
    { "step": "02", "title": "Concept", "desc": "Initial design concepts, mood boards, and spatial planning." },
    { "step": "03", "title": "Development", "desc": "Detailed drawings, material selection, and contractor coordination." },
    { "step": "04", "title": "Completion", "desc": "On-site oversight through to handover and final styling." }
  ]
}
```

**Step 5: Create `website/content/settings/colors.json`**

```json
{
  "main": "#d4bc90",
  "highlight": "#e2a55e",
  "background": "#f8f4ed",
  "text": "#333333",
  "textSecondary": "#888888",
  "label": "#999999",
  "container": "#ffffff",
  "border": "#757575",
  "body": "#212529",
  "success": "#90ee90",
  "error": "#ed645a",
  "autofillBoxShadow": "transparent"
}
```

**Step 6: Create `website/content/settings/privacy.json`**

Copy the full text from `Settings/PrivacyNotice.txt` into the `content` field:
```json
{
  "content": "PRIVACY STATEMENT - Gozu Studio\nLast Updated: 01-2026\n\nConfidentiality and security of your personal data are important to us. We would like to offer you personalized services while respecting your privacy and choices.\n\nThis Privacy Statement (\"Statement\") is provided by Gozu Studio (\"Company,\" \"we\" or \"us\"), a luxury architecture and design brand with its global headquarters in London, United Kingdom.\n\nThe purpose of this Statement is to inform you in a transparent and simple manner about the processing of the personal data that you provide or that we collect through the different touchpoints you use to interact with us (e.g. in store, client services, dior.com, social media, digital apps, events), about possible transfers to third parties, as well as your rights and options to control your personal data and protect your privacy.\n\nAn easy to read and dedicated micro Privacy Statement is available via this link. It summarizes at high level the processing of your personal data By Gozu Studio."
}
```

**Step 7: Verify files exist**

```bash
ls website/content/projects/
ls website/content/pages/
ls website/content/settings/
```
Expected: `main.json 2.json 3.json 4.json 5.json 6.json 7.json 8.json`, `home.json about.json services.json`, `colors.json privacy.json`

---

### Task 4: Copy project media to `website/public/uploads/` and commit

This makes images and videos available on Vercel (they were gitignored in `website/public/projects/`).

**Files:**
- Create: `website/public/uploads/projects/main/` (and 2–8)

**Step 1: Create upload directories and copy media**

Run from the repo root:
```bash
for folder in Main 2 3 4 5 6 7 8; do
  lower=$(echo "$folder" | tr '[:upper:]' '[:lower:]')
  mkdir -p "website/public/uploads/projects/$lower"
  cp Projects/$folder/Images/* "website/public/uploads/projects/$lower/"
  cp Projects/$folder/Videos/* "website/public/uploads/projects/$lower/"
done
```

**Step 2: Verify**

```bash
ls website/public/uploads/projects/main/
```
Expected: `Main.jpg 2.jpg 3.jpg 4.jpg 5.jpg Main.mp4 2.mp4`

**Note:** `website/public/uploads/` is NOT gitignored (only `website/public/projects/`, `website/public/videos/`, `website/public/images/` are gitignored). So these files will be committed to Git and deployed on Vercel.

---

### Task 5: Rewrite `lib/projects.ts` to read from content JSON

**Files:**
- Modify: `website/src/lib/projects.ts`

**Step 1: Rewrite the file**

```typescript
import fs from "fs";
import path from "path";

export interface Project {
  slug: string;
  title: string;
  year: string;
  location: string;
  type: string[];
  shortDescription: string;
  images: string[];
  videos: string[];
  featured: boolean;
  order: number;
}

export function loadProjects(): Project[] {
  const contentDir = path.resolve(process.cwd(), "content/projects");
  if (!fs.existsSync(contentDir)) return [];

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"));

  const projects = files.map((file) => {
    const slug = file.replace(".json", "");
    const raw = JSON.parse(
      fs.readFileSync(path.join(contentDir, file), "utf-8")
    );
    return {
      slug,
      title: raw.title ?? "Untitled",
      year: raw.year ?? "",
      location: raw.location ?? "",
      type: Array.isArray(raw.type) ? raw.type : [],
      shortDescription: raw.shortDescription ?? "",
      images: Array.isArray(raw.images) ? raw.images : [],
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      featured: raw.featured ?? false,
      order: raw.order ?? 99,
    } as Project;
  });

  return projects.sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return loadProjects().find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return loadProjects().map((p) => p.slug);
}
```

**Step 2: Fix `project.type` usages — it's now `string[]` not `string`**

In `website/src/app/projects/page.tsx` line ~72:
- Change `{project.type}` to `{project.type.join(", ")}`

In `website/src/app/projects/[slug]/page.tsx` line ~108:
- Change `value: project.type` to `value: project.type.join(", ")`

**Step 3: Verify build**

```bash
cd website && npm run build
```
Expected: Build succeeds, no TypeScript errors about `project.type`.

---

### Task 6: Wire colors into layout.tsx

**Files:**
- Modify: `website/src/lib/colors.ts`
- Modify: `website/src/app/globals.css`
- Modify: `website/src/app/layout.tsx`

**Step 1: Rewrite `website/src/lib/colors.ts`**

```typescript
import fs from "fs";
import path from "path";

export interface ColorPalette {
  main: string;
  highlight: string;
  background: string;
  text: string;
  textSecondary: string;
  label: string;
  container: string;
  border: string;
  body: string;
  success: string;
  error: string;
  autofillBoxShadow: string;
}

export function loadColors(): ColorPalette {
  const filePath = path.resolve(
    process.cwd(),
    "content/settings/colors.json"
  );
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as ColorPalette;
}

export function colorsToCSS(palette: ColorPalette): string {
  return `
    --color-main: ${palette.main};
    --color-highlight: ${palette.highlight};
    --color-bg: ${palette.background};
    --color-text: ${palette.text};
    --color-text-secondary: ${palette.textSecondary};
    --color-label: ${palette.label};
    --color-container: ${palette.container};
    --color-border: ${palette.border};
    --color-body: ${palette.body};
    --color-success: ${palette.success};
    --color-error: ${palette.error};
    --color-autofill-shadow: ${palette.autofillBoxShadow};
  `.trim();
}
```

**Step 2: Remove hardcoded color values from `website/src/app/globals.css`**

Remove the entire block of color variables from `:root` (lines 5–16) and replace with a comment. Keep the derived shades. The `:root` block should become:

```css
:root {
  /* Colors injected at build time from content/settings/colors.json via layout.tsx */

  /* Derived shades */
  --color-main-light: color-mix(in oklch, var(--color-main), white 30%);
  --color-main-dark: color-mix(in oklch, var(--color-main), black 20%);
  --color-highlight-light: color-mix(in oklch, var(--color-highlight), white 30%);
  --color-overlay: rgba(0, 0, 0, 0.4);
  --color-overlay-light: rgba(248, 244, 237, 0.85);
}
```

**Step 3: Inject colors in `website/src/app/layout.tsx`**

Add the import at the top:
```typescript
import { loadColors, colorsToCSS } from "@/lib/colors";
```

In `RootLayout`, before the `return`, add:
```typescript
const cssVars = colorsToCSS(loadColors());
```

In the `<head>` section (after the GA4 scripts), add:
```tsx
<style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />
```

**Step 4: Verify build**

```bash
cd website && npm run build
```
Expected: Build succeeds. No errors. Visit dev server — colors render correctly (gold, cream background visible).

---

### Task 7: Update pages to read from content JSON

**Files:**
- Modify: `website/src/app/page.tsx`
- Modify: `website/src/app/about/page.tsx`
- Modify: `website/src/app/services/page.tsx`
- Modify: `website/src/app/privacy/page.tsx`

**Step 1: Update `website/src/app/page.tsx`**

Add a helper to read home page content. Add at the top of the file (after imports):

```typescript
import fs from "fs";
import path from "path";

function loadHomePage() {
  const file = path.resolve(process.cwd(), "content/pages/home.json");
  return JSON.parse(fs.readFileSync(file, "utf-8")) as {
    heroTagline: string;
    introText: string;
  };
}
```

In the component, call it:
```typescript
const homePage = loadHomePage();
const projects = loadProjects().filter((p) => p.featured);
```

Replace the hardcoded tagline `"Architecture that tells your story"` with `{homePage.heroTagline}`.

Replace the hardcoded intro paragraph text with `{homePage.introText}`.

Remove the `const featured = projects.slice(0, 6)` line — featured projects now come from the `featured` flag.

**Step 2: Update `website/src/app/about/page.tsx`**

Add at the top:
```typescript
import fs from "fs";
import path from "path";

function loadAboutPage() {
  const file = path.resolve(process.cwd(), "content/pages/about.json");
  return JSON.parse(fs.readFileSync(file, "utf-8")) as {
    introParagraph1: string;
    introParagraph2: string;
    introParagraph3: string;
    founderBio: string;
    founderFacts: { label: string; value: string }[];
    approachSteps: { step: string; title: string; desc: string }[];
  };
}
```

In the component:
```typescript
const about = loadAboutPage();
```

Replace each hardcoded text string with its `about.*` counterpart:
- Intro paragraphs: `{about.introParagraph1}`, `{about.introParagraph2}`, `{about.introParagraph3}`
- Founder bio: `{about.founderBio}`
- Founder facts array: replace the inline array with `{about.founderFacts.map(...)}`
- Approach steps: replace the inline array with `{about.approachSteps.map(...)}`

**Step 3: Update `website/src/app/services/page.tsx`**

Add at the top:
```typescript
import fs from "fs";
import path from "path";

function loadServicesPage() {
  const file = path.resolve(process.cwd(), "content/pages/services.json");
  return JSON.parse(fs.readFileSync(file, "utf-8")) as {
    heroText: string;
    services: { title: string; description: string; features: string[] }[];
    processSteps: { step: string; title: string; desc: string }[];
  };
}
```

In the component:
```typescript
const page = loadServicesPage();
```

Replace `SERVICES` constant usage with `page.services`.
Replace hero subtitle with `{page.heroText}`.
Replace process steps inline array with `page.processSteps`.

**Step 4: Update `website/src/app/privacy/page.tsx`**

Replace the `fs.readFileSync` call (which reads `Settings/PrivacyNotice.txt`) with:

```typescript
const privacyPath = path.resolve(
  process.cwd(),
  "content/settings/privacy.json"
);
let privacyContent = "Privacy policy content not available.";

try {
  const json = JSON.parse(fs.readFileSync(privacyPath, "utf-8"));
  privacyContent = json.content ?? privacyContent;
} catch {
  // File not found — use fallback
}
```

**Step 5: Verify all pages render**

```bash
cd website && npm run dev
```

Visit each page and confirm content loads:
- `http://localhost:3000` — tagline and intro from JSON
- `http://localhost:3000/about` — all copy from JSON
- `http://localhost:3000/services` — services list and process from JSON
- `http://localhost:3000/privacy` — privacy text from JSON
- `http://localhost:3000/projects` — projects grid loads
- `http://localhost:3000/projects/main` — project detail loads

---

### Task 8: Delete old source files and update `.gitignore`

**Files:**
- Delete: all `Projects/*/ProjectInfo.txt` (8 files)
- Delete: `Settings/ColourPalette.txt`
- Delete: `Settings/PrivacyNotice.txt`
- Modify: root `.gitignore`
- Modify: `CLAUDE.md`

**Step 1: Delete .txt files**

```bash
# From repo root:
rm Projects/Main/ProjectInfo.txt
rm Projects/2/ProjectInfo.txt
rm Projects/3/ProjectInfo.txt
rm Projects/4/ProjectInfo.txt
rm Projects/5/ProjectInfo.txt
rm Projects/6/ProjectInfo.txt
rm Projects/7/ProjectInfo.txt
rm Projects/8/ProjectInfo.txt
rm Settings/ColourPalette.txt
rm Settings/PrivacyNotice.txt
```

**Step 2: Update root `.gitignore`**

Add at the bottom:
```
# Tina CMS generated files
website/tina/__generated__/
website/public/admin/
```

**Step 3: Update `CLAUDE.md`**

- Update "Source of Truth Principle" section: replace `.txt` references with `content/` JSON files
- Update "Pending Work": remove "Real project data" item, mark CMS as implemented
- Update "Development Notes": remove "When replacing assets in `Media/`" note, add note about Tina media uploads

**Step 4: Final build**

```bash
cd website && npm run build
```
Expected: Clean build, no errors.

---

### Task 9: Verify admin UI works locally

**Step 1: Start dev server**

```bash
cd website && npm run dev
```

**Step 2: Open admin**

Visit `http://localhost:4001/admin` (Tina's local port) or `http://localhost:3000/admin`.

Expected: Tina admin loads, showing:
- Projects collection with 8 documents
- Home Page, About Page, Services Page singletons
- Color Palette and Privacy Notice settings
- Media manager accessible (upload button visible)

**Step 3: Test an edit**

- Click on a project → change the title → save
- Check that `website/content/projects/main.json` is updated with the new title
- Refresh `http://localhost:3000/projects/main` → title is updated

---

### Task 10: Push to GitHub and verify Vercel deployment

**Step 1: Push**

```bash
cd /repo-root
git push origin master
```

**Step 2: Monitor Vercel**

Watch the deployment at `vercel.com/gozustudio/gozu-website`. Expected: READY in ~2 minutes.

**Step 3: Verify live site**

Open the Vercel deployment URL and check each page:
- Home: correct tagline, projects grid with images
- About: copy loaded, no broken layout
- Services: service list loaded
- Privacy: text loaded
- Projects: grid with project images (served from `/uploads/projects/*/`)

**Note on Vercel env vars for production admin:**
When Goda is ready to use the live `/admin`, she will:
1. Create account at tina.io with `info@gozustudio.com`
2. Create a new project, connect the `gozustudio/GozuWebsite2` repo
3. Copy `Client ID` and `Content Token` from Tina Cloud
4. Add to Vercel env vars: `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN`
5. Redeploy — admin becomes live at `gozustudio.com/admin`
