/**
 * copy-assets.js
 *
 * Copies brand assets from Media/ (repo root) into website/public/ so the
 * Next.js dev server can serve them.  These copies are gitignored — the
 * source of truth is always Media/.
 *
 * Usage:  node scripts/copy-assets.js        (run from website/)
 */

const fs = require('fs');
const path = require('path');

// Resolve paths relative to this script's location (website/scripts/)
const websiteDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(websiteDir, '..');
const publicDir = path.join(websiteDir, 'public');

// ── Asset mapping ──────────────────────────────────────────────────────
// Each entry: { src (file or dir), dest (file or dir), isDir }
const assets = [
  {
    src: path.join(repoRoot, 'Media', 'Images', 'Logo', 'Favicon'),
    dest: publicDir,
    isDir: true,
  },
  {
    src: path.join(repoRoot, 'Media', 'Images', 'Logo', 'SVG'),
    dest: path.join(publicDir, 'images'),
    isDir: true,
  },
  {
    src: path.join(repoRoot, 'Media', 'Videos', 'LandingVideo.mp4'),
    dest: path.join(publicDir, 'videos', 'LandingVideo.mp4'),
    isDir: false,
  },
  {
    src: path.join(repoRoot, 'Media', 'Images', 'LandingImage.jpg'),
    dest: path.join(publicDir, 'images', 'LandingImage.jpg'),
    isDir: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`  copied  ${path.relative(repoRoot, src)}  ->  ${path.relative(repoRoot, dest)}`);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`  WARN  source directory not found: ${path.relative(repoRoot, srcDir)}`);
    return;
  }
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isFile()) {
      copyFile(srcPath, destPath);
    }
    // Skip subdirectories — brand asset folders are flat
  }
}

// ── Main ───────────────────────────────────────────────────────────────

console.log('Copying brand assets from Media/ to website/public/ ...\n');

let copied = 0;
let warned = 0;

for (const asset of assets) {
  if (asset.isDir) {
    const before = copied;
    if (!fs.existsSync(asset.src)) {
      console.warn(`  WARN  source directory not found: ${path.relative(repoRoot, asset.src)}`);
      warned++;
      continue;
    }
    const entries = fs.readdirSync(asset.src);
    ensureDir(asset.dest);
    for (const entry of entries) {
      const srcPath = path.join(asset.src, entry);
      if (fs.statSync(srcPath).isFile()) {
        copyFile(srcPath, path.join(asset.dest, entry));
        copied++;
      }
    }
    if (copied === before) {
      console.log(`  (no files in ${path.relative(repoRoot, asset.src)})`);
    }
  } else {
    if (!fs.existsSync(asset.src)) {
      console.warn(`  WARN  source file not found: ${path.relative(repoRoot, asset.src)}`);
      warned++;
      continue;
    }
    copyFile(asset.src, asset.dest);
    copied++;
  }
}

console.log(`\nDone. ${copied} file(s) copied${warned > 0 ? `, ${warned} warning(s)` : ''}.`);
