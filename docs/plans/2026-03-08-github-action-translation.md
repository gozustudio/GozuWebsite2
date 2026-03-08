# GitHub Action Translation System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move CMS content translation from Vercel build-time to a GitHub Action with 24h throttle, daily cron catch-up, and manual trigger. Commit translated files to Git so Vercel builds never call the Translation API.

**Architecture:** GitHub Action triggers on pushes to `main` that modify source content files (`website/content/pages/`, `projects/`, `settings/privacy.json`). It checks a `.last-translation` JSON file for a timestamp — if <24h ago, skips (unless manual trigger). Uses `git diff` to find changed files, runs `translate-content.js --only <changed-files>`, commits results. Daily 06:00 UTC cron catches throttled changes.

**Tech Stack:** GitHub Actions, Node.js 20, Google Cloud Translation API v2, Git

---

### Task 1: Add `--only` flag to translate-content.js

**Files:**
- Modify: `website/scripts/translate-content.js`

**Step 1: Add argument parsing and file filtering**

At the top of `main()` (after line 198), parse `--only` from `process.argv`. If provided, filter `allFiles` to only include those files.

```javascript
// Inside main(), after line 201 ("Collect all content files"):

// Parse --only flag: node translate-content.js --only pages/home.json,projects/main.json
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const onlyFiles = onlyArg
  ? onlyArg.replace("--only=", "").split(",").map((f) => f.trim())
  : null;
```

Then after `allFiles` is built (after line 217), add:

```javascript
// Filter to only specified files if --only flag provided
if (onlyFiles) {
  const filtered = allFiles.filter((f) => onlyFiles.includes(f));
  if (filtered.length === 0) {
    console.log("No matching files found for --only filter.");
    return;
  }
  allFiles.length = 0;
  allFiles.push(...filtered);
}
```

Note: `allFiles` is declared with `const` but is an array, so we can mutate it in-place.

**Step 2: Verify locally**

```bash
cd website
node scripts/translate-content.js --only=pages/home.json
# Should print: "Found X strings across 1 files"
# Will fail at auth (billing closed) — that's expected, we just need to see the filtering works
```

**Step 3: Commit**

```bash
git add website/scripts/translate-content.js
git commit -m "feat: add --only flag to translate-content.js for selective translation"
```

---

### Task 2: Create `.last-translation` metadata file

**Files:**
- Create: `website/content/translated/.last-translation`

**Step 1: Create the initial metadata file**

```json
{
  "timestamp": "2026-03-08T00:00:00Z",
  "commitSha": ""
}
```

This file tracks when translation last ran and which commit was translated. Empty `commitSha` means "translate everything on next run."

**Step 2: Commit**

```bash
git add website/content/translated/.last-translation
git commit -m "feat: add .last-translation metadata file for translation throttling"
```

Note: This file is inside `content/translated/` which is currently gitignored. We'll un-gitignore the whole directory in Task 4. For now, use `git add -f` to force-add it.

---

### Task 3: Create GitHub Action workflow

**Files:**
- Create: `.github/workflows/translate.yml`

**Step 1: Write the workflow file**

