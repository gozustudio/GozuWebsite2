#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CONTENT_DIR = path.resolve(__dirname, "../content");
const TRANSLATED_DIR = path.resolve(CONTENT_DIR, "translated");

const LOCALES = [
  "bg","cs","da","de","el","es","et","fi","fr","hr",
  "hu","it","lt","lv","nl","no","pl","pt","ro","ru",
  "sk","sl","sr","sv","uk",
];

// Fields that should NOT be translated (by key name)
const SKIP_FIELDS = new Set([
  "images", "videos", "year", "order", "featured", "step", "slug", "collaborations",
]);

// --- Google Cloud Translation API auth ---

async function getAccessToken() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!email || !key) {
      console.log("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        iss: email,
        scope: "https://www.googleapis.com/auth/cloud-translation",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    ).toString("base64url");

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(key, "base64url");
    const jwt = `${header}.${payload}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Auth response not JSON:", text.substring(0, 200));
      return null;
    }
    if (!data.access_token) {
      console.error("Failed to get access token:", data);
      return null;
    }
    return data.access_token;
  } catch (err) {
    console.error("Auth error:", err.message || err);
    return null;
  }
}

// --- Text extraction ---

function extractTexts(obj, prefix) {
  const texts = [];
  if (typeof obj === "string") {
    // Skip file paths and URLs
    if (obj.startsWith("/") || obj.startsWith("http")) return texts;
    // Skip empty strings
    if (obj.trim() === "") return texts;
    texts.push({ path: prefix, value: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      texts.push(...extractTexts(item, `${prefix}[${i}]`));
    });
  } else if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (SKIP_FIELDS.has(key)) continue;
      const p = prefix ? `${prefix}.${key}` : key;
      texts.push(...extractTexts(value, p));
    }
  }
  return texts;
}

function setNestedValue(obj, pathStr, value) {
  const parts = pathStr.match(/[^.\[\]]+/g);
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = /^\d+$/.test(parts[i]) ? parseInt(parts[i]) : parts[i];
    current = current[key];
  }
  const lastKey = /^\d+$/.test(parts[parts.length - 1])
    ? parseInt(parts[parts.length - 1])
    : parts[parts.length - 1];
  current[lastKey] = value;
}

// --- Translation API ---

async function translateBatch(texts, targetLocale, accessToken) {
  if (texts.length === 0) return [];

  // Google Translate accepts 'no' for Norwegian
  const googleLocale = targetLocale === "no" ? "no" : targetLocale;

  const BATCH_SIZE = 100;
  const results = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const res = await fetch("https://translation.googleapis.com/language/translate/v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: batch,
        source: "en",
        target: googleLocale,
        format: "text",
      }),
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(`Translation response not JSON for ${targetLocale}:`, responseText.substring(0, 200));
      results.push(...batch);
      continue;
    }
    if (data.error) {
      console.error(`Translation error for ${targetLocale}:`, data.error.message);
      // Return original texts on error
      results.push(...batch);
    } else {
      results.push(
        ...data.data.translations.map((t) => {
          // Decode HTML entities that Google sometimes returns
          return t.translatedText
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
        })
      );
    }
  }

  return results;
}

// --- Hash-based caching ---

function computeContentHash(contentMap) {
  const hash = crypto.createHash("sha256");
  for (const [relPath, { original }] of Object.entries(contentMap)) {
    hash.update(relPath);
    hash.update(JSON.stringify(original));
  }
  return hash.digest("hex");
}

function loadHashCache() {
  const cachePath = path.join(TRANSLATED_DIR, ".cache-hash");
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf-8").trim();
  }
  return null;
}

function saveHashCache(hash) {
  fs.mkdirSync(TRANSLATED_DIR, { recursive: true });
  fs.writeFileSync(path.join(TRANSLATED_DIR, ".cache-hash"), hash);
}

// --- Main ---

async function main() {
  console.log("Translating CMS content...");

  // Collect all content files
  const pageFiles = ["pages/home.json", "pages/about.json", "pages/services.json"];

  // Add privacy if it exists
  if (fs.existsSync(path.join(CONTENT_DIR, "settings/privacy.json"))) {
    pageFiles.push("settings/privacy.json");
  }

  // Project files
  const projectsDir = path.join(CONTENT_DIR, "projects");
  const projectFiles = fs.existsSync(projectsDir)
    ? fs.readdirSync(projectsDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => `projects/${f}`)
    : [];

  const allFiles = [...pageFiles, ...projectFiles];

  // Read all content and extract translatable strings
  const contentMap = {};
  const allValues = [];
  const indexMap = []; // maps globalIndex -> { fileKey, textIndex }

  for (const relPath of allFiles) {
    const srcPath = path.join(CONTENT_DIR, relPath);
    if (!fs.existsSync(srcPath)) continue;

    const original = JSON.parse(fs.readFileSync(srcPath, "utf-8"));
    const texts = extractTexts(original, "");

    contentMap[relPath] = { original, texts };

    texts.forEach((t, i) => {
      indexMap.push({ fileKey: relPath, textIndex: i });
      allValues.push(t.value);
    });
  }

  if (allValues.length === 0) {
    console.log("No translatable content found.");
    return;
  }

  // Check cache — skip if content hasn't changed
  const contentHash = computeContentHash(contentMap);
  const cachedHash = loadHashCache();

  if (cachedHash === contentHash) {
    // Verify translated files actually exist
    const samplePath = path.join(TRANSLATED_DIR, LOCALES[0], allFiles[0]);
    if (fs.existsSync(samplePath)) {
      console.log("Content unchanged, skipping translation.");
      return;
    }
  }

  console.log(`Found ${allValues.length} strings across ${allFiles.length} files`);

  // Get access token
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.log("Skipping translation (no credentials available).");
    return;
  }

  // Translate for each locale
  for (const locale of LOCALES) {
    const translated = await translateBatch(allValues, locale, accessToken);

    // Write translated files
    for (const [relPath, { original, texts }] of Object.entries(contentMap)) {
      const result = JSON.parse(JSON.stringify(original));

      // Apply translations for this file
      indexMap.forEach(({ fileKey, textIndex }, globalIndex) => {
        if (fileKey === relPath) {
          setNestedValue(result, texts[textIndex].path, translated[globalIndex]);
        }
      });

      const outPath = path.join(TRANSLATED_DIR, locale, relPath);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    }

    console.log(`  ${locale}`);
  }

  // Save hash cache
  saveHashCache(contentHash);

  console.log(
    `Translated ${allValues.length} strings x ${LOCALES.length} locales (${allFiles.length} files)`
  );
}

main()
  .catch((err) => {
    console.error("Translation failed:", err.message || err);
    console.log("Build will continue with English content as fallback.");
  })
  .then(() => process.exit(0));