```yaml
name: Translate CMS Content

on:
  push:
    branches: [main]
    paths:
      - 'website/content/pages/**'
      - 'website/content/projects/**'
      - 'website/content/settings/privacy.json'
  schedule:
    # Daily at 06:00 UTC — catches changes throttled during the day
    - cron: '0 6 * * *'
  workflow_dispatch:
    # Manual trigger — bypasses 24h throttle

permissions:
  contents: write

jobs:
  translate:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: website

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Read last translation metadata
        id: meta
        run: |
          META_FILE="content/translated/.last-translation"
          if [ -f "$META_FILE" ]; then
            TIMESTAMP=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$META_FILE','utf-8')).timestamp)")
            LAST_SHA=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$META_FILE','utf-8')).commitSha)")
            echo "timestamp=$TIMESTAMP" >> "$GITHUB_OUTPUT"
            echo "last_sha=$LAST_SHA" >> "$GITHUB_OUTPUT"
          else
            echo "timestamp=" >> "$GITHUB_OUTPUT"
            echo "last_sha=" >> "$GITHUB_OUTPUT"
          fi

      - name: Check 24h throttle
        id: throttle
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "skip=false" >> "$GITHUB_OUTPUT"
            echo "Manual trigger — bypassing throttle"
            exit 0
          fi

          LAST="${{ steps.meta.outputs.timestamp }}"
          if [ -z "$LAST" ]; then
            echo "skip=false" >> "$GITHUB_OUTPUT"
            echo "No previous translation — will translate"
            exit 0
          fi

          LAST_EPOCH=$(date -d "$LAST" +%s 2>/dev/null || echo 0)
          NOW_EPOCH=$(date +%s)
          DIFF=$((NOW_EPOCH - LAST_EPOCH))

          if [ "$DIFF" -lt 86400 ]; then
            echo "skip=true" >> "$GITHUB_OUTPUT"
            echo "Last translation was $(($DIFF / 3600))h ago — throttled (< 24h)"
          else
            echo "skip=false" >> "$GITHUB_OUTPUT"
            echo "Last translation was $(($DIFF / 3600))h ago — will translate"
          fi

      - name: Find changed content files
        id: diff
        if: steps.throttle.outputs.skip != 'true'
        run: |
          LAST_SHA="${{ steps.meta.outputs.last_sha }}"

          if [ -z "$LAST_SHA" ] || ! git cat-file -e "$LAST_SHA" 2>/dev/null; then
            echo "No valid last SHA — translating all files"
            echo "only=" >> "$GITHUB_OUTPUT"
            echo "has_changes=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi

          CHANGED=$(git diff --name-only "$LAST_SHA" HEAD -- \
            content/pages/ content/projects/ content/settings/privacy.json \
            | sed 's|^content/||' \
            | tr '\n' ',' \
            | sed 's/,$//')

          if [ -z "$CHANGED" ]; then
            echo "No content files changed since last translation"
            echo "has_changes=false" >> "$GITHUB_OUTPUT"
          else
            echo "Changed files: $CHANGED"
            echo "only=$CHANGED" >> "$GITHUB_OUTPUT"
            echo "has_changes=true" >> "$GITHUB_OUTPUT"
          fi

      - name: Run translation
        if: steps.throttle.outputs.skip != 'true' && steps.diff.outputs.has_changes == 'true'
        env:
          GOOGLE_SERVICE_ACCOUNT_EMAIL: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL }}
          GOOGLE_PRIVATE_KEY: ${{ secrets.GOOGLE_PRIVATE_KEY }}
        run: |
          ONLY="${{ steps.diff.outputs.only }}"
          if [ -n "$ONLY" ]; then
            node scripts/translate-content.js "--only=$ONLY"
          else
            node scripts/translate-content.js
          fi

      - name: Update last-translation metadata
        if: steps.throttle.outputs.skip != 'true' && steps.diff.outputs.has_changes == 'true'
        run: |
          SHA=$(git rev-parse HEAD)
          NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
          echo "{\"timestamp\":\"$NOW\",\"commitSha\":\"$SHA\"}" > content/translated/.last-translation

      - name: Commit and push translated files
        if: steps.throttle.outputs.skip != 'true' && steps.diff.outputs.has_changes == 'true'
        run: |
          cd ..
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add website/content/translated/
          git diff --cached --quiet && echo "No changes to commit" && exit 0
          git commit -m "chore: auto-translate CMS content

          Triggered by: ${{ github.event_name }}
          Files translated: ${{ steps.diff.outputs.only || 'all' }}"
          git push
```

**Step 2: Commit**

```bash
git add .github/workflows/translate.yml
git commit -m "feat: add GitHub Action for CMS content translation"
```

---

### Task 4: Un-gitignore translated files and commit existing translations

**Files:**
- Modify: `.gitignore` (repo root, line 60)

**Step 1: Remove the gitignore line**

In `.gitignore` at repo root, remove line 60:
```
website/content/translated/
```

Keep the comment on line 59 but update it:
```
# Auto-generated translations (committed by GitHub Action)
```

**Step 2: Add all existing translated files to Git**

```bash
git add website/content/translated/
```

This should add all 25 locale directories plus the `.last-translation` file.

**Step 3: Commit**

```bash
git add .gitignore
git add website/content/translated/
git commit -m "feat: commit translated content to Git (no longer generated at build time)"
```

---

### Task 5: Remove translate-content.js from Vercel build command

**Manual step in Vercel Dashboard:**

1. Go to: `vercel.com` → Project `gozu-website` → Settings → General → Build & Development Settings
2. Change Build Command from:
   ```
   node scripts/copy-assets.js && node scripts/translate-content.js && npx tinacms build && npx next build
   ```
   to:
   ```
   node scripts/copy-assets.js && npx tinacms build && npx next build
   ```
3. Also check Production Overrides (if set) and update there too

**Also update CLAUDE.md** to reflect the new build command.

In `CLAUDE.md`, find:
```
node scripts/copy-assets.js && node scripts/translate-content.js && npx tinacms build && npx next build
```
Replace with:
```
node scripts/copy-assets.js && npx tinacms build && npx next build
```

Update the "Content Translation" section to describe the new GitHub Action approach.

**Commit:**
```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for GitHub Action translation system"
```

---

### Task 6: Add GitHub repo secrets

**Manual step in GitHub:**

1. Go to: `github.com/gozustudio/GozuWebsite2` → Settings → Secrets and variables → Actions
2. Add repository secret: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Value: `gozu-website@gozu-studio-website.iam.gserviceaccount.com`
3. Add repository secret: `GOOGLE_PRIVATE_KEY`
   - Value: Copy from `gozu-service-account.json` (the `private_key` field, with `\n` line breaks)

Note: These are the same credentials used in Vercel env vars. The Vercel env vars can remain (they're used by other APIs like Google Sheets) but the translate script will no longer run during builds.

---

### Task 7: Set GCP $1/month budget alert

**Manual step in GCP Console:**

1. Go to: `console.cloud.google.com/billing` → select billing account `015D9E-3A3C18-EF4443`
2. Note: The billing account is currently CLOSED. You'll need to reopen it first (click "Upgrade" or "Manage")
3. Navigate to: Budgets & alerts → Create Budget
4. Budget name: `Translation API Monthly Cap`
5. Budget amount: `$1.00` (or `€1.00`)
6. Set alert thresholds: 50% ($0.50), 90% ($0.90), 100% ($1.00)
7. Check "Email alerts to billing admins and users"

**Important**: GCP budgets are alerts only — they don't automatically stop spending. To truly cap spending, also:
8. Go to APIs & Services → Cloud Translation API → Quotas
9. Set "Characters per day" quota to a reasonable limit (e.g., 500,000 characters/day — enough for ~2 full translations, costs ~$0.01)

---

### Task 8: Push everything and verify

**Step 1: Push to both branches**

```bash
git push origin master && git push origin master:main
```

**Step 2: Verify the GitHub Action did NOT trigger**

The push includes changes to `.github/workflows/`, `.gitignore`, `CLAUDE.md`, and `scripts/`. None of these match the Action's path filter (`website/content/pages/**`, `website/content/projects/**`, `website/content/settings/privacy.json`), so the Action should NOT run.

Check: `github.com/gozustudio/GozuWebsite2` → Actions tab → should show no runs (or the Action exists but wasn't triggered).

**Step 3: Verify Vercel build succeeds without translation step**

After updating the Vercel build command (Task 5), the next deployment should:
- Skip the translate script entirely
- Use the committed translated files from Git
- Build faster

Check: Vercel dashboard → Deployments → latest build log should NOT contain "Translating CMS content..."

**Step 4: Test manual trigger (after GCP billing is reopened)**

1. Go to: GitHub → Actions → "Translate CMS Content" → Run workflow → select `main` branch → Run
2. Should translate all files (first run, no previous SHA)
3. Should commit translated files and update `.last-translation`

---

## Summary of changes

| Component | Change |
|-----------|--------|
| `website/scripts/translate-content.js` | Add `--only=` flag for selective translation |
| `.github/workflows/translate.yml` | New file — GitHub Action with push/cron/manual triggers |
| `website/content/translated/.last-translation` | New file — throttle metadata |
| `.gitignore` (root) | Remove `website/content/translated/` line |
| `website/content/translated/**` | Committed to Git (25 locale dirs) |
| Vercel build command | Remove `translate-content.js` step (manual in dashboard) |
| GitHub repo secrets | Add `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` |
| GCP | $1/month budget + daily character quota |
| `CLAUDE.md` | Update build command + translation docs |
